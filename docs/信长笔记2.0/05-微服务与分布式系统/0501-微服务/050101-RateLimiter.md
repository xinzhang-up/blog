# RateLimiter

## 针对key的简易限流

应用场景: 比如限制用户的并发请求数, 针对useId制定简单的限流策略

> prompt: 在springboot-web框架下用java的semaphere实现一个RateLimiter, 要求控制某key在某个毫秒时间段内的并发请求数量, 然后key与毫秒, 并发数量均可配置热刷

### 参考一(GPT生成)

```

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;

@Configuration
@RefreshScope
public class RateLimiterConfig {

    @Autowired
    private Map<String, Object> rateLimiterConfigs;

    public RateLimiterConfig getConfig(String key) {
        return (RateLimiterConfig) rateLimiterConfigs.get(key);
    }

    public static class RateLimiterConfig {
        private Long timeWindowMillis;
        private Integer maxConcurrency;

        // Getters and Setters
        public Long getTimeWindowMillis() { return timeWindowMillis; }
        public void setTimeWindowMillis(Long timeWindowMillis) { this.timeWindowMillis = timeWindowMillis; }
        public Integer getMaxConcurrency() { return maxConcurrency; }
        public void setMaxConcurrency(Integer maxConcurrency) { this.maxConcurrency = maxConcurrency; }
    }
}

@RestController
public class RateLimiterController {

    private final ConcurrentHashMap<String, KeyInfo> keyInfos = new ConcurrentHashMap<>();

    @GetMapping("/limit/{key}")
    public String limitRequest(@PathVariable String key) {
        if (acquirePermission(key)) {
            return "Request processed successfully";
        } else {
            return "Too many requests";
        }
    }

    private boolean acquirePermission(String key) {
        RateLimiterConfig config = RateLimiterConfig.getConfig(key);
        if (config == null || config.getMaxConcurrency() == null || config.getTimeWindowMillis() == null) {
            return false;
        }

        KeyInfo keyInfo = keyInfos.computeIfAbsent(key, k -> {
            Semaphore sem = new Semaphore(config.getMaxConcurrency());
            return new KeyInfo(sem, config, System.currentTimeMillis());
        });

        // 检查配置变更
        if (!keyInfo.config.equals(config)) {
            keyInfos.put(key, new KeyInfo(new Semaphore(config.getMaxConcurrency()), config, System.currentTimeMillis()));
            return acquirePermission(key); // 递归调用应用新配置
        }

        long now = System.currentTimeMillis();
        if (now - keyInfo.lastResetTime > config.getTimeWindowMillis()) {
            keyInfo.semaphore.release(config.getMaxConcurrency());
            keyInfo.lastResetTime = now;
        }

        try {
            return keyInfo.semaphore.tryAcquire(100, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private static class KeyInfo {
        final Semaphore semaphore;
        final RateLimiterConfig config;
        volatile long lastResetTime;

        KeyInfo(Semaphore semaphore, RateLimiterConfig config, long lastResetTime) {
            this.semaphore = semaphore;
            this.config = config;
            this.lastResetTime = lastResetTime;
        }
    }
}
```

```
rateLimiterConfigs:
  key1:
    timeWindowMillis: 1000
    maxConcurrency: 3
  key2:
    timeWindowMillis: 2000
    maxConcurrency: 5
```



### 参考二

```

import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * @author xinzhang
 * @Description
 * @create 2025-03-12 22:58
 */
@Configuration
@RefreshScope
public class RateLimiter {
    private final ConcurrentHashMap<String, ArrayBlockingQueue<Long>> limiterMap;
    private final int capacity;
    private final long duration;
    private long waitTime = 2000;
    private final ConcurrentHashMap<String, Semaphore> keySemaphores = new ConcurrentHashMap<>();

    public RateLimiter(int capacity, long duration, long waitTime) {
        this.capacity = capacity;
        this.duration = duration;
        this.waitTime = waitTime;
        limiterMap = new ConcurrentHashMap<>();
    }

    public boolean isAllowed(String key) {
        // 利用信号量确保只有单个key的操作线程进入以下逻辑
        Semaphore semaphore = keySemaphores.computeIfAbsent(key, k -> new Semaphore(1, true));
        try {
            if (!semaphore.tryAcquire(waitTime, TimeUnit.MILLISECONDS)) {
                return false;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }

        // 利用有界队列来控制并发
        ArrayBlockingQueue<Long> queue = limiterMap.computeIfAbsent(key, k -> new ArrayBlockingQueue<>(capacity));
        long currentTime = System.currentTimeMillis();
        try {
            // queue的api, offer是添加元素, peek是查找队列最头部的元素, 队列先进先出, 也就是最早的时间, poll是取出队列最头部的元素
            if (!queue.offer(currentTime)) {
                long oldestTime = (long) queue.peek();
                // 利用时间戳来实现滑动窗口
                if (currentTime - oldestTime < duration) {
                    return false;
                } else {
                    queue.poll();
                    queue.add(currentTime);
                    return true;
                }
            }
        } finally {
            semaphore.release();
        }
        return true;
    }
}
```
