import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, AlertTriangle, Compass, Map, ArrowRight } from 'lucide-react';

const InsightsPage = ({ user }) => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: <Brain className="w-6 h-6 text-blue-400" />,
            title: "Current Thinking",
            subtitle: "How the learner currently approaches the topic",
            content: "When the learner encounters problems on alkanes and hydrocarbons, they tend to step in with confidence and structure. They rely strongly on logical analysis, quickly breaking problems down and eliminating options that do not fit, as seen in questions like Q1, Q3, and Q6. This gives them an edge in familiar scenarios, where known patterns apply cleanly. Their attention to detail also shows through—for example, in Q2, where they correctly rejected the idea that molecular mass alone determines boiling point. However, their fast response times suggest that this efficiency sometimes comes from recognizing familiar patterns rather than fully re-evaluating each situation from first principles. In short, they reason well—but often on autopilot.",
            color: "border-blue-500/50 bg-blue-500/10"
        },
        {
            icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
            title: "Directional Flaws",
            subtitle: "Where the reasoning starts to bend or stall",
            content: "The learner begins to struggle when the problem no longer fits a well-known template. In questions like Q8, their longer response time hints at uncertainty when surface cues fail or when multiple explanations seem plausible. This hesitation reveals difficulty in flexibly adapting their reasoning to unfamiliar conditions. In Q4, for instance, they missed how branching affects physical properties, suggesting a gap in linking molecular structure to observed behavior. Q7 further exposed a weakness in understanding intermolecular forces, particularly in explaining solubility. At times, their strong analytical habit turns into over-analysis, slowing them down without leading to better conclusions. The challenge here is not lack of intelligence—but rigidity when familiar rules stop working.",
            color: "border-amber-500/50 bg-amber-500/10"
        },
        {
            icon: <Compass className="w-6 h-6 text-emerald-400" />,
            title: "Optimal Direction",
            subtitle: "What mature understanding would look like",
            content: "At an optimal level, the learner would still use their strong analytical skills—but with greater flexibility and conceptual grounding. Instead of relying on single cues, they would visualize molecules, think in terms of structure–property relationships, and weigh multiple interacting factors at once. They would be comfortable distinguishing correlation from causation, especially when interpreting boiling points, melting points, or solubility trends. Anomalies would no longer feel threatening; instead, they would be treated as clues that refine understanding. In this mindset, molecular mass, branching, symmetry, and intermolecular forces are not competing explanations—but parts of a single coherent model.",
            color: "border-emerald-500/50 bg-emerald-500/10"
        },
        {
            icon: <Map className="w-6 h-6 text-purple-400" />,
            title: "Adaptation Guidance",
            subtitle: "How the learner can move forward",
            content: "To move toward mastery, the learner should deliberately practice stepping outside familiar reasoning patterns. Working through non-standard, constraint-heavy questions—like those in Q6 and Q8—will help train flexibility. Revisiting molecular structure using diagrams, models, and real-world examples can strengthen intuition where abstraction currently fails. Slowing down slightly to reflect on why an answer seems right can prevent over-reliance on shortcuts. By organizing thoughts with flowcharts or visual breakdowns, the learner can keep their structured approach while expanding it. Over time, breaking complex problems into parts and rebuilding them into a whole will allow the learner to apply their knowledge confidently—even in novel situations.",
            color: "border-purple-500/50 bg-purple-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                        Assessment Insights
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Based on your performance, here is a detailed breakdown of your cognitive approach and learning trajectory.
                    </p>
                </div>

                <div className="grid gap-6">
                    {sections.map((section, idx) => (
                        <Card key={idx} className={`border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-800/50 ${section.color}`}>
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                        {section.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl text-slate-100 font-bold">
                                            {section.title}
                                        </CardTitle>
                                        <p className="text-slate-400 font-medium">
                                            {section.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-slate-300 leading-relaxed text-lg">
                                    {section.content}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="pt-8 flex justify-center">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold px-8 py-6 rounded-full text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                    >
                        Continue to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InsightsPage;
