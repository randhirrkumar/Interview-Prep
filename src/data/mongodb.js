const mongodb = {
  title: 'MongoDB & NoSQL',
  description: 'Document modeling, aggregation pipeline, Spring Data MongoDB, indexing strategies, and when to choose MongoDB over relational databases.',
  tags: ['MongoDB', 'NoSQL', 'Spring Data', 'Aggregation', 'Indexing'],
  questions: [
    {
      id: 'mongodb_q1',
      question: 'What is MongoDB and when would you choose it over a relational database?',
      difficulty: 'beginner',
      tags: ['MongoDB', 'NoSQL'],
      answer: `MongoDB is a document-oriented NoSQL database that stores data as BSON documents (Binary JSON) in collections rather than rows in tables. Each document can have a different structure — there is no enforced schema at the database level.

Choose MongoDB over a relational database when:

1. Schema is flexible or evolving — when different records in the same collection legitimately have different fields. A product catalog where electronics have voltage ratings but clothing has size charts is a natural fit; adding a new attribute to MongoDB requires no ALTER TABLE.

2. Data is naturally hierarchical — an order with its line items, shipping address, and payment method modeled as a single document avoids the multi-table joins a relational model requires. Reading the order is a single document fetch.

3. High write throughput at scale — MongoDB scales horizontally with sharding across multiple nodes. Relational databases scale vertically (bigger machine) which has an upper limit.

4. Geospatial queries — MongoDB has first-class geospatial index support (2dsphere indexes) for location-based queries like "find all restaurants within 5km."

Stay with a relational database when: you have complex relationships requiring referential integrity, multi-entity transactions are frequent, the data is highly relational and normalized, or strong ACID guarantees across multiple collections are required — MongoDB's multi-document transactions add overhead and are not as battle-tested as PostgreSQL.`,
      followUp: {
        question: 'How does MongoDB handle transactions and what are their limitations?',
        answer: `MongoDB 4.0+ supports multi-document ACID transactions within a replica set, and 4.2+ extended this to sharded clusters. You start a session, begin a transaction, perform operations, and commit or abort — similar to SQL transactions. However, multi-document transactions in MongoDB carry performance overhead because they use two-phase locking and write conflicts cause retries. MongoDB documentation recommends modeling data to avoid transactions where possible — if you need to atomically update two documents, consider embedding them into one document so the update is a single atomic operation. Transactions are supported but they are not the primary usage pattern as they are in relational databases.`
      }
    },
    {
      id: 'mongodb_q2',
      question: 'Explain embedded documents vs. references in MongoDB. How do you decide which to use?',
      difficulty: 'intermediate',
      tags: ['MongoDB', 'Data Modeling'],
      answer: `This is the most important MongoDB modeling decision. The trade-off is between read performance and data duplication.

Embedding places related data inside a document:

{
  "_id": "order123",
  "customerId": "cust456",
  "items": [
    { "productId": "p1", "name": "Laptop", "price": 75000, "qty": 1 },
    { "productId": "p2", "name": "Mouse",  "price": 1500,  "qty": 2 }
  ],
  "shippingAddress": { "street": "MG Road", "city": "Bangalore" }
}

Reading the order fetches everything in one query — no joins. Atomic updates to the document and its embedded data are guaranteed. Best when the embedded data is owned by the parent and rarely queried independently.

References store a foreign key and require a second query or $lookup aggregation:

// Order document
{ "_id": "order123", "customerId": "cust456", "productIds": ["p1", "p2"] }

// Products collection (separate)
{ "_id": "p1", "name": "Laptop", "price": 75000 }

Best when: the referenced data is shared across many parents (a product referenced by thousands of orders — embedding duplicates the product name/price in every order); or the referenced data is updated frequently (changing a product price should not require updating thousands of order documents).

Decision rules:
- Is the related data only accessed through the parent? → Embed
- Does the related data change frequently and independently? → Reference
- Does the related data grow unboundedly (e.g., all comments on a post)? → Reference (embedded arrays over 16MB exceed document size limit)
- Is the related data shared by many parents? → Reference`,
      followUp: {
        question: 'What is the 16MB document size limit and how do you work around it?',
        answer: `MongoDB documents cannot exceed 16MB. This matters for arrays that grow over time — a post's comments array, a user's activity log, or a product's review list can grow beyond this limit. The workaround is the Bucket Pattern: instead of one document with an unbounded array, create multiple "bucket" documents each holding a fixed-size batch of entries. For example, store 200 reviews per bucket document. A parent document holds metadata and the count of buckets. The alternative is simply using references — each review is its own document and you query by postId with pagination. GridFS is MongoDB's built-in mechanism for storing files larger than 16MB by chunking them across multiple documents.`
      }
    },
    {
      id: 'mongodb_q3',
      question: 'How do you use Spring Data MongoDB in a Spring Boot application?',
      difficulty: 'beginner',
      tags: ['Spring Data MongoDB', 'Spring Boot'],
      answer: `Spring Data MongoDB provides a repository abstraction and MongoTemplate for interacting with MongoDB from Spring Boot.

Add spring-boot-starter-data-mongodb dependency and configure:

# application.yml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/mydb

Define a document class:

@Document(collection = "products")
public class Product {
    @Id
    private String id;                      // maps to _id
    @Indexed(unique = true)
    private String sku;
    private String name;
    private double price;
    private List<String> categories;
    @CreatedDate
    private LocalDateTime createdAt;
}

Repository interface:

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoriesContaining(String category);
    List<Product> findByPriceBetween(double min, double max);

    @Query("{ 'price': { $gt: ?0 }, 'categories': ?1 }")
    List<Product> findExpensiveInCategory(double minPrice, String category);
}

MongoTemplate for complex operations:

@Autowired MongoTemplate mongoTemplate;

public List<Product> findWithCriteria(String category, double maxPrice) {
    Query query = Query.query(
        Criteria.where("categories").in(category)
            .and("price").lte(maxPrice)
    ).with(Sort.by("price").ascending()).limit(20);
    return mongoTemplate.find(query, Product.class);
}

Auditing (@CreatedDate, @LastModifiedDate) requires @EnableMongoAuditing on a configuration class.`,
      followUp: {
        question: 'How do you handle schema migration in MongoDB when your document structure changes?',
        answer: `MongoDB has no built-in schema migration like Flyway or Liquibase for SQL. Two approaches: Lazy migration — add a schemaVersion field to documents; when reading an old document, detect the version and apply transformation in the repository layer, then save the upgraded document. This migrates data gradually as it is accessed. Eager migration — write a migration script that SCAN + updates documents in batches using updateMany. For breaking changes (renaming a field, changing a type), use mongosh scripts or a Spring CommandLineRunner that runs once on application startup with a migration-has-run flag stored in a migrations collection. Mongock is a popular Java library that provides structured, versioned MongoDB migrations similar to Flyway.`
      }
    },
    {
      id: 'mongodb_q4',
      question: 'Explain the MongoDB aggregation pipeline with an example.',
      difficulty: 'intermediate',
      tags: ['MongoDB', 'Aggregation Pipeline'],
      answer: `The aggregation pipeline processes documents through a sequence of stages, each transforming the data before passing it to the next stage. It is MongoDB's primary mechanism for data analysis and complex queries.

Common stages:
- $match — filter documents (like WHERE in SQL)
- $group — group and compute aggregates (like GROUP BY)
- $project — shape the output, include/exclude/compute fields
- $sort — order results
- $limit / $skip — pagination
- $lookup — left outer join with another collection
- $unwind — deconstruct an array field into separate documents

Example: Total revenue per category for orders in the last 30 days:

db.orders.aggregate([
  { $match: {
      status: "COMPLETED",
      createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
  }},
  { $unwind: "$items" },
  { $group: {
      _id: "$items.category",
      totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      orderCount: { $sum: 1 }
  }},
  { $sort: { totalRevenue: -1 } },
  { $project: {
      category: "$_id",
      totalRevenue: 1,
      orderCount: 1,
      _id: 0
  }}
])

In Spring Data MongoDB:

Aggregation aggregation = Aggregation.newAggregation(
    Aggregation.match(Criteria.where("status").is("COMPLETED")),
    Aggregation.unwind("items"),
    Aggregation.group("items.category")
        .sum(ArithmeticOperators.Multiply.valueOf("items.price").multiplyBy("items.qty"))
        .as("totalRevenue")
        .count().as("orderCount"),
    Aggregation.sort(Sort.by(Sort.Direction.DESC, "totalRevenue"))
);
AggregationResults<CategoryRevenue> results =
    mongoTemplate.aggregate(aggregation, "orders", CategoryRevenue.class);`,
      followUp: {
        question: 'What is $lookup and when would you use it vs. application-side joins?',
        answer: `$lookup performs a left outer join between two collections in the aggregation pipeline. It is equivalent to SQL's LEFT JOIN. Use it when you need data from a referenced collection in a single query — for example, joining orders with customer details. However, $lookup is a server-side operation that can be expensive on large collections and does not use indexes as efficiently as dedicated relational join engines. Application-side joins — fetching the primary documents, extracting IDs, then fetching referenced documents in a second query — can be more efficient when you have selective indexes and the referenced dataset is small enough to batch. The rule of thumb: use $lookup for reporting/analytics pipelines; prefer application-side joins for hot read paths where response time matters.`
      }
    },
    {
      id: 'mongodb_q5',
      question: 'What types of indexes does MongoDB support and how do you choose the right one?',
      difficulty: 'intermediate',
      tags: ['MongoDB', 'Indexing', 'Performance'],
      answer: `MongoDB supports several index types, each optimized for different query patterns.

Single Field Index — index on one field. MongoDB automatically creates one on _id. Use for equality queries and range queries on a single field.
@Indexed annotation in Spring Data or db.collection.createIndex({field: 1}).

Compound Index — index on multiple fields. The order matters: {category: 1, price: -1} supports queries that filter by category and sort by price descending. Follows the ESR rule: Equality first, then Sort fields, then Range fields.

Text Index — full-text search on string fields. db.products.createIndex({name: "text", description: "text"}). Supports $text operator with stemming and stop words. Only one text index per collection.

Geospatial Index (2dsphere) — for GeoJSON geometry queries. createIndex({location: "2dsphere"}) enables $near, $geoWithin, $geoIntersects.

TTL Index — automatically deletes documents after a time period. db.sessions.createIndex({createdAt: 1}, {expireAfterSeconds: 3600}) — sessions expire 1 hour after createdAt. Used for expiring logs, caches, sessions.

Sparse Index — only indexes documents that have the indexed field; documents without the field are omitted. Useful for optional fields to avoid indexing null/missing values.

Partial Index — indexes only documents matching a filter condition. db.orders.createIndex({status: 1}, {partialFilterExpression: {status: "PENDING"}}) indexes only pending orders — smaller index for targeted queries.

Index selection strategy: use explain("executionStats") to verify index usage. Watch for COLLSCAN (full collection scan) — add an index for the query field. Avoid over-indexing — each index slows writes and consumes memory.`,
      followUp: {
        question: 'What is the ESR rule for compound indexes?',
        answer: `ESR stands for Equality, Sort, Range — the recommended field order in a compound index. Equality fields (= exact match filters) should come first because they are most selective and narrow the index scan to a small set. Sort fields come next so the database can use the index for ordering without an in-memory sort step. Range fields (< > $in with multiple values) come last because range scans return contiguous index entries but cannot help with subsequent sorting. Example: a query filtering by status='ACTIVE' (equality), sorting by createdAt, and filtering createdAt > lastMonth (range) should use an index {status: 1, createdAt: 1} in that order — equality on status first, then range/sort on createdAt.`
      }
    },
    {
      id: 'mongodb_q6',
      question: 'What is the N+1 problem in MongoDB and how do you solve it with Spring Data?',
      difficulty: 'intermediate',
      tags: ['MongoDB', 'N+1', 'Performance'],
      answer: `The N+1 problem in MongoDB occurs when you fetch N documents and then issue one additional query per document to fetch referenced data — resulting in N+1 total queries.

Example: fetching 100 orders and then loading each order's customer separately:

// N+1 problem
List<Order> orders = orderRepository.findAll(); // 1 query
orders.forEach(order -> {
    Customer customer = customerRepository.findById(order.getCustomerId()); // N queries
    order.setCustomer(customer);
});

Solutions:

1. $lookup aggregation — join at the database level in a single pipeline:

Aggregation agg = Aggregation.newAggregation(
    Aggregation.lookup("customers", "customerId", "_id", "customer"),
    Aggregation.unwind("customer")
);

2. Batch fetch — collect all customer IDs from the orders, fetch in one query, then map:

List<Order> orders = orderRepository.findAll();
Set<String> customerIds = orders.stream()
    .map(Order::getCustomerId).collect(Collectors.toSet());
Map<String, Customer> customerMap = customerRepository.findAllById(customerIds)
    .stream().collect(Collectors.toMap(Customer::getId, c -> c));
orders.forEach(o -> o.setCustomer(customerMap.get(o.getCustomerId())));
// 2 queries total, not N+1

3. Embed — if customer details needed alongside orders are just name and email, embed them in the order document at write time. Denormalization avoids the join entirely.

The best solution depends on data ownership and update frequency. Batch fetch is the most flexible and avoids duplication.`,
      followUp: {
        question: 'How does Spring Data MongoDB handle lazy loading of referenced documents?',
        answer: `Spring Data MongoDB does not support transparent lazy loading the way Hibernate does for JPA. There is no @OneToMany proxy mechanism. DBRef with @DBRef annotation does support lazy loading — the referenced document is fetched on first access — but DBRef requires that the referenced document is in the same MongoDB deployment and is generally discouraged in modern MongoDB because it bypasses $lookup optimizations. The recommended approach is to handle references manually using the batch-fetch pattern or $lookup aggregation. If you need ORM-like behavior, consider using @DocumentReference (introduced in Spring Data MongoDB 3.3) which is a more flexible reference mechanism that integrates with Spring Data projections.`
      }
    },
    {
      id: 'mongodb_q7',
      question: 'How does MongoDB replica set work and what consistency guarantees does it provide?',
      difficulty: 'advanced',
      tags: ['MongoDB', 'Replication', 'High Availability'],
      answer: `A MongoDB replica set is a group of mongod instances that maintain the same dataset. One node is the primary (all writes go here); the others are secondaries that asynchronously replicate from the primary's oplog.

Oplog — a special capped collection on every node that records every write operation. Secondaries tail the primary's oplog and replay operations to stay in sync.

Failover — if the primary goes down, the remaining nodes elect a new primary (requires a majority vote — odd number of nodes recommended, minimum 3 for a quorum). Typical failover time is 10–30 seconds.

Read preferences:
- primary (default) — always reads from primary. Strongest consistency. No stale reads.
- primaryPreferred — reads from primary if available, falls back to secondary.
- secondary — reads from a secondary. Can return stale data because replication is asynchronous.
- nearest — reads from the geographically closest node.

Write concern — how many nodes must acknowledge a write before the operation returns:
- w:1 (default) — primary acknowledges. Fastest. Data can be lost if primary crashes before replication.
- w:majority — majority of nodes must acknowledge. Survives primary failure. Slower.
- w:0 — fire and forget. No acknowledgment. Maximum throughput, zero durability.

Read concern — what data is visible:
- local — data that has been written to the primary but not necessarily replicated.
- majority — only data acknowledged by a majority of nodes. Prevents reading data that might be rolled back.

For financial applications, use w:majority + readConcern:majority to prevent phantom reads and data rollback scenarios.`,
      followUp: {
        question: 'What is an arbiter node in a MongoDB replica set?',
        answer: `An arbiter is a lightweight replica set member that participates in elections but holds no data and never becomes primary. It exists solely to provide a voting majority in sets with an even number of data-bearing nodes. For example, a 2-node set (1 primary, 1 secondary) cannot elect a new primary without a majority of 2 votes — adding an arbiter creates a 3-member set that can achieve majority with 2 votes. Arbiters use minimal resources (no data storage) but add a network node to the replica set. They are generally discouraged in modern cloud deployments where adding a third data node is economical, because an arbiter provides no read capacity or data redundancy.`
      }
    },
    {
      id: 'mongodb_q8',
      question: 'How do you implement full-text search in MongoDB?',
      difficulty: 'intermediate',
      tags: ['MongoDB', 'Text Search', 'Indexing'],
      answer: `MongoDB provides text indexes for full-text search within collections. A text index tokenizes and stems string fields, enabling $text queries with relevance scoring.

Create a text index (only one per collection):

db.articles.createIndex({ title: "text", body: "text" }, { weights: { title: 5, body: 1 } })

Weights (1–5) control relevance scoring — a title match scores 5x higher than a body match.

Query with $text:

db.articles.find(
  { $text: { $search: "java microservices", $language: "en" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })

$search is space-separated — finds documents containing "java" OR "microservices".
"java microservices" (quoted in $search) searches for the exact phrase.
Prefix - to exclude: "$search": "java -python" finds java but not python.

In Spring Data MongoDB:

TextCriteria criteria = TextCriteria.forDefaultLanguage()
    .matchingAny("java", "microservices");
Query query = TextQuery.queryText(criteria)
    .sortByScore()
    .with(PageRequest.of(0, 20));
List<Article> results = mongoTemplate.find(query, Article.class);

Limitations: MongoDB text search is basic compared to Elasticsearch — no fuzzy matching, no synonyms, no faceted search, limited language support. For production search features, use Elasticsearch or OpenSearch and sync data from MongoDB using a change stream consumer.`,
      followUp: {
        question: 'What are MongoDB Change Streams and how can they sync data to Elasticsearch?',
        answer: `Change Streams are real-time event notifications for insert, update, delete, and replace operations on a collection. They tail the oplog, similar to how Kafka consumers tail a topic. In Spring Data MongoDB, use ReactiveMongoTemplate or ChangeStreamOptions to subscribe. For Elasticsearch sync: consume change stream events, transform the document to an Elasticsearch document, and index it using the Elasticsearch Java client. This keeps both datastores eventually consistent. Libraries like Debezium provide production-grade change data capture (CDC) from MongoDB to Kafka, from which an Elasticsearch sink connector can consume events — a more resilient architecture than a direct application-level sync.`
      }
    },
    {
      id: 'mongodb_q9',
      question: 'What is MongoDB sharding and when do you need it?',
      difficulty: 'advanced',
      tags: ['MongoDB', 'Sharding', 'Scalability'],
      answer: `Sharding is MongoDB's horizontal scaling mechanism — data is distributed across multiple machines (shards) using a shard key. Each shard holds a subset of the data, and queries are routed by mongos (query router) to the appropriate shard(s).

You need sharding when:
- A single replica set's storage or write throughput is insufficient
- Dataset exceeds single-node storage capacity (typically hundreds of GB to TB)
- Write throughput exceeds a single primary's capacity (~30–50k writes/second)

Shard key selection is critical — it determines how data distributes across shards:

Cardinality — high enough values to distribute across shards. A boolean field (true/false) makes a terrible shard key — all data ends up in two chunks.

Write distribution — avoid monotonically increasing values (like timestamps or auto-increment IDs) as shard keys — all new inserts land on the last shard, creating a "hot shard."

Query isolation — a shard key that appears in most queries allows targeted queries (hits one shard) instead of scatter-gather (hits all shards). Use customerId as shard key if most queries filter by customer.

Hashed shard key — hash(fieldValue) as the shard key distributes writes evenly but turns all range queries into scatter-gather. Good for write-heavy workloads without range query requirements.

Compound shard key — combine a low-cardinality field with a high-cardinality field: {region: 1, userId: 1} zones by region and distributes within the region.

Sharding adds operational complexity — plan capacity and shard key selection carefully before sharding because changing a shard key requires a full collection resharding (supported in MongoDB 5.0+ but still disruptive).`,
      followUp: {
        question: 'What is zone sharding in MongoDB?',
        answer: `Zone sharding (formerly tag-aware sharding) allows you to assign ranges of shard key values to specific shards. This enables geographic partitioning — route documents where region="IN" to shards in an Indian data center and region="US" to US shards. This satisfies data sovereignty requirements where data must reside in a specific country. It also enables tiered storage — hot data (recent, high-cardinality keys) on fast NVMe shards, cold archival data on slower cheaper shards. Configure zones with sh.addShardToZone() and sh.updateZoneKeyRange() on the admin database.`
      }
    },
    {
      id: 'mongodb_q10',
      question: 'How do you handle pagination in MongoDB efficiently for large collections?',
      difficulty: 'intermediate',
      tags: ['MongoDB', 'Pagination', 'Performance'],
      answer: `Two approaches to pagination in MongoDB — offset-based and cursor-based — with very different performance characteristics at scale.

Offset-based (skip/limit) — skip N documents and return the next pageSize:

// Page 3, 20 items per page
db.products.find({category:"electronics"}).sort({createdAt:-1}).skip(40).limit(20)

In Spring Data:
Page<Product> page = productRepository.findByCategory(
    "electronics", PageRequest.of(2, 20, Sort.by("createdAt").descending())
);

Problem: MongoDB must traverse and discard all skipped documents. Skip(10000) + limit(20) still reads 10,020 documents. Performance degrades linearly with page depth — page 500 is 500x slower than page 1.

Cursor-based (keyset pagination) — remember the last seen value of the sort field and use it as a filter boundary:

// First page
List<Product> page1 = products.find({}).sort({_id: 1}).limit(20)
String lastId = page1.last().getId();

// Next page — filter by _id > lastId
List<Product> page2 = products.find({_id: {$gt: lastId}}).sort({_id: 1}).limit(20)

In Spring Data:
Criteria criteria = Criteria.where("id").gt(lastSeenId);
Query query = Query.query(criteria).with(Sort.by("id").ascending()).limit(20);

Keyset pagination is O(log N) regardless of page depth because it uses the index directly. Limitation: cannot jump to arbitrary pages — only sequential forward navigation. This is acceptable for infinite scroll UIs and API cursors but not for "go to page 47" UI.

Use offset for small datasets or admin UIs where jumping to arbitrary pages is needed. Use cursor-based for all production high-volume APIs.`,
      followUp: {
        question: 'How do you implement cursor-based pagination when sorting by a non-unique field?',
        answer: `When sorting by a non-unique field like price, multiple documents can have the same price, making the cursor ambiguous — you can't be sure which document comes after price=1500 if ten documents share that price. Use a compound cursor: sort by (price ASC, _id ASC) and remember both the last price and last _id. The next page query becomes: price > lastPrice OR (price == lastPrice AND _id > lastId). This tiebreaking on the unique _id field ensures deterministic pagination even when the primary sort field has duplicates.`
      }
    },
  ],
}

export default mongodb
