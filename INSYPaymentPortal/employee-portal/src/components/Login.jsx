import React, { useState } from 'react';
import axiosInstance from '../interfaces/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './EmployeeLogin.css'; 

export default function EmployeeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Attempting login for:', username);
      console.log('📡 Axios baseURL:', axiosInstance.defaults.baseURL);
      
     const res = await axiosInstance.post('/employee/login', {  
        username: username.trim(), 
        password: password.trim()
      });
      
      console.log('✅ Login successful:', res.data);
      
      if (!res.data.token || !res.data.role) {
        throw new Error('Invalid response from server');
      }
      
      // Store authentication data
      localStorage.setItem('employeeToken', res.data.token);
      localStorage.setItem('employeeRole', res.data.role);
      localStorage.setItem('employeeUser', JSON.stringify(res.data.user));
      
      // Redirect based on role
      if (res.data.role === 'employee') {
        navigate('/employee/dashboard');
      } else if (res.data.role === 'admin' || res.data.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        setError('Unknown user role');
      }
      
    } catch (err) {
      console.error('❌ Login error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      // Handle different types of errors
      if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (err.code === 'CERT_ERR' || err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        errorMessage = 'SSL certificate error. Trying alternative connection...';
        
        // Try HTTP as fallback
        await tryHttpFallback();
        return;
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Login endpoint not found. Please check the server configuration.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const tryHttpFallback = async () => {
    try {
      console.log('🔄 Trying HTTP fallback...');
      const httpRes = await fetch('http://localhost:3000/v1/employee/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        })
      });
      
      if (!httpRes.ok) {
        throw new Error(`HTTP error! status: ${httpRes.status}`);
      }
      
      const data = await httpRes.json();
      console.log('✅ HTTP login successful:', data);
      
      if (!data.token || !data.role) {
        throw new Error('Invalid response from HTTP fallback');
      }
      
      // Store authentication data
      localStorage.setItem('employeeToken', data.token);
      localStorage.setItem('employeeRole', data.role);
      localStorage.setItem('employeeUser', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.role === 'employee') {
        navigate('/employee/dashboard');
      } else if (data.role === 'admin' || data.role === 'superadmin') {
        navigate('/admin/dashboard');
      }
      
    } catch (httpErr) {
      console.error('❌ HTTP fallback also failed:', httpErr);
      setError('Cannot connect to server. Please ensure the backend is running on http://localhost:3000');
    }
  };

  // Your JSX remains the same...
  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">🏦</div>
            <h1>Enterprise Portal</h1>
          </div>
          <p className="login-subtitle">Secure Employee Access</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
              className="form-input"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="form-input"
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Authenticating...
              </>
            ) : (
              'Secure Login'
            )}
          </button>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <strong>Authentication Failed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="login-footer">
            <div className="security-notice">
              <div className="security-icon">🔒</div>
              <span>Protected by enterprise-grade security</span>
            </div>
            
            {/* Add connection troubleshooting info */}
            <div className="connection-info">
              <small>Backend: {axiosInstance.defaults.baseURL}</small>
            </div>
          </div>
        </form>
      </div>

      <div className="login-side-panel">
        <div className="side-panel-content">
          <h2>Welcome Back</h2>
          <p>Access your enterprise dashboard and manage your workflow efficiently.</p>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <strong>Dashboard Access</strong>
                <span>Monitor your activities</span>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <strong>Quick Navigation</strong>
                <span>Access tools instantly</span>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div className="feature-text">
                <strong>Secure Environment</strong>
                <span>Enterprise protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}