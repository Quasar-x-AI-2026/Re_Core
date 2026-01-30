import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { Toaster } from 'sonner';

// Pages
import AuthPage from '@/pages/AuthPage';
import OnboardingPage from '@/pages/OnboardingPage';
import QuestionnaireFlow from '@/pages/QuestionnaireFlow';
import DashboardPage from '@/pages/DashboardPage';
import RoadmapPage from '@/pages/RoadmapPage';
import MentorshipPage from '@/pages/MentorshipPage';
import UniversitySearchPage from '@/pages/UniversitySearchPage';

function App() {
  const [user, setUser] = useState(null);
  const [hasCompletedQuestions, setHasCompletedQuestions] = useState(false);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              user ? 
                (hasCompletedQuestions ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/onboarding" />
                ) : 
                <AuthPage setUser={setUser} />
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              user ? 
                <OnboardingPage 
                  user={user} 
                  onComplete={() => setHasCompletedQuestions(true)} 
                /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/questionnaire" 
            element={
              user ? 
                <QuestionnaireFlow 
                  user={user} 
                  onComplete={() => setHasCompletedQuestions(true)} 
                /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user && hasCompletedQuestions ? 
                <DashboardPage user={user} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/roadmap/:subjectId?" 
            element={
              user && hasCompletedQuestions ? 
                <RoadmapPage user={user} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/mentorship" 
            element={
              user && hasCompletedQuestions ? 
                <MentorshipPage user={user} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/university-search" 
            element={
              user && hasCompletedQuestions ? 
                <UniversitySearchPage user={user} /> : 
                <Navigate to="/" />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
