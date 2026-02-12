export function mockExplain(problem: string) {
  const normalized = problem.toLowerCase();

  if (normalized.includes("two sum")) {
    return `
1. Problem Summary
Given an array of integers and a target, find two indices such that their values add up to the target.

2. Key Insight
If we know the complement (target - current number), we can check if we’ve seen it before.

3. Optimal Approach
Use a hash map to store numbers and their indices while iterating through the array.

4. Time Complexity
O(n)

5. Space Complexity
O(n)

6. Common Mistakes
- Using brute force O(n²)
- Returning values instead of indices
- Forgetting duplicate handling

7. Example Walkthrough
nums = [2, 7, 11, 15], target = 9
Start with 2 → need 7 → store 2
Next is 7 → found 2 → return [0, 1]
`;
  }

  return `
I couldn't recognize this problem yet.
Try inputs like:
- two sum
- valid anagram
- contains duplicate
`;
}
