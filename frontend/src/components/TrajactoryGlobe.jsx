import React, { useEffect, useRef } from 'react';
import { trajectoryToSplineCoords } from '@/engine/trajectoryModel';

/**
 * 3D Globe Trajectory Visualization
 * Uses a fallback canvas-based globe when Spline is not available
 */
export const TrajectoryGlobe = ({ trajectory }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trajectory || !canvasRef.current) return;
    
    // Validate trajectory has required fields
    if (!trajectory.directionVector || 
        typeof trajectory.stabilityScore !== 'number' ||
        typeof trajectory.explorationMode !== 'boolean') {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Validate canvas dimensions
    if (!width || !height || width <= 0 || height <= 0) return;

    try {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw globe background
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;

      // Validate radius
      if (!isFinite(radius) || radius <= 0) return;

      // Globe gradient
      const gradient = ctx.createRadialGradient(
        centerX - radius / 3,
        centerY - radius / 3,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, '#e0f2fe');
      gradient.addColorStop(0.5, '#7dd3fc');
      gradient.addColorStop(1, '#0284c7');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let i = 0; i < 6; i++) {
        const y = centerY + (i - 2.5) * (radius / 3);
        const ellipseWidth = Math.sqrt(Math.max(0, radius * radius - Math.pow(y - centerY, 2))) * 2;
        
        if (isFinite(ellipseWidth) && ellipseWidth > 0) {
          ctx.beginPath();
          ctx.ellipse(centerX, y, ellipseWidth / 2, radius / 8, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      // Vertical lines
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius, radius / 3, angle, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw trajectory path
      if (trajectory.directionVector) {
        const coords = trajectoryToSplineCoords(trajectory);
        
        // Validate coords
        if (!isFinite(coords.x) || !isFinite(coords.y) || !isFinite(coords.z)) {
          console.warn('Invalid trajectory coordinates, skipping path rendering');
          return;
        }
        
        // Map 3D coords to 2D canvas
        const scale = radius / 150;
        const pathX = centerX + coords.x * scale;
        const pathY = centerY - coords.z * scale;

        // Validate path coordinates
        if (!isFinite(pathX) || !isFinite(pathY)) return;

        // Draw glowing path
        const pathGradient = ctx.createRadialGradient(pathX, pathY, 0, pathX, pathY, 30);
        pathGradient.addColorStop(0, trajectory.explorationMode ? '#3b82f6' : '#10b981');
        pathGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = pathGradient;
        ctx.beginPath();
        ctx.arc(pathX, pathY, 30, 0, 2 * Math.PI);
        ctx.fill();

        // Draw trajectory point
        ctx.fillStyle = trajectory.explorationMode ? '#2563eb' : '#059669';
        ctx.beginPath();
        ctx.arc(pathX, pathY, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Draw path line from center
        ctx.strokeStyle = trajectory.explorationMode 
          ? 'rgba(59, 130, 246, 0.6)' 
          : 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pathX, pathY);
        ctx.stroke();
      }

      // Draw center point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
    } catch (error) {
      console.error('Error rendering trajectory globe:', error);
    }

  }, [trajectory]);

  if (!trajectory) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden">
        <p className="text-gray-500">Loading trajectory...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full max-h-full"
      />
      {trajectory && trajectory.directionVector && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm">
          <p className="font-semibold mb-1">Learning Space Position:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Abstraction:</span>{' '}
              <span className="font-medium">
                {isFinite(trajectory.directionVector.abstraction) 
                  ? trajectory.directionVector.abstraction.toFixed(1) 
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Structure:</span>{' '}
              <span className="font-medium">
                {isFinite(trajectory.directionVector.structure) 
                  ? trajectory.directionVector.structure.toFixed(1) 
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Risk:</span>{' '}
              <span className="font-medium">
                {isFinite(trajectory.directionVector.risk) 
                  ? trajectory.directionVector.risk.toFixed(1) 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrajectoryGlobe;
