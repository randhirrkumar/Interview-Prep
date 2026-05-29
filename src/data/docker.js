const docker = {
  title: 'Docker & Kubernetes',
  description: 'Containerization with Docker and orchestration with Kubernetes — essentials for modern Java backend roles.',
  tags: ['Docker', 'Kubernetes', 'Containers', 'DevOps', 'Microservices'],
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
  ]
}

export default docker
