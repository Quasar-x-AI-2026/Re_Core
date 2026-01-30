import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, TrendingUp, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useRECORE } from '@/hooks/useRECORE';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TrajectoryGlobe from '@/components/TrajectoryGlobe';
import StatsCard from '@/components/StatsCard';
import TrajectoryHistory from '@/components/TrajectoryHistory';
import { exportTrajectoryJSON, exportRoadmapMarkdown } from '@/utils/exportUtils';
import { toast } from 'sonner';


//some bug is present  || working on it ||


export const DashboardPage = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signals: initialSignals, userData } = location.state || {};
  
  const [activeTab, setActiveTab] = useState('overview');
  const { trajectory, insights, cvscEvaluation, roadmap, mentorSignal, processSignals, loadTrajectory, loading } = useRECORE(userData?.id || user?.id);

  useEffect(() => {
    // Only run once on mount
    const initializeData = async () => {
      const userId = userData?.id || user?.id;
      if (!userId) return;

      // If we have initialSignals from questionnaire, process them
      if (initialSignals && initialSignals.length > 0) {
        await processSignals(initialSignals, {
          grade: userData?.grade || user?.grade,
          board: userData?.board || user?.board,
          curriculumCommitted: false
        });
      } else if (!trajectory) {
        // Otherwise, try to load existing trajectory
        await loadTrajectory();
      }
    };

    initializeData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCurriculumCommit = async () => {
    const userId = userData?.id || user?.id;
    
    try {
      toast.info('Generating your personalized roadmap...');
      
      // Step 1: Save commitment first
      console.log('Step 1: Saving commitment for user:', userId);
      const commitResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/curriculum/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          committed: true
        })
      });

      if (!commitResponse.ok) {
        const error = await commitResponse.text();
        console.error('Commitment save failed:', error);
        throw new Error('Failed to save commitment');
      }
      
      const commitData = await commitResponse.json();
      console.log('Step 1 complete: Commitment saved', commitData);

      // Step 2: Generate roadmap by reprocessing with curriculumCommitted=true
      console.log('Step 2: Generating roadmap...');
      
      // Get signals from backend to reprocess
      const signalsResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/signals/user/${userId}`
      );
      
      if (!signalsResponse.ok) {
        throw new Error('Failed to load signals');
      }
      
      const savedSignals = await signalsResponse.json();
      console.log('Loaded signals:', savedSignals.length);
      
      const result = await processSignals(savedSignals, {
        grade: userData?.grade || user?.grade,
        board: userData?.board || user?.board,
        curriculumCommitted: true
      });

      if (!result || !result.roadmap || result.roadmap.length === 0) {
        console.error('No roadmap generated:', result);
        throw new Error('Failed to generate roadmap');
      }
      
      console.log('Step 2 complete: Roadmap generated with', result.roadmap.length, 'modules');

      // Step 3: Save roadmap to backend
      console.log('Step 3: Saving roadmap to backend...');
      const roadmapResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/curriculum/roadmap/${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.roadmap)
        }
      );

      if (!roadmapResponse.ok) {
        const error = await roadmapResponse.text();
        console.error('Roadmap save failed:', error);
        throw new Error('Failed to save roadmap');
      }
      
      const roadmapResult = await roadmapResponse.json();
      console.log('Step 3 complete: Roadmap saved', roadmapResult);

      toast.success('Curriculum committed! Redirecting to roadmap...');
      
      // Navigate with data
      setTimeout(() => {
        navigate('/roadmap', { 
          state: { 
            userData: userData || user,
            roadmapData: result.roadmap 
          },
          replace: true
        });
      }, 1000);
    } catch (error) {
      console.error('Error in handleCurriculumCommit:', error);
      toast.error(`Failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your trajectory...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              RECORE
            </h1>
            <p className="text-xs text-gray-500 mt-1">Trajectory Engine</p>
          </div>

          <nav className="flex-1 space-y-2">
            <button
              data-testid="nav-overview"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              data-testid="nav-roadmap"
              onClick={() => navigate('/roadmap')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Roadmap</span>
            </button>

            <button
              data-testid="nav-mentorship"
              onClick={() => navigate('/mentorship')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Mentorship</span>
              {mentorSignal?.strength === 'high' && (
                <Badge variant="destructive" className="ml-auto">!</Badge>
              )}
            </button>

            <button
              data-testid="nav-university"
              onClick={() => navigate('/university-search')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium">Universities</span>
            </button>
          </nav>

          <div className="pt-4 border-t">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-700">{userData?.name || user?.name}</p>
              <p className="text-xs text-gray-500">{userData?.email || user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Grade {userData?.grade || user?.grade} • {userData?.board || user?.board}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Your Learning Trajectory</h2>
              <p className="text-gray-600 mt-2">
                Insights generated from your behavioral signals
              </p>
            </div>

            {/* Disclaimer */}
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                These insights are projections based on current signals and will evolve as you progress.
              </AlertDescription>
            </Alert>

            {/* Stats Cards */}
            <StatsCard trajectory={trajectory} insights={insights} roadmap={roadmap} />

            {/* Trajectory Globe Visualization */}
            {trajectory && (
              <Card className="mb-8 shadow-lg" data-testid="trajectory-globe-card">
                <CardHeader>
                  <CardTitle>Your Learning Trajectory</CardTitle>
                  <p className="text-sm text-gray-600">
                    3D visualization of your position in learning space
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <TrajectoryGlobe trajectory={trajectory} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights Grid */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* Trajectory History */}
              <TrajectoryHistory trajectory={trajectory} />

              {/* Insights */}
              <div className="space-y-6">
              {insights && insights.map((insight, idx) => (
                <Card key={idx} data-testid={`insight-card-${idx}`} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-2">{insight.category}</Badge>
                        <CardTitle className="text-lg">{insight.label}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-700">{insight.explanation}</p>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Signal Source:</p>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{insight.signalSource}</p>
                    </div>
                    {insight.actionable && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Actionable:</strong> {insight.actionable}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>

            {/* Export Options */}
            {trajectory && (
              <Card className="mb-8 shadow-lg">
                <CardHeader>
                  <CardTitle>Export Your Data</CardTitle>
                  <p className="text-sm text-gray-600">Download your trajectory and roadmap</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => exportTrajectoryJSON(trajectory, insights, userData || user)}
                    >
                      Export Trajectory (JSON)
                    </Button>
                    {roadmap && (
                      <Button
                        variant="outline"
                        onClick={() => exportRoadmapMarkdown(roadmap, userData || user, trajectory)}
                      >
                        Export Roadmap (Markdown)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CVSC Evaluation */}
            {cvscEvaluation && (
              <Card className="mb-8 shadow-lg" data-testid="cvsc-card">
                <CardHeader>
                  <CardTitle>Curriculum Commitment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{cvscEvaluation.rationale}</p>
                  
                  {cvscEvaluation.requiresConfirmation && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Stability Score</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(cvscEvaluation.stabilityScore * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Exploration Index</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {cvscEvaluation.explorationIndex.toFixed(1)}/10
                          </p>
                        </div>
                      </div>
                      <Button
                        data-testid="commit-curriculum-btn"
                        onClick={handleCurriculumCommit}
                        size="lg"
                        className="w-full"
                      >
                        Commit to NCERT Roadmap (Voluntary & Reversible)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mentorship Signal */}
            {mentorSignal && mentorSignal.required && (
              <Card className="shadow-lg border-amber-200" data-testid="mentor-signal-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <CardTitle>Mentorship Suggested</CardTitle>
                    <Badge variant="outline" className="ml-auto">{mentorSignal.strength} priority</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{mentorSignal.reason}</p>
                  <Button
                    data-testid="request-mentor-btn"
                    onClick={() => navigate('/mentorship')}
                    variant="outline"
                  >
                    Request Mentorship
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
