const kafka = {
  title: 'Apache Kafka',
  description: 'Kafka fundamentals, producer/consumer, partitions, consumer groups, and Spring Kafka integration.',
  tags: ['Kafka', 'Event-Driven', 'Messaging', 'Spring Kafka'],
  questions: [
    {
      id: 1,
      question: 'What is Apache Kafka? Explain the core concepts.',
      difficulty: 'beginner',
      asked: true,
      tags: ['Kafka', 'Core Concepts'],
      answer: `Kafka is a distributed event streaming platform. Think of it as a highly scalable, fault-tolerant message queue designed for high throughput.

Core concepts:
- Topic: a category/channel for messages (like a table in database but for events)
- Partition: a topic is split into partitions for parallelism. More partitions = more consumers can read in parallel
- Broker: a Kafka server. A Kafka cluster = multiple brokers
- Producer: publishes messages to a topic
- Consumer: reads messages from a topic
- Consumer Group: a group of consumers that together consume a topic. Each partition is consumed by exactly one consumer in a group
- Offset: position of a message in a partition. Consumers track their offset to know where they left off
- Zookeeper (Kafka < 2.8): managed cluster metadata. KRaft (Kafka 3.0+) replaced Zookeeper

In my EPLMS project at Adani, we used Kafka to process vehicle tracking events. When a vehicle checked in or out, the event was published to a Kafka topic and consumed by multiple downstream services — tracking service, billing service, and analytics service — all independently.

**Kafka vs Traditional Message Queues (RabbitMQ/ActiveMQ):** Traditional queues: messages are deleted after consumption, push-based (broker pushes to consumer), one consumer per message (competing consumers), good for task distribution. Kafka: messages are retained for days, pull-based (consumers pull at their pace), multiple consumer groups can all read the same messages independently, designed for high-throughput event streaming. Key Kafka advantage: REPLAY — consumer groups can reset offset to re-process events, which is impossible in traditional queues.

**Zookeeper in Kafka / KRaft:** Historically, Kafka required Zookeeper to manage cluster metadata: broker health, leader election for partitions, topic configuration. Zookeeper was an operational burden — separate cluster to maintain. Kafka 2.8 introduced KRaft (Kafka Raft) as preview — metadata is managed by Kafka itself using the Raft consensus algorithm. Kafka 3.3+ has KRaft as production-ready. New Kafka deployments should use KRaft (no Zookeeper required).

**Why Kafka persists to disk:** Counterintuitively, sequential disk I/O is FASTER than random memory access for large data sets. Kafka uses append-only log writes (sequential) + Linux page cache (OS caches hot data in memory). Consumer can read from cache for recent messages, disk for older ones. This also enables message retention (replay) — in-memory queues lose data when full. Kafka's throughput (millions msgs/sec) is achieved despite disk storage.`,
      code: `// Kafka Architecture Overview:
/*
  Producers → [Topic: vehicle-events (3 partitions)]
                 Partition 0: [offset 0][offset 1][offset 2]...
                 Partition 1: [offset 0][offset 1][offset 2]...
                 Partition 2: [offset 0][offset 1][offset 2]...

  Consumer Group A (tracking-service): 3 consumers, each reads 1 partition
  Consumer Group B (billing-service): 2 consumers, one reads 2 partitions
  Consumer Group C (analytics): 1 consumer reads all 3 partitions

  Each group independently tracks its own offsets!
*/

// Key properties
// Retention: messages stored for 7 days by default (configurable)
// Replication: each partition replicated across N brokers (replication.factor)
// Ordering: guaranteed within a partition, NOT across partitions
// At-least-once: default delivery guarantee
// Exactly-once: possible with transactions (Kafka 0.11+)`,
      followUp: [
        'What is the difference between Kafka and traditional message queues (RabbitMQ, ActiveMQ)?',
        'What is the role of Zookeeper in Kafka? What is KRaft?',
        'Why does Kafka persist messages to disk instead of memory?',
      ],
      tip: 'Key difference from queues: in Kafka, messages are NOT deleted after consumption. Multiple consumer groups can each read all messages. This is the "log" model.',
    },
    {
      id: 2,
      question: 'Explain Kafka partitions and consumer groups. How do you decide the number of partitions?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Kafka', 'Partitions', 'Consumer Groups'],
      answer: `Partitions are the unit of parallelism in Kafka. Think of a topic as a table and partitions as shards of that table.

Rule: A consumer group can have AT MOST as many active consumers as partitions. Extra consumers are idle.

If I have 3 partitions and 3 consumers in a group → perfect, each consumer reads 1 partition.
If I have 3 partitions and 5 consumers → 2 consumers are idle (wasted).
If I have 3 partitions and 2 consumers → 1 consumer reads 2 partitions.

Deciding partition count:
- Base it on target throughput: partitions = desired_throughput / single_partition_throughput
- Rule of thumb: start with 10-20 partitions for a new topic
- Consider consumer count: partitions >= max expected consumers
- You can increase partitions later (but with caution — message ordering by key changes)

In EPLMS, we had 6 partitions for our vehicle-events topic with 6 consumer instances. When load doubled, we added 6 more consumers and scaled to 12 partitions.

**Partition rebalancing:** Rebalancing is the process of reassigning partitions to consumers in a group. Triggered by: consumer joining the group, consumer leaving/crashing, new partitions added to topic, group coordinator changes. During rebalancing, all consumption STOPS (stop-the-world for the consumer group). Cooperative Sticky Assignor (Kafka 2.4+) minimizes disruption by reassigning only the partitions that must move. Best practice: use this assignor and tune session.timeout.ms and heartbeat.interval.ms.

**Partition leader and follower replica:** Each partition has one leader broker and N-1 follower replicas (N = replication factor). Producer always writes to the leader. Follower replicas sync from the leader (ISR = In-Sync Replicas). Consumer reads from the leader by default (Kafka 2.4+ supports rack-aware consumer reading from nearest replica). If the leader broker dies, one of the ISR followers is elected as new leader automatically.

**Consumer crash in a group:** When a consumer crashes or stops sending heartbeats, the broker detects it after session.timeout.ms (default 10s). The group coordinator triggers a rebalance — its partitions are redistributed to the remaining consumers. Since the crashed consumer didn't commit its last offset, those messages are re-read by the new assigned consumer (at-least-once delivery).`,
      code: `// Creating a topic with partitions programmatically
@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic vehicleEventsTopic() {
        return TopicBuilder.name("vehicle-events")
            .partitions(6)
            .replicas(3)           // 3 copies for fault tolerance
            .config(TopicConfig.RETENTION_MS_CONFIG, "604800000")  // 7 days
            .config(TopicConfig.COMPRESSION_TYPE_CONFIG, "lz4")   // compression
            .build();
    }
}

// Partition key determines which partition a message goes to
// Same key → always same partition → ordering guaranteed for that key!
@Service
public class VehicleEventProducer {

    @Autowired
    private KafkaTemplate<String, VehicleEvent> kafkaTemplate;

    public void publish(VehicleEvent event) {
        // Using vehicleId as partition key
        // All events for same vehicle → same partition → ordered processing
        kafkaTemplate.send("vehicle-events", event.getVehicleId(), event);
    }
}

// Consumer group configuration
@KafkaListener(
    topics = "vehicle-events",
    groupId = "tracking-service",
    concurrency = "6"  // 6 consumer threads, matches partition count
)
public void consume(VehicleEvent event, @Header(KafkaHeaders.RECEIVED_PARTITION) int partition) {
    log.info("Processing from partition {}: {}", partition, event);
    trackingService.updateLocation(event);
}`,
      followUp: [
        'What is partition rebalancing? When does it happen?',
        'What is a partition leader? What is a follower replica?',
        'What happens if a consumer in a group crashes?',
      ],
      tip: 'Rebalancing happens when consumers join/leave the group or partitions change. During rebalance, consumption PAUSES. This is why you should minimize rebalances — use Cooperative Sticky Assignor.',
    },
    {
      id: 3,
      question: 'What are Kafka delivery guarantees? At-least-once vs exactly-once.',
      difficulty: 'advanced',
      asked: true,
      tags: ['Kafka', 'Delivery', 'Exactly-Once'],
      answer: `Kafka supports three delivery semantics:

At-most-once: messages may be lost, never duplicated. Fire and forget. Used only for non-critical events like analytics.

At-least-once (default): messages are never lost but may be duplicated. If consumer crashes after processing but before committing offset, it re-reads and reprocesses.

Exactly-once: no loss, no duplicates. Kafka 0.11+ supports this via idempotent producers + transactions. Most complex to implement but sometimes necessary for financial transactions.

In practice, I mostly use at-least-once with idempotent consumers. The consumer de-duplicates using a unique event ID. This is simpler than Kafka transactions and handles most real-world cases.

In MetLife, we used exactly-once for premium payment events — can't charge a customer twice for the same policy!

**Idempotent producer vs Transactional producer:** Idempotent producer (enable.idempotence=true): prevents duplicate messages from producer RETRIES. Each message gets a sequence number; broker deduplicates within a single producer session. Prevents duplicates caused by network retries. Does NOT prevent duplicates across producer restarts. Transactional producer: enables atomic writes across multiple partitions/topics AND atomic read-process-write (consume-transform-produce) operations. More complex — requires transactional.id and handling zombie instances.

**Dead Letter Topic (DLT):** When a message fails processing after all retries (poison pill), instead of blocking the consumer, the message is sent to a separate Dead Letter Topic for investigation. Spring Kafka's DeadLetterPublishingRecoverer handles this automatically. DLT naming convention: original-topic-name.DLT. Ops teams can inspect, fix the issue, and re-publish from DLT. Never discard failed messages — always route to DLT.

**Consumer offset commit strategy:** auto-commit (default): Kafka auto-commits offset every 5s (enable.auto.commit=true). Risk: if consumer crashes after auto-commit but before processing, messages are lost. Manual commit (recommended): commit only AFTER successful processing. MANUAL_IMMEDIATE: commit after each record. MANUAL: batch commit. For exactly-once: use Kafka transactions to atomically process and commit offset.`,
      code: `// At-least-once with manual offset commit (Spring Kafka)
@KafkaListener(topics = "payment-events", groupId = "payment-processor")
public void process(ConsumerRecord<String, PaymentEvent> record,
                   Acknowledgment ack) {
    try {
        paymentService.process(record.value());
        ack.acknowledge();  // Commit only after successful processing
    } catch (RetryableException e) {
        // Don't ack — will reprocess
        throw e;
    } catch (FatalException e) {
        // Ack to skip — send to dead letter topic
        ack.acknowledge();
        deadLetterProducer.send("payment-events-dlt", record.value());
    }
}

# application.properties for manual commit
spring.kafka.listener.ack-mode=MANUAL_IMMEDIATE
spring.kafka.consumer.enable-auto-commit=false

// Idempotent producer (prevents duplicate messages from producer retries)
spring.kafka.producer.properties.enable.idempotence=true
spring.kafka.producer.acks=all
spring.kafka.producer.retries=3
spring.kafka.producer.properties.max.in.flight.requests.per.connection=5

// Exactly-once with Kafka transactions
@Transactional("kafkaTransactionManager")
public void processWithExactlyOnce(OrderEvent event) {
    // Both operations succeed or both fail atomically
    orderRepository.save(convertToOrder(event));                    // DB write
    kafkaTemplate.send("order-confirmed", event.getOrderId(), event); // Kafka write
}`,
      followUp: [
        'What is the difference between idempotent producer and transactional producer?',
        'What is a dead letter topic? When do you use it?',
        'What is consumer offset commit strategy?',
      ],
      tip: 'Dead Letter Topic (DLT) is for messages that failed processing after all retries. Instead of blocking the consumer, send to DLT for manual inspection. Use spring-kafka\'s SeekToCurrentErrorHandler.',
    },
    {
      id: 4,
      question: 'Explain Kafka consumer lag and how you monitor it',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Kafka', 'Monitoring', 'Performance'],
      answer: `Consumer lag is the difference between the latest message offset in a partition and the last offset committed by the consumer group. High lag means consumers are falling behind producers.

Lag = current_end_offset - committed_consumer_offset

In my EPLMS project, our Kafka consumer lag was monitored via Confluent Control Center and Azure Event Hub metrics. We had an alert set at 10,000 messages lag. When our Kafka consumer processing got slow due to a DB query issue, the lag shot up — the alert fired and we fixed it within 15 minutes.

Causes of high lag:
- Slow consumer processing (heavy DB operations, slow downstream APIs)
- Too few consumers (need more partitions + consumers)
- Consumer rebalancing causing pause
- Deserialization errors causing retries`,
      code: `# Check consumer lag via Kafka CLI
kafka-consumer-groups.sh \\
  --bootstrap-server localhost:9092 \\
  --describe \\
  --group tracking-service

# Output:
# GROUP              TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# tracking-service   vehicle-events  0          1000            1500            500
# tracking-service   vehicle-events  1          2000            2000            0
# tracking-service   vehicle-events  2          1800            2100            300

// Monitoring lag programmatically
@Component
public class KafkaLagMonitor {

    @Autowired
    private ConsumerFactory<String, ?> consumerFactory;

    @Scheduled(fixedDelay = 30000)  // every 30 seconds
    public void checkLag() {
        try (KafkaConsumer<String, ?> consumer =
                 (KafkaConsumer<String, ?>) consumerFactory.createConsumer("monitor-group", "monitor")) {

            Map<TopicPartition, Long> endOffsets = consumer.endOffsets(
                consumer.partitionsFor("vehicle-events").stream()
                    .map(p -> new TopicPartition(p.topic(), p.partition()))
                    .collect(Collectors.toList())
            );

            endOffsets.forEach((tp, endOffset) -> {
                long committedOffset = getCommittedOffset(tp);
                long lag = endOffset - committedOffset;
                if (lag > 10000) {
                    alertService.send("HIGH LAG on " + tp + ": " + lag);
                }
                metrics.gauge("kafka.consumer.lag", lag, "partition", tp.toString());
            });
        }
    }
}

# Spring Boot Actuator + Micrometer for Kafka metrics
management.metrics.binders.kafka.enabled=true`,
      followUp: [
        { question: 'How do you handle a consumer that is stuck and causing lag to grow?', answer: `First, identify which consumer instance and partition has the highest lag (kafka-consumer-groups.sh --describe). Common causes: (1) Consumer thread blocked on a slow DB call or external API — add timeouts and circuit breakers. (2) Poison pill message causing infinite retry — add error handler with max.poll.interval.ms and send to DLT after N retries. (3) Too few consumer instances — scale horizontally, add partitions if needed. (4) GC pause on consumer JVM — tune heap and GC. If the consumer is fully stuck (not polling), Kafka's session timeout detects it and triggers rebalance to reassign those partitions to healthy consumers.` },
        { question: 'What is the difference between earliest and latest auto.offset.reset?', answer: `auto.offset.reset only applies when a consumer group has NO committed offset (first time connecting, or offset expired). earliest: start consuming from the OLDEST available message (beginning of log). Use for: new consumer that should process all historical data. latest: start consuming from NEW messages only (skip existing). Use for: a new consumer that only cares about future events, not history. In production, latest is the safer default for most use cases — you don't want to replay weeks of history unexpectedly. Set earliest explicitly when you need to replay.` },
      ],
    },
    {
      id: 5,
      question: 'How did you use Kafka in EPLMS? Describe the architecture.',
      difficulty: 'advanced',
      asked: true,
      tags: ['Kafka', 'Real Project', 'Architecture'],
      answer: `In the EPLMS project at Adani Groups, we had a real-time vehicle tracking and logistics automation system that processed 10,000+ events per day.

The Kafka architecture:

Vehicle events (check-in, inspection, loading, checkout) were produced by REST API calls from vehicle operators using mobile apps or terminal kiosks.

Topics we used:
- vehicle-raw-events: all raw events from the API (6 partitions)
- vehicle-processed-events: after validation and enrichment (6 partitions)
- vehicle-alerts: for anomalies — overloaded truck, late arrival (3 partitions)
- notification-events: for SMS/email notifications (3 partitions)

Flow:
1. Operator scans vehicle → Mobile app calls REST API
2. API service validates and publishes to vehicle-raw-events with vehicleId as key (ensures all events for same vehicle go to same partition — ordering!)
3. Event Processor service consumes raw events, validates, enriches with vehicle master data from DB, publishes to vehicle-processed-events
4. Multiple downstream consumers: tracking service (updates location), billing service (computes charges), analytics service (dashboards)

This reduced manual effort by 40% and API response time was optimized to under 200ms even at peak load.`,
      code: `// EPLMS Kafka Architecture Code

// 1. API Service publishes vehicle event
@RestController
@RequestMapping("/api/v1/vehicle")
public class VehicleEventController {

    @Autowired
    private VehicleEventProducer producer;

    @PostMapping("/check-in")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody @Valid CheckInRequest req) {
        VehicleRawEvent event = VehicleRawEvent.builder()
            .vehicleId(req.getVehicleId())
            .eventType(EventType.CHECK_IN)
            .timestamp(Instant.now())
            .location(req.getLocation())
            .driverId(req.getDriverId())
            .build();

        producer.publishRawEvent(event);  // async Kafka publish

        return ResponseEntity.accepted()
            .body(new CheckInResponse("Event accepted, processing..."));
    }
}

@Service
public class VehicleEventProducer {

    @Autowired
    private KafkaTemplate<String, VehicleRawEvent> kafkaTemplate;

    public CompletableFuture<SendResult<String, VehicleRawEvent>> publishRawEvent(VehicleRawEvent event) {
        return kafkaTemplate.send("vehicle-raw-events",
            event.getVehicleId(),  // partition key: same vehicle → same partition
            event)
            .completable()
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event for vehicle {}", event.getVehicleId(), ex);
                    // fallback: save to DB for retry
                    failedEventRepository.save(event);
                }
            });
    }
}

// 2. Event Processor consumes and enriches
@Service
public class VehicleEventProcessor {

    @KafkaListener(topics = "vehicle-raw-events", groupId = "event-processor", concurrency = "6")
    public void processRawEvent(VehicleRawEvent rawEvent, Acknowledgment ack) {
        try {
            // Enrich with vehicle master data
            Vehicle vehicle = vehicleRepository.findById(rawEvent.getVehicleId())
                .orElseThrow(() -> new VehicleNotFoundException(rawEvent.getVehicleId()));

            VehicleProcessedEvent processed = VehicleProcessedEvent.builder()
                .rawEvent(rawEvent)
                .vehicleType(vehicle.getType())
                .ownerName(vehicle.getOwnerName())
                .maxLoadCapacity(vehicle.getMaxLoadCapacity())
                .processedAt(Instant.now())
                .build();

            processedEventProducer.publish(processed);
            ack.acknowledge();

        } catch (VehicleNotFoundException e) {
            log.warn("Vehicle not found: {}", rawEvent.getVehicleId());
            // Send to DLT for manual review
            ack.acknowledge();
        }
    }
}`,
      followUp: [
        { question: 'How did you ensure ordered processing of events for the same vehicle?', answer: `We used vehicleId as the partition key for all vehicle event topics. Kafka guarantees that all messages with the same key go to the same partition, and a partition is consumed by only one consumer in a group. This means all events for vehicle V001 always go to partition 3, always consumed by consumer instance 3 — in order. Without a consistent partition key, events for the same vehicle could land on different partitions and be processed out of order.` },
        { question: 'How did you handle failures in the event processing pipeline?', answer: `Multiple layers: (1) Kafka acknowledgment is manual — consumer only commits offset after successful processing. If processing fails, the offset is not committed and the message is retried. (2) After max retries (3 attempts), the message is routed to a Dead Letter Topic (vehicle-raw-events.DLT) for manual inspection and replay. (3) VehicleNotFoundException — vehicle not found in DB — is a non-retryable error (always fails), so it goes directly to DLT. (4) Producer failures (Kafka unavailable) are caught and the event is saved to a DB fallback table for async retry.` },
        { question: 'How did you scale the system to handle load spikes?', answer: `The system was designed for horizontal scaling from day one. (1) Consumer instances match partition count: 6 partitions + 6 consumer instances (1:1). (2) When load doubled, we increased to 12 partitions and added 6 more consumer instances — zero downtime. The partition key strategy (vehicleId) preserved ordering through the scaling operation. (3) The most impactful performance fix was adding an in-memory cache for vehicle master data. Fetching vehicle data from DB on every event (200ms) was causing lag. With ConcurrentHashMap cache + 5-minute TTL, processing dropped to 15ms.` },
      ],
      tip: 'Using vehicleId as partition key is the key insight for ordering. Same vehicle → same partition → single consumer processes in order. This is the heart of the design.',
    },
  ],
}

export default kafka
