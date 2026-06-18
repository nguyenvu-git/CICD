import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Create the database connection pool using promises
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'dbuser',
  password: process.env.DB_PASSWORD || 'dbpassword',
  database: process.env.DB_NAME || 'restaurant_management',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

// In-Memory mock data fallback matching the new schema
const mockUsers = [
  {
    id: 1,
    name: 'System Administrator (Fallback)',
    username: 'admin',
    email: 'admin@restaurant.com',
    phone: '0901234567',
    website: 'restaurant.com',
    company: {
      name: 'Role: Admin',
      catchPhrase: 'Restaurant Management System Team Member',
    },
  },
  {
    id: 2,
    name: 'Nguyen Thi Thu Ngan (Fallback)',
    username: 'cashier1',
    email: 'ngan@restaurant.com',
    phone: '0907654321',
    website: 'restaurant.com',
    company: {
      name: 'Role: Thu ngân',
      catchPhrase: 'Restaurant Management System Team Member',
    },
  },
  {
    id: 3,
    name: 'Tran Van Dau Bep (Fallback)',
    username: 'chef1',
    email: 'chef@restaurant.com',
    phone: '0901112222',
    website: 'restaurant.com',
    company: {
      name: 'Role: Đầu bếp',
      catchPhrase: 'Restaurant Management System Team Member',
    },
  },
];

// Connection status tracker
let isDbConnected = false;

// Test connection on startup
const checkDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    isDbConnected = true;
    console.log('==================================================');
    console.log(' Successfully connected to Restaurant MySQL DB! ');
    console.log('==================================================');
    connection.release();
  } catch (err) {
    isDbConnected = false;
    console.log('==================================================');
    console.log(' WARNING: Could not connect to MySQL database.');
    console.log(` Reason: ${err.message}`);
    console.log(' Backend running in RESILIENT FALLBACK mode (In-Memory).');
    console.log(' Start Docker Desktop and run: docker compose up -d');
    console.log('==================================================');
  }
};

checkDbConnection();

// Custom request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} (DB: ${isDbConnected ? 'ONLINE' : 'OFFLINE'})`);
  next();
});

// Root route - health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    database: isDbConnected ? 'connected' : 'offline_fallback',
    message: 'Restaurant Management Server is running successfully!',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// Fetch Users endpoint - Joins users, profiles, and roles
app.get('/api/users', async (req, res) => {
  if (isDbConnected) {
    try {
      const queryStr = `
        SELECT u.id, u.username, p.full_name, p.phone, p.email, r.role_name
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN roles r ON u.role_id = r.id
      `;
      const [rows] = await pool.query(queryStr);
      
      const formattedUsers = rows.map((user) => ({
        id: user.id,
        name: user.full_name || 'No Profile Name',
        username: user.username,
        email: user.email || 'no-email@restaurant.com',
        phone: user.phone || 'N/A',
        website: 'restaurant.com',
        company: {
          name: `Role: ${user.role_name || 'Unassigned'}`,
          catchPhrase: 'Restaurant Management System Team Member',
        },
      }));
      return res.json(formattedUsers);
    } catch (err) {
      console.warn('Database query failed mid-runtime, falling back to mock users.', err.message);
      isDbConnected = false;
    }
  }

  // Fallback response
  res.json(mockUsers);
});

// Post Contact Form endpoint - Saves to Feedbacks table in MySQL DB
app.post('/api/contact', async (req, res) => {
  const { fullName, email, reason, message, agreeTerms } = req.body;

  // Simple backend validation
  if (!fullName || !email || !reason || !message || agreeTerms === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: Missing required fields.',
    });
  }

  if (isDbConnected) {
    try {
      // Insert into MySQL feedbacks table
      // Columns: customer_name, phone, rating, comment
      const rating = 5; // Default 5 star rating for form contacts
      const [result] = await pool.query(
        'INSERT INTO feedbacks (customer_name, phone, rating, comment) VALUES (?, ?, ?, ?)',
        [fullName, null, rating, `[Reason: ${reason}][Email: ${email}] ${message}`]
      );

      console.log(`[Database] Saved Feedback Inquiry (Row ID: ${result.insertId})`);

      return res.status(200).json({
        success: true,
        message: 'Feedback received and saved to MySQL feedbacks table!',
        receivedData: {
          id: result.insertId,
          fullName,
          email,
          reason,
          message,
          agreeTerms,
          savedToDb: true,
          receivedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.warn('Database save failed mid-runtime, processing in fallback mode.', err.message);
      isDbConnected = false;
    }
  }

  // Fallback mock submission response
  console.log('--- [Fallback Mode] Received Feedback Inquiry ---');
  console.log(`Name: ${fullName}`);
  console.log(`Email: ${email}`);
  console.log(`Reason: ${reason}`);
  console.log(`Message: ${message}`);
  console.log('----------------------------------------------------');

  res.status(200).json({
    success: true,
    message: 'Feedback received (Backend fallback - DB offline)!',
    receivedData: {
      id: Math.floor(Math.random() * 1000) + 100,
      fullName,
      email,
      reason,
      message,
      agreeTerms,
      savedToDb: false,
      receivedAt: new Date().toISOString(),
    },
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`  Express Server running on port ${PORT}   `);
  console.log(`  Health Check: http://localhost:${PORT}/   `);
  console.log(`  Users API:    http://localhost:${PORT}/api/users `);
  console.log(`===========================================`);
});
