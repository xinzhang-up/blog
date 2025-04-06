import{_ as n,c as s,o as e,ag as p}from"./chunks/framework.DPDPlp3K.js";const l="/assets/1741610848949.BMbFfCGz.png",i="/assets/1741610885668.DWVni4UP.png",r="/assets/1741610963692.CUO8T4Hj.png",t="/assets/1741610974426.TOPmz_kc.png",c="/assets/1741610994292.ByQQeR0J.png",_=JSON.parse('{"title":"客户端负载均衡","description":"","frontmatter":{},"headers":[],"relativePath":"05-微服务与分布式系统/0502-分布式/050203-客户端负载均衡.md","filePath":"05-微服务与分布式系统/0502-分布式/050203-客户端负载均衡.md"}'),o={name:"05-微服务与分布式系统/0502-分布式/050203-客户端负载均衡.md"};function d(u,a,b,h,g,m){return e(),s("div",null,a[0]||(a[0]=[p('<h1 id="客户端负载均衡" tabindex="-1">客户端负载均衡 <a class="header-anchor" href="#客户端负载均衡" aria-label="Permalink to &quot;客户端负载均衡&quot;">​</a></h1><h2 id="spring-cloud-ribbon" tabindex="-1">Spring Cloud Ribbon <a class="header-anchor" href="#spring-cloud-ribbon" aria-label="Permalink to &quot;Spring Cloud Ribbon&quot;">​</a></h2><blockquote><p>参考: <a href="https://mp.weixin.qq.com/s/KKOOPkudR7GdWwl8n9iWWA" target="_blank" rel="noreferrer">https://mp.weixin.qq.com/s/KKOOPkudR7GdWwl8n9iWWA</a></p></blockquote><h3 id="架构" tabindex="-1">架构 <a class="header-anchor" href="#架构" aria-label="Permalink to &quot;架构&quot;">​</a></h3><p><img src="'+l+'" alt="1741610848949"></p><h3 id="交互流程" tabindex="-1">交互流程 <a class="header-anchor" href="#交互流程" aria-label="Permalink to &quot;交互流程&quot;">​</a></h3><p><img src="'+i+'" alt="1741610885668"></p><h3 id="核心组件" tabindex="-1">核心组件 <a class="header-anchor" href="#核心组件" aria-label="Permalink to &quot;核心组件&quot;">​</a></h3><h4 id="loadbalanced-注解原理" tabindex="-1">@LoadBalanced 注解原理 <a class="header-anchor" href="#loadbalanced-注解原理" aria-label="Permalink to &quot;@LoadBalanced 注解原理&quot;">​</a></h4><p>参考源码：LoadBalancerAutoConfiguration</p><p>@LoadBalanced利用@Qualifier作为restTemplates注入的筛选条件，筛选出具有负载均衡标识的RestTemplate。</p><p><img src="'+r+'" alt="1741610963692"></p><p>被@LoadBalanced注解的restTemplate会被定制，添加LoadBalancerInterceptor拦截器。</p><p><img src="'+t+'" alt="1741610974426"></p><h4 id="ribbon负载均衡策略" tabindex="-1">Ribbon负载均衡策略 <a class="header-anchor" href="#ribbon负载均衡策略" aria-label="Permalink to &quot;Ribbon负载均衡策略&quot;">​</a></h4><p><img src="'+c+`" alt="1741610994292"></p><ul><li>RandomRule：随机选择一个Server。</li><li>RetryRule：对选定的负载均衡策略机上重试机制，在一个配置时间段内当选择Server不成功，则一直尝试使用subRule的方式选择一个可用的server。</li><li>RoundRobinRule：轮询选择， 轮询index，选择index对应位置的Server。4、AvailabilityFilteringRule：过滤掉一直连接失败的被标记为circuit tripped的后端Server，并过滤掉那些高并发的后端Server或者使用一个AvailabilityPredicate来包含过滤server的逻辑，其实就是检查status里记录的各个Server的运行状态。5、BestAvailableRule：选择一个最小的并发请求的Server，逐个考察Server，如果Server被tripped了，则跳过。</li><li>WeightedResponseTimeRule：根据响应时间加权，响应时间越长，权重越小，被选中的可能性越低。</li><li>ZoneAvoidanceRule：默认的负载均衡策略，即复合判断Server所在区域的性能和Server的可用性选择Server，在没有区域的环境下，类似于轮询(RandomRule)</li><li>NacosRule: 同集群优先调用</li></ul><h4 id="修改默认负载均衡策略" tabindex="-1"><strong>修改默认负载均衡策略</strong> <a class="header-anchor" href="#修改默认负载均衡策略" aria-label="Permalink to &quot;**修改默认负载均衡策略**&quot;">​</a></h4><p>全局配置</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class RibbonConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /**</span></span>
<span class="line"><span>    * 全局配置</span></span>
<span class="line"><span>    * 指定负载均衡策略</span></span>
<span class="line"><span>    * @return</span></span>
<span class="line"><span>    */</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public IRule() {</span></span>
<span class="line"><span>      // 指定使用Nacos提供的负载均衡策略（优先调用同一集群的实例，基于随机权重）</span></span>
<span class="line"><span>      return new NacosRule();</span></span>
<span class="line"><span>  }</span></span></code></pre></div><p>局部配置</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 被调用的微服务名</span></span>
<span class="line"><span>mall-order:</span></span>
<span class="line"><span>ribbon:</span></span>
<span class="line"><span>  # 指定使用Nacos提供的负载均衡策略（优先调用同一集群的实例，基于随机&amp;权重）</span></span>
<span class="line"><span>  NFLoadBalancerRuleClassName: com.alibaba.cloud.nacos.ribbon.NacosRule</span></span></code></pre></div><h4 id="自定义负载均衡策略" tabindex="-1"><strong>自定义负载均衡策略</strong> <a class="header-anchor" href="#自定义负载均衡策略" aria-label="Permalink to &quot;**自定义负载均衡策略**&quot;">​</a></h4><p>实现IRule接口</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Slf4j</span></span>
<span class="line"><span>public class NacosRandomWithWeightRule extends AbstractLoadBalancerRule {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Autowired</span></span>
<span class="line"><span>  private NacosDiscoveryProperties nacosDiscoveryProperties;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Server choose(Object key) {</span></span>
<span class="line"><span>      DynamicServerListLoadBalancer loadBalancer = (DynamicServerListLoadBalancer) getLoadBalancer();</span></span>
<span class="line"><span>      String serviceName = loadBalancer.getName();</span></span>
<span class="line"><span>      NamingService namingService = nacosDiscoveryProperties.namingServiceInstance();</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>          //nacos基于权重的算法</span></span>
<span class="line"><span>          Instance instance = namingService.selectOneHealthyInstance(serviceName);</span></span>
<span class="line"><span>          return new NacosServer(instance);</span></span>
<span class="line"><span>      } catch (NacosException e) {</span></span>
<span class="line"><span>          log.error(&quot;获取服务实例异常：{}&quot;, e.getMessage());</span></span>
<span class="line"><span>          e.printStackTrace();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void initWithNiwsConfig(IClientConfig clientConfig) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  }</span></span></code></pre></div><h4 id="开启饥饿加载-解决第一次调用慢的问题" tabindex="-1">开启饥饿加载，解决第一次调用慢的问题 <a class="header-anchor" href="#开启饥饿加载-解决第一次调用慢的问题" aria-label="Permalink to &quot;开启饥饿加载，解决第一次调用慢的问题&quot;">​</a></h4><p>ribbon默认懒加载</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ribbon:</span></span>
<span class="line"><span>  eager-load:</span></span>
<span class="line"><span>      # 开启ribbon饥饿加载</span></span>
<span class="line"><span>     enabled: true</span></span>
<span class="line"><span>     # 配置mall-order使用ribbon饥饿加载，多个使用逗号分隔</span></span>
<span class="line"><span>     clients: mall-order</span></span></code></pre></div>`,28)]))}const R=n(o,[["render",d]]);export{_ as __pageData,R as default};
