import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, Lock, BookOpen, FlaskConical, Target, Lightbulb, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const RoadmapPage = ({ user }) => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { roadmapData } = location.state || {};

  const [roadmap, setRoadmap] = useState(roadmapData || null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [progress, setProgress] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [loading, setLoading] = useState(!roadmapData);

  useEffect(() => {
    if (!roadmapData) {
      loadRoadmap();
    }
    loadProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRoadmap = async () => {
    setLoading(true);
    try {
      const commitmentResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/curriculum/commit/${user.id}`
      );
      
      if (commitmentResponse.ok) {
        const commitment = await commitmentResponse.json();
        if (commitment.roadmap && commitment.roadmap.length > 0) {
          setRoadmap(commitment.roadmap);
        } else {
          console.warn('No roadmap data in commitment');
        }
      } else {
        console.error('Failed to load commitment');
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/roadmap/progress/${user.id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const isCheckpointCompleted = (checkpointId) => {
    return progress.some(p => p.checkpointId === checkpointId && p.completed);
  };

  const isCheckpointUnlocked = (module, checkpoint, checkpointIndex) => {
    if (checkpointIndex === 0) return true;
    const prevCheckpoint = module.checkpoints[checkpointIndex - 1];
    return isCheckpointCompleted(prevCheckpoint.id);
  };

  const handleCheckpointClick = (module, checkpoint) => {
    setSelectedModule(module);
    setCurrentCheckpoint(checkpoint);
    
    if (checkpoint.type === 'progress_check') {
      setShowProgressModal(true);
    } else if (checkpoint.type === 'exploration') {
      toast.info('Exploration Task', {
        description: checkpoint.task.description
      });
    }
  };

  const handleProgressCheck = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/roadmap/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: selectedModule.id,
          checkpointId: currentCheckpoint.id,
          completed: true
        })
      });

      toast.success('Progress checkpoint completed!');
      setShowProgressModal(false);
      setShowReflectionModal(true);
      loadProgress();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const handleReflectionSubmit = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/roadmap/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          moduleId: selectedModule.id,
          checkpointId: `${selectedModule.id}_reflection`,
          completed: true,
          reflectionResponse: reflectionText
        })
      });

      toast.success('Reflection saved! Next module unlocked.');
      setShowReflectionModal(false);
      setReflectionText('');
      loadProgress();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Failed to save reflection');
    }
  };

  const getCheckpointIcon = (type) => {
    switch (type) {
      case 'content':
        return <BookOpen className="w-5 h-5" />;
      case 'exploration':
        return <Lightbulb className="w-5 h-5" />;
      case 'progress_check':
        return <Target className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCheckpointColor = (type) => {
    switch (type) {
      case 'content':
        return 'bg-blue-500';
      case 'exploration':
        return 'bg-purple-500';
      case 'progress_check':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading your roadmap...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-center text-gray-300 mb-4">
              No curriculum commitment found. Complete your trajectory assessment first.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group modules by subject
  const modulesBySubject = roadmap.reduce((acc, module) => {
    if (!acc[module.subject]) {
      acc[module.subject] = [];
    }
    acc[module.subject].push(module);
    return acc;
  }, {});

  // If a specific subject is selected, show its modules
  if (subjectId && selectedSubject) {
    const modules = modulesBySubject[selectedSubject];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedSubject(null);
              navigate('/roadmap');
            }}
            className="mb-6 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subjects
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedSubject}</h1>
            <p className="text-gray-400">Adaptive learning path based on your trajectory</p>
          </div>

          {/* Checkpoint Type Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-blue-500/10 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Curriculum</h3>
                </div>
                <p className="text-sm text-gray-400">Main syllabus topics - essential for progression</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Exploration</h3>
                </div>
                <p className="text-sm text-gray-400">Optional - supports curiosity and deeper understanding</p>
              </CardContent>
            </Card>

            <Card className="bg-teal-500/10 border-teal-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Reflection</h3>
                </div>
                <p className="text-sm text-gray-400">Self-assessment - helps understand your learning</p>
              </CardContent>
            </Card>
          </div>

          {/* Modules */}
          {modules.map((module, moduleIndex) => {
            const completedCount = module.checkpoints.filter(cp => 
              isCheckpointCompleted(cp.id)
            ).length;

            return (
              <Card 
                key={module.id} 
                className="mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm"
                data-testid={`module-${moduleIndex}`}
              >
                <CardHeader className="border-b border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                        {moduleIndex + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white mb-2">{module.name}</CardTitle>
                        <p className="text-sm text-gray-400">{module.intent}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-teal-400 border-teal-400">
                      {module.checkpoints.length} checkpoints
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {module.checkpoints.map((checkpoint, idx) => {
                      const completed = isCheckpointCompleted(checkpoint.id);
                      const unlocked = isCheckpointUnlocked(module, checkpoint, idx);

                      return (
                        <div
                          key={checkpoint.id}
                          data-testid={`checkpoint-${idx}`}
                          className={`group relative flex items-start gap-4 p-4 rounded-lg transition-all ${
                            completed
                              ? 'bg-green-500/10 border-2 border-green-500/50'
                              : unlocked
                              ? 'bg-slate-700/30 border-2 border-slate-600 hover:border-blue-500/50 cursor-pointer'
                              : 'bg-slate-800/30 border-2 border-slate-700/50'
                          }`}
                          onClick={() => unlocked && !completed && handleCheckpointClick(module, checkpoint)}
                        >
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            completed ? 'bg-green-500' :
                            unlocked ? getCheckpointColor(checkpoint.type) :
                            'bg-slate-700'
                          }`}>
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : unlocked ? (
                              <span className="text-white">{getCheckpointIcon(checkpoint.type)}</span>
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">{checkpoint.title}</h4>
                              {checkpoint.type === 'exploration' && (
                                <Badge variant="secondary" className="text-xs">Optional</Badge>
                              )}
                            </div>
                            
                            {checkpoint.type === 'content' && checkpoint.topics && (
                              <p className="text-sm text-gray-400">
                                Topics: {checkpoint.topics.slice(0, 2).join(', ')}
                                {checkpoint.topics.length > 2 && ` +${checkpoint.topics.length - 2} more`}
                              </p>
                            )}
                            
                            {checkpoint.type === 'exploration' && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                                  Exploration (Optional)
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {checkpoint.task?.dimension} task - {checkpoint.task?.level} level
                                </p>
                              </div>
                            )}

                            {checkpoint.type === 'progress_check' && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                                  Progress Checker
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  Self-assessment to evaluate your understanding
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Checkpoint Type Label */}
                          <div className="flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded ${
                              checkpoint.type === 'content' ? 'bg-blue-500/20 text-blue-300' :
                              checkpoint.type === 'exploration' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-teal-500/20 text-teal-300'
                            }`}>
                              {checkpoint.type === 'content' ? 'Curriculum' :
                               checkpoint.type === 'exploration' ? 'Exploration' :
                               'Reflection'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Module Progress</span>
                      <span className="text-sm font-semibold text-teal-400">
                        {completedCount}/{module.checkpoints.length}
                      </span>
                    </div>
                    <Progress 
                      value={(completedCount / module.checkpoints.length) * 100} 
                      className="h-2 bg-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Check Modal */}
        <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
          <DialogContent className="bg-slate-800 border-slate-700" data-testid="progress-modal">
            <DialogHeader>
              <DialogTitle className="text-white">Progress Checkpoint</DialogTitle>
              <DialogDescription className="text-gray-400">
                Self-assessment to evaluate your understanding
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {currentCheckpoint?.questions?.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="font-medium text-white mb-2">{q.text}</p>
                    {q.type === 'self_assessment' && (
                      <div className="flex gap-2">
                        {q.options.map(opt => (
                          <Button key={opt} variant="outline" size="sm" className="text-gray-300">
                            {opt}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={handleProgressCheck} className="w-full bg-green-500 hover:bg-green-600">
                Complete Checkpoint
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reflection Modal */}
        <Dialog open={showReflectionModal} onOpenChange={setShowReflectionModal}>
          <DialogContent className="bg-slate-800 border-slate-700" data-testid="reflection-modal">
            <DialogHeader>
              <DialogTitle className="text-white">Reflection Task</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedModule?.reflectionTask?.prompt}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                data-testid="reflection-textarea"
                placeholder="Write your reflection here..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={8}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={handleReflectionSubmit}
                disabled={!reflectionText.trim()}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                Submit Reflection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Subject selection view
  return (
    <div data-testid="roadmap-page" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Learning Roadmap</h1>
          <p className="text-gray-400">Adaptive curriculum based on your trajectory</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(modulesBySubject).map(([subject, modules]) => {
            const completedCount = modules.reduce((acc, module) => {
              const moduleProgress = module.checkpoints.filter(cp => 
                isCheckpointCompleted(cp.id)
              ).length;
              return acc + moduleProgress;
            }, 0);

            const totalCheckpoints = modules.reduce((acc, module) => 
              acc + module.checkpoints.length, 0
            );

            const progressPercent = totalCheckpoints > 0 
              ? (completedCount / totalCheckpoints) * 100 
              : 0;

            return (
              <Card
                key={subject}
                data-testid={`subject-card-${subject}`}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-teal-500/50 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedSubject(subject);
                  navigate(`/roadmap/${subject.toLowerCase().replace(/\s+/g, '-')}`);
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{subject}</CardTitle>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-slate-700" />
                  <p className="text-sm text-gray-400 mt-2">
                    {completedCount} of {totalCheckpoints} checkpoints completed
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {modules.map(module => (
                      <div key={module.id} className="text-sm p-2 rounded bg-slate-700/30">
                        <p className="font-medium text-gray-300">{module.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{module.difficulty}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
