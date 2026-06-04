const docker = {
  title: 'Docker & Kubernetes',
  description: 'Containerization with Docker and orchestration with Kubernetes — essentials for modern Java backend roles.',
  tags: ['Docker', 'Kubernetes', 'Containers', 'DevOps'],
  questions: [
    {
      id: 1,
      question: 'What is Docker? How is it different from a Virtual Machine?',
      difficulty: 'beginner',
      tags: ['Docker', 'Containers'],
      answer: `Docker is a platform for packaging applications and their dependencies into lightweight, portable containers. A container includes the app, runtime, libraries, and config — runs identically on any machine.

VM vs Container:
- VM: Full OS + hypervisor. Heavy (~GBs), slow startup (minutes), strong isolation.
- Container: Shares host OS kernel. Lightweight (~MBs), fast startup (seconds), process-level isolation.

Key Docker concepts: Image (blueprint), Container (running instance), Dockerfile (build instructions), Registry (DockerHub/ECR).`,
      code: `# Basic Docker commands
docker build -t my-app:1.0 .          # build image from Dockerfile
docker run -d -p 8080:8080 my-app:1.0 # run container (detached)
docker ps                              # list running containers
docker logs <container-id>             # view logs
docker exec -it <container-id> bash   # shell into container
docker stop <container-id>            # stop container
docker rm <container-id>              # remove container
docker images                          # list local images
docker rmi my-app:1.0                 # remove image
docker pull openjdk:17-jdk-slim       # pull from registry

# Docker lifecycle
Image → Container (run) → Stop → Remove`,
    },
    {
      id: 2,
      question: 'Write a production-grade Dockerfile for a Spring Boot application.',
      difficulty: 'intermediate',
      tags: ['Docker', 'Spring Boot', 'Dockerfile'],
      answer: `A production Dockerfile should be optimized: use multi-stage builds to keep the final image small, use a non-root user for security, leverage layer caching by copying dependencies before source code, and use a slim base image.

The multi-stage build compiles in a build stage and copies only the JAR to the final runtime image — this removes Maven, JDK source files, and build tools from the final image.`,
      code: `# Multi-stage Dockerfile for Spring Boot
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml first — enables layer caching (dependencies won't re-download if unchanged)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -q

# Extract layers for better caching
RUN java -Djarmode=layertools -jar target/*.jar extract

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy layers in order of least-to-most frequently changed
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \\
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]`,
    },
    {
      id: 3,
      question: 'What is Docker Compose? Write a compose file for a Spring Boot + MySQL + Redis stack.',
      difficulty: 'intermediate',
      tags: ['Docker Compose', 'Spring Boot'],
      answer: `Docker Compose defines and runs multi-container applications. You describe all services, networks, and volumes in a YAML file and start everything with one command. Essential for local development and testing.

Key concepts: services (containers), networks (communication), volumes (persistent storage), depends_on (startup order), environment variables.`,
      code: `# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/prepdb
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: secret
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: prepdb
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql-data:

# Commands
# docker-compose up -d        # start all services
# docker-compose down         # stop all
# docker-compose logs -f app  # follow app logs
# docker-compose ps           # status`,
    },
    {
      id: 4,
      question: 'What is Kubernetes? Explain its core components.',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'K8s'],
      answer: `Kubernetes (K8s) is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications.

Core components:
- Cluster: Master node(s) + worker nodes
- Pod: Smallest deployable unit — one or more containers sharing network/storage
- Node: Worker machine (VM or physical) that runs pods
- Deployment: Declares desired state — manages pod replicas and rolling updates
- Service: Stable network endpoint for pods (ClusterIP, NodePort, LoadBalancer)
- ConfigMap/Secret: Externalize configuration and sensitive data
- Namespace: Virtual clusters for isolation
- Ingress: HTTP routing rules to services`,
      code: `# Kubernetes architecture
Master Node:
  ├── API Server        # entry point for all operations
  ├── etcd              # distributed key-value store (cluster state)
  ├── Scheduler         # assigns pods to nodes
  └── Controller Manager # maintains desired state

Worker Node:
  ├── kubelet           # communicates with API server, manages pods
  ├── kube-proxy        # handles networking rules
  └── Container Runtime # Docker/containerd/CRI-O

# Key kubectl commands
kubectl get pods                        # list pods
kubectl get pods -n production          # in specific namespace
kubectl describe pod my-pod             # detailed info
kubectl logs my-pod -f                  # follow logs
kubectl exec -it my-pod -- bash        # shell into pod
kubectl apply -f deployment.yaml        # create/update resources
kubectl delete pod my-pod               # delete pod (recreated by Deployment)
kubectl scale deployment my-app --replicas=5  # scale
kubectl rollout status deployment my-app      # rollout status
kubectl rollout undo deployment my-app        # rollback`,
    },
    {
      id: 5,
      question: 'Write Kubernetes manifests for a Spring Boot application.',
      difficulty: 'advanced',
      tags: ['Kubernetes', 'Deployment', 'Service'],
      answer: `A typical K8s deployment for a Spring Boot app needs: Deployment (manages pods + rolling updates), Service (stable network access), ConfigMap (configuration), and optionally an Ingress (external access).

Key settings: resource requests/limits, liveness/readiness probes, rolling update strategy, and environment variables from ConfigMap/Secret.`,
      code: `# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: interview-prep-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: interview-prep-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: interview-prep-api
    spec:
      containers:
      - name: api
        image: randhir/interview-prep-api:1.0.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db.url
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db.password
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 5
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: interview-prep-api-svc
spec:
  selector:
    app: interview-prep-api
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  db.url: "jdbc:mysql://mysql-svc:3306/prepdb"
  app.log.level: "INFO"`,
    },
    {
      id: 6,
      question: 'What are Kubernetes Probes? Difference between liveness and readiness?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'Health Checks'],
      answer: `K8s uses probes to determine the state of a container:

Liveness probe: Is the container alive? If it fails, K8s restarts the container. Use for detecting deadlocks or crashed states that don't cause the process to exit.

Readiness probe: Is the container ready to serve traffic? If it fails, K8s removes the pod from the Service's endpoint list. Use for apps that need time to warm up (load caches, establish DB connections).

Startup probe: Is the container started? Useful for slow-starting applications — prevents liveness from killing the pod before it finishes starting up.

Spring Boot Actuator exposes /actuator/health/liveness and /actuator/health/readiness out of the box.`,
      code: `# Spring Boot application.properties
management.health.livenessstate.enabled=true
management.health.readinessstate.enabled=true
management.endpoint.health.probes.enabled=true

# Custom readiness — app not ready until cache is loaded
@Component
public class CacheWarmupReadinessIndicator implements ReadinessHealthIndicator {
    @Autowired
    private CacheService cache;

    @Override
    public Health health() {
        if (cache.isWarmedUp()) {
            return Health.up().build();
        }
        return Health.down().withDetail("reason", "Cache not yet loaded").build();
    }
}

# K8s probes
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30    # wait before first check
  periodSeconds: 10           # check every 10s
  failureThreshold: 3         # restart after 3 failures

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 20
  periodSeconds: 5
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  failureThreshold: 30       # allow 30 * 10s = 5 min to start
  periodSeconds: 10`,
    },
    {
      id: 7,
      question: 'What is Horizontal Pod Autoscaler (HPA)? How do you configure it?',
      difficulty: 'advanced',
      tags: ['Kubernetes', 'Scaling', 'HPA'],
      answer: `HPA automatically scales the number of pod replicas based on observed CPU/memory utilization or custom metrics. It queries the Metrics Server periodically (default 15s) and adjusts replicas to maintain the target utilization.

Formula: desiredReplicas = ceil(currentReplicas * currentMetric / targetMetric)

HPA is ideal for stateless services like Spring Boot APIs. For stateful apps, use VPA (Vertical Pod Autoscaler) or manual scaling.`,
      code: `# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: interview-prep-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: interview-prep-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70   # scale up if CPU > 70%
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300  # wait 5min before scaling down

# Via kubectl
kubectl autoscale deployment interview-prep-api \\
  --min=2 --max=10 --cpu-percent=70

# Check HPA status
kubectl get hpa
kubectl describe hpa interview-prep-hpa`,
    },
    {
      id: 8,
      question: 'Explain ConfigMap and Secrets in Kubernetes. How do you use them in Spring Boot?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'ConfigMap', 'Secrets', 'Spring Boot'],
      answer: `ConfigMap stores non-sensitive configuration (URLs, feature flags, log levels). Secret stores sensitive data (passwords, API keys, certificates) — base64 encoded (not encrypted by default, use etcd encryption at rest for production).

Both can be consumed as environment variables or volume-mounted files. Spring Boot can read them transparently.`,
      code: `# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_LOG_LEVEL: "INFO"
  CACHE_TTL_SECONDS: "300"
  DB_URL: "jdbc:mysql://mysql-svc:3306/prepdb"

# Secret (values are base64 encoded)
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DB_PASSWORD: c2VjcmV0MTIz   # echo -n "secret123" | base64
  JWT_SECRET: bXlzdXBlcnNlY3JldA==

# In Deployment — as env vars
env:
- name: SPRING_DATASOURCE_URL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: DB_URL
- name: SPRING_DATASOURCE_PASSWORD
  valueFrom:
    secretKeyRef:
      name: app-secrets
      key: DB_PASSWORD

# Or mount entire ConfigMap as env
envFrom:
- configMapRef:
    name: app-config
- secretRef:
    name: app-secrets

# Spring Boot auto-reads env vars
# DB_URL → spring.datasource.url (Spring converts _ to .)
# Or explicitly in application.properties:
spring.datasource.password=\${DB_PASSWORD}`,
    },
    {
      id: 9,
      question: 'What is the difference between ClusterIP, NodePort, and LoadBalancer services?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'Networking', 'Service'],
      answer: `Kubernetes Service types control how pods are exposed:

ClusterIP (default): Accessible only within the cluster. Used for internal service-to-service communication (microservices calling each other).

NodePort: Exposes the service on each Node's IP at a static port (30000–32767). Accessible from outside the cluster via NodeIP:NodePort. Not for production — use for dev/testing.

LoadBalancer: Provisions an external cloud load balancer (AWS ELB, Azure LB). Best for production — assigns a stable external IP. More expensive.

Ingress: Not a Service type, but an HTTP router that routes external traffic to multiple services based on host/path rules using a single LoadBalancer.`,
      code: `# ClusterIP — internal only
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  type: ClusterIP        # default
  selector:
    app: order-service
  ports:
  - port: 80
    targetPort: 8080

# NodePort — external via node IP
apiVersion: v1
kind: Service
metadata:
  name: order-service-np
spec:
  type: NodePort
  selector:
    app: order-service
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080      # access via <NodeIP>:30080

# LoadBalancer — external cloud LB
apiVersion: v1
kind: Service
metadata:
  name: order-service-lb
spec:
  type: LoadBalancer
  selector:
    app: order-service
  ports:
  - port: 80
    targetPort: 8080

# Ingress — HTTP routing (most common for web apps)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: api.myapp.com
    http:
      paths:
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80`,
    },
    {
      id: 10,
      question: 'How do you handle rolling deployments and rollbacks in Kubernetes?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'Deployment', 'CI/CD'],
      answer: `Kubernetes Deployments support rolling updates by default — it gradually replaces old pods with new ones, ensuring no downtime. The strategy is controlled by maxUnavailable and maxSurge parameters.

Rollback is instant — K8s keeps revision history and you can roll back to any previous version with one command.

Best practice for production: use readiness probes so K8s waits for new pods to be healthy before routing traffic and before removing old pods.`,
      code: `# Rolling update strategy in Deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0   # never reduce capacity (zero-downtime)
      maxSurge: 1         # allow 1 extra pod during update

# Deploy new version
kubectl set image deployment/my-app app=my-app:2.0.0
# or
kubectl apply -f deployment.yaml  # with updated image tag

# Monitor rollout
kubectl rollout status deployment/my-app
# Waiting for deployment "my-app" rollout to finish: 2 of 3 updated...

# Rollback to previous version
kubectl rollout undo deployment/my-app

# Rollback to specific revision
kubectl rollout history deployment/my-app   # see revisions
kubectl rollout undo deployment/my-app --to-revision=2

# Pause / Resume (for canary-style gradual rollout)
kubectl rollout pause deployment/my-app
kubectl rollout resume deployment/my-app

# Blue/Green deployment approach
# 1. Deploy new version with different label
# 2. Test new deployment
# 3. Switch Service selector to point to new pods
kubectl patch service my-svc -p '{"spec":{"selector":{"version":"v2"}}}'`,
    },
  // ─── AWS & CI/CD ────────────────────────────────────────────────────────────
  {
    id: 11,
    question: 'What is CI/CD? How does a typical pipeline work?',
    difficulty: 'beginner',
    asked: true,
    tags: ['CI/CD', 'DevOps', 'Jenkins'],
    answer: `CI (Continuous Integration): Developers frequently merge code to a shared branch. On every push/merge, an automated pipeline runs: compile → unit tests → code quality checks. Goal: catch integration bugs early, keep the main branch always buildable.

CD (Continuous Delivery): After CI passes, the artifact is automatically built and deployed to a staging/UAT environment. A human approves before production deployment.

CD (Continuous Deployment): Every successful CI pipeline automatically deploys to production — no human approval needed. Requires very high test coverage and confidence.

Typical CI/CD pipeline stages:
1. Source: developer pushes code / merges PR
2. Build: compile code, resolve dependencies (Maven/Gradle)
3. Unit Tests: run JUnit tests
4. Code Analysis: SonarQube (code quality, coverage, security hotspots)
5. Docker Build: build Docker image, tag with commit hash
6. Push: push image to container registry (ECR, Docker Hub)
7. Deploy to Staging: update Kubernetes deployment with new image
8. Integration Tests / Smoke Tests: run against staging
9. Approve: manual gate (or automatic for full CD)
10. Deploy to Production: rolling deployment with zero downtime`,
    code: `# GitHub Actions pipeline example
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }

      - name: Build and Test
        run: mvn clean verify  # compile + unit tests + coverage

      - name: SonarQube Analysis
        run: mvn sonar:sonar -Dsonar.host.url=$SONAR_URL

      - name: Build Docker Image
        run: |
          docker build -t myapp:\${{ github.sha }} .
          docker push $ECR_REGISTRY/myapp:\${{ github.sha }}

      - name: Deploy to Staging
        run: |
          kubectl set image deployment/myapp myapp=$ECR_REGISTRY/myapp:\${{ github.sha }}
          kubectl rollout status deployment/myapp`,
  },
  {
    id: 12,
    question: 'How does Jenkins deploy applications? Explain the internal working.',
    difficulty: 'intermediate',
    asked: true,
    tags: ['Jenkins', 'CI/CD', 'Pipeline'],
    answer: `Jenkins is an open-source automation server. It executes pipelines defined as code (Jenkinsfile) stored in the repository.

Internal working:

1. SCM Polling / Webhook: Jenkins detects code changes via webhook (GitHub/GitLab pushes trigger Jenkins) or periodic polling.

2. Pipeline execution: Jenkins reads the Jenkinsfile from the repo root. Pipelines have stages (Build, Test, Deploy), each running shell/Groovy commands.

3. Agents: Jenkins Master orchestrates. Build jobs run on Agent nodes (separate machines or containers). This offloads work from the master.

4. Build:
   - Checkout code from git
   - Run Maven/Gradle: mvn clean package -DskipTests=false
   - Build Docker image: docker build -t appname:$BUILD_NUMBER .

5. Push: push Docker image to registry (ECR, Nexus).

6. Deploy:
   - SSH into server and docker pull + restart, OR
   - kubectl set image to update Kubernetes deployment, OR
   - Trigger AWS CodeDeploy, ECS service update

7. Post: send Slack/email notification on success/failure.

Jenkinsfile as code (Pipeline-as-Code) means the pipeline is versioned alongside the application code.`,
    code: `// Jenkinsfile (Declarative Pipeline)
pipeline {
    agent any  // or: agent { docker { image 'maven:3.9-eclipse-temurin-17' } }

    environment {
        APP_NAME = 'vehicle-service'
        ECR_REPO = '123456789.dkr.ecr.ap-south-1.amazonaws.com/vehicle-service'
        KUBECONFIG = credentials('kubeconfig-prod')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build & Test') {
            steps {
                sh 'mvn clean package'
                junit 'target/surefire-reports/*.xml'  // publish test results
            }
        }

        stage('Docker Build & Push') {
            steps {
                sh """
                    docker build -t \${APP_NAME}:\${BUILD_NUMBER} .
                    docker tag \${APP_NAME}:\${BUILD_NUMBER} \${ECR_REPO}:\${BUILD_NUMBER}
                    docker push \${ECR_REPO}:\${BUILD_NUMBER}
                """
            }
        }

        stage('Deploy to K8s') {
            steps {
                sh "kubectl set image deployment/\${APP_NAME} \${APP_NAME}=\${ECR_REPO}:\${BUILD_NUMBER}"
                sh "kubectl rollout status deployment/\${APP_NAME} --timeout=5m"
            }
        }
    }

    post {
        success { slackSend message: "✅ \${APP_NAME} deployed: \${BUILD_NUMBER}" }
        failure { slackSend message: "❌ \${APP_NAME} build failed: \${BUILD_NUMBER}" }
    }
}`,
  },
  {
    id: 13,
    question: 'What AWS services are commonly used in Java backend projects?',
    difficulty: 'beginner',
    asked: true,
    tags: ['AWS', 'Cloud'],
    answer: `Core AWS services for Java backend:

Compute:
- EC2 (Elastic Compute Cloud): virtual machines. You manage the OS, install Java, deploy JAR. Full control but more ops overhead.
- ECS (Elastic Container Service): managed Docker containers. You provide a Dockerfile + task definition. AWS runs and scales containers. Less ops overhead than EC2.
- EKS (Elastic Kubernetes Service): managed Kubernetes. Best for complex microservices.
- Lambda: serverless functions. No server management. Pay per invocation. Good for event-driven, short-lived tasks (file processing, notifications).

Storage:
- S3 (Simple Storage Service): object storage for files, images, backups, static assets.
- RDS: managed relational DB (MySQL, PostgreSQL). Handles backups, failover, patches.
- ElastiCache: managed Redis/Memcached. Use for caching, sessions, rate limiting.
- SQS (Simple Queue Service): managed message queue. Use when you don't need Kafka's log retention.

Networking:
- VPC: private network. Your services run in private subnets, only ALB is public.
- ALB (Application Load Balancer): routes HTTP traffic to EC2/ECS/Lambda.
- Route 53: DNS management.

Monitoring:
- CloudWatch: logs, metrics, alarms. The default AWS monitoring tool.
- X-Ray: distributed tracing for microservices.`,
    code: `// Common Spring Boot + AWS integrations

// S3 — file upload/download (AWS SDK v2)
S3Client s3 = S3Client.builder().region(Region.AP_SOUTH_1).build();

// Upload
s3.putObject(PutObjectRequest.builder()
    .bucket("my-bucket")
    .key("invoices/" + invoiceId + ".pdf")
    .build(), RequestBody.fromBytes(pdfBytes));

// Download
ResponseBytes<GetObjectResponse> obj = s3.getObjectAsBytes(
    GetObjectRequest.builder().bucket("my-bucket").key(key).build()
);
byte[] bytes = obj.asByteArray();

// SQS — send message (simpler than Kafka for basic queues)
SqsClient sqs = SqsClient.create();
sqs.sendMessage(SendMessageRequest.builder()
    .queueUrl("https://sqs.ap-south-1.amazonaws.com/123/my-queue")
    .messageBody(json.writeValueAsString(event))
    .build());

// Spring Cloud AWS (simplifies integration)
// application.yml:
// cloud.aws.region.static=ap-south-1
// cloud.aws.credentials.instance-profile=true`,
  },
  {
    id: 14,
    question: 'EC2 vs ECS — when do you use which?',
    difficulty: 'intermediate',
    asked: true,
    tags: ['AWS', 'EC2', 'ECS', 'Containers'],
    answer: `EC2 (Elastic Compute Cloud):
- You get a raw virtual machine with an OS
- You install Java, configure the server, deploy your JAR/WAR
- You manage: OS patches, JVM upgrades, disk space, scaling scripts
- Full control over the environment
- Use when: legacy apps that can't be containerized, very specific OS/hardware requirements, need persistent local storage

ECS (Elastic Container Service):
- AWS manages the underlying infrastructure (Fargate mode = fully serverless containers)
- You provide a Docker image + task definition (CPU, memory, env vars, ports)
- AWS handles: running containers, health checks, auto-scaling, load balancing integration
- Deploy new version = update task definition with new image → rolling deployment
- Use when: containerized applications, microservices, want less ops overhead

ECS Fargate vs EC2 Launch Type:
- Fargate: fully managed, pay per second. No servers to manage. More expensive.
- EC2 launch type: you provision EC2 instances, ECS schedules containers on them. More control, cheaper at scale.

For most new Spring Boot microservices: ECS Fargate is the right choice — minimal ops, easy auto-scaling, integrates natively with ALB, ECR, CloudWatch.`,
    code: `# ECS Task Definition (simplified) — defines how to run your container
{
  "family": "vehicle-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",      # 0.5 vCPU
  "memory": "1024",  # 1 GB RAM
  "containerDefinitions": [{
    "name": "vehicle-service",
    "image": "123456789.dkr.ecr.ap-south-1.amazonaws.com/vehicle-service:v1.2.3",
    "portMappings": [{"containerPort": 8080}],
    "environment": [
      {"name": "SPRING_PROFILES_ACTIVE", "value": "prod"},
      {"name": "DB_URL", "value": "jdbc:mysql://rds-endpoint:3306/mydb"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/vehicle-service",
        "awslogs-region": "ap-south-1"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"],
      "interval": 30,
      "timeout": 5,
      "retries": 3
    }
  }]
}`,
  },
  {
    id: 15,
    question: 'What is AWS CloudWatch? How do you use it with Spring Boot?',
    difficulty: 'beginner',
    asked: false,
    tags: ['AWS', 'CloudWatch', 'Monitoring', 'Logging'],
    answer: `CloudWatch is AWS's monitoring and observability service. It collects:
- Logs: application logs, access logs, system logs
- Metrics: CPU usage, memory, request count, latency
- Events: scheduled triggers, AWS service events
- Alarms: trigger actions when a metric crosses a threshold

For Spring Boot on ECS/EC2:

Logging: configure the CloudWatch Logs driver in ECS task definition. Your System.out / SLF4J logs automatically go to CloudWatch Log Groups. You can search logs with CloudWatch Logs Insights (SQL-like query language).

Metrics: use Micrometer (Spring Boot Actuator) + AWS CloudWatch Metrics publisher. Custom metrics (order count, payment failures) automatically flow to CloudWatch.

Alarms: create alarm on CPU > 80% → scale out ECS service. Or: error_rate > 5% in 5 min → PagerDuty alert.

CloudWatch Dashboard: visualize metrics with graphs. Create custom dashboards per service.

Practical tip: always use structured JSON logging in production (not plain text). CloudWatch Logs Insights can query JSON fields directly. Logstash/Logback with JSON encoder + CloudWatch = powerful log analytics.`,
    code: `# application.yml — Spring Boot Actuator + CloudWatch metrics
management:
  metrics:
    export:
      cloudwatch:
        namespace: VehicleService
        step: PT1M  # push metrics every 1 minute
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus

// Custom metric — count vehicle events processed
@Component
public class EventMetrics {

    private final Counter eventsProcessed;

    public EventMetrics(MeterRegistry registry) {
        eventsProcessed = Counter.builder("vehicle.events.processed")
            .description("Total vehicle events processed")
            .tag("service", "vehicle-service")
            .register(registry);
    }

    public void recordEvent(String eventType) {
        eventsProcessed.increment();
    }
}

# Logback JSON config (structured logging for CloudWatch Insights)
# logback-spring.xml
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
</appender>

# CloudWatch Insights query example:
# fields @timestamp, level, message, requestId
# | filter level = "ERROR"
# | sort @timestamp desc`,
  },
  {
    id: 16,
    question: 'What are AWS Lambda Triggers? When would you use Lambda in a Java backend?',
    difficulty: 'intermediate',
    asked: false,
    tags: ['AWS', 'Lambda', 'Serverless', 'Event-driven'],
    answer: `AWS Lambda is a serverless compute service. You upload code (function), define a trigger, AWS runs it on demand. No servers to manage, pay only for execution time (per 100ms).

Lambda Triggers — events that invoke a Lambda function:
- API Gateway: HTTP request → Lambda (fully serverless REST API)
- S3: file uploaded to bucket → Lambda processes it (resize image, parse CSV)
- SQS: message in queue → Lambda processes it (event handler)
- SNS: notification published → Lambda fans out
- DynamoDB Streams: record changed → Lambda reacts
- EventBridge (CloudWatch Events): scheduled trigger (cron) → Lambda (scheduled job)
- Kinesis: stream records → Lambda processes in batch

When to use Lambda for Java backends:
✓ Event-driven processing: invoice PDF generation after payment, image resizing after upload
✓ Scheduled jobs: nightly data cleanup, report generation
✓ Lightweight webhooks: process incoming webhook from payment gateway
✗ NOT ideal for: long-running processes (15 min max), stateful services, high-traffic APIs with consistent load (cold start latency)

Cold start issue: first invocation after idle period takes longer (JVM startup). Mitigate with:
- Provisioned concurrency (pre-warm instances — costs more)
- GraalVM native image (faster JVM startup)
- Use Spring Cloud Function for portable Lambda handlers`,
    code: `// Spring Boot Lambda handler with Spring Cloud Function
// pom.xml: spring-cloud-function-adapter-aws

@SpringBootApplication
public class LambdaApplication {
    public static void main(String[] args) {
        SpringApplication.run(LambdaApplication.class, args);
    }

    // S3 trigger — process uploaded file
    @Bean
    public Function<S3Event, String> processInvoice() {
        return s3Event -> {
            String bucket = s3Event.getRecords().get(0).getS3().getBucket().getName();
            String key = s3Event.getRecords().get(0).getS3().getObject().getKey();
            log.info("Processing invoice: {}/{}", bucket, key);
            invoiceService.process(bucket, key);
            return "OK";
        };
    }
}

// Handler class for Lambda deployment
public class InvoiceHandler extends SpringBootRequestHandler<S3Event, String> { }

# Scheduled Lambda via EventBridge (cron)
# In CloudFormation/SAM:
# Events:
#   NightlyCleanup:
#     Type: Schedule
#     Properties:
#       Schedule: cron(0 1 * * ? *)   # 1 AM UTC daily`,
  },
  ],
}

export default docker
