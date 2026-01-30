import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { QUESTION_BANK } from '@/data/questionBank';

// may be buggy ||working on it||

export const QuestionnaireFlow = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.user || user;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [confidence, setConfidence] = useState([5]);
  const [responses, setResponses] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = QUESTION_BANK[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTION_BANK.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
    setSelectedOption(null);
    setConfidence([5]);
  }, [currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (!userData?.id) {
  toast.error("User session missing. Please restart from login.");
  return;
}

    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    const timeSpent = Date.now() - startTime;
    const signalRecord = {
      userId: userData.id,
      questionId: currentQuestion.id,
      selectedOption: selectedOption,
      confidence: confidence[0],
      timeSpentMs: timeSpent,
      orderIndex: currentQuestionIndex,
      skipped: false
    };

    const newResponses = [...responses, signalRecord];
    setResponses(newResponses);

    if (currentQuestionIndex < QUESTION_BANK.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions completed - save and process
      handleComplete(newResponses);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, confidence, currentQuestionIndex, startTime, responses, userData, currentQuestion]);

  const handleComplete = async (allResponses) => {
    try {
      // Save signals to backend
      const response = await fetch("https://pranjal01.app.n8n.cloud/webhook-test/adaptive-learning-webhook", { // ← PUT YOUR N8N WEBHOOK URL HERE
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allResponses)
    });

if (!response.ok) throw new Error('Failed to send data to webhook');
;

      toast.success('Assessment complete! Analyzing your trajectory...');
      onComplete();
      navigate('/dashboard', { state: { userData, signals: allResponses } });
    } catch (error) {
      console.error('Error saving signals:', error);
      toast.error('Failed to save responses');
    }
    
  };

  return (
    <div 
      data-testid="questionnaire-page"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Learning Trajectory Assessment
            </h1>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {QUESTION_BANK.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl" data-testid="question-card">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  data-testid={`option-${idx}`}
                  onClick={() => setSelectedOption(option.label)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedOption === option.label
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{option.label}</span>
                </button>
              ))}
            </div>

            {selectedOption && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How confident are you with this choice?
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Low</span>
                    <Slider
                      data-testid="confidence-slider"
                      value={confidence}
                      onValueChange={setConfidence}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">High</span>
                    <span className="text-lg font-bold text-blue-600 w-8 text-center">
                      {confidence[0]}
                    </span>
                  </div>
                </div>

                <Button
                  data-testid="next-question-btn"
                  onClick={handleNext}
                  className="w-full"
                  size="lg"
                >
                  {currentQuestionIndex < QUESTION_BANK.length - 1 ? 'Next Question' : 'Complete Assessment'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          No right or wrong answers. We're observing how you think, not what you know.
        </p>
      </div>
    </div>
  );
};

export default QuestionnaireFlow;
