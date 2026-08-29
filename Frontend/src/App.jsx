import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignUp, Login } from './modules/authentication';
import AssessmentLanding from './modules/Assesment/AssesmentLanding';
import AssessmentDashboard from './modules/Assesment/AssesmentDashboard';

// Mock assessment context (in production, fetch this from /api/assessments/:id)
const MOCK_ASSESSMENT = {
  _id: 'a1_id',
  title: 'Backend Engineering Assessment',
  description: 'Demonstrate your knowledge of API design, systems, and algorithms.',
  duration: 60, // 60 minutes
  questions: [
    {
      _id: 'q1_id',
      title: 'Reverse a Linked List',
      description: 'Given the head of a singly linked list, reverse the list and return its head.',
      starterCode: 'function reverseList(head) {\n  // Write your code here\n}',
      testCases: [
        { input: '[1, 2, 3, 4]', expectedOutput: '[4, 3, 2, 1]', isHidden: false }
      ]
    }
  ]
};

function AssessmentWorkspace() {
  const [view, setView] = useState('instructions'); // 'instructions' or 'dashboard'

  const handleFinalSubmit = (codeDrafts) => {
    console.log('Final submissions payload:', codeDrafts);
    alert('Assessment submitted successfully!');
    setView('instructions'); // back or to a success page
  };

  return (
    <>
      {view === 'instructions' ? (
        <AssessmentLanding 
          assessment={MOCK_ASSESSMENT} 
          onStart={() => setView('dashboard')} 
        />
      ) : (
        <AssessmentDashboard 
          assessment={MOCK_ASSESSMENT}
          questions={MOCK_ASSESSMENT.questions}
          initialTime={MOCK_ASSESSMENT.duration * 60}
          onFinalSubmit={handleFinalSubmit}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/assessment" element={<AssessmentWorkspace />} />
      </Routes>
    </Router>
  );
}

export default App;
