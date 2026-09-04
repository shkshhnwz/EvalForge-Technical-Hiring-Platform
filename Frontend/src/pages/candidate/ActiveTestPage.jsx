import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentLanding from '../../modules/Assesment/AssesmentLanding';
import AssessmentDashboard from '../../modules/Assesment/AssesmentDashboard';
import AssessmentResult from '../../modules/Assesment/AssesmentResult';
import api from '../../services/api';
import { AlertCircle } from 'lucide-react';

export default function ActiveTestPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('instructions'); // 'instructions' | 'dashboard' | 'result'
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchActiveAssessment();
  }, []);

  const fetchActiveAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/assessments/active/start
      const res = await api.get('/api/assessments/active/start');
      setAssessmentData(res);
    } catch (err) {
      setError(err.message || 'No active assessment session found. Please join via your invitation link.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (codeDrafts) => {
    try {
      const res = await api.post('/api/assessments/active/submit', {
        submissions: codeDrafts
      });
      setResultData(res);
      setView('result');
    } catch (err) {
      alert(err.message || 'Failed to submit assessment. Please check your network connection.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFFF7] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#00100B] border-t-[#52B788] rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-[#2E2D4D] uppercase tracking-wider">
          Initializing Candidate Environment...
        </span>
      </div>
    );
  }

  if (error || !assessmentData?.assessment) {
    return (
      <div className="min-h-screen bg-[#FCFFF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 neo-card text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-xl font-black text-[#00100B]">Session Unavailable</h2>
          <p className="text-xs text-[#2E2D4D]">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-[#00100B] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button"
          >
            Candidate Sign In
          </button>
        </div>
      </div>
    );
  }

  const assessment = assessmentData.assessment;

  return (
    <>
      {view === 'instructions' && (
        <AssessmentLanding
          assessment={assessment}
          onStart={() => setView('dashboard')}
        />
      )}

      {view === 'dashboard' && (
        <AssessmentDashboard
          assessment={assessment}
          questions={assessment.questions}
          initialTime={(assessment.timeLimit || 60) * 60}
          onFinalSubmit={handleFinalSubmit}
        />
      )}

      {view === 'result' && (
        <AssessmentResult
          resultData={resultData}
          onGoHome={() => navigate('/')}
        />
      )}
    </>
  );
}
