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

// =========================================================================
// MODULE CRUD TÀI KHOẢN (ACCOUNTS)
// =========================================================================

// GET /api/roles - Lấy danh sách vai trò (cho dropdown)
app.get('/api/roles', async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await pool.query('SELECT id, role_name, description FROM roles ORDER BY id');
      return res.json(rows);
    } catch (err) {
      console.warn('Failed to fetch roles from DB:', err.message);
      isDbConnected = false;
    }
  }
  // Fallback
  res.json([
    { id: 1, role_name: 'Admin', description: 'Administrator with full system privileges' },
    { id: 2, role_name: 'Thu ngân', description: 'Cashier in charge of invoicing and payments' },
    { id: 3, role_name: 'Đầu bếp', description: 'Chef handling orders in the kitchen' },
    { id: 4, role_name: 'Phục vụ', description: 'Waiter serving tables and taking orders' },
  ]);
});

// GET /api/accounts - Lấy danh sách tài khoản (hỗ trợ ?search=)
app.get('/api/accounts', async (req, res) => {
  const search = req.query.search || '';

  if (isDbConnected) {
    try {
      let queryStr = `
        SELECT u.id, u.username, u.role_id, u.is_active, u.created_at,
               p.full_name, p.phone, p.email,
               r.role_name
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN roles r ON u.role_id = r.id
      `;
      const params = [];
      if (search) {
        queryStr += ` WHERE u.username LIKE ? OR p.full_name LIKE ? OR p.email LIKE ? OR p.phone LIKE ?`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }
      queryStr += ` ORDER BY u.id DESC`;

      const [rows] = await pool.query(queryStr, params);
      return res.json(rows);
    } catch (err) {
      console.warn('Failed to fetch accounts from DB:', err.message);
      isDbConnected = false;
    }
  }

  // Fallback mock data
  const fallbackAccounts = [
    { id: 1, username: 'admin', role_id: 1, is_active: 1, created_at: '2026-01-01', full_name: 'System Administrator', phone: '0901234567', email: 'admin@restaurant.com', role_name: 'Admin' },
    { id: 2, username: 'cashier1', role_id: 2, is_active: 1, created_at: '2026-01-01', full_name: 'Nguyen Thi Thu Ngan', phone: '0907654321', email: 'ngan@restaurant.com', role_name: 'Thu ngân' },
    { id: 3, username: 'chef1', role_id: 3, is_active: 1, created_at: '2026-01-01', full_name: 'Tran Van Dau Bep', phone: '0901112222', email: 'chef@restaurant.com', role_name: 'Đầu bếp' },
    { id: 4, username: 'waiter1', role_id: 4, is_active: 1, created_at: '2026-01-01', full_name: 'Le Van Phuc Vu', phone: '0903334444', email: 'waiter@restaurant.com', role_name: 'Phục vụ' },
  ];
  if (search) {
    const s = search.toLowerCase();
    return res.json(fallbackAccounts.filter(a =>
      a.username.toLowerCase().includes(s) ||
      a.full_name.toLowerCase().includes(s) ||
      a.email.toLowerCase().includes(s)
    ));
  }
  res.json(fallbackAccounts);
});

// GET /api/accounts/:id - Lấy chi tiết 1 tài khoản
app.get('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;

  if (isDbConnected) {
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.username, u.role_id, u.is_active, u.created_at,
               p.full_name, p.phone, p.email,
               r.role_name
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Tài khoản không tồn tại.' });
      }
      return res.json(rows[0]);
    } catch (err) {
      console.warn('Failed to fetch account by ID:', err.message);
      isDbConnected = false;
    }
  }
  res.status(503).json({ success: false, error: 'Database không khả dụng.' });
});

// POST /api/accounts - Tạo tài khoản mới
app.post('/api/accounts', async (req, res) => {
  const { username, password, full_name, phone, email, role_id, is_active } = req.body;

  // Validation
  if (!username || !password || !full_name) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập đầy đủ: username, password, họ tên.',
    });
  }

  if (isDbConnected) {
    try {
      // Check unique username
      const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: `Username "${username}" đã tồn tại. Vui lòng chọn tên khác.`,
        });
      }

      // Use plain text password hash for demo (prefix with $demo$ to indicate it's not bcrypt)
      const passwordHash = `$demo$${password}`;

      // Insert user
      const [userResult] = await pool.query(
        'INSERT INTO users (username, password_hash, role_id, is_active) VALUES (?, ?, ?, ?)',
        [username, passwordHash, role_id || null, is_active !== undefined ? is_active : 1]
      );
      const userId = userResult.insertId;

      // Insert profile
      await pool.query(
        'INSERT INTO profiles (user_id, full_name, phone, email) VALUES (?, ?, ?, ?)',
        [userId, full_name, phone || null, email || null]
      );

      console.log(`[Database] Created new account: ${username} (ID: ${userId})`);

      // Return the created account with full info
      const [newAccount] = await pool.query(`
        SELECT u.id, u.username, u.role_id, u.is_active, u.created_at,
               p.full_name, p.phone, p.email,
               r.role_name
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [userId]);

      return res.status(201).json({
        success: true,
        message: `Tài khoản "${username}" đã được tạo thành công!`,
        data: newAccount[0],
      });
    } catch (err) {
      console.error('Failed to create account:', err.message);
      return res.status(500).json({ success: false, error: 'Lỗi server khi tạo tài khoản.' });
    }
  }

  res.status(503).json({ success: false, error: 'Database không khả dụng. Không thể tạo tài khoản.' });
});

// PUT /api/accounts/:id - Cập nhật tài khoản
app.put('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, full_name, phone, email, role_id, is_active } = req.body;

  if (!username || !full_name) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập đầy đủ: username, họ tên.',
    });
  }

  if (isDbConnected) {
    try {
      // Check user exists
      const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
      if (existingUser.length === 0) {
        return res.status(404).json({ success: false, error: 'Tài khoản không tồn tại.' });
      }

      // Check unique username (excluding current user)
      const [duplicateUser] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
      if (duplicateUser.length > 0) {
        return res.status(409).json({
          success: false,
          error: `Username "${username}" đã được sử dụng bởi tài khoản khác.`,
        });
      }

      // Update users table
      if (password) {
        const passwordHash = `$demo$${password}`;
        await pool.query(
          'UPDATE users SET username = ?, password_hash = ?, role_id = ?, is_active = ? WHERE id = ?',
          [username, passwordHash, role_id || null, is_active !== undefined ? is_active : 1, id]
        );
      } else {
        await pool.query(
          'UPDATE users SET username = ?, role_id = ?, is_active = ? WHERE id = ?',
          [username, role_id || null, is_active !== undefined ? is_active : 1, id]
        );
      }

      // Update or insert profile
      const [existingProfile] = await pool.query('SELECT id FROM profiles WHERE user_id = ?', [id]);
      if (existingProfile.length > 0) {
        await pool.query(
          'UPDATE profiles SET full_name = ?, phone = ?, email = ? WHERE user_id = ?',
          [full_name, phone || null, email || null, id]
        );
      } else {
        await pool.query(
          'INSERT INTO profiles (user_id, full_name, phone, email) VALUES (?, ?, ?, ?)',
          [id, full_name, phone || null, email || null]
        );
      }

      console.log(`[Database] Updated account ID: ${id}`);

      // Return updated account
      const [updatedAccount] = await pool.query(`
        SELECT u.id, u.username, u.role_id, u.is_active, u.created_at,
               p.full_name, p.phone, p.email,
               r.role_name
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [id]);

      return res.json({
        success: true,
        message: `Tài khoản "${username}" đã được cập nhật!`,
        data: updatedAccount[0],
      });
    } catch (err) {
      console.error('Failed to update account:', err.message);
      return res.status(500).json({ success: false, error: 'Lỗi server khi cập nhật tài khoản.' });
    }
  }

  res.status(503).json({ success: false, error: 'Database không khả dụng.' });
});

// DELETE /api/accounts/:id - Xóa tài khoản (hard delete)
app.delete('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;

  if (isDbConnected) {
    try {
      // Check user exists
      const [existing] = await pool.query('SELECT id, username FROM users WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Tài khoản không tồn tại.' });
      }

      const deletedUsername = existing[0].username;

      // Delete profile first (or let CASCADE handle it)
      await pool.query('DELETE FROM profiles WHERE user_id = ?', [id]);
      // Delete user
      await pool.query('DELETE FROM users WHERE id = ?', [id]);

      console.log(`[Database] Deleted account: ${deletedUsername} (ID: ${id})`);

      return res.json({
        success: true,
        message: `Tài khoản "${deletedUsername}" đã được xóa thành công!`,
      });
    } catch (err) {
      console.error('Failed to delete account:', err.message);
      return res.status(500).json({ success: false, error: 'Lỗi server khi xóa tài khoản. Có thể tài khoản đang được liên kết với dữ liệu khác.' });
    }
  }

  res.status(503).json({ success: false, error: 'Database không khả dụng.' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`  Express Server running on port ${PORT}   `);
  console.log(`  Health Check: http://localhost:${PORT}/   `);
  console.log(`  Users API:    http://localhost:${PORT}/api/users `);
  console.log(`  Accounts API: http://localhost:${PORT}/api/accounts `);
  console.log(`===========================================`);
});
