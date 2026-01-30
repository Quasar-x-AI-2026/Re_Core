/**
 * Roadmap Builder: Generates personalized learning roadmaps from trajectory
 * 
 * PRINCIPLES:
 * - Roadmap is a PROJECTION, not a PRESCRIPTION
 * - Adaptive to trajectory changes
 * - Modular and non-linear
 * - Every module includes intent and reversibility markers
 * - Tasks adapt to latent dimensions (exploration, depth, application, reflection)
 */

import { TASK_TEMPLATES } from '../data/ncertClass10';

/**
 * Build personalized roadmap based on trajectory and curriculum
 * 
 * @param {Object} trajectory - Current trajectory state
 * @param {Object} features - Derived features
 * @param {Object} latentScores - Latent dimension scores
 * @param {Object} curriculum - Curriculum data (NCERT Class 10)
 * @returns {Array} Array of personalized learning modules
 */
export function buildRoadmap(trajectory, features, latentScores, curriculum) {
  if (!curriculum || !curriculum.subjects) {
    return null;
  }
  
  const roadmap = [];
  
  // Determine subject ordering based on trajectory
  const subjectOrder = determineSubjectOrder(trajectory, curriculum.subjects);
  
  // Build modules for each subject
  subjectOrder.forEach((subject, subjectIndex) => {
    subject.modules.forEach((module, moduleIndex) => {
      const personalizedModule = personalizeModule(
        module,
        subject,
        trajectory,
        features,
        latentScores,
        { subjectIndex, moduleIndex }
      );
      roadmap.push(personalizedModule);
    });
  });
  
  return roadmap;
}

/**
 * Determine optimal subject ordering based on trajectory
 * Not alphabetical - ordered by trajectory alignment
 */
function determineSubjectOrder(trajectory, subjects) {
  const { abstraction, structure, risk } = trajectory.directionVector;
  
  // Score each subject based on trajectory alignment
  const scoredSubjects = subjects.map(subject => {
    let alignmentScore = 0;
    
    // Mathematics aligns with high abstraction
    if (subject.id === 'mathematics') {
      alignmentScore = abstraction > 0 ? abstraction * 2 : 0;
    }
    
    // Science aligns with balanced abstraction/application
    if (subject.id === 'science') {
      alignmentScore = 10 - Math.abs(abstraction);
    }
    
    // Social Science aligns with lower abstraction (applied/contextual)
    if (subject.id === 'social_science') {
      alignmentScore = abstraction < 0 ? Math.abs(abstraction) * 2 : 0;
    }
    
    return { subject, alignmentScore };
  });
  
  // Sort by alignment score (highest first)
  scoredSubjects.sort((a, b) => b.alignmentScore - a.alignmentScore);
  
  return scoredSubjects.map(s => s.subject);
}

/**
 * Personalize module with adaptive checkpoints
 * 
 * Structure per user requirement:
 * - Checkpoint 1-3: Course syllabus content
 * - Checkpoint 4: Exploration task (adaptive to latent dimensions)
 * - Checkpoint 5: Progress checker
 * After completion: Reflection task (adaptive)
 * Next chapter unlocks after progress checker
 */
function personalizeModule(module, subject, trajectory, features, latentScores, position) {
  const checkpoints = [];
  
  // Checkpoints 1-3: Core syllabus content
  module.chapters.forEach((chapter, idx) => {
    if (idx < 3 || module.chapters.length <= 3) {
      checkpoints.push({
        id: `${module.id}_cp${idx + 1}`,
        type: 'content',
        number: idx + 1,
        title: chapter.title,
        topics: chapter.topics,
        status: 'locked',
        completionCriteria: {
          topicsCovered: chapter.topics.length,
          minimumTime: 30, // minutes
          selfAssessment: true
        }
      });
    }
  });
  
  // Checkpoint 4: Adaptive Exploration Task
  const explorationTask = generateExplorationTask(
    module,
    subject,
    latentScores,
    features
  );
  checkpoints.push({
    id: `${module.id}_cp4_exploration`,
    type: 'exploration',
    number: 4,
    title: 'Exploration Task',
    task: explorationTask,
    status: 'locked',
    intent: 'Adaptive task based on your learning trajectory - designed to deepen engagement',
    completionCriteria: {
      taskSubmission: true,
      reflectionRequired: latentScores.reflection > 5
    }
  });
  
  // Checkpoint 5: Progress Checker
  checkpoints.push({
    id: `${module.id}_cp5_progress`,
    type: 'progress_check',
    number: 5,
    title: 'Progress Checker',
    status: 'locked',
    description: 'Self-assessment to evaluate understanding before moving forward',
    questions: generateProgressQuestions(module),
    passingThreshold: 0.7,
    intent: 'Ensures consolidation before next module - not a test, a checkpoint'
  });
  
  // Post-completion: Reflection Task
  const reflectionTask = generateReflectionTask(module, features, latentScores);
  
  return {
    id: module.id,
    name: module.name,
    subject: subject.name,
    subjectColor: subject.color,
    intent: module.intent,
    estimatedWeeks: adjustEstimatedTime(module.estimatedWeeks, trajectory, features),
    difficulty: module.difficulty,
    checkpoints,
    reflectionTask,
    unlocked: position.subjectIndex === 0 && position.moduleIndex === 0,
    metadata: {
      confidenceAssumption: `Generated for trajectory: ${trajectory.directionVector.abstraction.toFixed(1)}/${trajectory.directionVector.structure.toFixed(1)}/${trajectory.directionVector.risk.toFixed(1)}`,
      reversibility: true,
      adaptiveGeneration: true
    }
  };
}

/**
 * Generate exploration task adapted to latent dimensions
 */
function generateExplorationTask(module, subject, latentScores, features) {
  // Determine dominant dimension
  let dominantDimension = 'exploration';
  let dominantScore = latentScores.exploration || 0;
  
  const dimensionScores = {
    exploration: latentScores.exploration || 0,
    depth: latentScores.depth || 0,
    application: latentScores.application || 0,
    reflection: latentScores.reflection || 0
  };
  
  Object.entries(dimensionScores).forEach(([dim, score]) => {
    if (score > dominantScore) {
      dominantDimension = dim;
      dominantScore = score;
    }
  });
  
  // Get level (high/medium/low) based on score
  let level = 'medium';
  if (dominantScore > 6) level = 'high';
  else if (dominantScore < 4) level = 'low';
  
  // Select template
  const templates = TASK_TEMPLATES[dominantDimension]?.[level] || TASK_TEMPLATES.exploration.medium;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace {topic} with module name
  const task = template.replace('{topic}', module.name);
  
  return {
    description: task,
    dimension: dominantDimension,
    level,
    rationale: `This task aligns with your ${dominantDimension} orientation (${dominantScore.toFixed(1)}/10)`,
    estimatedTime: level === 'high' ? 120 : level === 'medium' ? 60 : 30
  };
}

/**
 * Generate reflection task
 */
function generateReflectionTask(module, features, latentScores) {
  const reflectionLevel = latentScores.reflection || 5;
  
  if (reflectionLevel > 6) {
    return {
      type: 'deep_reflection',
      prompt: `Reflect on your learning journey through ${module.name}:
      
1. What was your biggest misconception before studying this module?
2. Which concept 'clicked' for you, and why do you think that happened?
3. How would you explain this module to someone younger?
4. What connections did you find to other subjects or real life?`,
      estimatedTime: 20
    };
  } else if (reflectionLevel > 3) {
    return {
      type: 'moderate_reflection',
      prompt: `Quick reflection on ${module.name}:
      
1. Rate your understanding: 1-10
2. What was most challenging?
3. One real-world application you discovered?`,
      estimatedTime: 10
    };
  } else {
    return {
      type: 'light_reflection',
      prompt: `Module ${module.name} complete. Review your notes and list 3 key takeaways.`,
      estimatedTime: 5
    };
  }
}

/**
 * Generate progress checker questions
 */
function generateProgressQuestions(module) {
  // These would be dynamically generated or pulled from question bank
  // For demo, return structure
  return [
    {
      id: 'pq1',
      text: `Core concept check for ${module.name}`,
      type: 'self_assessment',
      options: ['Not confident', 'Somewhat confident', 'Very confident']
    },
    {
      id: 'pq2',
      text: 'Can you solve typical problems without referring to notes?',
      type: 'yes_no'
    },
    {
      id: 'pq3',
      text: 'Rate your ability to explain this module to someone else',
      type: 'scale',
      range: [1, 10]
    }
  ];
}

/**
 * Adjust estimated time based on trajectory
 */
function adjustEstimatedTime(baseWeeks, trajectory, features) {
  let multiplier = 1.0;
  
  // Depth-oriented learners may need more time
  if (features.depthOrientation > 7) {
    multiplier *= 1.2;
  }
  
  // High exploration may add time
  if (features.explorationIndex > 7) {
    multiplier *= 1.15;
  }
  
  // High stability may reduce time
  if (trajectory.stabilityScore > 0.8) {
    multiplier *= 0.9;
  }
  
  return Math.ceil(baseWeeks * multiplier);
}

/**
 * Check if curriculum projection should be allowed
 * This is the gatekeeper function for CVSC
 */
export function shouldAllowCurriculumProjection(trajectory, features) {
  return (
    trajectory.stabilityScore > 0.65 &&
    features.explorationIndex < 7.5
  );
}
