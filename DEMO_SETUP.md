# 🚀 Quick Demo Setup (SQLite - No Docker)

This guide helps you run the Hospital Management System quickly for demos and development without Docker or PostgreSQL installation.

## ✅ Prerequisites

- Node.js v18+ ([Download](https://nodejs.org/))
- npm or yarn
- Any text editor

## 📦 Installation Steps

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Setup Environment

```bash
# Backend
cd backend
copy .env.example .env    # Windows
# cp .env.example .env    # Mac/Linux

# No changes needed - SQLite is pre-configured!
```

### 3. Initialize Database

```bash
# In backend folder
npm run db:migrate
npm run db:seed
```

This creates `database.sqlite` file with demo data.

### 4. Start Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5. Login & Test

Open http://localhost:3000 and login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | dr.smith@hospital.com | doctor123 |
| Receptionist | reception@hospital.com | reception123 |
| Patient | patient@example.com | patient123 |

## 🎯 Demo Flow

1. **Login as Receptionist** → Register a new patient
2. **Switch to Patient** → Book an appointment
3. **Login as Doctor** → View appointments & create prescription
4. **Back to Receptionist** → Dispense medicine
5. **Login as Admin** → View all activities

## 📁 Database File

- **Location:** `backend/database.sqlite`
- **View with:** [DB Browser for SQLite](https://sqlitebrowser.org/) (optional)
- **Reset:** Delete `database.sqlite` and run `npm run db:migrate && npm run db:seed`

## 🔄 Upgrade to PostgreSQL Later

When ready for production, see [README.md](README.md#-switching-from-sqlite-to-postgresql-production) for migration steps.

## 💡 Benefits of SQLite for Demo

✅ No database server installation  
✅ Portable - database is just one file  
✅ Fast startup - perfect for demos  
✅ Same code works for PostgreSQL later  
✅ Great for testing and development  

## 🐛 Troubleshooting

**"Cannot find module 'sqlite3'"**
```bash
cd backend
npm install sqlite3
```

**Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend won't connect**
- Ensure backend is running at http://localhost:5000/api/health
- Check browser console for CORS errors

**Database errors**
```bash
# Reset database
cd backend
rm database.sqlite    # Mac/Linux
del database.sqlite   # Windows
npm run db:migrate
npm run db:seed
```

## 📊 Performance Notes

SQLite is perfect for:
- Demos and presentations
- Development and testing
- Small deployments (< 100 concurrent users)

For production with many users, switch to PostgreSQL.
