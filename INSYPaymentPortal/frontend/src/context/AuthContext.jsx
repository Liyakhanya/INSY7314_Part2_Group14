import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Environment-based API URL - CRITICAL for production security
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Security utility functions
const validateLoginInput = (loginData) => {
  const errors = [];
  
  // Username validation (matches backend pattern)
  if (!loginData.username || !/^[a-zA-Z0-9_]{3,30}$/.test(loginData.username)) {
    errors.push('Username must be 3-30 characters (letters, numbers, underscores only)');
  }
  
  // Account number validation (matches backend pattern)
  if (!loginData.accountNumber || !/^[A-Z0-9]{8,34}$/.test(loginData.accountNumber)) {
    errors.push('Account number must be 8-34 alphanumeric characters');
  }
  
  // Password validation
  if (!loginData.password) {
    errors.push('Password is required');
  }
  
  return errors;
};

const validateRegistrationInput = (userData) => {
  const errors = [];
  
  // Full name validation
  if (!userData.fullName || !/^[a-zA-Z\s]{2,100}$/.test(userData.fullName)) {
    errors.push('Full name must be 2-100 letters and spaces only');
  }
  
  // ID number validation
  if (!userData.idNumber || !/^[A-Z0-9-]{5,20}$/.test(userData.idNumber)) {
    errors.push('ID number must be 5-20 alphanumeric characters and hyphens');
  }
  
  // Account number validation
  if (!userData.accountNumber || !/^[A-Z0-9]{8,34}$/.test(userData.accountNumber)) {
    errors.push('Account number must be 8-34 alphanumeric characters');
  }
  
  // Username validation
  if (!userData.username || !/^[a-zA-Z0-9_]{3,30}$/.test(userData.username)) {
    errors.push('Username must be 3-30 characters (letters, numbers, underscores only)');
  }
  
  // Password strength validation
  if (!userData.password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(userData.password)) {
    errors.push('Password must be at least 12 characters with uppercase, lowercase, number and special character (@$!%*?&)');
  }
  
  return errors;
};

// Secure fetch with timeout to prevent hanging requests
const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Token validation utility
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Decode JWT payload to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      console.warn('Token has expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};

// Input sanitization to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/expression\(/gi, '')
    .trim();
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load with security validation
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('bankingToken');
        const storedUser = localStorage.getItem('bankingUser');
        
        if (storedToken && storedUser && isTokenValid(storedToken)) {
          // Token is valid, set authentication state
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          // Clear invalid or expired tokens
          clearAuthData();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear all authentication data securely
  const clearAuthData = () => {
    localStorage.removeItem('bankingToken');
    localStorage.removeItem('bankingUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    try {
      // Sanitize all input data
      const sanitizedData = {
        fullName: sanitizeInput(userData.fullName),
        idNumber: sanitizeInput(userData.idNumber).toUpperCase(),
        accountNumber: sanitizeInput(userData.accountNumber).toUpperCase(),
        username: sanitizeInput(userData.username).toLowerCase(),
        password: userData.password // Don't sanitize password (affects hashing)
      };

      // Client-side validation
      const validationErrors = validateRegistrationInput(sanitizedData);
      if (validationErrors.length > 0) {
        return { 
          success: false, 
          error: validationErrors.join(', '),
          validationErrors 
        };
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      }, 15000); // 15 second timeout for registration

      const data = await response.json();
      
      if (data.success) {
        return { 
          success: true, 
          data,
          message: 'Registration successful! Please log in.'
        };
      } else {
        return { 
          success: false, 
          error: data.error || 'Registration failed',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed - please try again';
      if (error.name === 'AbortError') {
        errorMessage = 'Registration timeout - please try again';
      } else if (error instanceof TypeError) {
        errorMessage = 'Network error - please check your connection';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const login = async (loginData) => {
    try {
      // Sanitize input data
      const sanitizedData = {
        username: sanitizeInput(loginData.username).toLowerCase(),
        accountNumber: sanitizeInput(loginData.accountNumber).toUpperCase(),
        password: loginData.password // Don't sanitize password
      };

      // Client-side validation
      const validationErrors = validateLoginInput(sanitizedData);
      if (validationErrors.length > 0) {
        return { 
          success: false, 
          error: validationErrors.join(', '),
          validationErrors 
        };
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      }, 10000); // 10 second timeout for login

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login API error:', errorText);
        return { 
          success: false, 
          error: 'Login failed - server error' 
        };
      }

      const data = await response.json();
      
      if (data.success) {
        // Store authentication data
        localStorage.setItem('bankingToken', data.token);
        localStorage.setItem('bankingUser', JSON.stringify(data.customer));
        
        setToken(data.token);
        setUser(data.customer);
        setIsAuthenticated(true);
        
        return { 
          success: true,
          user: data.customer 
        };
      } else {
        return { 
          success: false, 
          error: data.error || 'Login failed',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed - please try again';
      if (error.name === 'AbortError') {
        errorMessage = 'Login timeout - please try again';
      } else if (error instanceof TypeError) {
        errorMessage = 'Network error - please check your connection';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    // Optional: Call backend logout endpoint if needed
    // await fetch(`${API_BASE_URL}/v1/auth/logout`, {
    //   method: 'GET',
    //   headers: getAuthHeaders()
    // });
    
    // Clear all authentication data
    clearAuthData();
    
    console.log('User logged out securely');
  };

  // Secure header generation with CSRF protection
  const getAuthHeaders = () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    return headers;
  };

  // Token refresh mechanism (if backend supports it)
  const refreshToken = async () => {
    if (!token) return false;
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(),
      }, 5000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('bankingToken', data.token);
          setToken(data.token);
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    // If refresh fails, logout user
    logout();
    return false;
  };

  // Check if token is about to expire (within 5 minutes)
  const isTokenExpiringSoon = () => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      return expiresIn < 5 * 60 * 1000; // 5 minutes
    } catch {
      return false;
    }
  };

  // Auto-refresh token if expiring soon
  useEffect(() => {
    if (isAuthenticated && isTokenExpiringSoon()) {
      console.log('Token expiring soon, attempting refresh...');
      refreshToken();
    }
  }, [isAuthenticated, token]);

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    register,
    logout,
    getAuthHeaders,
    refreshToken,
    clearAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export security utilities for use in other components
export {
  // eslint-disable-next-line react-refresh/only-export-components
  validateLoginInput,
  // eslint-disable-next-line react-refresh/only-export-components
  validateRegistrationInput,
  // eslint-disable-next-line react-refresh/only-export-components
  sanitizeInput,
  // eslint-disable-next-line react-refresh/only-export-components
  isTokenValid
};