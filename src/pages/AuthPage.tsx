import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import telescope_logo from '../assets/images/telescope_no_background.png';
import api from '../api';

type AuthMode = 'login' | 'register' | 'forgotPassword' | 'changeUsername' | 'changeEmail' | 'changePassword';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    old_email: '',
    new_email: '',
    old_username: '',
    new_username: '',
    password: '',
    old_password: '',
    new_password: '',
    loginData: '' // for login (can be username or email)
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    let endpoint = '';
    let payload = {};
    let successMessage = '';
    let method: 'post' | 'put' = 'post'; // Добавляем переменную для метода

    switch (mode) {
      case 'login':
        endpoint = '/api/auth/login';
        method = 'post';
        payload = {
          loginData: formData.loginData,
          password: formData.password
        };
        successMessage = 'Login successful';
        break;
      case 'register':
        endpoint = '/api/auth/register';
        method = 'post';
        payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password
        };
        successMessage = 'Registration successful';
        break;
      case 'forgotPassword':
        endpoint = '/api/auth/forgotPassword';
        method = 'post';
        payload = {
          email: formData.email
        };
        successMessage = 'If the email exists, a new password has been sent';
        break;
      case 'changeUsername':
        endpoint = '/api/auth/username';
        method = 'put'; // Меняем на PUT
        payload = {
          old_username: formData.old_username,
          new_username: formData.new_username,
          email: formData.email,
          password: formData.password
        };
        successMessage = 'Username changed successfully';
        break;
      case 'changeEmail':
        endpoint = '/api/auth/email';
        method = 'put'; // Меняем на PUT
        payload = {
          username: formData.username,
          old_email: formData.old_email,
          new_email: formData.new_email,
          password: formData.password
        };
        successMessage = 'Email changed successfully';
        break;
      case 'changePassword':
        endpoint = '/api/auth/password';
        method = 'put'; // Меняем на PUT
        payload = {
          username: formData.username,
          email: formData.email,
          old_password: formData.old_password,
          new_password: formData.new_password
        };
        successMessage = 'Password changed successfully';
        break;
    }

    // Изменяем вызов api в зависимости от метода
    const response = method === 'post' 
      ? await api.post(endpoint, payload)
      : await api.put(endpoint, payload);
      
      if (mode === 'login' || mode === 'register') {
        
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        
        navigate('/');
      } else {
        setError(`Success: ${successMessage}`);
        
        setFormData({
          username: '',
          email: '',
          old_email: '',
          new_email: '',
          old_username: '',
          new_username: '',
          password: '',
          old_password: '',
          new_password: '',
          loginData: ''
        });
        
        if (mode === 'changePassword' || mode === 'forgotPassword') {
          setTimeout(() => setMode('login'), 2000);
        }
        
        if (mode === 'changeUsername' && response.data.username) {
          setFormData(prev => ({
            ...prev,
            old_username: response.data.username
          }));
        }
        
        if (mode === 'changeEmail' && response.data.email) {
          setFormData(prev => ({
            ...prev,
            old_email: response.data.email
          }));
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Operation failed';
      
      if (mode === 'changeUsername' && error.response?.status === 409) {
        setError(`Error: Username already exists. Please choose another one.`);
        setFormData(prev => ({
          ...prev,
          new_username: ''
        }));
      } else if (mode === 'changeEmail' && error.response?.status === 409) {
        setError(`Error: Email already exists. Please choose another one.`);
        setFormData(prev => ({
          ...prev,
          new_email: ''
        }));
      } else {
        setError(`Error: ${errorMessage}`);
      }
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <div className="form-group">
              <label>Username or Email:</label>
              <input
                type="text"
                name="loginData"
                value={formData.loginData}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <button type="button" onClick={() => setMode('forgotPassword')} className="auth-link">
              Forgot Password?
            </button>
          </>
        );
      case 'register':
        return (
          <>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </>
        );
      case 'forgotPassword':
        return (
          <>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <p className="auth-info">
              We'll send a new password to your email if it exists in our system.
            </p>
          </>
        );
      case 'changeUsername':
        return (
          <>
            <div className="form-group">
              <label>Current Username:</label>
              <input
                type="text"
                name="old_username"
                value={formData.old_username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>New Username:</label>
              <input
                type="text"
                name="new_username"
                value={formData.new_username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </>
        );
      case 'changeEmail':
        return (
          <>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Current Email:</label>
              <input
                type="email"
                name="old_email"
                value={formData.old_email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>New Email:</label>
              <input
                type="email"
                name="new_email"
                value={formData.new_email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </>
        );
      case 'changePassword':
        return (
          <>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Current Password:</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>New Password:</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img 
          src={telescope_logo} 
          alt="Telescope Logo" 
          className="auth-logo"
          style={{ 
            width: '80px',
            height: 'auto',
            objectFit: 'contain'
          }} 
        />
        <h1 className="auth-welcome">Welcome to Telescope</h1>
      </div>
      <div className="auth-card">
        <h2>
          {mode === 'login' && 'Login'}
          {mode === 'register' && 'Register'}
          {mode === 'forgotPassword' && 'Reset Password'}
          {mode === 'changeUsername' && 'Change Username'}
          {mode === 'changeEmail' && 'Change Email'}
          {mode === 'changePassword' && 'Change Password'}
        </h2>
        {error && <div className={`message ${error.startsWith('Success') ? 'success-message' : 'error-message'}`}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {renderForm()}
          
          <button type="submit" className="auth-button">
            {mode === 'login' && 'Login'}
            {mode === 'register' && 'Register'}
            {mode === 'forgotPassword' && 'Send New Password'}
            {mode === 'changeUsername' && 'Change Username'}
            {mode === 'changeEmail' && 'Change Email'}
            {mode === 'changePassword' && 'Change Password'}
          </button>
        </form>
        
        <div className="auth-switch">
          {mode === 'login' && (
            <>
              <p>Don't have an account? <button onClick={() => setMode('register')} className="auth-link">Register</button></p>
              <p>
                <button onClick={() => setMode('changeUsername')} className="auth-link">Change Username</button> | 
                <button onClick={() => setMode('changeEmail')} className="auth-link">Change Email</button> | 
                <button onClick={() => setMode('changePassword')} className="auth-link">Change Password</button>
              </p>
            </>
          )}
          {mode === 'register' && (
            <p>Already have an account? <button onClick={() => setMode('login')} className="auth-link">Login</button></p>
          )}
          {(mode === 'forgotPassword' || mode === 'changeUsername' || mode === 'changeEmail' || mode === 'changePassword') && (
            <p>Remember your credentials? <button onClick={() => setMode('login')} className="auth-link">Back to Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;  