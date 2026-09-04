import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RecruiterLayout from '../../components/layouts/RecruiterLayout';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  Code2, 
  Plus, 
  AlertCircle, 
  Layers, 
  Save 
} from 'lucide-react';

export default function AssessmentBuilderPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    allowedLanguages: ['javascript', 'python', 'cpp', 'java'],
  });

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const allSupportedLanguages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const data = await api.get('/api/questions');
      setAvailableQuestions(data || []);
      // Auto-select all by default if there are few
      if (data && data.length > 0) {
        setSelectedQuestions(data.map(q => q._id));
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleToggleLanguage = (langId) => {
    setFormData(prev => {
      const exists = prev.allowedLanguages.includes(langId);
      if (exists) {
        if (prev.allowedLanguages.length === 1) return prev; // keep at least 1
        return { ...prev, allowedLanguages: prev.allowedLanguages.filter(l => l !== langId) };
      } else {
        return { ...prev, allowedLanguages: [...prev.allowedLanguages, langId] };
      }
    });
  };

  const handleToggleQuestion = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // Compute total potential score
  const totalScore = availableQuestions
    .filter(q => selectedQuestions.includes(q._id))
    .reduce((sum, q) => sum + (q.scoreWeight || 10), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.timeLimit) {
      setError('Title and time limit are required.');
      return;
    }

    if (selectedQuestions.length === 0) {
      setError('Please select at least one question for this assessment.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/assessments', {
        title: formData.title,
        description: formData.description,
        timeLimit: Number(formData.timeLimit),
        allowedLanguages: formData.allowedLanguages,
        questions: selectedQuestions,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RecruiterLayout
      title="Create New Assessment"
      subtitle="Configure test timing, sandbox languages, and select coding challenges"
      actions={
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#2E2D4D] hover:text-[#00100B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Basic Assessment Info */}
        <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 neo-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#00100B]/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#52B788] block">Step 1</span>
              <h2 className="text-xl font-black text-[#00100B]">General Assessment Details</h2>
            </div>
            <Layers className="w-5 h-5 text-[#00100B]" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Assessment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Backend Engineer Benchmark"
                className="w-full px-4 py-3 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Candidate Instructions / Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the role, expectations, and any special instructions for the test taker..."
                className="w-full p-4 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Time Limit (Minutes) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                  className="w-full px-4 py-3 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                  required
                />
                <span className="text-[10px] text-[#2E2D4D] mt-1 block">Countdown starts when candidate clicks "Begin Assessment"</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Permitted Languages
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {allSupportedLanguages.map((lang) => {
                    const isSelected = formData.allowedLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => handleToggleLanguage(lang.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border-2 transition-all ${
                          isSelected
                            ? 'bg-[#00100B] text-[#FCFFF7] border-[#00100B]'
                            : 'bg-transparent text-[#2E2D4D] border-[#00100B]/30 hover:border-[#00100B]'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Question Selector */}
        <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 neo-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#00100B]/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#52B788] block">Step 2</span>
              <h2 className="text-xl font-black text-[#00100B]">Select Coding Challenges</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-[#FFE900] text-[#00100B] px-3 py-1 rounded-full">
                {selectedQuestions.length} Selected • {totalScore} Max Points
              </span>
              <Link
                to="/questions"
                target="_blank"
                className="text-xs font-bold text-[#00100B] underline hover:text-[#52B788] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Question to Bank
              </Link>
            </div>
          </div>

          {loadingQuestions ? (
            <div className="py-8 text-center text-xs font-bold text-[#2E2D4D]">
              Loading Question Bank...
            </div>
          ) : availableQuestions.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-[#00100B]/30 rounded-2xl text-center space-y-3">
              <p className="text-sm font-bold text-[#00100B]">Your Question Bank is currently empty.</p>
              <p className="text-xs text-[#2E2D4D]">Create coding challenges first so you can assign them to this test.</p>
              <Link
                to="/questions"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00100B] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button"
              >
                <Plus className="w-3.5 h-3.5 text-[#FFE900]" />
                Create New Question
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {availableQuestions.map((q) => {
                const isSelected = selectedQuestions.includes(q._id);
                return (
                  <div
                    key={q._id}
                    onClick={() => handleToggleQuestion(q._id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#00100B] bg-[#52B788]/10 neo-card'
                        : 'border-[#00100B]/20 hover:border-[#00100B]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#00100B] border-[#00100B] text-[#52B788]' : 'border-[#00100B]/40'
                      }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#00100B]">{q.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            q.difficulty === 'easy'
                              ? 'bg-[#52B788] text-[#00100B]'
                              : q.difficulty === 'medium'
                              ? 'bg-[#FFE900] text-[#00100B]'
                              : 'bg-[#2E2D4D] text-[#FCFFF7]'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-[11px] text-[#2E2D4D]">
                            {q.testCases?.length || 0} Test cases
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#00100B]">
                        {q.scoreWeight || 10} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 text-xs font-bold text-[#2E2D4D] hover:text-[#00100B]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || selectedQuestions.length === 0}
            className="px-8 py-4 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-sm font-bold rounded-2xl neo-button flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#52B788]" />
                <span>Publish Assessment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </RecruiterLayout>
  );
}
