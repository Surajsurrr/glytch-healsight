# 🏥 Glytch Medical Platform

A comprehensive MERN stack medical management platform with role-based access control, featuring patient management, appointments, prescriptions, medical records, and AI analytics capabilities.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [AI Module](#ai-module)
- [Security Features](#security-features)
- [Contributing](#contributing)

---

## ✨ Features

### Core Features
- **Multi-Role Authentication** - Admin, Doctor, and Patient roles with JWT-based auth
- **Patient Management** - Complete patient records with medical history
- **Appointment System** - Book, schedule, and manage appointments
- **Electronic Health Records (EHR)** - Visit notes, SOAP format, diagnoses
- **Prescription Management** - Digital prescriptions with medication tracking
- **Medical Records** - Upload and manage lab results, imaging, documents
- **Dashboard Analytics** - Role-specific dashboards with real-time stats
- **Audit Logging** - Complete audit trail for compliance
- **Notifications** - In-app notifications for appointments and reminders

### AI Analytics (Placeholder)
- Reserved section for AI/ML integration
- Backend API endpoints ready for dataset upload and model training
- Placeholder UI with implementation guide
- Ready for disease prediction, risk assessment, and medical image analysis

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Refresh Tokens
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting, XSS Protection
- **Password Hashing:** bcrypt

### Frontend
- **Library:** React 18
- **Build Tool:** Vite
- **UI Framework:** Material-UI (MUI)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** Context API
- **Charts:** Recharts

---

## 📁 Project Structure

```
glytch-med/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── utils/            # Helpers (tokens, audit logger)
│   │   ├── validators/       # Joi schemas
│   │   └── server.js         # Entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts (Auth)
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── dashboards/   # Admin, Doctor, Patient dashboards
│   │   │   └── ...           # Feature pages
│   │   ├── utils/            # API client, helpers
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── theme.js          # MUI theme config
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── API_SPEC.md               # Complete API documentation
├── DATABASE_SCHEMA.md        # MongoDB schema design
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or MongoDB Atlas)

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd glytch-med
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your configuration
# Set MONGODB_URI, JWT_SECRET, etc.

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env if needed (API URL)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/glytch-med

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=7d

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=glytch-med-files

# Frontend URL
CLIENT_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Glytch Medical Platform
```

---

## 📡 API Documentation

Complete API documentation is available in `API_SPEC.md`.

### Authentication Endpoints

```bash
# Register
POST /api/v1/auth/register
Body: { email, password, role, firstName, lastName, ... }

# Login
POST /api/v1/auth/login
Body: { email, password }

# Refresh Token
POST /api/v1/auth/refresh
Body: { refreshToken }

# Logout
POST /api/v1/auth/logout
Headers: Authorization: Bearer <token>
```

### Example API Call

```bash
# Register a patient
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "securepass123",
    "role": "patient",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "male"
  }'
```

---

## 🤖 AI Module

The AI Analytics section is **reserved for your team member** to implement machine learning features.

### What's Already Prepared

✅ **Backend API Endpoints:**
- `GET /api/v1/ai/status` - Check AI service status
- `POST /api/v1/ai/predict` - Run predictions
- `GET /api/v1/ai/insights` - Get AI insights
- `POST /api/v1/ai/train` - Train models (Admin only)

✅ **Frontend:**
- AI Analytics page with placeholder UI
- Implementation guide and tech stack suggestions
- Protected route (Admin/Doctor only)

### Suggested AI Features

1. **Disease Prediction** - Based on symptoms and medical history
2. **Drug Interaction Checker** - Validate prescription combinations
3. **Medical Image Analysis** - X-ray, CT scan analysis
4. **Patient Risk Stratification** - Identify high-risk patients
5. **Treatment Recommendations** - Evidence-based suggestions
6. **Appointment Demand Forecasting** - Optimize scheduling

### Implementation Guide

See the AI Analytics page in the app for detailed implementation instructions.

---

## 🔒 Security Features

- **JWT Authentication** with refresh token rotation
- **Password Hashing** using bcrypt (12 rounds)
- **Rate Limiting** on all API endpoints
- **Input Validation** using Joi schemas
- **XSS Protection** with xss-clean
- **MongoDB Injection Prevention** with mongo-sanitize
- **CORS** configured for frontend origin
- **Helmet** for security headers
- **Audit Logging** for all sensitive operations
- **Role-Based Access Control (RBAC)**

---

## 📊 Database Schema

Complete database schema documentation is available in `DATABASE_SCHEMA.md`.

### Collections
- **users** - User accounts (Admin, Doctor, Patient)
- **patients** - Patient medical profiles
- **appointments** - Appointment scheduling
- **visits** - Visit records with SOAP notes
- **prescriptions** - Medication prescriptions
- **medicalRecords** - Documents and imaging
- **notifications** - User notifications
- **auditLogs** - Compliance audit trail

---

## 🎨 UI/UX Features

- **Modern Material Design** with MUI components
- **Responsive Layout** - Mobile, tablet, desktop
- **Role-Based Navigation** - Dynamic menus based on user role
- **Intuitive Dashboards** - Stats cards, charts, quick actions
- **Beautiful Forms** - Validation, error handling
- **Loading States** - Skeleton loaders, spinners
- **Error Handling** - User-friendly error messages
- **Professional Color Scheme** - Medical blue & green theme

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🚢 Deployment

### Backend Deployment (Heroku/AWS)

```bash
cd backend

# Build (if needed)
npm run build

# Deploy to Heroku
heroku create glytch-med-api
git push heroku main

# Set environment variables
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-secret>
```

### Frontend Deployment (Vercel)

```bash
cd frontend

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 👥 User Roles

### Admin
- Manage all users
- View audit logs
- System configuration
- Access all features

### Doctor
- View/manage patients
- Create visits and prescriptions
- Manage appointments
- Access AI analytics

### Patient
- View own medical records
- Book appointments
- View prescriptions
- Access personal dashboard

---

## 📝 Scripts

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run seed       # Seed database with demo data
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- MongoDB for flexible data modeling
- Express.js community for excellent middleware

---

## 📞 Support

For support, email support@glytch-med.com or open an issue on GitHub.

---

## 🗺 Roadmap

- [ ] Implement full CRUD for all features
- [ ] Add real-time notifications (Socket.io)
- [ ] Integrate video consultation (WebRTC)
- [ ] Add payment processing
- [ ] Implement AI features
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] HIPAA compliance certification

---

**Built with ❤️ by the Glytch Medical Team**
