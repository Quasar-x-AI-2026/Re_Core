import { useState, useCallback, useEffect } from 'react';
import { recoreEngine } from '../engine/recoreEngine';
import { QUESTION_BANK } from '../data/questionBank';
import { NCERT_CLASS_10 } from '../data/ncertClass10';

export function useRECORE(userId) {
  const [trajectory, setTrajectory] = useState(null);
  const [insights, setInsights] = useState([]);
  const [cvscEvaluation, setCvscEvaluation] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [mentorSignal, setMentorSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * RUN ENGINE — ONLY WHEN SIGNALS ARE PROVIDED
   */
  const processSignals = useCallback(async (rawSignals, context = {}) => {
    if (!rawSignals || rawSignals.length === 0) {
      console.warn('RECORE: No signals provided — engine not run');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = recoreEngine(
        rawSignals,
        QUESTION_BANK,
        { ...context, curriculum: NCERT_CLASS_10 },
        trajectory
      );

      setTrajectory(result.trajectory);
      setInsights(result.insights);
      setCvscEvaluation(result.cvscEvaluation);
      setRoadmap(result.roadmap);
      setMentorSignal(result.mentorSignal);

      if (userId) {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/trajectory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            trajectory: result.trajectory,
            insights: result.insights,
            features: result.features,
            cvscEvaluation: result.cvscEvaluation,
            roadmap: result.roadmap,
            mentorSignal: result.mentorSignal
          })
        });
      }

      return result;
    } catch (e) {
      console.error('RECORE error:', e);
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, trajectory]);

  /**
   * LOAD STORED TRAJECTORY — NO ENGINE
   */
  const loadTrajectory = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/trajectory/${userId}`
      );

      if (!res.ok) return;

      const data = await res.json();
      setTrajectory(data.trajectory);
      setInsights(data.insights || []);
      setCvscEvaluation(data.cvscEvaluation || null);
      setRoadmap(data.roadmap || null);
      setMentorSignal(data.mentorSignal || null);
    } catch (e) {
      console.error('Load trajectory failed:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTrajectory();
  }, [loadTrajectory]);

  return {
    trajectory,
    insights,
    cvscEvaluation,
    roadmap,
    mentorSignal,
    loading,
    error,
    processSignals,
    loadTrajectory
  };
}
