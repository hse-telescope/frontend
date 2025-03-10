import React, { useState } from 'react';
import axios from 'axios';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (userId: number) => void;
}

interface AuthResponse {
  id: number;
  message?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? 'http://localhost:8080/login' : 'http://localhost:8080/register';
    try {
      const response = await axios.post<AuthResponse>(endpoint, { username, password });
      console.log(response)
      if (response.data.id) {
        onLoginSuccess(response.data.id);
        onClose();
      }
    } catch (err) {
        console.log(err)
      setError('Failed to authenticate. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  marginLeft: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need to register?' : 'Already have an account?'}
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AuthModal;