import React, { useState, useEffect } from 'react';
import RecruiterLayout from '../../components/layouts/RecruiterLayout';
import api from '../../services/api';
import { 
  Plus, 
  Search, 
  HelpCircle, 
  Code2, 
  Check, 
  X, 
  AlertCircle, 
  FileCode, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    constraints: '',
    difficulty: 'medium',
    scoreWeight: 10,
    starterCodeJs: 'function solution(input) {\n  // Write your code here\n  return input;\n}',
    starterCodePy: 'def solution(input):\n    # Write your code here\n    return input',
    testCases: [
      { input: '5', expectedOutput: '5', isHidden: false },
      { input: '10', expectedOutput: '10', isHidden: true },
    ]
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/questions');
      setQuestions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch question bank.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = () => {
    setNewQuestion(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const handleRemoveTestCase = (index) => {
    setNewQuestion(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setNewQuestion(prev => {
      const updated = [...prev.testCases];
      updated[index][field] = value;
      return { ...prev, testCases: updated };
    });
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!newQuestion.title || !newQuestion.description) {
      setModalError('Title and description are required.');
      return;
    }

    setCreating(true);
    try {
      await api.post('/api/questions', {
        title: newQuestion.title,
        description: newQuestion.description,
        constraints: newQuestion.constraints,
        difficulty: newQuestion.difficulty,
        scoreWeight: Number(newQuestion.scoreWeight),
        starterCode: {
          javascript: newQuestion.starterCodeJs,
          python: newQuestion.starterCodePy,
        },
        testCases: newQuestion.testCases,
      });

      setIsModalOpen(false);
      fetchQuestions();
      // Reset form
      setNewQuestion({
        title: '',
        description: '',
        constraints: '',
        difficulty: 'medium',
        scoreWeight: 10,
        starterCodeJs: 'function solution(input) {\n  // Write your code here\n  return input;\n}',
        starterCodePy: 'def solution(input):\n    # Write your code here\n    return input',
        testCases: [
          { input: '5', expectedOutput: '5', isHidden: false },
          { input: '10', expectedOutput: '10', isHidden: true },
        ]
      });
    } catch (err) {
      setModalError(err.message || 'Failed to create question.');
    } finally {
      setCreating(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <RecruiterLayout
      title="Question Bank Library"
      subtitle="Standard and custom algorithmic challenges available for your hiring pipeline"
      actions={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button transition-all"
        >
          <Plus className="w-4 h-4 text-[#FFE900]" />
          <span>New Question</span>
        </button>
      }
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword..."
            className="w-full px-4 py-2.5 pl-10 text-xs font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
          />
          <Search className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3" />
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex items-center gap-2 bg-black/5 p-1 rounded-2xl">
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                difficultyFilter === diff
                  ? 'bg-[#00100B] text-[#FCFFF7]'
                  : 'text-[#2E2D4D] hover:text-[#00100B]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#00100B] border-t-[#52B788] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#2E2D4D] uppercase tracking-wider">Loading Challenges...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-[#FCFFF7] border-2 border-dashed border-[#00100B] rounded-3xl p-12 text-center space-y-4">
          <HelpCircle className="w-10 h-10 mx-auto text-[#2E2D4D]" />
          <h3 className="text-lg font-black text-[#00100B]">No questions found</h3>
          <p className="text-xs text-[#2E2D4D] max-w-sm mx-auto">
            {searchQuery || difficultyFilter !== 'all'
              ? 'Try changing your search term or difficulty filters.'
              : 'Add custom coding challenges with starter templates and hidden test cases.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button"
          >
            <Plus className="w-4 h-4 text-[#FFE900]" />
            <span>Create First Question</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map((q) => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-6 neo-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`pill-badge text-[10px] ${
                    q.difficulty === 'easy'
                      ? 'bg-[#52B788] text-[#00100B]'
                      : q.difficulty === 'medium'
                      ? 'bg-[#FFE900] text-[#00100B]'
                      : 'bg-[#2E2D4D] text-[#FCFFF7]'
                  }`}>
                    {q.difficulty}
                  </span>

                  <span className="text-xs font-mono font-black text-[#00100B]">
                    {q.scoreWeight || 10} Points
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#00100B] mb-2">{q.title}</h3>
                <p className="text-xs text-[#2E2D4D] line-clamp-3 leading-relaxed font-medium mb-4">
                  {q.description}
                </p>

                {q.constraints && (
                  <div className="p-2.5 rounded-xl bg-black/5 font-mono text-[11px] text-[#2E2D4D] mb-4">
                    <span className="font-bold text-[#00100B] block mb-0.5 font-sans text-[10px] uppercase tracking-wider">
                      Constraints
                    </span>
                    {q.constraints}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#00100B]/10 text-xs font-medium text-[#2E2D4D]">
                <span>{q.testCases?.length || 0} Test cases (Public & Hidden)</span>
                <span className="text-[11px] font-mono font-bold text-[#52B788]">Judge0 Ready</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl neo-card p-6 md:p-8 my-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#2E2D4D] hover:bg-black/5 hover:text-[#00100B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="inline-block bg-[#FFE900] text-[#00100B] px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                Question Creator
              </span>
              <h2 className="text-xl font-black text-[#00100B]">Add Algorithmic Challenge</h2>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Merge Two Sorted Intervals"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1">
                    Score Weight (Points)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newQuestion.scoreWeight}
                    onChange={(e) => setNewQuestion({ ...newQuestion, scoreWeight: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1">
                  Problem Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the task, expected inputs and edge cases..."
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                  className="w-full p-3 text-xs font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1">
                  Constraints
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 <= n <= 10^5, O(N log N) runtime expected"
                  value={newQuestion.constraints}
                  onChange={(e) => setNewQuestion({ ...newQuestion, constraints: e.target.value })}
                  className="w-full px-4 py-2 text-xs font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl text-[#00100B]"
                />
              </div>

              {/* Test Cases Section */}
              <div className="pt-2 border-t border-[#00100B]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B]">
                    Validation Test Cases
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="text-xs font-bold text-[#00100B] hover:text-[#52B788] underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Case
                  </button>
                </div>

                {newQuestion.testCases.map((tc, idx) => (
                  <div key={idx} className="p-3 bg-black/5 rounded-2xl space-y-2 border border-[#00100B]/10">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#2E2D4D]">
                      <span>Case #{idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                            className="rounded text-[#00100B]"
                          />
                          <span>Hidden from candidate?</span>
                        </label>
                        {newQuestion.testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Input (e.g. [1, 2, 3])"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        className="px-3 py-1.5 text-xs font-mono bg-[#FCFFF7] border border-[#00100B] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Expected Output (e.g. 6)"
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                        className="px-3 py-1.5 text-xs font-mono bg-[#FCFFF7] border border-[#00100B] rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#00100B]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#2E2D4D] hover:text-[#00100B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button disabled:opacity-50"
                >
                  {creating ? 'Saving Question...' : 'Save to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
