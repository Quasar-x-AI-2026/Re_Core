// Academic neutral, human universal diagnostic
// Each question softly influences multiple latent variables

export const QUESTION_BANK = [
  {
    id: "Q1",
    text: "When learning something new, what gives you the most satisfaction?",
    options: [
      { label: "Understanding why it works", map: { depth: 2 } },
      { label: "Using it to solve real problems", map: { application: 2 } },
      { label: "Exploring related ideas", map: { exploration: 2 } },
      { label: "Finishing it efficiently", map: { execution: 2 } }
    ]
  },
  {
    id: "Q2",
    text: "If a topic feels confusing, your first instinct is to:",
    options: [
      { label: "Re-study fundamentals", map: { depth: 2 } },
      { label: "Ask someone or search guidance", map: { support: 2 } },
      { label: "Try a different angle", map: { exploration: 1.5 } },
      { label: "Move ahead and return later", map: { avoidance: 1.5 } }
    ]
  },
  {
    id: "Q3",
    text: "Which describes your study pattern best?",
    options: [
      { label: "Very regular and planned", map: { consistency: 2 } },
      { label: "Regular but flexible", map: { consistency: 1.2 } },
      { label: "Irregular but intense", map: { intensity: 1.2 } },
      { label: "Mostly deadline-driven", map: { execution: 1.5 } }
    ]
  },
  {
    id: "Q4",
    text: "What usually motivates you to keep learning?",
    options: [
      { label: "Curiosity", map: { intrinsic: 2 } },
      { label: "Future goals", map: { goalOrientation: 2 } },
      { label: "External expectations", map: { pressure: 1.5 } },
      { label: "Competition", map: { competitiveness: 1.5 } }
    ]
  },
  {
    id: "Q5",
    text: "When choosing subjects or topics, you prefer:",
    options: [
      { label: "One clear direction", map: { focus: 2 } },
      { label: "Few related options", map: { focus: 1 } },
      { label: "Many unrelated interests", map: { exploration: 2 } },
      { label: "Still unsure", map: { uncertainty: 2 } }
    ]
  },
  {
    id: "Q6",
    text: "How do you react to difficult challenges?",
    options: [
      { label: "Persist patiently", map: { resilience: 2 } },
      { label: "Seek help early", map: { support: 1.5 } },
      { label: "Experiment until it works", map: { exploration: 1.5 } },
      { label: "Feel stressed", map: { stress: 2 } }
    ]
  },
  {
    id: "Q7",
    text: "Your learning speed is usually:",
    options: [
      { label: "Slow but solid", map: { depth: 1.5 } },
      { label: "Moderate and steady", map: { consistency: 1.5 } },
      { label: "Fast when interested", map: { intensity: 1.5 } },
      { label: "Uneven", map: { instability: 1.5 } }
    ]
  },
  {
    id: "Q8",
    text: "How often do you reflect on what you learned?",
    options: [
      { label: "Very often", map: { reflection: 2 } },
      { label: "Sometimes", map: { reflection: 1 } },
      { label: "Rarely", map: { reflection: 0.5 } },
      { label: "Almost never", map: { reflection: 0 } }
    ]
  },
  {
    id: "Q9",
    text: "Which environment suits you best?",
    options: [
      { label: "Structured and guided", map: { structureNeed: 2 } },
      { label: "Semi-structured", map: { structureNeed: 1 } },
      { label: "Independent", map: { autonomy: 2 } },
      { label: "Flexible and open", map: { autonomy: 1.5 } }
    ]
  },
  {
    id: "Q10",
    text: "When given freedom, you usually:",
    options: [
      { label: "Design your own plan", map: { autonomy: 2 } },
      { label: "Follow examples", map: { structureNeed: 1.5 } },
      { label: "Explore alternatives", map: { exploration: 2 } },
      { label: "Delay decisions", map: { uncertainty: 1.5 } }
    ]
  },
  {
    id: "Q11",
    text: "How do you feel about long-term goals?",
    options: [
      { label: "Very clear", map: { goalOrientation: 2 } },
      { label: "Somewhat clear", map: { goalOrientation: 1 } },
      { label: "Changing often", map: { exploration: 1.5 } },
      { label: "Not sure yet", map: { uncertainty: 2 } }
    ]
  },
  {
    id: "Q12",
    text: "What matters more to you right now?",
    options: [
      { label: "Skill mastery", map: { depth: 1.5 } },
      { label: "Career alignment", map: { goalOrientation: 1.5 } },
      { label: "Exploration", map: { exploration: 2 } },
      { label: "Stability", map: { structureNeed: 1.5 } }
    ]
  },
  {
    id: "Q13",
    text: "When feedback is given, you:",
    options: [
      { label: "Analyze it carefully", map: { reflection: 1.5 } },
      { label: "Apply immediately", map: { execution: 1.5 } },
      { label: "Compare alternatives", map: { exploration: 1 } },
      { label: "Feel pressured", map: { stress: 1.5 } }
    ]
  },
  {
    id: "Q14",
    text: "Your natural learning style feels closer to:",
    options: [
      { label: "Conceptual", map: { depth: 2 } },
      { label: "Hands-on", map: { application: 2 } },
      { label: "Exploratory", map: { exploration: 2 } },
      { label: "Outcome-driven", map: { execution: 2 } }
    ]
  },
  {
    id: "Q15",
    text: "If nothing restricted you, you would prefer to:",
    options: [
      { label: "Master one domain deeply", map: { focus: 2 } },
      { label: "Blend multiple interests", map: { exploration: 2 } },
      { label: "Follow opportunities", map: { adaptability: 1.5 } },
      { label: "Keep options open", map: { uncertainty: 1.5 } }
    ]
  }
];
