const sql = {
  title: 'SQL & MySQL',
  description: 'SQL queries, joins, indexing, query optimization, and common interview problems.',
  tags: ['SQL', 'MySQL', 'Query Optimization', 'Indexing'],
  questions: [
    {
      id: 1,
      question: 'Write SQL to find the second highest salary from an Employee table',
      difficulty: 'intermediate',
      asked: true,
      tags: ['SQL', 'Subquery'],
      answer: `This is the most common SQL interview question. There are multiple approaches.

The simplest approach: use a subquery to exclude the maximum salary, then find the max of the remaining. But it returns NULL if there is no second highest (only one distinct salary).

A better approach: use DISTINCT + LIMIT + OFFSET. Or use ROW_NUMBER() window function which is the most modern and readable way.

In production systems like MetLife, we used window functions for complex ranking queries on policy data.`,
      code: `-- Table: Employee (id, name, salary, department_id)

-- Approach 1: Subquery
SELECT MAX(salary) as second_highest
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);

-- Approach 2: LIMIT + OFFSET (MySQL)
SELECT DISTINCT salary
FROM Employee
ORDER BY salary DESC
LIMIT 1 OFFSET 1;  -- skip 1, take 1

-- Approach 3: ROW_NUMBER window function (BEST)
SELECT salary
FROM (
    SELECT salary,
           ROW_NUMBER() OVER (ORDER BY salary DESC) as rn
    FROM Employee
) ranked
WHERE rn = 2;

-- Handle NULLs if no second highest exists
SELECT IFNULL(
    (SELECT DISTINCT salary
     FROM Employee
     ORDER BY salary DESC
     LIMIT 1 OFFSET 1),
    NULL
) AS SecondHighestSalary;

-- Generalized: Nth highest salary
SELECT salary FROM (
    SELECT salary,
           DENSE_RANK() OVER (ORDER BY salary DESC) as rnk
    FROM Employee
) ranked
WHERE rnk = 3;  -- 3rd highest`,
      followUp: [
        'What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()?',
        'What if there are duplicate salaries? Which approach handles that correctly?',
      ],
      tip: 'ROW_NUMBER(): sequential, no ties. RANK(): gaps after ties (1,1,3). DENSE_RANK(): no gaps after ties (1,1,2). For salary queries, DENSE_RANK() is usually what you want.',
    },
    {
      id: 2,
      question: 'Explain different types of JOINs with examples',
      difficulty: 'beginner',
      asked: true,
      tags: ['SQL', 'Joins'],
      answer: `JOINs combine rows from multiple tables based on a related column.

INNER JOIN: returns rows where there's a match in BOTH tables. Most common.
LEFT JOIN (LEFT OUTER): all rows from left table, matched rows from right. NULL if no match on right.
RIGHT JOIN (RIGHT OUTER): all rows from right table, matched rows from left. NULL if no match on left.
FULL OUTER JOIN: all rows from both tables, NULL where no match. MySQL doesn't support this directly — emulate with UNION.
CROSS JOIN: cartesian product — every row from A with every row from B.
SELF JOIN: join a table with itself (for hierarchies, employee-manager).

In my MetLife project, I frequently used LEFT JOINs to find policies without any claims, and INNER JOINs to get policy-holder details.`,
      code: `-- Sample Tables:
-- Employee: id, name, department_id, manager_id
-- Department: id, name

-- INNER JOIN: employees WITH a department
SELECT e.name, d.name as dept_name
FROM Employee e
INNER JOIN Department d ON e.department_id = d.id;

-- LEFT JOIN: all employees (even those without a department)
SELECT e.name, d.name as dept_name
FROM Employee e
LEFT JOIN Department d ON e.department_id = d.id;
-- employees with no dept get NULL for dept_name

-- Find employees WITHOUT a department
SELECT e.name
FROM Employee e
LEFT JOIN Department d ON e.department_id = d.id
WHERE d.id IS NULL;  -- NULL means no match → no department

-- SELF JOIN: employee and their manager
SELECT e.name as employee, m.name as manager
FROM Employee e
LEFT JOIN Employee m ON e.manager_id = m.id;

-- FULL OUTER JOIN (MySQL workaround)
SELECT e.name, d.name
FROM Employee e LEFT JOIN Department d ON e.department_id = d.id
UNION
SELECT e.name, d.name
FROM Employee e RIGHT JOIN Department d ON e.department_id = d.id;`,
      followUp: [
        'What is the difference between WHERE and HAVING?',
        'What is the difference between UNION and UNION ALL?',
      ],
      tip: 'WHERE filters rows BEFORE GROUP BY. HAVING filters groups AFTER GROUP BY. UNION removes duplicates (slower). UNION ALL keeps duplicates (faster).',
    },
    {
      id: 3,
      question: 'What is an index in MySQL? Types of indexes and when to use them.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['MySQL', 'Index', 'Performance'],
      answer: `An index is a data structure that speeds up data retrieval at the cost of storage and write performance.

Think of it like a book index: instead of reading every page (full table scan), you jump to the right page (indexed lookup). For large tables, this is the difference between milliseconds and minutes.

Types:
- Primary Index: automatically created on PRIMARY KEY. Clustered — data rows stored in index order
- Unique Index: enforces uniqueness, fast lookup
- Composite Index: on multiple columns. Column order matters!
- Full-text Index: for text search (MATCH...AGAINST)
- Index for sorting/range queries: helps ORDER BY, BETWEEN, >, <

When to index:
- Columns in WHERE clause
- JOIN columns (foreign keys)
- ORDER BY / GROUP BY columns
- High cardinality columns (many distinct values)

Don't index:
- Low cardinality columns (gender, boolean)
- Small tables (full scan is fine)
- Frequently updated columns (index maintenance overhead)

In MetLife, I improved a critical query from 8 seconds to 50ms by adding a composite index on (policy_number, status, created_at).`,
      code: `-- Create index
CREATE INDEX idx_policy_number ON Policy(policy_number);
CREATE UNIQUE INDEX idx_email ON Customer(email);

-- Composite index (column order matters!)
-- Good for: WHERE policy_number = ? AND status = ?
-- Also good for: WHERE policy_number = ? (leftmost prefix rule)
-- NOT useful for: WHERE status = ? alone
CREATE INDEX idx_policy_status ON Policy(policy_number, status, created_at);

-- Explain plan — see if index is being used
EXPLAIN SELECT * FROM Policy
WHERE policy_number = 'POL-001' AND status = 'ACTIVE';
-- Look for: key (should show your index), rows (should be small)

-- Check table indexes
SHOW INDEX FROM Policy;

-- Covering index: all columns in query are in the index (no table access needed!)
CREATE INDEX idx_covering ON Policy(customer_id, status, premium);
SELECT status, premium FROM Policy WHERE customer_id = 123;
-- MySQL can answer this from the index alone — no row lookup!

-- Force index (override optimizer)
SELECT * FROM Policy FORCE INDEX (idx_policy_number)
WHERE policy_number = 'POL-001';

-- Avoid index killer patterns:
-- Function on indexed column (breaks index)
WHERE YEAR(created_at) = 2024  -- BAD (can't use index on created_at)
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'  -- GOOD

-- Leading wildcard (can't use index)
WHERE name LIKE '%john%'  -- BAD (full scan)
WHERE name LIKE 'john%'   -- GOOD (can use index)`,
      followUp: [
        'What is a clustered index vs non-clustered index?',
        'What is the leftmost prefix rule for composite indexes?',
        'How does EXPLAIN work in MySQL?',
      ],
      tip: 'Composite index rule: index on (A, B, C) helps queries filtering on A, or A+B, or A+B+C. But NOT B alone or C alone. Always put the most selective column first.',
    },
    {
      id: 4,
      question: 'Find employees who earn more than their manager',
      difficulty: 'intermediate',
      asked: true,
      tags: ['SQL', 'Self Join'],
      answer: `Classic self-join problem. Join Employee with itself using manager_id.`,
      code: `-- Table: Employee(id, name, salary, manager_id)

SELECT e.name AS employee, e.salary,
       m.name AS manager, m.salary AS manager_salary
FROM Employee e
JOIN Employee m ON e.manager_id = m.id
WHERE e.salary > m.salary;

-- Count such employees
SELECT COUNT(*) as count_earns_more_than_manager
FROM Employee e
JOIN Employee m ON e.manager_id = m.id
WHERE e.salary > m.salary;`,
      followUp: ['How would you find employees with no manager (top-level employees)?'],
    },
    {
      id: 5,
      question: 'What is database normalization? Explain 1NF, 2NF, 3NF.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Database Design', 'Normalization'],
      answer: `Normalization is the process of organizing a database to reduce redundancy and improve data integrity.

1NF: No repeating groups, atomic values.
- Problem: orders column has "Product1, Product2, Product3"
- Fix: separate OrderItems table

2NF: 1NF + no partial dependency (all non-key columns depend on entire primary key).
- Problem: In OrderItem(order_id, product_id, product_name) — product_name depends only on product_id, not on the full key
- Fix: separate Products table

3NF: 2NF + no transitive dependency.
- Problem: Employee(id, dept_id, dept_name) — dept_name depends on dept_id (not the key)
- Fix: separate Departments table

In my MetLife project, the database was well-normalized to 3NF. When we had performance issues, we carefully denormalized some reporting tables (CQRS pattern) to avoid complex joins in read-heavy queries.`,
      code: `-- NOT normalized (problems):
CREATE TABLE Orders_BAD (
    order_id INT,
    customer_name VARCHAR(100),   -- transitive: depends on customer_id
    customer_email VARCHAR(100),  -- transitive dependency
    products VARCHAR(500),        -- NOT atomic: "ProductA, ProductB"
    PRIMARY KEY(order_id)
);

-- Normalized (3NF):
CREATE TABLE Customer (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Order_Table (
    id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'PROCESSING', 'DELIVERED') DEFAULT 'PENDING',
    FOREIGN KEY (customer_id) REFERENCES Customer(id)
);

CREATE TABLE Product (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE Order_Item (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,  -- snapshot at order time
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES Order_Table(id),
    FOREIGN KEY (product_id) REFERENCES Product(id)
);`,
      followUp: ['When would you intentionally denormalize a database?'],
      tip: 'Denormalize for read-heavy reporting tables, for CQRS read models, or when JOINs are too expensive. Always a deliberate trade-off, not a mistake.',
    },
    {
      id: 6,
      question: 'What are database transactions? Explain ACID properties.',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Transactions', 'ACID', 'Database'],
      answer: `ACID is a set of properties that guarantee database transactions are processed reliably.

Atomicity: all operations in a transaction succeed or all fail. No partial updates. Example: debit account AND credit account must both succeed — can't debit without crediting.

Consistency: transaction takes DB from one valid state to another. All constraints, rules remain satisfied.

Isolation: concurrent transactions don't interfere with each other. Different isolation levels offer different tradeoffs between correctness and performance.

Durability: once committed, the transaction persists even if the system crashes. Data written to disk (WAL/redo log).

In MetLife, I was very conscious of ACID when processing policy premium payments. A payment deduction without the policy being activated would be a data integrity disaster.`,
      code: `-- Isolation Levels (MySQL)
-- READ UNCOMMITTED: sees uncommitted changes (dirty reads) — AVOID
-- READ COMMITTED: sees only committed changes (default Oracle, Postgres)
-- REPEATABLE READ: same query returns same result in a transaction (MySQL default)
-- SERIALIZABLE: strictest, full isolation, performance cost

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

START TRANSACTION;

-- Atomic operation: debit and credit
UPDATE Account SET balance = balance - 1000 WHERE id = 1;  -- debit
UPDATE Account SET balance = balance + 1000 WHERE id = 2;  -- credit

-- Check business rule
SELECT balance INTO @balance FROM Account WHERE id = 1;
IF @balance < 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
END IF;

COMMIT;

-- Explicit locking
START TRANSACTION;
SELECT * FROM Policy WHERE id = 100 FOR UPDATE;  -- locks the row
UPDATE Policy SET status = 'ACTIVE' WHERE id = 100;
COMMIT;`,
      followUp: [
        'What is a dirty read? Phantom read? Non-repeatable read?',
        'What is a deadlock? How do you prevent it?',
      ],
      tip: 'Deadlock: Thread A holds lock on table 1 waiting for table 2. Thread B holds lock on table 2 waiting for table 1. MySQL auto-detects and kills one transaction. Prevent by always acquiring locks in the same order.',
    },
  ],
}

export default sql
