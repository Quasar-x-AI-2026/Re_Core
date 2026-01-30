/**
 * Trajectory Model: Maintains learning space position and evolution
 * 
 * PRINCIPLE: Non-Deterministic Trajectory
 * - Same answers with different metadata = different trajectories
 * - Position in 3D learning space: Abstraction, Structure, Risk
 * - Trajectory evolves with each interaction
 */

/**
 * Initialize trajectory state from derived features
 * 
 * @param {Object} features - Output from deriveFeatures
 * @returns {Object} Initial trajectory state
 */
export function initializeTrajectory(features) {
  // Map features to 3D learning space coordinates
  // X-axis: Abstraction (-10 to +10) - Abstract/Theoretical vs Concrete/Applied
  // Y-axis: Structure (-10 to +10) - Independent vs Guided
  // Z-axis: Risk (-10 to +10) - Stable/Conservative vs Exploratory/Risk-taking
  
  const abstraction = features.depthOrientation - features.applicationOrientation;
  const structure = features.externalInfluenceIndex - features.selfTrustIndex;
  const risk = features.explorationIndex - features.stabilityIndex;
  
  return {
    directionVector: {
      abstraction: normalize(abstraction, -10, 10),
      structure: normalize(structure, -10, 10),
      risk: normalize(risk, -10, 10)
    },
    stabilityScore: features.stabilityIndex / 10,
    explorationMode: features.explorationIndex > 6,
    confidenceMomentum: features.decisivenessIndex / 10,
    lastUpdated: Date.now(),
    version: 1
  };
}

/**
 * Update trajectory based on new signals
 * Implements incremental learning - doesn't recompute from scratch
 * 
 * @param {Object} currentTrajectory - Current trajectory state
 * @param {Object} newFeatures - New derived features
 * @param {Number} learningRate - How quickly trajectory adapts (0-1)
 * @returns {Object} Updated trajectory state
 */
export function updateTrajectory(currentTrajectory, newFeatures, learningRate = 0.3) {
  const newVector = {
    abstraction: newFeatures.depthOrientation - newFeatures.applicationOrientation,
    structure: newFeatures.externalInfluenceIndex - newFeatures.selfTrustIndex,
    risk: newFeatures.explorationIndex - newFeatures.stabilityIndex
  };
  
  // Exponential moving average for smooth trajectory evolution
  const updatedVector = {
    abstraction: lerp(
      currentTrajectory.directionVector.abstraction,
      normalize(newVector.abstraction, -10, 10),
      learningRate
    ),
    structure: lerp(
      currentTrajectory.directionVector.structure,
      normalize(newVector.structure, -10, 10),
      learningRate
    ),
    risk: lerp(
      currentTrajectory.directionVector.risk,
      normalize(newVector.risk, -10, 10),
      learningRate
    )
  };
  
  return {
    ...currentTrajectory,
    directionVector: updatedVector,
    stabilityScore: lerp(currentTrajectory.stabilityScore, newFeatures.stabilityIndex / 10, learningRate),
    explorationMode: newFeatures.explorationIndex > 6,
    confidenceMomentum: lerp(currentTrajectory.confidenceMomentum, newFeatures.decisivenessIndex / 10, learningRate),
    lastUpdated: Date.now(),
    version: currentTrajectory.version + 1
  };
}

/**
 * Compute trajectory magnitude (distance from origin in learning space)
 * 
 * @param {Object} trajectory - Trajectory state
 * @returns {Number} Magnitude of direction vector
 */
export function getTrajectoryMagnitude(trajectory) {
  const { abstraction, structure, risk } = trajectory.directionVector;
  return Math.sqrt(abstraction * abstraction + structure * structure + risk * risk);
}

/**
 * Get human-readable interpretation of trajectory position
 * 
 * @param {Object} trajectory - Trajectory state
 * @returns {Object} Interpretation object with labels and descriptions
 */
export function interpretTrajectory(trajectory) {
  const { abstraction, structure, risk } = trajectory.directionVector;
  
  // Abstraction axis interpretation
  let abstractionLabel, abstractionDesc;
  if (abstraction > 3) {
    abstractionLabel = "Theory-Oriented";
    abstractionDesc = "Strong preference for conceptual understanding and abstract thinking";
  } else if (abstraction > -3) {
    abstractionLabel = "Balanced";
    abstractionDesc = "Equal comfort with theoretical concepts and practical applications";
  } else {
    abstractionLabel = "Applied-Oriented";
    abstractionDesc = "Strong preference for hands-on learning and real-world applications";
  }
  
  // Structure axis interpretation
  let structureLabel, structureDesc;
  if (structure > 3) {
    structureLabel = "Guided Learner";
    structureDesc = "Benefits from structured guidance and clear frameworks";
  } else if (structure > -3) {
    structureLabel = "Semi-Independent";
    structureDesc = "Comfortable with both guided and independent learning";
  } else {
    structureLabel = "Self-Directed";
    structureDesc = "Thrives with autonomy and self-designed learning paths";
  }
  
  // Risk axis interpretation
  let riskLabel, riskDesc;
  if (risk > 3) {
    riskLabel = "Explorer";
    riskDesc = "High comfort with uncertainty and exploring new domains";
  } else if (risk > -3) {
    riskLabel = "Adaptive";
    riskDesc = "Balanced approach between exploration and consolidation";
  } else {
    riskLabel = "Consolidator";
    riskDesc = "Preference for deepening existing knowledge over broad exploration";
  }
  
  // Overall learning profile
  let profileType;
  if (abstraction > 2 && structure < -2) {
    profileType = "Independent Theorist";
  } else if (abstraction < -2 && structure > 2) {
    profileType = "Guided Practitioner";
  } else if (risk > 4) {
    profileType = "Curious Explorer";
  } else if (trajectory.stabilityScore > 0.7) {
    profileType = "Steady Learner";
  } else {
    profileType = "Adaptive Learner";
  }
  
  return {
    profileType,
    dimensions: [
      { axis: "Abstraction", label: abstractionLabel, description: abstractionDesc, value: abstraction },
      { axis: "Structure", label: structureLabel, description: structureDesc, value: structure },
      { axis: "Risk", label: riskLabel, description: riskDesc, value: risk }
    ],
    stabilityScore: trajectory.stabilityScore,
    magnitude: getTrajectoryMagnitude(trajectory)
  };
}

/**
 * Convert trajectory to Spline visualization coordinates
 * Maps 3D learning space to visual 3D coordinates for globe
 * 
 * @param {Object} trajectory - Trajectory state
 * @returns {Object} Spline-compatible coordinates
 */
export function trajectoryToSplineCoords(trajectory) {
  const { abstraction, structure, risk } = trajectory.directionVector;
  
  // Validate inputs
  if (!isFinite(abstraction) || !isFinite(structure) || !isFinite(risk)) {
    return { x: 0, y: 0, z: 0, intensity: 0, color: '#3B82F6' };
  }
  
  // Map to sphere coordinates for globe visualization
  const radius = 100; // Base radius
  const magnitude = getTrajectoryMagnitude(trajectory);
  
  // Guard against zero magnitude
  const safeMagnitude = magnitude > 0 ? magnitude : 0.1;
  const scaledRadius = radius + (magnitude * 5); // Extend based on trajectory strength
  
  // Convert Cartesian to spherical for natural globe path
  const theta = Math.atan2(risk, abstraction); // Azimuthal angle
  
  // Clamp structure/magnitude ratio to valid acos range [-1, 1]
  const cosPhiValue = Math.max(-1, Math.min(1, structure / safeMagnitude));
  const phi = Math.acos(cosPhiValue); // Polar angle
  
  // Validate phi is finite
  if (!isFinite(phi) || !isFinite(theta)) {
    return { x: 0, y: 0, z: 0, intensity: 0, color: '#3B82F6' };
  }
  
  const x = scaledRadius * Math.sin(phi) * Math.cos(theta);
  const y = scaledRadius * Math.sin(phi) * Math.sin(theta);
  const z = scaledRadius * Math.cos(phi);
  
  // Final validation
  if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
    return { x: 0, y: 0, z: 0, intensity: 0, color: '#3B82F6' };
  }
  
  return {
    x,
    y,
    z,
    intensity: trajectory.confidenceMomentum || 0,
    color: trajectory.explorationMode ? '#3B82F6' : '#10B981' // Blue for exploration, green for stable
  };
}

// ============ UTILITY FUNCTIONS ============

function normalize(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}
