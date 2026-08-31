import React, { useState } from 'react';
import AssessmentLanding from './modules/Assesment/AssesmentLanding';
import AssessmentDashboard from './modules/Assesment/AssesmentDashboard';
import AssessmentResult from './modules/Assesment/AssesmentResult';

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
      scoreWeight: 10,
      testCases: [
        { input: '[1, 2, 3, 4]', expectedOutput: '[4, 3, 2, 1]', isHidden: false }
      ]
    }
  ]
};


function AssessmentWorkspace() {
  const [view, setView] = useState('instructions'); // 'instructions' | 'dashboard' | 'result'
  const [resultData, setResultData] = useState(null);

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch('/api/assessments/active/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setResultData(data);
      setView('result');
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit assessment. Please check your connection.");
    }
  };

  return (
    <>
      {view === 'instructions' && (
        <AssessmentLanding 
          assessment={MOCK_ASSESSMENT} 
          onStart={() => setView('dashboard')} 
        />
      )}
      {view === 'dashboard' && (
        <AssessmentDashboard 
          assessment={MOCK_ASSESSMENT}
          questions={MOCK_ASSESSMENT.questions}
          initialTime={MOCK_ASSESSMENT.duration * 60}
          onFinalSubmit={handleFinalSubmit}
        />
      )}
      {view === 'result' && (
        <AssessmentResult 
          resultData={resultData} 
          onGoHome={() => setView('instructions')} 
        />
      )}
    </>
  );
}
export default AssessmentWorkspace;

