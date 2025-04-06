import{_ as s,c as a,o as e,ag as p}from"./chunks/framework.CP8pidWN.js";const t="/blog/assets/1741613076674.BK7ASPQR.png",l="/blog/assets/1741613181208.CzTRk0eo.png",i="/blog/assets/1741659359535.B8__ke2w.png",c="/blog/assets/1741659393983.s-i9iPEl.png",o="/blog/assets/1741659426962.DY4fLu_3.png",r="/blog/assets/1741659489990.Droa4Ly1.png",u="/blog/assets/1741659548096.IJsOwMte.png",h="/blog/assets/1741659558495.BBO8Kxoc.png",m="/blog/assets/1741660242850.DmG-KqkI.png",g="/blog/assets/1741660333440.DoedqS-Y.png",f=JSON.parse('{"title":"RabbitMQ基础(二)","description":"","frontmatter":{},"headers":[],"relativePath":"04-缓存与中间件/0401-RabbitMQ/040102-RabbitMQ基础(二).md","filePath":"04-缓存与中间件/0401-RabbitMQ/040102-RabbitMQ基础(二).md"}'),b={name:"04-缓存与中间件/0401-RabbitMQ/040102-RabbitMQ基础(二).md"};function q(d,n,y,x,C,v){return e(),a("div",null,n[0]||(n[0]=[p('<h1 id="rabbitmq基础-二" tabindex="-1">RabbitMQ基础(二) <a class="header-anchor" href="#rabbitmq基础-二" aria-label="Permalink to &quot;RabbitMQ基础(二)&quot;">​</a></h1><blockquote><p>官方文档: <a href="https://www.rabbitmq.com/getstarted.html" target="_blank" rel="noreferrer">https://www.rabbitmq.com/getstarted.html</a></p></blockquote><h2 id="基本概念" tabindex="-1">基本概念 <a class="header-anchor" href="#基本概念" aria-label="Permalink to &quot;基本概念&quot;">​</a></h2><p><strong>rabbitmq基本结构</strong></p><p><img src="'+t+'" alt="1741613076674"></p><p>Broker：消息队列服务进程，此进程包括两个部分：Exchange和Queue。 ●Exchange：消息队列交换机，按一定的规则将消息路由转发到某个队列，对消息进行过虑。 ●Queue：消息队列，存储消息的队列，消息到达队列并转发给指定的消费方。 ●Producer：消息生产者，即生产方客户端，生产方客户端将消息发送到MQ。 ●Consumer：消息消费者，即消费方客户端，接收MQ转发的消息。 ●connection是生产者或消费者与broker的一个TCP连接 ●channel是在建立在 Connection 之上的虚拟连接</p><h2 id="模式" tabindex="-1">模式 <a class="header-anchor" href="#模式" aria-label="Permalink to &quot;模式&quot;">​</a></h2><blockquote><p>参考: <a href="https://www.rabbitmq.com/getstarted.html" target="_blank" rel="noreferrer">https://www.rabbitmq.com/getstarted.html</a></p></blockquote><h3 id="work-queues工作队列模式" tabindex="-1">Work queues工作队列模式 <a class="header-anchor" href="#work-queues工作队列模式" aria-label="Permalink to &quot;Work queues工作队列模式&quot;">​</a></h3><p><img src="'+l+'" alt="1741613181208"><strong>多个消费端共同消费同一个队列中的消息。</strong> 1、一条消息只会被一个消费者接收； 2、rabbit采用轮询的方式将消息是平均发送给消费者的； 3、消费者在处理完某条消息后，才会收到下一条消息.</p><h3 id="publish-subscribe发布订阅模式" tabindex="-1">Publish/subscribe发布订阅模式 <a class="header-anchor" href="#publish-subscribe发布订阅模式" aria-label="Permalink to &quot;Publish/subscribe发布订阅模式&quot;">​</a></h3><p><img src="'+i+'" alt="1741659359535"> 每个消费者监听自己的队列,生产者将消息发给broker, 由交换机将消息转发到绑定此交换机的每个队列,每个绑定交换机的队列都将接收到消息</p><h3 id="routing路由模式" tabindex="-1">Routing路由模式 <a class="header-anchor" href="#routing路由模式" aria-label="Permalink to &quot;Routing路由模式&quot;">​</a></h3><p><img src="'+c+'" alt="1741659393983"> 每个消费者监听自己的队列,并且设置routingkey, 生产者将消息发给broker,由交换机根据routingkey来转发消息到指定的队列</p><h3 id="topics通配符模式" tabindex="-1">Topics通配符模式 <a class="header-anchor" href="#topics通配符模式" aria-label="Permalink to &quot;Topics通配符模式&quot;">​</a></h3><p><img src="'+o+'" alt="1741659426962"> *可以代替一个单词。 #可以替代零个或多个单词。 1、每个消费者监听自己的队列，并且设置带统配符的routingkey。 2、生产者将消息发给broker，由交换机根据routingkey来转发消息到指定的队列。</p><h3 id="rpc模式" tabindex="-1">RPC模式 <a class="header-anchor" href="#rpc模式" aria-label="Permalink to &quot;RPC模式&quot;">​</a></h3><p><img src="'+r+'" alt="1741659489990"> RPC即客户端远程调用服务端的方法 ，使用MQ可以实现RPC的异步调用</p><h2 id="消息如何保障100-的投递成功" tabindex="-1">消息如何保障100%的投递成功 <a class="header-anchor" href="#消息如何保障100-的投递成功" aria-label="Permalink to &quot;消息如何保障100%的投递成功&quot;">​</a></h2><h3 id="生产端的可靠性投递" tabindex="-1">生产端的可靠性投递 <a class="header-anchor" href="#生产端的可靠性投递" aria-label="Permalink to &quot;生产端的可靠性投递&quot;">​</a></h3><p>● 保障消息的成功发出 ● 保障mq节点的成功接收 ● 发送端收到mq节点的确认应答 ● 完善的消息补偿机制 互联网大厂的解决方案: ● 消息落库, 对消息状态进行打标 <img src="'+u+'" alt="1741659548096"> 消息的延迟投递, 做二次确认, 回调检查 <img src="'+h+`" alt="1741659558495"></p><h3 id="消费端的幂等性" tabindex="-1">消费端的幂等性 <a class="header-anchor" href="#消费端的幂等性" aria-label="Permalink to &quot;消费端的幂等性&quot;">​</a></h3><p>唯一ID+指纹码机制 利用Redis原子特性实现</p><h2 id="java-client快速入门" tabindex="-1">Java Client快速入门 <a class="header-anchor" href="#java-client快速入门" aria-label="Permalink to &quot;Java Client快速入门&quot;">​</a></h2><blockquote><p>文档: <a href="https://www.rabbitmq.com/api-guide.html#exchanges-and-queues" target="_blank" rel="noreferrer">https://www.rabbitmq.com/api-guide.html#exchanges-and-queues</a></p></blockquote><h3 id="依赖" tabindex="-1">依赖 <a class="header-anchor" href="#依赖" aria-label="Permalink to &quot;依赖&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> &lt;dependency&gt;</span></span>
<span class="line"><span>      &lt;groupId&gt;com.rabbitmq&lt;/groupId&gt;</span></span>
<span class="line"><span>      &lt;artifactId&gt;amqp-client&lt;/artifactId&gt;</span></span>
<span class="line"><span>      &lt;version&gt;5.8.0&lt;/version&gt;</span></span>
<span class="line"><span>    &lt;/dependency&gt;</span></span></code></pre></div><h3 id="hello-rabbitmq示例" tabindex="-1">Hello Rabbitmq示例 <a class="header-anchor" href="#hello-rabbitmq示例" aria-label="Permalink to &quot;Hello Rabbitmq示例&quot;">​</a></h3><p><strong>Producer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>package top.xinzhang0618.consumer.quick.start;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import com.rabbitmq.client.AMQP;</span></span>
<span class="line"><span>import com.rabbitmq.client.AMQP.BasicProperties;</span></span>
<span class="line"><span>import com.rabbitmq.client.AMQP.BasicProperties.Builder;</span></span>
<span class="line"><span>import com.rabbitmq.client.Channel;</span></span>
<span class="line"><span>import com.rabbitmq.client.Connection;</span></span>
<span class="line"><span>import com.rabbitmq.client.ConnectionFactory;</span></span>
<span class="line"><span>import java.io.IOException;</span></span>
<span class="line"><span>import java.util.HashMap;</span></span>
<span class="line"><span>import java.util.concurrent.TimeoutException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * Producer</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * @author xinzhang</span></span>
<span class="line"><span> * @author Shenzhen Greatonce Co Ltd</span></span>
<span class="line"><span> * @version 2020/2/29</span></span>
<span class="line"><span> * 文档: https://www.rabbitmq.com/api-guide.html</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>public class Producer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String routingKey = &quot;test&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    HashMap&lt;String, Object&gt; map = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>    map.put(&quot;1&quot;, &quot;测试参数1&quot;);</span></span>
<span class="line"><span>    BasicProperties properties = new Builder()</span></span>
<span class="line"><span>        .deliveryMode(2)</span></span>
<span class="line"><span>        .contentEncoding(&quot;utf-8&quot;)</span></span>
<span class="line"><span>        .expiration(&quot;15000&quot;)</span></span>
<span class="line"><span>        .headers(map)</span></span>
<span class="line"><span>        .build();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String message = &quot;hello! rabbitmq! 2020-02-29&quot;;</span></span>
<span class="line"><span>    for (int i = 0; i &lt; 5; i++) {</span></span>
<span class="line"><span>      channel.basicPublish(exchangeName, routingKey, properties, message.getBytes());</span></span>
<span class="line"><span>      System.out.println(&quot;发送消息: =====&gt;&quot; + message);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    channel.close();</span></span>
<span class="line"><span>    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>Consumer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>package top.xinzhang0618.consumer.quick.start;</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>import com.rabbitmq.client.AMQP.BasicProperties;</span></span>
<span class="line"><span>import com.rabbitmq.client.Channel;</span></span>
<span class="line"><span>import com.rabbitmq.client.Connection;</span></span>
<span class="line"><span>import com.rabbitmq.client.ConnectionFactory;</span></span>
<span class="line"><span>import com.rabbitmq.client.DefaultConsumer;</span></span>
<span class="line"><span>import com.rabbitmq.client.Delivery;</span></span>
<span class="line"><span>import com.rabbitmq.client.Envelope;</span></span>
<span class="line"><span>import java.io.IOException;</span></span>
<span class="line"><span>import java.util.Queue;</span></span>
<span class="line"><span>import java.util.concurrent.TimeoutException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * Consumer</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * @author xinzhang</span></span>
<span class="line"><span> * @author Shenzhen Greatonce Co Ltd</span></span>
<span class="line"><span> * @version 2020/2/29</span></span>
<span class="line"><span> * 文档: https://www.rabbitmq.com/api-guide.html</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>public class Consumer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String queueName = &quot;xztest01&quot;;</span></span>
<span class="line"><span>    channel.queueDeclare(queueName, true, false, false, null);</span></span>
<span class="line"><span>    String routingKey = &quot;test&quot;;</span></span>
<span class="line"><span>    channel.queueBind(queueName, exchangeName, routingKey);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    channel.basicConsume(queueName, true, new DefaultConsumer(channel) {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)</span></span>
<span class="line"><span>          throws IOException {</span></span>
<span class="line"><span>        System.out.println(&quot;接收到消息: ====&gt;&quot; + new String(body));</span></span>
<span class="line"><span>        System.out.println(&quot;交换机以及路由为: &quot; + envelope.getExchange() + &quot;---&quot; + envelope.getRoutingKey());</span></span>
<span class="line"><span>        System.out.println(&quot;过期时间以及携带自定义参数为: &quot; + properties.getExpiration() + &quot;===&quot; + properties.getHeaders().get(&quot;1&quot;));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出</span></span>
<span class="line"><span>//    channel.close();</span></span>
<span class="line"><span>//    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="confirm确认消息" tabindex="-1">Confirm确认消息 <a class="header-anchor" href="#confirm确认消息" aria-label="Permalink to &quot;Confirm确认消息&quot;">​</a></h3><p>消息的确认是指生产者投递消息过后, 如果broker收到消息则会给生产者一个应答; 生产者进行接收应答, 用来确认这条消息是否正常的发送到broker 关联配置(在生产端配置): 1.channel.confirmSelect(); 2. channel.addConfirmListener(new ConfirmListener() {...})</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> // 打开确认模式</span></span>
<span class="line"><span>channel.confirmSelect();</span></span>
<span class="line"><span>channel.addConfirmListener(new ConfirmListener() {...})</span></span></code></pre></div><p><img src="`+m+`" alt="1741660242850"></p><h3 id="消费者应答-ack-和发布者确认-confirm" tabindex="-1">消费者应答(ACK)和发布者确认(Confirm) <a class="header-anchor" href="#消费者应答-ack-和发布者确认-confirm" aria-label="Permalink to &quot;消费者应答(ACK)和发布者确认(Confirm)&quot;">​</a></h3><p>参考: <a href="https://blog.csdn.net/cadem/article/details/69627523" target="_blank" rel="noreferrer">https://blog.csdn.net/cadem/article/details/69627523</a><a href="https://blog.bossma.cn/rabbitmq/consumer-ack-and-publisher-confirm/" target="_blank" rel="noreferrer">https://blog.bossma.cn/rabbitmq/consumer-ack-and-publisher-confirm/</a> ●rabbitmq-server也成为Broker ●AMQP协议定义的确认(acknowledgement)是从consumer到mq的确认, 表示一条消息已经被客户端正确处理RabbitMQ扩展了AMQP协议，定义了从broker到publisher的”确认”，但将其称之为confirm。所以RabbitMQ的确认有2种，叫不同的名字，一个consumer acknowledgement，一个叫publisher confirm。 ●consumer ACK是通过basic.ack实现, 默认开启, 可以在basic.consume中指定关闭 ●publishConfirm是通过复用basic.ack方法实现, 默认关闭, 可以设置channel.confirmSelect开启</p><h3 id="return消息机制" tabindex="-1">Return消息机制 <a class="header-anchor" href="#return消息机制" aria-label="Permalink to &quot;Return消息机制&quot;">​</a></h3><p>Return Listener用于处理一些不可路由的消息 (在发送消息时, 当前的exchange不存在或者指定的routingKey路由不到) 关联配置(在生产端配置): 1.Mandatory: 为true时, 监听器接收路由不可达消息, 为false则broker端自动删除该消息 2.channel.addReturnListener(new ReturnListener() {...})</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 第三个参数mandatory设为true, 监听不可达消息</span></span>
<span class="line"><span>channel.basicPublish(exchangeName, routingKey2, true,null, message.getBytes());</span></span>
<span class="line"><span>channel.addReturnListener(new ReturnListener() {...})</span></span></code></pre></div><p><img src="`+g+`" alt="1741660333440"></p><h3 id="confirm-return消息机制示例" tabindex="-1">Confirm/Return消息机制示例 <a class="header-anchor" href="#confirm-return消息机制示例" aria-label="Permalink to &quot;Confirm/Return消息机制示例&quot;">​</a></h3><p><strong>Producer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>package top.xinzhang0618.consumer.confirm;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import com.rabbitmq.client.AMQP.BasicProperties;</span></span>
<span class="line"><span>import com.rabbitmq.client.Channel;</span></span>
<span class="line"><span>import com.rabbitmq.client.ConfirmListener;</span></span>
<span class="line"><span>import com.rabbitmq.client.Connection;</span></span>
<span class="line"><span>import com.rabbitmq.client.ConnectionFactory;</span></span>
<span class="line"><span>import com.rabbitmq.client.ReturnListener;</span></span>
<span class="line"><span>import java.io.IOException;</span></span>
<span class="line"><span>import java.util.concurrent.TimeoutException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * Producer</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * @author xinzhang</span></span>
<span class="line"><span> * @author Shenzhen Greatonce Co Ltd</span></span>
<span class="line"><span> * @version 2020/2/29</span></span>
<span class="line"><span> * 文档: https://www.rabbitmq.com/api-guide.html</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>public class Producer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span>    // 打开确认模式</span></span>
<span class="line"><span>    channel.confirmSelect();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest_confirm&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String routingKey = &quot;test.confirm.save&quot;;</span></span>
<span class="line"><span>    String routingKey2 = &quot;return&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String message = &quot;发送确认消息! 2020-02-29&quot;;</span></span>
<span class="line"><span>    channel.basicPublish(exchangeName, routingKey, null, message.getBytes());</span></span>
<span class="line"><span>    System.out.println(&quot;发送消息-confirm: =====&gt;&quot; + message);</span></span>
<span class="line"><span>    // 第三个参数mandatory设为true, 监听不可达消息</span></span>
<span class="line"><span>    channel.basicPublish(exchangeName, routingKey2, true,null, message.getBytes());</span></span>
<span class="line"><span>    System.out.println(&quot;发送消息-return: =====&gt;&quot; + message);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    channel.addConfirmListener(new ConfirmListener() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void handleAck(long l, boolean b) throws IOException {</span></span>
<span class="line"><span>        System.out.println(&quot;------------ack------------&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void handleNack(long l, boolean b) throws IOException {</span></span>
<span class="line"><span>        System.out.println(&quot;------------no---ack------------&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    channel.addReturnListener(new ReturnListener() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void handleReturn(int i, String s, String s1, String s2, BasicProperties basicProperties, byte[] bytes)</span></span>
<span class="line"><span>          throws IOException {</span></span>
<span class="line"><span>        System.out.println(&quot;------------return------------&quot;);</span></span>
<span class="line"><span>        System.out.println(&quot;replyCode: &quot; + i);</span></span>
<span class="line"><span>        System.out.println(&quot;replyText: &quot; + s);</span></span>
<span class="line"><span>        System.out.println(&quot;exchange: &quot; + s1);</span></span>
<span class="line"><span>        System.out.println(&quot;routingKey: &quot; + s2);</span></span>
<span class="line"><span>        System.out.println(&quot;msg: &quot; + new String(bytes));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//    channel.close();</span></span>
<span class="line"><span>//    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>Consumer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>消费端限流消费端限流</span></span>
<span class="line"><span>package top.xinzhang0618.consumer.confirm;</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>import com.rabbitmq.client.AMQP.BasicProperties;</span></span>
<span class="line"><span>import com.rabbitmq.client.Channel;</span></span>
<span class="line"><span>import com.rabbitmq.client.Connection;</span></span>
<span class="line"><span>import com.rabbitmq.client.ConnectionFactory;</span></span>
<span class="line"><span>import com.rabbitmq.client.DefaultConsumer;</span></span>
<span class="line"><span>import com.rabbitmq.client.Envelope;</span></span>
<span class="line"><span>import java.io.IOException;</span></span>
<span class="line"><span>import java.util.concurrent.TimeoutException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * Consumer</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * @author xinzhang</span></span>
<span class="line"><span> * @author Shenzhen Greatonce Co Ltd</span></span>
<span class="line"><span> * @version 2020/2/29</span></span>
<span class="line"><span> * 文档: https://www.rabbitmq.com/api-guide.html</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>public class Consumer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest_confirm&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String queueName = &quot;xztest02&quot;;</span></span>
<span class="line"><span>    channel.queueDeclare(queueName, true, false, false, null);</span></span>
<span class="line"><span>    String routingKey = &quot;test.#&quot;;</span></span>
<span class="line"><span>    channel.queueBind(queueName, exchangeName, routingKey);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    channel.basicConsume(queueName, true, new DefaultConsumer(channel) {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)</span></span>
<span class="line"><span>          throws IOException {</span></span>
<span class="line"><span>        System.out.println(&quot;接收到消息: ====&gt;&quot; + new String(body));</span></span>
<span class="line"><span>        System.out.println(&quot;交换机以及路由为: &quot; + envelope.getExchange() + &quot;---&quot; + envelope.getRoutingKey());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出</span></span>
<span class="line"><span>//    channel.close();</span></span>
<span class="line"><span>//    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="消费端限流" tabindex="-1">消费端限流 <a class="header-anchor" href="#消费端限流" aria-label="Permalink to &quot;消费端限流&quot;">​</a></h3><p>Rabbitmq提供了一种qos(服务质量保证的功能), 即在非自动确认消息的前提下, 如果一定数目的消息(通过基于consume或者channel设置qos的值)未被确认前, 不进行消费新的消息 关联配置(在消费端设置): 1.关闭autoACK 2.设置qos</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> // 参数: 限制消费的消息大小(为0则不作限制), 限制一次消费的消息的数量, 限流策略是channel(true)还是consumer(false)</span></span>
<span class="line"><span>channel.basicQos(0, 1, false);</span></span>
<span class="line"><span>channel.basicConsume(queueName, true, new DefaultConsumer(channel) {...})</span></span></code></pre></div><h3 id="ack与消息限流机制示例" tabindex="-1">Ack与消息限流机制示例 <a class="header-anchor" href="#ack与消息限流机制示例" aria-label="Permalink to &quot;Ack与消息限流机制示例&quot;">​</a></h3><p><strong>Producer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Producer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span>    // 打开确认模式</span></span>
<span class="line"><span>    channel.confirmSelect();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest_ack&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String routingKey = &quot;test.ack.save&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String message = &quot;发送非自动ack消息! 2020-03-01&quot;;</span></span>
<span class="line"><span>    for (int i = 0; i &lt; 5; i++) {</span></span>
<span class="line"><span>      channel.basicPublish(exchangeName, routingKey, null, message.getBytes());</span></span>
<span class="line"><span>      System.out.println(&quot;发送消息 =====&gt;&quot; + message);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    channel.close();</span></span>
<span class="line"><span>    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>Consumer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Consumer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest_ack&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String queueName = &quot;xztest03&quot;;</span></span>
<span class="line"><span>    channel.queueDeclare(queueName, true, false, false, null);</span></span>
<span class="line"><span>    String routingKey = &quot;test.#&quot;;</span></span>
<span class="line"><span>    channel.queueBind(queueName, exchangeName, routingKey);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 参数: 限制消费的消息大小(为0则不作限制), 限制一次消费的消息的数量, 限流策略是channel(true)还是consumer(false)</span></span>
<span class="line"><span>    channel.basicQos(0, 1, false);</span></span>
<span class="line"><span>    // 第二个参数, 关闭autoAck</span></span>
<span class="line"><span>    channel.basicConsume(queueName, false, new MyConsumer(channel));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出</span></span>
<span class="line"><span>//    channel.close();</span></span>
<span class="line"><span>//    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>MyConsumer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class MyConsumer extends DefaultConsumer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private Channel channel;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public MyConsumer(Channel channel) {</span></span>
<span class="line"><span>    super(channel);</span></span>
<span class="line"><span>    this.channel = channel;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)</span></span>
<span class="line"><span>      throws IOException {</span></span>
<span class="line"><span>    System.out.println(&quot;接收到消息: ====&gt;&quot; + new String(body));</span></span>
<span class="line"><span>    System.out.println(&quot;交换机以及路由为: &quot; + envelope.getExchange() + &quot;---&quot; + envelope.getRoutingKey());</span></span>
<span class="line"><span>    channel.basicAck(envelope.getDeliveryTag(), false);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="消息重回队列" tabindex="-1">消息重回队列 <a class="header-anchor" href="#消息重回队列" aria-label="Permalink to &quot;消息重回队列&quot;">​</a></h3><p>在手动ack的情况下:</p><ul><li>当投递使用的通道（或连接）被关闭时，任何没有被应答的投递（消息）将自动的重新入队列。这包括客户端丢失TCP连接，消费者应用（处理）故障，以及通道级的协议异常</li><li>channel.basicNack()方法可以设置重回队列<div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> // 参数: deliveryTag, multiple, requeue</span></span>
<span class="line"><span>channel.basicNack(envelope.getDeliveryTag(),false,true);</span></span></code></pre></div></li></ul><h3 id="rabbitmq实现延迟队列" tabindex="-1">Rabbitmq实现延迟队列 <a class="header-anchor" href="#rabbitmq实现延迟队列" aria-label="Permalink to &quot;Rabbitmq实现延迟队列&quot;">​</a></h3><p>**参考: **<a href="https://www.cnblogs.com/yinfengjiujian/p/9204600.html" target="_blank" rel="noreferrer">https://www.cnblogs.com/yinfengjiujian/p/9204600.html</a></p><ul><li>消息的TTL（Time To Live）</li></ul><p>消息的TTL就是消息的存活时间。</p><p>RabbitMQ可以对队列和消息分别设置TTL。对队列设置就是队列没有消费者连着的保留时间，也可以对每一个单独的消息做单独的设置。超过了这个时间，我们认为这个消息就死了，称之为死信。如果队列设置了，消息也设置了，那么会取小的。所以一个消息如果被路由到不同的队列中，这个消息死亡的时间有可能不一样（不同的队列设置）.</p><ul><li>死信队列(DLX, Dead Letter Exchanges)</li></ul><p>利用DLX, 当消息在一个队列中变成死信(dead message)之后, 它能被重新publish到另一个exchange, 这个exchange就是DLX.</p><p>消息变成死信的情况:</p><ul><li>消息被拒绝(basic.reject/basic.nack), 并且requeue=false</li><li>消息TTL过期</li><li>队列达到最大长度</li></ul><h3 id="死信队列-延迟消息示例" tabindex="-1">死信队列/延迟消息示例 <a class="header-anchor" href="#死信队列-延迟消息示例" aria-label="Permalink to &quot;死信队列/延迟消息示例&quot;">​</a></h3><p><strong>Producer</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Producer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest_dlx&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String routingKey = &quot;test.dlx.save&quot;;</span></span>
<span class="line"><span>    String message = &quot;发送dlx消息到xztest_dlx, 消息将于10s过期! --&gt;&quot; + LocalDateTime.now();</span></span>
<span class="line"><span>    BasicProperties properties = new Builder().expiration(&quot;10000&quot;).build();</span></span>
<span class="line"><span>    channel.basicPublish(exchangeName, routingKey, properties, message.getBytes());</span></span>
<span class="line"><span>    System.out.println(message);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    channel.close();</span></span>
<span class="line"><span>    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>Consumer</strong></p><p><strong>代码逻辑说明: 交换机xztest_dlx绑定了xztest04(key=test.#, 过期时间为20秒), test05(key=already.*)</strong></p><p>1.producer以路由test.dlx.save发送过期时间为10s的消息到交换机xztest_dlx;</p><p>2.xztest01队列没有消费者, 于是在10s秒后消息过期(消息过期时间10s&lt;队列过期时间20s);</p><p>3.xztest04将消息转发到xztest_dlx, 路由为already.ttl;</p><p>4.xztest05接收到消息并消费, 测试结果如下:</p><hr><p>接收到dlx消息: 发送dlx消息到xztest_dlx, 消息将于10s过期! --&gt;2020-03-01T16:49:50.598, 当前时间为: 2020-03-01T16:50:00.652</p><p>路由为: alread.ttl</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Consumer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws IOException, TimeoutException {</span></span>
<span class="line"><span>    ConnectionFactory connectionFactory = new ConnectionFactory();</span></span>
<span class="line"><span>    connectionFactory.setHost(&quot;139.9.62.232&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPort(30004);</span></span>
<span class="line"><span>    connectionFactory.setVirtualHost(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setUsername(&quot;xinzhang&quot;);</span></span>
<span class="line"><span>    connectionFactory.setPassword(&quot;Xinzhang123&quot;);</span></span>
<span class="line"><span>    Connection connection = connectionFactory.newConnection();</span></span>
<span class="line"><span>    Channel channel = connection.createChannel();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String exchangeName = &quot;xztest_dlx&quot;;</span></span>
<span class="line"><span>    channel.exchangeDeclare(exchangeName, &quot;topic&quot;, true);</span></span>
<span class="line"><span>    String queueName = &quot;xztest04&quot;;</span></span>
<span class="line"><span>    HashMap&lt;String, Object&gt; arguments = new HashMap&lt;&gt;(1);</span></span>
<span class="line"><span>    // 设置xztest04队列中消息的统一过期时间为20s, 若队列中消息过期, 会发送到xztest_dlx的路由为alread.ttl的队列中</span></span>
<span class="line"><span>    arguments.put(&quot;x-message-ttl&quot;, 20 * 1000);</span></span>
<span class="line"><span>    arguments.put(&quot;x-dead-letter-exchange&quot;, &quot;xztest_dlx&quot;);</span></span>
<span class="line"><span>    arguments.put(&quot;x-dead-letter-routing-key&quot;, &quot;already.ttl&quot;);</span></span>
<span class="line"><span>    channel.queueDeclare(queueName, true, false, false, arguments);</span></span>
<span class="line"><span>    String routingKey = &quot;test.#&quot;;</span></span>
<span class="line"><span>    channel.queueBind(queueName, exchangeName, routingKey);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    channel.queueDeclare(&quot;xztest05&quot;, true, false, false, null);</span></span>
<span class="line"><span>    channel.queueBind(&quot;xztest05&quot;, exchangeName, &quot;already.*&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    channel.basicConsume(&quot;xztest05&quot;, true, new DefaultConsumer(channel) {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)</span></span>
<span class="line"><span>          throws IOException {</span></span>
<span class="line"><span>        System.out.println(&quot;接收到dlx消息: &quot; + new String(body) + &quot;, 当前时间为: &quot; + LocalDateTime.now());</span></span>
<span class="line"><span>        System.out.println(&quot;路由为: &quot; + envelope.getRoutingKey());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出</span></span>
<span class="line"><span>//    channel.close();</span></span>
<span class="line"><span>//    connection.close();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div>`,82)]))}const w=s(b,[["render",q]]);export{f as __pageData,w as default};
