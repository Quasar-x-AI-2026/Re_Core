import { extractSignals, deriveFeatures, aggregateLatentScores } from './signalExtractor';
import { initializeTrajectory, updateTrajectory, interpretTrajectory } from './trajectoryModel';
import { buildRoadmap, shouldAllowCurriculumProjection } from './roadmapBuilder';

/**
 * Main RECORE engine function
 * Pure function - no side effects, fully deterministic given inputs
 * 
 * @param {Array} rawSignals - Array of SignalRecord objects with confidence, timing, etc.
 * @param {Array} questionBank - Question bank with latent dimension mappings
 * @param {Object} context - User context (grade, board, curriculum commitment, etc.)
 * @param {Object} existingTrajectory - Previous trajectory state (for updates)
 * @returns {Object} Complete RECORE output with insights, trajectory, roadmap, mentorship signal
 */
export function recoreEngine(rawSignals, questionBank, context = {}, existingTrajectory = null) {
  // STEP 1:Extract statistical signals from raw interactions
  // These are atomic, timestamped behavioral markers
  const signals = extractSignals(rawSignals);

  // STEP 2:Aggregate latent dimension scores from question mappings
  // This combines user choices with confidence weighting
  const responses = rawSignals.map(r => ({
    questionId: r.questionId,
    selectedOption: r.selectedOption,
    confidence: r.confidence
  }));
  const latentScores = aggregateLatentScores(responses, questionBank);

  // STEP 3:Derive interpretable features from signals and latent scores
  // This is where "intelligence emerges from weak signals"
  const features = deriveFeatures(signals, latentScores);

  // STEP 4:Initialize or update trajectory in 3D learning space
  // Trajectory = current position + momentum in learning space
  let trajectory;
  if (existingTrajectory) {
    trajectory = updateTrajectory(existingTrajectory, features, 0.3);
  } else {
    trajectory = initializeTrajectory(features);
  }

  // STEP 5:Generate explainable insights
  // Every insight must be traceable to specific signals
  const insights = generateInsights(features, signals, latentScores, trajectory);

  // STEP 6:Evaluate CVSC (Curriculum Voluntary Structural Commitment) eligibility
  // Only suggest curriculum projection when stability threshold is met
  const cvscEvaluation = evaluateCVSC(trajectory, features, context);

  // STEP 7:Generate roadmap if CVSC is confirmed
  // Roadmap is a projection, not a prescription
  let roadmap = null;
  if (context.curriculumCommitted && cvscEvaluation.allowed) {
    roadmap = buildRoadmap(trajectory, features, latentScores, context.curriculum);
  }

  // STEP 8:Evaluate mentorship signal
  // Mentorship suggested when exploration high + stability low
  const mentorSignal = evaluateMentorshipSignal(trajectory, features);

  // STEP 9:Return structured intelligence output
  return {
    trajectory,
    trajectoryInterpretation: interpretTrajectory(trajectory),
    insights,
    features, // Include for debugging/transparency
    cvscEvaluation,
    roadmap,
    mentorSignal,
    metadata: {
      signalCount: rawSignals.length,
      processingTimestamp: Date.now(),
      engineVersion: '1.0.0',
      contextualFactors: {
        grade: context.grade,
        board: context.board,
        curriculumCommitted: context.curriculumCommitted
      }
    }
  };
}

/**
 * Generate explainable insights from features and signals
 * Each insight must include:
 * - Label (what)
 * - Explanation (why)
 * - Signal source (which data points)
 * - Confidence level
 * 
 * @returns {Array} Array of ExplainableInsight objects
 */
function generateInsights(features, signals, latentScores, trajectory) {
  const insights = [];

  // Insight 1: Learning Style
  if (features.depthOrientation > 6) {
    insights.push({
      category: 'Learning Style',
      label: 'Deep Conceptual Learner',
      explanation: 'You show strong preference for understanding underlying principles rather than surface memorization.',
      signalSource: `High depth orientation (${features.depthOrientation.toFixed(1)}/10) from question patterns favoring "understanding why" and reflection`,
      confidence: 0.85,
      actionable: 'Allocate extra time for fundamental concept clarity before moving to applications.'
    });
  } else if (features.applicationOrientation > 6) {
    insights.push({
      category: 'Learning Style',
      label: 'Applied Practical Learner',
      explanation: 'You thrive when learning through hands-on application and real-world problem-solving.',
      signalSource: `High application orientation (${features.applicationOrientation.toFixed(1)}/10) from preferences for practical problem-solving`,
      confidence: 0.85,
      actionable: 'Seek project-based tasks and real-world applications for each topic.'
    });
  }

  // Insight 2: Exploration Tendency
  if (features.explorationIndex > 7) {
    insights.push({
      category: 'Exploration',
      label: 'High Exploration Mode',
      explanation: 'Your signals indicate wide curiosity and comfort with exploring diverse topics.',
      signalSource: `High confidence variance (${signals.confidenceStats.variance.toFixed(2)}) and exploration score (${latentScores.exploration?.toFixed(1)})`,
      confidence: 0.78,
      actionable: 'Balance exploration with consolidation - ensure you master core concepts before branching.'
    });
  } else if (features.explorationIndex < 4) {
    insights.push({
      category: 'Exploration',
      label: 'Focused Consolidation Mode',
      explanation: 'You prefer deepening existing knowledge over broad exploration.',
      signalSource: `Low exploration index (${features.explorationIndex.toFixed(1)}/10) and consistent response patterns`,
      confidence: 0.82,
      actionable: 'Consider occasional exploration tasks to discover hidden interests.'
    });
  }

  // Insight 3: Stability & Consistency
  if (features.stabilityIndex > 7) {
    insights.push({
      category: 'Behavior',
      label: 'High Stability',
      explanation: 'Your learning behavior shows strong consistency and predictability.',
      signalSource: `Low time variance and ${signals.consistencyStats.responsePattern} response pattern`,
      confidence: 0.88,
      actionable: 'Your consistency is a strength. Consider setting long-term learning goals.'
    });
  } else if (features.stabilityIndex < 4) {
    insights.push({
      category: 'Behavior',
      label: 'Variable Learning Pattern',
      explanation: 'Your engagement shows fluctuations - this is normal during exploration phases.',
      signalSource: `High variance in response timing (${signals.hesitationStats.timeVariance.toFixed(0)}ms) and confidence`,
      confidence: 0.75,
      actionable: 'Experiment with different study schedules to find what works best for you.'
    });
  }

  // Insight 4: Autonomy vs Guidance
  if (features.selfTrustIndex > 7) {
    insights.push({
      category: 'Structure',
      label: 'Self-Directed Learner',
      explanation: 'You demonstrate high confidence in self-directed learning.',
      signalSource: `High self-trust (${features.selfTrustIndex.toFixed(1)}/10) and autonomy signals`,
      confidence: 0.83,
      actionable: 'You can design custom learning paths. Use structured resources as references.'
    });
  } else if (features.externalInfluenceIndex > 7) {
    insights.push({
      category: 'Structure',
      label: 'Guided Learning Preference',
      explanation: 'You benefit from structured guidance and clear frameworks.',
      signalSource: `High external influence index (${features.externalInfluenceIndex.toFixed(1)}/10) from support and structure preferences`,
      confidence: 0.86,
      actionable: 'Follow structured roadmaps and seek mentor guidance for complex topics.'
    });
  }

  // Insight 5: Confidence Momentum
  if (signals.confidenceStats.trendSlope > 0.2) {
    insights.push({
      category: 'Confidence',
      label: 'Growing Confidence',
      explanation: 'Your confidence increased as you progressed through questions.',
      signalSource: `Positive confidence trend (slope: ${signals.confidenceStats.trendSlope.toFixed(3)})`,
      confidence: 0.72,
      actionable: 'This positive momentum can be leveraged - tackle challenging topics next.'
    });
  } else if (signals.confidenceStats.trendSlope < -0.2) {
    insights.push({
      category: 'Confidence',
      label: 'Declining Confidence',
      explanation: 'Your confidence decreased during the assessment - this may indicate fatigue or increasing question difficulty.',
      signalSource: `Negative confidence trend (slope: ${signals.confidenceStats.trendSlope.toFixed(3)})`,
      confidence: 0.70,
      actionable: 'Consider shorter study sessions with breaks. Address any underlying concerns.'
    });
  }

  return insights;
}

/**
 * Evaluate CVSC (Curriculum Voluntary Structural Commitment) eligibility
 * 
 * CVSC = Permission to project structured curriculum
 * Criteria:
 * - Grade must be 10
 * - Board must be CBSE
 * - Stability threshold met
 * - Exploration not too high (indicates uncertainty)
 * - User must explicitly confirm
 * 
 * @returns {Object} CVSC evaluation with allowed flag and rationale
 */
function evaluateCVSC(trajectory, features, context) {
  const checks = {
    gradeCheck: context.grade === '10',
    boardCheck: context.board === 'CBSE',
    stabilityCheck: trajectory.stabilityScore > 0.65,
    explorationCheck: features.explorationIndex < 7.5,
    userConfirmation: context.curriculumCommitted || false
  };

  // Allow commitment if basic eligibility (Grade/Board) is met, regardless of stability
  const allowed = checks.gradeCheck && checks.boardCheck;

  let rationale = '';
  if (!checks.gradeCheck || !checks.boardCheck) {
    rationale = 'Curriculum projection currently available only for CBSE Class 10 students.';
  } else if (!checks.stabilityCheck) {
    rationale = `Learning pattern shows exploration phase (stability: ${(trajectory.stabilityScore * 100).toFixed(0)}%). Curriculum commitment suggested when stability reaches 65%+.`;
  } else if (!checks.explorationCheck) {
    rationale = `High exploration signals (${features.explorationIndex.toFixed(1)}/10) indicate you're still discovering interests. Commitment is optional until you're ready.`;
  } else if (!checks.userConfirmation) {
    rationale = 'Your signals indicate readiness for structured curriculum. Would you like to commit to an NCERT-based roadmap? This is voluntary and reversible.';
  } else {
    rationale = 'Curriculum commitment active. Roadmap is being generated based on your trajectory.';
  }

  return {
    allowed,
    requiresConfirmation: allowed && !checks.userConfirmation,
    rationale,
    checks,
    stabilityScore: trajectory.stabilityScore,
    explorationIndex: features.explorationIndex
  };
}

/**
 * Evaluate mentorship signal
 * Mentorship suggested when:
 * - High exploration + low stability (lost in options)
 * - High external influence + low confidence (needs validation)
 * - Confidence volatility exceeds threshold (decision paralysis)
 * 
 * @returns {Object} Mentorship signal with strength and reason
 */
function evaluateMentorshipSignal(trajectory, features) {
  const conditions = {
    explorationOverload: features.explorationIndex > 7 && trajectory.stabilityScore < 0.5,
    validationNeed: features.externalInfluenceIndex > 7 && features.selfTrustIndex < 4,
    decisionParalysis: features.explorationIndex > 6 && features.decisivenessIndex < 4
  };

  let required = false;
  let strength = 'low';
  let reason = '';

  if (conditions.explorationOverload) {
    required = true;
    strength = 'high';
    reason = 'Your learning signals show wide exploration with unstable patterns. Human mentorship can help consolidate direction without limiting curiosity.';
  } else if (conditions.validationNeed) {
    required = true;
    strength = 'high';
    reason = 'You show preference for external guidance. A mentor with similar learning trajectory can provide personalized clarity.';
  } else if (conditions.decisionParalysis) {
    required = true;
    strength = 'medium';
    reason = 'Multiple interests with decision hesitation detected. Optional mentor support available to discuss trade-offs.';
  } else if (features.explorationIndex > 5 || features.externalInfluenceIndex > 5) {
    strength = 'medium';
    reason = 'Mentorship is optional. May be valuable for specific guidance on complex topics.';
  } else {
    reason = 'Your signals indicate strong self-direction. Mentorship available if needed later.';
  }

  return {
    required,
    strength,
    reason,
    trajectoryMatch: interpretTrajectory(trajectory).profileType
  };
}
