import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ALKANE_QUESTIONS } from '@/data/alkaneQuestions';
import { Loader2 } from 'lucide-react';

const AlkaneQuestionnaire = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [responses, setResponses] = useState([]);

    const currentQuestion = ALKANE_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / ALKANE_QUESTIONS.length) * 100;

    const handleOptionSelect = (value) => {
        setSelectedOption(value);
    };

    const handleNext = () => {
        if (!selectedOption) {
            toast.error('Please select an option');
            return;
        }

        const responseData = {
            userId: user?.id,
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            selectedOption: selectedOption,
            timestamp: new Date().toISOString()
        };

        const newResponses = [...responses, responseData];
        setResponses(newResponses);

        if (currentQuestionIndex < ALKANE_QUESTIONS.length - 1) {
            setSelectedOption(null);
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleComplete(newResponses);
        }
    };

    const handleComplete = async (allResponses) => {
        setIsSubmitting(true);
        try {
            // Send all responses to webhook
            await fetch("https://pranjal01.app.n8n.cloud/webhook-test/bb8a47b4-7198-438a-9e89-a1a7a276bc2d", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allResponses)
            });

            toast.success("Assessment Complete!");
            navigate('/insights');

        } catch (error) {
            console.error('Error submitting response:', error);
            toast.error('Failed to submit responses. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl font-bold text-white">
                            Alkane Properties Assessment
                        </h1>
                        <span className="text-sm text-gray-400">
                            Question {currentQuestionIndex + 1} of {ALKANE_QUESTIONS.length}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-700" />
                </div>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl leading-relaxed text-white">
                            {currentQuestion.text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-3">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option.value)}
                                    disabled={isSubmitting}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${selectedOption === option.value
                                        ? 'border-teal-500 bg-teal-500/10 shadow-md'
                                        : 'border-slate-600 hover:border-teal-500/50 hover:bg-slate-700/50'
                                        }`}
                                >
                                    <span className="text-base text-gray-200">{option.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-700">
                            <Button
                                onClick={handleNext}
                                disabled={!selectedOption || isSubmitting}
                                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                {currentQuestionIndex < ALKANE_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Assessment'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AlkaneQuestionnaire;
