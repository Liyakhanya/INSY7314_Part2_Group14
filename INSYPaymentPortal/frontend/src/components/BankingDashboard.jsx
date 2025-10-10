
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InternationalPaymentForm from './InternationalPaymentForm';
import { paymentService } from '../services/paymentService';
import './BankingDashboard.css';

const BankingDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('create');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('bankingUser') || '{}');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setIsLoading(true);
            const response = await paymentService.getPayments();
            
            if (response.success) {
                setPayments(response.payments);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            setMessage('Failed to load payments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentCreated = (newPayment) => {
        setPayments(prev => [newPayment, ...prev]);
        setActiveTab('history');
        setMessage('Payment created successfully!');
        
        setTimeout(() => setMessage(''), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem('bankingToken');
        localStorage.removeItem('bankingUser');
        navigate('/login');
    };

    const formatAmount = (amount, currency) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return formatter.format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'status-pending', label: 'Pending Verification' },
            verified: { class: 'status-verified', label: 'Verified' },
            submitted: { class: 'status-submitted', label: 'Submitted to SWIFT' },
            completed: { class: 'status-completed', label: 'Completed' },
            rejected: { class: 'status-rejected', label: 'Rejected' }
        };
        
        const config = statusConfig[status] || { class: 'status-pending', label: status };
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    return (
        <div className="banking-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="bank-logo">
                        <h1>International Payments Portal</h1>
                    </div>
                    <div className="user-info">
                        <span>Welcome, <strong>{user.fullName}</strong></span>
                        <span className="account-number">Acc: {user.accountNumber}</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </header>

            {/* Main Content - Fixed full width */}
            <main className="dashboard-content">
                {/* Navigation Tabs */}
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        💸 Create Payment
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📊 Payment History
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'create' && (
                        <div className="create-payment-tab">
                            <InternationalPaymentForm onPaymentCreated={handlePaymentCreated} />
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="payment-history-tab">
                            <div className="section-header">
                                <h2>Payment History</h2>
                                <p>Your international payment transactions</p>
                            </div>

                            {isLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading payments...</p>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">💸</div>
                                    <h3>No Payments Yet</h3>
                                    <p>Create your first international payment to get started.</p>
                                    <button 
                                        onClick={() => setActiveTab('create')}
                                        className="create-first-payment-btn"
                                    >
                                        Create First Payment
                                    </button>
                                </div>
                            ) : (
                                <div className="payments-table-container">
                                    <div className="table-responsive">
                                        <table className="payments-table">
                                            <thead>
                                                <tr>
                                                    <th>Reference</th>
                                                    <th>Amount</th>
                                                    <th>Beneficiary</th>
                                                    <th>Bank & SWIFT</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map(payment => (
                                                    <tr key={payment.id} className="payment-row">
                                                        <td>
                                                            <div className="reference-cell">
                                                                <strong>{payment.reference}</strong>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="amount-cell">
                                                                <span className="amount">
                                                                    {formatAmount(payment.amount, payment.currency)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="beneficiary-cell">
                                                                <strong>{payment.payeeName}</strong>
                                                                <span className="account">
                                                                    {payment.payeeAccount}
                                                                </span>
                                                                <span className="country">
                                                                    {payment.payeeCountry}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="bank-cell">
                                                                <span className="bank-name">
                                                                    {payment.payeeBank}
                                                                </span>
                                                                <span className="swift-code">
                                                                    {payment.swiftCode}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {getStatusBadge(payment.status)}
                                                        </td>
                                                        <td>
                                                            <div className="date-cell">
                                                                {formatDate(payment.createdAt)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="payments-summary">
                                        <div className="summary-item">
                                            <span className="summary-label">Total Payments</span>
                                            <span className="summary-value">{payments.length}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Pending</span>
                                            <span className="summary-value">
                                                {payments.filter(p => p.status === 'pending').length}
                                            </span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Completed</span>
                                            <span className="summary-value">
                                                {payments.filter(p => p.status === 'completed').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {message && (
                    <div className="dashboard-message success">
                        {message}
                    </div>
                )}
            </main>

            {/* Security Footer */}
            <footer className="dashboard-footer">
                <div className="security-notice">
                    <p>🔒 Your banking activities are protected with bank-level security and encryption</p>
                </div>
            </footer>
        </div>
    );
};

export default BankingDashboard;