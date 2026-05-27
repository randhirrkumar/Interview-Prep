const azure = {
  title: 'Azure Basics',
  description: 'Azure services for Java developers — deployment, configuration, monitoring, HTTP/HTTPS, environment variables.',
  tags: ['Azure', 'Cloud', 'DevOps', 'Deployment'],
  questions: [
    {
      id: 1,
      question: 'What is Azure App Service and how do you deploy a Spring Boot JAR on it?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Azure', 'App Service', 'Deployment'],
      answer: `Azure App Service is a fully managed PaaS platform for hosting web applications. For Java/Spring Boot, it supports running JARs directly without managing the underlying infrastructure like VMs.

In my project, we deployed our Spring Boot microservices to Azure App Service. The flow was:
1. Build the JAR using Maven: mvn clean package
2. Push to Azure using Azure DevOps pipeline or az CLI
3. Azure App Service runs it with its embedded Tomcat

The service handles OS patching, scaling, load balancing, SSL certificates — we just deploy code. That's the key benefit.

For environment variables, we used App Service Configuration instead of hardcoding. For secrets like DB passwords, we used Azure Key Vault references.`,
      code: `# Method 1: Deploy via Azure CLI
az webapp create \\
  --resource-group myResourceGroup \\
  --plan myAppServicePlan \\
  --name my-spring-boot-app \\
  --runtime "JAVA:17:Java SE:17"

# Deploy the JAR
az webapp deploy \\
  --resource-group myResourceGroup \\
  --name my-spring-boot-app \\
  --src-path target/myapp-1.0.0.jar \\
  --type jar

# Method 2: Azure DevOps Pipeline (azure-pipelines.yml)
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: Maven@3
  inputs:
    mavenPomFile: 'pom.xml'
    goals: 'clean package -DskipTests'

- task: AzureWebApp@1
  inputs:
    azureSubscription: 'my-service-connection'
    appName: 'my-spring-boot-app'
    package: '$(System.DefaultWorkingDirectory)/target/*.jar'

# Check deployment
az webapp log tail --name my-spring-boot-app --resource-group myResourceGroup

# Set startup command if needed
az webapp config set \\
  --name my-spring-boot-app \\
  --resource-group myResourceGroup \\
  --startup-file "java -jar /home/site/wwwroot/app.jar --server.port=8080"`,
      followUp: [
        'What is the difference between Azure App Service and Azure Virtual Machines for hosting Java apps?',
        'What is an App Service Plan? What are the pricing tiers?',
        'How do you enable auto-scaling on Azure App Service?',
      ],
      tip: 'Azure App Service listens on port 80/443. Your Spring Boot app runs on 8080 but Azure proxies requests. Use server.port=8080 in application.properties.',
    },
    {
      id: 2,
      question: 'How do you manage environment variables and configuration in Azure?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Azure', 'Configuration', 'App Configuration', 'Key Vault'],
      answer: `There are multiple levels of configuration in Azure:

1. App Service Application Settings — equivalent to environment variables. These override application.properties. You set DB_URL, DB_USERNAME etc here. They are encrypted at rest.

2. Azure App Configuration — a centralized config service. I used this when we had multiple microservices sharing common config. Instead of setting the same DB URL in 10 different App Services, I stored it in App Configuration once and referenced it from all apps.

3. Azure Key Vault — for sensitive secrets like passwords, connection strings, API keys. App Service has managed identity support, so the app can access Key Vault without storing credentials anywhere.

In my project, the config hierarchy was: App Configuration → Key Vault for secrets → App Service settings for app-specific overrides.`,
      code: `# Setting App Service environment variables
az webapp config appsettings set \\
  --name my-spring-boot-app \\
  --resource-group myResourceGroup \\
  --settings \\
    SPRING_DATASOURCE_URL="jdbc:mysql://mydb.mysql.database.azure.com/mydb" \\
    SPRING_DATASOURCE_USERNAME="admin@mydb" \\
    SPRING_PROFILES_ACTIVE="prod" \\
    KAFKA_BOOTSTRAP_SERVERS="my-event-hub.servicebus.windows.net:9093"

# Spring Boot reads App Settings as environment variables
# application.properties:
spring.datasource.url=\${SPRING_DATASOURCE_URL}
spring.datasource.username=\${SPRING_DATASOURCE_USERNAME}
spring.profiles.active=\${SPRING_PROFILES_ACTIVE:dev}

# Azure App Configuration (Spring Boot integration)
# pom.xml:
<dependency>
  <groupId>com.azure.spring</groupId>
  <artifactId>spring-cloud-azure-appconfiguration-config</artifactId>
  <version>4.x.x</version>
</dependency>

# bootstrap.properties:
spring.cloud.azure.appconfiguration.stores[0].connection-string=\\
  Endpoint=https://myconfig.azconfig.io;Id=...

# Azure Key Vault reference in App Settings (no secret in code!)
@Microsoft.KeyVault(VaultName=myKeyVault;SecretName=db-password)

# Accessing secrets via Spring Cloud Azure
@Value("\${db-password}")
private String dbPassword;  // automatically fetched from Key Vault`,
      followUp: [
        'What is Managed Identity in Azure? Why is it better than connection strings?',
        'What is the difference between App Configuration and Key Vault?',
        'How do you rotate secrets in Azure Key Vault without app downtime?',
      ],
      tip: 'Use Managed Identity to access Key Vault — it eliminates storing any credentials. This is the Azure-recommended approach and shows security maturity.',
    },
    {
      id: 3,
      question: 'How does HTTP and HTTPS work in Azure App Service?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Azure', 'HTTPS', 'SSL', 'Networking'],
      answer: `Azure App Service handles SSL/TLS termination at the load balancer level. Your Spring Boot app runs over HTTP on port 8080 internally, but users connect via HTTPS on port 443. Azure decrypts the HTTPS traffic and forwards it as HTTP to your app.

For HTTPS:
- Every App Service gets a free *.azurewebsites.net certificate by default
- For custom domains, you can upload your own SSL certificate or use App Service Managed Certificates (free!)

To enforce HTTPS only (redirect HTTP → HTTPS), we enable HTTPS Only in the App Service settings. Your app doesn't need to manage SSL at all.

The X-Forwarded-Proto header tells your app that the original request was HTTPS even though it received HTTP. Spring Boot's server.forward-headers-strategy=FRAMEWORK handles this.`,
      code: `# Enable HTTPS Only (redirect all HTTP to HTTPS)
az webapp update \\
  --name my-spring-boot-app \\
  --resource-group myResourceGroup \\
  --https-only true

# Spring Boot config for behind reverse proxy (Azure LB/App Service)
# application.properties:
server.port=8080
server.forward-headers-strategy=FRAMEWORK  # handles X-Forwarded-* headers

# This ensures redirect_uri and HttpServletRequest.getScheme()
# return "https" instead of "http"

# Minimum TLS version (security best practice)
az webapp config set \\
  --name my-spring-boot-app \\
  --resource-group myResourceGroup \\
  --min-tls-version 1.2

# Custom domain + managed certificate
az webapp config hostname add \\
  --webapp-name my-spring-boot-app \\
  --resource-group myResourceGroup \\
  --hostname api.mycompany.com

az webapp config ssl create \\
  --hostname api.mycompany.com \\
  --name my-spring-boot-app \\
  --resource-group myResourceGroup

# Health check URL for App Service (App Service calls this)
management.endpoint.health.enabled=true
management.endpoints.web.exposure.include=health,info`,
      followUp: [
        'What is SSL offloading/termination? Why is it done at the load balancer?',
        'What is the difference between HTTP/1.1 and HTTP/2?',
        'How do you handle CORS in Azure-deployed Spring Boot APIs?',
      ],
      tip: 'When deploying behind Azure Front Door or Application Gateway, also set server.use-forward-headers=true to correctly resolve client IP addresses.',
    },
    {
      id: 4,
      question: 'How do you monitor a Spring Boot application on Azure?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Azure', 'Monitoring', 'Application Insights', 'Logging'],
      answer: `The primary monitoring tool on Azure is Application Insights, which is part of Azure Monitor.

Application Insights gives us:
- Live metrics (requests/sec, response time, failures)
- Distributed tracing across microservices
- Exception tracking
- Custom events and metrics
- Log Analytics (query with Kusto Query Language - KQL)
- Smart Detection (auto-detects anomalies)

In my EPLMS project, we integrated Application Insights into our Spring Boot microservices. Every API call was automatically tracked — latency, success rate, dependencies. When our Kafka consumer lag increased, the latency charts showed it immediately.

We also used it to trace a specific vehicle event across 3 microservices — from the REST API all the way to the database write — using the correlation ID.`,
      code: `<!-- Add Application Insights to pom.xml -->
<dependency>
    <groupId>com.microsoft.azure</groupId>
    <artifactId>applicationinsights-spring-boot-starter</artifactId>
    <version>2.6.4</version>
</dependency>

# application.properties
azure.application-insights.instrumentation-key=\${APPINSIGHTS_INSTRUMENTATIONKEY}
azure.application-insights.enabled=true
azure.application-insights.web.enabled=true

# Custom metrics and events
@Service
public class VehicleEventService {
    @Autowired
    private TelemetryClient telemetryClient;  // from App Insights

    public void processEvent(VehicleEvent event) {
        long start = System.currentTimeMillis();
        try {
            doProcess(event);

            // Track custom metric
            telemetryClient.trackMetric("EventProcessingTime",
                System.currentTimeMillis() - start);

            // Track custom event
            telemetryClient.trackEvent("VehicleEventProcessed",
                Map.of("vehicleId", event.getVehicleId(),
                       "eventType", event.getType()), null);
        } catch (Exception e) {
            // Track exception
            telemetryClient.trackException(e);
            throw e;
        }
    }
}

# Viewing logs: Azure Portal > App Service > Log Stream
# Or query with KQL in Log Analytics:
# requests | where timestamp > ago(1h) | summarize avg(duration) by name`,
      followUp: [
        'What is distributed tracing? How does Application Insights correlate requests across microservices?',
        'What is the difference between logs, metrics, and traces?',
        'How do you set up alerts in Azure Monitor?',
      ],
      tip: 'Application Insights uses a correlation ID (operation_Id) to trace a request across services. This is key for debugging microservice issues in production.',
    },
    {
      id: 5,
      question: 'How do you run a JAR file on Azure? Different deployment approaches.',
      difficulty: 'beginner',
      asked: true,
      tags: ['Azure', 'Deployment', 'JAR'],
      answer: `Multiple ways to run a JAR on Azure, depending on the use case:

1. Azure App Service (PaaS): Upload the JAR, Azure runs it. Best for web apps. No infrastructure management.

2. Azure Container Instance (ACI): Package JAR in Docker container, run as a standalone container. Good for batch jobs or one-off tasks.

3. Azure Kubernetes Service (AKS): Run containers at scale with orchestration. Best for microservices needing auto-scaling, service discovery, rolling deployments.

4. Azure VM: Traditional approach — SSH into VM, install Java, run JAR with nohup or systemd. Full control but you manage everything.

In my projects we used App Service for web services and AKS for microservices that needed independent scaling. Our Kafka consumers ran as separate deployments in AKS.`,
      code: `# Option 1: Azure App Service (easiest)
az webapp deploy \\
  --name my-app \\
  --resource-group rg-prod \\
  --src-path target/app.jar \\
  --type jar

# Option 2: Docker Container on Azure Container Registry + App Service
# Step 1: Build Docker image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]

# Step 2: Push to Azure Container Registry
az acr build --registry myRegistry --image myapp:latest .

# Step 3: Deploy to App Service from ACR
az webapp config container set \\
  --name my-app \\
  --resource-group rg-prod \\
  --container-image-name myRegistry.azurecr.io/myapp:latest

# Option 3: Run on Azure VM (traditional)
# After SSH into VM:
sudo apt install openjdk-17-jdk
nohup java -jar -Xmx1g -Dspring.profiles.active=prod app.jar > app.log 2>&1 &

# As systemd service (better)
[Unit]
Description=Spring Boot App
After=network.target

[Service]
Type=simple
User=appuser
ExecStart=/usr/bin/java -jar /opt/app/app.jar
Restart=always

[Install]
WantedBy=multi-user.target`,
      followUp: [
        'What is the difference between App Service and AKS for microservices?',
        'What JVM flags do you typically use in production Azure deployments?',
        'How do you do zero-downtime deployments on Azure App Service?',
      ],
      tip: 'Azure App Service supports Deployment Slots — deploy to a staging slot, test, then swap with production. Zero downtime. Mention this.',
    },
    {
      id: 6,
      question: 'What is Azure DevOps? How do you set up a CI/CD pipeline for a Spring Boot app?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Azure DevOps', 'CI/CD', 'Pipeline'],
      answer: `Azure DevOps is Microsoft's DevOps platform with source control (Azure Repos), CI/CD pipelines (Azure Pipelines), work item tracking (Azure Boards), and artifact management (Azure Artifacts).

In my EPLMS project, we used Azure DevOps for the complete pipeline:
- Code commit → triggers Azure Pipeline
- Pipeline builds Maven project, runs JUnit tests
- Docker image built and pushed to Azure Container Registry
- Deployment to staging environment
- Manual approval gate for production
- Deploy to production

The key thing is separating CI (build + test) from CD (deploy). CI runs on every PR. CD runs on main branch merges.`,
      code: `# azure-pipelines.yml — Complete CI/CD for Spring Boot

trigger:
  branches:
    include: [main, develop]

variables:
  imageName: 'my-spring-app'
  containerRegistry: 'myacr.azurecr.io'
  appName: 'my-spring-boot-service'
  resourceGroup: 'rg-production'

stages:
# Stage 1: Build & Test
- stage: Build
  displayName: 'Build & Test'
  jobs:
  - job: BuildJob
    pool:
      vmImage: 'ubuntu-latest'
    steps:
    - task: JavaToolInstaller@0
      inputs:
        versionSpec: '17'
        jdkArchitectureOption: 'x64'
        jdkSourceOption: 'PreInstalled'

    - task: Maven@3
      displayName: 'Maven Build & Test'
      inputs:
        mavenPomFile: 'pom.xml'
        goals: 'clean verify'
        options: '-P prod'
        publishJUnitResults: true
        testResultsFiles: '**/surefire-reports/TEST-*.xml'

    - task: Docker@2
      displayName: 'Build Docker Image'
      inputs:
        command: buildAndPush
        containerRegistry: 'acr-service-connection'
        repository: '$(imageName)'
        dockerfile: 'Dockerfile'
        tags: |
          $(Build.BuildId)
          latest

# Stage 2: Deploy to Staging
- stage: DeployStaging
  displayName: 'Deploy to Staging'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployToStaging
    environment: 'staging'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebAppContainer@1
            inputs:
              azureSubscription: 'azure-service-connection'
              appName: '$(appName)-staging'
              containers: '$(containerRegistry)/$(imageName):$(Build.BuildId)'

# Stage 3: Production (with manual approval)
- stage: DeployProd
  displayName: 'Deploy to Production'
  dependsOn: DeployStaging
  jobs:
  - deployment: DeployToProduction
    environment: 'production'  # environment has approval gates configured
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebAppContainer@1
            inputs:
              azureSubscription: 'azure-service-connection'
              appName: '$(appName)'
              containers: '$(containerRegistry)/$(imageName):$(Build.BuildId)'`,
      followUp: [
        'What is the difference between Azure Pipelines and GitHub Actions?',
        'What are deployment environments and approval gates?',
        'How do you roll back a deployment if something goes wrong?',
      ],
      tip: 'Mention deployment slots for zero-downtime: deploy to staging slot → automated smoke tests → slot swap to production. Very impressive answer.',
    },
    {
      id: 7,
      question: 'What is Azure Event Hubs and how does it relate to Apache Kafka?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Azure', 'Kafka', 'Event Hubs'],
      answer: `Azure Event Hubs has a Kafka-compatible API. This means your existing Spring Boot Kafka producer/consumer code works with Event Hubs with minimal config changes — just change the bootstrap server and authentication.

In my EPLMS project, we used Azure Event Hubs as our managed Kafka service on Azure. The benefit: no managing Zookeeper, brokers, or infrastructure. Azure handles scaling, availability, and retention.

The key difference from self-managed Kafka:
- Event Hubs uses SASL/SSL authentication (not plain like local dev Kafka)
- Partitions = consumer parallelism (same concept)
- Consumer groups work the same way
- Message retention is configurable (default 1-7 days)`,
      code: `# application.properties for Azure Event Hubs (Kafka protocol)
spring.kafka.bootstrap-servers=\${EVENT_HUB_NAMESPACE}.servicebus.windows.net:9093

spring.kafka.properties.security.protocol=SASL_SSL
spring.kafka.properties.sasl.mechanism=PLAIN
spring.kafka.properties.sasl.jaas.config=\\
  org.apache.kafka.common.security.plain.PlainLoginModule required \\
  username="$ConnectionString" \\
  password="\${EVENT_HUB_CONNECTION_STRING}";

# SSL trust store
spring.kafka.properties.ssl.truststore.location=/etc/ssl/certs/ca-certificates.crt

# Producer
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer

# Consumer
spring.kafka.consumer.group-id=vehicle-event-processors
spring.kafka.consumer.auto-offset-reset=earliest

# Your existing Spring Kafka code works without changes!
@KafkaListener(topics = "vehicle-events", groupId = "eplms-processors")
public void consume(VehicleEvent event) {
    processEvent(event);
}`,
      followUp: [
        'What is the difference between Azure Event Hubs and Azure Service Bus?',
        'How do you handle Kafka consumer lag monitoring on Azure?',
      ],
    },
  ],
}

export default azure
