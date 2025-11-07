import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingPayments, approvePayment, denyPayment, getPaymentHistory } from '../services/employeeApiService.js';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [message, setMessage] = useState('');
   const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');

  useEffect(() => {
    fetchPending();
    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeRole');
    localStorage.removeItem('employeeUser');
    navigate('/');
  };

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingPayments();
      setPending(res.data.payments || []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setMessage('Failed to load pending payments');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await getPaymentHistory();
      setHistory(res.data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setMessage('Failed to load payment history');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await approvePayment(id);
      await fetchPending();
      await fetchHistory();
      setMessage('Payment approved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error approving payment:', error);
      setMessage('Failed to approve payment');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const handleDeny = async (id) => {
    setLoading(true);
    try {
      await denyPayment(id);
      await fetchPending();
      await fetchHistory();
      setMessage('Payment denied successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error denying payment:', error);
      setMessage('Failed to deny payment');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
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

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { class: 'status-approved', label: 'Approved', icon: '✅' },
      denied: { class: 'status-denied', label: 'Denied', icon: '❌' },
      pending: { class: 'status-pending', label: 'Pending', icon: '⏳' }
    };
    
    const config = statusConfig[status] || { class: 'status-pending', label: status, icon: '⏳' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="bank-logo">
            <h1>Payment Processing Portal</h1>
            <p className="bank-subtitle">Employee Dashboard</p>
          </div>
          <div className="user-info">
            <span>Welcome, <strong>{user.fullName}</strong></span>
            <span className="user-role">Role: {user.role}</span>
            <button onClick={handleLogout} className="logout-btn">
               Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-content">
              <h3>Pending Review</h3>
              <div className="stat-value">{pending.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">💰</div>
            <div className="stat-content">
              <h3>Total Processed</h3>
              <div className="stat-value">{history.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">✅</div>
            <div className="stat-content">
              <h3>Approved</h3>
              <div className="stat-value">
                {history.filter(p => p.status === 'approved').length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending Payments
            {pending.length > 0 && <span className="tab-badge">{pending.length}</span>}
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
          {activeTab === 'pending' && (
            <div className="pending-payments-tab">
              <div className="section-header">
                <h2>Pending Payment Approvals</h2>
                <p>Review and take action on pending international payments</p>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading pending payments...</p>
                </div>
              ) : pending.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>All Clear!</h3>
                  <p>No pending payments require your attention.</p>
                </div>
              ) : (
                <div className="payments-grid">
                  {pending.map(payment => (
                    <div key={payment.id} className="payment-card pending">
                      <div className="payment-header">
                        <div className="payment-amount">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                        <div className="payment-urgency">
                          {getStatusBadge('pending')}
                        </div>
                      </div>
                      
                      <div className="payment-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-label">Payee</span>
                            <span className="detail-value">{payment.payeeName}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Customer</span>
                            <span className="detail-value">{payment.customerName}</span>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-label">Bank</span>
                            <span className="detail-value">{payment.payeeBank}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Country</span>
                            <span className="detail-value">{payment.payeeCountry}</span>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item full-width">
                            <span className="detail-label">Reference</span>
                            <span className="detail-value reference">{payment.reference}</span>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item full-width">
                            <span className="detail-label">Account</span>
                            <span className="detail-value account-number">{payment.customerAccount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="payment-actions">
                        <button 
                          onClick={() => handleApprove(payment.id)}
                          className="approve-btn"
                          disabled={loading}
                        >
                          ✅ Approve Payment
                        </button>
                        <button 
                          onClick={() => handleDeny(payment.id)}
                          className="deny-btn"
                          disabled={loading}
                        >
                          ❌ Deny Payment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="payment-history-tab">
              <div className="section-header">
                <h2>Payment History</h2>
                <p>Review previously processed international payments</p>
              </div>

              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>No Payment History</h3>
                  <p>No payments have been processed yet.</p>
                </div>
              ) : (
                <div className="history-table-container">
                  <div className="table-responsive">
                    <table className="payments-history-table">
                      <thead>
                        <tr>
                          <th>Payee</th>
                          <th>Amount</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Processed Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map(payment => (
                          <tr key={payment.id} className="history-row">
                            <td>
                              <div className="payee-cell">
                                <strong>{payment.payeeName}</strong>
                                <span className="bank-name">{payment.payeeBank}</span>
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
                              <div className="customer-cell">
                                <span className="customer-name">{payment.customerName}</span>
                                <span className="customer-account">{payment.customerAccount}</span>
                              </div>
                            </td>
                            <td>
                              {getStatusBadge(payment.status)}
                            </td>
                            <td>
                              <div className="date-cell">
                                {formatDate(payment.updatedAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="history-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Processed</span>
                      <span className="summary-value">{history.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Approved</span>
                      <span className="summary-value approved">
                        {history.filter(p => p.status === 'approved').length}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Denied</span>
                      <span className="summary-value denied">
                        {history.filter(p => p.status === 'denied').length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`dashboard-message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="security-notice">
          <p>🔒 All payment activities are logged and monitored for security compliance</p>
        </div>
      </footer>
    </div>
  );
}