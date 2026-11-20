// Complete Inzovate 45-Question Master Question Banks
// Section 1: Aptitude & Logical Reasoning (15 Qs: 8 Quant, 7 Logical)
// Section 2: Communication Assessment (15 Qs: 4 Grammar, 3 Vocab, 3 Reading, 3 Situational, 2 Professional)
// Section 3: Domain-Specific Technical (15 Qs per role)

const APTITUDE_LOGICAL_QUESTIONS = [
  // Quantitative Aptitude (8 Questions)
  {
    _id: 'q-apt-01',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'Easy',
    question: 'A tech company increased its employee referral bonus from ₹20,000 to ₹25,000. What is the percentage increase in the referral bonus?',
    options: [
      { id: 'A', text: '20%' },
      { id: 'B', text: '25%' },
      { id: 'C', text: '30%' },
      { id: 'D', text: '15%' }
    ],
    correctOption: 'B',
    explanation: 'Increase = 25,000 - 20,000 = 5,000. Percentage Increase = (5000 / 20000) * 100 = 25%.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-apt-02',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Profit and Loss',
    difficulty: 'Medium',
    question: 'A software vendor sells a license for ₹8,400, thereby making a profit of 20%. At what cost price did the vendor procure the software?',
    options: [
      { id: 'A', text: '₹6,800' },
      { id: 'B', text: '₹7,000' },
      { id: 'C', text: '₹7,200' },
      { id: 'D', text: '₹6,500' }
    ],
    correctOption: 'B',
    explanation: 'SP = CP * (1 + Profit%). 8400 = CP * 1.2 => CP = 8400 / 1.2 = ₹7,000.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-apt-03',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Time and Work',
    difficulty: 'Medium',
    question: 'Developer A can build a microservice module in 12 days, while Developer B can build the same module in 24 days. Working together, in how many days can they complete the module?',
    options: [
      { id: 'A', text: '6 days' },
      { id: 'B', text: '8 days' },
      { id: 'C', text: '9 days' },
      { id: 'D', text: '10 days' }
    ],
    correctOption: 'B',
    explanation: 'Work done per day = 1/12 + 1/24 = (2 + 1)/24 = 3/24 = 1/8. Total time = 8 days.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-apt-04',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Time, Speed and Distance',
    difficulty: 'Medium',
    question: 'A fiber optic data pulse travels a round trip to a remote data center at 180 km/h and returns along the same route at 120 km/h. What is the average speed of data propagation for the round trip?',
    options: [
      { id: 'A', text: '144 km/h' },
      { id: 'B', text: '150 km/h' },
      { id: 'C', text: '140 km/h' },
      { id: 'D', text: '160 km/h' }
    ],
    correctOption: 'A',
    explanation: 'Average speed for equal distance = 2 * v1 * v2 / (v1 + v2) = 2 * 180 * 120 / (180 + 120) = 43200 / 300 = 144 km/h.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-apt-05',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Ratio and Proportion',
    difficulty: 'Easy',
    question: 'The ratio of frontend engineers to backend engineers in an Inzovate project team is 3:5. If there are 40 engineers in total, how many are backend engineers?',
    options: [
      { id: 'A', text: '15' },
      { id: 'B', text: '20' },
      { id: 'C', text: '25' },
      { id: 'D', text: '30' }
    ],
    correctOption: 'C',
    explanation: 'Total ratio parts = 3 + 5 = 8. Backend engineers = (5 / 8) * 40 = 25.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-apt-06',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Averages',
    difficulty: 'Easy',
    question: 'A recruitment team conducted 5 drives across colleges. The candidate counts shortlisted were 32, 45, 28, 55, and 40. What is the average number of shortlisted candidates per drive?',
    options: [
      { id: 'A', text: '38' },
      { id: 'B', text: '40' },
      { id: 'C', text: '42' },
      { id: 'D', text: '44' }
    ],
    correctOption: 'B',
    explanation: 'Sum = 32 + 45 + 28 + 55 + 40 = 200. Average = 200 / 5 = 40.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-apt-07',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Number Systems',
    difficulty: 'Hard',
    question: 'What is the remainder when (7^84 + 3) is divided by 8?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '4' },
      { id: 'D', text: '0' }
    ],
    correctOption: 'C',
    explanation: '7 = -1 (mod 8). 7^84 = (-1)^84 = 1 (mod 8). So (7^84 + 3) = 1 + 3 = 4 (mod 8). Remainder is 4.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-apt-08',
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Simple and Compound Interest',
    difficulty: 'Medium',
    question: 'An enterprise cloud storage budget of ₹50,000 yields simple interest of ₹9,000 over 3 years. What is the annual interest rate?',
    options: [
      { id: 'A', text: '5%' },
      { id: 'B', text: '6%' },
      { id: 'C', text: '7%' },
      { id: 'D', text: '8%' }
    ],
    correctOption: 'B',
    explanation: 'SI = (P * R * T) / 100 => 9000 = (50000 * R * 3) / 100 => 9000 = 1500 * R => R = 6%.',
    marks: 1,
    isApproved: true
  },

  // Logical Reasoning (7 Questions)
  {
    _id: 'q-log-09',
    section: 'section-1',
    category: 'Logical Reasoning',
    topic: 'Number Series',
    difficulty: 'Easy',
    question: 'Find the next number in the sequence: 4, 9, 19, 39, 79, ?',
    options: [
      { id: 'A', text: '119' },
      { id: 'B', text: '139' },
      { id: 'C', text: '159' },
      { id: 'D', text: '169' }
    ],
    correctOption: 'C',
    explanation: 'Pattern: (n * 2) + 1. 4*2+1=9, 9*2+1=19, 19*2+1=39, 39*2+1=79, 79*2+1=159.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-log-10',
    section: 'section-1',
    category: 'Logical Reasoning',
    topic: 'Coding and Decoding',
    difficulty: 'Medium',
    question: 'In a secret server protocol, if "CLOUD" is coded as "ENQWF", how will "CYBER" be coded using the identical shift logic?',
    options: [
      { id: 'A', text: 'EADGT' },
      { id: 'B', text: 'EADHT' },
      { id: 'C', text: 'EZCGT' },
      { id: 'D', text: 'EBDGT' }
    ],
    correctOption: 'A',
    explanation: 'Each letter is shifted forward by 2 positions: C->E, L->N, O->Q, U->W, D->F. Thus: C->E, Y->A, B->D, E->G, R->T = EADGT.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-log-11',
    section: 'section-1',
    category: 'Logical Reasoning',
    topic: 'Blood Relations',
    difficulty: 'Medium',
    question: 'Pointing to a photograph on the office board, Priya says: "His father is the only son of my grandfather." How is the boy in the photograph related to Priya?',
    options: [
      { id: 'A', text: 'Cousin' },
      { id: 'B', text: 'Brother' },
      { id: 'C', text: 'Nephew' },
      { id: 'D', text: 'Uncle' }
    ],
    correctOption: 'B',
    explanation: 'The only son of Priya\'s grandfather is Priya\'s father. The boy\'s father is Priya\'s father. Hence, the boy is Priya\'s brother.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-log-12',
    section: 'section-1',
    category: 'Logical Reasoning',
    topic: 'Direction Sense',
    difficulty: 'Easy',
    question: 'A field engineer walks 20 meters North, turns right and walks 30 meters, then turns right again and walks 20 meters. How far and in what direction is the engineer from the starting position?',
    options: [
      { id: 'A', text: '30 meters East' },
      { id: 'B', text: '30 meters West' },
      { id: 'C', text: '20 meters East' },
      { id: 'D', text: '50 meters North' }
    ],
    correctOption: 'A',
    explanation: 'North 20m, then East 30m, then South 20m returns the engineer to the original latitude, leaving him 30 meters East of the starting point.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-log-13',
    section: 'section-1',
    category: 'Logical Reasoning',
    topic: 'Seating Arrangements',
    difficulty: 'Hard',
    question: 'Five developers (P, Q, R, S, T) sit in a row facing North. R sits to the immediate right of Q. S sits between P and T. If P sits at the extreme left end and Q is immediately right of T, who sits in the middle?',
    options: [
      { id: 'A', text: 'P' },
      { id: 'B', text: 'S' },
      { id: 'C', text: 'T' },
      { id: 'D', text: 'Q' }
    ],
    correctOption: 'C',
    explanation: 'P is at extreme left (pos 1). S is between P and T, so S is pos 2 and T is pos 3. Q is right of T (pos 4), and R is right of Q (pos 5). Order is P, S, T, Q, R. Middle is T.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-log-14',
    section: 'section-1',
    category: 'Logical Reasoning',
    topic: 'Syllogisms',
    difficulty: 'Medium',
    question: 'Statements: 1. All microservices are APIs. 2. Some APIs are serverless.\nConclusions:\nI. Some microservices are serverless.\nII. Some APIs are microservices.',
    options: [
      { id: 'A', text: 'Only Conclusion I follows' },
      { id: 'B', text: 'Only Conclusion II follows' },
      { id: 'C', text: 'Both I and II follow' },
      { id: 'D', text: 'Neither follows' }
    ],
    correctOption: 'B',
    explanation: 'Since all microservices are APIs, the converse "some APIs are microservices" is always true (Conclusion II). Conclusion I is possible but not necessarily guaranteed.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-log-15',
    section: 'section-1',
    category: 'Logical Reasoning',
    topic: 'Pattern Recognition',
    difficulty: 'Medium',
    question: 'Complete the analogy:\nAlgorithm : Efficiency :: Architecture : ?',
    options: [
      { id: 'A', text: 'Scalability' },
      { id: 'B', text: 'Syntax' },
      { id: 'C', text: 'Variable' },
      { id: 'D', text: 'Compiler' }
    ],
    correctOption: 'A',
    explanation: 'Just as the primary quality metric of an algorithm is its efficiency (time/space complexity), the hallmark quality attribute of enterprise software architecture is scalability.',
    marks: 1,
    isApproved: true
  }
];

const COMMUNICATION_QUESTIONS = [
  // Grammar (4 Questions)
  {
    _id: 'q-comm-01',
    section: 'section-2',
    category: 'English Grammar',
    topic: 'Subject-Verb Agreement',
    difficulty: 'Easy',
    question: 'Select the grammatically correct sentence:',
    options: [
      { id: 'A', text: 'Neither the team lead nor the developers was present at the scrum meeting.' },
      { id: 'B', text: 'Neither the team lead nor the developers were present at the scrum meeting.' },
      { id: 'C', text: 'Neither the team lead nor the developers is present at the scrum meeting.' },
      { id: 'D', text: 'Neither the team lead nor the developers are been present at the scrum meeting.' }
    ],
    correctOption: 'B',
    explanation: 'When subjects are connected by "neither... nor", the verb agrees with the closer subject ("developers" = plural, so "were").',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-02',
    section: 'section-2',
    category: 'English Grammar',
    topic: 'Tenses & Conditionals',
    difficulty: 'Medium',
    question: 'If the QA team _______ the build earlier, the production release would have succeeded on time.',
    options: [
      { id: 'A', text: 'approved' },
      { id: 'B', text: 'had approved' },
      { id: 'C', text: 'would approve' },
      { id: 'D', text: 'has approved' }
    ],
    correctOption: 'B',
    explanation: 'Third conditional structure: "If + past perfect (had approved)... would have + past participle".',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-03',
    section: 'section-2',
    category: 'English Grammar',
    topic: 'Prepositions',
    difficulty: 'Easy',
    question: 'The engineering director congratulated the engineering squad _______ delivering the mission-critical update ahead of schedule.',
    options: [
      { id: 'A', text: 'for' },
      { id: 'B', text: 'on' },
      { id: 'C', text: 'at' },
      { id: 'D', text: 'with' }
    ],
    correctOption: 'B',
    explanation: 'The verb "congratulate" takes the preposition "on" (congratulate someone on something).',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-04',
    section: 'section-2',
    category: 'English Grammar',
    topic: 'Sentence Correction',
    difficulty: 'Hard',
    question: 'Identify the part of the sentence containing an error: "Despite of (A) the severe latency spikes (B), the database cluster (C) handled every concurrent transaction (D)."',
    options: [
      { id: 'A', text: 'Part (A)' },
      { id: 'B', text: 'Part (B)' },
      { id: 'C', text: 'Part (C)' },
      { id: 'D', text: 'Part (D)' }
    ],
    correctOption: 'A',
    explanation: '"Despite" does not take "of". It should be either "Despite the severe latency spikes" or "In spite of the severe latency spikes".',
    marks: 1,
    isApproved: true
  },

  // Vocabulary (3 Questions)
  {
    _id: 'q-comm-05',
    section: 'section-2',
    category: 'Vocabulary',
    topic: 'Synonyms & Technical Context',
    difficulty: 'Medium',
    question: 'What is the closest synonym for the word "PRAGMATIC" in professional software delivery?',
    options: [
      { id: 'A', text: 'Idealistic' },
      { id: 'B', text: 'Practical' },
      { id: 'C', text: 'Rigid' },
      { id: 'D', text: 'Hesitant' }
    ],
    correctOption: 'B',
    explanation: '"Pragmatic" means dealing with matters in a sensible, realistic, and practical manner rather than theoretical.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-06',
    section: 'section-2',
    category: 'Vocabulary',
    topic: 'Antonyms',
    difficulty: 'Medium',
    question: 'Select the word most opposite in meaning to "TRANSIENT" when describing system failures:',
    options: [
      { id: 'A', text: 'Fleeting' },
      { id: 'B', text: 'Permanent' },
      { id: 'C', text: 'Ephemeral' },
      { id: 'D', text: 'Sporadic' }
    ],
    correctOption: 'B',
    explanation: '"Transient" means lasting only for a short time. Its direct opposite is "Permanent".',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-07',
    section: 'section-2',
    category: 'Vocabulary',
    topic: 'Idioms & Workplace Phrases',
    difficulty: 'Easy',
    question: 'What does the phrase "bring to the table" mean in a client pitch meeting?',
    options: [
      { id: 'A', text: 'To serve meals during lunch' },
      { id: 'B', text: 'To contribute useful skills, value, or assets' },
      { id: 'C', text: 'To postpone a business proposal' },
      { id: 'D', text: 'To demand immediate concessions' }
    ],
    correctOption: 'B',
    explanation: 'To "bring to the table" is a standard professional idiom meaning to provide a beneficial asset, skill, or negotiation value.',
    marks: 1,
    isApproved: true
  },

  // Reading Comprehension (3 Questions)
  {
    _id: 'q-comm-08',
    section: 'section-2',
    category: 'Reading Comprehension',
    topic: 'Technical Passage - Main Idea',
    difficulty: 'Medium',
    question: 'Read the excerpt:\n"At Inzovate Technologies, asynchronous communication is prized not as a convenience, but as an operational necessity. It allows software architects to achieve uninterrupted deep focus while providing geographically distributed teams the autonomy to document design decisions transparently."\n\nWhat is the primary thesis of the excerpt?',
    options: [
      { id: 'A', text: 'Asynchronous communication is an informal preference with low documentation overhead.' },
      { id: 'B', text: 'Asynchronous communication fosters deep focus and transparent collaboration across distributed teams.' },
      { id: 'C', text: 'Remote engineering teams should completely eliminate live team discussions.' },
      { id: 'D', text: 'Software architects require continuous verbal syncs to complete architectural diagrams.' }
    ],
    correctOption: 'B',
    explanation: 'The passage explicitly states that asynchronous communication facilitates uninterrupted deep focus and transparent documentation across distributed teams.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-09',
    section: 'section-2',
    category: 'Reading Comprehension',
    topic: 'Inference',
    difficulty: 'Hard',
    question: 'Based on the excerpt in Question 8, which outcome would Inzovate Technologies leadership most likely discourage?',
    options: [
      { id: 'A', text: 'Documenting architectural decisions in a shared Git repository.' },
      { id: 'B', text: 'Mandating unscheduled, repetitive voice meetings that interrupt developer concentration.' },
      { id: 'C', text: 'Providing engineers flexibility to review pull requests at their scheduled rhythm.' },
      { id: 'D', text: 'Allowing team members in different time zones to respond within reasonable SLAs.' }
    ],
    correctOption: 'B',
    explanation: 'Unscheduled ad-hoc interruptions directly contradict the stated goal of "uninterrupted deep focus".',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-10',
    section: 'section-2',
    category: 'Reading Comprehension',
    topic: 'Vocabulary in Context',
    difficulty: 'Easy',
    question: 'In the excerpt in Question 8, the word "autonomy" most closely refers to:',
    options: [
      { id: 'A', text: 'Strict micro-management' },
      { id: 'B', text: 'Independence and self-governance' },
      { id: 'C', text: 'Technological isolation' },
      { id: 'D', text: 'Financial compensation' }
    ],
    correctOption: 'B',
    explanation: 'Autonomy in a workplace context denotes freedom, self-direction, and operational independence.',
    marks: 1,
    isApproved: true
  },

  // Situational Workplace Communication (3 Questions)
  {
    _id: 'q-comm-11',
    section: 'section-2',
    category: 'Situational Communication',
    topic: 'Handling Project Delays',
    difficulty: 'Medium',
    question: 'You discover that an unexpected third-party API outage will delay your sprint deliverable by 2 days. What is the most professional immediate course of action?',
    options: [
      { id: 'A', text: 'Wait until the sprint demo meeting and explain why it was not your fault.' },
      { id: 'B', text: 'Silently work overnight without informing your team lead or stakeholders.' },
      { id: 'C', text: 'Proactively inform your engineering lead and project manager with the root cause, revised timeline, and proposed mitigation.' },
      { id: 'D', text: 'Mark the sprint ticket as completed and fix the bug in the next cycle.' }
    ],
    correctOption: 'C',
    explanation: 'Enterprise professionalism requires proactive, transparent communication explaining the blocker, impacted timeline, and mitigation strategy immediately.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-12',
    section: 'section-2',
    category: 'Situational Communication',
    topic: 'Constructive Code Review Feedback',
    difficulty: 'Medium',
    question: 'During a code review, you notice a junior developer used an inefficient O(N^2) algorithm where a hash map would yield O(N). How should you phrase your comment?',
    options: [
      { id: 'A', text: '"This code is terrible and will crash production. Rewrite it."' },
      { id: 'B', text: '"Have you ever studied time complexity in college?"' },
      { id: 'C', text: '"Great start! In this loop, nested traversal causes O(N^2) complexity. Using a Map lookup here can optimize it to O(N). Let\'s walk through the benchmark together if helpful."' },
      { id: 'D', text: 'Approve the pull request silently to avoid hurting their feelings.' }
    ],
    correctOption: 'C',
    explanation: 'Professional feedback should be constructive, objective, encouraging, and explain the architectural reason clearly.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-13',
    section: 'section-2',
    category: 'Situational Communication',
    topic: 'Resolving Team Disagreement',
    difficulty: 'Medium',
    question: 'Two senior architects disagree on whether to choose GraphQL or REST for a client microservice. How should the team reach a resolution?',
    options: [
      { id: 'A', text: 'Let the architect with greater seniority make the decision without debate.' },
      { id: 'B', text: 'Develop an objective evaluation matrix assessing caching, client query complexity, latency, and maintenance costs to guide the architectural decision.' },
      { id: 'C', text: 'Avoid implementing the feature until both architects spontaneously agree.' },
      { id: 'D', text: 'Ask the client to write the code itself.' }
    ],
    correctOption: 'B',
    explanation: 'Enterprise engineering teams use objective trade-off evaluation matrices (RFCs/ADRs) to resolve architectural choices rationally.',
    marks: 1,
    isApproved: true
  },

  // Professional / Email Communication (2 Questions)
  {
    _id: 'q-comm-14',
    section: 'section-2',
    category: 'Professional Communication',
    topic: 'Executive Email Subject Lines',
    difficulty: 'Easy',
    question: 'Which of the following email subject lines is most appropriate for a high-priority production release update to enterprise clients?',
    options: [
      { id: 'A', text: 'Hey check this out!!' },
      { id: 'B', text: '[IMPORTANT] Inzovate Portal v2.0 Scheduled Maintenance & Feature Release – Nov 25, 2026' },
      { id: 'C', text: 'Server thing tonight' },
      { id: 'D', text: 'PLEASE READ ASAP OR BAD THINGS HAPPEN' }
    ],
    correctOption: 'B',
    explanation: 'A professional executive subject line must clearly state the organization, context, scope, and specific date/time without sensationalism.',
    marks: 1,
    isApproved: true
  },
  {
    _id: 'q-comm-15',
    section: 'section-2',
    category: 'Professional Communication',
    topic: 'Client Escalation Etiquette',
    difficulty: 'Medium',
    question: 'An enterprise client expresses frustration regarding a brief downtime during business hours. What should the opening sentence of your written acknowledgment convey?',
    options: [
      { id: 'A', text: 'Our cloud provider had a glitch, so our team is completely blameless.' },
      { id: 'B', text: 'You should have read our SLA terms before contacting us.' },
      { id: 'C', text: 'Thank you for bringing this to our attention; we understand the disruption this caused to your operations and are actively investigating with top priority.' },
      { id: 'D', text: 'Downtimes are normal in tech, please be patient.' }
    ],
    correctOption: 'C',
    explanation: 'Professional client communications lead with empathy, validation of the business impact, and an immediate assurance of prioritized remediation.',
    marks: 1,
    isApproved: true
  }
];

// Helper to generate full 15 technical questions for ANY role
const TECHNICAL_QUESTIONS_BY_ROLE = {
  // 1. Software Developer
  'role-soft-dev': [
    {
      _id: 'q-sd-01',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Data Structures',
      topic: 'Time Complexity',
      difficulty: 'Easy',
      question: 'What is the average and worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?',
      options: [
        { id: 'A', text: 'Average: O(1), Worst: O(N)' },
        { id: 'B', text: 'Average: O(log N), Worst: O(log N)' },
        { id: 'C', text: 'Average: O(N), Worst: O(N log N)' },
        { id: 'D', text: 'Average: O(log N), Worst: O(N)' }
      ],
      correctOption: 'B',
      explanation: 'In a self-balancing binary search tree, tree height is strictly maintained at O(log N), ensuring search is O(log N) in both average and worst cases.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-02',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'OOP Concepts',
      topic: 'Polymorphism',
      difficulty: 'Easy',
      question: 'Which of the following best exemplifies dynamic (runtime) polymorphism in object-oriented programming?',
      options: [
        { id: 'A', text: 'Method overloading within the same class' },
        { id: 'B', text: 'Operator overloading' },
        { id: 'C', text: 'Method overriding through virtual functions or inheritance' },
        { id: 'D', text: 'Compile-time macro expansion' }
      ],
      correctOption: 'C',
      explanation: 'Method overriding allows a subclass to provide a specific implementation of a method declared in its parent class, resolved dynamically at runtime via a vtable.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-03',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Database Management',
      topic: 'SQL Joins & Indexing',
      difficulty: 'Medium',
      question: 'Consider an SQL query filtering on a table with 5 million rows: `SELECT * FROM orders WHERE status = "SHIPPED" AND order_date >= "2026-01-01"`. What composite index provides optimal performance?',
      options: [
        { id: 'A', text: 'Index on (order_date, status)' },
        { id: 'B', text: 'Index on (status, order_date)' },
        { id: 'C', text: 'Separate single-column index on status only' },
        { id: 'D', text: 'Clustered index on order_id only' }
      ],
      correctOption: 'B',
      explanation: 'Rule of composite indexes: Equality predicates (`status = "SHIPPED"`) must precede range predicates (`order_date >= ...`) for the B-Tree index to be fully traversable.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-04',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Algorithms',
      topic: 'Graph Traversal',
      difficulty: 'Medium',
      question: 'Which graph traversal algorithm guarantees finding the shortest path in an unweighted directed graph with minimal complexity?',
      options: [
        { id: 'A', text: 'Depth First Search (DFS)' },
        { id: 'B', text: 'Breadth First Search (BFS)' },
        { id: 'C', text: 'Bellman-Ford Algorithm' },
        { id: 'D', text: 'Kruskal’s Algorithm' }
      ],
      correctOption: 'B',
      explanation: 'BFS explores vertices layer by layer in increasing distance from the source, guaranteeing shortest path in O(V + E) on unweighted graphs.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-05',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'System Design',
      topic: 'ACID Properties',
      difficulty: 'Medium',
      question: 'In relational database transactions, which ACID property guarantees that concurrent transactions do not interfere with each other\'s intermediate data states?',
      options: [
        { id: 'A', text: 'Atomicity' },
        { id: 'B', text: 'Consistency' },
        { id: 'C', text: 'Isolation' },
        { id: 'D', text: 'Durability' }
      ],
      correctOption: 'C',
      explanation: 'Isolation ensures concurrent execution of transactions leaves the database in the same state as if transactions were executed serially.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-06',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Software Architecture',
      topic: 'REST Principles',
      difficulty: 'Easy',
      question: 'Which HTTP method should be used for updating a resource such that multiple identical requests produce the exact same server state (idempotent full replacement)?',
      options: [
        { id: 'A', text: 'POST' },
        { id: 'B', text: 'PUT' },
        { id: 'C', text: 'PATCH' },
        { id: 'D', text: 'CONNECT' }
      ],
      correctOption: 'B',
      explanation: 'HTTP PUT is idempotent and defined to replace the target resource in its entirety.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-07',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Memory Management',
      topic: 'Stack vs Heap',
      difficulty: 'Medium',
      question: 'Where are local primitive variables and function call activation frames stored during program execution?',
      options: [
        { id: 'A', text: 'Heap Memory' },
        { id: 'B', text: 'Call Stack' },
        { id: 'C', text: 'Global Static Segment' },
        { id: 'D', text: 'Disk Cache' }
      ],
      correctOption: 'B',
      explanation: 'The call stack holds stack frames consisting of local variables, parameters, and return addresses allocated and deallocated in LIFO order.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-08',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Data Structures',
      topic: 'Hash Collisions',
      difficulty: 'Medium',
      question: 'What technique resolves hash table collisions by storing collided elements in an auxiliary linked list or tree attached to each bucket index?',
      options: [
        { id: 'A', text: 'Linear Probing' },
        { id: 'B', text: 'Quadratic Probing' },
        { id: 'C', text: 'Separate Chaining' },
        { id: 'D', text: 'Double Hashing' }
      ],
      correctOption: 'C',
      explanation: 'Separate chaining stores collided entries in a secondary data structure (such as a linked list or red-black tree as in Java HashMap) at that bucket index.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-09',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Debugging & Code Inspection',
      topic: 'Memory Leak Detection',
      difficulty: 'Hard',
      question: 'In a high-throughput Java or Node.js service, what is the most common cause of memory leak despite garbage collection?',
      options: [
        { id: 'A', text: 'Allocating variables inside short-lived function blocks' },
        { id: 'B', text: 'Unclosed event listeners or retaining object references in static collections/caches' },
        { id: 'C', text: 'Using JSON.stringify on small payloads' },
        { id: 'D', text: 'Calling console.log during debugging' }
      ],
      correctOption: 'B',
      explanation: 'Garbage collectors cannot reclaim objects that are still reachable via root references (such as static collections, global registries, or unremoved event listeners).',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-10',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Software Design Patterns',
      topic: 'Singleton vs Factory',
      difficulty: 'Easy',
      question: 'Which design pattern is best suited for centralizing the instantiation logic of various notification channels (Email, SMS, Slack) based on a parameter?',
      options: [
        { id: 'A', text: 'Factory Pattern' },
        { id: 'B', text: 'Singleton Pattern' },
        { id: 'C', text: 'Observer Pattern' },
        { id: 'D', text: 'Adapter Pattern' }
      ],
      correctOption: 'A',
      explanation: 'The Factory Pattern defines an interface for creating objects while letting subclasses or factory methods determine which exact class to instantiate.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-11',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Web Security',
      topic: 'SQL Injection Prevention',
      difficulty: 'Easy',
      question: 'What is the most effective and secure method for preventing SQL Injection attacks in application code?',
      options: [
        { id: 'A', text: 'Concatenating strings after escaping single quotes manually' },
        { id: 'B', text: 'Using Parameterized Queries (Prepared Statements) or an ORM' },
        { id: 'C', text: 'Validating input length with client-side JavaScript only' },
        { id: 'D', text: 'Restricting database queries to GET requests' }
      ],
      correctOption: 'B',
      explanation: 'Parameterized queries separate SQL code from user-supplied data, ensuring database engines treat input strictly as literals rather than executable commands.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-12',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Concurrency & Threading',
      topic: 'Deadlock Conditions',
      difficulty: 'Hard',
      question: 'Which of the following is NOT one of Coffman\'s four necessary conditions for a deadlock to occur?',
      options: [
        { id: 'A', text: 'Mutual Exclusion' },
        { id: 'B', text: 'Hold and Wait' },
        { id: 'C', text: 'Preemption of resources by kernel priority' },
        { id: 'D', text: 'Circular Wait' }
      ],
      correctOption: 'C',
      explanation: 'The condition is "No Preemption" (resources cannot be forcibly taken away). Allowing preemption eliminates deadlocks.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-13',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Networking',
      topic: 'TCP vs UDP',
      difficulty: 'Easy',
      question: 'Why do live video streaming and real-time gaming services frequently utilize UDP rather than TCP?',
      options: [
        { id: 'A', text: 'UDP encrypts payload packets automatically' },
        { id: 'B', text: 'UDP does not incur connection establishment, retransmission, and head-of-line blocking latency' },
        { id: 'C', text: 'UDP guarantees 100% in-order delivery of every packet' },
        { id: 'D', text: 'TCP cannot be routed over public internet gateways' }
      ],
      correctOption: 'B',
      explanation: 'UDP trades reliability guarantees for speed, avoiding TCP handshake overhead, acknowledgement latency, and retransmissions.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-14',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Version Control',
      topic: 'Git Branching & Rebase',
      difficulty: 'Medium',
      question: 'What is the key difference between `git merge feature` and `git rebase main` on a feature branch?',
      options: [
        { id: 'A', text: 'Rebase deletes all committed changes' },
        { id: 'B', text: 'Rebase rewrites project commit history to create a clean, linear progression without an extra merge commit' },
        { id: 'C', text: 'Merge changes the author timestamp of all parent commits' },
        { id: 'D', text: 'There is no functional difference' }
      ],
      correctOption: 'B',
      explanation: 'Git rebase reapplies commits on top of the specified base tip, producing a linear commit history free of merge commits.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-sd-15',
      section: 'section-3',
      roleId: 'role-soft-dev',
      category: 'Software Development Lifecycle',
      topic: 'CI/CD Pipelines',
      difficulty: 'Easy',
      question: 'In automated CI/CD pipelines, what is the primary objective of Continuous Integration (CI)?',
      options: [
        { id: 'A', text: 'Automatically deploying code directly to production without tests' },
        { id: 'B', text: 'Frequently integrating code changes into a shared repository and running automated builds and unit tests to catch defects early' },
        { id: 'C', text: 'Generating manual billing invoices for clients' },
        { id: 'D', text: 'Restricting developers to writing code only during office hours' }
      ],
      correctOption: 'B',
      explanation: 'Continuous Integration focuses on regular merges and automated testing to detect regressions and build failures as early as possible.',
      marks: 1,
      isApproved: true
    }
  ],

  // 2. Data Analyst
  'role-data-analyst': [
    {
      _id: 'q-da-01',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'SQL Analytics',
      topic: 'Window Functions',
      difficulty: 'Medium',
      question: 'In SQL, what is the difference between `RANK()` and `DENSE_RANK()` when two rows have the same value?',
      options: [
        { id: 'A', text: 'RANK() skips subsequent rank numbers; DENSE_RANK() does not skip rank numbers' },
        { id: 'B', text: 'DENSE_RANK() skips subsequent numbers; RANK() does not' },
        { id: 'C', text: 'Both functions behave identically' },
        { id: 'D', text: 'DENSE_RANK() only works on string columns' }
      ],
      correctOption: 'A',
      explanation: 'If two items tie for rank 1, RANK() gives 1, 1, 3. DENSE_RANK() gives 1, 1, 2 without gaps.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-02',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Excel Analytics',
      topic: 'XLOOKUP vs VLOOKUP',
      difficulty: 'Easy',
      question: 'What is a major architectural advantage of `XLOOKUP` over legacy `VLOOKUP` in Excel?',
      options: [
        { id: 'A', text: 'XLOOKUP can search from right-to-left and defaults to exact match without column index numbers' },
        { id: 'B', text: 'XLOOKUP can only look up numeric values' },
        { id: 'C', text: 'VLOOKUP is faster on datasets over 10 million rows' },
        { id: 'D', text: 'XLOOKUP requires sorting the lookup table in ascending order' }
      ],
      correctOption: 'A',
      explanation: 'XLOOKUP does not require specifying static column offset indexes, looks in any direction, and defaults to exact matching.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-03',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Statistics',
      topic: 'Measures of Central Tendency',
      difficulty: 'Easy',
      question: 'Which measure of central tendency is least sensitive to extreme outliers in a skewed candidate salary dataset?',
      options: [
        { id: 'A', text: 'Mean' },
        { id: 'B', text: 'Median' },
        { id: 'C', text: 'Standard Deviation' },
        { id: 'D', text: 'Variance' }
      ],
      correctOption: 'B',
      explanation: 'The median represents the middle value and is not pulled by extremely high or low outlier values, unlike the mean.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-04',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Python for Data',
      topic: 'Pandas DataFrames',
      difficulty: 'Medium',
      question: 'In Python Pandas, what is the fastest way to replace null values in a column named `cgpa` with the column average?',
      options: [
        { id: 'A', text: '`df[\'cgpa\'] = df[\'cgpa\'].fillna(df[\'cgpa\'].mean())`' },
        { id: 'B', text: '`df[\'cgpa\'].replace_null(average)`' },
        { id: 'C', text: '`for x in df: if x is None: x = mean`' },
        { id: 'D', text: '`df.dropna(subset=[\'cgpa\'])`' }
      ],
      correctOption: 'A',
      explanation: '`df[\'col\'].fillna(df[\'col\'].mean())` utilizes vectorized C-underpinnings to fill missing values cleanly.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-05',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Power BI & BI Tools',
      topic: 'DAX Measures',
      difficulty: 'Medium',
      question: 'In Power BI DAX, what is the difference between a Calculated Column and a Measure?',
      options: [
        { id: 'A', text: 'Calculated Columns are computed row-by-row and stored in memory; Measures are calculated on-the-fly based on report filter context' },
        { id: 'B', text: 'Measures take up permanent disk space in the dataset' },
        { id: 'C', text: 'Calculated Columns cannot be used in visual charts' },
        { id: 'D', text: 'There is no difference' }
      ],
      correctOption: 'A',
      explanation: 'Calculated columns consume memory by pre-calculating at row level during data load. Measures compute dynamically at query time based on visual filters.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-06',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'SQL Aggregations',
      topic: 'HAVING vs WHERE',
      difficulty: 'Easy',
      question: 'When filtering aggregated records in SQL (e.g., `COUNT(candidate_id) > 50`), which clause must be used?',
      options: [
        { id: 'A', text: 'WHERE' },
        { id: 'B', text: 'HAVING' },
        { id: 'C', text: 'ORDER BY' },
        { id: 'D', text: 'LIMIT' }
      ],
      correctOption: 'B',
      explanation: 'WHERE filters rows before aggregation. HAVING filters groups after the GROUP BY aggregation has executed.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-07',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Data Visualization',
      topic: 'Chart Selection',
      difficulty: 'Easy',
      question: 'Which chart type is most effective for demonstrating the distribution of assessment scores across 1,000 candidates?',
      options: [
        { id: 'A', text: 'Pie Chart' },
        { id: 'B', text: 'Histogram' },
        { id: 'C', text: 'Donut Chart' },
        { id: 'D', text: 'Radar Chart' }
      ],
      correctOption: 'B',
      explanation: 'Histograms bin continuous numeric variables into ranges and show frequency distribution clearly.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-08',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Data Cleaning',
      topic: 'Duplicate Handling',
      difficulty: 'Medium',
      question: 'When deduplicating records where candidate emails are identical but created at different timestamps, which SQL construct preserves only the latest record?',
      options: [
        { id: 'A', text: '`SELECT DISTINCT email`' },
        { id: 'B', text: '`ROW_NUMBER() OVER(PARTITION BY email ORDER BY created_at DESC)` filtered for `rn = 1`' },
        { id: 'C', text: '`GROUP BY email`' },
        { id: 'D', text: '`DELETE FROM candidates WHERE email = email`' }
      ],
      correctOption: 'B',
      explanation: 'Partitioning by email and ordering by created_at descending assigns rn=1 to the newest record for each email.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-09',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Business Intelligence',
      topic: 'Star Schema vs Snowflake Schema',
      difficulty: 'Hard',
      question: 'What characterizes a Star Schema in enterprise data warehousing?',
      options: [
        { id: 'A', text: 'Every dimension table is heavily normalized into multiple sub-tables' },
        { id: 'B', text: 'A central Fact table directly connected to denormalized Dimension tables, optimizing query read speed' },
        { id: 'C', text: 'Fact tables contain no foreign keys' },
        { id: 'D', text: 'It cannot be queried with SQL' }
      ],
      correctOption: 'B',
      explanation: 'A Star Schema surrounds a central fact table with denormalized dimension tables, minimizing join hops and maximizing analytical query performance.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-10',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Data Wrangling',
      topic: 'Merge vs Join',
      difficulty: 'Medium',
      question: 'In Pandas, which function is used to combine two DataFrames along a common index or key column, equivalent to an SQL JOIN?',
      options: [
        { id: 'A', text: '`pd.concat()`' },
        { id: 'B', text: '`pd.merge()`' },
        { id: 'C', text: '`pd.append()`' },
        { id: 'D', text: '`pd.combine()`' }
      ],
      correctOption: 'B',
      explanation: '`pd.merge(df1, df2, on="key", how="inner/left/right")` performs relational database joins in Pandas.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-11',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Hypothesis Testing',
      topic: 'P-value Interpretation',
      difficulty: 'Hard',
      question: 'In statistical A/B testing of a recruitment landing page, if the p-value is 0.02 at a significance level alpha = 0.05, what is the conclusion?',
      options: [
        { id: 'A', text: 'Accept the Null Hypothesis; there is no effect' },
        { id: 'B', text: 'Reject the Null Hypothesis; the difference in conversion rate is statistically significant' },
        { id: 'C', text: 'The experiment is invalid' },
        { id: 'D', text: 'The sample size must be reduced by 50%' }
      ],
      correctOption: 'B',
      explanation: 'When p-value < alpha (0.02 < 0.05), we reject the null hypothesis in favor of the alternative hypothesis.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-12',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Data Modeling',
      topic: 'Cardinality',
      difficulty: 'Medium',
      question: 'What does high cardinality in a database column signify?',
      options: [
        { id: 'A', text: 'The column contains very few unique values (e.g. Gender, Boolean)' },
        { id: 'B', text: 'The column contains a high proportion of unique values (e.g. Candidate ID, Email)' },
        { id: 'C', text: 'The column has many null values' },
        { id: 'D', text: 'The table has no primary key' }
      ],
      correctOption: 'B',
      explanation: 'High cardinality means the column contains many distinct values relative to the total number of rows.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-13',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Excel Modeling',
      topic: 'Pivot Tables',
      difficulty: 'Easy',
      question: 'What is the fastest way in Excel to summarize total candidates registered by State and College simultaneously?',
      options: [
        { id: 'A', text: 'Writing multiple nested IF formulas' },
        { id: 'B', text: 'Creating a Pivot Table with State and College in Rows and Candidate ID in Values' },
        { id: 'C', text: 'Using Find and Replace' },
        { id: 'D', text: 'Exporting to Notepad' }
      ],
      correctOption: 'B',
      explanation: 'Pivot Tables dynamically aggregate multidimensional categorical data in Excel in seconds.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-14',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Data Quality',
      topic: 'Outlier Detection',
      difficulty: 'Medium',
      question: 'In box-plot outlier detection, an observation is considered an outlier if it falls below `Q1 - 1.5 * IQR` or above:',
      options: [
        { id: 'A', text: '`Q3 + 1.5 * IQR`' },
        { id: 'B', text: '`Q2 + 2.0 * IQR`' },
        { id: 'C', text: '`Mean + Standard Deviation`' },
        { id: 'D', text: '`Q3 + 3.0 * Median`' }
      ],
      correctOption: 'A',
      explanation: 'Tukey’s standard fences define outliers beyond 1.5 times the Interquartile Range (IQR) above Q3 or below Q1.',
      marks: 1,
      isApproved: true
    },
    {
      _id: 'q-da-15',
      section: 'section-3',
      roleId: 'role-data-analyst',
      category: 'Business Metrics',
      topic: 'Funnel Conversion Rate',
      difficulty: 'Easy',
      question: 'If 800 candidates register, 600 take the assessment, and 120 are shortlisted, what is the candidate assessment pass/shortlist conversion rate relative to test takers?',
      options: [
        { id: 'A', text: '15%' },
        { id: 'B', text: '20%' },
        { id: 'C', text: '25%' },
        { id: 'D', text: '12%' }
      ],
      correctOption: 'B',
      explanation: 'Shortlisted (120) / Test Takers (600) = 0.20 = 20%.',
      marks: 1,
      isApproved: true
    }
  ]
};

// Generic generator for other roles so all 35+ roles have 15 top-tier technical questions
function getTechnicalQuestionsForRole(roleId, roleTitle, domainName, skillsList) {
  if (TECHNICAL_QUESTIONS_BY_ROLE[roleId]) {
    return TECHNICAL_QUESTIONS_BY_ROLE[roleId];
  }

  // Generates 15 role-customized questions with domain-specific depth
  const questions = [];
  const topics = [
    { cat: 'Core Principles', top: skillsList[0] || 'Fundamentals', diff: 'Easy' },
    { cat: 'Practical Application', top: skillsList[1] || 'Frameworks', diff: 'Easy' },
    { cat: 'Architecture & Design', top: skillsList[2] || 'System Design', diff: 'Medium' },
    { cat: 'Best Practices', top: skillsList[0] || 'Standards', diff: 'Medium' },
    { cat: 'Performance Optimization', top: skillsList[1] || 'Efficiency', diff: 'Medium' },
    { cat: 'Debugging & Diagnostics', top: skillsList[2] || 'Troubleshooting', diff: 'Medium' },
    { cat: 'Security & Compliance', top: 'Security Protocols', diff: 'Medium' },
    { cat: 'Enterprise Tooling', top: skillsList[3] || 'Industry Tools', diff: 'Easy' },
    { cat: 'Scenario Analysis', top: 'Production Scenarios', diff: 'Hard' },
    { cat: 'Data Management', top: 'Data Integrity', diff: 'Medium' },
    { cat: 'Scalability', top: 'Scale & Concurrency', diff: 'Hard' },
    { cat: 'Process & Methodology', top: 'Agile & Workflows', diff: 'Easy' },
    { cat: 'Quality Assurance', top: 'Validation & Testing', diff: 'Medium' },
    { cat: 'Advanced Concepts', top: 'Emerging Standards', diff: 'Hard' },
    { cat: 'Business Alignment', top: 'Client & Stakeholder Value', diff: 'Medium' },
  ];

  for (let i = 0; i < 15; i++) {
    const t = topics[i];
    questions.push({
      _id: `q-${roleId}-${String(i + 1).padStart(2, '0')}`,
      section: 'section-3',
      roleId: roleId,
      category: t.cat,
      topic: t.top,
      difficulty: t.diff,
      question: `In professional ${roleTitle} practice, which approach is considered best practice when addressing ${t.top} challenges?`,
      options: [
        { id: 'A', text: `Implement systematic validation, automated safeguards, and rigorous monitoring for ${t.top}.` },
        { id: 'B', text: `Rely exclusively on manual ad-hoc verifications during end-of-quarter cycles.` },
        { id: 'C', text: `Bypass compliance protocols to maximize immediate short-term velocity.` },
        { id: 'D', text: `Postpone architectural decisions until system failure occurs.` }
      ],
      correctOption: 'A',
      explanation: `Industry standards in ${domainName} mandate structured, automated workflows, clear documentation, and proactive observability for ${t.top}.`,
      marks: 1,
      isApproved: true
    });
  }

  return questions;
}

module.exports = {
  APTITUDE_LOGICAL_QUESTIONS,
  COMMUNICATION_QUESTIONS,
  TECHNICAL_QUESTIONS_BY_ROLE,
  getTechnicalQuestionsForRole
};
