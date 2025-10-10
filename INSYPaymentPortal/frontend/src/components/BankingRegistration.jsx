import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './BankingRegistration.css';

const BankingRegistration = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Enhanced validation patterns
    const validationPatterns = {
        fullName: /^[a-zA-Z\s]{2,100}$/,
        idNumber: /^[A-Z0-9-]{5,20}$/,
        accountNumber: /^[A-Z0-9]{8,34}$/,
        username: /^[a-zA-Z0-9_]{3,30}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage('');
        
        try {
            const response = await axios.post('http://localhost:3000/v1/auth/register', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setMessage('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage(error.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const password = watch('password');

    return (
        <div className="banking-registration-container">
            <div className="banking-registration-form">
                <div className="banking-header">
                    <h2>International Banking Registration</h2>
                    <p>Create your secure banking account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Full Legal Name *</label>
                        <input 
                            type="text" 
                            {...register('fullName', { 
                                required: 'Full name is required',
                                pattern: {
                                    value: validationPatterns.fullName,
                                    message: 'Name must be 2-100 letters and spaces only'
                                }
                            })} 
                            placeholder="Enter your full legal name"
                        />
                        {errors.fullName && <span className="error">{errors.fullName.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>ID/Passport Number *</label>
                        <input 
                            type="text" 
                            {...register('idNumber', { 
                                required: 'ID number is required',
                                pattern: {
                                    value: validationPatterns.idNumber,
                                    message: 'ID must be 5-20 alphanumeric characters and hyphens'
                                }
                            })} 
                            placeholder="Enter your ID or passport number"
                        />
                        {errors.idNumber && <span className="error">{errors.idNumber.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Bank Account Number *</label>
                        <input 
                            type="text" 
                            {...register('accountNumber', { 
                                required: 'Account number is required',
                                pattern: {
                                    value: validationPatterns.accountNumber,
                                    message: 'Account number must be 8-34 alphanumeric characters'
                                }
                            })} 
                            placeholder="Enter your bank account number"
                        />
                        {errors.accountNumber && <span className="error">{errors.accountNumber.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Username *</label>
                        <input 
                            type="text" 
                            {...register('username', { 
                                required: 'Username is required',
                                pattern: {
                                    value: validationPatterns.username,
                                    message: 'Username must be 3-30 characters (letters, numbers, underscores)'
                                }
                            })} 
                            placeholder="Choose a username"
                        />
                        {errors.username && <span className="error">{errors.username.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Password *</label>
                        <input 
                            type="password" 
                            {...register('password', { 
                                required: 'Password is required',
                                pattern: {
                                    value: validationPatterns.password,
                                    message: 'Password must be at least 12 characters with uppercase, lowercase, number and special character'
                                }
                            })} 
                            placeholder="Create a strong password"
                        />
                        {errors.password && <span className="error">{errors.password.message}</span>}
                        
                        <div className="password-requirements">
                            <h4>Password Requirements:</h4>
                            <ul>
                                <li className={password?.length >= 12 ? 'met' : ''}>At least 12 characters</li>
                                <li className={/[a-z]/.test(password) ? 'met' : ''}>One lowercase letter</li>
                                <li className={/[A-Z]/.test(password) ? 'met' : ''}>One uppercase letter</li>
                                <li className={/\d/.test(password) ? 'met' : ''}>One number</li>
                                <li className={/[@$!%*?&]/.test(password) ? 'met' : ''}>One special character (@$!%*?&)</li>
                            </ul>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="submit-btn">
                        {isLoading ? 'Creating Account...' : 'Create Banking Account'}
                    </button>
                </form>

                {message && (
                    <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="login-link">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>

                <div className="security-notice">
                    <p>Your information is secured with bank-level encryption</p>
                </div>
            </div>
        </div>
    );
};

export default BankingRegistration;