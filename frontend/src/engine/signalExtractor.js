/**
 * Signal Extractor: Converts raw user interactions into statistical features
 * 
 * PRINCIPLE: Weak Signal Intelligence
 * - Each question alone is meaningless
 * - Patterns across questions reveal cognitive tendencies
 * - Confidence, hesitation, and consistency matter more than answers
 */

/**
 * Extract statistical signals from raw interaction data
 * 
 * @param {Array} signalRecords - Array of SignalRecord objects
 * @returns {Object} Statistical features for trajectory modeling
 */
export function extractSignals(signalRecords) {
  if (!signalRecords || signalRecords.length === 0) {
    return getDefaultSignals();
  }

  // Compute confidence statistics
  const confidences = signalRecords.map(r => r.confidence);
  const confidenceStats = {
    mean: mean(confidences),
    variance: variance(confidences),
    trendSlope: computeTrendSlope(confidences),
    volatilityIndex: standardDeviation(confidences) / mean(confidences) // CV
  };

  // Compute hesitation statistics
  const timings = signalRecords.map(r => r.timeSpentMs);
  const hesitationStats = {
    avgTimePerQuestion: mean(timings),
    hesitationSpikes: countOutliers(timings, 1.5), // Count questions taking >1.5x median time
    rushedResponses: timings.filter(t => t < 3000).length, // Less than 3 seconds
    timeVariance: variance(timings)
  };

  // Compute consistency statistics
  const consistencyStats = {
    skippedQuestions: signalRecords.filter(r => r.skipped).length,
    orderDeviation: computeOrderDeviation(signalRecords),
    responsePattern: detectResponsePattern(signalRecords)
  };

  // Compute engagement statistics
  const engagementStats = {
    completionRate: signalRecords.filter(r => !r.skipped).length / signalRecords.length,
    averageEngagement: mean(timings) > 5000 && mean(timings) < 60000 ? 1 : 0.5,
    focusScore: 1 - (hesitationStats.rushedResponses / signalRecords.length)
  };

  return {
    confidenceStats,
    hesitationStats,
    consistencyStats,
    engagementStats,
    rawSignals: signalRecords
  };
}

/**
 * Derive interpretable features from statistical signals
 * These features map to latent cognitive dimensions
 * 
 * @param {Object} signals - Output from extractSignals
 * @param {Object} latentScores - Aggregated scores from question mappings
 * @returns {Object} Derived features for trajectory modeling
 */
export function deriveFeatures(signals, latentScores) {
  const { confidenceStats, hesitationStats, consistencyStats, engagementStats } = signals;

  // Exploration Index: Tendency to explore vs stick to known paths
  // High confidence variance + diverse choices = high exploration
  const explorationIndex = normalize(
    (confidenceStats.variance * 0.4) +
    (latentScores.exploration * 0.4) +
    (latentScores.uncertainty * 0.2),
    0, 10
  );

  // Stability Index: Consistency and predictability in learning behavior
  // Low time variance + high consistency = high stability
  const stabilityIndex = normalize(
    (consistencyStats.responsePattern === 'consistent' ? 8 : 4) * 0.3 +
    ((1 - hesitationStats.timeVariance / 100000) * 10) * 0.3 +
    (engagementStats.focusScore * 10) * 0.4,
    0, 10
  );

  // Decisiveness Index: Speed and confidence in decision-making
  const decisivenessIndex = normalize(
    (confidenceStats.mean * 0.5) +
    ((1 - hesitationStats.avgTimePerQuestion / 30000) * 10) * 0.3 +
    (engagementStats.focusScore * 10) * 0.2,
    0, 10
  );

  // Self-Trust Index: Internal confidence vs external validation need
  const selfTrustIndex = normalize(
    (confidenceStats.mean * 0.4) +
    ((1 - latentScores.support / 10) * 10) * 0.3 +
    (latentScores.autonomy * 0.3),
    0, 10
  );

  // External Influence Index: Reliance on guidance and structure
  const externalInfluenceIndex = normalize(
    (latentScores.support * 0.4) +
    (latentScores.structureNeed * 0.4) +
    (latentScores.pressure * 0.2),
    0, 10
  );

  // Depth Orientation: Preference for deep understanding vs surface learning
  const depthOrientation = normalize(
    (latentScores.depth * 0.5) +
    (latentScores.reflection * 0.3) +
    (hesitationStats.avgTimePerQuestion / 3000) * 0.2,
    0, 10
  );

  // Application Orientation: Preference for practical vs theoretical
  const applicationOrientation = normalize(
    (latentScores.application * 0.6) +
    (latentScores.execution * 0.4),
    0, 10
  );

  return {
    explorationIndex,
    stabilityIndex,
    decisivenessIndex,
    selfTrustIndex,
    externalInfluenceIndex,
    depthOrientation,
    applicationOrientation,
    // Meta-features for CVSC decision
    cvscEligibility: stabilityIndex > 6.5 && explorationIndex < 7,
    mentorshipSignalStrength: (explorationIndex > 7 && stabilityIndex < 5) ? 'high' : 
                               (explorationIndex > 5 || stabilityIndex < 6) ? 'medium' : 'low'
  };
}

// ============ UTILITY FUNCTIONS ============

function mean(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function variance(arr) {
  const avg = mean(arr);
  return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
}

function standardDeviation(arr) {
  return Math.sqrt(variance(arr));
}

function normalize(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeTrendSlope(values) {
  // Simple linear regression slope
  const n = values.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = values.reduce((a, b) => a + b, 0);
  const xySum = values.reduce((sum, y, x) => sum + x * y, 0);
  const xSquareSum = (n * (n - 1) * (2 * n - 1)) / 6;
  
  const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
  return slope;
}

function countOutliers(arr, threshold) {
  const med = median(arr);
  return arr.filter(val => val > med * threshold).length;
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function computeOrderDeviation(records) {
  // Check if questions were answered in order
  let deviations = 0;
  for (let i = 1; i < records.length; i++) {
    const expectedId = `Q${i + 1}`;
    if (records[i].questionId !== expectedId) {
      deviations++;
    }
  }
  return deviations;
}

function detectResponsePattern(records) {
  // Detect if responses show consistent behavior
  const confidences = records.map(r => r.confidence);
  const stdDev = standardDeviation(confidences);
  
  if (stdDev < 1.5) return 'consistent';
  if (stdDev > 3) return 'erratic';
  return 'moderate';
}

function getDefaultSignals() {
  return {
    confidenceStats: { mean: 5, variance: 2, trendSlope: 0, volatilityIndex: 0.4 },
    hesitationStats: { avgTimePerQuestion: 10000, hesitationSpikes: 0, rushedResponses: 0, timeVariance: 10000 },
    consistencyStats: { skippedQuestions: 0, orderDeviation: 0, responsePattern: 'moderate' },
    engagementStats: { completionRate: 1, averageEngagement: 1, focusScore: 0.8 },
    rawSignals: []
  };
}

/**
 * Aggregate latent dimension scores from question responses
 * 
 * @param {Array} responses - Array of { questionId, selectedOption, confidence }
 * @param {Array} questionBank - Question bank with mappings
 * @returns {Object} Aggregated scores for each latent dimension
 */
export function aggregateLatentScores(responses, questionBank) {
  const scores = {};
  
  responses.forEach(response => {
    const question = questionBank.find(q => q.id === response.questionId);
    if (!question) return;
    
    const selectedOption = question.options.find(opt => opt.label === response.selectedOption);
    if (!selectedOption) return;
    
    // Apply confidence weighting to dimension scores
    const confidenceWeight = response.confidence / 10;
    
    Object.entries(selectedOption.map).forEach(([dimension, baseScore]) => {
      if (!scores[dimension]) scores[dimension] = 0;
      scores[dimension] += baseScore * confidenceWeight;
    });
  });
  
  // Normalize scores to 0-10 range
  const maxPossibleScore = 15; // Max questions
  Object.keys(scores).forEach(key => {
    scores[key] = normalize(scores[key], 0, 10);
  });
  
  return scores;
}
