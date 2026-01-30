/**
 * University Preference Engine
 * Multi-criteria decision logic with full explainability
 * Generates counseling-ready preference list
 */

/**
 * Generate university preference list based on weighted criteria
 * 
 * @param {Array} universities - University data
 * @param {Object} weights - User-defined weights for each criterion (0-10)
 * @param {Array} branchPreferences - Ordered list of preferred branches
 * @param {Array} instituteTypeOrder - Ordered list of preferred institute types
 * @param {String} homeState - User's home state
 * @param {String} category - User's category (general/obc/sc/st)
 * @returns {Object} Ranked preference list with explanations
 */
export function generatePreferenceList(
  universities,
  weights,
  branchPreferences,
  instituteTypeOrder,
  homeState,
  category = 'general'
) {
  // Normalize weights to sum to 1
  const normalizedWeights = normalizeWeights(weights);
  
  // Score each university for each available branch
  const scoredOptions = [];
  
  universities.forEach(university => {
    university.branches.forEach(branch => {
      const score = calculateUniversityBranchScore(
        university,
        branch,
        normalizedWeights,
        branchPreferences,
        instituteTypeOrder,
        homeState,
        category
      );
      
      scoredOptions.push({
        university,
        branch,
        ...score
      });
    });
  });
  
  // Sort by total score (descending)
  scoredOptions.sort((a, b) => b.totalScore - a.totalScore);
  
  // Generate rank list with explanations
  const preferenceList = scoredOptions.map((option, index) => ({
    rank: index + 1,
    universityName: option.university.name,
    branch: option.branch,
    location: `${option.university.location}, ${option.university.state}`,
    instituteType: option.university.type,
    totalScore: option.totalScore.toFixed(2),
    scoreBreakdown: option.breakdown,
    explanation: generateExplanation(option, normalizedWeights, homeState),
    cutoff: option.university.cutoffs[category],
    estimatedAdmissionChance: estimateAdmissionChance(option.totalScore, scoredOptions)
  }));
  
  return {
    preferenceList,
    metadata: {
      totalOptions: preferenceList.length,
      weightsUsed: normalizedWeights,
      branchPreferences,
      instituteTypeOrder,
      homeState,
      category,
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Calculate score for university-branch combination
 */
function calculateUniversityBranchScore(
  university,
  branch,
  weights,
  branchPreferences,
  instituteTypeOrder,
  homeState,
  category
) {
  const breakdown = {};
  let totalScore = 0;
  
  // Metric-based scores (normalized to 0-100)
  const metricScores = {
    ranking: normalizeMetric(university.metrics.ranking, 1, 20, true), // Inverted: lower rank is better
    placementRate: university.metrics.placementRate,
    averagePackage: normalizeMetric(university.metrics.averagePackage, 5, 25, false),
    researchOutput: university.metrics.researchOutput,
    facultyRatio: normalizeMetric(university.metrics.facultyRatio, 5, 25, true), // Inverted
    infrastructure: university.metrics.infrastructure
  };
  
  // Apply weights to metric scores
  Object.entries(metricScores).forEach(([metric, score]) => {
    const weightedScore = score * (weights[metric] || 0);
    breakdown[metric] = {
      rawScore: score,
      weight: weights[metric] || 0,
      weightedScore
    };
    totalScore += weightedScore;
  });
  
  // Home state preference (bonus score)
  if (weights.homeState && university.state === homeState) {
    const homeStateBonus = 100 * weights.homeState;
    breakdown.homeState = {
      rawScore: 100,
      weight: weights.homeState,
      weightedScore: homeStateBonus,
      matched: true
    };
    totalScore += homeStateBonus;
  } else {
    breakdown.homeState = {
      rawScore: 0,
      weight: weights.homeState || 0,
      weightedScore: 0,
      matched: false
    };
  }
  
  // Institute type preference (based on order)
  const typeIndex = instituteTypeOrder.indexOf(university.type);
  const typeScore = typeIndex !== -1 ? (instituteTypeOrder.length - typeIndex) * 20 : 0;
  const typeWeightedScore = typeScore * (weights.instituteType || 0);
  breakdown.instituteType = {
    rawScore: typeScore,
    weight: weights.instituteType || 0,
    weightedScore: typeWeightedScore,
    type: university.type,
    preferenceIndex: typeIndex + 1
  };
  totalScore += typeWeightedScore;
  
  // Branch preference (bonus for higher preference)
  const branchIndex = branchPreferences.indexOf(branch);
  const branchBonus = branchIndex !== -1 ? (branchPreferences.length - branchIndex) * 15 : 0;
  breakdown.branchPreference = {
    bonus: branchBonus,
    branch,
    preferenceIndex: branchIndex + 1
  };
  totalScore += branchBonus;
  
  return { totalScore, breakdown };
}

/**
 * Normalize metric to 0-100 scale
 * @param {Boolean} inverted - True if lower value is better
 */
function normalizeMetric(value, min, max, inverted = false) {
  const normalized = ((value - min) / (max - min)) * 100;
  const clamped = Math.max(0, Math.min(100, normalized));
  return inverted ? 100 - clamped : clamped;
}

/**
 * Normalize weights to sum to 1
 */
function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0);
  if (total === 0) return weights; // Avoid division by zero
  
  const normalized = {};
  Object.entries(weights).forEach(([key, value]) => {
    normalized[key] = (value || 0) / total;
  });
  return normalized;
}

/**
 * Generate human-readable explanation for each option
 */
function generateExplanation(option, weights, homeState) {
  const topFactors = [];
  
  // Find top 3 contributing factors
  const factorContributions = [];
  Object.entries(option.breakdown).forEach(([factor, data]) => {
    if (factor === 'branchPreference') {
      if (data.preferenceIndex && data.preferenceIndex <= 3) {
        topFactors.push(`Your ${data.preferenceIndex === 1 ? 'top' : `#${data.preferenceIndex}`} branch choice`);
      }
    } else if (data.weightedScore > 0) {
      factorContributions.push({ factor, score: data.weightedScore, ...data });
    }
  });
  
  factorContributions.sort((a, b) => b.score - a.score);
  
  factorContributions.slice(0, 3).forEach(contrib => {
    if (contrib.factor === 'ranking') {
      topFactors.push(`Strong national ranking (#${option.university.metrics.ranking})`);
    } else if (contrib.factor === 'placementRate') {
      topFactors.push(`Excellent placement rate (${option.university.metrics.placementRate}%)`);
    } else if (contrib.factor === 'averagePackage') {
      topFactors.push(`High average package (₹${option.university.metrics.averagePackage}L)`);
    } else if (contrib.factor === 'homeState' && contrib.matched) {
      topFactors.push('Located in your home state');
    } else if (contrib.factor === 'instituteType') {
      topFactors.push(`Preferred institute type (${contrib.type})`);
    } else if (contrib.factor === 'researchOutput') {
      topFactors.push('Strong research output');
    } else if (contrib.factor === 'infrastructure') {
      topFactors.push('Excellent infrastructure');
    }
  });
  
  return topFactors.slice(0, 3).join(', ') || 'Meets your basic criteria';
}

/**
 * Estimate admission chance based on score distribution
 */
function estimateAdmissionChance(score, allOptions) {
  const scores = allOptions.map(opt => opt.totalScore);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  
  // Normalize score to percentage
  const normalized = ((score - minScore) / (maxScore - minScore)) * 100;
  
  if (normalized > 80) return 'High';
  if (normalized > 50) return 'Moderate';
  return 'Low';
}

/**
 * Analyze trade-offs between top options
 * Useful for decision-making
 */
export function analyzeTradeoffs(preferenceList, topN = 5) {
  const topOptions = preferenceList.slice(0, topN);
  
  const analysis = {
    bestForPlacement: null,
    bestForRanking: null,
    bestForPackage: null,
    bestForHomeState: null,
    tradeoffInsights: []
  };
  
  // Find best for each major criterion
  topOptions.forEach(option => {
    const placementScore = option.scoreBreakdown.placementRate?.rawScore || 0;
    const rankingScore = option.scoreBreakdown.ranking?.rawScore || 0;
    const packageScore = option.scoreBreakdown.averagePackage?.rawScore || 0;
    const homeStateMatch = option.scoreBreakdown.homeState?.matched || false;
    
    if (!analysis.bestForPlacement || placementScore > (analysis.bestForPlacement.scoreBreakdown.placementRate?.rawScore || 0)) {
      analysis.bestForPlacement = option;
    }
    if (!analysis.bestForRanking || rankingScore > (analysis.bestForRanking.scoreBreakdown.ranking?.rawScore || 0)) {
      analysis.bestForRanking = option;
    }
    if (!analysis.bestForPackage || packageScore > (analysis.bestForPackage.scoreBreakdown.averagePackage?.rawScore || 0)) {
      analysis.bestForPackage = option;
    }
    if (homeStateMatch && !analysis.bestForHomeState) {
      analysis.bestForHomeState = option;
    }
  });
  
  // Generate tradeoff insights
  if (analysis.bestForRanking?.rank !== 1) {
    analysis.tradeoffInsights.push(
      `While ${preferenceList[0].universityName} ranks #1 in your preferences, ${analysis.bestForRanking.universityName} has the highest national ranking.`
    );
  }
  
  if (analysis.bestForPlacement && analysis.bestForPlacement.rank > 1) {
    analysis.tradeoffInsights.push(
      `${analysis.bestForPlacement.universityName} offers the best placement rate but ranks #${analysis.bestForPlacement.rank} in your overall preferences.`
    );
  }
  
  return analysis;
}
