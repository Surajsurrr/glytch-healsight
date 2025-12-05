# 🚀 Quick Start Guide - Glytch Medical Platform

## Step-by-Step Setup (5 minutes)

### 1. Install MongoDB (if not already installed)

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Use it in the backend `.env` file

**Option B: Local MongoDB**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Or use chocolatey
choco install mongodb

# Start MongoDB
mongod
```

### 2. Setup Backend

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your MongoDB URI
# Minimum required: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
notepad .env

# Start backend server
npm run dev
```

✅ Backend should be running at `http://localhost:5000`

### 3. Setup Frontend

```powershell
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env file (optional - has defaults)
copy .env.example .env

# Start frontend
npm run dev
```

✅ Frontend should be running at `http://localhost:3000`

### 4. Test the Application

1. Open browser: `http://localhost:3000`
2. Click "Sign Up"
3. Create a patient account:
   - Email: `patient@test.com`
   - Password: `password123`
   - Fill in required fields
4. Login and explore the dashboard!

### 5. Create Test Accounts

**Patient Account:**
- Role: Patient
- Email: patient@test.com
- Password: password123

**Doctor Account:**
- Role: Doctor
- Email: doctor@test.com
- Password: password123
- Specialization: Cardiology
- License Number: DOC12345

**Admin Account:**
- Role: Admin
- Email: admin@test.com
- Password: password123

---

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerError: connect ECONNREFUSED
```
**Solution:** Make sure MongoDB is running or use MongoDB Atlas connection string

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Change `PORT` in backend `.env` to a different port (e.g., 5001)

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
**Solution:** Ensure `CLIENT_URL` in backend `.env` matches your frontend URL

---

## Next Steps

1. ✅ Test authentication flow
2. ✅ Explore role-specific dashboards
3. ✅ Check API documentation in `API_SPEC.md`
4. ✅ Review database schema in `DATABASE_SCHEMA.md`
5. ✅ Implement AI features in `/ai-analytics` page

---

## Quick Commands Reference

### Backend
```powershell
npm run dev       # Start dev server
npm start         # Start production
npm test          # Run tests
```

### Frontend
```powershell
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview build
```

---

## Environment Variables Checklist

### Backend (Required)
- [x] `MONGODB_URI` - MongoDB connection string
- [x] `JWT_SECRET` - Secret key for JWT tokens
- [x] `JWT_REFRESH_SECRET` - Secret for refresh tokens

### Backend (Optional)
- [ ] `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - For email notifications
- [ ] `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - For file uploads

---

## API Testing with Postman/curl

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"patient\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"password123\"}"
```

### Check Health
```bash
curl http://localhost:5000/health
```

---

**Need help?** Check the main README.md or open an issue!
