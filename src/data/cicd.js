const cicd = {
  title: 'CI/CD Pipelines',
  description: 'Continuous Integration and Continuous Deployment using Jenkins, GitHub Actions, Docker builds, quality gates, and deployment strategies for Java microservices.',
  tags: ['CI/CD', 'Jenkins', 'GitHub Actions', 'DevOps', 'Docker', 'SonarQube'],
  questions: [
    {
      id: 'cicd_q1',
      question: 'What is CI/CD and why is it important in a microservices architecture?',
      difficulty: 'beginner',
      tags: ['CI/CD', 'Overview'],
      answer: `CI/CD stands for Continuous Integration and Continuous Delivery/Deployment â€” a practice where code changes are automatically built, tested, and deployed to production with minimal manual intervention.

Continuous Integration (CI) â€” every code push triggers an automated build and test run. Developers integrate their changes frequently (multiple times per day), and the pipeline catches integration bugs, failing tests, and code quality issues immediately â€” not days later.

Continuous Delivery (CD) â€” every successful CI build produces a release artifact (Docker image, JAR) that is deployable to production. The deployment to production is triggered manually.

Continuous Deployment â€” every successful pipeline run deploys automatically to production without manual approval.

Why it matters in microservices:

Multiple teams, multiple services â€” without CI/CD, coordinating deployments of 20 microservices across 5 teams manually is chaos. CI/CD makes each service independently deployable on its own cadence.

Faster feedback loops â€” a developer pushing code knows within 10 minutes if their change broke anything, not after weeks in a QA cycle.

Consistent deployments â€” every deployment goes through the same pipeline steps (build â†’ test â†’ static analysis â†’ security scan â†’ deploy). No snowflake manual deployments.

Rollback capability â€” every build is a versioned Docker image tagged by git commit hash. Rolling back means deploying the previous image tag.

Compliance and auditability â€” the pipeline records every deployment: who triggered it, which commit, when, to which environment. Full deployment audit trail without manual records.`,
      followUp: {
        question: 'What is the difference between Continuous Delivery and Continuous Deployment?',
        answer: `Continuous Delivery automates the pipeline up to the point of production deployment but requires a human to approve the final push to production. The artifact is always in a deployable state, but a manual gate controls when it goes live. This is appropriate for organizations with regulatory requirements, customer commitments around change windows, or features that need coordination with marketing launches. Continuous Deployment takes the human gate out entirely â€” every commit that passes all pipeline stages goes to production automatically. This requires very high confidence in automated tests, feature flags to control feature visibility independent of deployment, and excellent monitoring to detect production issues quickly. Most enterprises practice Continuous Delivery with automatic deployment to dev/staging and manual approval for production.`
      }
    },
    {
      id: 'cicd_q2',
      question: 'Describe a complete CI/CD pipeline for a Spring Boot microservice with Docker and Kubernetes.',
      difficulty: 'intermediate',
      tags: ['CI/CD', 'Pipeline', 'Docker', 'Kubernetes'],
      answer: `A production-grade pipeline for a Spring Boot service has these stages:

Stage 1: Source Trigger
- Developer pushes to a feature branch â†’ CI pipeline starts
- PR to main triggers full validation pipeline; direct push to main is blocked

Stage 2: Build and Unit Tests
- mvn clean verify (or gradle build)
- Runs unit tests, fails fast if any fail
- Produces target/app.jar

Stage 3: Code Quality Gate (SonarQube)
- mvn sonar:sonar
- Fails if: code coverage < 80%, critical/blocker issues found, quality gate fails
- Ensures code quality before any artifact is built

Stage 4: Container Build
- docker build -t myregistry/order-service:\${GIT_COMMIT} .
- Multi-stage Docker build for minimal image size

Stage 5: Container Security Scan (Trivy/Snyk)
- trivy image myregistry/order-service:\${GIT_COMMIT}
- Fails if HIGH or CRITICAL CVEs found in base image or dependencies
- Prevents deploying containers with known vulnerabilities

Stage 6: Push to Registry
- Authenticated push to ECR/GCR/Docker Hub
- Tags: git commit SHA (immutable), branch name (mutable), latest (only on main)

Stage 7: Deploy to Dev/Staging (automatic)
- helm upgrade --install order-service ./charts/order-service \
    --set image.tag=\${GIT_COMMIT} -n staging
- Runs integration tests / smoke tests against staging

Stage 8: Deploy to Production (manual approval gate)
- Slack notification: "Build ready for production â€” approve?"
- On approval: same helm upgrade to production namespace
- Post-deploy: smoke test against production health endpoints

Stage 9: Notification
- Slack/Teams message with build status, deployed version, environment

The Docker image tag is always the git commit SHA â€” this makes deployments fully traceable to source code. Never use latest in production.`,
      followUp: {
        question: 'How do you handle database migrations in a CI/CD pipeline?',
        answer: `Database migrations (Flyway or Liquibase) run as part of the Spring Boot application startup â€” when the application starts in staging or production, it applies pending migrations. This means migrations must always be backward compatible with the previous application version because the old version may still be running during a rolling update when the new version starts and runs migrations. Practices: 1. Never drop a column in the same release that stops using it â€” first release removes the code reference, second release adds the Flyway script to drop the column. 2. New columns added with DEFAULT or nullable â€” so the old application version can still write rows without the new column. 3. Some teams run migrations as a Kubernetes Job before the rolling Deployment update (initContainer or pre-deploy Job). This ensures migrations complete before new pods start, but requires the migration to not break the old pods still running.`
      }
    },
    {
      id: 'cicd_q3',
      question: 'Write a GitHub Actions workflow for a Spring Boot application.',
      difficulty: 'intermediate',
      tags: ['GitHub Actions', 'CI/CD'],
      answer: `A complete GitHub Actions workflow for a Spring Boot service:

# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 21
      uses: actions/setup-java@v4
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven        # cache ~/.m2 between runs

    - name: Run tests
      run: mvn clean verify

    - name: Code Coverage Report
      uses: codecov/codecov-action@v3

    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}

  docker-build-push:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
    - uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: \${{ env.REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
          \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:latest
        cache-from: type=gha   # GitHub Actions cache for Docker layers
        cache-to:   type=gha,mode=max

    - name: Security Scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
        severity: HIGH,CRITICAL
        exit-code: '1'          # fail if vulnerabilities found

  deploy-staging:
    needs: docker-build-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - name: Deploy to EKS staging
      run: |
        aws eks update-kubeconfig --name my-cluster --region ap-south-1
        helm upgrade --install order-service ./charts/order-service \
          --set image.tag=\${{ github.sha }} -n staging --wait
      env:
        AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}

Key features: job dependency with needs, environment protection rules for staging/production, secrets for credentials, Docker layer caching, security scanning that blocks on HIGH/CRITICAL CVEs.`,
      followUp: {
        question: 'How do you manage secrets in GitHub Actions without hardcoding them?',
        answer: `GitHub provides encrypted Secrets (Settings â†’ Secrets and variables â†’ Actions) that are injected as environment variables at runtime â€” never visible in logs, masked in output. For AWS credentials, prefer OIDC federation over long-lived access keys: configure GitHub as an OIDC identity provider in AWS IAM, create an IAM role trusted by GitHub Actions, and use the aws-actions/configure-aws-credentials action with role-to-assume â€” no static access keys stored as secrets at all, AWS issues a short-lived token for each workflow run. For other secrets (SonarQube token, Docker registry, Slack webhooks), use GitHub Secrets scoped to the specific repository or organization. Repository environments (staging, production) can have environment-specific secrets and require manual approvals, adding an approval gate before deployment secrets are unlocked.`
      }
    },
    {
      id: 'cicd_q4',
      question: 'What is a Jenkins Pipeline and how does it compare to GitHub Actions?',
      difficulty: 'intermediate',
      tags: ['Jenkins', 'CI/CD'],
      answer: `Jenkins is a self-hosted, open-source CI/CD server. A Jenkins Pipeline is a Groovy-based DSL (Declarative or Scripted) that defines the pipeline as code (Jenkinsfile) stored in the repository.

Declarative Jenkinsfile for Spring Boot:

pipeline {
    agent any
    tools {
        maven 'Maven3'
        jdk 'JDK21'
    }
    environment {
        DOCKER_REGISTRY = 'myregistry.azurecr.io'
        IMAGE_TAG = "\${env.GIT_COMMIT[0..7]}"
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build & Test') {
            steps {
                sh 'mvn clean verify'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                    jacoco(execPattern: 'target/*.exec')
                }
            }
        }
        stage('SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'mvn sonar:sonar'
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Docker Build & Push') {
            steps {
                script {
                    docker.withRegistry("https://\${DOCKER_REGISTRY}", 'acr-credentials') {
                        def image = docker.build("\${DOCKER_REGISTRY}/order-service:\${IMAGE_TAG}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        stage('Deploy to Staging') {
            steps {
                sh "helm upgrade --install order-service ./charts --set image.tag=\${IMAGE_TAG} -n staging"
            }
        }
    }
    post {
        success { slackSend color: 'good', message: "Build successful: \${env.JOB_NAME} #\${env.BUILD_NUMBER}" }
        failure { slackSend color: 'danger', message: "Build FAILED: \${env.JOB_NAME} #\${env.BUILD_NUMBER}" }
    }
}

Jenkins vs GitHub Actions:

Jenkins: self-hosted (you manage the server and agents), highly customizable via 1000+ plugins, free (infrastructure cost only), works for any Git provider, complex to maintain and scale.

GitHub Actions: cloud-hosted by GitHub, simpler YAML syntax, tight GitHub integration (no webhook setup), marketplace of community actions, per-minute pricing for private repos, limited self-hosted runner control.

Choice: GitHub Actions is simpler for teams already on GitHub. Jenkins is preferred when you need on-premise hosting for compliance, complex build environments, or are on Bitbucket/GitLab.`,
      followUp: {
        question: 'What is a Jenkins shared library and why is it useful?',
        answer: `A Jenkins shared library is a reusable Groovy code library stored in a separate Git repository that multiple Jenkinsfiles can import. Instead of duplicating the same Docker build steps, Helm deploy logic, and Slack notifications in every service's Jenkinsfile, you write them once in the shared library and reference them with @Library('my-pipeline-lib'). This means you can update the deployment logic in one place and all pipelines automatically pick it up on the next run. It also enforces consistency â€” all services go through the same quality gates and notification steps regardless of what individual teams put in their Jenkinsfiles.`
      }
    },
    {
      id: 'cicd_q5',
      question: 'What is GitOps and how does ArgoCD implement it for Kubernetes deployments?',
      difficulty: 'intermediate',
      tags: ['CI/CD', 'GitOps', 'ArgoCD', 'Kubernetes'],
      answer: `GitOps is a deployment paradigm where the desired state of your infrastructure and applications is stored in Git as the single source of truth. Changes are made by committing to Git; an automated agent detects the drift between desired state (Git) and actual state (cluster) and reconciles them.

This is different from traditional CI/CD where the pipeline imperatively runs kubectl apply or helm upgrade â€” in GitOps, the cluster pulls from Git, not the pipeline pushing to the cluster.

Benefits:
- Audit trail â€” every cluster change is a Git commit with author, timestamp, and diff
- Rollback = git revert â€” revert the commit, ArgoCD applies the previous state
- Disaster recovery â€” rebuild any environment from the Git repository
- No kubectl access required for developers â€” changes happen through PRs

ArgoCD is the most widely used GitOps tool for Kubernetes. It continuously watches a Git repository and applies changes to the cluster when the repository diverges from the cluster state.

ArgoCD Application manifest:

apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/k8s-manifests
    targetRevision: HEAD
    path: apps/order-service/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true      # delete resources removed from Git
      selfHeal: true   # revert manual kubectl changes
    syncOptions:
    - CreateNamespace=true

Pipeline integration: the CI pipeline builds and pushes the Docker image, then updates the image tag in the k8s-manifests Git repo (a separate repo from application code). ArgoCD detects the change and deploys automatically. This separation keeps application code and deployment config in different repositories with different access controls.`,
      followUp: {
        question: 'What is the difference between ArgoCD and Flux?',
        answer: `Both implement GitOps for Kubernetes but with different architectures. ArgoCD provides a rich web UI for visualizing application state, sync status, and deployment history â€” very useful for teams that want visibility into cluster state. It uses a hub-and-spoke model with a central ArgoCD controller. Flux is more lightweight and CLI-driven, with stronger multi-tenancy support (each team can have their own Flux instance). Flux v2 uses Kubernetes controllers for each concern (GitRepository, Kustomization, HelmRelease) following the controller pattern more natively. ArgoCD has better UX and is more commonly used in enterprise environments; Flux is preferred by teams that want closer Kubernetes native integration. Both are CNCF projects and production-proven.`
      }
    },
    {
      id: 'cicd_q6',
      question: 'What is SonarQube and how do you integrate it into a Spring Boot CI pipeline?',
      difficulty: 'intermediate',
      tags: ['SonarQube', 'Code Quality', 'CI/CD'],
      answer: `SonarQube is a static code analysis tool that measures code quality across multiple dimensions: bugs, vulnerabilities, code smells, duplications, test coverage, and technical debt. It integrates into CI pipelines as a quality gate â€” failing the pipeline if quality metrics fall below configured thresholds.

Integration with Spring Boot Maven:

# Run analysis (in CI pipeline, after tests)
mvn clean verify sonar:sonar \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.login=\${SONAR_TOKEN} \
  -Dsonar.projectKey=order-service \
  -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

JaCoCo must be configured in pom.xml to generate coverage reports:

<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <executions>
    <execution>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>test</phase>
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>

Quality Gate configuration (in SonarQube UI):
- Coverage on new code >= 80%
- Duplicated lines < 3%
- Maintainability rating = A
- Reliability rating = A (no new bugs)
- Security rating = A (no new vulnerabilities)
- New Critical/Blocker issues = 0

In GitHub Actions, use SonarCloud (SaaS version) with the sonarcloud-github-action. It comments on PRs with the analysis results and fails the PR if the quality gate fails.

waitForQualityGate in Jenkins (abortPipeline: true) polls the SonarQube server after analysis completes and fails the pipeline if the quality gate fails â€” this is necessary because sonar:sonar returns success even if the gate fails; the gate result is computed asynchronously.`,
      followUp: {
        question: 'What are the key metrics SonarQube tracks and what do they mean?',
        answer: `Bugs â€” code patterns that are likely to produce incorrect behavior. Counted, weighted by severity (Blocker, Critical, Major, Minor, Info). Vulnerabilities â€” security weaknesses (SQL injection, hardcoded credentials, XSS). These are the highest priority to fix. Code Smells â€” maintainability issues (overly complex methods, duplicated code, long parameter lists) that make code hard to maintain but don't directly cause bugs. Technical Debt â€” an estimate (in hours/days) of how long it would take to fix all code smells. Coverage â€” what percentage of lines/branches are executed by tests. SonarQube uses JaCoCo report for Java. Duplications â€” copy-pasted code that should be extracted into shared methods. Security Hotspots â€” code that requires a security review but might not be a vulnerability â€” e.g., use of a cryptographic function. The developer must mark it as Reviewed (safe) or as a Vulnerability to fix.`
      }
    },
    {
      id: 'cicd_q7',
      question: 'Explain blue-green, canary, and rolling deployment strategies and when to use each.',
      difficulty: 'advanced',
      tags: ['CI/CD', 'Deployment Strategy', 'Kubernetes'],
      answer: `These three strategies offer different trade-offs between risk, speed, and resource cost.

Rolling Deployment â€” gradually replaces old pods with new ones. Traffic shifts to new pods as they become ready. Old and new versions coexist temporarily.
- Risk: if the new version has a bug, some users see it before rollback
- Cost: no extra resources required (stays at N pods throughout)
- Best for: backward-compatible changes, stateless services, most everyday deployments

Blue-Green Deployment â€” two full environments (Blue = old, Green = new). Green is deployed and tested while Blue handles all traffic. Traffic switches atomically (DNS change or load balancer rule change) from Blue to Green.
- Risk: low â€” you test Green fully before any user sees it; rollback is instant (switch back to Blue)
- Cost: double resources during transition (both Blue and Green running)
- Best for: breaking API changes, major version releases, high-stakes deployments where instant rollback is critical

Canary Deployment â€” new version is deployed to a small percentage of pods (e.g., 5%). A subset of real users hit the new version. Monitor metrics (error rate, latency) on the canary. Gradually increase traffic percentage if metrics are healthy, until 100%.
- Risk: minimum user impact if canary has a bug (only 5% affected)
- Cost: slightly more resources for the canary
- Best for: large user bases where even a brief full rollout of a broken version is unacceptable; A/B testing behavior differences; performance-sensitive changes

In Kubernetes:
- Rolling: built into Deployment spec (default)
- Blue-Green: two Deployments + Service selector switch (or Argo Rollouts BlueGreen strategy)
- Canary: weighted traffic splitting via Argo Rollouts, Istio VirtualService, or NGINX Ingress canary annotations

Argo Rollouts canary example:
spec:
  strategy:
    canary:
      steps:
      - setWeight: 5      # 5% traffic to canary
      - pause: { duration: 10m }
      - setWeight: 30
      - pause: { duration: 10m }
      - setWeight: 100    # full rollout
      analysis:
        templates:
        - templateName: error-rate   # auto-rollback if error rate > threshold`,
      followUp: {
        question: 'What is a feature flag and how does it complement CI/CD?',
        answer: `A feature flag is a conditional in the code that enables or disables a feature at runtime without a deployment. You deploy code with the new feature disabled (behind an if featureFlag.isEnabled("new-checkout") check), then enable it in production via a flag management service (LaunchDarkly, AWS AppConfig, Unleash) without deploying again. This decouples deployment from release â€” you can deploy the code to production and gradually enable the feature for 1%, 10%, 100% of users, or roll it back instantly if issues appear. Feature flags allow continuous deployment (every commit goes to production) without exposing every commit's changes to users immediately. They also enable A/B testing by enabling the feature for specific user segments.`
      }
    },
  ],
}

export default cicd

