import React from 'react';
import '../styles/authentication.css';

const AuthInput = ({ label, type = 'text', name, value, onChange, placeholder, error }) => {
  return (
    <div className="auth-input-group">
      <label className="auth-label" htmlFor={name}>{label}</label>
      <input
        className={`auth-input ${error ? 'input-error' : ''}`}
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <span className="auth-error-message">{error}</span>}
    </div>
  );
};

export default AuthInput;
