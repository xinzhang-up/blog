# RabbitMQ基础(二)

> 官方文档: [https://www.rabbitmq.com/getstarted.html](https://www.rabbitmq.com/getstarted.html)

## 基本概念

**rabbitmq基本结构**

![1741613076674](image/040102-RabbitMQ基础(二)/1741613076674.png)

Broker：消息队列服务进程，此进程包括两个部分：Exchange和Queue。
●Exchange：消息队列交换机，按一定的规则将消息路由转发到某个队列，对消息进行过虑。
●Queue：消息队列，存储消息的队列，消息到达队列并转发给指定的消费方。
●Producer：消息生产者，即生产方客户端，生产方客户端将消息发送到MQ。
●Consumer：消息消费者，即消费方客户端，接收MQ转发的消息。
●connection是生产者或消费者与broker的一个TCP连接
●channel是在建立在 Connection 之上的虚拟连接

## 模式

> 参考: [https://www.rabbitmq.com/getstarted.html](https://www.rabbitmq.com/getstarted.html)

### Work queues工作队列模式

![1741613181208](image/040102-RabbitMQ基础(二)/1741613181208.png)
**多个消费端共同消费同一个队列中的消息。**
1、一条消息只会被一个消费者接收；
2、rabbit采用轮询的方式将消息是平均发送给消费者的；
3、消费者在处理完某条消息后，才会收到下一条消息.

### Publish/subscribe发布订阅模式

![1741659359535](image/040102-RabbitMQ基础(二)/1741659359535.png)
每个消费者监听自己的队列,生产者将消息发给broker, 由交换机将消息转发到绑定此交换机的每个队列,每个绑定交换机的队列都将接收到消息

### Routing路由模式

![1741659393983](image/040102-RabbitMQ基础(二)/1741659393983.png)
每个消费者监听自己的队列,并且设置routingkey, 生产者将消息发给broker,由交换机根据routingkey来转发消息到指定的队列

### Topics通配符模式

![1741659426962](image/040102-RabbitMQ基础(二)/1741659426962.png)
*可以代替一个单词。
#可以替代零个或多个单词。
1、每个消费者监听自己的队列，并且设置带统配符的routingkey。
2、生产者将消息发给broker，由交换机根据routingkey来转发消息到指定的队列。

### RPC模式

![1741659489990](image/040102-RabbitMQ基础(二)/1741659489990.png)
RPC即客户端远程调用服务端的方法 ，使用MQ可以实现RPC的异步调用

## 消息如何保障100%的投递成功

### 生产端的可靠性投递

● 保障消息的成功发出
● 保障mq节点的成功接收
● 发送端收到mq节点的确认应答
● 完善的消息补偿机制
互联网大厂的解决方案:
● 消息落库, 对消息状态进行打标
![1741659548096](image/040102-RabbitMQ基础(二)/1741659548096.png)
消息的延迟投递, 做二次确认, 回调检查
![1741659558495](image/040102-RabbitMQ基础(二)/1741659558495.png)

### 消费端的幂等性

唯一ID+指纹码机制
利用Redis原子特性实现

## Java Client快速入门

> 文档: https://www.rabbitmq.com/api-guide.html#exchanges-and-queues

### 依赖

```
 <dependency>
      <groupId>com.rabbitmq</groupId>
      <artifactId>amqp-client</artifactId>
      <version>5.8.0</version>
    </dependency>
```

### Hello Rabbitmq示例

**Producer**

```
package top.xinzhang0618.consumer.quick.start;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.AMQP.BasicProperties;
import com.rabbitmq.client.AMQP.BasicProperties.Builder;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import java.io.IOException;
import java.util.HashMap;
import java.util.concurrent.TimeoutException;

/**
 * Producer
 *
 * @author xinzhang
 * @author Shenzhen Greatonce Co Ltd
 * @version 2020/2/29
 * 文档: https://www.rabbitmq.com/api-guide.html
 */
public class Producer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();

    String exchangeName = "xztest";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String routingKey = "test";

    HashMap<String, Object> map = new HashMap<>();
    map.put("1", "测试参数1");
    BasicProperties properties = new Builder()
        .deliveryMode(2)
        .contentEncoding("utf-8")
        .expiration("15000")
        .headers(map)
        .build();

    String message = "hello! rabbitmq! 2020-02-29";
    for (int i = 0; i < 5; i++) {
      channel.basicPublish(exchangeName, routingKey, properties, message.getBytes());
      System.out.println("发送消息: =====>" + message);
    }
    channel.close();
    connection.close();
  }
}

```

**Consumer**

```
package top.xinzhang0618.consumer.quick.start;


import com.rabbitmq.client.AMQP.BasicProperties;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Delivery;
import com.rabbitmq.client.Envelope;
import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.TimeoutException;

/**
 * Consumer
 *
 * @author xinzhang
 * @author Shenzhen Greatonce Co Ltd
 * @version 2020/2/29
 * 文档: https://www.rabbitmq.com/api-guide.html
 */
public class Consumer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();

    String exchangeName = "xztest";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String queueName = "xztest01";
    channel.queueDeclare(queueName, true, false, false, null);
    String routingKey = "test";
    channel.queueBind(queueName, exchangeName, routingKey);

    channel.basicConsume(queueName, true, new DefaultConsumer(channel) {
      @Override
      public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)
          throws IOException {
        System.out.println("接收到消息: ====>" + new String(body));
        System.out.println("交换机以及路由为: " + envelope.getExchange() + "---" + envelope.getRoutingKey());
        System.out.println("过期时间以及携带自定义参数为: " + properties.getExpiration() + "===" + properties.getHeaders().get("1"));
      }
    });

    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出
//    channel.close();
//    connection.close();
  }
}

```

### Confirm确认消息

消息的确认是指生产者投递消息过后, 如果broker收到消息则会给生产者一个应答; 生产者进行接收应答, 用来确认这条消息是否正常的发送到broker
关联配置(在生产端配置):
1.channel.confirmSelect();
2. channel.addConfirmListener(new ConfirmListener() {...})

```
 // 打开确认模式
channel.confirmSelect();
channel.addConfirmListener(new ConfirmListener() {...})
```

![1741660242850](image/040102-RabbitMQ基础(二)/1741660242850.png)

### 消费者应答(ACK)和发布者确认(Confirm)

参考:
[https://blog.csdn.net/cadem/article/details/69627523](https://blog.csdn.net/cadem/article/details/69627523)
[https://blog.bossma.cn/rabbitmq/consumer-ack-and-publisher-confirm/](https://blog.bossma.cn/rabbitmq/consumer-ack-and-publisher-confirm/)
●rabbitmq-server也成为Broker
●AMQP协议定义的确认(acknowledgement)是从consumer到mq的确认, 表示一条消息已经被客户端正确处理RabbitMQ扩展了AMQP协议，定义了从broker到publisher的”确认”，但将其称之为confirm。所以RabbitMQ的确认有2种，叫不同的名字，一个consumer acknowledgement，一个叫publisher confirm。
●consumer ACK是通过basic.ack实现, 默认开启, 可以在basic.consume中指定关闭
●publishConfirm是通过复用basic.ack方法实现, 默认关闭, 可以设置channel.confirmSelect开启

### Return消息机制

Return Listener用于处理一些不可路由的消息
(在发送消息时, 当前的exchange不存在或者指定的routingKey路由不到)
关联配置(在生产端配置):
1.Mandatory: 为true时, 监听器接收路由不可达消息, 为false则broker端自动删除该消息
2.channel.addReturnListener(new ReturnListener() {...})

```
// 第三个参数mandatory设为true, 监听不可达消息
channel.basicPublish(exchangeName, routingKey2, true,null, message.getBytes());
channel.addReturnListener(new ReturnListener() {...})
```

![1741660333440](image/040102-RabbitMQ基础(二)/1741660333440.png)

### Confirm/Return消息机制示例

**Producer**

```
package top.xinzhang0618.consumer.confirm;

import com.rabbitmq.client.AMQP.BasicProperties;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.ConfirmListener;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.ReturnListener;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 * Producer
 *
 * @author xinzhang
 * @author Shenzhen Greatonce Co Ltd
 * @version 2020/2/29
 * 文档: https://www.rabbitmq.com/api-guide.html
 */
public class Producer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();
    // 打开确认模式
    channel.confirmSelect();

    String exchangeName = "xztest_confirm";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String routingKey = "test.confirm.save";
    String routingKey2 = "return";

    String message = "发送确认消息! 2020-02-29";
    channel.basicPublish(exchangeName, routingKey, null, message.getBytes());
    System.out.println("发送消息-confirm: =====>" + message);
    // 第三个参数mandatory设为true, 监听不可达消息
    channel.basicPublish(exchangeName, routingKey2, true,null, message.getBytes());
    System.out.println("发送消息-return: =====>" + message);

    channel.addConfirmListener(new ConfirmListener() {
      @Override
      public void handleAck(long l, boolean b) throws IOException {
        System.out.println("------------ack------------");
      }

      @Override
      public void handleNack(long l, boolean b) throws IOException {
        System.out.println("------------no---ack------------");
      }
    });

    channel.addReturnListener(new ReturnListener() {
      @Override
      public void handleReturn(int i, String s, String s1, String s2, BasicProperties basicProperties, byte[] bytes)
          throws IOException {
        System.out.println("------------return------------");
        System.out.println("replyCode: " + i);
        System.out.println("replyText: " + s);
        System.out.println("exchange: " + s1);
        System.out.println("routingKey: " + s2);
        System.out.println("msg: " + new String(bytes));
      }
    });

//    channel.close();
//    connection.close();
  }
}

```

**Consumer**

```



消费端限流消费端限流
package top.xinzhang0618.consumer.confirm;


import com.rabbitmq.client.AMQP.BasicProperties;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 * Consumer
 *
 * @author xinzhang
 * @author Shenzhen Greatonce Co Ltd
 * @version 2020/2/29
 * 文档: https://www.rabbitmq.com/api-guide.html
 */
public class Consumer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();

    String exchangeName = "xztest_confirm";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String queueName = "xztest02";
    channel.queueDeclare(queueName, true, false, false, null);
    String routingKey = "test.#";
    channel.queueBind(queueName, exchangeName, routingKey);

    channel.basicConsume(queueName, true, new DefaultConsumer(channel) {
      @Override
      public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)
          throws IOException {
        System.out.println("接收到消息: ====>" + new String(body));
        System.out.println("交换机以及路由为: " + envelope.getExchange() + "---" + envelope.getRoutingKey());
      }
    });

    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出
//    channel.close();
//    connection.close();
  }
}

```

### 消费端限流

Rabbitmq提供了一种qos(服务质量保证的功能), 即在非自动确认消息的前提下, 如果一定数目的消息(通过基于consume或者channel设置qos的值)未被确认前, 不进行消费新的消息
关联配置(在消费端设置):
1.关闭autoACK
2.设置qos

```
 // 参数: 限制消费的消息大小(为0则不作限制), 限制一次消费的消息的数量, 限流策略是channel(true)还是consumer(false)
channel.basicQos(0, 1, false);
channel.basicConsume(queueName, true, new DefaultConsumer(channel) {...})
```

### Ack与消息限流机制示例

**Producer**

```
public class Producer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();
    // 打开确认模式
    channel.confirmSelect();

    String exchangeName = "xztest_ack";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String routingKey = "test.ack.save";

    String message = "发送非自动ack消息! 2020-03-01";
    for (int i = 0; i < 5; i++) {
      channel.basicPublish(exchangeName, routingKey, null, message.getBytes());
      System.out.println("发送消息 =====>" + message);
    }
    channel.close();
    connection.close();
  }
}
```

**Consumer**

```
public class Consumer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();

    String exchangeName = "xztest_ack";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String queueName = "xztest03";
    channel.queueDeclare(queueName, true, false, false, null);
    String routingKey = "test.#";
    channel.queueBind(queueName, exchangeName, routingKey);

    // 参数: 限制消费的消息大小(为0则不作限制), 限制一次消费的消息的数量, 限流策略是channel(true)还是consumer(false)
    channel.basicQos(0, 1, false);
    // 第二个参数, 关闭autoAck
    channel.basicConsume(queueName, false, new MyConsumer(channel));

    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出
//    channel.close();
//    connection.close();
  }
}
```

**MyConsumer**

```
public class MyConsumer extends DefaultConsumer {

  private Channel channel;

  public MyConsumer(Channel channel) {
    super(channel);
    this.channel = channel;
  }

  @Override
  public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)
      throws IOException {
    System.out.println("接收到消息: ====>" + new String(body));
    System.out.println("交换机以及路由为: " + envelope.getExchange() + "---" + envelope.getRoutingKey());
    channel.basicAck(envelope.getDeliveryTag(), false);
  }
}
```

### 消息重回队列

在手动ack的情况下:

* 当投递使用的通道（或连接）被关闭时，任何没有被应答的投递（消息）将自动的重新入队列。这包括客户端丢失TCP连接，消费者应用（处理）故障，以及通道级的协议异常
* channel.basicNack()方法可以设置重回队列
  ```
   // 参数: deliveryTag, multiple, requeue
  channel.basicNack(envelope.getDeliveryTag(),false,true);
  ```


### Rabbitmq实现延迟队列

**参考: **[https://www.cnblogs.com/yinfengjiujian/p/9204600.html](https://www.cnblogs.com/yinfengjiujian/p/9204600.html)

* 消息的TTL（Time To Live）

消息的TTL就是消息的存活时间。

RabbitMQ可以对队列和消息分别设置TTL。对队列设置就是队列没有消费者连着的保留时间，也可以对每一个单独的消息做单独的设置。超过了这个时间，我们认为这个消息就死了，称之为死信。如果队列设置了，消息也设置了，那么会取小的。所以一个消息如果被路由到不同的队列中，这个消息死亡的时间有可能不一样（不同的队列设置）.

* 死信队列(DLX, Dead Letter Exchanges)

利用DLX, 当消息在一个队列中变成死信(dead message)之后, 它能被重新publish到另一个exchange, 这个exchange就是DLX.

消息变成死信的情况:

* 消息被拒绝(basic.reject/basic.nack), 并且requeue=false
* 消息TTL过期
* 队列达到最大长度

### 死信队列/延迟消息示例

**Producer**

```
public class Producer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();

    String exchangeName = "xztest_dlx";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String routingKey = "test.dlx.save";
    String message = "发送dlx消息到xztest_dlx, 消息将于10s过期! -->" + LocalDateTime.now();
    BasicProperties properties = new Builder().expiration("10000").build();
    channel.basicPublish(exchangeName, routingKey, properties, message.getBytes());
    System.out.println(message);

    channel.close();
    connection.close();
  }
}
```


**Consumer**

**代码逻辑说明: 交换机xztest_dlx绑定了xztest04(key=test.#, 过期时间为20秒), test05(key=already.*)**

1.producer以路由test.dlx.save发送过期时间为10s的消息到交换机xztest_dlx;

2.xztest01队列没有消费者, 于是在10s秒后消息过期(消息过期时间10s<队列过期时间20s);

3.xztest04将消息转发到xztest_dlx, 路由为already.ttl;

4.xztest05接收到消息并消费, 测试结果如下:

-------------------

接收到dlx消息: 发送dlx消息到xztest_dlx, 消息将于10s过期! -->2020-03-01T16:49:50.598, 当前时间为: 2020-03-01T16:50:00.652

路由为: alread.ttl

```
public class Consumer {

  public static void main(String[] args) throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("139.9.62.232");
    connectionFactory.setPort(30004);
    connectionFactory.setVirtualHost("xinzhang");
    connectionFactory.setUsername("xinzhang");
    connectionFactory.setPassword("Xinzhang123");
    Connection connection = connectionFactory.newConnection();
    Channel channel = connection.createChannel();

    String exchangeName = "xztest_dlx";
    channel.exchangeDeclare(exchangeName, "topic", true);
    String queueName = "xztest04";
    HashMap<String, Object> arguments = new HashMap<>(1);
    // 设置xztest04队列中消息的统一过期时间为20s, 若队列中消息过期, 会发送到xztest_dlx的路由为alread.ttl的队列中
    arguments.put("x-message-ttl", 20 * 1000);
    arguments.put("x-dead-letter-exchange", "xztest_dlx");
    arguments.put("x-dead-letter-routing-key", "already.ttl");
    channel.queueDeclare(queueName, true, false, false, arguments);
    String routingKey = "test.#";
    channel.queueBind(queueName, exchangeName, routingKey);

    channel.queueDeclare("xztest05", true, false, false, null);
    channel.queueBind("xztest05", exchangeName, "already.*");

    channel.basicConsume("xztest05", true, new DefaultConsumer(channel) {
      @Override
      public void handleDelivery(String consumerTag, Envelope envelope, BasicProperties properties, byte[] body)
          throws IOException {
        System.out.println("接收到dlx消息: " + new String(body) + ", 当前时间为: " + LocalDateTime.now());
        System.out.println("路由为: " + envelope.getRoutingKey());
      }
    });

    //这里关闭了代码就结束了, 回调线程也结束, 会看不到控制台输出
//    channel.close();
//    connection.close();
  }
}
```
