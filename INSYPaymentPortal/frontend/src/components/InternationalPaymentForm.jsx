import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { paymentService } from '../services/paymentService';
import './InternationalPaymentForm.css';

const InternationalPaymentForm = ({ onPaymentCreated }) => {
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Enhanced validation patterns
    const validationPatterns = {
        amount: /^\d+(\.\d{1,2})?$/,
        payeeAccount: /^[A-Z0-9]{8,34}$/,
        swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
        name: /^[a-zA-Z\s]{2,100}$/,
        country: /^[a-zA-Z\s]{2,50}$/,
        reference: /^[A-Z0-9\s-]{0,35}$/
    };

    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' }
    ];

    const commonBanks = [
        { name: 'Standard Bank', swift: 'SBZAZAJJ', country: 'South Africa' },
        { name: 'FirstRand Bank', swift: 'FIRNZAJJ', country: 'South Africa' },
        { name: 'Nedbank', swift: 'NEDSZAJJ', country: 'South Africa' },
        { name: 'Absa Bank', swift: 'ABSAZAJJ', country: 'South Africa' },
        { name: 'Capitec Bank', swift: 'CAPLZAJ1', country: 'South Africa' },
        { name: 'Bank of America', swift: 'BOFAUS3N', country: 'United States' },
        { name: 'Barclays Bank', swift: 'BARCGB22', country: 'United Kingdom' },
        { name: 'Deutsche Bank', swift: 'DEUTDEFF', country: 'Germany' }
    ];

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage('');

        try {
            const response = await paymentService.createPayment(data);

            if (response.success) {
                setMessage('✅ International payment created successfully! Awaiting verification.');
                reset(); // Clear form
                if (onPaymentCreated) {
                    onPaymentCreated(response.payment);
                }
                
                // Auto-clear success message after 5 seconds
                setTimeout(() => {
                    setMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            const errorMessage = error.response?.data?.error || 'Payment creation failed. Please try again.';
            setMessage(`❌ ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBankSelect = (e) => {
        const selectedBank = commonBanks.find(bank => bank.name === e.target.value);
        if (selectedBank) {
            // You can set the SWIFT code automatically here using setValue from react-hook-form
            console.log('Selected bank SWIFT:', selectedBank.swift);
            // For now, we'll just log it. In a real app, you'd set the swift code field
        }
    };

    const amount = watch('amount');
    const currency = watch('currency');

    return (
        <div className="international-payment-form">
            <div className="payment-header">
                <h2>🌍 Create International Payment</h2>
                <p>Send money securely worldwide via SWIFT network</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Payment Details Section */}
                <div className="form-section">
                    <h3>💰 Payment Details</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount *</label>
                            <div className="amount-input-container">
                                <span className="currency-symbol">
                                    {currencies.find(c => c.code === currency)?.symbol || '$'}
                                </span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    min="0.01"
                                    {...register('amount', { 
                                        required: 'Amount is required',
                                        pattern: {
                                            value: validationPatterns.amount,
                                            message: 'Invalid amount format'
                                        },
                                        min: {
                                            value: 0.01,
                                            message: 'Amount must be greater than 0'
                                        },
                                        validate: {
                                            maxDecimals: value => {
                                                const decimalPart = value.toString().split('.')[1];
                                                return !decimalPart || decimalPart.length <= 2 || 'Maximum 2 decimal places allowed';
                                            }
                                        }
                                    })} 
                                    placeholder="0.00"
                                    className="amount-input"
                                />
                            </div>
                            {errors.amount && <span className="error">{errors.amount.message}</span>}
                        </div>

                        <div className="form-group">
                            <label>Currency *</label>
                            <select 
                                {...register('currency', { 
                                    required: 'Currency is required'
                                })}
                            >
                                <option value="">Select Currency</option>
                                {currencies.map(currency => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.code} - {currency.name}
                                    </option>
                                ))}
                            </select>
                            {errors.currency && <span className="error">{errors.currency.message}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Payment Reference (Optional)</label>
                        <input 
                            type="text" 
                            {...register('reference', { 
                                pattern: {
                                    value: validationPatterns.reference,
                                    message: 'Reference can only contain letters, numbers, spaces and hyphens'
                                },
                                maxLength: {
                                    value: 35,
                                    message: 'Reference must be less than 35 characters'
                                }
                            })} 
                            placeholder="e.g., Invoice #12345"
                        />
                        {errors.reference && <span className="error">{errors.reference.message}</span>}
                        <small className="help-text">Maximum 35 characters. Leave blank for auto-generation.</small>
                    </div>
                </div>

                {/* Beneficiary Details Section */}
                <div className="form-section">
                    <h3>👤 Beneficiary Details</h3>
                    
                    <div className="form-group">
                        <label>Payee Full Name *</label>
                        <input 
                            type="text" 
                            {...register('payeeName', { 
                                required: 'Payee name is required',
                                pattern: {
                                    value: validationPatterns.name,
                                    message: 'Payee name must be 2-100 letters and spaces only'
                                }
                            })} 
                            placeholder="Enter beneficiary's full legal name"
                        />
                        {errors.payeeName && <span className="error">{errors.payeeName.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Payee Account Number *</label>
                        <input 
                            type="text" 
                            {...register('payeeAccount', { 
                                required: 'Account number is required',
                                pattern: {
                                    value: validationPatterns.payeeAccount,
                                    message: 'Account number must be 8-34 alphanumeric characters'
                                }
                            })} 
                            placeholder="Enter beneficiary account number"
                        />
                        {errors.payeeAccount && <span className="error">{errors.payeeAccount.message}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Bank Name *</label>
                            <input 
                                type="text" 
                                list="banks"
                                {...register('payeeBank', { 
                                    required: 'Bank name is required',
                                    pattern: {
                                        value: validationPatterns.name,
                                        message: 'Bank name must be 2-100 letters and spaces only'
                                    }
                                })} 
                                placeholder="Enter bank name"
                                onChange={handleBankSelect}
                            />
                            <datalist id="banks">
                                {commonBanks.map(bank => (
                                    <option key={bank.swift} value={bank.name} />
                                ))}
                            </datalist>
                            {errors.payeeBank && <span className="error">{errors.payeeBank.message}</span>}
                        </div>

                        <div className="form-group">
                            <label>SWIFT/BIC Code *</label>
                            <input 
                                type="text" 
                                {...register('swiftCode', { 
                                    required: 'SWIFT code is required',
                                    pattern: {
                                        value: validationPatterns.swiftCode,
                                        message: 'SWIFT code must be 8 or 11 characters (e.g., SBZAZAJJ)'
                                    }
                                })} 
                                placeholder="e.g., SBZAZAJJ"
                                style={{ textTransform: 'uppercase' }}
                            />
                            {errors.swiftCode && <span className="error">{errors.swiftCode.message}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Beneficiary Country *</label>
                        <input 
                            type="text" 
                            {...register('payeeCountry', { 
                                required: 'Country is required',
                                pattern: {
                                    value: validationPatterns.country,
                                    message: 'Country must be 2-50 letters and spaces only'
                                }
                            })} 
                            placeholder="Enter country name"
                        />
                        {errors.payeeCountry && <span className="error">{errors.payeeCountry.message}</span>}
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="submit-payment-btn">
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Processing Payment...
                        </>
                    ) : (
                        '🚀 Create International Payment'
                    )}
                </button>
            </form>

            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <div className="security-info">
                <h4>🔒 Secure SWIFT Transfer</h4>
                <ul>
                    <li>All transactions are encrypted end-to-end</li>
                    <li>Payments verified by banking staff</li>
                    <li>SWIFT network security compliance</li>
                    <li>Real-time transaction tracking</li>
                    <li>Bank-level fraud protection</li>
                </ul>
            </div>
        </div>
    );
};

export default InternationalPaymentForm;