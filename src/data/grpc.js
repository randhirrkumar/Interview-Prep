const grpc = {
  title: 'gRPC',
  description: 'gRPC fundamentals, Protocol Buffers, streaming patterns, Spring Boot integration, interceptors, and when to choose gRPC over REST or GraphQL for microservices communication.',
  tags: ['gRPC', 'Protocol Buffers', 'Protobuf', 'Streaming', 'Microservices'],
  questions: [
    {
      id: 'grpc_q1',
      question: 'What is gRPC and how does it differ from REST and GraphQL?',
      difficulty: 'beginner',
      tags: ['gRPC', 'REST', 'Comparison'],
      answer: `gRPC is a high-performance, open-source Remote Procedure Call (RPC) framework developed by Google. It uses Protocol Buffers (protobuf) as its interface definition language and serialization format, and HTTP/2 as its transport.

Comparison:

Protocol:
- REST: HTTP/1.1 or HTTP/2, JSON/XML — human-readable, large payload size, no strict schema.
- GraphQL: HTTP (usually POST), JSON — flexible schema, single endpoint.
- gRPC: HTTP/2, Protocol Buffers — binary serialization, strict schema, generated code.

Performance:
- REST JSON: ~1x baseline
- gRPC protobuf: typically 3–10x smaller payload, faster serialization/deserialization, multiplexed HTTP/2 connections

API definition:
- REST: OpenAPI/Swagger (optional, description only)
- GraphQL: GraphQL schema (mandatory, type-safe)
- gRPC: .proto file (mandatory, generates client AND server code for multiple languages)

Streaming:
- REST: limited (SSE for server push, WebSocket for bidirectional)
- GraphQL: subscriptions over WebSocket
- gRPC: native streaming — server streaming, client streaming, bidirectional streaming built into the protocol

Code generation:
- REST/GraphQL: client SDKs are written manually
- gRPC: the protoc compiler generates type-safe client stubs and server interfaces in any language

Browser support:
- REST/GraphQL: direct from browser
- gRPC: requires gRPC-Web proxy (grpc-gateway or Envoy) for browser clients — native gRPC uses HTTP/2 trailers which browsers don't expose

Use gRPC for: internal service-to-service communication where performance matters, polyglot environments (Java service calling Go service calling Python service), streaming data (sensor telemetry, real-time feeds), when strong API contracts across teams are essential.`,
      followUp: {
        question: 'Why does gRPC use HTTP/2 and what advantages does that provide?',
        answer: `HTTP/2 enables multiplexing — multiple requests and responses can be interleaved over a single TCP connection simultaneously. HTTP/1.1 is head-of-line blocked — each request/response must complete before the next begins on a given connection (though browsers open multiple connections to work around this). With HTTP/2 multiplexing: one gRPC connection between two microservices can carry thousands of concurrent RPC calls, avoiding connection creation overhead per call. HTTP/2 also provides header compression (HPACK) — gRPC adds very few headers, and they compress well with repeated calls. Binary framing — HTTP/2 frames data in a binary format natively, which pairs well with gRPC's binary protobuf payload (no need to base64 encode binary data as in REST JSON). Flow control — per-stream flow control allows the receiver to signal how much data it's ready to accept, preventing fast senders from overwhelming slow receivers — essential for streaming RPCs.`
      }
    },
    {
      id: 'grpc_q2',
      question: 'Explain Protocol Buffers and how you define a gRPC service.',
      difficulty: 'beginner',
      tags: ['gRPC', 'Protocol Buffers', 'Schema'],
      answer: `Protocol Buffers (protobuf) is a language-neutral, platform-neutral serialization format. You define your data structures and service contracts in a .proto file; the protoc compiler generates code for any supported language.

// order.proto
syntax = "proto3";
package com.myapp.order;
option java_package = "com.myapp.order.grpc";
option java_multiple_files = true;

// Data message definitions
message Order {
  string id = 1;
  string customer_id = 2;
  OrderStatus status = 3;
  repeated OrderItem items = 4;    // repeated = list
  double total_amount = 5;
  google.protobuf.Timestamp created_at = 6;
}

message OrderItem {
  string product_id = 1;
  int32 quantity = 2;
  double unit_price = 3;
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;   // proto3: first enum value must be 0
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_PROCESSING = 2;
  ORDER_STATUS_SHIPPED = 3;
  ORDER_STATUS_DELIVERED = 4;
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated OrderItem items = 2;
}

message GetOrderRequest {
  string order_id = 1;
}

message OrderListRequest {
  string customer_id = 1;
  int32 page_size = 2;
  string page_token = 3;
}

message OrderListResponse {
  repeated Order orders = 1;
  string next_page_token = 2;
}

// Service definition
service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc ListOrders(OrderListRequest) returns (OrderListResponse);
  rpc WatchOrderStatus(GetOrderRequest) returns (stream Order);  // server streaming
  rpc BulkCreateOrders(stream CreateOrderRequest) returns (OrderListResponse);  // client streaming
  rpc OrderChat(stream ChatMessage) returns (stream ChatMessage);  // bidirectional
}

Field numbers (= 1, = 2, etc.) are used in binary encoding — they must never change for backward compatibility. Adding new fields is safe. Removing fields should use reserved keyword. Proto3 defaults all missing fields to zero values (0, "", false, empty list) — there is no null concept (use google.protobuf.StringValue wrapper for nullable strings).

protoc with the protoc-gen-grpc-java plugin generates Java stubs from the .proto file. In Spring Boot with the grpc-spring-boot-starter, this is automated via the Maven/Gradle protobuf plugin.`,
      followUp: {
        question: 'What is the difference between proto2 and proto3?',
        answer: `Proto2 has required and optional field modifiers — fields can be explicitly required (compilation fails if missing) or optional (has a has_fieldname() presence check). Proto3 removed required (all fields are optional) and simplified the language. In proto3, all fields default to their zero value if not set — there is no way to distinguish between "field explicitly set to 0" and "field not set" without wrapper types. Proto3 dropped field default values (other than the implicit zero), removed groups (a legacy feature), and made extensions optional via Any type. Proto3 is recommended for new APIs — it's simpler, more forward-compatible, and gRPC exclusively supports proto3. Most enterprise teams use proto3.`
      }
    },
    {
      id: 'grpc_q3',
      question: 'How do you implement a gRPC server and client in Spring Boot?',
      difficulty: 'intermediate',
      tags: ['gRPC', 'Spring Boot', 'Implementation'],
      answer: `Using grpc-spring-boot-starter (by LogNet or net.devh):

Maven dependency:

<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-server-spring-boot-starter</artifactId>
    <version>2.15.0.RELEASE</version>
</dependency>
<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-client-spring-boot-starter</artifactId>
    <version>2.15.0.RELEASE</version>
</dependency>

Build plugin generates Java stubs from .proto files:

<plugin>
    <groupId>com.google.protobuf</groupId>
    <artifactId>protobuf-maven-plugin</artifactId>
    <configuration>
        <protocArtifact>com.google.protobuf:protoc:3.25.0:exe:\${os.detected.classifier}</protocArtifact>
        <pluginId>grpc-java</pluginId>
        <pluginArtifact>io.grpc:protoc-gen-grpc-java:1.62.0:exe:\${os.detected.classifier}</pluginArtifact>
    </configuration>
</plugin>

Server implementation:

@GrpcService
public class OrderGrpcService extends OrderServiceGrpc.OrderServiceImplBase {

    @Autowired private OrderService orderService;

    @Override
    public void createOrder(CreateOrderRequest request, StreamObserver<Order> responseObserver) {
        try {
            com.myapp.domain.Order order = orderService.createOrder(
                request.getCustomerId(),
                mapItems(request.getItemsList())
            );
            // Map domain object to protobuf message
            Order grpcOrder = Order.newBuilder()
                .setId(order.getId())
                .setCustomerId(order.getCustomerId())
                .setStatus(OrderStatus.ORDER_STATUS_PENDING)
                .setTotalAmount(order.getTotalAmount())
                .build();
            responseObserver.onNext(grpcOrder);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException()
            );
        }
    }

    // Server streaming — sends multiple responses
    @Override
    public void watchOrderStatus(GetOrderRequest request, StreamObserver<Order> responseObserver) {
        orderStatusService.subscribeToUpdates(request.getOrderId())
            .doOnNext(update -> responseObserver.onNext(mapToGrpc(update)))
            .doOnComplete(responseObserver::onCompleted)
            .doOnError(responseObserver::onError)
            .subscribe();
    }
}

Client usage:

@Service
public class InventoryClient {

    @GrpcClient("inventory-service")
    private InventoryServiceGrpc.InventoryServiceBlockingStub inventoryStub;

    public InventoryResponse checkStock(String productId, int quantity) {
        CheckStockRequest request = CheckStockRequest.newBuilder()
            .setProductId(productId)
            .setQuantity(quantity)
            .build();
        return inventoryStub
            .withDeadlineAfter(5, TimeUnit.SECONDS)
            .checkStock(request);
    }
}

# application.yml
grpc:
  server:
    port: 9090
  client:
    inventory-service:
      address: static://inventory:9090
      negotiation-type: plaintext  # TLS for production`,
      followUp: {
        question: 'What are the four types of gRPC streaming and when do you use each?',
        answer: `Unary — one request, one response. The standard RPC pattern. Use for most standard operations (get, create, update). Server Streaming — one request, multiple responses. The server sends a stream of messages; the client reads them until the stream completes. Use for: downloading a large dataset in chunks, watching real-time updates (order status, stock ticker), server-sent events equivalent. Client Streaming — multiple requests, one response. The client sends a stream of messages; after all are sent, the server responds once. Use for: bulk uploads (sending 1000 inventory updates, uploading a file in chunks), aggregation (client streams sensor readings, server responds with summary). Bidirectional Streaming — both sides send independent streams simultaneously. Use for: real-time chat, collaborative editing, full-duplex telemetry, interactive protocols. gRPC's HTTP/2 transport makes all streaming types efficient — no polling, no new connections per message.`
      }
    },
    {
      id: 'grpc_q4',
      question: 'How do you handle errors in gRPC and what are the standard status codes?',
      difficulty: 'intermediate',
      tags: ['gRPC', 'Error Handling', 'Status Codes'],
      answer: `gRPC has a standardized set of status codes in io.grpc.Status — much richer than HTTP status codes, with 17 specific codes for different error conditions.

Common gRPC status codes:

OK (0) — success
CANCELLED (1) — client cancelled the RPC
UNKNOWN (2) — unknown error, unhandled exception
INVALID_ARGUMENT (3) — client provided invalid arguments (like HTTP 400)
DEADLINE_EXCEEDED (4) — timeout elapsed
NOT_FOUND (5) — resource not found (like HTTP 404)
ALREADY_EXISTS (6) — resource already exists (like HTTP 409)
PERMISSION_DENIED (7) — not authorized (like HTTP 403)
UNAUTHENTICATED (16) — not authenticated (like HTTP 401)
RESOURCE_EXHAUSTED (8) — quota exceeded, rate limited
FAILED_PRECONDITION (9) — operation not applicable in current state (e.g., deleting a non-empty directory)
UNAVAILABLE (14) — service temporarily unavailable, retry-able (like HTTP 503)
INTERNAL (13) — unexpected server error (like HTTP 500)

Throwing gRPC errors in the server:

@Override
public void getOrder(GetOrderRequest request, StreamObserver<Order> responseObserver) {
    if (request.getOrderId().isBlank()) {
        responseObserver.onError(
            Status.INVALID_ARGUMENT
                .withDescription("orderId cannot be blank")
                .asRuntimeException()
        );
        return;
    }
    Optional<Order> order = orderRepository.findById(request.getOrderId());
    if (order.isEmpty()) {
        responseObserver.onError(
            Status.NOT_FOUND
                .withDescription("Order not found: " + request.getOrderId())
                .asRuntimeException()
        );
        return;
    }
    responseObserver.onNext(mapToGrpc(order.get()));
    responseObserver.onCompleted();
}

Catching errors on the client side:

try {
    Order order = stub.withDeadlineAfter(5, TimeUnit.SECONDS).getOrder(request);
} catch (StatusRuntimeException e) {
    Status.Code code = e.getStatus().getCode();
    switch (code) {
        case NOT_FOUND -> throw new OrderNotFoundException("Order not found");
        case DEADLINE_EXCEEDED -> throw new ServiceTimeoutException("Order service timed out");
        case UNAVAILABLE -> throw new ServiceUnavailableException("Order service unavailable");
        default -> throw new ServiceException("Unexpected error: " + e.getStatus().getDescription());
    }
}

Retry logic — UNAVAILABLE and DEADLINE_EXCEEDED are safe to retry (usually transient). INVALID_ARGUMENT and NOT_FOUND are never worth retrying. Use gRPC's built-in retry policy in the channel configuration or Resilience4j Retry wrapping the stub call.`,
      followUp: {
        question: 'What is a gRPC interceptor and what are common use cases?',
        answer: `A gRPC interceptor is middleware that runs for every RPC call — analogous to a servlet filter for HTTP. Server-side interceptors implement ServerInterceptor; client-side implement ClientInterceptor. Common use cases: Authentication — validate JWT token from gRPC metadata headers in a server interceptor, reject unauthenticated calls with Status.UNAUTHENTICATED before they reach the service implementation. Logging — log every RPC method name, caller identity, duration, and status code in a structured format. Tracing — propagate OpenTelemetry trace context from gRPC metadata headers (like B3 headers in HTTP) so distributed traces span gRPC calls. Rate limiting — count calls per client identity in a server interceptor, return Status.RESOURCE_EXHAUSTED when quota is exceeded. Metrics — record call count and duration in Micrometer in an interceptor to expose gRPC metrics to Prometheus. Compression — compress request/response bodies for large messages. Spring grpc-spring-boot-starter makes interceptors @GrpcGlobalServerInterceptor beans that are auto-applied to all services.`
      }
    },
    {
      id: 'grpc_q5',
      question: 'How do you secure gRPC communication with TLS and authentication?',
      difficulty: 'advanced',
      tags: ['gRPC', 'Security', 'TLS', 'Authentication'],
      answer: `gRPC runs over HTTP/2, which inherently supports TLS. For production inter-service communication, always use TLS — plaintext gRPC is only acceptable in development or within a service mesh that handles mTLS transparently.

TLS configuration in Spring Boot:

# application.yml
grpc:
  server:
    port: 9090
    security:
      enabled: true
      certificate-chain: classpath:tls/server.crt
      private-key: classpath:tls/server.key
  client:
    order-service:
      address: static://order-service:9090
      negotiation-type: tls         # or plaintext for dev
      security:
        trust-cert-collection: classpath:tls/ca.crt  # server certificate CA

Mutual TLS (mTLS) — both server and client present certificates, proving identity both ways. Ideal for zero-trust microservices where no service trusts any other by default:

grpc:
  server:
    security:
      enabled: true
      client-auth: require           # require client certificate
      trust-cert-collection: classpath:tls/ca.crt  # CA that signed client certs

JWT authentication via metadata (gRPC equivalent of HTTP headers):

// Client: attach JWT token to every call
ClientInterceptor authInterceptor = new ClientInterceptor() {
    @Override
    public <Q, A> ClientCall<Q, A> interceptCall(MethodDescriptor<Q, A> method,
                                                   CallOptions callOptions, Channel next) {
        return new ForwardingClientCall.SimpleForwardingClientCall<>(next.newCall(method, callOptions)) {
            @Override
            public void start(Listener<A> responseListener, Metadata headers) {
                headers.put(Metadata.Key.of("authorization", ASCII_STRING_MARSHALLER), "Bearer " + tokenProvider.getToken());
                super.start(responseListener, headers);
            }
        };
    }
};

// Server: validate JWT in interceptor
@GrpcGlobalServerInterceptor
public class AuthInterceptor implements ServerInterceptor {
    @Override
    public <Q, A> ServerCall.Listener<Q> interceptCall(ServerCall<Q, A> call,
                                                         Metadata headers, ServerCallHandler<Q, A> next) {
        String token = headers.get(Metadata.Key.of("authorization", ASCII_STRING_MARSHALLER));
        if (!jwtValidator.isValid(token)) {
            call.close(Status.UNAUTHENTICATED.withDescription("Invalid token"), new Metadata());
            return new ServerCall.Listener<>() {};
        }
        Context ctx = Context.current().withValue(USER_ID_KEY, jwtValidator.getUserId(token));
        return Contexts.interceptCall(ctx, call, headers, next);
    }
}

Service mesh alternative (Istio/Linkerd) — mTLS is transparently injected by the sidecar proxy for all inter-service communication. Your application doesn't handle TLS at all — the service mesh proxies handle certificate rotation, mTLS handshake, and policy enforcement. This is the preferred approach in Kubernetes environments because it decouples security policy from application code.`,
      followUp: {
        question: 'What is gRPC-Web and why is it needed for browser clients?',
        answer: `Browsers cannot directly use gRPC because they don't expose the HTTP/2 trailer frames that gRPC uses to convey status codes at the end of a streaming response — browsers restrict access to certain HTTP/2 features. gRPC-Web is a JavaScript-compatible protocol that translates between standard browser HTTP requests and gRPC. You deploy a proxy (Envoy sidecar, grpc-gateway, or nginx with grpc-web module) between the browser and the gRPC server. The browser sends gRPC-Web requests (HTTP/1.1 or HTTP/2 without trailers), the proxy translates them to standard gRPC and forwards to the backend, then translates responses back. Browser-side, the grpc-web npm package provides a client similar to the native gRPC client. For most enterprise web applications, REST or GraphQL are simpler choices for the browser-facing API layer, while gRPC is used for backend service-to-service communication where browser support isn't needed.`
      }
    },
  ],
}

export default grpc
