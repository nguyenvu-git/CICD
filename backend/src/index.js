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

// Create the database connection pool using environment variables or fallbacks
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root_password_cua_ban',
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
let isReconnecting = false;

// Test connection on startup and handle automatic retries
const checkDbConnection = async () => {
  if (isDbConnected) return;
  try {
    const connection = await pool.getConnection();
    isDbConnected = true;
    isReconnecting = false;
    console.log('==================================================');
    console.log(' Successfully connected to Restaurant MySQL DB! ');
    console.log('==================================================');
    connection.release();
  } catch (err) {
    isDbConnected = false;
    console.log(`[DB Connection Attempt Failed] ${err.message}. Retrying in 5 seconds...`);
    if (!isReconnecting) {
      isReconnecting = true;
    }
    setTimeout(checkDbConnection, 5000);
  }
};

checkDbConnection();

// Handle DB errors gracefully without permanently disabling the DB unless it's a connection issue
const handleDbError = (err) => {
  const connectionErrorCodes = [
    'PROTOCOL_CONNECTION_LOST',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ER_ACCESS_DENIED_ERROR',
  ];
  if (connectionErrorCodes.includes(err.code) || (err.message && err.message.toLowerCase().includes('connect'))) {
    isDbConnected = false;
    checkDbConnection();
  }
};

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
      handleDbError(err);
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
      handleDbError(err);
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
      handleDbError(err);
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
      handleDbError(err);
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
      handleDbError(err);
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

// =========================================================================
// MODULE CRUD VAI TRÒ & PHÂN QUYỀN (ROLES MANAGEMENT)
// =========================================================================

// Định nghĩa ma trận phân quyền mặc định cho mỗi role
const DEFAULT_PERMISSIONS = {
  'Admin': {
    quan_ly_tai_khoan: true,
    quan_ly_vai_tro: true,
    quan_ly_mon_an: true,
    quan_ly_ban_an: true,
    quan_ly_don_hang: true,
    quan_ly_hoa_don: true,
    quan_ly_kho: true,
    quan_ly_nha_cung_cap: true,
    quan_ly_khach_hang: true,
    quan_ly_khuyen_mai: true,
    xem_bao_cao: true,
    quan_ly_phan_hoi: true,
  },
  'Thu ngân': {
    quan_ly_tai_khoan: false,
    quan_ly_vai_tro: false,
    quan_ly_mon_an: false,
    quan_ly_ban_an: true,
    quan_ly_don_hang: true,
    quan_ly_hoa_don: true,
    quan_ly_kho: false,
    quan_ly_nha_cung_cap: false,
    quan_ly_khach_hang: true,
    quan_ly_khuyen_mai: true,
    xem_bao_cao: false,
    quan_ly_phan_hoi: false,
  },
  'Đầu bếp': {
    quan_ly_tai_khoan: false,
    quan_ly_vai_tro: false,
    quan_ly_mon_an: true,
    quan_ly_ban_an: false,
    quan_ly_don_hang: true,
    quan_ly_hoa_don: false,
    quan_ly_kho: true,
    quan_ly_nha_cung_cap: false,
    quan_ly_khach_hang: false,
    quan_ly_khuyen_mai: false,
    xem_bao_cao: false,
    quan_ly_phan_hoi: false,
  },
  'Phục vụ': {
    quan_ly_tai_khoan: false,
    quan_ly_vai_tro: false,
    quan_ly_mon_an: false,
    quan_ly_ban_an: true,
    quan_ly_don_hang: true,
    quan_ly_hoa_don: false,
    quan_ly_kho: false,
    quan_ly_nha_cung_cap: false,
    quan_ly_khach_hang: false,
    quan_ly_khuyen_mai: false,
    xem_bao_cao: false,
    quan_ly_phan_hoi: true,
  },
};

const getDefaultPermissions = (roleName) => {
  return DEFAULT_PERMISSIONS[roleName] || {
    quan_ly_tai_khoan: false, quan_ly_vai_tro: false, quan_ly_mon_an: false,
    quan_ly_ban_an: false, quan_ly_don_hang: false, quan_ly_hoa_don: false,
    quan_ly_kho: false, quan_ly_nha_cung_cap: false, quan_ly_khach_hang: false,
    quan_ly_khuyen_mai: false, xem_bao_cao: false, quan_ly_phan_hoi: false,
  };
};

// In-memory permissions store (since DB doesn't have a permissions table)
const rolePermissionsStore = {};

// GET /api/roles-management - Lấy danh sách vai trò kèm số lượng user
app.get('/api/roles-management', async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await pool.query(`
        SELECT r.id, r.role_name, r.description, r.created_at,
               COUNT(u.id) AS user_count
        FROM roles r
        LEFT JOIN users u ON r.id = u.role_id
        GROUP BY r.id, r.role_name, r.description, r.created_at
        ORDER BY r.id ASC
      `);
      // Gắn thông tin quyền từ store
      const rolesWithPerms = rows.map(role => ({
        ...role,
        permissions: rolePermissionsStore[role.id] || getDefaultPermissions(role.role_name),
      }));
      return res.json(rolesWithPerms);
    } catch (err) {
      console.warn('Failed to fetch roles-management from DB:', err.message);
      handleDbError(err);
    }
  }
  // Fallback
  const fallback = [
    { id: 1, role_name: 'Admin', description: 'Administrator with full system privileges', created_at: '2026-01-01', user_count: 1 },
    { id: 2, role_name: 'Thu ngân', description: 'Cashier in charge of invoicing and payments', created_at: '2026-01-01', user_count: 1 },
    { id: 3, role_name: 'Đầu bếp', description: 'Chef handling orders in the kitchen', created_at: '2026-01-01', user_count: 1 },
    { id: 4, role_name: 'Phục vụ', description: 'Waiter serving tables and taking orders', created_at: '2026-01-01', user_count: 1 },
  ];
  res.json(fallback.map(r => ({ ...r, permissions: getDefaultPermissions(r.role_name) })));
});

// GET /api/roles-management/:id - Lấy chi tiết 1 vai trò
app.get('/api/roles-management/:id', async (req, res) => {
  const { id } = req.params;
  if (isDbConnected) {
    try {
      const [rows] = await pool.query(`
        SELECT r.id, r.role_name, r.description, r.created_at,
               COUNT(u.id) AS user_count
        FROM roles r
        LEFT JOIN users u ON r.id = u.role_id
        WHERE r.id = ?
        GROUP BY r.id, r.role_name, r.description, r.created_at
      `, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Vai trò không tồn tại.' });
      }
      const role = {
        ...rows[0],
        permissions: rolePermissionsStore[rows[0].id] || getDefaultPermissions(rows[0].role_name),
      };
      return res.json(role);
    } catch (err) {
      console.warn('Failed to fetch role by ID:', err.message);
      handleDbError(err);
    }
  }
  res.status(503).json({ success: false, error: 'Database không khả dụng.' });
});

// POST /api/roles-management - Tạo vai trò mới
app.post('/api/roles-management', async (req, res) => {
  const { role_name, description, permissions } = req.body;

  if (!role_name || role_name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập tên vai trò.' });
  }

  if (isDbConnected) {
    try {
      // Check unique role_name
      const [existing] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [role_name.trim()]);
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: `Vai trò "${role_name}" đã tồn tại. Vui lòng chọn tên khác.`,
        });
      }

      const [result] = await pool.query(
        'INSERT INTO roles (role_name, description) VALUES (?, ?)',
        [role_name.trim(), description || null]
      );
      const newId = result.insertId;

      // Store permissions
      rolePermissionsStore[newId] = permissions || getDefaultPermissions(role_name.trim());

      console.log(`[Database] Created new role: ${role_name} (ID: ${newId})`);

      const [newRole] = await pool.query(`
        SELECT r.id, r.role_name, r.description, r.created_at, 0 AS user_count
        FROM roles r WHERE r.id = ?
      `, [newId]);

      return res.status(201).json({
        success: true,
        message: `Vai trò "${role_name}" đã được tạo thành công!`,
        data: { ...newRole[0], permissions: rolePermissionsStore[newId] },
      });
    } catch (err) {
      console.error('Failed to create role:', err.message);
      return res.status(500).json({ success: false, error: 'Lỗi server khi tạo vai trò.' });
    }
  }
  res.status(503).json({ success: false, error: 'Database không khả dụng. Không thể tạo vai trò.' });
});

// PUT /api/roles-management/:id - Cập nhật vai trò
app.put('/api/roles-management/:id', async (req, res) => {
  const { id } = req.params;
  const { role_name, description, permissions } = req.body;

  if (!role_name || role_name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập tên vai trò.' });
  }

  if (isDbConnected) {
    try {
      // Check exists
      const [existing] = await pool.query('SELECT id, role_name FROM roles WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Vai trò không tồn tại.' });
      }

      // Check unique name (exclude self)
      const [duplicate] = await pool.query('SELECT id FROM roles WHERE role_name = ? AND id != ?', [role_name.trim(), id]);
      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          error: `Tên vai trò "${role_name}" đã được sử dụng bởi vai trò khác.`,
        });
      }

      await pool.query('UPDATE roles SET role_name = ?, description = ? WHERE id = ?', [role_name.trim(), description || null, id]);

      // Update permissions in store
      if (permissions) {
        rolePermissionsStore[parseInt(id)] = permissions;
      }

      console.log(`[Database] Updated role ID: ${id}`);

      const [updatedRole] = await pool.query(`
        SELECT r.id, r.role_name, r.description, r.created_at,
               COUNT(u.id) AS user_count
        FROM roles r
        LEFT JOIN users u ON r.id = u.role_id
        WHERE r.id = ?
        GROUP BY r.id, r.role_name, r.description, r.created_at
      `, [id]);

      return res.json({
        success: true,
        message: `Vai trò "${role_name}" đã được cập nhật!`,
        data: { ...updatedRole[0], permissions: rolePermissionsStore[parseInt(id)] || getDefaultPermissions(role_name) },
      });
    } catch (err) {
      console.error('Failed to update role:', err.message);
      return res.status(500).json({ success: false, error: 'Lỗi server khi cập nhật vai trò.' });
    }
  }
  res.status(503).json({ success: false, error: 'Database không khả dụng.' });
});

// DELETE /api/roles-management/:id - Xóa vai trò
app.delete('/api/roles-management/:id', async (req, res) => {
  const { id } = req.params;

  if (isDbConnected) {
    try {
      // Check exists
      const [existing] = await pool.query('SELECT id, role_name FROM roles WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Vai trò không tồn tại.' });
      }

      const roleName = existing[0].role_name;

      // Check if role is in use
      const [usersWithRole] = await pool.query('SELECT COUNT(*) AS cnt FROM users WHERE role_id = ?', [id]);
      if (usersWithRole[0].cnt > 0) {
        return res.status(409).json({
          success: false,
          error: `Không thể xóa vai trò "${roleName}" vì đang có ${usersWithRole[0].cnt} tài khoản sử dụng.`,
        });
      }

      await pool.query('DELETE FROM roles WHERE id = ?', [id]);
      delete rolePermissionsStore[parseInt(id)];

      console.log(`[Database] Deleted role: ${roleName} (ID: ${id})`);

      return res.json({
        success: true,
        message: `Vai trò "${roleName}" đã được xóa thành công!`,
      });
    } catch (err) {
      console.error('Failed to delete role:', err.message);
      return res.status(500).json({ success: false, error: 'Lỗi server khi xóa vai trò.' });
    }
  }
  res.status(503).json({ success: false, error: 'Database không khả dụng.' });
});
// =========================================================================
// IN-MEMORY MOCK DATA FOR NEW MODULES (FALLBACK)
// =========================================================================
let mockVouchers = [
  { id: 1, code: 'GIAM50K', discount_type: 'amount', discount_value: 50000, min_order_value: 200000, is_active: 1, created_at: new Date().toISOString() },
  { id: 2, code: 'SALE10', discount_type: 'percent', discount_value: 10, min_order_value: 100000, is_active: 1, created_at: new Date().toISOString() }
];

let mockCustomers = [
  { id: 1, full_name: 'Khách vãng lai', phone: '0000000000', reward_points: 0, created_at: new Date().toISOString() },
  { id: 2, full_name: 'Nguyễn Văn A', phone: '0901234567', reward_points: 150, created_at: new Date().toISOString() }
];

let mockInvoices = [];

// =========================================================================
// MODULE CRUD KHUYẾN MÃI / VOUCHER (CICD #17)
// =========================================================================
app.get('/api/vouchers', async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await pool.query('SELECT * FROM vouchers ORDER BY id DESC');
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.warn('Failed to fetch vouchers from DB:', err.message);
      handleDbError(err);
    }
  }
  res.json({ success: true, data: mockVouchers });
});

app.post('/api/vouchers', async (req, res) => {
  const { code, discount_type, discount_value, min_order_value } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'Mã giảm giá không được để trống.' });

  if (isDbConnected) {
    try {
      const [existing] = await pool.query('SELECT id FROM vouchers WHERE code = ?', [code.trim().toUpperCase()]);
      if (existing.length > 0) return res.status(409).json({ success: false, error: 'Mã giảm giá đã tồn tại.' });

      const [result] = await pool.query(
        'INSERT INTO vouchers (code, discount_type, discount_value, min_order_value) VALUES (?, ?, ?, ?)',
        [code.trim().toUpperCase(), discount_type, discount_value, min_order_value || 0]
      );
      const [newVoucher] = await pool.query('SELECT * FROM vouchers WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, message: 'Tạo mã thành công!', data: newVoucher[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi server khi tạo voucher.' });
    }
  }
  
  const exists = mockVouchers.some(v => v.code === code.trim().toUpperCase());
  if (exists) return res.status(409).json({ success: false, error: 'Mã giảm giá đã tồn tại (Fallback).' });

  const newMockVoucher = {
    id: Math.max(...mockVouchers.map(v => v.id), 0) + 1,
    code: code.trim().toUpperCase(), discount_type, discount_value, min_order_value: min_order_value || 0, is_active: 1
  };
  mockVouchers.unshift(newMockVoucher);
  res.status(201).json({ success: true, message: 'Tạo mã thành công (Fallback)!', data: newMockVoucher });
});

// =========================================================================
// MODULE CRUD KHÁCH HÀNG & THÀNH VIÊN (CICD #16)
// =========================================================================
app.post('/api/customers', async (req, res) => {
  const { full_name, phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'Số điện thoại là bắt buộc.' });

  if (isDbConnected) {
    try {
      const [existing] = await pool.query('SELECT id FROM customers WHERE phone = ?', [phone.trim()]);
      if (existing.length > 0) return res.status(409).json({ success: false, error: 'Số điện thoại đã được đăng ký.' });

      const [result] = await pool.query(
        'INSERT INTO customers (full_name, phone, reward_points) VALUES (?, ?, 0)',
        [full_name, phone.trim()]
      );
      const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, message: 'Thêm khách hàng thành công!', data: newCustomer[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Lỗi server khi thêm khách.' });
    }
  }
  
  if (mockCustomers.some(c => c.phone === phone.trim())) return res.status(409).json({ success: false, error: 'Số điện thoại đã tồn tại (Fallback).' });
  const newCust = { id: Math.max(...mockCustomers.map(c => c.id), 0) + 1, full_name, phone: phone.trim(), reward_points: 0 };
  mockCustomers.push(newCust);
  res.status(201).json({ success: true, message: 'Thêm khách thành công (Fallback)!', data: newCust });
});

// =========================================================================
// MODULE HÓA ĐƠN & TÍNH TIỀN (CICD #14)
// =========================================================================
app.post('/api/invoices', async (req, res) => {
  const { customer_id, items, voucher_code } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ success: false, error: 'Giỏ hàng trống.' });

  try {
    let subTotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    let discountAmount = 0;

    if (voucher_code) {
      let voucher = null;
      if (isDbConnected) {
        const [vRows] = await pool.query('SELECT * FROM vouchers WHERE code = ? AND is_active = 1', [voucher_code]);
        if (vRows.length > 0) voucher = vRows[0];
      } else {
        voucher = mockVouchers.find(v => v.code === voucher_code && v.is_active === 1);
      }

      if (voucher && subTotal >= voucher.min_order_value) {
        discountAmount = voucher.discount_type === 'percent' ? subTotal * (voucher.discount_value / 100) : voucher.discount_value;
      }
    }

    const finalTotal = Math.max(0, subTotal - discountAmount);
    const pointsEarned = Math.floor(finalTotal / 10000);

    if (isDbConnected) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [invResult] = await connection.query('INSERT INTO invoices (customer_id, sub_total, discount_amount, final_total) VALUES (?, ?, ?, ?)', [customer_id || null, subTotal, discountAmount, finalTotal]);
        if (customer_id && pointsEarned > 0) await connection.query('UPDATE customers SET reward_points = reward_points + ? WHERE id = ?', [pointsEarned, customer_id]);
        await connection.commit();
        connection.release();
        return res.status(201).json({ success: true, message: 'Thanh toán thành công!', data: { invoice_id: invResult.insertId, sub_total: subTotal, discount: discountAmount, final_total: finalTotal, points_earned: pointsEarned } });
      } catch (dbErr) {
        await connection.rollback();
        connection.release();
        throw dbErr;
      }
    }

    const newInvoice = { id: mockInvoices.length + 1, customer_id, sub_total: subTotal, discount_amount: discountAmount, final_total: finalTotal };
    mockInvoices.push(newInvoice);
    if (customer_id && pointsEarned > 0) {
      const cust = mockCustomers.find(c => c.id === customer_id);
      if (cust) cust.reward_points += pointsEarned;
    }
    res.status(201).json({ success: true, message: 'Thanh toán thành công (Fallback)!', data: { ...newInvoice, points_earned: pointsEarned } });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi hệ thống khi thanh toán.' });
  }
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
// Lấy danh sách khách hàng
app.get('/api/customers', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM customers');
    res.json(rows);
});

// Thêm khách hàng mới
app.post('/api/customers', async (req, res) => {
    const { customer_name, phone } = req.body;
    const [result] = await pool.query('INSERT INTO customers (customer_name, phone) VALUES (?, ?)', [customer_name, phone]);
    res.status(201).json({ id: result.insertId, customer_name, phone });
});
// Lấy danh sách voucher
app.get('/api/vouchers', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM discounts');
    res.json(rows);
});

// Tạo voucher mới
app.post('/api/vouchers', async (req, res) => {
    const { voucher_code, discount_type, discount_value, expiry_date } = req.body;
    const [result] = await pool.query('INSERT INTO discounts (voucher_code, discount_type, discount_value, expiry_date) VALUES (?, ?, ?, ?)', 
        [voucher_code, discount_type, discount_value, expiry_date]);
    res.status(201).json({ id: result.insertId, voucher_code });
});
// Tạo hóa đơn mới (Sau khi thanh toán xong một order)
app.post('/api/invoices', async (req, res) => {
    const { order_id, customer_id, discount_id, total_amount, final_amount, payment_method } = req.body;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO invoices (order_id, customer_id, discount_id, total_amount, final_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
            [order_id, customer_id, discount_id, total_amount, final_amount, payment_method]
        );
        
        // Cập nhật trạng thái order thành 'Đã hoàn thành'
        await pool.query('UPDATE orders SET status = "Đã hoàn thành" WHERE id = ?', [order_id]);
        
        res.status(201).json({ message: "Hóa đơn đã được tạo thành công", invoice_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});