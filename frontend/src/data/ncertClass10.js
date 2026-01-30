// NCERT Class 10 CBSE Curriculum Data
// Real subject modules with chapter structure

export const NCERT_CLASS_10 = {
  subjects: [
    {
      id: "mathematics",
      name: "Mathematics",
      color: "#3B82F6",
      icon: "calculator",
      modules: [
        {
          id: "math_m1",
          name: "Real Numbers & Polynomials",
          intent: "Build foundational understanding of number systems and algebraic expressions",
          chapters: [
            { id: "ch1", title: "Real Numbers", topics: ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic", "HCF and LCM"] },
            { id: "ch2", title: "Polynomials", topics: ["Zeroes of Polynomial", "Relationship between Zeroes and Coefficients", "Division Algorithm"] }
          ],
          estimatedWeeks: 3,
          difficulty: "foundational"
        },
        {
          id: "math_m2",
          name: "Linear Equations & Algebra",
          intent: "Develop problem-solving skills using equations and algebraic methods",
          chapters: [
            { id: "ch3", title: "Pair of Linear Equations in Two Variables", topics: ["Graphical Method", "Substitution Method", "Elimination Method", "Cross-Multiplication"] },
            { id: "ch4", title: "Quadratic Equations", topics: ["Factorization", "Completing the Square", "Quadratic Formula", "Nature of Roots"] }
          ],
          estimatedWeeks: 4,
          difficulty: "intermediate"
        },
        {
          id: "math_m3",
          name: "Geometry & Trigonometry",
          intent: "Master spatial reasoning and trigonometric applications",
          chapters: [
            { id: "ch6", title: "Triangles", topics: ["Similarity", "Pythagoras Theorem", "Areas of Similar Triangles"] },
            { id: "ch8", title: "Introduction to Trigonometry", topics: ["Trigonometric Ratios", "Trigonometric Identities", "Heights and Distances"] }
          ],
          estimatedWeeks: 5,
          difficulty: "intermediate"
        }
      ]
    },
    {
      id: "science",
      name: "Science",
      color: "#10B981",
      icon: "flask-conical",
      modules: [
        {
          id: "sci_m1",
          name: "Chemical Reactions & Equations",
          intent: "Understand the fundamental nature of chemical changes",
          chapters: [
            { id: "ch1", title: "Chemical Reactions and Equations", topics: ["Types of Reactions", "Oxidation-Reduction", "Balancing Equations"] },
            { id: "ch2", title: "Acids, Bases and Salts", topics: ["pH Scale", "Neutralization", "Common Salts"] }
          ],
          estimatedWeeks: 3,
          difficulty: "foundational"
        },
        {
          id: "sci_m2",
          name: "Life Processes & Biology",
          intent: "Explore the mechanisms that sustain life",
          chapters: [
            { id: "ch6", title: "Life Processes", topics: ["Nutrition", "Respiration", "Transportation", "Excretion"] },
            { id: "ch8", title: "How do Organisms Reproduce?", topics: ["Asexual Reproduction", "Sexual Reproduction", "Human Reproductive System"] }
          ],
          estimatedWeeks: 4,
          difficulty: "intermediate"
        },
        {
          id: "sci_m3",
          name: "Electricity & Magnetism",
          intent: "Master the principles of electric circuits and magnetic effects",
          chapters: [
            { id: "ch12", title: "Electricity", topics: ["Ohm's Law", "Series and Parallel Circuits", "Electric Power"] },
            { id: "ch13", title: "Magnetic Effects of Electric Current", topics: ["Magnetic Field", "Electromagnetic Induction", "Electric Motor"] }
          ],
          estimatedWeeks: 4,
          difficulty: "advanced"
        }
      ]
    },
    {
      id: "social_science",
      name: "Social Science",
      color: "#F59E0B",
      icon: "globe",
      modules: [
        {
          id: "soc_m1",
          name: "History: Nationalism",
          intent: "Understand the rise of nationalism and its impact on world events",
          chapters: [
            { id: "ch1", title: "The Rise of Nationalism in Europe", topics: ["French Revolution", "Nation-States", "Unification Movements"] },
            { id: "ch3", title: "Nationalism in India", topics: ["Civil Disobedience", "Non-Cooperation Movement", "Quit India"] }
          ],
          estimatedWeeks: 3,
          difficulty: "foundational"
        },
        {
          id: "soc_m2",
          name: "Geography: Resources",
          intent: "Analyze resource distribution and sustainable development",
          chapters: [
            { id: "ch1", title: "Resources and Development", topics: ["Resource Planning", "Land Resources", "Soil Conservation"] },
            { id: "ch3", title: "Water Resources", topics: ["Water Scarcity", "Multi-purpose Projects", "Rainwater Harvesting"] }
          ],
          estimatedWeeks: 3,
          difficulty: "intermediate"
        }
      ]
    }
  ]
};

// Task templates based on latent dimensions
export const TASK_TEMPLATES = {
  exploration: {
    high: [
      "Research 3 real-world applications of {topic} and create a comparison chart",
      "Find connections between {topic} and another subject you're interested in",
      "Explore a historical perspective: How did {topic} evolve over time?"
    ],
    medium: [
      "Watch a documentary or video on {topic} and summarize key insights",
      "Create a mind map linking {topic} to related concepts"
    ],
    low: [
      "Review the chapter summary and list 3 key points",
      "Practice standard exercises from the textbook"
    ]
  },
  depth: {
    high: [
      "Write a detailed explanation of {topic} as if teaching someone younger",
      "Derive or prove the underlying principles of {topic}",
      "Analyze edge cases or exceptions in {topic}"
    ],
    medium: [
      "Explain {topic} using analogies or real-life examples",
      "Create a flowchart showing the logical structure of {topic}"
    ],
    low: [
      "Memorize key formulas or definitions for {topic}",
      "Complete practice problems with step-by-step solutions"
    ]
  },
  application: {
    high: [
      "Design a project or experiment using {topic}",
      "Solve an open-ended problem that requires applying {topic}",
      "Build something tangible that demonstrates {topic}"
    ],
    medium: [
      "Work through case studies involving {topic}",
      "Apply {topic} to solve textbook word problems"
    ],
    low: [
      "Practice numerical problems on {topic}",
      "Complete fill-in-the-blank exercises"
    ]
  },
  reflection: {
    high: [
      "Write a learning journal: What confused you about {topic}? What clicked?",
      "Identify your misconceptions before and after studying {topic}",
      "Rate your understanding of {topic} and explain why"
    ],
    medium: [
      "List 3 questions you still have about {topic}",
      "Share what you learned about {topic} with a peer"
    ],
    low: [
      "Review your notes on {topic}",
      "Check which practice problems you got wrong and redo them"
    ]
  }
};
