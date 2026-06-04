const rabbitmq = {
  title: 'RabbitMQ & AMQP',
  description: 'RabbitMQ concepts, exchange types, Spring AMQP integration, message acknowledgment, dead-letter queues, and when to choose RabbitMQ vs Kafka.',
  tags: ['RabbitMQ', 'Spring AMQP', 'Exchange Types', 'DLQ', 'Durability'],
  questions: [
    {
      id: 'rabbit_q1',
      question: 'What is RabbitMQ and how does it differ architecturally from Kafka?',
      difficulty: 'beginner',
      tags: ['RabbitMQ', 'Kafka', 'Comparison'],
      answer: `RabbitMQ is a traditional message broker implementing the AMQP protocol. It routes messages from producers through exchanges to queues, from which consumers receive them. Messages are deleted from the queue once acknowledged by the consumer.

Kafka is a distributed log — messages are appended to a persistent log (topic partition) and retained for a configurable duration (days/weeks). Consumers track their read position (offset) and can reread messages from any point.

Key architectural differences:

Message retention:
- RabbitMQ: messages are ephemeral — removed on acknowledgment (or after TTL). No replay.
- Kafka: messages persist for days/weeks. Multiple consumer groups can independently read the same messages. Replay is possible from any offset.

Routing:
- RabbitMQ: rich routing via exchange types (direct, topic, fanout, headers) and binding keys. Messages are pushed to matching queues.
- Kafka: partition-based. Producers choose partition by key or round-robin. No content-based routing.

Consumer model:
- RabbitMQ: push-based. The broker pushes messages to consumers. Consumer declares prefetch count (max unacked messages).
- Kafka: pull-based. Consumers poll at their own pace. Consumer groups partition load.

Throughput:
- Kafka: orders of magnitude higher throughput (millions/second per node) for streaming scenarios.
- RabbitMQ: typically 10k–100k messages/second per node — sufficient for most enterprise task queues.

Choose RabbitMQ for: task queues, work distribution, complex routing logic, request-reply patterns, when replay is not needed.
Choose Kafka for: event streaming, audit logs that must be replayable, event sourcing, high-throughput ingestion pipelines.`,
      followUp: {
        question: 'Can you give an example of when you would choose RabbitMQ over Kafka?',
        answer: `An email notification service that processes email jobs from multiple upstream services. Each email job should be processed by exactly one worker instance (no duplication), processed in order per recipient is not critical, jobs should be retried up to 3 times on failure with a dead-letter queue for permanent failures, and there is no requirement to replay sent emails. RabbitMQ is ideal here — the work queue pattern (multiple workers sharing one queue), built-in retry via negative acknowledgment (NACK with requeue=true), and dead-letter exchange for failed jobs. Kafka would work but adds operational complexity (managing offsets, partitions) for a problem that doesn't need event streaming or replay.`
      }
    },
    {
      id: 'rabbit_q2',
      question: 'Explain RabbitMQ exchange types — Direct, Topic, Fanout, and Headers.',
      difficulty: 'intermediate',
      tags: ['RabbitMQ', 'Exchange Types', 'Routing'],
      answer: `The exchange receives messages from producers and routes them to queues based on binding rules and the message's routing key.

Direct Exchange — routes a message to queues whose binding key exactly matches the message's routing key. One-to-one routing.

Exchange: "notifications.direct"
Binding: queue "email-queue"   ← routing key "email"
Binding: queue "sms-queue"     ← routing key "sms"

Producer sends message with routingKey="email" → only email-queue receives it.
Use for: routing specific event types to specific queues.

Topic Exchange — routes based on pattern matching using * (one word) and # (zero or more words) in the binding key.

Exchange: "orders.topic"
Binding: queue "order-all"    ← routing key "#" (all orders)
Binding: queue "order-us"     ← routing key "*.us.#"
Binding: queue "payment-us"   ← routing key "payment.us.*"

Producer sends "payment.us.success" → matches "payment.us.*" and "#". Flexible topic-based routing.
Use for: fine-grained event filtering where consumers subscribe to relevant patterns.

Fanout Exchange — ignores routing key entirely. Broadcasts a message to ALL bound queues simultaneously.

Exchange: "user.events.fanout"
Binding: queue "audit-log-queue"
Binding: queue "analytics-queue"
Binding: queue "cache-invalidation-queue"

One "user.updated" event goes to all three queues simultaneously.
Use for: event broadcasting to multiple independent consumers.

Headers Exchange — routes based on message header attributes (key-value pairs) instead of routing key. Rarely used in practice — Topic Exchange is more common for pattern-based routing.`,
      followUp: {
        question: 'What is the default exchange in RabbitMQ?',
        answer: `The default exchange is a direct exchange with no name (empty string). Every queue is automatically bound to the default exchange with a binding key equal to the queue name. So to send directly to a queue named "email-queue", use exchange="" and routingKey="email-queue" — you don't need to declare an explicit binding. This is a convenience for simple point-to-point messaging where you don't need custom exchange topology. In Spring AMQP, rabbitTemplate.convertAndSend("email-queue", message) uses the default exchange implicitly.`
      }
    },
    {
      id: 'rabbit_q3',
      question: 'How do you integrate RabbitMQ with Spring Boot using Spring AMQP?',
      difficulty: 'intermediate',
      tags: ['RabbitMQ', 'Spring AMQP', 'Spring Boot'],
      answer: `Spring AMQP (spring-boot-starter-amqp) provides RabbitTemplate for sending and @RabbitListener for consuming.

Configuration:

# application.yml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    listener:
      simple:
        acknowledge-mode: manual  # or auto
        prefetch: 10              # max unacked messages per consumer

Declare topology (exchange, queue, binding):

@Configuration
public class RabbitConfig {

    public static final String ORDER_EXCHANGE  = "order.exchange";
    public static final String ORDER_QUEUE     = "order.processing.queue";
    public static final String ORDER_ROUTING   = "order.created";
    public static final String ORDER_DLQ       = "order.dead-letter.queue";
    public static final String DLX             = "order.dlx";

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(ORDER_EXCHANGE, true, false);
    }

    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable(ORDER_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX)
            .withArgument("x-dead-letter-routing-key", "dead-letter")
            .withArgument("x-message-ttl", 300000)   // 5 min TTL
            .build();
    }

    @Bean
    public Binding orderBinding() {
        return BindingBuilder.bind(orderQueue()).to(orderExchange()).with(ORDER_ROUTING);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(ORDER_DLQ).build();
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX);
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with("dead-letter");
    }
}

Producer:

@Service
public class OrderEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        rabbitTemplate.convertAndSend(RabbitConfig.ORDER_EXCHANGE, RabbitConfig.ORDER_ROUTING, event);
    }
}

Consumer with manual acknowledgment:

@Service
public class OrderProcessingConsumer {

    @RabbitListener(queues = RabbitConfig.ORDER_QUEUE, ackMode = "MANUAL")
    public void processOrder(OrderCreatedEvent event, Channel channel,
                             @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        try {
            orderService.process(event);
            channel.basicAck(deliveryTag, false);     // acknowledge success
        } catch (RecoverableException e) {
            channel.basicNack(deliveryTag, false, true);  // nack + requeue
        } catch (PermanentException e) {
            channel.basicNack(deliveryTag, false, false); // nack + no requeue → DLQ
        }
    }
}`,
      followUp: {
        question: 'What is the prefetch setting and why does it matter for consumer throughput?',
        answer: `Prefetch (also called QoS — Quality of Service) limits how many unacknowledged messages RabbitMQ delivers to a consumer at a time. With prefetch=1, the consumer gets one message at a time — only after acknowledging (ACK) does it receive the next. This is the fairest distribution — a slow consumer won't accumulate a backlog while fast consumers are idle. With prefetch=10, the consumer receives 10 messages, which increases throughput because the consumer can process multiple messages before the ACK round-trip, but a slow consumer can hold 10 messages away from faster consumers. Too high a prefetch on memory-intensive consumers can cause OOM if each message requires significant in-memory processing. Start with prefetch=10 for most scenarios and tune based on throughput vs fairness requirements.`
      }
    },
    {
      id: 'rabbit_q4',
      question: 'What is a Dead Letter Queue (DLQ) in RabbitMQ and how do you use it for error handling?',
      difficulty: 'intermediate',
      tags: ['RabbitMQ', 'DLQ', 'Error Handling'],
      answer: `A Dead Letter Queue receives messages that cannot be successfully processed — messages that are negatively acknowledged (NACK) without requeue, messages that exceed their TTL, or messages rejected because the target queue is at capacity.

DLQ configuration uses a Dead Letter Exchange (DLX). When a message "dies," RabbitMQ republishes it to the DLX, which routes it to the DLQ.

Why DLQ matters:
- Isolates problematic messages so they don't block queue processing
- Preserves failed messages for investigation and replay
- Provides a feedback loop for identifying systematic failures

Complete retry + DLQ pattern:

@Configuration
public class RetryConfig {

    // Queue with retry configuration
    @Bean
    public Queue mainQueue() {
        return QueueBuilder.durable("order.queue")
            .withArgument("x-dead-letter-exchange", "order.retry.exchange")
            .build();
    }

    // Retry queue with TTL — messages sit here before being republished to main queue
    @Bean
    public Queue retryQueue() {
        return QueueBuilder.durable("order.retry.queue")
            .withArgument("x-dead-letter-exchange", "order.main.exchange")
            .withArgument("x-message-ttl", 5000)    // retry after 5 seconds
            .build();
    }

    // Final DLQ — arrives after maxRetries exhausted
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable("order.dlq").build();
    }
}

@Service
public class OrderConsumer {
    private static final int MAX_RETRIES = 3;

    @RabbitListener(queues = "order.queue")
    public void consume(Message message, Channel channel,
                        @Header(AmqpHeaders.DELIVERY_TAG) long tag) throws IOException {
        Integer retryCount = (Integer) message.getMessageProperties()
            .getHeaders().getOrDefault("x-retry-count", 0);

        try {
            processMessage(message);
            channel.basicAck(tag, false);
        } catch (Exception e) {
            if (retryCount < MAX_RETRIES) {
                // Add retry count header and send to retry queue
                MessageProperties props = MessagePropertiesBuilder.newInstance()
                    .setHeader("x-retry-count", retryCount + 1)
                    .build();
                Message retryMsg = MessageBuilder.withBody(message.getBody())
                    .andProperties(props).build();
                rabbitTemplate.send("order.retry.exchange", "", retryMsg);
                channel.basicAck(tag, false);  // ack original
            } else {
                // Max retries exhausted → DLQ
                channel.basicNack(tag, false, false);
            }
        }
    }
}

Monitor DLQ size in Grafana or CloudWatch — DLQ message count > 0 should trigger an alert.`,
      followUp: {
        question: 'How do you replay messages from a DLQ back to the main queue?',
        answer: `Manual replay: consume messages from the DLQ (via RabbitMQ management UI or a small script), fix the root cause of failure, and republish to the main queue. In Spring AMQP, write a one-shot CommandLineRunner that reads from the DLQ and republishes. Automated replay: set up a separate listener on the DLQ that publishes back to the main queue after a longer delay (e.g., 30 minutes) — this is the "mortuary" pattern where dead messages get a second chance after an extended wait. Always add logging and metrics when replaying so you can track replay success vs. continued failure. Never replay messages that fail due to data corruption — investigate and fix the data first.`
      }
    },
    {
      id: 'rabbit_q5',
      question: 'How do you implement the request-reply pattern with RabbitMQ in Spring Boot?',
      difficulty: 'advanced',
      tags: ['RabbitMQ', 'Request-Reply', 'RPC'],
      answer: `The request-reply pattern allows a producer to send a message and wait for a response — essentially RPC over a message queue. RabbitMQ supports this with the replyTo and correlationId message properties.

Spring AMQP handles this automatically with RabbitTemplate.convertSendAndReceive():

@Service
public class PricingClient {
    private final RabbitTemplate rabbitTemplate;

    public PricingResponse getPrice(PricingRequest request) {
        // Sends to pricing.request.queue, waits for reply on auto-generated reply queue
        return (PricingResponse) rabbitTemplate.convertSendAndReceive(
            "pricing.exchange",
            "pricing.request",
            request,
            message -> {
                message.getMessageProperties().setCorrelationId(UUID.randomUUID().toString());
                return message;
            }
        );
    }
}

Server side:

@Service
public class PricingService {

    @RabbitListener(queues = "pricing.request.queue")
    @SendTo  // sends return value to replyTo queue from the incoming message
    public PricingResponse handlePricing(PricingRequest request) {
        return calculatePrice(request);
    }
}

Internally, RabbitTemplate uses a DirectReplyTo or a declared reply queue. The correlationId matches the request to the response when multiple requests are in flight simultaneously.

Limitations:
- Synchronous waiting (the calling thread blocks)
- Timeout handling required (rabbitTemplate.setReplyTimeout(5000))
- Tight coupling via synchronous wait — if the pricing service is slow, all calling threads block

Better alternative for most microservice scenarios: use an async approach — publish the request event, have the consumer publish a response event to a dedicated queue per correlation ID or use WebSocket/SSE to notify the original requester. The synchronous request-reply pattern is best suited for internal service calls where low latency is required and blocking is acceptable.`,
      followUp: {
        question: 'What is the difference between AMQP 0-9-1 and AMQP 1.0?',
        answer: `AMQP 0-9-1 is the protocol that RabbitMQ implements — it defines the exchange-queue-binding model, message acknowledgment, and channel multiplexing. AMQP 1.0 is a completely different protocol (despite the similar name) standardized by OASIS — it's more of a wire protocol standard focused on interoperability between different brokers. AMQP 1.0 has a fundamentally different topology model with no exchanges or bindings — instead it has addresses. AMQP 1.0 is implemented by Azure Service Bus, ActiveMQ Artemis, and others. RabbitMQ has a plugin for AMQP 1.0 but its native protocol remains 0-9-1. For Spring Boot with RabbitMQ, you use AMQP 0-9-1 via Spring AMQP. For Azure Service Bus integration, Spring provides spring-cloud-azure-starter-servicebus which uses AMQP 1.0.`
      }
    },
    {
      id: 'rabbit_q6',
      question: 'How do you ensure message durability and prevent message loss in RabbitMQ?',
      difficulty: 'intermediate',
      tags: ['RabbitMQ', 'Durability', 'Reliability'],
      answer: `Message durability requires three settings to be correct simultaneously. If any one is missing, messages can be lost on broker restart or consumer failure.

1. Durable Exchange — must survive broker restart:
new DirectExchange("order.exchange", true, false); // durable=true

2. Durable Queue — queue definition persists across restarts:
QueueBuilder.durable("order.queue").build(); // durable queue

3. Persistent Message — message body is written to disk:
rabbitTemplate.convertAndSend(exchange, routingKey, message, m -> {
    m.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
    return m;
});

// Or set globally on the template:
rabbitTemplate.setDefaultDeliveryMode(MessageDeliveryMode.PERSISTENT);

4. Publisher Confirms — confirm the broker has received and persisted the message:
@Bean
public RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
    RabbitTemplate template = new RabbitTemplate(factory);
    template.setConfirmCallback((correlationData, ack, cause) -> {
        if (!ack) {
            log.error("Message not confirmed by broker: {}", cause);
            // retry or log for manual investigation
        }
    });
    template.setReturnsCallback(returned -> {
        log.error("Message returned (no matching queue): {}", returned.getMessage());
    });
    return template;
}

factory.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
factory.setPublisherReturns(true);

5. Manual Consumer Acknowledgment — only ACK after successful processing:
channel.basicAck(deliveryTag, false); // success
channel.basicNack(deliveryTag, false, true); // failure, requeue

Without manual ACK, using auto-acknowledge means the message is removed from the queue when delivered — if the consumer crashes mid-processing, the message is lost permanently.

Trade-off: persistent messages have higher latency because disk writes are involved. For high-throughput non-critical events, transient messages are acceptable.`,
      followUp: {
        question: 'What are RabbitMQ quorum queues and when should you use them over classic queues?',
        answer: `Quorum queues are RabbitMQ's modern replicated queue type based on the Raft consensus algorithm. Unlike classic mirrored queues (which are being phased out), quorum queues guarantee that a message acknowledged by the leader is replicated to a majority of nodes before the ACK is returned to the publisher — so no message is lost even if nodes fail, as long as a majority survive. Classic mirrored queues had race conditions where a leader failure could lose acknowledged messages if the replica hadn't fully synced. Use quorum queues for: production workloads requiring strong message durability guarantees, financial transactions, critical notifications — any scenario where losing a message is unacceptable. Quorum queues have slightly higher write latency due to quorum ACK. For non-critical event publishing where some loss is tolerable, classic durable queues are simpler.`
      }
    },
  ],
}

export default rabbitmq
