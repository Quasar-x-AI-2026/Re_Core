import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const MentorshipPage = ({ user }) => {
  const navigate = useNavigate();
  const [trajectory, setTrajectory] = useState(null);
  const [questions, setQuestions] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrajectory();
    loadRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTrajectory = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/trajectory/${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setTrajectory(data);
      }
    } catch (error) {
      console.error('Error loading trajectory:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/mentorship/requests/${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSubmit = async () => {
    if (!questions.trim()) {
      toast.error('Please enter your questions or concerns');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/mentorship/request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            trajectoryProfile: getTrajectoryProfile(),
            questions: questions
          })
        }
      );

      if (!response.ok) throw new Error('Failed to submit request');

      toast.success('Mentorship request submitted!');
      setSubmitted(true);
      setQuestions('');
      loadRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getTrajectoryProfile = () => {
    if (!trajectory) return 'Adaptive Learner';
    
    const { directionVector } = trajectory;
    const { abstraction, structure, risk } = directionVector;

    if (abstraction > 2 && structure < -2) return 'Independent Theorist';
    if (abstraction < -2 && structure > 2) return 'Guided Practitioner';
    if (risk > 4) return 'Curious Explorer';
    if (trajectory.stabilityScore > 0.7) return 'Steady Learner';
    return 'Adaptive Learner';
  };

  return (
    <div 
      data-testid="mentorship-page"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Request</h1>
          <p className="text-gray-600">
            Get guidance from mentors with similar learning trajectories
          </p>
        </div>

        {/* Trajectory Match Info */}
        <Card className="mb-6 shadow-lg" data-testid="trajectory-match-card">
          <CardHeader>
            <CardTitle>Your Learning Profile</CardTitle>
            <CardDescription>
              We'll match you with a mentor who has a similar trajectory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className="text-lg px-4 py-2">{getTrajectoryProfile()}</Badge>
              {trajectory && (
                <div className="text-sm text-gray-600">
                  <p>Stability: {Math.round(trajectory.stabilityScore * 100)}%</p>
                  <p>Exploration Mode: {trajectory.explorationMode ? 'Active' : 'Consolidated'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Form */}
        {!submitted && (
          <Card className="mb-6 shadow-lg" data-testid="mentorship-form">
            <CardHeader>
              <CardTitle>Share Your Questions or Concerns</CardTitle>
              <CardDescription>
                Be specific about what you need help with. This helps us match you with the right mentor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                data-testid="questions-textarea"
                placeholder="Example: I'm confused about choosing between depth-first learning vs exploring multiple subjects. I also need guidance on time management for NCERT preparation..."
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  <strong>Note:</strong> Mentorship is about guidance, not correction. 
                  Your mentor will help you explore options, not impose a single path.
                </AlertDescription>
              </Alert>
              <Button
                data-testid="submit-request-btn"
                onClick={handleSubmit}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Mentorship Request'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {submitted && (
          <Card className="mb-6 shadow-lg border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Request Submitted</h3>
                  <p className="text-green-800">We'll match you with a mentor within 48 hours</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full"
              >
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Previous Requests */}
        {requests.length > 0 && (
          <Card className="shadow-lg" data-testid="previous-requests">
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((req, idx) => (
                  <div
                    key={req.id}
                    className="p-4 border rounded-lg bg-gray-50"
                    data-testid={`request-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{req.trajectoryProfile}</Badge>
                      <Badge
                        variant={req.status === 'pending' ? 'outline' : 'default'}
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{req.questions}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MentorshipPage;
