## 🎥 Youtube Video
https://youtu.be/e3vUaDZJo9o 


# 🏦 International Banking Payment System

<div align="center">

![Banking System](https://img.shields.io/badge/Platform-International%20Banking-blue)
![Security](https://img.shields.io/badge/Security-Bank%20Grade-green)
![React](https://img.shields.io/badge/Frontend-React%2018-61dafb)
![Node.js](https://img.shields.io/badge/Backend-Node.js%2018-339933)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED)

*A secure, containerized banking platform for international payments with role-based access control*

</div>

## 👥 Team Members

| Name | Student Number | Role | Contribution |
|------|----------------|------|-------------|
| **Liyakhanya Kitsili** | ST10279731 | 🛡️ Backend & Security Lead | JWT auth, security middleware, API architecture |
| **Humzah Patel** | ST10320465 | 💼 Customer Portal Lead | React components, payment forms, UI/UX |
| **Yachin Puckreesamy** | ST10256948 | 👥 Employee Portal Lead | Admin dashboard, employee management |
| **Raeez Spence** | ST10085639 | 🚀 DevOps Specialist | Docker, CI/CD, deployment |
| **Gareth Elie** | ST10076171 | 🗄️ Database Architect | MongoDB schemas, API integration |
| **Divan Ferreira** | ST10024703 | 🔒 Security Engineer | Testing, vulnerability assessment |

## 📖 Project Overview

> **Secure International Payments Platform** - A full-stack banking application that enables customers to create international payments and bank employees to verify and process them through a secure, audited workflow.

### 🌟 Key Features

| Component | Features | Tech Stack |
|-----------|----------|------------|
| **🔐 Customer Portal** | Registration, Payment Creation, History Tracking | React, Vite, SSL |
| **👨‍💼 Employee Portal** | Payment Verification, Admin Dashboard | React, Material-UI |
| **⚙️ Backend API** | JWT Auth, Payment Processing, Security Middleware | Node.js, Express, MongoDB |
| **🐳 Infrastructure** | Containerization, CI/CD, Security Scanning | Docker, CircleCI, SonarQube |

## 🛡️ Comprehensive Security Implementation

### 🔒 Multi-Layer Protection Architecture

```mermaid
graph TD
    A[Client Request] --> B[Rate Limiting]
    B --> C[SSL/TLS Encryption]
    C --> D[Input Sanitization]
    D --> E[JWT Authentication]
    E --> F[Role-Based Access]
    F --> G[Database Operations]
```

### 🎯 Attack Vector Protection

| Attack Type | 🛡️ Protection | ✅ Status |
|-------------|----------------|-----------|
| **Session Jacking** | JWT + 15min expiry + Token blacklisting | 🟢 **FULLY PROTECTED** |
| **Clickjacking** | `X-Frame-Options: DENY` + CSP | 🟢 **FULLY PROTECTED** |
| **SQL Injection** | MongoDB sanitization + Input validation | 🟢 **FULLY PROTECTED** |
| **XSS Attacks** | xss-clean + CSP + React encoding | 🟢 **FULLY PROTECTED** |
| **MITM Attacks** | SSL/TLS + HSTS + Strong ciphers | 🟢 **FULLY PROTECTED** |
| **DDoS Attacks** | Multi-layer rate limiting + IP throttling | 🟢 **FULLY PROTECTED** |

### 🔐 Security Features Deep Dive

#### Authentication & Session Security
```javascript
// JWT with short expiry and secure validation
const generateJwt = (user) => jwt.sign(
  { userId: user._id, type: user.role }, 
  process.env.JWT_SECRET, 
  { expiresIn: '15m' }  // Short-lived tokens
);

// Token blacklisting for secure logout
const tokenBlacklist = new Set();
const invalidateToken = (token) => tokenBlacklist.add(token);
```

#### Input Validation & Sanitization
```javascript
// Comprehensive RegEx whitelisting
const patterns = {
  username: /^[a-zA-Z0-9_]{3,30}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  accountNumber: /^[A-Z0-9]{8,34}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
};
```

## 🚀 Quick Start Guide

### 📦 Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/Liyakhanya/INSY7314_Part2_Group14.git
cd INSY7314_Part2_Group14

# 🐳 Start all services with one command
docker-compose up --build -d

# 📊 Check service status
docker-compose ps

# 📝 View logs
docker-compose logs -f
```

### 🌐 Access Points

| Service | URL | Port | Status |
|---------|-----|------|---------|
| **Customer Portal** | 🔗 [https://localhost:5173](https://localhost:5173) | `5173` | 🟢 **Live** |
| **Employee Portal** | 🔗 [https://localhost:3002](https://localhost:3002) | `3002` | 🟢 **Live** |
| **Backend API** | 🔗 [https://localhost:3000/health](https://localhost:3000/health) | `3000` | 🟢 **Live** |

### 🔑 Default Login Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|-------------|
| **Super Admin** | `superadmin` | `SuperAdminPassword123` | 👑 Full system access |
| **Admin** | *Created by Super Admin* | *Custom password* | ⚙️ Employee management |
| **Employee** | *Created by Admin* | *Custom password* | ✅ Payment verification |
| **Customer** | *Self-registration* | *Meets security requirements* | 💳 Payment creation |

## 📊 System Architecture

```mermaid
graph TB
    subgraph "Frontend Applications"
        A[Customer Portal<br/>Port 5173]
        B[Employee Portal<br/>Port 3002]
    end
    
    subgraph "Backend Services"
        C[API Gateway<br/>Port 3000]
        D[Authentication<br/>Service]
        E[Payment<br/>Processing]
        F[Employee<br/>Management]
    end
    
    subgraph "Data Layer"
        G[(MongoDB<br/>Port 27017)]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    D --> G
    E --> G
    F --> G
```

## 🔄 Changelog: Part 2 → Part 3

### 🆕 New Features & Enhancements

| Feature | Part 2 | Part 3 | Improvement |
|---------|--------|--------|-------------|
| **Employee Portal** | ❌ Not implemented | ✅ **Complete** | +100% functionality |
| **Admin Dashboard** | ❌ Not implemented | ✅ **Complete** | Employee management |
| **Docker Setup** | ❌ Manual deployment | ✅ **Containerized** | Single-command deployment |
| **CI/CD Pipeline** | ❌ No automation | ✅ **CircleCI + SonarQube** | Automated testing & scanning |

### 🛡️ Security Enhancements

| Security Measure | Part 2 | Part 3 | Enhancement |
|------------------|--------|--------|-------------|
| **Role-Based Access** | Basic JWT | ✅ **Multi-level RBAC** | Customer, Employee, Admin, SuperAdmin |
| **Rate Limiting** | Basic | ✅ **Multi-layer** | Auth: 5/15min, Payments: 10/15min |
| **Input Validation** | Customer only | ✅ **All portals** | Employee data validation added |
| **Token Management** | Basic | ✅ **Blacklisting** | Secure logout implementation |

### 🎨 UI/UX Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Dashboard Design** | Basic interfaces | 🎯 **Professional banking UI** |
| **Responsive Design** | Limited mobile support | 📱 **Fully responsive** |
| **Form Validation** | Basic feedback | ⚡ **Real-time validation** |
| **Loading States** | Minimal | 🔄 **Enhanced user experience** |

## 🛠️ Development Guide

### 📁 Project Structure

```
INSY7314_Part2_Group14/
├── 🐳 docker-compose.yml          # Multi-container orchestration
├── 🔧 .circleci/
│   └── config.yml                 # CI/CD pipeline configuration
├── ⚙️ backend/                    # Node.js API
│   ├── controllers/               # Route handlers
│   ├── models/                    # MongoDB schemas
│   ├── middlewares/               # Security & authentication
│   └── services/                  # Business logic
├── 💼 frontend/                   # Customer Portal (React + Vite)
│   ├── components/                # Reusable UI components
│   ├── services/                  # API integration
│   └── pages/                     # Application routes
└── 👥 employee-portal/            # Employee Portal (React)
    ├── components/                # Admin & employee components
    ├── pages/                     # Dashboard & management
    └── services/                  # Employee API services
```

### 🚀 Manual Development Setup

```bash
# Backend Development
cd backend
npm install
npm run dev

# Customer Portal Development
cd frontend  
npm install
npm run dev

# Employee Portal Development
cd employee-portal
npm install
npm start
```

## 🔍 API Documentation

### Key Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/v1/auth/register` | Customer registration | 🔓 Public |
| `POST` | `/v1/auth/login` | User authentication | 🔓 Public |
| `GET` | `/v1/payments` | Get user payments | 🔐 Customer |
| `POST` | `/v1/payments` | Create payment | 🔐 Customer |
| `GET` | `/v1/employee/payments/pending` | Pending payments | 🔐 Employee |
| `PUT` | `/v1/employee/payments/:id/approve` | Approve payment | 🔐 Employee |
| `GET` | `/v1/employee/employees` | List employees | 🔐 Admin |

## 📈 DevOps & Quality Assurance

### 🔄 CI/CD Pipeline

```yaml
# CircleCI Pipeline Stages
1. 🔍 Code Checkout
2. 🧪 Backend Testing (Mocha + NYC)
3. 📊 Security Audit (npm audit)
4. 🔎 SonarQube Scan
5. 🐳 Docker Image Build
6. ✅ Health Checks
```


## 🎥 Demonstration

📹 **[Watch the Full Demo Video](https://youtube.com/your-demo-link)** *(Insert your YouTube unlisted link here)*

*Video demonstrates:*
- ✅ Customer registration & payment flow
- ✅ Employee payment verification process  
- ✅ Admin employee management
- ✅ Security features in action
- ✅ Docker container operation
- ✅ Responsive design across devices

## 📚 References & Acknowledgments

these are the references:  # 📚 References

AkshataGanbote (2023). *GitHub - AkshataGanbote/Registration_Login_Form_MERN_Stack: Responsive user Registration and Login (SignIn & SignUp) Form functionality using React, NodeJS, ExpressJS and MongoDB and Bootstrap.* [online] GitHub. Available at: https://github.com/AkshataGanbote/Registration_Login_Form_MERN_Stack [Accessed 5 Oct. 2025].

istanbuljs (2024). *GitHub - istanbuljs/nyc: the Istanbul command line interface.* [online] GitHub. Available at: https://github.com/istanbuljs/nyc.git [Accessed 10 Oct. 2025].

Coding Shiksha (2024). *How to Configure SSL Certificate on Localhost React Project Using OpenSSL and Make it HTTPS Secure.* [online] YouTube. Available at: https://www.youtube.com/watch?v=OZS3wF5CViE [Accessed 10 Oct. 2025].

Cosden Solutions (2024). *Authentication in React with JWTs, Access & Refresh Tokens (Complete Tutorial).* [online] YouTube. Available at: https://www.youtube.com/watch?v=AcYF18oGn6Y [Accessed 25 Jul. 2025].

michaelleeallen (2023). *GitHub - michaelleeallen/mocha-junit-reporter: A JUnit XML reporter for mocha.* [online] GitHub. Available at: https://github.com/michaelleeallen/mocha-junit-reporter [Accessed 10 Oct. 2025].

Nodejs.org. (2017). TLS (SSL) | Node.js v24.10.0 Documentation. [online] Available at: https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener [Accessed 10 Oct. 2025].

Mochajs.org. (2025). *Mocha - the fun, simple, flexible JavaScript test framework.* [online] Available at: https://mochajs.org/#working-with-nyc [Accessed 10 Oct. 2025].

Mui.com. (2016). *React Card component - Material UI.* [online] Available at: https://mui.com/material-ui/react-card/ [Accessed 5 Oct. 2025].

mui.com. (2025a). *App Bar React component - Material UI.* [online] Available at: https://mui.com/material-ui/react-app-bar/ [Accessed 5 Oct. 2025].

mui.com. (2025b). *React Stepper component - Material UI.* [online] Available at: https://mui.com/material-ui/react-stepper/ [Accessed 5 Oct. 2025].

mui.com. (2025c). *React Table component - Material UI.* [online] Available at: https://mui.com/material-ui/react-table/ [Accessed 5 Oct. 2025].

Izuchukwu Alaneme (2025). How to Generate a Secure JWT Secret Using Node.js. [online] DEV Community. Available at: https://dev.to/rockhillz/how-to-generate-a-secure-jwt-secret-using-nodejs-3n57 [Accessed 10 Oct. 2025].

Ben Awad (2019). Intro to CircleCI with React. [online] YouTube. Available at: https://www.youtube.com/watch?v=slGMKIDg7gM [Accessed 10 Oct. 2025].

rudderz243 (2025). *GitHub - rudderz243/library_api.* [online] GitHub. Available at: https://github.com/rudderz243/library_api [Accessed 5 Oct. 2025].

The Coding Monk (2025). *How to add rate limit to Express Server || How to Setup A Nodejs + Express API with Rate Limiting.* [online] YouTube. Available at: https://www.youtube.com/watch?v=fjmaI31M5-Q [Accessed 9 Oct. 2025].

www.rexegg.com. (n.d.). *Regex Cheat Sheet.* [online] Available at: https://www.rexegg.com/regex-quickstart.php [Accessed 10 Oct. 2025].

Alexkondov.com. (2024). How to Style a React Application. [online] Available at: https://alexkondov.com/full-stack-tao-styling/ [Accessed 10 Oct. 2025].

## 🆘 Support & Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **SSL Certificate Warnings** | Accept self-signed certificates in browser |
| **Port Conflicts** | Ensure ports 3000, 3002, 5173 are available |
| **Docker Build Failures** | Run `docker system prune -a` and rebuild |
| **Database Connection** | Check MongoDB connection string in environment |

### 📞 Getting Help

```bash
# Check service health
docker-compose ps

# View real-time logs
docker-compose logs -f backend_api

# Restart specific service
docker-compose restart customer_portal

# Full system reset
docker-compose down && docker-compose up -d
```

---

<div align="center">

### 🎉 **Ready for Production Deployment**



*Built with ❤️ by Group 14 for INSY7314 - 2025*

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Liyakhanya/INSY7314_Part2_Group14.git)

</div>