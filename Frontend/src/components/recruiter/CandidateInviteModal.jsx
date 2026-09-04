import React, { useState } from 'react';
import api from '../../services/api';
import { 
  X, 
  Copy, 
  Check, 
  Mail, 
  Upload, 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon 
} from 'lucide-react';

export default function CandidateInviteModal({ assessment, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'email' | 'csv' | 'reminder'
  const [copied, setCopied] = useState(false);
  
  // Bulk Email State
  const [emailListText, setEmailListText] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);

  // CSV State
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(null);

  // Reminder State
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(null);

  const [error, setError] = useState(null);

  if (!isOpen || !assessment) return null;

  const inviteUrl = `${window.location.origin}/join/${assessment.inviteToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bulk Email Invites
  const handleSendEmailInvites = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailSuccess(null);

    const candidateLines = emailListText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    if (candidateLines.length === 0) {
      setError('Please provide at least one candidate (Name, email).');
      return;
    }

    const candidates = candidateLines.map(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        return { name: parts[0].trim(), email: parts[1].trim() };
      }
      return { name: line.split('@')[0], email: line.trim() };
    });

    setEmailLoading(true);
    try {
      const res = await api.post(`/api/assessments/${assessment._id}/invite/email`, { candidates });
      setEmailSuccess(res.message || `Successfully sent ${candidates.length} email invitations.`);
      setEmailListText('');
    } catch (err) {
      setError(err.message || 'Failed to dispatch email invitations.');
    } finally {
      setEmailLoading(false);
    }
  };

  // CSV File Upload
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file first.');
      return;
    }

    setError(null);
    setCsvSuccess(null);
    setCsvLoading(true);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.upload(`/api/assessments/${assessment._id}/invite/csv`, formData);
      setCsvSuccess(res.message || 'CSV candidates imported and invitations dispatched.');
      setCsvFile(null);
    } catch (err) {
      setError(err.message || 'Failed to process CSV file.');
    } finally {
      setCsvLoading(false);
    }
  };

  // Dispatch Reminders
  const handleSendReminders = async () => {
    setError(null);
    setReminderSuccess(null);
    setReminderLoading(true);

    try {
      const res = await api.post(`/api/assessments/${assessment._id}/remind`, {});
      setReminderSuccess(res.message || 'Reminder emails dispatched successfully.');
    } catch (err) {
      setError(err.message || 'Failed to send assessment reminders.');
    } finally {
      setReminderLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl neo-card p-6 md:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-[#2E2D4D] hover:bg-black/5 hover:text-[#00100B] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <span className="inline-block bg-[#52B788] text-[#00100B] px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
            Invite Candidates
          </span>
          <h2 className="text-xl font-black text-[#00100B] tracking-tight truncate pr-8">
            {assessment.title}
          </h2>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/5 rounded-2xl mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('link')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'link' ? 'bg-[#00100B] text-[#FCFFF7]' : 'text-[#2E2D4D] hover:text-[#00100B]'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'email' ? 'bg-[#00100B] text-[#FCFFF7]' : 'text-[#2E2D4D] hover:text-[#00100B]'
            }`}
          >
            Bulk Email
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'csv' ? 'bg-[#00100B] text-[#FCFFF7]' : 'text-[#2E2D4D] hover:text-[#00100B]'
            }`}
          >
            CSV Upload
          </button>
          <button
            onClick={() => setActiveTab('reminder')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'reminder' ? 'bg-[#00100B] text-[#FCFFF7]' : 'text-[#2E2D4D] hover:text-[#00100B]'
            }`}
          >
            Reminders
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Direct Link */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <p className="text-xs text-[#2E2D4D] font-medium leading-relaxed">
              Share this unique link with candidates. Anyone with the link can join the assessment and submit solutions.
            </p>
            <div className="flex items-center gap-2 bg-[#FCFFF7] border-2 border-[#00100B] rounded-2xl p-2 pl-4">
              <LinkIcon className="w-4 h-4 text-[#2E2D4D] shrink-0" />
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full text-xs font-mono bg-transparent outline-hidden text-[#00100B]"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button shrink-0 flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#52B788]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Bulk Email */}
        {activeTab === 'email' && (
          <form onSubmit={handleSendEmailInvites} className="space-y-4">
            <p className="text-xs text-[#2E2D4D] font-medium">
              Enter candidates (one per line, format: <code>Candidate Name, email@domain.com</code>):
            </p>
            <textarea
              rows={4}
              value={emailListText}
              onChange={(e) => setEmailListText(e.target.value)}
              placeholder="Sarah Connor, sarah@cyberdyne.com&#10;John Smith, john@example.com"
              className="w-full p-3 text-xs font-mono bg-[#FCFFF7] border-2 border-[#00100B] rounded-2xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
            />
            {emailSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                <span>{emailSuccess}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full py-3 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {emailLoading ? 'Sending Emails...' : 'Send Bulk Invitations'}
            </button>
          </form>
        )}

        {/* Tab 3: CSV Upload */}
        {activeTab === 'csv' && (
          <form onSubmit={handleCsvUpload} className="space-y-4">
            <p className="text-xs text-[#2E2D4D] font-medium">
              Upload a <code>.csv</code> file with columns <code>name</code> and <code>email</code>.
            </p>
            <div className="border-2 border-dashed border-[#00100B] rounded-2xl p-6 text-center space-y-2 hover:bg-black/5 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 mx-auto text-[#2E2D4D]" />
              <p className="text-xs font-bold text-[#00100B]">
                {csvFile ? csvFile.name : 'Click or drop candidate CSV file here'}
              </p>
              <span className="text-[10px] text-[#2E2D4D] block">Max file size 5MB</span>
            </div>
            {csvSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                <span>{csvSuccess}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={csvLoading || !csvFile}
              className="w-full py-3 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {csvLoading ? 'Uploading and Dispathing...' : 'Upload & Dispatch Invites'}
            </button>
          </form>
        )}

        {/* Tab 4: Reminders */}
        {activeTab === 'reminder' && (
          <div className="space-y-4">
            <p className="text-xs text-[#2E2D4D] font-medium leading-relaxed">
              Dispatch an automated reminder email to candidates who have been invited but have not yet submitted their assessment.
            </p>
            {reminderSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                <span>{reminderSuccess}</span>
              </div>
            )}
            <button
              onClick={handleSendReminders}
              disabled={reminderLoading}
              className="w-full py-3 bg-[#FFE900] hover:bg-yellow-400 text-[#00100B] text-xs font-extrabold rounded-xl neo-button flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              <span>{reminderLoading ? 'Sending Reminders...' : 'Send Assessment Reminders Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
