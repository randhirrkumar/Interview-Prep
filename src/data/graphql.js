const graphql = {
  title: 'GraphQL',
  description: 'GraphQL fundamentals, Spring for GraphQL, schema design, mutations, subscriptions, N+1 problem with DataLoader, and when to choose GraphQL over REST.',
  tags: ['GraphQL', 'Spring GraphQL', 'Schema', 'DataLoader', 'Subscriptions'],
  questions: [
    {
      id: 'graphql_q1',
      question: 'What is GraphQL and what problems does it solve compared to REST?',
      difficulty: 'beginner',
      tags: ['GraphQL', 'REST', 'Comparison'],
      answer: `GraphQL is a query language for APIs and a runtime for executing those queries. Instead of fixed endpoints that return predefined data shapes, GraphQL exposes a single endpoint where clients specify exactly what data they need.

Problems GraphQL solves:

Over-fetching — REST endpoints return fixed response shapes. GET /users/123 might return 30 fields even though the mobile app only needs name and avatar. GraphQL clients request only the fields they need, reducing payload size.

Under-fetching (N+1 API calls) — to show a user's profile with their last 3 orders and the product name for each, a REST client might call: GET /users/123, GET /orders?userId=123, GET /products/p1, GET /products/p2, GET /products/p3 — 5 requests. One GraphQL query returns everything in one round trip:

query {
  user(id: "123") {
    name
    email
    recentOrders(last: 3) {
      orderDate
      total
      items {
        product { name }
        quantity
      }
    }
  }
}

Strong typing — the GraphQL schema is the contract. Every field has a type. IDEs can autocomplete queries. Type mismatches are caught at schema validation time, not at runtime.

API evolution without versioning — REST often creates /v1/, /v2/ to add fields while keeping backward compatibility. GraphQL adds new fields to the schema without breaking existing queries — clients that don't request new fields are unaffected.

When to keep REST:
- Simple CRUD APIs without complex data relationships
- File uploads (GraphQL handles multipart forms awkwardly)
- When HTTP caching is critical (GraphQL's single POST endpoint doesn't cache at HTTP layer)
- Public APIs consumed by diverse clients (REST has broader tooling ecosystem)
- Teams unfamiliar with GraphQL (learning curve is real)`,
      followUp: {
        question: 'What is the GraphQL N+1 problem and how is it different from the REST version?',
        answer: `In REST, the N+1 problem means N+1 HTTP requests. In GraphQL, the N+1 problem occurs at the resolver level — the server makes N+1 database queries even though the client made one GraphQL request. When resolving a list of 100 orders, each order's product resolver fires individually: 1 query for orders + 100 queries for products = 101 database queries. This is worse than REST in terms of database load because the GraphQL abstraction hides the cost from the client. The solution is DataLoader — it batches all product ID requests that occur in the same execution tick into a single query, then distributes results. The same 100-order scenario becomes 1 order query + 1 batched product query = 2 total database queries. DataLoader is essential for any GraphQL API with nested resolvers.`
      }
    },
    {
      id: 'graphql_q2',
      question: 'How do you implement GraphQL in a Spring Boot application using Spring for GraphQL?',
      difficulty: 'intermediate',
      tags: ['Spring GraphQL', 'Spring Boot'],
      answer: `Spring for GraphQL (spring-boot-starter-graphql) provides annotation-driven resolver mapping over the graphql-java engine.

Dependency and schema:

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-graphql</artifactId>
</dependency>

# src/main/resources/graphql/schema.graphqls
type Query {
  product(id: ID!): Product
  products(category: String, page: Int = 0, size: Int = 20): ProductPage!
}

type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
}

type Subscription {
  orderStatusUpdated(orderId: ID!): OrderStatus!
}

type Product {
  id: ID!
  name: String!
  price: Float!
  category: Category!
  reviews: [Review!]!
}

type ProductPage {
  content: [Product!]!
  totalElements: Int!
  totalPages: Int!
}

type Category { id: ID!, name: String! }
type Review { id: ID!, rating: Int!, comment: String, author: User! }
type User { id: ID!, name: String!, email: String! }

input CreateProductInput { name: String!, price: Float!, categoryId: ID! }
input UpdateProductInput { name: String, price: Float }

Resolver controllers:

@Controller
public class ProductController {

    @QueryMapping                                  // maps to Query.product
    public Product product(@Argument String id) {
        return productService.findById(id);
    }

    @QueryMapping                                  // maps to Query.products
    public Page<Product> products(
            @Argument String category,
            @Argument int page,
            @Argument int size) {
        return productService.findAll(category, PageRequest.of(page, size));
    }

    @MutationMapping                               // maps to Mutation.createProduct
    public Product createProduct(@Argument CreateProductInput input) {
        return productService.create(input);
    }

    @SchemaMapping(typeName = "Product", field = "reviews")
    public List<Review> reviews(Product product) {
        return reviewService.findByProductId(product.getId());
    }

    @SubscriptionMapping                           // WebSocket-based
    public Flux<OrderStatus> orderStatusUpdated(@Argument String orderId) {
        return orderStatusService.subscribe(orderId);
    }
}

application.yml:

spring:
  graphql:
    graphiql:
      enabled: true            # built-in browser IDE at /graphiql
    path: /graphql
    websocket:
      path: /graphql           # subscriptions over WebSocket`,
      followUp: {
        question: 'What is GraphiQL and how is it useful in development?',
        answer: `GraphiQL is a browser-based IDE for exploring and testing GraphQL APIs. Spring for GraphQL enables it at /graphiql when spring.graphql.graphiql.enabled=true (automatically enabled in development profile). Features: auto-complete queries based on the schema, syntax highlighting, schema documentation browser (Docs panel shows all types and their fields), query history, and variable editor for parameterized queries. In production, disable GraphiQL (graphiql.enabled=false) — it exposes your full schema to anyone who can access the endpoint.`
      }
    },
    {
      id: 'graphql_q3',
      question: 'How do you solve the N+1 problem in Spring GraphQL with DataLoader?',
      difficulty: 'intermediate',
      tags: ['GraphQL', 'DataLoader', 'N+1', 'Performance'],
      answer: `DataLoader batches multiple individual load requests into a single batched call. Spring for GraphQL integrates with the Java DataLoader library via @BatchMapping.

Without DataLoader (N+1 problem):

// For each Product in the list, this fires separately → N queries
@SchemaMapping(typeName = "Product", field = "reviews")
public List<Review> reviews(Product product) {
    return reviewRepository.findByProductId(product.getId()); // N individual queries
}

With @BatchMapping (automatic batching):

@Controller
public class ProductController {

    // Spring GraphQL automatically batches all product IDs in the current execution
    // and calls this method ONCE with all IDs collected from the same request
    @BatchMapping(typeName = "Product", field = "reviews")
    public Map<Product, List<Review>> reviews(List<Product> products) {
        // 1 query for all products instead of N queries
        Set<String> productIds = products.stream()
            .map(Product::getId)
            .collect(Collectors.toSet());

        Map<String, List<Review>> reviewsByProduct =
            reviewRepository.findByProductIdIn(productIds)
                .stream()
                .collect(Collectors.groupingBy(Review::getProductId));

        // Return a map: each Product → its list of Reviews
        return products.stream()
            .collect(Collectors.toMap(
                p -> p,
                p -> reviewsByProduct.getOrDefault(p.getId(), Collections.emptyList())
            ));
    }
}

@BatchMapping is simpler than manually registering DataLoaderRegistrar beans. Spring GraphQL handles the batching lifecycle automatically — it collects all product.reviews requests in the current request, calls your @BatchMapping method once, and distributes the results back to each field resolver.

For complex batching scenarios (joins across multiple entity types, external API calls), use BatchLoaderRegistry:

@Configuration
public class DataLoaderConfig {

    @Bean
    public BatchLoaderRegistry batchLoaderRegistry(ReviewRepository reviewRepository) {
        return BatchLoaderRegistry.create(registry ->
            registry.forTypePair(String.class, List.class)
                .withName("reviewsByProductId")
                .registerBatchLoader((productIds, env) ->
                    Mono.just(reviewRepository.findByProductIdIn(Set.copyOf(productIds))
                        .stream()
                        .collect(Collectors.groupingBy(Review::getProductId)))
                )
        );
    }
}`,
      followUp: {
        question: 'How do you handle authentication and authorization in GraphQL?',
        answer: `Authentication is typically handled at the HTTP layer before the request reaches the GraphQL engine — Spring Security filters validate the JWT token and populate the SecurityContext. The GraphQL layer then sees an authenticated user. Authorization in GraphQL has two options. Method-level: annotate resolver methods with @PreAuthorize("hasRole('ADMIN')") — straightforward, uses Spring Security expressions, but applies at resolver granularity (not field level). Schema directive-level: define custom @auth directives in the schema and implement a SchemaDirectiveWiring that checks authorization when resolving annotated fields. This gives field-level access control but is more complex to implement. Third option: use dedicated libraries like graphql-java-extended-scalars or Netflix's DGS framework which have built-in authorization directive support. The simplest production approach: use @PreAuthorize on mutation and sensitive query resolvers; for field-level control, filter the data in the service layer based on the authenticated user's roles.`
      }
    },
    {
      id: 'graphql_q4',
      question: 'What are GraphQL subscriptions and how do you implement them for real-time updates?',
      difficulty: 'intermediate',
      tags: ['GraphQL', 'Subscriptions', 'WebSocket', 'Reactive'],
      answer: `GraphQL subscriptions push data from server to client in real-time, complementing queries (one-time fetch) and mutations (one-time write). They use WebSocket connections that persist throughout the subscription lifetime.

Use cases: live order tracking, real-time notifications, chat messages, stock prices, collaborative document editing.

Spring GraphQL subscriptions use Project Reactor's Flux as the return type:

// Schema
type Subscription {
  orderStatusUpdated(orderId: ID!): OrderStatus!
  lowStockAlert: ProductStockEvent!
}

// Resolver
@Controller
public class SubscriptionController {

    @Autowired
    private OrderStatusEventService eventService;

    @SubscriptionMapping
    public Flux<OrderStatus> orderStatusUpdated(@Argument String orderId) {
        return eventService.getStatusStream(orderId)
            .filter(status -> status.getOrderId().equals(orderId))
            .timeout(Duration.ofHours(1));  // auto-close after 1 hour of inactivity
    }
}

// Service using Reactor's Sinks for event broadcasting
@Service
public class OrderStatusEventService {
    // Multicast sink — multiple subscribers, backpressure-buffered
    private final Sinks.Many<OrderStatus> sink = Sinks.many()
        .multicast()
        .onBackpressureBuffer(256);

    public Flux<OrderStatus> getStatusStream(String orderId) {
        return sink.asFlux()
            .filter(s -> s.getOrderId().equals(orderId));
    }

    // Called when order status changes (from Kafka consumer, DB trigger, etc.)
    public void publishStatusUpdate(OrderStatus status) {
        sink.tryEmitNext(status);
    }
}

WebSocket configuration is automatic when spring.graphql.websocket.path is set.

Client subscription (JavaScript):

const ws = new WebSocket('ws://api.example.com/graphql');
ws.send(JSON.stringify({
  type: 'subscribe',
  payload: {
    query: 'subscription { orderStatusUpdated(orderId: "123") { status updatedAt } }'
  }
}));

For mobile and web clients, Apollo Client and URQL handle the WebSocket subscription protocol automatically.`,
      followUp: {
        question: 'What are the scalability challenges of GraphQL subscriptions and how do you address them?',
        answer: `Subscriptions maintain persistent WebSocket connections — 10,000 concurrent subscribers means 10,000 open connections per server instance. Unlike HTTP which is stateless, WebSocket connections are stateful and sticky — a subscriber must reconnect to the same instance to maintain their Flux stream. Solutions: (1) Use a shared message broker (Redis Pub/Sub or Kafka) as the event bus. Each server instance subscribes to the broker and fans out to its connected WebSocket clients. When an order status changes, publish to Redis channel; all instances receive it and push to their connected clients subscribed to that order. (2) Horizontal scaling with session affinity — configure the load balancer to route WebSocket connections from the same client to the same server instance (sticky sessions). Simpler but creates uneven load distribution. (3) Consider Server-Sent Events (SSE) instead of WebSocket for server-push-only subscriptions — SSE is HTTP/2 multiplexed, stateless-friendly, and easier to load balance.`
      }
    },
    {
      id: 'graphql_q5',
      question: 'How do you handle error handling in GraphQL and what makes it different from REST?',
      difficulty: 'intermediate',
      tags: ['GraphQL', 'Error Handling'],
      answer: `GraphQL error handling is fundamentally different from REST. REST uses HTTP status codes (400, 404, 500) to signal errors. GraphQL almost always returns HTTP 200 — errors are part of the response body in an errors array.

GraphQL response structure:

{
  "data": {
    "product": null
  },
  "errors": [
    {
      "message": "Product not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["product"],
      "extensions": {
        "code": "PRODUCT_NOT_FOUND",
        "classification": "NOT_FOUND"
      }
    }
  ]
}

Spring for GraphQL exception handling:

@ControllerAdvice
public class GraphQlExceptionHandler {

    @GraphQlExceptionHandler
    public GraphQLError handleProductNotFound(ProductNotFoundException ex, ErrorType type) {
        return GraphQLError.newError()
            .errorType(ErrorType.NOT_FOUND)
            .message(ex.getMessage())
            .extensions(Map.of("code", "PRODUCT_NOT_FOUND"))
            .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleAccessDenied(AccessDeniedException ex) {
        return GraphQLError.newError()
            .errorType(ErrorType.FORBIDDEN)
            .message("Access denied")
            .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleValidation(ConstraintViolationException ex) {
        return GraphQLError.newError()
            .errorType(ErrorType.BAD_REQUEST)
            .message(ex.getMessage())
            .build();
    }
}

Important: partial success is a GraphQL feature. A query requesting 3 fields might succeed for 2 and fail for 1 — the response includes partial data alongside the errors array. Client code must handle both data and errors in every response.

Never return unhandled exception stack traces in error messages (information disclosure). Use extensions to add machine-readable error codes for client-side handling without parsing the human-readable message.`,
      followUp: {
        question: 'What is schema-first vs. code-first GraphQL development and which does Spring for GraphQL use?',
        answer: `Schema-first: you write the .graphqls schema file first; it's the contract. Resolver code implements the schema. This is what Spring for GraphQL uses — you define the schema in src/main/resources/graphql/*.graphqls and @QueryMapping/@MutationMapping methods implement those fields. Benefits: the schema is readable documentation; frontend and backend teams can agree on the schema before any code is written; schema changes are explicit and reviewable. Code-first: annotate Java classes and methods; the schema is generated from the code. Libraries like Netflix DGS with @DgsComponent or graphql-java-kickstart support this. Benefits: single source of truth in code; no schema file to maintain. In practice, schema-first is recommended for collaborative teams — the schema is a clear API contract. Code-first is convenient for rapid prototyping or when the Java model directly drives the API shape.`
      }
    },
  ],
}

export default graphql
