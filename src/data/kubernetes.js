const kubernetes = {
  title: 'Kubernetes (K8s)',
  description: 'Kubernetes architecture, core objects (Pods, Deployments, Services, ConfigMaps), scaling, health checks, Helm, and deploying Spring Boot microservices on K8s.',
  tags: ['Kubernetes', 'Helm', 'Services', 'Health Checks', 'HPA', 'Deployment'],
  questions: [
    {
      id: 'k8s_q1',
      question: 'What is Kubernetes and what problem does it solve for microservices?',
      difficulty: 'beginner',
      tags: ['Kubernetes', 'Overview'],
      answer: `Kubernetes (K8s) is an open-source container orchestration system that automates deploying, scaling, and managing containerized applications. Without an orchestrator, running 20 microservices as Docker containers across 10 machines means manually deciding which container goes on which machine, handling machine failures, restarting crashed containers, scaling during traffic spikes, and managing rolling upgrades — all by hand. Kubernetes automates all of this.

Problems Kubernetes solves for microservices:

Self-healing — if a container crashes or a node fails, Kubernetes automatically restarts the container or reschedules it on a healthy node. Your desired state (e.g., "run 3 replicas of this service") is maintained automatically.

Service discovery and load balancing — services find each other by name, not by IP. Kubernetes DNS resolves order-service to the right set of pods. Built-in load balancing across pods.

Automated rollouts and rollbacks — deploy a new version by updating the container image. Kubernetes replaces old pods with new ones gradually (rolling update). If health checks fail on the new version, it rolls back automatically.

Horizontal scaling — add a HorizontalPodAutoscaler and Kubernetes scales pod count up or down based on CPU, memory, or custom metrics.

Configuration management — environment variables, secrets, and configuration files are injected into containers without rebuilding the image.

Resource allocation — you specify CPU and memory requests/limits per container; Kubernetes schedules pods on nodes that have sufficient resources.

For a team running 10–50 Spring Boot microservices, Kubernetes eliminates most of the operational overhead of managing containers at scale.`,
      followUp: {
        question: 'What is the difference between a Container, a Pod, and a Node in Kubernetes?',
        answer: `A Container is a running instance of a Docker image — your Spring Boot application packaged with its JRE. A Pod is the smallest deployable unit in Kubernetes — it wraps one or more containers that share a network namespace and storage volumes. Containers in the same pod communicate via localhost and share the same IP. Usually one container per pod; multiple containers per pod (sidecar pattern) is used for helper processes like logging agents or service mesh proxies. A Node is a physical or virtual machine in the Kubernetes cluster where pods run. Each node runs a kubelet (communicates with the control plane), kube-proxy (network routing), and the container runtime (containerd or Docker). Nodes are managed by the Kubernetes control plane (API server, scheduler, etcd, controller manager).`
      }
    },
    {
      id: 'k8s_q2',
      question: 'Explain the core Kubernetes objects: Deployment, ReplicaSet, Service, and ConfigMap.',
      difficulty: 'beginner',
      tags: ['Kubernetes', 'Core Objects'],
      answer: `These four objects form the foundation of a Kubernetes application deployment.

Deployment — declares the desired state for a set of pods: which container image to run, how many replicas, resource limits, and update strategy. Kubernetes ensures the actual state matches the desired state. When you update the image version, the Deployment performs a rolling update.

apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: order-service
        image: myregistry/order-service:1.2.0
        ports:
        - containerPort: 8080
        resources:
          requests: { cpu: "250m", memory: "512Mi" }
          limits:  { cpu: "500m", memory: "1Gi" }

ReplicaSet — ensures N copies of a pod are always running. Deployments manage ReplicaSets under the hood — you rarely create a ReplicaSet directly.

Service — a stable network endpoint for a set of pods. Pods are ephemeral (IPs change on restart); a Service provides a constant DNS name and IP that load-balances across the matching pods.

apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service     # routes to pods with this label
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP          # internal only; use LoadBalancer for external access

ConfigMap — key-value pairs for non-sensitive configuration. Mounted as environment variables or files into pods. Changing a ConfigMap and rolling the deployment avoids rebuilding the Docker image for config changes.

apiVersion: v1
kind: ConfigMap
metadata:
  name: order-service-config
data:
  SPRING_PROFILES_ACTIVE: "prod"
  SERVER_PORT: "8080"
  LOG_LEVEL: "INFO"`,
      followUp: {
        question: 'What is a DaemonSet and when would you use one?',
        answer: `A DaemonSet ensures exactly one pod runs on every node (or every node matching a node selector). When a new node joins the cluster, the DaemonSet automatically schedules a pod on it. Use cases: log collection agents (Fluentd, Filebeat) that collect logs from every node's filesystem; monitoring agents (Node Exporter, Datadog agent) that collect node-level metrics; network plugins (Calico, Weave) that manage pod networking on each node. You would not run your Spring Boot microservices as DaemonSets — those go in Deployments with configurable replica counts.`
      }
    },
    {
      id: 'k8s_q3',
      question: 'What are the Service types in Kubernetes and when do you use each?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'Services', 'Networking'],
      answer: `Kubernetes has four Service types, controlling how the service is exposed.

ClusterIP (default) — the service gets an internal IP reachable only within the cluster. Pods and other services in the cluster can reach it via DNS name. Use for all inter-service communication in a microservices architecture — order-service calling inventory-service by its ClusterIP DNS name.

NodePort — exposes the service on a static port (30000–32767) on every node's IP. External traffic can reach it via NodeIP:NodePort. Rarely used in production because it exposes node IPs directly and requires clients to know node IPs. Used for quick development testing.

LoadBalancer — provisions a cloud provider's load balancer (AWS ALB/NLB, GCP Load Balancer) automatically and routes external traffic to the service. The most common way to expose public-facing services in cloud deployments. Each LoadBalancer Service gets its own cloud load balancer — expensive if you have many services.

ExternalName — maps a Kubernetes service name to an external DNS name. Useful for giving an in-cluster DNS name to an external service (like an external database): external-db.default.svc.cluster.local resolves to mydb.rds.amazonaws.com. No proxying — it's just DNS alias.

In practice, most architectures use ClusterIP for all internal services, one or two LoadBalancer services for public entry points (API Gateway, ingress controller), and Ingress (not a Service type, but an Ingress object) to route multiple paths to multiple ClusterIP services through a single load balancer.`,
      followUp: {
        question: 'What is a Kubernetes Ingress and how does it differ from a LoadBalancer service?',
        answer: `An Ingress is an API object that defines HTTP/HTTPS routing rules — routing by hostname, path prefix, or header to different backend services. An Ingress Controller (like nginx-ingress or AWS Load Balancer Controller) reads these rules and configures the underlying load balancer. With LoadBalancer services, each service gets its own cloud load balancer — if you have 10 microservices exposed, you pay for 10 load balancers. With Ingress, all traffic enters through one load balancer, and the Ingress Controller routes to the correct ClusterIP service based on the request path or hostname. api.example.com/orders → order-service, api.example.com/inventory → inventory-service — one load balancer, many services. Much more cost-efficient and centralized for SSL termination, authentication, and rate limiting.`
      }
    },
    {
      id: 'k8s_q4',
      question: 'What are liveness and readiness probes and why are they essential for Spring Boot on Kubernetes?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'Health Checks', 'Spring Boot'],
      answer: `Health probes tell Kubernetes whether a container is healthy and ready to serve traffic. Without them, Kubernetes has no way to know if your application is stuck or unresponsive — it only knows if the container process is running.

Liveness Probe — answers "Is this container still alive?" If the liveness probe fails consecutively (failureThreshold times), Kubernetes restarts the container. Use for: detecting deadlocks, infinite loops, or any state from which the application cannot recover. Do NOT make liveness probes check deep dependencies (database, external services) — that causes all containers to restart when the database is briefly unavailable, turning a dependency outage into a self-inflicted crash loop.

Readiness Probe — answers "Is this container ready to receive traffic?" If the readiness probe fails, Kubernetes removes the pod from the Service endpoint list (stops routing traffic to it) but does NOT restart it. Use for: detecting when the application is starting up, when it's overloaded and needs to shed traffic, or when a warm-up dependency (cache fill, DB connection pool) isn't ready yet.

Spring Boot Actuator provides both:

# application.yml
management:
  endpoint:
    health:
      probes:
        enabled: true    # enables /actuator/health/liveness and /actuator/health/readiness
  health:
    livenessState:
      enabled: true
    readinessState:
      enabled: true

# Kubernetes deployment spec
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30    # wait for JVM startup
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 5
  failureThreshold: 3

initialDelaySeconds must be long enough for the Spring Boot application to fully start — typically 20–45 seconds. If it's too short, the probe fails during startup and Kubernetes restarts the container before it finishes initializing — a classic Kubernetes bootstrap failure.`,
      followUp: {
        question: 'What is a startup probe and when do you need it?',
        answer: `A startup probe is checked repeatedly until it succeeds, at which point Kubernetes switches to the liveness probe. During the startup probe period, liveness failures do not restart the container. This solves the initialDelaySeconds estimation problem — if startup time varies (3 seconds on a warm node, 60 seconds on a cold node), a fixed initialDelaySeconds will either be too short (causing restart loops on slow starts) or too long (delaying detection of crashed containers). With a startup probe, you set a generous failureThreshold (e.g., 30 attempts × 10-second period = 5 minutes maximum startup window). Once the startup probe succeeds, the tight liveness probe takes over. This is the recommended approach for Spring Boot applications in Kubernetes.`
      }
    },
    {
      id: 'k8s_q5',
      question: 'What is a HorizontalPodAutoscaler (HPA) and how do you configure it for a Spring Boot service?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'HPA', 'Auto Scaling'],
      answer: `HorizontalPodAutoscaler automatically scales the number of pod replicas based on observed CPU utilization, memory, or custom metrics. It queries the Metrics Server for current resource usage and adjusts the Deployment's replica count to maintain the target utilization.

Basic HPA on CPU:

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70   # scale when avg CPU > 70% of request

HPA works with the resource requests in the Deployment — it compares actual CPU to the requested CPU to compute utilization. If you don't set CPU requests, HPA cannot compute utilization and won't scale.

Custom metrics HPA (using Prometheus Adapter or KEDA):
- Scale on HTTP request rate (requests/second from Prometheus)
- Scale on SQS queue depth (via KEDA SQS scaler)
- Scale on JVM heap usage from Micrometer metrics

KEDA (Kubernetes Event-Driven Autoscaling) is the modern choice for event-driven scaling:

apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-worker-scaler
spec:
  scaleTargetRef:
    name: order-worker
  minReplicaCount: 0           # scale to zero when idle
  maxReplicaCount: 50
  triggers:
  - type: aws-sqs-queue
    metadata:
      queueURL: https://sqs.ap-south-1.amazonaws.com/account/order-queue
      queueLength: "5"         # one pod per 5 messages

KEDA allows scaling to zero (no pods when queue is empty, paying nothing) and scaling from zero on first message.`,
      followUp: {
        question: 'What is Vertical Pod Autoscaler (VPA) and how does it complement HPA?',
        answer: `VPA automatically adjusts CPU and memory requests/limits of containers based on historical resource usage. HPA scales horizontally (more pods); VPA scales vertically (bigger containers). VPA is useful when you are unsure of the right resource requests — it observes actual usage over time and recommends or automatically updates the values. However, VPA and HPA cannot both target the same metric simultaneously without conflicts — typically use HPA on CPU/memory for scaling replicas, and VPA in recommendation-only mode to right-size the resource requests that HPA uses as its baseline. In production, most teams use HPA for scaling and manually tune resource requests based on VPA recommendations.`
      }
    },
    {
      id: 'k8s_q6',
      question: 'What are ConfigMaps and Secrets in Kubernetes, and how do you manage them for Spring Boot?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'ConfigMap', 'Secrets', 'Spring Boot'],
      answer: `ConfigMap stores non-sensitive configuration data as key-value pairs. Secret stores sensitive data (passwords, tokens, certificates) encoded in base64 — note that base64 is encoding, not encryption. Secrets at rest are only encrypted if cluster-level encryption is configured (etcd encryption, or using AWS KMS with EKS).

Mounting as environment variables:

env:
- name: SPRING_PROFILES_ACTIVE
  valueFrom:
    configMapKeyRef:
      name: order-service-config
      key: SPRING_PROFILES_ACTIVE
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: order-service-secrets
      key: db-password

Mounting as a file (for application.yml override):

volumeMounts:
- name: config-volume
  mountPath: /app/config
volumes:
- name: config-volume
  configMap:
    name: order-service-config

Spring Boot automatically picks up config from /app/config/application.yml if it exists (via spring.config.import or default config locations).

Best practices:
1. Never store Secrets as plain values in a Git repository — use Sealed Secrets (encrypted Secret objects safe to commit), External Secrets Operator (syncs from AWS Secrets Manager), or Vault Agent Injector (injects secrets from HashiCorp Vault at pod startup).
2. Reference Secrets by name in deployments — the actual values are in the cluster, not in your GitOps repo.
3. Rotate Secrets regularly — External Secrets Operator re-syncs automatically when the source secret changes, updating the Kubernetes Secret and triggering a rolling pod update.

External Secrets Operator with AWS Secrets Manager:

apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: order-service-db-secret
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: order-service-secrets
  data:
  - secretKey: db-password
    remoteRef:
      key: /myapp/prod/db-password`,
      followUp: {
        question: 'How do you reload configuration in a running Spring Boot pod without restarting it?',
        answer: `Spring Boot Actuator's /actuator/refresh endpoint (with Spring Cloud Config) can reload @RefreshScope beans when configuration changes. In Kubernetes, you can trigger this via a post-sync Argo CD hook or a Spring Cloud Kubernetes integration that watches ConfigMap changes and triggers a refresh. However, reloading in-place without a restart is complex and error-prone — partial state inconsistencies can occur if some beans reload and others don't. The simpler, more reliable approach in Kubernetes is to perform a rolling restart: kubectl rollout restart deployment/order-service. This replaces pods gradually (zero downtime) with fresh starts that pick up the new config. With proper readiness probes and rolling update strategy, users see no interruption.`
      }
    },
    {
      id: 'k8s_q7',
      question: 'What is Helm and how does it simplify Kubernetes deployments?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'Helm', 'Deployment'],
      answer: `Helm is the package manager for Kubernetes. It templates Kubernetes YAML manifests and packages them into a unit called a chart. This solves two problems: YAML duplication across environments (dev, staging, prod have the same structure but different values), and managing multiple related resources as a single unit.

A Helm chart structure:
my-service/
├── Chart.yaml          # chart metadata (name, version, description)
├── values.yaml         # default values
├── values-prod.yaml    # production overrides
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── configmap.yaml
    ├── hpa.yaml
    └── ingress.yaml

templates/deployment.yaml uses Go templates to inject values:

apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        resources:
          {{- toYaml .Values.resources | nindent 10 }}

values.yaml (defaults):
replicaCount: 2
image:
  repository: myregistry/order-service
  tag: "1.0.0"
resources:
  requests: { cpu: "250m", memory: "512Mi" }
  limits:   { cpu: "500m", memory: "1Gi" }

Install/upgrade commands:
# Install with dev values
helm install order-service ./my-service

# Install with production values
helm install order-service ./my-service -f values-prod.yaml --set image.tag=1.2.0

# Upgrade (rolling update)
helm upgrade order-service ./my-service --set image.tag=1.3.0

# Rollback to previous release
helm rollback order-service 1

Helm release history tracks all deployments — rollback is a single command. For a team managing 20 microservices across 3 environments, Helm reduces YAML from thousands of lines per environment to a single values file per service per environment.`,
      followUp: {
        question: 'What is Helm 3 and how is it different from Helm 2?',
        answer: `Helm 2 required a server-side component called Tiller running in the cluster with broad RBAC permissions — a significant security concern. Helm 3 removed Tiller entirely. All Helm state is now stored in Kubernetes Secrets in the release namespace (not in a central server), and authentication uses the user's kubeconfig credentials. Helm 3 also added better release scoping (releases are namespace-scoped, not cluster-wide), improved chart repository support, and JSON Schema validation for values.yaml. Helm 2 is end-of-life. All modern Kubernetes tooling uses Helm 3.`
      }
    },
    {
      id: 'k8s_q8',
      question: 'How do you implement zero-downtime deployments for Spring Boot on Kubernetes?',
      difficulty: 'advanced',
      tags: ['Kubernetes', 'Deployment Strategy', 'Zero Downtime'],
      answer: `Zero-downtime deployment in Kubernetes requires proper configuration at multiple layers.

1. Rolling Update strategy — the Deployment default. Gradually replaces old pods with new ones:

spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0     # never take a pod down before a new one is ready
      maxSurge: 1           # allow 1 extra pod during rollout

With maxUnavailable: 0, Kubernetes always waits for a new pod to pass the readiness probe before terminating an old one. Traffic is never interrupted.

2. Readiness probe — properly configured (see previous question). Kubernetes only routes traffic to pods that pass readiness. New pod won't receive traffic until Spring Boot is fully started and ready.

3. Graceful shutdown — Spring Boot must finish handling in-flight requests before shutting down:

# application.yml
server.shutdown: graceful
spring.lifecycle.timeout-per-shutdown-phase: 30s

Kubernetes sends SIGTERM to the pod; Spring Boot begins graceful shutdown, stops accepting new requests, and completes existing ones. Without this, in-flight requests fail when the old pod is terminated.

4. preStop hook — adds a sleep before SIGTERM propagates to the application, accounting for the delay between Kubernetes removing the pod from service endpoints and the actual traffic stopping:

lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 5"]

Without preStop, the load balancer may still route requests to the pod for a few seconds after Kubernetes sends SIGTERM — those requests fail if the application starts shutting down immediately.

5. PodDisruptionBudget — ensures a minimum number of pods remain available during voluntary disruptions (node drains, cluster upgrades):

apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: order-service-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: order-service`,
      followUp: {
        question: 'What is a Blue-Green deployment in Kubernetes and how does it differ from rolling update?',
        answer: `In a rolling update, old and new pod versions coexist during the transition — traffic goes to both versions simultaneously. This can cause issues if the API has breaking changes where old and new versions process requests differently. In a Blue-Green deployment, you maintain two complete Deployments — Blue (current version) and Green (new version). After deploying and verifying Green in a staging-like state, you switch the Service selector from Blue to Green in a single atomic change. 100% traffic instantly moves to the new version. Rollback is instant — switch the selector back to Blue. The trade-off: Blue-Green requires double the resources during the transition period. In Kubernetes, you implement it by creating a new Deployment with a different label value (version: green) and updating the Service selector. Argo Rollouts provides a dedicated Blue-Green rollout strategy with automated analysis.`
      }
    },
    {
      id: 'k8s_q9',
      question: 'What is a Kubernetes Namespace and how do you use it for multi-tenant isolation?',
      difficulty: 'beginner',
      tags: ['Kubernetes', 'Namespace', 'Multi-tenancy'],
      answer: `A Namespace is a virtual cluster within a Kubernetes cluster — it logically separates resources (pods, services, deployments, configmaps) for different teams, environments, or applications. Resources in different namespaces are isolated from each other's names — you can have an order-service in both the dev and prod namespaces without conflict.

Common namespace patterns:

Environment separation — one cluster, multiple namespaces:
- development — dev deployments
- staging — pre-production
- production — live workloads
- monitoring — Prometheus, Grafana, ELK

Team separation — different teams own their namespaces, with RBAC preventing cross-team access.

In YAML, specify the namespace:
metadata:
  name: order-service
  namespace: production

kubectl commands with namespace:
kubectl get pods -n production
kubectl apply -f deployment.yaml -n staging
kubectl get all -n development

Cross-namespace communication — services in different namespaces can communicate using the full DNS name: order-service.production.svc.cluster.local. Services within the same namespace can use the short name: order-service.

RBAC per namespace — bind roles scoped to a namespace so the dev team can deploy to development but not production:

apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-team-binding
  namespace: development
subjects:
- kind: Group
  name: dev-team
roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io

ResourceQuota per namespace — limits total CPU, memory, and object counts within a namespace to prevent one team from consuming all cluster resources.`,
      followUp: {
        question: 'What is RBAC in Kubernetes and how do you set it up?',
        answer: `RBAC (Role-Based Access Control) controls what users and service accounts can do in the cluster. Four objects: Role (namespace-scoped permissions), ClusterRole (cluster-wide permissions), RoleBinding (binds a Role to subjects in a namespace), ClusterRoleBinding (binds a ClusterRole cluster-wide). A developer Role might allow get/list/watch on pods and deployments but not delete or create. A CI/CD service account ClusterRole allows creating and updating deployments across all namespaces. Subjects can be Users (from the identity provider), Groups, or ServiceAccounts (for pod-to-API-server communication). Always follow least privilege — grant only the specific verbs and resources each subject needs.`
      }
    },
    {
      id: 'k8s_q10',
      question: 'What are Kubernetes resource requests and limits, and how do you set them for Spring Boot?',
      difficulty: 'intermediate',
      tags: ['Kubernetes', 'Resources', 'JVM', 'Spring Boot'],
      answer: `Resource requests and limits control how much CPU and memory a container can use.

Request — the amount of resources Kubernetes guarantees to the container. Used by the scheduler to decide which node to place the pod on. A pod with CPU request 250m is scheduled on a node that has at least 250 millicores available.

Limit — the maximum the container can use. For CPU: the container is throttled if it tries to use more than the limit. For memory: if the container uses more than the memory limit, it is OOMKilled (killed immediately by the kernel) and Kubernetes restarts it.

Spring Boot JVM memory configuration:

containers:
- name: order-service
  resources:
    requests:
      cpu: "250m"
      memory: "512Mi"
    limits:
      cpu: "1000m"
      memory: "1Gi"
  env:
  - name: JAVA_OPTS
    value: "-XX:MaxRAMPercentage=75.0 -XX:+UseContainerSupport"

-XX:+UseContainerSupport — JVM reads memory limit from cgroups instead of total node RAM. Default in Java 11+.
-XX:MaxRAMPercentage=75.0 — JVM uses at most 75% of the container's memory limit for heap. Leave headroom for JVM overhead (metaspace, thread stacks, off-heap buffers).

If memory limit is 1Gi: heap max ≈ 768MB, overhead ≈ 256MB. Set the limit comfortably above what your application actually needs — OOMKilled pods restart and look like health failures.

Common mistake: setting requests equal to limits for memory (Guaranteed QoS class) is fine, but setting CPU requests equal to CPU limits causes CPU throttling during GC bursts, increasing latency spikes. Give CPU limits 2–4x the request to allow burst without throttling.`,
      followUp: {
        question: 'What is Quality of Service (QoS) in Kubernetes and why does it matter?',
        answer: `Kubernetes assigns pods a QoS class based on their resource configuration, which determines eviction priority under node memory pressure. Guaranteed — requests equal limits for all containers. The pod is the last to be evicted — safest for production workloads. Burstable — requests set but limits differ (or only requests set). Middle priority. BestEffort — no requests or limits. Evicted first under pressure — only acceptable for non-critical batch workloads. For Spring Boot production services, always set resource requests and limits to get Guaranteed or Burstable QoS. BestEffort pods can be killed at any time the node is under memory pressure, making them unreliable for services with SLAs.`
      }
    },
  ],
}

export default kubernetes
