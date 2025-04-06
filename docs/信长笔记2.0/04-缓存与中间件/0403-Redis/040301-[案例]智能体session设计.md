# [案例]智能体session设计


## 要求：设计智能体的session，要求保留最近7天的消息，总消息长度不超过10000字符，超过了则舍弃最早的消息，需要考虑线程安全

Prompt

```
你是一个AI智能体应用领域的 java技术专家, 现需要解决以下技术问题:
在用户与智能体交互过程中, 请设计一个session机制以记录历史对话实现多轮对话, 该机制需满足以下要求:
1. 消息格式为:{"role":"user/assistant","content":"123"}
2. 由于大模型token限制, 历史消息最多记录1w字符, 超出则舍弃最早的历史消息
3. 使用redis作为消息存储, 以用户id-群聊id(umId-groupId), 作为缓存key
4. 最多只保存最近7天内的历史消息
5. 设计一个SessionManager, 在对话开始时查询历史消息记录并加入到当前对话, 对话结束时保存当前对话到历史消息记录中
6. 需要给出代码实现, 性能越快越好, 并且需要考虑高并发下的线程安全
7. 请用RedisTemplate操作Redis
```


## 实现1.0: zset+redis事务

SessionManager

* 使用zset来保存消息集合, 按照时间戳作为分数排序, 可以便捷按照范围查询以及删除
* 使用redis事务, 在保存历史消息时, 删除过期消息以及超过字符的消息

```

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class SessionManager {

    private static final int MAX_HISTORY_LENGTH = 10000; // 历史消息最大长度（字符数）
    private static final int HISTORY_EXPIRE_DAYS = 7; // 历史消息有效期（天）
    private static final long HISTORY_EXPIRE_SECONDS = HISTORY_EXPIRE_DAYS * 24 * 60 * 60; // 转换为秒

    @Resource
    private RedisTemplate<String, String> redisTemplate; // RedisTemplate

    /**
     * 获取历史消息
     *
     * @param umId    用户ID
     * @param groupId 群聊ID
     * @return 历史消息列表
     */
    public List<JSONObject> getHistory(String umId, String groupId) {
        String key = generateKey(umId, groupId);
        // 获取最近7天的消息
        long minScore = System.currentTimeMillis() / 1000 - HISTORY_EXPIRE_SECONDS;
        Set<ZSetOperations.TypedTuple<String>> messages = redisTemplate.opsForZSet().rangeByScoreWithScores(key, minScore, Double.POSITIVE_INFINITY);
        List<JSONObject> history = new ArrayList<>();
        if (messages != null) {
            for (ZSetOperations.TypedTuple<String> message : messages) {
                history.add(JSON.parseObject(message.getValue()));
            }
        }
        return history;
    }

    /**
     * 保存当前对话到历史消息
     *
     * @param umId     用户ID
     * @param groupId  群聊ID
     * @param messages 当前对话消息列表
     */
    public void saveHistory(String umId, String groupId, List<JSONObject> messages) {
        String key = generateKey(umId, groupId);
        // 开启事务
        redisTemplate.setEnableTransactionSupport(true);
        redisTemplate.multi();
        try {
            // 添加新消息
            long currentTime = System.currentTimeMillis() / 1000;
            for (JSONObject message : messages) {
                redisTemplate.opsForZSet().add(key, message.toJSONString(), currentTime);
            }
            // 删除7天前的消息
            long minScore = currentTime - HISTORY_EXPIRE_SECONDS;
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, minScore);
            // 检查历史消息总字符数，超出则移除最早的消息
            trimHistoryByLength(key);
            // 提交事务
            redisTemplate.exec();
        } catch (Exception e) {
            e.printStackTrace();
            redisTemplate.discard();
        } finally {
            redisTemplate.setEnableTransactionSupport(false);
        }
    }

    /**
     * 根据消息总字符数修剪历史消息
     *
     * @param key Redis Key
     */
    private void trimHistoryByLength(String key) {
        // 获取所有消息
        Set<ZSetOperations.TypedTuple<String>> messages = redisTemplate.opsForZSet().rangeWithScores(key, 0, -1);
        if (messages == null || messages.isEmpty()) {
            return;
        }
        // 计算总字符数
        int totalLength = 0;
        for (ZSetOperations.TypedTuple<String> message : messages) {
            totalLength += message.getValue().length();
        }
        // 如果总字符数超过限制，删除最早的消息
        while (totalLength > MAX_HISTORY_LENGTH && !messages.isEmpty()) {
            ZSetOperations.TypedTuple<String> oldestMessage = messages.iterator().next();
            redisTemplate.opsForZSet().remove(key, oldestMessage.getValue());
            totalLength -= oldestMessage.getValue().length();
            messages = redisTemplate.opsForZSet().rangeWithScores(key, 0, -1);
        }
    }

    /**
     * 生成 Redis Key
     *
     * @param umId    用户ID
     * @param groupId 群聊ID
     * @return 生成的 Key
     */
    private String generateKey(String umId, String groupId) {
        return umId + "-" + groupId;
    }

    public static void main(String[] args) {
        // 在 Spring 环境中，SessionManager 会被自动注入
        // 以下是模拟调用
        SessionManager sessionManager = new SessionManager();

        // 模拟用户与智能体的对话
        String umId = "user123";
        String groupId = "group456";

        // 获取历史消息
        List<JSONObject> history = sessionManager.getHistory(umId, groupId);
        System.out.println("历史消息: " + history);

        // 模拟新对话
        List<JSONObject> newMessages = new ArrayList<>();
        newMessages.add(new JSONObject().fluentPut("role", "user").fluentPut("content", "你好！"));
        newMessages.add(new JSONObject().fluentPut("role", "assistant").fluentPut("content", "你好，有什么可以帮您？"));

        // 保存新对话到历史消息
        sessionManager.saveHistory(umId, groupId, newMessages);
    }
}
```


## 实现2.0: lua脚本+异步保存/删除消息

高并发情况下, 方案一可能有性能问题:

* 频繁计算消息总字符数, 时间复杂度为O(n)
* 事务锁竞争
* 频繁删除消息

```
  import org.springframework.data.redis.core.RedisTemplate;
  import org.springframework.data.redis.core.ZSetOperations;
  import org.springframework.stereotype.Component;
  import com.alibaba.fastjson.JSON;
  import com.alibaba.fastjson.JSONObject;

  import javax.annotation.Resource;
  import java.util.ArrayList;
  import java.util.List;
  import java.util.Set;
  import java.util.concurrent.ExecutorService;
  import java.util.concurrent.Executors;

  @Component
  public class SessionManager {

      private static final int MAX_HISTORY_LENGTH = 10000; // 历史消息最大长度（字符数）
      private static final int HISTORY_EXPIRE_DAYS = 7; // 历史消息有效期（天）
      private static final long HISTORY_EXPIRE_SECONDS = HISTORY_EXPIRE_DAYS * 24 * 60 * 60; // 转换为秒

      @Resource
      private RedisTemplate<String, String> redisTemplate; // RedisTemplate

      private final ExecutorService executorService = Executors.newFixedThreadPool(4); // 异步任务线程池

      /**
       * 获取历史消息
       *
       * @param umId    用户ID
       * @param groupId 群聊ID
       * @return 历史消息列表
       */
      public List<JSONObject> getHistory(String umId, String groupId) {
          String key = generateKey(umId, groupId);
          // 获取最近7天的消息
          long minScore = System.currentTimeMillis() / 1000 - HISTORY_EXPIRE_SECONDS;
          Set<ZSetOperations.TypedTuple<String>> messages = redisTemplate.opsForZSet().rangeByScoreWithScores(key, minScore, Double.POSITIVE_INFINITY);
          List<JSONObject> history = new ArrayList<>();
          if (messages != null) {
              for (ZSetOperations.TypedTuple<String> message : messages) {
                  history.add(JSON.parseObject(message.getValue()));
              }
          }
          return history;
      }

      /**
       * 保存当前对话到历史消息
       *
       * @param umId     用户ID
       * @param groupId  群聊ID
       * @param messages 当前对话消息列表
       */
      public void saveHistory(String umId, String groupId, List<JSONObject> messages) {
          String key = generateKey(umId, groupId);
          // 异步保存消息
          executorService.submit(() -> {
              // 添加新消息
              long currentTime = System.currentTimeMillis() / 1000;
              for (JSONObject message : messages) {
                  redisTemplate.opsForZSet().add(key, message.toJSONString(), currentTime);
              }
              // 删除7天前的消息
              long minScore = currentTime - HISTORY_EXPIRE_SECONDS;
              redisTemplate.opsForZSet().removeRangeByScore(key, 0, minScore);
              // 检查历史消息总字符数，超出则移除最早的消息
              trimHistoryByLength(key);
          });
      }

      /**
       * 根据消息总字符数修剪历史消息
       *
       * @param key Redis Key
       */
      private void trimHistoryByLength(String key) {
          // 使用 Lua 脚本计算总字符数并删除多余消息
          String luaScript =
              "local key = KEYS[1]\n" +
              "local maxLength = tonumber(ARGV[1])\n" +
              "local messages = redis.call('zrange', key, 0, -1, 'WITHSCORES')\n" +
              "local totalLength = 0\n" +
              "local removeCount = 0\n" +
              "for i = 1, #messages, 2 do\n" +
              "    totalLength = totalLength + string.len(messages[i])\n" +
              "    if totalLength > maxLength then\n" +
              "        removeCount = removeCount + 1\n" +
              "    end\n" +
              "end\n" +
              "if removeCount > 0 then\n" +
              "    redis.call('zremrangebyrank', key, 0, removeCount - 1)\n" +
              "end\n" +
              "return removeCount";
          redisTemplate.execute(new DefaultRedisScript<>(luaScript, Long.class), List.of(key), String.valueOf(MAX_HISTORY_LENGTH));
      }

      /**
       * 生成 Redis Key
       *
       * @param umId    用户ID
       * @param groupId 群聊ID
       * @return 生成的 Key
       */
      private String generateKey(String umId, String groupId) {
          return umId + "-" + groupId;
      }

      public static void main(String[] args) {
          // 在 Spring 环境中，SessionManager 会被自动注入
          // 以下是模拟调用
          SessionManager sessionManager = new SessionManager();

          // 模拟用户与智能体的对话
          String umId = "user123";
          String groupId = "group456";

          // 获取历史消息
          List<JSONObject> history = sessionManager.getHistory(umId, groupId);
          System.out.println("历史消息: " + history);

          // 模拟新对话
          List<JSONObject> newMessages = new ArrayList<>();
          newMessages.add(new JSONObject().fluentPut("role", "user").fluentPut("content", "你好！"));
          newMessages.add(new JSONObject().fluentPut("role", "assistant").fluentPut("content", "你好，有什么可以帮您？"));

          // 保存新对话到历史消息
          sessionManager.saveHistory(umId, groupId, newMessages);
      }
  }
```

## 实现3.0: 分层设计
在 Session 上设计字符总长度限制是为了满足大模型的 Token 长度限制，避免因输入过长导致大模型无响应。这是一个合理的需求，但直接在 Session 层实现字符总长度限制可能会带来性能问题
将字符长度限制的逻辑从 Session 层剥离，放到更靠近大模型调用的地方（如大模型服务层）。这样可以减少 Session 层的复杂度，同时提高性能
```
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class SessionManager {

    private static final int HISTORY_EXPIRE_DAYS = 7; // 历史消息有效期（天）
    private static final long HISTORY_EXPIRE_SECONDS = HISTORY_EXPIRE_DAYS * 24 * 60 * 60; // 转换为秒

    @Resource
    private RedisTemplate<String, String> redisTemplate; // RedisTemplate

    private final ExecutorService executorService = Executors.newFixedThreadPool(4); // 异步任务线程池

    /**
     * 获取历史消息
     *
     * @param umId    用户ID
     * @param groupId 群聊ID
     * @return 历史消息列表
     */
    public List<JSONObject> getHistory(String umId, String groupId) {
        String key = generateKey(umId, groupId);
        // 获取最近7天的消息
        long minScore = System.currentTimeMillis() / 1000 - HISTORY_EXPIRE_SECONDS;
        Set<ZSetOperations.TypedTuple<String>> messages = redisTemplate.opsForZSet().rangeByScoreWithScores(key, minScore, Double.POSITIVE_INFINITY);
        List<JSONObject> history = new ArrayList<>();
        if (messages != null) {
            for (ZSetOperations.TypedTuple<String> message : messages) {
                history.add(JSON.parseObject(message.getValue()));
            }
        }
        return history;
    }

    /**
     * 保存当前对话到历史消息
     *
     * @param umId     用户ID
     * @param groupId  群聊ID
     * @param messages 当前对话消息列表
     */
    public void saveHistory(String umId, String groupId, List<JSONObject> messages) {
        String key = generateKey(umId, groupId);
        // 异步保存消息
        executorService.submit(() -> {
            // 添加新消息
            long currentTime = System.currentTimeMillis() / 1000;
            for (JSONObject message : messages) {
                redisTemplate.opsForZSet().add(key, message.toJSONString(), currentTime);
            }
            // 删除7天前的消息
            long minScore = currentTime - HISTORY_EXPIRE_SECONDS;
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, minScore);
        });
    }

    /**
     * 生成 Redis Key
     *
     * @param umId    用户ID
     * @param groupId 群聊ID
     * @return 生成的 Key
     */
    private String generateKey(String umId, String groupId) {
        return umId + "-" + groupId;
    }
}
```
```
import org.springframework.stereotype.Component;
import com.alibaba.fastjson.JSONObject;

import javax.annotation.Resource;
import java.util.List;

@Component
public class ModelService {

    private static final int MAX_TOKEN_LENGTH = 10000; // 大模型的 Token 长度限制

    @Resource
    private SessionManager sessionManager;

    /**
     * 调用大模型
     *
     * @param umId    用户ID
     * @param groupId 群聊ID
     * @param message 用户输入的消息
     * @return 大模型的响应
     */
    public String callModel(String umId, String groupId, JSONObject message) {
        // 获取历史消息
        List<JSONObject> history = sessionManager.getHistory(umId, groupId);
        // 动态截断历史消息，确保输入不超过 Token 限制
        List<JSONObject> truncatedHistory = truncateHistory(history);
        // 调用大模型
        return callModelInternal(truncatedHistory, message);
    }

    /**
     * 动态截断历史消息
     *
     * @param history 完整的历史消息
     * @return 截断后的历史消息
     */
    private List<JSONObject> truncateHistory(List<JSONObject> history) {
        int totalLength = 0;
        List<JSONObject> truncatedHistory = new ArrayList<>();
        for (JSONObject message : history) {
            int messageLength = calculateTokenLength(message);
            if (totalLength + messageLength > MAX_TOKEN_LENGTH) {
                break;
            }
            truncatedHistory.add(message);
            totalLength += messageLength;
        }
        return truncatedHistory;
    }

    /**
     * 计算消息的 Token 长度
     *
     * @param message 消息
     * @return Token 长度
     */
    private int calculateTokenLength(JSONObject message) {
        // 这里可以根据实际需求实现 Token 计算逻辑
        return message.toJSONString().length(); // 简单实现：使用字符数代替 Token 数
    }

    /**
     * 调用大模型的内部方法
     *
     * @param history 历史消息
     * @param message 用户输入的消息
     * @return 大模型的响应
     */
    private String callModelInternal(List<JSONObject> history, JSONObject message) {
        // 这里实现调用大模型的逻辑
        return "大模型响应";
    }
}
```

## 最后落地方案
1. session只管存取历史消息
2. 调大模型agent时会根据token限制截取消息
3. 新建个定时任务每天清理超过7天的消息, 以及超过了token限制的消息

## 补充
1. Redis的Zset超过10w个元素, 可能触发性能问题（删除/遍历耗时 >1秒）, 由于智能体7天内聊天轮数约3*7<<10w, 无风险
2. 单个元素 >10KB：Redis 内部内存管理会将其视为“大对象”（Large Object）频繁分配/释放大对象可能导致内存碎片, 在支持RAG后, 用户历史消息极可能累计>1w字符, 简单算10k, 存在bigkey的风险
3. 考虑到llm场景流式输出, 用户对时延不敏感, 后续可以考虑使用DB来存储历史消息 

删除BigKey的潜在风险:
- 耗时较长, 高并发下可能阻塞其他请求
- 大规模删除可能导致主从同步延迟
- 产生内存碎片, 影响后续分配效率