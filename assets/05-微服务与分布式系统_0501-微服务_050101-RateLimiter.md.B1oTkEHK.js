import{_ as s,c as a,o as p,ag as e}from"./chunks/framework.CP8pidWN.js";const g=JSON.parse('{"title":"RateLimiter","description":"","frontmatter":{},"headers":[],"relativePath":"05-微服务与分布式系统/0501-微服务/050101-RateLimiter.md","filePath":"05-微服务与分布式系统/0501-微服务/050101-RateLimiter.md"}'),i={name:"05-微服务与分布式系统/0501-微服务/050101-RateLimiter.md"};function l(t,n,r,c,o,u){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="ratelimiter" tabindex="-1">RateLimiter <a class="header-anchor" href="#ratelimiter" aria-label="Permalink to &quot;RateLimiter&quot;">​</a></h1><h2 id="针对key的简易限流" tabindex="-1">针对key的简易限流 <a class="header-anchor" href="#针对key的简易限流" aria-label="Permalink to &quot;针对key的简易限流&quot;">​</a></h2><p>应用场景: 比如限制用户的并发请求数, 针对useId制定简单的限流策略</p><blockquote><p>prompt: 在springboot-web框架下用java的semaphere实现一个RateLimiter, 要求控制某key在某个毫秒时间段内的并发请求数量, 然后key与毫秒, 并发数量均可配置热刷</p></blockquote><h3 id="参考一-gpt生成" tabindex="-1">参考一(GPT生成) <a class="header-anchor" href="#参考一-gpt生成" aria-label="Permalink to &quot;参考一(GPT生成)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>import org.springframework.beans.factory.annotation.Autowired;</span></span>
<span class="line"><span>import org.springframework.cloud.context.config.annotation.RefreshScope;</span></span>
<span class="line"><span>import org.springframework.context.annotation.Configuration;</span></span>
<span class="line"><span>import org.springframework.web.bind.annotation.GetMapping;</span></span>
<span class="line"><span>import org.springframework.web.bind.annotation.PathVariable;</span></span>
<span class="line"><span>import org.springframework.web.bind.annotation.RestController;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import java.util.Map;</span></span>
<span class="line"><span>import java.util.concurrent.ConcurrentHashMap;</span></span>
<span class="line"><span>import java.util.concurrent.Semaphore;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Configuration</span></span>
<span class="line"><span>@RefreshScope</span></span>
<span class="line"><span>public class RateLimiterConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Autowired</span></span>
<span class="line"><span>    private Map&lt;String, Object&gt; rateLimiterConfigs;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public RateLimiterConfig getConfig(String key) {</span></span>
<span class="line"><span>        return (RateLimiterConfig) rateLimiterConfigs.get(key);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static class RateLimiterConfig {</span></span>
<span class="line"><span>        private Long timeWindowMillis;</span></span>
<span class="line"><span>        private Integer maxConcurrency;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // Getters and Setters</span></span>
<span class="line"><span>        public Long getTimeWindowMillis() { return timeWindowMillis; }</span></span>
<span class="line"><span>        public void setTimeWindowMillis(Long timeWindowMillis) { this.timeWindowMillis = timeWindowMillis; }</span></span>
<span class="line"><span>        public Integer getMaxConcurrency() { return maxConcurrency; }</span></span>
<span class="line"><span>        public void setMaxConcurrency(Integer maxConcurrency) { this.maxConcurrency = maxConcurrency; }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@RestController</span></span>
<span class="line"><span>public class RateLimiterController {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private final ConcurrentHashMap&lt;String, KeyInfo&gt; keyInfos = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @GetMapping(&quot;/limit/{key}&quot;)</span></span>
<span class="line"><span>    public String limitRequest(@PathVariable String key) {</span></span>
<span class="line"><span>        if (acquirePermission(key)) {</span></span>
<span class="line"><span>            return &quot;Request processed successfully&quot;;</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            return &quot;Too many requests&quot;;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private boolean acquirePermission(String key) {</span></span>
<span class="line"><span>        RateLimiterConfig config = RateLimiterConfig.getConfig(key);</span></span>
<span class="line"><span>        if (config == null || config.getMaxConcurrency() == null || config.getTimeWindowMillis() == null) {</span></span>
<span class="line"><span>            return false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        KeyInfo keyInfo = keyInfos.computeIfAbsent(key, k -&gt; {</span></span>
<span class="line"><span>            Semaphore sem = new Semaphore(config.getMaxConcurrency());</span></span>
<span class="line"><span>            return new KeyInfo(sem, config, System.currentTimeMillis());</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 检查配置变更</span></span>
<span class="line"><span>        if (!keyInfo.config.equals(config)) {</span></span>
<span class="line"><span>            keyInfos.put(key, new KeyInfo(new Semaphore(config.getMaxConcurrency()), config, System.currentTimeMillis()));</span></span>
<span class="line"><span>            return acquirePermission(key); // 递归调用应用新配置</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        long now = System.currentTimeMillis();</span></span>
<span class="line"><span>        if (now - keyInfo.lastResetTime &gt; config.getTimeWindowMillis()) {</span></span>
<span class="line"><span>            keyInfo.semaphore.release(config.getMaxConcurrency());</span></span>
<span class="line"><span>            keyInfo.lastResetTime = now;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            return keyInfo.semaphore.tryAcquire(100, TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>        } catch (InterruptedException e) {</span></span>
<span class="line"><span>            Thread.currentThread().interrupt();</span></span>
<span class="line"><span>            return false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static class KeyInfo {</span></span>
<span class="line"><span>        final Semaphore semaphore;</span></span>
<span class="line"><span>        final RateLimiterConfig config;</span></span>
<span class="line"><span>        volatile long lastResetTime;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        KeyInfo(Semaphore semaphore, RateLimiterConfig config, long lastResetTime) {</span></span>
<span class="line"><span>            this.semaphore = semaphore;</span></span>
<span class="line"><span>            this.config = config;</span></span>
<span class="line"><span>            this.lastResetTime = lastResetTime;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>rateLimiterConfigs:</span></span>
<span class="line"><span>  key1:</span></span>
<span class="line"><span>    timeWindowMillis: 1000</span></span>
<span class="line"><span>    maxConcurrency: 3</span></span>
<span class="line"><span>  key2:</span></span>
<span class="line"><span>    timeWindowMillis: 2000</span></span>
<span class="line"><span>    maxConcurrency: 5</span></span></code></pre></div><h3 id="参考二" tabindex="-1">参考二 <a class="header-anchor" href="#参考二" aria-label="Permalink to &quot;参考二&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>import org.springframework.cloud.context.config.annotation.RefreshScope;</span></span>
<span class="line"><span>import org.springframework.context.annotation.Configuration;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import java.util.concurrent.ArrayBlockingQueue;</span></span>
<span class="line"><span>import java.util.concurrent.ConcurrentHashMap;</span></span>
<span class="line"><span>import java.util.concurrent.Semaphore;</span></span>
<span class="line"><span>import java.util.concurrent.TimeUnit;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * @author xinzhang</span></span>
<span class="line"><span> * @Description</span></span>
<span class="line"><span> * @create 2025-03-12 22:58</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>@Configuration</span></span>
<span class="line"><span>@RefreshScope</span></span>
<span class="line"><span>public class RateLimiter {</span></span>
<span class="line"><span>    private final ConcurrentHashMap&lt;String, ArrayBlockingQueue&lt;Long&gt;&gt; limiterMap;</span></span>
<span class="line"><span>    private final int capacity;</span></span>
<span class="line"><span>    private final long duration;</span></span>
<span class="line"><span>    private long waitTime = 2000;</span></span>
<span class="line"><span>    private final ConcurrentHashMap&lt;String, Semaphore&gt; keySemaphores = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public RateLimiter(int capacity, long duration, long waitTime) {</span></span>
<span class="line"><span>        this.capacity = capacity;</span></span>
<span class="line"><span>        this.duration = duration;</span></span>
<span class="line"><span>        this.waitTime = waitTime;</span></span>
<span class="line"><span>        limiterMap = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public boolean isAllowed(String key) {</span></span>
<span class="line"><span>        // 利用信号量确保只有单个key的操作线程进入以下逻辑</span></span>
<span class="line"><span>        Semaphore semaphore = keySemaphores.computeIfAbsent(key, k -&gt; new Semaphore(1, true));</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            if (!semaphore.tryAcquire(waitTime, TimeUnit.MILLISECONDS)) {</span></span>
<span class="line"><span>                return false;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        } catch (InterruptedException e) {</span></span>
<span class="line"><span>            Thread.currentThread().interrupt();</span></span>
<span class="line"><span>            return false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 利用有界队列来控制并发</span></span>
<span class="line"><span>        ArrayBlockingQueue&lt;Long&gt; queue = limiterMap.computeIfAbsent(key, k -&gt; new ArrayBlockingQueue&lt;&gt;(capacity));</span></span>
<span class="line"><span>        long currentTime = System.currentTimeMillis();</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            // queue的api, offer是添加元素, peek是查找队列最头部的元素, 队列先进先出, 也就是最早的时间, poll是取出队列最头部的元素</span></span>
<span class="line"><span>            if (!queue.offer(currentTime)) {</span></span>
<span class="line"><span>                long oldestTime = (long) queue.peek();</span></span>
<span class="line"><span>                // 利用时间戳来实现滑动窗口</span></span>
<span class="line"><span>                if (currentTime - oldestTime &lt; duration) {</span></span>
<span class="line"><span>                    return false;</span></span>
<span class="line"><span>                } else {</span></span>
<span class="line"><span>                    queue.poll();</span></span>
<span class="line"><span>                    queue.add(currentTime);</span></span>
<span class="line"><span>                    return true;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        } finally {</span></span>
<span class="line"><span>            semaphore.release();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return true;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div>`,9)]))}const f=s(i,[["render",l]]);export{g as __pageData,f as default};
