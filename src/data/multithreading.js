const multithreading = {
  title: 'Multithreading & Concurrency',
  description: 'Java threading, synchronization, ExecutorService, concurrent collections, and thread safety.',
  tags: ['Multithreading', 'Concurrency', 'Thread Safety', 'Java'],
  questions: [
    {
      id: 1,
      question: 'What is the difference between Thread and Runnable? How do you create threads?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java', 'Threads'],
      answer: `Three ways to create threads: extend Thread, implement Runnable, or use ExecutorService.

Extending Thread is limiting because Java has single inheritance — if your class extends Thread, it can't extend anything else. Implementing Runnable is more flexible.

But in modern Java (8+), the best way is using ExecutorService or CompletableFuture. Creating raw threads is generally not recommended in production — thread creation is expensive. Thread pools reuse threads.

In my Spring Boot services, I use @Async with a configured ThreadPoolTaskExecutor, or CompletableFuture for parallel API calls.`,
      code: `// 1. Extending Thread
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Running in: " + Thread.currentThread().getName());
    }
}
new MyThread().start();

// 2. Implementing Runnable (preferred)
Runnable task = () -> System.out.println("Runnable in: " + Thread.currentThread().getName());
Thread t = new Thread(task);
t.start();

// 3. ExecutorService (best for production)
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> processVehicleEvent(event));
executor.shutdown();  // graceful shutdown

// 4. CompletableFuture (modern Java 8+)
CompletableFuture<VehicleInfo> future = CompletableFuture.supplyAsync(() ->
    vehicleRegistryClient.fetch(vehicleId)
);

// Parallel API calls
CompletableFuture<VehicleInfo> vehicleFuture = CompletableFuture.supplyAsync(() -> getVehicle(id));
CompletableFuture<DriverInfo> driverFuture = CompletableFuture.supplyAsync(() -> getDriver(driverId));

CompletableFuture.allOf(vehicleFuture, driverFuture).join();

VehicleInfo vehicle = vehicleFuture.get();
DriverInfo driver = driverFuture.get();

// 5. Spring @Async
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class NotificationService {
    @Async  // runs in separate thread
    public CompletableFuture<Void> sendEmail(String to, String msg) {
        emailClient.send(to, msg);
        return CompletableFuture.completedFuture(null);
    }
}`,
      followUp: [
        'What is the difference between start() and run()? (start() creates new thread, run() runs in current thread)',
        'What is ExecutorService? What types of thread pools does Executors provide?',
        'What is the difference between Runnable and Callable?',
      ],
      tip: 'Callable<T> is like Runnable but can return a value and throw checked exceptions. Future<T> holds the result of Callable.',
    },
    {
      id: 2,
      question: 'What is synchronized keyword? What is a race condition?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Synchronization', 'Thread Safety'],
      answer: `A race condition occurs when two threads access shared data concurrently and the result depends on execution order — producing inconsistent results.

Classic example: counter++ is actually 3 operations (read, increment, write). Two threads can both read the same value and both write the same incremented value, losing one increment.

synchronized ensures only one thread at a time can execute the synchronized block. It acquires the object's intrinsic lock.

synchronized can be on: method (locks "this"), static method (locks class), or specific block with a lock object (more granular).

In my Spring Boot services, I use ConcurrentHashMap, AtomicInteger etc. instead of synchronized where possible — they're more efficient and less error-prone.`,
      code: `// Race condition example
class Counter {
    private int count = 0;

    // UNSAFE: race condition
    public void increment() { count++; }  // read, add, write — not atomic!

    // SAFE: synchronized
    public synchronized void incrementSafe() { count++; }

    // BETTER: AtomicInteger
    private AtomicInteger atomicCount = new AtomicInteger(0);
    public void incrementAtomic() { atomicCount.incrementAndGet(); }
}

// Synchronized block (more granular than method sync)
class VehicleRegistry {
    private Map<String, Vehicle> registry = new HashMap<>();
    private final Object lock = new Object();  // dedicated lock object

    public void register(String regNo, Vehicle vehicle) {
        synchronized (lock) {  // only this block is synchronized
            registry.put(regNo, vehicle);
        }
    }

    // Without sync — reads can happen concurrently (if using ConcurrentHashMap)
    public Vehicle get(String regNo) {
        return registry.get(regNo);  // reads don't need sync with ConcurrentHashMap
    }
}

// Better: use thread-safe collections
ConcurrentHashMap<String, Vehicle> registry = new ConcurrentHashMap<>();
CopyOnWriteArrayList<Event> events = new CopyOnWriteArrayList<>();
AtomicInteger counter = new AtomicInteger(0);
AtomicReference<Status> status = new AtomicReference<>(Status.ACTIVE);`,
      followUp: [
        'What is the difference between synchronized and ReentrantLock?',
        'What is a deadlock? Give an example.',
        'What is volatile keyword?',
      ],
      tip: 'volatile ensures visibility (changes are visible to all threads) but NOT atomicity. Use AtomicInteger for atomic operations. Use synchronized/Lock for compound operations.',
    },
    {
      id: 3,
      question: 'What is Multithreading? What is Concurrency? How do you handle concurrent updates on the same data?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Multithreading', 'Concurrency', 'Thread Safety'],
      answer: `Multithreading: a program has multiple threads executing simultaneously, potentially on multiple CPU cores. Enables parallel processing.

Concurrency: multiple tasks make progress in overlapping time periods. Does NOT require true parallelism — on a single CPU, threads context-switch rapidly (time-slicing).

Parallel: truly simultaneous execution on multiple CPU cores.

Concurrency problem: when multiple threads read-modify-write shared data without coordination, you get race conditions — unpredictable results depending on thread scheduling.

Ways to handle concurrent updates:

1. synchronized keyword: locks the object/method. Only one thread executes at a time. Simple but coarse-grained.

2. ReentrantLock: explicit lock with tryLock() timeout, fairness, interruptible waits. More flexible than synchronized.

3. Atomic classes (AtomicInteger, AtomicLong, AtomicReference): CAS (Compare-And-Swap) operations. No blocking — highly efficient for counters and simple state.

4. volatile keyword: guarantees visibility (all threads see the latest value). Does NOT guarantee atomicity. Use for simple flags.

5. ConcurrentHashMap, CopyOnWriteArrayList: thread-safe collections.

6. Database-level locking: optimistic (version column) or pessimistic (SELECT FOR UPDATE) for distributed concurrent updates.`,
      code: `// Race condition example
int counter = 0;
// Thread 1 and Thread 2 both do counter++ simultaneously
// counter++ is NOT atomic: read → increment → write
// Both threads read 5, both write 6 → lost update

// Fix 1: synchronized
private int counter = 0;
public synchronized void increment() { counter++; }

// Fix 2: AtomicInteger (preferred for counters — no blocking)
private AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();  // atomic CAS operation

// Fix 3: ReentrantLock (use when you need tryLock or timed lock)
private final ReentrantLock lock = new ReentrantLock();
public void process() {
    lock.lock();
    try {
        // critical section
    } finally {
        lock.unlock();  // always unlock in finally
    }
}

// Fix 4: volatile — for simple boolean flags (visibility only, not atomicity)
private volatile boolean running = true;
public void stop() { running = false; }  // visible to all threads immediately`,
    },
    {
      id: 4,
      question: 'Runnable vs Callable — what is the difference?',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java', 'Threads', 'Runnable', 'Callable'],
      answer: `Both represent tasks to be executed by a thread. The differences:

Runnable:
- run() method: void — returns nothing
- Cannot throw checked exceptions
- Use with Thread, ExecutorService.submit(), @Async

Callable<V>:
- call() method: returns a value of type V
- CAN throw checked exceptions
- Used with ExecutorService.submit() → returns Future<V>
- Future.get() blocks until the result is ready (or throws exception)

When to use which:
- Just need to run something in background, don't care about result → Runnable
- Need the result of the background computation → Callable + Future
- Modern code: use CompletableFuture (extends Future, adds chaining, non-blocking callbacks)`,
      code: `// Runnable — no return value, no checked exception
Runnable task = () -> {
    System.out.println("Processing event: " + event.getId());
    eventService.process(event);
};
executor.submit(task);  // fire and forget

// Callable — returns result, can throw checked exception
Callable<VehicleInfo> fetchTask = () -> {
    return registryClient.fetchVehicle(regNo);  // may throw IOException
};
Future<VehicleInfo> future = executor.submit(fetchTask);
VehicleInfo info = future.get(5, TimeUnit.SECONDS);  // blocks, throws on timeout

// CompletableFuture (modern, preferred)
CompletableFuture<VehicleInfo> cfuture = CompletableFuture
    .supplyAsync(() -> registryClient.fetchVehicle(regNo))  // like Callable
    .thenApply(info -> enrichWithLocalData(info))           // chain transformation
    .exceptionally(ex -> VehicleInfo.fallback(regNo));      // handle failure

// Parallel tasks
CompletableFuture<VehicleInfo> v = CompletableFuture.supplyAsync(() -> getVehicle(id));
CompletableFuture<DriverInfo> d = CompletableFuture.supplyAsync(() -> getDriver(driverId));
CompletableFuture.allOf(v, d).join();  // wait for both`,
    },
    {
      id: 5,
      question: 'Explain ExecutorService and Thread Pools. How do you configure them?',
      difficulty: 'intermediate',
      asked: true,
      tags: ['Java', 'ExecutorService', 'Thread Pool'],
      answer: `ExecutorService manages a pool of threads and executes tasks submitted to it. Creating raw threads (new Thread()) for each task is expensive — thread creation is slow. Thread pools reuse threads.

Common thread pool types:
- newFixedThreadPool(n): fixed number of threads. Good for known, bounded concurrency.
- newCachedThreadPool(): grows as needed, removes idle threads after 60s. Good for short-lived async tasks.
- newSingleThreadExecutor(): one thread, tasks run sequentially. Good for ordered task processing.
- newScheduledThreadPool(n): for scheduled/periodic tasks (replaces Timer).

In Spring Boot: use @Async with a configured ThreadPoolTaskExecutor. Define the executor as a bean, set core/max pool size and queue capacity.

Key ThreadPoolExecutor parameters:
- corePoolSize: threads always alive even when idle
- maxPoolSize: max threads when queue is full
- queueCapacity: task queue size
- When queue full + maxPool reached → RejectedExecutionException (configure rejection policy)`,
      code: `// Spring Boot: configure @Async thread pool
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("taskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);         // always 5 threads alive
        executor.setMaxPoolSize(20);         // up to 20 during bursts
        executor.setQueueCapacity(100);      // queue 100 tasks before scaling
        executor.setThreadNamePrefix("async-worker-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

// Use @Async
@Service
public class NotificationService {
    @Async("taskExecutor")
    public void sendEmail(String to, String subject) {
        // runs in thread pool, non-blocking for caller
        emailClient.send(to, subject);
    }
}

// Raw ExecutorService
ExecutorService executor = Executors.newFixedThreadPool(10);
List<Future<VehicleInfo>> futures = vehicleIds.stream()
    .map(id -> executor.submit(() -> loadVehicle(id)))
    .collect(Collectors.toList());

executor.shutdown();  // stops accepting new tasks
executor.awaitTermination(30, TimeUnit.SECONDS);  // wait for current tasks`,
    },
    {
      id: 6,
      question: 'Explain the Thread Lifecycle in Java.',
      difficulty: 'beginner',
      asked: true,
      tags: ['Java', 'Threads', 'Lifecycle'],
      answer: `A Java thread goes through these states (defined in Thread.State enum):

NEW: Thread object created but start() not called yet.

RUNNABLE: After start() is called. Thread is eligible to run — may be running on CPU or waiting for CPU time (OS scheduler decides). Java doesn't distinguish between "running" and "ready."

BLOCKED: Thread is waiting to acquire a synchronized lock held by another thread.

WAITING: Thread is waiting indefinitely for another thread to perform an action.
Caused by: Object.wait(), Thread.join(), LockSupport.park()

TIMED_WAITING: Thread is waiting for a specified time.
Caused by: Thread.sleep(ms), Object.wait(ms), Thread.join(ms)

TERMINATED: Thread has completed execution (run() method returned or exception thrown).

Key methods:
- start(): moves thread from NEW to RUNNABLE
- sleep(ms): RUNNABLE → TIMED_WAITING (doesn't release locks)
- wait(): RUNNABLE → WAITING (RELEASES the lock — must be in synchronized block)
- notify()/notifyAll(): moves waiting thread back to BLOCKED (to re-acquire lock)
- join(): caller waits for the target thread to reach TERMINATED`,
      code: `Thread thread = new Thread(() -> {
    System.out.println("Running: " + Thread.currentThread().getState()); // RUNNABLE
    try {
        Thread.sleep(1000);  // TIMED_WAITING for 1 second
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});

System.out.println("Before start: " + thread.getState()); // NEW
thread.start();
System.out.println("After start: " + thread.getState());  // RUNNABLE or TIMED_WAITING
thread.join();  // caller blocks until thread completes
System.out.println("After join: " + thread.getState());   // TERMINATED

// wait() vs sleep() — key interview question:
// wait() — releases the lock, used for inter-thread communication
// sleep() — holds the lock, just pauses execution

synchronized(lock) {
    while (!conditionMet) {
        lock.wait();   // releases lock, waits for notify()
    }
    // condition is now met, process
}

// In another thread:
synchronized(lock) {
    conditionMet = true;
    lock.notifyAll();  // wake up waiting threads
}`,
    },
    {
      id: 7,
      question: 'Design BookMyShow ticket booking — how do you handle concurrency?',
      difficulty: 'advanced',
      asked: true,
      tags: ['System Design', 'Concurrency', 'Database Locks'],
      answer: `This is a classic concurrency interview question. The problem: thousands of users click "Book" simultaneously for the same seats. You must prevent double-booking.

Approach:
1. Database-level locking (most reliable for distributed systems):
   - Pessimistic lock: SELECT seat_id FROM seats WHERE id = ? AND status = 'AVAILABLE' FOR UPDATE
   - Only one transaction holds the lock; others wait. On commit/rollback, next transaction proceeds.
   - Guarantees exactly-one booking.

2. Optimistic lock (better for low contention):
   - Add version column. Both users read version=1. First to UPDATE wins (sets version=2, status=BOOKED). Second's UPDATE finds version changed → fails → return "seat taken."

3. Redis Distributed Lock (for microservices):
   - SETNX seat:{seatId} userId EX 10 (acquire lock with 10s TTL)
   - Only one service instance proceeds. Others retry or fail fast.
   - After booking, release lock.

4. Temporary Hold (better UX):
   - When user selects seats: hold them for 10 minutes (status = HELD, userId, expiry)
   - Background job releases expired holds
   - User completes payment within hold window → status = BOOKED
   - This prevents another user from selecting the same seat during checkout

In practice: combination of hold (UX) + DB lock on final payment (consistency).`,
      code: `// Seat booking with pessimistic lock
@Transactional
public BookingConfirmation bookSeat(Long seatId, Long userId) {

    // SELECT FOR UPDATE — locks this row, other transactions wait
    Seat seat = seatRepo.findByIdWithLock(seatId);

    if (seat.getStatus() != SeatStatus.AVAILABLE) {
        throw new SeatNotAvailableException("Seat " + seatId + " is already booked");
    }

    // Safe to book — we have the lock
    seat.setStatus(SeatStatus.BOOKED);
    seat.setBookedBy(userId);
    seatRepo.save(seat);

    return new BookingConfirmation(seat, userId);
}  // lock released on transaction commit

// Repository
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT s FROM Seat s WHERE s.id = :id")
Seat findByIdWithLock(@Param("id") Long id);

// Temporary hold flow:
// 1. User selects seat → POST /seats/{id}/hold (10 min expiry)
// 2. User enters payment → POST /bookings (verify hold, charge, book)
// 3. Scheduler: every minute, release expired holds`,
    },
  ],
}

export default multithreading
