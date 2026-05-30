const dsaProblems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    tags: ['HashMap', 'Arrays'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    approach: `Brute force O(n²): check every pair. Optimal O(n): use a HashMap to store complement.
For each number, check if target-num exists in the map. If yes, return indices. If no, store num with its index.`,
    solution: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }

    throw new IllegalArgumentException("No solution found");
}`,
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
  {
    id: 2,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    tags: ['Stack', 'String'],
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. Brackets must close in the correct order.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    approach: `Use a stack. For each opening bracket push to stack. For each closing bracket, check if it matches the top of the stack. At the end, stack should be empty.`,
    solution: `public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pairs = Map.of(')', '(', '}', '{', ']', '[');

    for (char c : s.toCharArray()) {
        if (!pairs.containsKey(c)) {
            stack.push(c);  // opening bracket
        } else {
            if (stack.isEmpty() || stack.peek() != pairs.get(c)) {
                return false;
            }
            stack.pop();
        }
    }

    return stack.isEmpty();
}`,
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
  {
    id: 3,
    title: 'Reverse a Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    tags: ['Linked List', 'Iterative', 'Recursive'],
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    approach: `Iterative: Keep track of previous, current, and next nodes. At each step, reverse the current node's pointer to previous, then advance all three pointers.

Recursive: Reverse from the end. The base case is null or single node. Recursively reverse the rest, then attach current node at the end.`,
    solution: `// Iterative — O(n) time, O(1) space
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;

    while (curr != null) {
        ListNode next = curr.next;  // save next
        curr.next = prev;           // reverse pointer
        prev = curr;                // advance prev
        curr = next;                // advance curr
    }

    return prev;  // prev is new head
}

// Recursive — O(n) time, O(n) space (call stack)
public ListNode reverseListRecursive(ListNode head) {
    if (head == null || head.next == null) return head;

    ListNode newHead = reverseListRecursive(head.next);
    head.next.next = head;  // reverse the link
    head.next = null;       // clear old link
    return newHead;
}`,
    complexity: { time: 'O(n)', space: 'O(1) iterative' },
  },
  {
    id: 4,
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    category: 'Arrays',
    tags: ['Dynamic Programming', 'Arrays'],
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    approach: `Kadane's Algorithm: At each position, decide whether to extend the existing subarray or start fresh.
currentSum = max(num, currentSum + num)
maxSum = max(maxSum, currentSum)

If currentSum goes negative, it's better to start fresh from the next element.`,
    solution: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];

    for (int i = 1; i < nums.length; i++) {
        // Either extend current subarray or start fresh
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }

    return maxSum;
}

// If you also need to track the subarray indices:
public int[] maxSubArrayWithIndices(int[] nums) {
    int maxSum = nums[0], currentSum = nums[0];
    int start = 0, end = 0, tempStart = 0;

    for (int i = 1; i < nums.length; i++) {
        if (currentSum + nums[i] < nums[i]) {
            currentSum = nums[i];
            tempStart = i;
        } else {
            currentSum += nums[i];
        }
        if (currentSum > maxSum) {
            maxSum = currentSum;
            start = tempStart;
            end = i;
        }
    }
    return new int[]{maxSum, start, end};
}`,
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  {
    id: 5,
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    tags: ['Binary Search', 'Arrays'],
    description: 'Given an array of integers nums sorted in ascending order, and an integer target, write a function to search target in nums. Return the index if found, else return -1.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    approach: `Classic binary search. Maintain lo and hi pointers. Calculate mid = lo + (hi - lo) / 2 (avoids integer overflow vs (lo+hi)/2).
If nums[mid] == target: found. If nums[mid] < target: search right half. Else: search left half.`,
    solution: `public int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;  // avoids overflow

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    return -1;
}

// Find first occurrence (when duplicates exist)
public int searchFirst(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1, result = -1;

    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) {
            result = mid;
            hi = mid - 1;  // keep searching left
        } else if (nums[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    return result;
}`,
    complexity: { time: 'O(log n)', space: 'O(1)' },
  },
  {
    id: 6,
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    tags: ['Linked List', 'Merge'],
    description: 'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
    examples: [
      { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'l1 = [], l2 = []', output: '[]' },
    ],
    approach: `Use a dummy head node to simplify edge cases. Compare current nodes of both lists, attach the smaller one to result, advance that list's pointer. When one list is exhausted, append the rest of the other.`,
    solution: `public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;

    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }

    // Attach remaining nodes
    current.next = (l1 != null) ? l1 : l2;

    return dummy.next;
}`,
    complexity: { time: 'O(m+n)', space: 'O(1)' },
  },
  {
    id: 7,
    title: 'Climbing Stairs (DP)',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    tags: ['Dynamic Programming', 'Fibonacci'],
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
    ],
    approach: `This is essentially Fibonacci. To reach step n, you could have come from step n-1 (1 step) or step n-2 (2 steps).
ways(n) = ways(n-1) + ways(n-2), with base cases ways(1)=1, ways(2)=2.
Optimize space to O(1) by only keeping the last two values.`,
    solution: `// O(n) time, O(1) space
public int climbStairs(int n) {
    if (n <= 2) return n;

    int prev2 = 1;  // ways(1)
    int prev1 = 2;  // ways(2)

    for (int i = 3; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }

    return prev1;
}

// Memoized recursive (top-down DP)
public int climbStairsMemo(int n) {
    int[] memo = new int[n + 1];
    return helper(n, memo);
}

private int helper(int n, int[] memo) {
    if (n <= 2) return n;
    if (memo[n] != 0) return memo[n];
    memo[n] = helper(n - 1, memo) + helper(n - 2, memo);
    return memo[n];
}`,
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  {
    id: 8,
    title: 'Find Duplicates in Array',
    difficulty: 'Easy',
    category: 'Arrays',
    tags: ['Arrays', 'HashSet'],
    description: 'Given an array of integers where 1 ≤ a[i] ≤ n (n = size of array), some elements appear twice and others appear once. Find all the elements that appear twice.',
    examples: [
      { input: 'nums = [4,3,2,7,8,2,3,1]', output: '[2,3]' },
      { input: 'nums = [1,1,2]', output: '[1]' },
    ],
    approach: `Approach 1 (HashSet): Add to set, if already present — it's a duplicate. O(n) time, O(n) space.
Approach 2 (In-place): Use the sign of nums[|num|-1] as a visited marker. O(n) time, O(1) space.`,
    solution: `// HashSet approach — simple O(n) time, O(n) space
public List<Integer> findDuplicates(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    List<Integer> result = new ArrayList<>();

    for (int num : nums) {
        if (!seen.add(num)) result.add(num);
    }
    return result;
}

// In-place O(1) space — use index as hash
public List<Integer> findDuplicatesOptimal(int[] nums) {
    List<Integer> result = new ArrayList<>();

    for (int num : nums) {
        int idx = Math.abs(num) - 1;
        if (nums[idx] < 0) {
            result.add(Math.abs(num));  // already visited
        } else {
            nums[idx] = -nums[idx];     // mark as visited
        }
    }
    return result;
}`,
    complexity: { time: 'O(n)', space: 'O(1) optimal' },
  },
  {
    id: 9,
    title: 'Level Order Traversal (BFS)',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['BFS', 'Binary Tree', 'Queue'],
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
    ],
    approach: `BFS using a Queue. Process all nodes at current level before moving to the next. At each level, record the queue size first — that's how many nodes are in the current level.`,
    solution: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size();  // nodes in current level
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);

            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }

        result.add(level);
    }

    return result;
}`,
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
  {
    id: 10,
    title: 'Detect Cycle in Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    tags: ['Linked List', 'Two Pointers', 'Floyd\'s Algorithm'],
    description: 'Given head of a linked list, determine if the linked list has a cycle in it.',
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'Tail connects to node at index 1' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' },
    ],
    approach: `Floyd's Cycle Detection (Tortoise and Hare): Use two pointers — slow moves 1 step, fast moves 2 steps. If they meet, there's a cycle. If fast reaches null, no cycle.

Space-optimized vs HashSet approach (O(n) space).`,
    solution: `// Floyd's algorithm — O(n) time, O(1) space
public boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;         // 1 step
        fast = fast.next.next;    // 2 steps

        if (slow == fast) return true;  // cycle detected
    }

    return false;
}

// Find the START of the cycle (follow-up question)
public ListNode detectCycleStart(ListNode head) {
    ListNode slow = head, fast = head;

    // Phase 1: detect cycle
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) break;
    }

    if (fast == null || fast.next == null) return null;

    // Phase 2: find entry point
    slow = head;
    while (slow != fast) {
        slow = slow.next;
        fast = fast.next;
    }
    return slow;
}`,
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  {
    id: 11,
    title: 'Group Anagrams',
    difficulty: 'Medium',
    category: 'Strings',
    tags: ['HashMap', 'Sorting', 'Strings'],
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    approach: `Sort each string alphabetically — anagrams will have the same sorted form. Use the sorted form as a HashMap key. Group strings by their key.`,
    solution: `public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();

    for (String str : strs) {
        char[] chars = str.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);  // sorted string as key

        map.computeIfAbsent(key, k -> new ArrayList<>()).add(str);
    }

    return new ArrayList<>(map.values());
}

// Alternative key using character count (avoids sorting)
public List<List<String>> groupAnagramsOptimal(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();

    for (String str : strs) {
        int[] count = new int[26];
        for (char c : str.toCharArray()) count[c - 'a']++;

        String key = Arrays.toString(count);  // "[1,0,0,...,1,0,0]"
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(str);
    }

    return new ArrayList<>(map.values());
}`,
    complexity: { time: 'O(n * k log k)', space: 'O(n * k)' },
  },
  {
    id: 12,
    title: 'Longest Common Subsequence (LCS)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Dynamic Programming', '2D DP', 'Strings'],
    description: 'Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence that can be derived by deleting some characters without changing the order.',
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'LCS is "ace"' },
      { input: 'text1 = "abc", text2 = "abc"', output: '3' },
      { input: 'text1 = "abc", text2 = "def"', output: '0' },
    ],
    approach: `2D DP table. dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].
If chars match: dp[i][j] = dp[i-1][j-1] + 1
If chars don't match: dp[i][j] = max(dp[i-1][j], dp[i][j-1])`,
    solution: `public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}

// Space-optimized O(n) space
public int lcsOptimized(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[] dp = new int[n + 1];

    for (int i = 1; i <= m; i++) {
        int prev = 0;
        for (int j = 1; j <= n; j++) {
            int temp = dp[j];
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[j] = prev + 1;
            } else {
                dp[j] = Math.max(dp[j], dp[j - 1]);
            }
            prev = temp;
        }
    }

    return dp[n];
}`,
    complexity: { time: 'O(m*n)', space: 'O(m*n)' },
  },
  // ─── Week 1: Arrays & Hashing ────────────────────────────────────────────────
  {
    id: 13,
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    tags: ['HashSet', 'Arrays'],
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct. (LC #217)',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    approach: `To the interviewer:
"My first instinct is a brute force — compare every pair, O(n²). But a better way is to use a HashSet. As I iterate, I try to add each number to the set. HashSet.add() returns false if the element is already there, so the moment it returns false I know I found a duplicate. This gives me O(n) time and O(n) space."`,
    solution: `// What I say: "I'll use a HashSet — add() returns false if element already exists"
public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();

    for (int num : nums) {
        if (!seen.add(num)) {
            return true;  // add() returned false → duplicate found
        }
    }

    return false;  // all elements were unique
}

// Brute force I started with (O(n²) — mention this then improve it):
// for (int i = 0; i < nums.length; i++)
//     for (int j = i+1; j < nums.length; j++)
//         if (nums[i] == nums[j]) return true;`,
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
  {
    id: 14,
    title: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    tags: ['HashMap', 'Sorting', 'Strings'],
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses all characters of the original string exactly once. (LC #242)',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    approach: `To the interviewer:
"First I check lengths — if they differ, it can't be an anagram. Then I have two approaches:
Approach 1 (Sort): Sort both strings, if they are equal they are anagrams — O(n log n).
Approach 2 (Count array — optimal): Use an int[26] array indexed by character. Increment for each char in s, decrement for each char in t. If all counts are zero at the end, they are anagrams — O(n) time, O(1) space since the array is fixed size 26."`,
    solution: `// Optimal: character count array — O(n) time, O(1) space
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;

    int[] count = new int[26]; // index 0 = 'a', 25 = 'z'

    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;  // count up for s
        count[t.charAt(i) - 'a']--;  // count down for t
    }

    // If anagram, every frequency cancels out to 0
    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}

// Sorting approach — O(n log n), also correct and easy to explain:
public boolean isAnagramSort(String s, String t) {
    if (s.length() != t.length()) return false;
    char[] a = s.toCharArray();
    char[] b = t.toCharArray();
    Arrays.sort(a);
    Arrays.sort(b);
    return Arrays.equals(a, b); // anagrams have same sorted form
}`,
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  {
    id: 15,
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    tags: ['HashMap', 'PriorityQueue', 'Bucket Sort'],
    description: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order. (LC #347)',
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    approach: `To the interviewer:
"Step 1 is clear — build a frequency map with a HashMap.
Step 2 has two options:
Option A (Min-Heap, O(n log k)): Keep a min-heap of size k. For each element in the map, push it. If the heap grows past k, remove the minimum. What remains are the k most frequent.
Option B (Bucket Sort, O(n)): Create an array of lists where index = frequency. Since frequency can be at most n, the array size is n+1. Fill it, then read from the end to get top k. This is O(n) and the most impressive answer in an interview."`,
    solution: `// Approach 1: Min-Heap — O(n log k) time
public int[] topKFrequent(int[] nums, int k) {
    // Step 1: count frequencies
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) {
        freq.put(num, freq.getOrDefault(num, 0) + 1);
    }

    // Step 2: min-heap ordered by frequency, keep only k elements
    PriorityQueue<Integer> heap = new PriorityQueue<>(
        (a, b) -> freq.get(a) - freq.get(b)  // min-heap by frequency
    );

    for (int num : freq.keySet()) {
        heap.offer(num);
        if (heap.size() > k) heap.poll(); // drop least frequent
    }

    // Step 3: collect result
    int[] result = new int[k];
    for (int i = 0; i < k; i++) result[i] = heap.poll();
    return result;
}

// Approach 2: Bucket Sort — O(n) time (best for interviews)
public int[] topKFrequentBucket(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) freq.put(num, freq.getOrDefault(num, 0) + 1);

    // bucket[i] holds all numbers that appear exactly i times
    List<Integer>[] bucket = new List[nums.length + 1];
    for (int num : freq.keySet()) {
        int f = freq.get(num);
        if (bucket[f] == null) bucket[f] = new ArrayList<>();
        bucket[f].add(num);
    }

    // Read from highest frequency downward
    int[] result = new int[k];
    int idx = 0;
    for (int i = bucket.length - 1; i >= 0 && idx < k; i--) {
        if (bucket[i] != null) {
            for (int num : bucket[i]) {
                result[idx++] = num;
                if (idx == k) return result;
            }
        }
    }
    return result;
}`,
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
  {
    id: 16,
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    tags: ['Arrays', 'Prefix Product'],
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i]. Solve it in O(n) without using the division operator. (LC #238)',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
    ],
    approach: `To the interviewer:
"Without division, the key insight is: for each index i, the answer is (product of everything LEFT of i) × (product of everything RIGHT of i).
I do two passes:
Pass 1 (left to right): result[i] = product of all elements before i.
Pass 2 (right to left): I keep a running right-product and multiply it into result[i].
After both passes, result[i] has exactly the product of all elements except itself. This is O(n) time and O(1) extra space."`,
    solution: `// O(n) time, O(1) extra space — two pass prefix × suffix product
public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];

    // Pass 1 (left to right): result[i] = product of nums[0..i-1]
    result[0] = 1; // nothing to the left of index 0
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    // For [1,2,3,4]: result = [1, 1, 2, 6]

    // Pass 2 (right to left): multiply in the right-side product
    int right = 1; // nothing to the right of last index
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;   // multiply left-product × right-product
        right *= nums[i];     // extend right product for next iteration
    }
    // For [1,2,3,4]: result = [24, 12, 8, 6] ✓

    return result;
}`,
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  {
    id: 17,
    title: 'Longest Consecutive Sequence',
    difficulty: 'Hard',
    category: 'Arrays & Hashing',
    tags: ['HashSet', 'Arrays'],
    description: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time. (LC #128)',
    examples: [
      { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'Sequence [1,2,3,4]' },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' },
    ],
    approach: `To the interviewer:
"Sorting would be O(n log n) — can we do O(n)? Yes, using a HashSet.
The trick: we only START counting a sequence from its smallest number. How do I know if a number is the start? If (num - 1) is NOT in the set.
Once I find a start, I count upward while (num + 1) exists in the set.
Putting all numbers in a HashSet first lets me do each lookup in O(1). Each number is visited at most twice total — once in the outer loop, once in the inner while. So it's O(n) overall."`,
    solution: `// O(n) time, O(n) space — HashSet with sequence-start trick
public int longestConsecutive(int[] nums) {
    // Step 1: put everything in a set for O(1) lookup
    Set<Integer> set = new HashSet<>();
    for (int num : nums) set.add(num);

    int maxLen = 0;

    for (int num : set) {
        // Only start counting if this is the beginning of a sequence
        // (i.e., no smaller neighbour exists)
        if (!set.contains(num - 1)) {
            int current = num;
            int length = 1;

            // Extend the sequence as far as possible
            while (set.contains(current + 1)) {
                current++;
                length++;
            }

            maxLen = Math.max(maxLen, length);
        }
    }

    return maxLen;
}

// Trace for [100, 4, 200, 1, 3, 2]:
// num=1  → start (0 not in set) → 1,2,3,4 → length=4 ✓
// num=4  → skip (3 is in set, not a start)
// num=100 → start (99 not in set) → length=1
// num=200 → start (199 not in set) → length=1
// maxLen = 4`,
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
]

export default dsaProblems
