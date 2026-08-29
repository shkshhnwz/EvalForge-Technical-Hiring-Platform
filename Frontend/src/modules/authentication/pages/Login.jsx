import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import '../styles/authentication.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Logging in with:', formData);
      alert('Login successful! (Simulated)');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card vertical-card">
        <div className="auth-card-header">
          <div className="auth-badge">WELCOME BACK</div>
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Sign in to continue to your EvalForge technical hiring journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form vertical-form-layout" noValidate>
          <AuthInput
            label="EMAIL ADDRESS"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            error={errors.email}
          />

          <PasswordInput
            label="PASSWORD"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
          />

          <div className="auth-form-options">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="auth-checkbox"
              />
              <span className="auth-checkbox-text">Remember me</span>
            </label>
            <button type="button" className="auth-forgot-password" onClick={(e) => { e.preventDefault(); alert("Forgot password clicked."); }}>
              Forgot password?
            </button>
          </div>

          <div className="auth-form-footer">
            <button type="submit" className="auth-btn auth-btn-primary">
              Login
            </button>

            <div className="auth-navigation">
              <span className="auth-nav-text">Don't have an account?</span>
              <button type="button" onClick={() => navigate('/signup')} className="auth-btn-link">
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
