import React, { useEffect, useState } from 'react';
import { getEmployees, createEmployee, deleteEmployee } from '../services/employeeApiService.js';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; 

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('manage');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');

  useEffect(() => { 
    const userRole = localStorage.getItem('employeeRole');
    if (!userRole || (userRole !== 'admin' && userRole !== 'superadmin')) {
      navigate('/employee/login');
      return;
    }
    fetchEmployees(); 
  }, [navigate]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (password.length < 12) {
        setMessage('Password must be at least 12 characters long');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      await createEmployee({ fullName, username, password, role });
      setFullName('');
      setUsername('');
      setPassword('');
      setRole('employee');
      fetchEmployees();
      setMessage('Employee created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Create employee error:', err);
      setMessage('Failed to create employee: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
        setMessage('Employee deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Delete employee error:', err);
        setMessage('Failed to delete employee: ' + (err.response?.data?.message || err.message));
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

   const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeRole');
    localStorage.removeItem('employeeUser');
    navigate('/');
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

  const getRoleBadge = (role) => {
    const roleConfig = {
      superadmin: { class: 'role-superadmin', label: 'Super Admin' },
      admin: { class: 'role-admin', label: 'Admin' },
      employee: { class: 'role-employee', label: 'Employee' }
    };
    
    const config = roleConfig[role] || { class: 'role-employee', label: role };
    return <span className={`role-badge ${config.class}`}>{config.label}</span>;
  };

  return (
    <div className="banking-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="bank-logo">
            <h1>Employee Management Portal</h1>
          </div>
          <div className="user-info">
            <span>Welcome, <strong>{user.fullName}</strong></span>
            <span className="account-number">Role: {user.role}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

    
      <main className="dashboard-content">
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            👥 Manage Employees
          </button>
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Create Employee
          </button>
        </div>

       
        <div className="tab-content">
          {activeTab === 'create' && (
            <div className="payment-history-tab">
              <div className="section-header">
                <h2>Create New Employee</h2>
                <p>Add new employees to the system</p>
              </div>

              <div className="create-employee-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text"
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text"
                      value={username} 
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Password (min 12 characters)</label>
                    <input 
                      type="password"
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Role</label>
                    <select 
                      value={role} 
                      onChange={e => setRole(e.target.value)}
                      className="form-select"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={handleCreate}
                  className="create-employee-btn"
                >
                  Create Employee
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="payment-history-tab">
              <div className="section-header">
                <h2>Employee Management</h2>
                <p>Manage all employee accounts in the system</p>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading employees...</p>
                </div>
              ) : employees.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No Employees Found</h3>
                  <p>Create the first employee account to get started.</p>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="create-first-payment-btn"
                  >
                    Create First Employee
                  </button>
                </div>
              ) : (
                <div className="payments-table-container">
                  <div className="table-responsive">
                    <table className="payments-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Username</th>
                          <th>Role</th>
                          <th>Created Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map(employee => (
                          <tr key={employee._id} className="payment-row">
                            <td>
                              <div className="reference-cell">
                                <strong>{employee.fullName}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="amount-cell">
                                <span className="amount">{employee.username}</span>
                              </div>
                            </td>
                            <td>
                              {getRoleBadge(employee.role)}
                            </td>
                            <td>
                              <div className="date-cell">
                                {formatDate(employee.createdAt)}
                              </div>
                            </td>
                            <td>
                              <button 
                                onClick={() => handleDelete(employee._id)}
                                className="delete-btn"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="payments-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Employees</span>
                      <span className="summary-value">{employees.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Admins</span>
                      <span className="summary-value">
                        {employees.filter(e => e.role === 'admin' || e.role === 'superadmin').length}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Employees</span>
                      <span className="summary-value">
                        {employees.filter(e => e.role === 'employee').length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {message && (
          <div className={`dashboard-message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </main>

      
      <footer className="dashboard-footer">
        <div className="security-notice">
          <p>🔒 Employee management activities are protected with bank-level security</p>
        </div>
      </footer>
    </div>
  );
}