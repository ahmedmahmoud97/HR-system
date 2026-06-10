# HR System Backend Setup Guide

## Prerequisites

### 1. Install Node.js (If not already installed)
- Download: https://nodejs.org/ (LTS version recommended)
- Verify: `node --version` and `npm --version`

### 2. Start XAMPP Services
- Open XAMPP Control Panel
- Start **Apache** (for phpMyAdmin)
- Start **MySQL** (for database)

### 3. Create Database
- Go to: http://localhost/phpmyadmin
- Click "New" → Name: `hr_system`
- Click "Create"

---

## Backend Installation Steps

### Step 1: Navigate to Backend Folder

backend/
├── config/
│   └── database.js
├── routes/
│   ├── auth.js
│   ├── employees.js
│   ├── departments.js
│   ├── attendance.js
│   └── payroll.js
├── middleware/
│   └── auth.js
├── scripts/
│   └── createAdmin.js
├── .env
└── package.json

{
  "name": "hr-system-backend",
  "version": "1.0.0",
  "description": "Backend API for HR Management System",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "node src/server.js",
    "start": "node src/server.js",
    "seed:admin": "node src/scripts/createAdmin.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ status: 'ok', message: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Import routes (will be added later)
// app.use('/api/auth', authRoutes);
// app.use('/api/employees', employeeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hr_system',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
