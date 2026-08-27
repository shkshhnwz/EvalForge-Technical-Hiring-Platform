import React from 'react';
import '../styles/authentication.css';

const RoleSelector = ({ value, onChange, error }) => {
  return (
    <div className="auth-input-group">
      <label className="auth-label" htmlFor="role">Role (if applicable)</label>
      <div className="auth-select-wrapper">
        <select 
          id="role" 
          name="role" 
          className={`auth-input auth-select ${error ? 'input-error' : ''}`}
          value={value}
          onChange={onChange}
        >
          <option value="">Select a role</option>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <div className="auth-select-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      {error && <span className="auth-error-message">{error}</span>}
    </div>
  );
};

export default RoleSelector;
