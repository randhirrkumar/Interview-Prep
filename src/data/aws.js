const aws = {
  title: 'AWS Core',
  description: 'Core AWS services for Java backend developers — EC2, S3, RDS, SQS/SNS, Lambda, ECS/EKS, IAM, and VPC essentials for cloud-native microservices.',
  tags: ['AWS', 'S3', 'Lambda', 'ECS', 'IAM', 'SQS', 'RDS'],
  questions: [
    {
      id: 'aws_q1',
      question: 'Walk me through the core AWS services a Java backend developer needs to know.',
      difficulty: 'beginner',
      tags: ['AWS', 'Overview'],
      answer: `For a Java backend developer, the essential AWS services fall into a few categories.

Compute:
- EC2 (Elastic Compute Cloud) — virtual machines where you deploy Spring Boot JARs traditionally. You choose instance type (CPU/RAM), AMI (OS image), and security groups (firewall rules).
- ECS (Elastic Container Service) — run Docker containers managed by AWS. Fargate mode removes server management — you only specify CPU/memory for each container task.
- EKS (Elastic Kubernetes Service) — managed Kubernetes. AWS manages the control plane; you manage worker nodes or use Fargate.
- Lambda — serverless functions. Run code without provisioning servers. Pay per invocation. Ideal for event-driven processing (S3 event triggers, SQS message processing).

Storage:
- S3 (Simple Storage Service) — object storage for files, images, documents, backups. Virtually unlimited capacity.
- EBS (Elastic Block Store) — block storage attached to EC2 instances like a hard drive. Not accessible from multiple instances simultaneously.
- RDS (Relational Database Service) — managed MySQL, PostgreSQL, Aurora. AWS handles backups, patching, failover.

Messaging:
- SQS (Simple Queue Service) — managed message queue. Decouples producers and consumers.
- SNS (Simple Notification Service) — pub/sub. Fans out a message to multiple subscribers (SQS, Lambda, HTTP endpoints, email).

Networking:
- VPC (Virtual Private Cloud) — your private network in AWS. Subnets, route tables, internet gateways, NAT gateways.
- API Gateway — HTTP API endpoint that routes to Lambda or backend services. Handles auth, rate limiting, SSL termination.

IAM — Identity and Access Management. Controls who can do what to which AWS resources.`,
      followUp: {
        question: 'What is the difference between ECS and EKS and when do you choose each?',
        answer: `ECS is AWS's proprietary container orchestration service — simpler to set up and operate, tightly integrated with other AWS services (ALB, IAM, CloudWatch, ECR). Choose ECS when your team is AWS-centric and doesn't need Kubernetes-specific features (custom operators, CRDs, Helm charts). EKS is managed Kubernetes — you get the full Kubernetes ecosystem (Helm, Istio, ArgoCD, Prometheus Operator). Choose EKS when you need Kubernetes portability across clouds, your team has Kubernetes expertise, or you use Kubernetes-native tooling. For most early-stage or AWS-first teams, ECS Fargate is simpler and cheaper to operate. For enterprise teams running complex microservices with Kubernetes-native tooling, EKS is the better fit.`
      }
    },
    {
      id: 'aws_q2',
      question: 'What is S3 and how do you integrate it with a Spring Boot application?',
      difficulty: 'beginner',
      tags: ['AWS', 'S3', 'Spring Boot'],
      answer: `S3 (Simple Storage Service) is AWS's object storage — you store objects (files) in buckets. Each object has a key (path), content, and metadata. S3 is virtually infinitely scalable, 99.999999999% (11 nines) durable, and the standard for storing application files, documents, images, reports, and backups.

Integration with Spring Boot using AWS SDK v2:

// Dependency: software.amazon.awssdk:s3
@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucketName;

    public S3Service(S3Client s3Client, @Value("\${aws.s3.bucket}") String bucketName) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    public String uploadFile(String key, InputStream content, long contentLength, String contentType) {
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build(),
            RequestBody.fromInputStream(content, contentLength)
        );
        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
    }

    public InputStream downloadFile(String key) {
        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(
            GetObjectRequest.builder().bucket(bucketName).key(key).build()
        );
        return response;
    }

    public void deleteFile(String key) {
        s3Client.deleteObject(b -> b.bucket(bucketName).key(key));
    }

    // Generate a pre-signed URL for temporary direct client access
    public String generatePresignedUrl(String key, Duration expiry) {
        try (S3Presigner presigner = S3Presigner.create()) {
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiry)
                .getObjectRequest(b -> b.bucket(bucketName).key(key))
                .build();
            return presigner.presignGetObject(presignRequest).url().toString();
        }
    }
}

// Bean configuration with IAM role (no hardcoded credentials)
@Bean
public S3Client s3Client() {
    return S3Client.builder()
        .region(Region.AP_SOUTH_1)
        .credentialsProvider(DefaultCredentialsProvider.create())
        .build();
}

DefaultCredentialsProvider picks up credentials from the environment: IAM role on EC2/ECS, environment variables locally, or ~/.aws/credentials for local dev.

Never hardcode AWS access keys in application.yml — use IAM roles and instance profiles.`,
      followUp: {
        question: 'What is a pre-signed URL and why is it preferred over proxying through your backend?',
        answer: `A pre-signed URL is a temporary URL with embedded AWS signature that grants anyone who has it access to a specific S3 object for a limited time (minutes to hours). Instead of proxying file downloads through your backend (client → backend → S3 → backend → client), you generate a pre-signed URL and redirect the client to download directly from S3. Benefits: your backend doesn't handle large file bytes (saves bandwidth and memory), S3 serves the file from the nearest edge, and the client gets full S3 download speed. The URL expires automatically, so there's no permanent public access. Used for uploads too — a pre-signed PUT URL lets clients upload directly to S3 without your backend touching the file bytes.`
      }
    },
    {
      id: 'aws_q3',
      question: 'Explain SQS vs SNS. When would you use each in a Spring Boot microservice architecture?',
      difficulty: 'intermediate',
      tags: ['AWS', 'SQS', 'SNS', 'Messaging'],
      answer: `SQS (Simple Queue Service) is a point-to-point message queue. A producer sends a message to a queue; one consumer receives and processes it. The message is then deleted from the queue. If processing fails, the message returns to the queue for retry (up to a configured MaxReceiveCount), then moves to a Dead Letter Queue (DLQ).

Use SQS when: you want guaranteed at-least-once delivery to exactly one processor; the task should be processed by a single worker (payment processing, invoice generation, email sending — you don't want duplicates).

SNS (Simple Notification Service) is a pub/sub messaging service. A publisher pushes a message to an SNS topic; SNS fans it out to all subscribed endpoints simultaneously — other SQS queues, Lambda functions, HTTP endpoints, mobile push, email. Each subscriber gets its own copy.

Use SNS when: an event needs to trigger multiple downstream systems. An "order placed" event needs to notify the inventory service, the email service, and the analytics service simultaneously.

The Fan-out Pattern combines both — SNS topic with SQS queue subscriptions:

OrderPlaced SNS Topic
├── inventory-service SQS queue  → InventoryService processes
├── email-service SQS queue      → EmailService processes
└── analytics-service SQS queue  → AnalyticsService processes

Each service gets its own queue with independent retry logic and DLQ. Services are completely decoupled.

Spring Boot integration with Spring Cloud AWS:

@SqsListener(value = "order-processing-queue", deletionPolicy = SqsMessageDeletionPolicy.ON_SUCCESS)
public void processOrder(OrderEvent event) {
    // if this throws, message stays in queue for retry
    orderProcessor.process(event);
}

// Publish to SNS
@Autowired NotificationMessagingTemplate snsTemplate;
snsTemplate.convertAndSend("arn:aws:sns:...:OrderEvents", orderEvent);`,
      followUp: {
        question: 'What is a Dead Letter Queue and why is it important?',
        answer: `A Dead Letter Queue is an SQS queue that receives messages that have failed processing more than MaxReceiveCount times. Without a DLQ, a poison pill message (one that always fails, perhaps due to malformed data or a dependency that's always down) would cycle through the main queue forever, blocking other messages and consuming processing resources. With a DLQ, after N failures the message is moved aside for inspection. You monitor the DLQ size as an alert — DLQ messages > 0 means something is wrong. You can then inspect the failed messages, fix the underlying bug, and replay them back to the main queue for reprocessing using a redrive policy. DLQs are essential for production SQS-based systems.`
      }
    },
    {
      id: 'aws_q4',
      question: 'What is AWS Lambda and how do you use it in a Java microservices architecture?',
      difficulty: 'intermediate',
      tags: ['AWS', 'Lambda', 'Serverless'],
      answer: `AWS Lambda is a serverless compute service where you upload a function and AWS runs it in response to events — HTTP requests via API Gateway, S3 object creation, SQS messages, DynamoDB stream events, CloudWatch scheduled events. You pay per invocation and execution duration. No servers to provision or manage.

Lambda integrates into a microservices architecture for:
1. Event processing — an SQS message triggers a Lambda that updates Elasticsearch, sends a notification, or calls another API.
2. File processing — an S3 upload event triggers a Lambda to resize images, parse a CSV, or extract text.
3. API endpoints — API Gateway routes HTTP requests to Lambda functions that handle specific endpoints.
4. Scheduled jobs — CloudWatch Events/EventBridge triggers Lambda on a cron schedule (daily reports, cleanup jobs).

Java Lambda with Spring Cloud Function:

@SpringBootApplication
public class LambdaApplication implements ApplicationContextInitializer<GenericApplicationContext> {
    public static void main(String[] args) {
        SpringApplication.run(LambdaApplication.class, args);
    }

    @Bean
    public Function<OrderEvent, String> processOrder() {
        return event -> {
            // process order event from SQS
            orderService.process(event);
            return "processed";
        };
    }

    @Override
    public void initialize(GenericApplicationContext context) {
        context.registerBean(Application.class);
    }
}

Cold start is the main Java Lambda concern — the JVM initialization takes 1–3 seconds on the first invocation after a period of inactivity. Solutions: AWS Lambda SnapStart (snapshots the JVM after initialization — reduces cold start to ~200ms for Java 11+), Provisioned Concurrency (keeps N instances warm — costs money even when idle), or GraalVM native image compilation (sub-100ms start but limited Spring compatibility).

Lambda function limits: 15-minute max execution time, 10GB max memory, 512MB–10GB ephemeral disk storage (/tmp). Not suitable for long-running processes or heavy-stateful workloads.`,
      followUp: {
        question: 'What is the cold start problem in AWS Lambda and how do you mitigate it?',
        answer: `A cold start occurs when Lambda needs to spin up a new execution environment — download the function package, initialize the JVM, load the Spring context. For Java this can take 3–10 seconds for a full Spring Boot application. Subsequent invocations reuse the warm container and respond in milliseconds. Mitigation strategies: (1) AWS Lambda SnapStart for Java 11+ — AWS snapshots the initialized container, reducing cold starts to ~200ms. (2) Provisioned Concurrency — AWS keeps N warm instances ready at all times — eliminates cold starts but you pay for idle capacity. (3) Keep the deployment package small — avoid loading all of Spring Boot if a lighter framework (Micronaut, Quarkus) suffices for simple Lambda workloads. (4) Schedule a CloudWatch ping every 5 minutes to keep the function warm — cheap but only works for low-concurrency functions. (5) Accept cold starts — for async event processing (SQS, S3 triggers) where the user is not waiting, cold starts are irrelevant.`
      }
    },
    {
      id: 'aws_q5',
      question: 'What is IAM and how do you apply least-privilege principles in a Spring Boot application on AWS?',
      difficulty: 'intermediate',
      tags: ['AWS', 'IAM', 'Security'],
      answer: `IAM (Identity and Access Management) is AWS's authorization system. It controls who (principal) can perform which actions (permissions) on which resources under which conditions.

Core concepts:
- IAM User — a person or application with long-term credentials (access key ID + secret). Avoid for applications — prefer IAM roles.
- IAM Role — a set of permissions that can be assumed by AWS services, EC2 instances, Lambda functions, or users from other accounts. No long-term credentials — roles use temporary tokens that AWS rotates automatically.
- IAM Policy — a JSON document defining Allow/Deny for specific actions on specific resources.
- Instance Profile — assigns an IAM role to an EC2 instance or ECS task, so the application running on it can call AWS services without hardcoded credentials.

Least-privilege example for a Spring Boot service that reads from S3 and writes to SQS:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-app-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": ["sqs:SendMessage", "sqs:GetQueueAttributes"],
      "Resource": "arn:aws:sqs:ap-south-1:123456789:order-queue"
    }
  ]
}

This policy grants only GetObject and PutObject on a specific bucket — not DeleteObject, not ListBucket, not access to any other bucket. Similarly, only SendMessage on one specific SQS queue.

In Spring Boot, DefaultCredentialsProvider.create() picks up credentials from the instance profile automatically — no configuration needed. Never put AWS credentials in application.yml or environment variables in production — use IAM roles and instance profiles.

For local development, use aws configure to set up a profile with limited dev-environment credentials.`,
      followUp: {
        question: 'What is the difference between an IAM role and an IAM policy?',
        answer: `A policy is the document that defines permissions — it lists what actions are allowed or denied on which resources. A role is an identity that has policies attached to it. Think of a policy as a permission slip and a role as a job title that carries certain permission slips. An EC2 instance assumes a role (its instance profile). That role has policies attached. When code running on the instance calls AWS SDK methods, AWS checks the assumed role's attached policies to authorize the action. A role can be assumed by multiple principals (EC2 instances, Lambda functions, other accounts). Roles use temporary credentials with automatic rotation — this is why they are more secure than IAM users with long-term access keys.`
      }
    },
    {
      id: 'aws_q6',
      question: 'Explain VPC, subnets, security groups, and NAT Gateway — how do they protect your application?',
      difficulty: 'intermediate',
      tags: ['AWS', 'VPC', 'Networking', 'Security'],
      answer: `A VPC (Virtual Private Cloud) is your private network in AWS — an isolated section of the AWS cloud where your resources run. You define the IP address range (CIDR), subnets, routing, and access controls.

Subnet types:
- Public subnet — has a route to the Internet Gateway. Resources here (like load balancers) can communicate with the internet. EC2 instances can have public IPs.
- Private subnet — no direct route to the internet. Database servers, application servers, internal microservices live here. Cannot receive inbound traffic from the internet. Cannot reach the internet directly.

Internet Gateway — allows communication between public subnet resources and the internet.

NAT Gateway — sits in a public subnet and allows resources in private subnets to initiate outbound connections to the internet (to download packages, call external APIs) without exposing them to inbound internet traffic. Traffic flow: private subnet → NAT Gateway (public subnet) → Internet Gateway → internet.

Security Groups — stateful virtual firewalls at the instance/container level. Define inbound and outbound rules by port, protocol, and source (IP range or another security group). Security groups default to deny all inbound, allow all outbound.

Example architecture:
- ALB (Application Load Balancer) in public subnet — accepts traffic on 443 from 0.0.0.0/0
- ECS tasks in private subnet — security group allows inbound 8080 only from ALB security group
- RDS in private subnet — security group allows inbound 5432 only from ECS security group

This ensures: the internet reaches only the load balancer; the load balancer reaches only the application; the application reaches only the database. No database exposure to the internet, even accidentally.`,
      followUp: {
        question: 'What is a VPC endpoint and why would you use it?',
        answer: `A VPC endpoint allows resources in your VPC to communicate with AWS services (S3, SQS, DynamoDB, SSM) privately without the traffic leaving the AWS network and without going through NAT Gateway. Without a VPC endpoint, traffic from a private subnet to S3 goes: private subnet → NAT Gateway → internet → S3. With a VPC endpoint (Gateway type for S3/DynamoDB, Interface type for other services), traffic stays within the AWS network and never touches the internet. Benefits: improved security (traffic never leaves AWS network), reduced cost (no NAT Gateway data processing charges for S3/DynamoDB traffic), and lower latency. For a data-intensive application that reads and writes large files to S3, adding an S3 Gateway endpoint can significantly reduce NAT Gateway costs.`
      }
    },
    {
      id: 'aws_q7',
      question: 'What is Amazon RDS and how do you configure a Spring Boot application to use it securely?',
      difficulty: 'beginner',
      tags: ['AWS', 'RDS', 'Database'],
      answer: `RDS (Relational Database Service) is a managed database service supporting MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Aurora. AWS handles provisioning, patching, backups, automated failover, and monitoring — you focus on your application.

Key RDS features for Spring Boot applications:
- Multi-AZ — synchronous replication to a standby instance in another Availability Zone. Automatic failover in ~60 seconds on primary failure.
- Read Replicas — asynchronous replicas for read scaling. Your application can direct read traffic to a replica endpoint to reduce load on the primary.
- Automated Backups — daily backups retained for 1–35 days with point-in-time recovery.
- Aurora — AWS-proprietary compatible with MySQL/PostgreSQL. 5x faster than MySQL, storage auto-scales from 10GB to 128TB, 6 copies of data across 3 AZs.

Secure configuration in Spring Boot:

# application.yml — NEVER hardcode credentials
spring:
  datasource:
    url: jdbc:mysql://\${RDS_ENDPOINT}:3306/\${RDS_DB_NAME}
    username: \${RDS_USERNAME}
    password: \${RDS_PASSWORD}

# Use AWS Secrets Manager for credentials rotation
# spring-cloud-aws-secrets-manager-config resolves \${/myapp/db/password} from Secrets Manager

Best practices:
1. Store credentials in AWS Secrets Manager — never in application.yml or environment variables. Enable automatic rotation so RDS password rotates every 30 days without application restart.
2. Place RDS in a private subnet — no public internet access.
3. Use SSL/TLS for the connection — add ssl=true&sslMode=require to the JDBC URL with the RDS CA certificate.
4. Enable RDS IAM authentication — use short-lived IAM tokens instead of passwords for EC2/ECS to RDS connections. No password to rotate or leak.
5. Enable Enhanced Monitoring and Performance Insights for query-level analysis.`,
      followUp: {
        question: 'What is Aurora Serverless and when is it useful for a Spring Boot application?',
        answer: `Aurora Serverless v2 automatically scales database capacity up and down based on actual usage, in fine-grained increments. Unlike provisioned RDS where you choose instance size (and pay for it 24/7), Aurora Serverless scales to near-zero capacity when idle and scales up within seconds when traffic spikes. This makes it cost-effective for development/staging environments, applications with unpredictable or spiky traffic, or applications that are idle for significant periods. For a consistently high-traffic production service, provisioned Aurora with pre-configured read replicas is more predictable. Spring Boot applications connect to Aurora Serverless the same way as regular Aurora — the scaling is transparent. The one consideration is that scaling events (especially from near-zero) can add latency to the first request after an idle period — similar to Lambda cold starts.`
      }
    },
    {
      id: 'aws_q8',
      question: 'How do you deploy a Spring Boot application to AWS ECS using Docker?',
      difficulty: 'intermediate',
      tags: ['AWS', 'ECS', 'Docker', 'Deployment'],
      answer: `Deploying to ECS Fargate (serverless containers) involves these steps:

1. Build Docker image of the Spring Boot application:

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/myapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "app.jar"]

-XX:+UseContainerSupport makes the JVM respect Docker memory limits (default in Java 11+).

2. Push to ECR (Elastic Container Registry):

aws ecr create-repository --repository-name myapp
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.ap-south-1.amazonaws.com
docker build -t myapp .
docker tag myapp:latest <account>.dkr.ecr.ap-south-1.amazonaws.com/myapp:latest
docker push <account>.dkr.ecr.ap-south-1.amazonaws.com/myapp:latest

3. Create ECS Task Definition — defines the container (image, CPU, memory, port, environment variables, IAM role, logging).

4. Create ECS Service — specifies the cluster, task definition, desired count (number of container instances), load balancer attachment, and network configuration (VPC, subnets, security groups).

5. Application Load Balancer routes traffic to the ECS service via target groups.

Environment variables from Secrets Manager in Task Definition:

{
  "secrets": [
    { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:...:myapp/db:password::" }
  ]
}

ECS fetches the secret at task startup and injects it as an environment variable — never stored in task definition plaintext.

For CI/CD, a GitHub Actions workflow builds the Docker image, pushes to ECR, and calls aws ecs update-service --force-new-deployment to trigger a rolling update.`,
      followUp: {
        question: 'What is the difference between ECS EC2 launch type and Fargate?',
        answer: `With EC2 launch type, you provision and manage EC2 instances that form the ECS cluster. You are responsible for the EC2 instance OS, scaling the instance fleet, patching, and cluster capacity management. More control over instance types (GPU, high-memory), spot instance usage, and networking. With Fargate, there are no instances to manage — you specify vCPU and memory for each task, and AWS provisions and manages the underlying compute. You pay only for what the task actually uses (CPU/memory per second). Fargate simplifies operations significantly but is more expensive for always-on steady-state workloads. EC2 launch type with reserved instances is cheaper for large-scale steady traffic. Most new deployments start with Fargate and migrate to EC2 if cost becomes a concern.`
      }
    },
    {
      id: 'aws_q9',
      question: 'What is AWS CloudWatch and how do you integrate it with Spring Boot for observability?',
      difficulty: 'intermediate',
      tags: ['AWS', 'CloudWatch', 'Observability', 'Monitoring'],
      answer: `CloudWatch is AWS's monitoring and observability service. It collects metrics, logs, and traces from AWS services and your applications.

Components:
- CloudWatch Metrics — time-series data points (CPU, memory, request count, error rate). AWS services emit metrics automatically; custom metrics require explicit publishing.
- CloudWatch Logs — centralized log storage. Your application sends structured JSON logs here via the CloudWatch Logs agent or directly via the SDK.
- CloudWatch Alarms — trigger notifications (SNS, Lambda, Auto Scaling) when metrics breach thresholds.
- CloudWatch Dashboards — visual panels combining metrics from multiple services.

Spring Boot integration:

1. Container logs → CloudWatch Logs automatically — in ECS Task Definition, configure awslogs log driver:

"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/myapp",
    "awslogs-region": "ap-south-1",
    "awslogs-stream-prefix": "ecs"
  }
}

All System.out and logger output goes to CloudWatch Logs automatically.

2. Custom metrics via Micrometer CloudWatch publisher:

// dependency: micrometer-registry-cloudwatch2
management.metrics.export.cloudwatch.namespace=MyApp
management.metrics.export.cloudwatch.enabled=true
management.metrics.export.cloudwatch.step=60s

Micrometer automatically publishes JVM metrics (heap, GC, threads), HTTP request metrics (count, latency), and any custom metrics you define with MeterRegistry.

3. Structured logging for CloudWatch Logs Insights queries:

// logback-spring.xml with logstash-logback-encoder
{"timestamp":"2024-01-15T10:30:00Z","level":"ERROR","service":"order-service",
 "traceId":"abc123","userId":"u789","message":"Payment failed","errorCode":"PAY_001"}

CloudWatch Logs Insights can then query: fields @timestamp, userId, errorCode | filter level = "ERROR" | stats count(*) by errorCode

4. CloudWatch Alarms for SLO monitoring — alarm when HTTP 5xx rate > 1% or P99 latency > 2000ms, trigger SNS notification to PagerDuty or Slack.`,
      followUp: {
        question: 'What is the difference between CloudWatch and X-Ray?',
        answer: `CloudWatch handles metrics, logs, and alarms — it tells you what is happening across your system (CPU at 80%, error rate at 2%, 1000 requests/minute). X-Ray is a distributed tracing service — it tells you what happened for a specific request as it flowed through multiple services. X-Ray traces record the full request path: API Gateway → Service A (took 50ms) → DynamoDB query (took 20ms) → Service B call (took 200ms) → response. This identifies which service or database call caused latency. X-Ray integrates with Spring Boot via the X-Ray SDK or via AWS Distro for OpenTelemetry (ADOT), which is the modern approach. Together, CloudWatch gives the forest view and X-Ray gives the tree view.`
      }
    },
    {
      id: 'aws_q10',
      question: 'What is Auto Scaling in AWS and how does it work with Spring Boot microservices on ECS?',
      difficulty: 'intermediate',
      tags: ['AWS', 'Auto Scaling', 'ECS', 'Performance'],
      answer: `Auto Scaling automatically adjusts the number of running instances based on demand, ensuring your application has capacity during peaks while reducing costs during low traffic.

In ECS, Application Auto Scaling manages task count. You define:
- Minimum tasks — always running (ensures baseline availability)
- Maximum tasks — upper cap to control cost
- Scaling policies — rules for when to scale out (add tasks) and scale in (remove tasks)

Target Tracking Policy — the most common. Set a target value for a metric, and Auto Scaling adjusts task count to maintain it:

aws application-autoscaling put-scaling-policy \
  --policy-name cpu-target-tracking \
  --service-namespace ecs \
  --resource-id service/my-cluster/my-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 300
  }'

This keeps CPU at 70% on average — scaling out when it rises above, scaling in when it drops below. ScaleInCooldown is longer than ScaleOutCooldown to avoid flapping (rapid scale-in and scale-out cycles).

Custom metrics — you can also scale on SQS queue depth (scale ECS tasks based on number of messages waiting) or on custom Micrometer metrics published to CloudWatch.

Spring Boot considerations for auto-scaling:
- Stateless design — tasks can be added/removed without losing request context; session state in Redis, not in-process.
- Fast startup — minimize Spring Boot startup time so new tasks become healthy quickly. Spring Boot 3.x lazy initialization (spring.main.lazy-initialization=true) for non-critical beans helps.
- Graceful shutdown — ECS sends SIGTERM before killing a task. Spring Boot 2.3+ handles this with server.shutdown=graceful, completing in-flight requests before stopping.`,
      followUp: {
        question: 'What is a target tracking scaling policy vs. a step scaling policy?',
        answer: `Target tracking is like a thermostat — you set a target metric value and Auto Scaling continuously adjusts capacity to maintain it. It calculates the required change automatically. Simple to configure, AWS-managed. Best for steady, predictable scaling. Step scaling is explicit rules — if metric is 70-80%, add 1 task; if 80-90%, add 2 tasks; if >90%, add 4 tasks. More control over scaling increments, useful when you know the relationship between metric values and required capacity is non-linear. For most Spring Boot microservices, target tracking on CPU or SQS queue depth is sufficient. Step scaling is useful for applications with bursty, well-understood traffic patterns where aggressive proactive scaling prevents latency spikes.`
      }
    },
  ],
}

export default aws
