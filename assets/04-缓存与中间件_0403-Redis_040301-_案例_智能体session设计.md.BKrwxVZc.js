import{_ as n,c as a,o as p,ag as e}from"./chunks/framework.DPDPlp3K.js";const m=JSON.parse('{"title":"[案例]智能体session设计","description":"","frontmatter":{},"headers":[],"relativePath":"04-缓存与中间件/0403-Redis/040301-[案例]智能体session设计.md","filePath":"04-缓存与中间件/0403-Redis/040301-[案例]智能体session设计.md"}'),l={name:"04-缓存与中间件/0403-Redis/040301-[案例]智能体session设计.md"};function i(t,s,c,r,o,u){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="案例-智能体session设计" tabindex="-1">[案例]智能体session设计 <a class="header-anchor" href="#案例-智能体session设计" aria-label="Permalink to &quot;[案例]智能体session设计&quot;">​</a></h1><h2 id="要求-设计智能体的session-要求保留最近7天的消息-总消息长度不超过10000字符-超过了则舍弃最早的消息-需要考虑线程安全" tabindex="-1">要求：设计智能体的session，要求保留最近7天的消息，总消息长度不超过10000字符，超过了则舍弃最早的消息，需要考虑线程安全 <a class="header-anchor" href="#要求-设计智能体的session-要求保留最近7天的消息-总消息长度不超过10000字符-超过了则舍弃最早的消息-需要考虑线程安全" aria-label="Permalink to &quot;要求：设计智能体的session，要求保留最近7天的消息，总消息长度不超过10000字符，超过了则舍弃最早的消息，需要考虑线程安全&quot;">​</a></h2><p>Prompt</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>你是一个AI智能体应用领域的 java技术专家, 现需要解决以下技术问题:</span></span>
<span class="line"><span>在用户与智能体交互过程中, 请设计一个session机制以记录历史对话实现多轮对话, 该机制需满足以下要求:</span></span>
<span class="line"><span>1. 消息格式为:{&quot;role&quot;:&quot;user/assistant&quot;,&quot;content&quot;:&quot;123&quot;}</span></span>
<span class="line"><span>2. 由于大模型token限制, 历史消息最多记录1w字符, 超出则舍弃最早的历史消息</span></span>
<span class="line"><span>3. 使用redis作为消息存储, 以用户id-群聊id(umId-groupId), 作为缓存key</span></span>
<span class="line"><span>4. 最多只保存最近7天内的历史消息</span></span>
<span class="line"><span>5. 设计一个SessionManager, 在对话开始时查询历史消息记录并加入到当前对话, 对话结束时保存当前对话到历史消息记录中</span></span>
<span class="line"><span>6. 需要给出代码实现, 性能越快越好, 并且需要考虑高并发下的线程安全</span></span>
<span class="line"><span>7. 请用RedisTemplate操作Redis</span></span></code></pre></div><h2 id="实现1-0-zset-redis事务" tabindex="-1">实现1.0: zset+redis事务 <a class="header-anchor" href="#实现1-0-zset-redis事务" aria-label="Permalink to &quot;实现1.0: zset+redis事务&quot;">​</a></h2><p>SessionManager</p><ul><li>使用zset来保存消息集合, 按照时间戳作为分数排序, 可以便捷按照范围查询以及删除</li><li>使用redis事务, 在保存历史消息时, 删除过期消息以及超过字符的消息</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>import org.springframework.data.redis.core.RedisTemplate;</span></span>
<span class="line"><span>import org.springframework.data.redis.core.ZSetOperations;</span></span>
<span class="line"><span>import org.springframework.stereotype.Component;</span></span>
<span class="line"><span>import com.alibaba.fastjson.JSON;</span></span>
<span class="line"><span>import com.alibaba.fastjson.JSONObject;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import javax.annotation.Resource;</span></span>
<span class="line"><span>import java.util.ArrayList;</span></span>
<span class="line"><span>import java.util.List;</span></span>
<span class="line"><span>import java.util.Set;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>public class SessionManager {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static final int MAX_HISTORY_LENGTH = 10000; // 历史消息最大长度（字符数）</span></span>
<span class="line"><span>    private static final int HISTORY_EXPIRE_DAYS = 7; // 历史消息有效期（天）</span></span>
<span class="line"><span>    private static final long HISTORY_EXPIRE_SECONDS = HISTORY_EXPIRE_DAYS * 24 * 60 * 60; // 转换为秒</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Resource</span></span>
<span class="line"><span>    private RedisTemplate&lt;String, String&gt; redisTemplate; // RedisTemplate</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 获取历史消息</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param umId    用户ID</span></span>
<span class="line"><span>     * @param groupId 群聊ID</span></span>
<span class="line"><span>     * @return 历史消息列表</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public List&lt;JSONObject&gt; getHistory(String umId, String groupId) {</span></span>
<span class="line"><span>        String key = generateKey(umId, groupId);</span></span>
<span class="line"><span>        // 获取最近7天的消息</span></span>
<span class="line"><span>        long minScore = System.currentTimeMillis() / 1000 - HISTORY_EXPIRE_SECONDS;</span></span>
<span class="line"><span>        Set&lt;ZSetOperations.TypedTuple&lt;String&gt;&gt; messages = redisTemplate.opsForZSet().rangeByScoreWithScores(key, minScore, Double.POSITIVE_INFINITY);</span></span>
<span class="line"><span>        List&lt;JSONObject&gt; history = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>        if (messages != null) {</span></span>
<span class="line"><span>            for (ZSetOperations.TypedTuple&lt;String&gt; message : messages) {</span></span>
<span class="line"><span>                history.add(JSON.parseObject(message.getValue()));</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return history;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 保存当前对话到历史消息</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param umId     用户ID</span></span>
<span class="line"><span>     * @param groupId  群聊ID</span></span>
<span class="line"><span>     * @param messages 当前对话消息列表</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public void saveHistory(String umId, String groupId, List&lt;JSONObject&gt; messages) {</span></span>
<span class="line"><span>        String key = generateKey(umId, groupId);</span></span>
<span class="line"><span>        // 开启事务</span></span>
<span class="line"><span>        redisTemplate.setEnableTransactionSupport(true);</span></span>
<span class="line"><span>        redisTemplate.multi();</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            // 添加新消息</span></span>
<span class="line"><span>            long currentTime = System.currentTimeMillis() / 1000;</span></span>
<span class="line"><span>            for (JSONObject message : messages) {</span></span>
<span class="line"><span>                redisTemplate.opsForZSet().add(key, message.toJSONString(), currentTime);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            // 删除7天前的消息</span></span>
<span class="line"><span>            long minScore = currentTime - HISTORY_EXPIRE_SECONDS;</span></span>
<span class="line"><span>            redisTemplate.opsForZSet().removeRangeByScore(key, 0, minScore);</span></span>
<span class="line"><span>            // 检查历史消息总字符数，超出则移除最早的消息</span></span>
<span class="line"><span>            trimHistoryByLength(key);</span></span>
<span class="line"><span>            // 提交事务</span></span>
<span class="line"><span>            redisTemplate.exec();</span></span>
<span class="line"><span>        } catch (Exception e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>            redisTemplate.discard();</span></span>
<span class="line"><span>        } finally {</span></span>
<span class="line"><span>            redisTemplate.setEnableTransactionSupport(false);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 根据消息总字符数修剪历史消息</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param key Redis Key</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private void trimHistoryByLength(String key) {</span></span>
<span class="line"><span>        // 获取所有消息</span></span>
<span class="line"><span>        Set&lt;ZSetOperations.TypedTuple&lt;String&gt;&gt; messages = redisTemplate.opsForZSet().rangeWithScores(key, 0, -1);</span></span>
<span class="line"><span>        if (messages == null || messages.isEmpty()) {</span></span>
<span class="line"><span>            return;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 计算总字符数</span></span>
<span class="line"><span>        int totalLength = 0;</span></span>
<span class="line"><span>        for (ZSetOperations.TypedTuple&lt;String&gt; message : messages) {</span></span>
<span class="line"><span>            totalLength += message.getValue().length();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 如果总字符数超过限制，删除最早的消息</span></span>
<span class="line"><span>        while (totalLength &gt; MAX_HISTORY_LENGTH &amp;&amp; !messages.isEmpty()) {</span></span>
<span class="line"><span>            ZSetOperations.TypedTuple&lt;String&gt; oldestMessage = messages.iterator().next();</span></span>
<span class="line"><span>            redisTemplate.opsForZSet().remove(key, oldestMessage.getValue());</span></span>
<span class="line"><span>            totalLength -= oldestMessage.getValue().length();</span></span>
<span class="line"><span>            messages = redisTemplate.opsForZSet().rangeWithScores(key, 0, -1);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 生成 Redis Key</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param umId    用户ID</span></span>
<span class="line"><span>     * @param groupId 群聊ID</span></span>
<span class="line"><span>     * @return 生成的 Key</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private String generateKey(String umId, String groupId) {</span></span>
<span class="line"><span>        return umId + &quot;-&quot; + groupId;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static void main(String[] args) {</span></span>
<span class="line"><span>        // 在 Spring 环境中，SessionManager 会被自动注入</span></span>
<span class="line"><span>        // 以下是模拟调用</span></span>
<span class="line"><span>        SessionManager sessionManager = new SessionManager();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 模拟用户与智能体的对话</span></span>
<span class="line"><span>        String umId = &quot;user123&quot;;</span></span>
<span class="line"><span>        String groupId = &quot;group456&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 获取历史消息</span></span>
<span class="line"><span>        List&lt;JSONObject&gt; history = sessionManager.getHistory(umId, groupId);</span></span>
<span class="line"><span>        System.out.println(&quot;历史消息: &quot; + history);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 模拟新对话</span></span>
<span class="line"><span>        List&lt;JSONObject&gt; newMessages = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>        newMessages.add(new JSONObject().fluentPut(&quot;role&quot;, &quot;user&quot;).fluentPut(&quot;content&quot;, &quot;你好！&quot;));</span></span>
<span class="line"><span>        newMessages.add(new JSONObject().fluentPut(&quot;role&quot;, &quot;assistant&quot;).fluentPut(&quot;content&quot;, &quot;你好，有什么可以帮您？&quot;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 保存新对话到历史消息</span></span>
<span class="line"><span>        sessionManager.saveHistory(umId, groupId, newMessages);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="实现2-0-lua脚本-异步保存-删除消息" tabindex="-1">实现2.0: lua脚本+异步保存/删除消息 <a class="header-anchor" href="#实现2-0-lua脚本-异步保存-删除消息" aria-label="Permalink to &quot;实现2.0: lua脚本+异步保存/删除消息&quot;">​</a></h2><p>高并发情况下, 方案一可能有性能问题:</p><ul><li>频繁计算消息总字符数, 时间复杂度为O(n)</li><li>事务锁竞争</li><li>频繁删除消息</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  import org.springframework.data.redis.core.RedisTemplate;</span></span>
<span class="line"><span>  import org.springframework.data.redis.core.ZSetOperations;</span></span>
<span class="line"><span>  import org.springframework.stereotype.Component;</span></span>
<span class="line"><span>  import com.alibaba.fastjson.JSON;</span></span>
<span class="line"><span>  import com.alibaba.fastjson.JSONObject;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  import javax.annotation.Resource;</span></span>
<span class="line"><span>  import java.util.ArrayList;</span></span>
<span class="line"><span>  import java.util.List;</span></span>
<span class="line"><span>  import java.util.Set;</span></span>
<span class="line"><span>  import java.util.concurrent.ExecutorService;</span></span>
<span class="line"><span>  import java.util.concurrent.Executors;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Component</span></span>
<span class="line"><span>  public class SessionManager {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      private static final int MAX_HISTORY_LENGTH = 10000; // 历史消息最大长度（字符数）</span></span>
<span class="line"><span>      private static final int HISTORY_EXPIRE_DAYS = 7; // 历史消息有效期（天）</span></span>
<span class="line"><span>      private static final long HISTORY_EXPIRE_SECONDS = HISTORY_EXPIRE_DAYS * 24 * 60 * 60; // 转换为秒</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      @Resource</span></span>
<span class="line"><span>      private RedisTemplate&lt;String, String&gt; redisTemplate; // RedisTemplate</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      private final ExecutorService executorService = Executors.newFixedThreadPool(4); // 异步任务线程池</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /**</span></span>
<span class="line"><span>       * 获取历史消息</span></span>
<span class="line"><span>       *</span></span>
<span class="line"><span>       * @param umId    用户ID</span></span>
<span class="line"><span>       * @param groupId 群聊ID</span></span>
<span class="line"><span>       * @return 历史消息列表</span></span>
<span class="line"><span>       */</span></span>
<span class="line"><span>      public List&lt;JSONObject&gt; getHistory(String umId, String groupId) {</span></span>
<span class="line"><span>          String key = generateKey(umId, groupId);</span></span>
<span class="line"><span>          // 获取最近7天的消息</span></span>
<span class="line"><span>          long minScore = System.currentTimeMillis() / 1000 - HISTORY_EXPIRE_SECONDS;</span></span>
<span class="line"><span>          Set&lt;ZSetOperations.TypedTuple&lt;String&gt;&gt; messages = redisTemplate.opsForZSet().rangeByScoreWithScores(key, minScore, Double.POSITIVE_INFINITY);</span></span>
<span class="line"><span>          List&lt;JSONObject&gt; history = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>          if (messages != null) {</span></span>
<span class="line"><span>              for (ZSetOperations.TypedTuple&lt;String&gt; message : messages) {</span></span>
<span class="line"><span>                  history.add(JSON.parseObject(message.getValue()));</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          return history;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /**</span></span>
<span class="line"><span>       * 保存当前对话到历史消息</span></span>
<span class="line"><span>       *</span></span>
<span class="line"><span>       * @param umId     用户ID</span></span>
<span class="line"><span>       * @param groupId  群聊ID</span></span>
<span class="line"><span>       * @param messages 当前对话消息列表</span></span>
<span class="line"><span>       */</span></span>
<span class="line"><span>      public void saveHistory(String umId, String groupId, List&lt;JSONObject&gt; messages) {</span></span>
<span class="line"><span>          String key = generateKey(umId, groupId);</span></span>
<span class="line"><span>          // 异步保存消息</span></span>
<span class="line"><span>          executorService.submit(() -&gt; {</span></span>
<span class="line"><span>              // 添加新消息</span></span>
<span class="line"><span>              long currentTime = System.currentTimeMillis() / 1000;</span></span>
<span class="line"><span>              for (JSONObject message : messages) {</span></span>
<span class="line"><span>                  redisTemplate.opsForZSet().add(key, message.toJSONString(), currentTime);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>              // 删除7天前的消息</span></span>
<span class="line"><span>              long minScore = currentTime - HISTORY_EXPIRE_SECONDS;</span></span>
<span class="line"><span>              redisTemplate.opsForZSet().removeRangeByScore(key, 0, minScore);</span></span>
<span class="line"><span>              // 检查历史消息总字符数，超出则移除最早的消息</span></span>
<span class="line"><span>              trimHistoryByLength(key);</span></span>
<span class="line"><span>          });</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /**</span></span>
<span class="line"><span>       * 根据消息总字符数修剪历史消息</span></span>
<span class="line"><span>       *</span></span>
<span class="line"><span>       * @param key Redis Key</span></span>
<span class="line"><span>       */</span></span>
<span class="line"><span>      private void trimHistoryByLength(String key) {</span></span>
<span class="line"><span>          // 使用 Lua 脚本计算总字符数并删除多余消息</span></span>
<span class="line"><span>          String luaScript =</span></span>
<span class="line"><span>              &quot;local key = KEYS[1]\\n&quot; +</span></span>
<span class="line"><span>              &quot;local maxLength = tonumber(ARGV[1])\\n&quot; +</span></span>
<span class="line"><span>              &quot;local messages = redis.call(&#39;zrange&#39;, key, 0, -1, &#39;WITHSCORES&#39;)\\n&quot; +</span></span>
<span class="line"><span>              &quot;local totalLength = 0\\n&quot; +</span></span>
<span class="line"><span>              &quot;local removeCount = 0\\n&quot; +</span></span>
<span class="line"><span>              &quot;for i = 1, #messages, 2 do\\n&quot; +</span></span>
<span class="line"><span>              &quot;    totalLength = totalLength + string.len(messages[i])\\n&quot; +</span></span>
<span class="line"><span>              &quot;    if totalLength &gt; maxLength then\\n&quot; +</span></span>
<span class="line"><span>              &quot;        removeCount = removeCount + 1\\n&quot; +</span></span>
<span class="line"><span>              &quot;    end\\n&quot; +</span></span>
<span class="line"><span>              &quot;end\\n&quot; +</span></span>
<span class="line"><span>              &quot;if removeCount &gt; 0 then\\n&quot; +</span></span>
<span class="line"><span>              &quot;    redis.call(&#39;zremrangebyrank&#39;, key, 0, removeCount - 1)\\n&quot; +</span></span>
<span class="line"><span>              &quot;end\\n&quot; +</span></span>
<span class="line"><span>              &quot;return removeCount&quot;;</span></span>
<span class="line"><span>          redisTemplate.execute(new DefaultRedisScript&lt;&gt;(luaScript, Long.class), List.of(key), String.valueOf(MAX_HISTORY_LENGTH));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /**</span></span>
<span class="line"><span>       * 生成 Redis Key</span></span>
<span class="line"><span>       *</span></span>
<span class="line"><span>       * @param umId    用户ID</span></span>
<span class="line"><span>       * @param groupId 群聊ID</span></span>
<span class="line"><span>       * @return 生成的 Key</span></span>
<span class="line"><span>       */</span></span>
<span class="line"><span>      private String generateKey(String umId, String groupId) {</span></span>
<span class="line"><span>          return umId + &quot;-&quot; + groupId;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      public static void main(String[] args) {</span></span>
<span class="line"><span>          // 在 Spring 环境中，SessionManager 会被自动注入</span></span>
<span class="line"><span>          // 以下是模拟调用</span></span>
<span class="line"><span>          SessionManager sessionManager = new SessionManager();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 模拟用户与智能体的对话</span></span>
<span class="line"><span>          String umId = &quot;user123&quot;;</span></span>
<span class="line"><span>          String groupId = &quot;group456&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 获取历史消息</span></span>
<span class="line"><span>          List&lt;JSONObject&gt; history = sessionManager.getHistory(umId, groupId);</span></span>
<span class="line"><span>          System.out.println(&quot;历史消息: &quot; + history);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 模拟新对话</span></span>
<span class="line"><span>          List&lt;JSONObject&gt; newMessages = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>          newMessages.add(new JSONObject().fluentPut(&quot;role&quot;, &quot;user&quot;).fluentPut(&quot;content&quot;, &quot;你好！&quot;));</span></span>
<span class="line"><span>          newMessages.add(new JSONObject().fluentPut(&quot;role&quot;, &quot;assistant&quot;).fluentPut(&quot;content&quot;, &quot;你好，有什么可以帮您？&quot;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 保存新对话到历史消息</span></span>
<span class="line"><span>          sessionManager.saveHistory(umId, groupId, newMessages);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }</span></span></code></pre></div><h2 id="实现3-0-分层设计" tabindex="-1">实现3.0: 分层设计 <a class="header-anchor" href="#实现3-0-分层设计" aria-label="Permalink to &quot;实现3.0: 分层设计&quot;">​</a></h2><p>在 Session 上设计字符总长度限制是为了满足大模型的 Token 长度限制，避免因输入过长导致大模型无响应。这是一个合理的需求，但直接在 Session 层实现字符总长度限制可能会带来性能问题 将字符长度限制的逻辑从 Session 层剥离，放到更靠近大模型调用的地方（如大模型服务层）。这样可以减少 Session 层的复杂度，同时提高性能</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import org.springframework.data.redis.core.RedisTemplate;</span></span>
<span class="line"><span>import org.springframework.data.redis.core.ZSetOperations;</span></span>
<span class="line"><span>import org.springframework.stereotype.Component;</span></span>
<span class="line"><span>import com.alibaba.fastjson.JSON;</span></span>
<span class="line"><span>import com.alibaba.fastjson.JSONObject;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import javax.annotation.Resource;</span></span>
<span class="line"><span>import java.util.ArrayList;</span></span>
<span class="line"><span>import java.util.List;</span></span>
<span class="line"><span>import java.util.Set;</span></span>
<span class="line"><span>import java.util.concurrent.ExecutorService;</span></span>
<span class="line"><span>import java.util.concurrent.Executors;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>public class SessionManager {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static final int HISTORY_EXPIRE_DAYS = 7; // 历史消息有效期（天）</span></span>
<span class="line"><span>    private static final long HISTORY_EXPIRE_SECONDS = HISTORY_EXPIRE_DAYS * 24 * 60 * 60; // 转换为秒</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Resource</span></span>
<span class="line"><span>    private RedisTemplate&lt;String, String&gt; redisTemplate; // RedisTemplate</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private final ExecutorService executorService = Executors.newFixedThreadPool(4); // 异步任务线程池</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 获取历史消息</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param umId    用户ID</span></span>
<span class="line"><span>     * @param groupId 群聊ID</span></span>
<span class="line"><span>     * @return 历史消息列表</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public List&lt;JSONObject&gt; getHistory(String umId, String groupId) {</span></span>
<span class="line"><span>        String key = generateKey(umId, groupId);</span></span>
<span class="line"><span>        // 获取最近7天的消息</span></span>
<span class="line"><span>        long minScore = System.currentTimeMillis() / 1000 - HISTORY_EXPIRE_SECONDS;</span></span>
<span class="line"><span>        Set&lt;ZSetOperations.TypedTuple&lt;String&gt;&gt; messages = redisTemplate.opsForZSet().rangeByScoreWithScores(key, minScore, Double.POSITIVE_INFINITY);</span></span>
<span class="line"><span>        List&lt;JSONObject&gt; history = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>        if (messages != null) {</span></span>
<span class="line"><span>            for (ZSetOperations.TypedTuple&lt;String&gt; message : messages) {</span></span>
<span class="line"><span>                history.add(JSON.parseObject(message.getValue()));</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return history;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 保存当前对话到历史消息</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param umId     用户ID</span></span>
<span class="line"><span>     * @param groupId  群聊ID</span></span>
<span class="line"><span>     * @param messages 当前对话消息列表</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public void saveHistory(String umId, String groupId, List&lt;JSONObject&gt; messages) {</span></span>
<span class="line"><span>        String key = generateKey(umId, groupId);</span></span>
<span class="line"><span>        // 异步保存消息</span></span>
<span class="line"><span>        executorService.submit(() -&gt; {</span></span>
<span class="line"><span>            // 添加新消息</span></span>
<span class="line"><span>            long currentTime = System.currentTimeMillis() / 1000;</span></span>
<span class="line"><span>            for (JSONObject message : messages) {</span></span>
<span class="line"><span>                redisTemplate.opsForZSet().add(key, message.toJSONString(), currentTime);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            // 删除7天前的消息</span></span>
<span class="line"><span>            long minScore = currentTime - HISTORY_EXPIRE_SECONDS;</span></span>
<span class="line"><span>            redisTemplate.opsForZSet().removeRangeByScore(key, 0, minScore);</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 生成 Redis Key</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param umId    用户ID</span></span>
<span class="line"><span>     * @param groupId 群聊ID</span></span>
<span class="line"><span>     * @return 生成的 Key</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private String generateKey(String umId, String groupId) {</span></span>
<span class="line"><span>        return umId + &quot;-&quot; + groupId;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import org.springframework.stereotype.Component;</span></span>
<span class="line"><span>import com.alibaba.fastjson.JSONObject;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import javax.annotation.Resource;</span></span>
<span class="line"><span>import java.util.List;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>public class ModelService {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static final int MAX_TOKEN_LENGTH = 10000; // 大模型的 Token 长度限制</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Resource</span></span>
<span class="line"><span>    private SessionManager sessionManager;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 调用大模型</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param umId    用户ID</span></span>
<span class="line"><span>     * @param groupId 群聊ID</span></span>
<span class="line"><span>     * @param message 用户输入的消息</span></span>
<span class="line"><span>     * @return 大模型的响应</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public String callModel(String umId, String groupId, JSONObject message) {</span></span>
<span class="line"><span>        // 获取历史消息</span></span>
<span class="line"><span>        List&lt;JSONObject&gt; history = sessionManager.getHistory(umId, groupId);</span></span>
<span class="line"><span>        // 动态截断历史消息，确保输入不超过 Token 限制</span></span>
<span class="line"><span>        List&lt;JSONObject&gt; truncatedHistory = truncateHistory(history);</span></span>
<span class="line"><span>        // 调用大模型</span></span>
<span class="line"><span>        return callModelInternal(truncatedHistory, message);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 动态截断历史消息</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param history 完整的历史消息</span></span>
<span class="line"><span>     * @return 截断后的历史消息</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private List&lt;JSONObject&gt; truncateHistory(List&lt;JSONObject&gt; history) {</span></span>
<span class="line"><span>        int totalLength = 0;</span></span>
<span class="line"><span>        List&lt;JSONObject&gt; truncatedHistory = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>        for (JSONObject message : history) {</span></span>
<span class="line"><span>            int messageLength = calculateTokenLength(message);</span></span>
<span class="line"><span>            if (totalLength + messageLength &gt; MAX_TOKEN_LENGTH) {</span></span>
<span class="line"><span>                break;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            truncatedHistory.add(message);</span></span>
<span class="line"><span>            totalLength += messageLength;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return truncatedHistory;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 计算消息的 Token 长度</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param message 消息</span></span>
<span class="line"><span>     * @return Token 长度</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private int calculateTokenLength(JSONObject message) {</span></span>
<span class="line"><span>        // 这里可以根据实际需求实现 Token 计算逻辑</span></span>
<span class="line"><span>        return message.toJSONString().length(); // 简单实现：使用字符数代替 Token 数</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 调用大模型的内部方法</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param history 历史消息</span></span>
<span class="line"><span>     * @param message 用户输入的消息</span></span>
<span class="line"><span>     * @return 大模型的响应</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private String callModelInternal(List&lt;JSONObject&gt; history, JSONObject message) {</span></span>
<span class="line"><span>        // 这里实现调用大模型的逻辑</span></span>
<span class="line"><span>        return &quot;大模型响应&quot;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="最后落地方案" tabindex="-1">最后落地方案 <a class="header-anchor" href="#最后落地方案" aria-label="Permalink to &quot;最后落地方案&quot;">​</a></h2><ol><li>session只管存取历史消息</li><li>调大模型agent时会根据token限制截取消息</li><li>新建个定时任务每天清理超过7天的消息, 以及超过了token限制的消息</li></ol><h2 id="补充" tabindex="-1">补充 <a class="header-anchor" href="#补充" aria-label="Permalink to &quot;补充&quot;">​</a></h2><ol><li>Redis的Zset超过10w个元素, 可能触发性能问题（删除/遍历耗时 &gt;1秒）, 由于智能体7天内聊天轮数约3*7&lt;&lt;10w, 无风险</li><li>单个元素 &gt;10KB：Redis 内部内存管理会将其视为“大对象”（Large Object）频繁分配/释放大对象可能导致内存碎片, 在支持RAG后, 用户历史消息极可能累计&gt;1w字符, 简单算10k, 存在bigkey的风险</li><li>考虑到llm场景流式输出, 用户对时延不敏感, 后续可以考虑使用DB来存储历史消息</li></ol><p>删除BigKey的潜在风险:</p><ul><li>耗时较长, 高并发下可能阻塞其他请求</li><li>大规模删除可能导致主从同步延迟</li><li>产生内存碎片, 影响后续分配效率</li></ul>`,22)]))}const d=n(l,[["render",i]]);export{m as __pageData,d as default};
