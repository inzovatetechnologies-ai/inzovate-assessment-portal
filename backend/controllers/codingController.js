// Inzovate Enterprise Sandboxed Coding Assessment Controller

const SAMPLE_CODING_CHALLENGES = [
  {
    id: 'code-01',
    title: 'Two Sum in Microservice Transaction Log',
    difficulty: 'Easy',
    description: `Given an array of integer transaction amounts 'nums' and an integer 'target', return indices of the two transaction values such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Implement your optimal O(N) solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def two_sum(nums, target):\n    # Implement your optimal O(N) solution here\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i\n    return []`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) {\n                return new int[] { map.get(comp), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1], isHidden: false },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2], isHidden: false },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1], isHidden: true },
      { input: { nums: [1, 5, 8, 12, 19], target: 20 }, expected: [0, 4], isHidden: true }
    ]
  },
  {
    id: 'code-02',
    title: 'Valid Parentheses & JSON Token Validator',
    difficulty: 'Medium',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.`,
    examples: [
      { input: 's = "()[]{}"', output: 'true', explanation: 'All opening brackets are closed in proper nested sequence.' }
    ],
    starterCode: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (const char of s) {\n    if (pairs[char]) {\n      if (stack.pop() !== pairs[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def is_valid(s: str) -> bool:\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in pairs:\n            if not stack or stack.pop() != pairs[char]:\n                return False\n        else:\n            stack.append(char)\n    return len(stack) == 0`
    },
    testCases: [
      { input: { s: '()[]{}' }, expected: true, isHidden: false },
      { input: { s: '(]' }, expected: false, isHidden: false },
      { input: { s: '([{}])' }, expected: true, isHidden: true },
      { input: { s: '(((' }, expected: false, isHidden: true }
    ]
  }
];

async function getCodingChallenges(req, res) {
  const sanitized = SAMPLE_CODING_CHALLENGES.map(c => ({
    id: c.id,
    title: c.title,
    difficulty: c.difficulty,
    description: c.description,
    examples: c.examples,
    starterCode: c.starterCode,
    publicTestCases: c.testCases.filter(t => !t.isHidden)
  }));
  res.json({ success: true, challenges: sanitized });
}

async function executeCodeSandbox(req, res) {
  try {
    const { challengeId, code, language, isSubmission } = req.body;
    const challenge = SAMPLE_CODING_CHALLENGES.find(c => c.id === challengeId) || SAMPLE_CODING_CHALLENGES[0];

    const testCasesToRun = isSubmission
      ? challenge.testCases
      : challenge.testCases.filter(t => !t.isHidden);

    // Simulated isolated sandbox execution
    const results = testCasesToRun.map((tc, index) => {
      // Basic syntax validation heuristic
      const hasSyntax = code && code.includes('return') && code.length > 25;
      const passed = hasSyntax && !code.includes('syntax_error');

      return {
        testCaseIndex: index + 1,
        isHidden: tc.isHidden,
        passed,
        input: tc.isHidden ? '[HIDDEN PRODUCTION TEST]' : JSON.stringify(tc.input),
        expectedOutput: tc.isHidden ? '[HIDDEN]' : JSON.stringify(tc.expected),
        actualOutput: passed ? (tc.isHidden ? '[PASSED]' : JSON.stringify(tc.expected)) : 'Output mismatch or syntax error',
        executionTimeMs: Math.floor(12 + Math.random() * 20),
        memoryMb: '14.2 MB'
      };
    });

    const allPassed = results.every(r => r.passed);

    res.json({
      success: true,
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      totalTests: results.length,
      passedCount: results.filter(r => r.passed).length,
      executionTimeMs: results.reduce((acc, r) => acc + r.executionTimeMs, 0),
      testResults: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getCodingChallenges,
  executeCodeSandbox
};
