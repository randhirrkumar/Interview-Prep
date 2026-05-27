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
  ],
}

export default multithreading
