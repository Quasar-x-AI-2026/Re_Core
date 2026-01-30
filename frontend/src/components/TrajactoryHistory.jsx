import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { interpretTrajectory } from '@/engine/trajectoryModel';

/**
 * Trajectory History Visualization
 * Shows how trajectory has evolved over time
 */
export const TrajectoryHistory = ({ trajectory, previousStates = [] }) => {
  if (!trajectory) return null;

  const interpretation = interpretTrajectory(trajectory);
  const allStates = [...previousStates, trajectory];

  return (
    <Card className="shadow-lg" data-testid="trajectory-history-card">
      <CardHeader>
        <CardTitle>Trajectory Evolution</CardTitle>
        <p className="text-sm text-gray-600">
          Your learning profile: <strong>{interpretation.profileType}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Position */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Current Position in Learning Space</h4>
          <div className="grid gap-4">
            {interpretation.dimensions.map((dim) => (
              <div key={dim.axis}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium text-sm">{dim.label}</span>
                    <p className="text-xs text-gray-500">{dim.description}</p>
                  </div>
                  <Badge variant="outline">{dim.value.toFixed(1)}</Badge>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full transition-all ${
                      dim.value > 3 ? 'bg-blue-500' :
                      dim.value < -3 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{
                      width: `${Math.abs(dim.value) * 5 + 50}%`,
                      left: dim.value < 0 ? '0' : '50%',
                      transform: dim.value < 0 ? 'none' : 'translateX(-100%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution Chart */}
        {allStates.length > 1 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Stability Evolution</h4>
            <div className="flex items-end gap-1 h-32">
              {allStates.map((state, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{
                      height: `${state.stabilityScore * 100}%`,
                      opacity: idx === allStates.length - 1 ? 1 : 0.5
                    }}
                  />
                  <span className="text-xs text-center text-gray-500 mt-1">
                    v{state.version}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Characteristics */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Key Characteristics</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Stability: {Math.round(trajectory.stabilityScore * 100)}%
            </Badge>
            <Badge variant={trajectory.explorationMode ? 'default' : 'outline'}>
              {trajectory.explorationMode ? 'Exploration Mode' : 'Consolidation Mode'}
            </Badge>
            <Badge variant="outline">
              Confidence: {Math.round(trajectory.confidenceMomentum * 100)}%
            </Badge>
            <Badge variant="outline">
              Version {trajectory.version}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrajectoryHistory;
