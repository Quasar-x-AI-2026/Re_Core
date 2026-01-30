import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Enhanced statistics card for dashboard
 */
export const StatsCard = ({ trajectory, insights, roadmap }) => {
  if (!trajectory) return null;

  const stats = {
    stabilityScore: trajectory.stabilityScore * 100,
    explorationMode: trajectory.explorationMode,
    confidenceMomentum: trajectory.confidenceMomentum * 100,
    insightCount: insights?.length || 0,
    roadmapProgress: roadmap ? calculateRoadmapProgress(roadmap) : 0
  };

  const getStabilityTrend = () => {
    if (stats.stabilityScore > 70) return { icon: TrendingUp, color: 'text-green-600', label: 'High' };
    if (stats.stabilityScore > 40) return { icon: Minus, color: 'text-yellow-600', label: 'Moderate' };
    return { icon: TrendingDown, color: 'text-red-600', label: 'Low' };
  };

  const stabilityTrend = getStabilityTrend();
  const StabilityIcon = stabilityTrend.icon;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Stability Score */}
      <Card data-testid="stat-stability">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Stability</p>
            <StabilityIcon className={`w-5 h-5 ${stabilityTrend.color}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{Math.round(stats.stabilityScore)}%</h3>
            <Badge variant="outline" className="text-xs">{stabilityTrend.label}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">Learning consistency</p>
        </CardContent>
      </Card>

      {/* Exploration Mode */}
      <Card data-testid="stat-exploration">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Mode</p>
            <div className={`w-3 h-3 rounded-full ${stats.explorationMode ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">
              {stats.explorationMode ? 'Exploring' : 'Consolidating'}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-2">Current learning phase</p>
        </CardContent>
      </Card>

      {/* Confidence Momentum */}
      <Card data-testid="stat-momentum">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Momentum</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{Math.round(stats.confidenceMomentum)}%</h3>
          </div>
          <p className="text-xs text-gray-500 mt-2">Decision confidence</p>
        </CardContent>
      </Card>

      {/* Insights Generated */}
      <Card data-testid="stat-insights">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Insights</p>
            <Badge className="text-xs">{stats.insightCount}</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{stats.insightCount}</h3>
            <span className="text-sm text-gray-500">generated</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">From weak signals</p>
        </CardContent>
      </Card>
    </div>
  );
};

function calculateRoadmapProgress(roadmap) {
  if (!roadmap || roadmap.length === 0) return 0;
  
  const totalCheckpoints = roadmap.reduce((acc, module) => 
    acc + (module.checkpoints?.length || 0), 0
  );
  
  // This would need actual progress data in real implementation
  return totalCheckpoints > 0 ? 0 : 0;
}

export default StatsCard;
