import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('nucleus.db');

export const initDatabase = () => {
  db.execSync(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    notes TEXT,
    category TEXT DEFAULT 'General',
    frequency TEXT DEFAULT 'daily',
    due_time TEXT,
    is_recurring INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );`);
  db.execSync(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    note TEXT,
    date TEXT DEFAULT (datetime('now')),
    is_recurring INTEGER DEFAULT 0
  );`);
  db.execSync(`CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    deadline TEXT,
    color TEXT DEFAULT '#7C3AED'
  );`);
  db.execSync(`CREATE TABLE IF NOT EXISTS budget_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    monthly_limit REAL NOT NULL,
    current_spent REAL DEFAULT 0
  );`);
  db.execSync(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );`);
  // Default currency
  db.execSync(`INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'Bs');`);
// Migration — add due_date if not exists
  try {
    db.execSync('ALTER TABLE tasks ADD COLUMN due_date TEXT');
  } catch (e) {
    // Column already exists — ignore
  }

  // Migration — add streak columns
  try {
    db.execSync('ALTER TABLE tasks ADD COLUMN streak INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.execSync('ALTER TABLE tasks ADD COLUMN last_completed_date TEXT');
  } catch (e) {}

};

// ─── TASKS ────────────────────────────────────────────
export const getTasks = (frequency) => {
  return db.getAllSync(
    'SELECT * FROM tasks WHERE frequency = ? ORDER BY is_completed ASC, created_at DESC',
    [frequency]
  );
};

export const getTodayTasks = () => {
  const today = new Date().toISOString().slice(0, 10);
  return db.getAllSync(
    `SELECT * FROM tasks 
     WHERE (frequency = 'daily' AND (due_date IS NULL OR due_date = '' OR due_date = ?))
     OR (due_date = ?)
     ORDER BY is_completed ASC, due_date ASC, created_at DESC`,
    [today, today]
  );
};

export const updateTask = (id, task) => {
  const { title, notes, category, frequency, is_recurring, due_date } = task;
  db.runSync(
    `UPDATE tasks SET 
      title = ?, notes = ?, category = ?, 
      frequency = ?, is_recurring = ?, due_date = ?
     WHERE id = ?`,
    [title, notes || '', category, frequency, is_recurring ? 1 : 0, due_date || null, id]
  );
};

export const addTask = (task) => {
  const { title, notes, category, frequency, due_time, is_recurring, due_date } = task;
  db.runSync(
    'INSERT INTO tasks (title, notes, category, frequency, due_time, is_recurring, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, notes || '', category || 'General', frequency || 'daily', due_time || '', is_recurring ? 1 : 0, due_date || null]
  );
};

export const toggleTask = (id, current) => {
  db.runSync('UPDATE tasks SET is_completed = ? WHERE id = ?', [current ? 0 : 1, id]);
};

export const deleteTask = (id) => {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
};

export const resetRecurringTasks = (frequency) => {
  db.runSync(
    'UPDATE tasks SET is_completed = 0 WHERE is_recurring = 1 AND frequency = ?',
    [frequency]
  );
};

// ─── TRANSACTIONS ─────────────────────────────────────
export const getTransactions = (filter = 'all') => {
  if (filter === 'all') {
    return db.getAllSync('SELECT * FROM transactions ORDER BY date DESC');
  }
  return db.getAllSync(
    'SELECT * FROM transactions WHERE type = ? ORDER BY date DESC',
    [filter]
  );
};

export const addTransaction = (transaction) => {
  const { type, amount, category, note, date } = transaction;
  db.runSync(
    'INSERT INTO transactions (type, amount, category, note, date) VALUES (?, ?, ?, ?, ?)',
    [type, amount, category, note || '', date || new Date().toISOString()]
  );
};

export const deleteTransaction = (id) => {
  db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
};

export const getMonthlyBalance = () => {
  const month = new Date().toISOString().slice(0, 7);
  const income = db.getFirstSync(
    "SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date LIKE ?",
    [`${month}%`]
  );
  const expenses = db.getFirstSync(
    "SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date LIKE ?",
    [`${month}%`]
  );
  return {
    income: income?.total || 0,
    expenses: expenses?.total || 0,
    balance: (income?.total || 0) - (expenses?.total || 0),
  };
};

// ─── SAVINGS GOALS ────────────────────────────────────
export const getSavingsGoals = () => {
  return db.getAllSync('SELECT * FROM savings_goals ORDER BY id DESC');
};

export const addSavingsGoal = (goal) => {
  const { name, target_amount, current_amount, deadline, color } = goal;
  db.runSync(
    'INSERT INTO savings_goals (name, target_amount, current_amount, deadline, color) VALUES (?, ?, ?, ?, ?)',
    [name, target_amount, current_amount || 0, deadline || '', color || '#7C3AED']
  );
};

export const deleteSavingsGoal = (id) => {
  db.runSync('DELETE FROM savings_goals WHERE id = ?', [id]);
};

// ─── SETTINGS ─────────────────────────────────────────
export const getSetting = (key) => {
  const result = db.getFirstSync('SELECT value FROM settings WHERE key = ?', [key]);
  return result?.value || null;
};

export const setSetting = (key, value) => {
  db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};

export const updateSavingsGoal = (id, current_amount) => {
  db.runSync('UPDATE savings_goals SET current_amount = ? WHERE id = ?', [current_amount, id]);
};

// ─── DASHBOARD ────────────────────────────────────────
export const getExpensesByCategory = () => {
  const month = new Date().toISOString().slice(0, 7);
  return db.getAllSync(
    `SELECT category, SUM(amount) as total 
     FROM transactions 
     WHERE type = 'expense' AND date LIKE ? 
     GROUP BY category 
     ORDER BY total DESC`,
    [`${month}%`]
  );
};

export const getLast6MonthsData = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const label = monthNames[d.getMonth()];
    const income = db.getFirstSync(
      "SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date LIKE ?",
      [`${monthStr}%`]
    );
    const expenses = db.getFirstSync(
      "SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date LIKE ?",
      [`${monthStr}%`]
    );
    months.push({
      label,
      income: income?.total || 0,
      expenses: expenses?.total || 0,
    });
  }
  return months;
};

export const getTaskCompletionRate = () => {
  const rates = {};
  ['daily', 'weekly', 'monthly'].forEach((freq) => {
    const total = db.getFirstSync(
      'SELECT COUNT(*) as count FROM tasks WHERE frequency = ?', [freq]
    );
    const completed = db.getFirstSync(
      'SELECT COUNT(*) as count FROM tasks WHERE frequency = ? AND is_completed = 1', [freq]
    );
    rates[freq] = {
      total: total?.count || 0,
      completed: completed?.count || 0,
      rate: total?.count > 0
        ? Math.round((completed?.count / total?.count) * 100)
        : 0,
    };
  });
  return rates;
};

export const getAllSettings = () => {
  const rows = db.getAllSync('SELECT key, value FROM settings');
  const result = {};
  rows.forEach(r => { result[r.key] = r.value; });
  return result;
};

export const getOnboardingComplete = () => {
  const result = db.getFirstSync(
    "SELECT value FROM settings WHERE key = 'onboardingComplete'"
  );
  return result?.value === 'true';
};

export const setOnboardingComplete = () => {
  db.runSync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('onboardingComplete', 'true')"
  );
};

export const getUpcomingTasks = () => {
  const today = new Date().toISOString().slice(0, 10);
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return db.getAllSync(
    `SELECT * FROM tasks 
     WHERE due_date IS NOT NULL 
     AND due_date != '' 
     AND is_completed = 0
     AND due_date <= ?
     ORDER BY due_date ASC`,
    [in7Days]
  );
};

export const updateTaskStreak = (id, currentStreak, lastCompletedDate) => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let newStreak = 1;
  if (lastCompletedDate === yesterday || lastCompletedDate === today) {
    newStreak = currentStreak + 1;
  }

  db.runSync(
    'UPDATE tasks SET streak = ?, last_completed_date = ? WHERE id = ?',
    [newStreak, today, id]
  );
  return newStreak;
};

export const resetTaskStreak = (id) => {
  db.runSync('UPDATE tasks SET streak = 0, last_completed_date = NULL WHERE id = ?', [id]);
};

export const getTasksWithReminders = () => {
  return db.getAllSync(
    `SELECT * FROM tasks 
     WHERE due_time IS NOT NULL 
     AND due_time != '' 
     AND is_completed = 0`
  );
};