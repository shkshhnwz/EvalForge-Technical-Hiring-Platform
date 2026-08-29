import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PasswordInput from '../components/PasswordInput';
import RoleSelector from '../components/RoleSelector';
import '../styles/authentication.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Signing up with:', formData);
      navigate('/login');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card vertical-card">
        <div className="auth-card-header">
          <div className="auth-badge">GET STARTED</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join EvalForge to discover and hire top engineering talent.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form vertical-form-layout" noValidate>
          <AuthInput
            label="FULL NAME"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            error={errors.fullName}
          />

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
            placeholder="Create a password"
            error={errors.password}
          />

          <PasswordInput
            label="CONFIRM PASSWORD"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
          />

          <RoleSelector
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
          />

          <div className="auth-form-footer">
            <button type="submit" className="auth-btn auth-btn-primary">
              Create Account
            </button>
            
            <div className="auth-navigation">
              <span className="auth-nav-text">Already have an account?</span>
              <button type="button" onClick={() => navigate('/login')} className="auth-btn-link">
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
