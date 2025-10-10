import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import './BankingLogin.css';

const BankingLogin = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validationPatterns = {
        username: /^[a-zA-Z0-9_]{3,30}$/,
        accountNumber: /^[A-Z0-9]{8,34}$/,
        password: /^.{1,}$/
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage('');

        try {
            const response = await axios.post('/api/auth/login', {
                username: data.username,
                accountNumber: data.accountNumber,
                password: data.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                localStorage.setItem('bankingToken', response.data.token);
                localStorage.setItem('bankingUser', JSON.stringify(response.data.customer));
                
                setMessage('✅ Login successful! Redirecting to dashboard...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || '❌ Login failed. Please check your credentials.';
            setMessage(errorMessage);
            
            if (error.response?.status === 401) {
                setTimeout(() => {
                    setMessage('');
                }, 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="banking-login-container">
            <div className="banking-login-form">
                <div className="banking-header">
                    <h2>Secure Banking Login</h2>
                    <p>Access your international payments portal</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            {...register('username', { 
                                required: 'Username is required',
                                pattern: {
                                    value: validationPatterns.username,
                                    message: 'Username must be 3-30 characters (letters, numbers, underscores)'
                                }
                            })} 
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                        {errors.username && <span className="error">{errors.username.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Bank Account Number</label>
                        <input 
                            type="text" 
                            {...register('accountNumber', { 
                                required: 'Account number is required',
                                pattern: {
                                    value: validationPatterns.accountNumber,
                                    message: 'Account number must be 8-34 alphanumeric characters'
                                }
                            })} 
                            placeholder="Enter your account number"
                            autoComplete="off"
                        />
                        {errors.accountNumber && <span className="error">{errors.accountNumber.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            {...register('password', { 
                                required: 'Password is required'
                            })} 
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                        {errors.password && <span className="error">{errors.password.message}</span>}
                    </div>

                    <button type="submit" disabled={isLoading} className="login-btn">
                        {isLoading ? (
                            <>
                                <div className="loading-spinner"></div>
                                Signing In...
                            </>
                        ) : (
                            'Secure Login'
                        )}
                    </button>
                </form>

                {message && (
                    <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="register-link">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>

                <div className="security-features">
                    <h4>🔒 Security Features</h4>
                    <ul>
                        <li>End-to-end encryption</li>
                        <li>Rate-limited authentication</li>
                        <li>Session timeout protection</li>
                        <li>Secure token-based authentication</li>
                        <li>Real-time fraud monitoring</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BankingLogin;