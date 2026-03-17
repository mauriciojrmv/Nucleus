import { create } from 'zustand';
import {
  getTasks, getTodayTasks, addTask, toggleTask, deleteTask, updateTask,
  getTransactions, addTransaction, deleteTransaction,
  getMonthlyBalance, getSavingsGoals, addSavingsGoal,
  deleteSavingsGoal, updateSavingsGoal, getSetting, setSetting,
  getExpensesByCategory, getLast6MonthsData, getTaskCompletionRate,
  getUpcomingTasks, updateTaskStreak, resetTaskStreak,
} from '../database/database';

export const useTaskStore = create((set, get) => ({
  // ─── TASKS ───────────────────────────────────────────
  tasks: [],
  activeFrequency: 'daily',
  upcomingTasks: [],

  setFrequency: (frequency) => set({ activeFrequency: frequency }),

  loadTasks: (frequency) => {
    const tasks = getTasks(frequency);
    set({ tasks });
  },

  homeTasks: [],

  loadTodayTasks: () => {
    const homeTasks = getTodayTasks();
    set({ homeTasks });
  },

  loadUpcomingTasks: () => {
    const upcomingTasks = getUpcomingTasks();
    set({ upcomingTasks });
  },

  createTask: (task) => {
    addTask(task);
    const tasks = getTasks(task.frequency || 'daily');
    set({ tasks });
  },

  editTask: (id, task) => {
    updateTask(id, task);
    const homeTasks = getTodayTasks();
    const upcomingTasks = getUpcomingTasks();
    set({ homeTasks, upcomingTasks });
  },

  completeTask: (id, current, isRecurring, streak, lastCompletedDate) => {
    toggleTask(id, current);
    if (!current) {
      if (isRecurring) updateTaskStreak(id, streak || 0, lastCompletedDate);
    } else {
      if (isRecurring) resetTaskStreak(id);
    }
    // Update both task lists
    const tasks = getTasks(useTaskStore.getState().activeFrequency);
    const homeTasks = getTodayTasks();
    set({ tasks, homeTasks });
  },

  removeTask: (id) => {
    deleteTask(id);
    const tasks = getTasks(get().activeFrequency);
    set({ tasks });
  },

  // ─── TRANSACTIONS ─────────────────────────────────────
  transactions: [],
  balance: { income: 0, expenses: 0, balance: 0 },
  activeFilter: 'all',

  setFilter: (filter) => {
    set({ activeFilter: filter });
    const transactions = getTransactions(filter);
    set({ transactions });
  },

  loadTransactions: () => {
    const transactions = getTransactions(get().activeFilter);
    const balance = getMonthlyBalance();
    set({ transactions, balance });
  },

  createTransaction: (transaction) => {
    addTransaction(transaction);
    const transactions = getTransactions(get().activeFilter);
    const balance = getMonthlyBalance();
    set({ transactions, balance });
  },

  removeTransaction: (id) => {
    deleteTransaction(id);
    const transactions = getTransactions(get().activeFilter);
    const balance = getMonthlyBalance();
    set({ transactions, balance });
  },

  checkBudgetAlert: (category) => {
    try {
      const budgetLimits = getSetting('budgetLimits');
      if (!budgetLimits) return null;
      const limits = JSON.parse(budgetLimits);
      const limit = limits[category];
      if (!limit) return null;
      const month = new Date().toISOString().slice(0, 7);
      const result = getTransactions('expense').filter(
        t => t.category === category && t.date.startsWith(month)
      );
      const spent = result.reduce((sum, t) => sum + t.amount, 0);
      const percentage = (spent / limit) * 100;
      if (percentage >= 80) {
        return { category, spent, limit, percentage };
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  // ─── SAVINGS ──────────────────────────────────────────
  savingsGoals: [],

  loadSavingsGoals: () => {
    const savingsGoals = getSavingsGoals();
    set({ savingsGoals });
  },

  createSavingsGoal: (goal) => {
    addSavingsGoal(goal);
    const savingsGoals = getSavingsGoals();
    set({ savingsGoals });
  },

  removeSavingsGoal: (id) => {
    deleteSavingsGoal(id);
    const savingsGoals = getSavingsGoals();
    set({ savingsGoals });
  },

  addToSavingsGoal: (id, amountToAdd, currentAmount) => {
    const newAmount = currentAmount + amountToAdd;
    updateSavingsGoal(id, newAmount);
    const savingsGoals = getSavingsGoals();
    set({ savingsGoals });
  },

  // ─── SETTINGS ─────────────────────────────────────────
  currency: 'Bs',
  userName: '',
  theme: 'dark',
  language: 'es',

  loadSettings: () => {
    const currency = getSetting('currency') || 'Bs';
    const userName = getSetting('userName') || '';
    const theme = getSetting('theme') || 'dark';
    const language = getSetting('language') || 'es';
    set({ currency, userName, theme, language });
  },

  updateCurrency: (currency) => {
    setSetting('currency', currency);
    set({ currency });
  },

  updateUserName: (userName) => {
    setSetting('userName', userName);
    set({ userName });
  },

  updateTheme: (theme) => {
    setSetting('theme', theme);
    set({ theme });
  },

  updateLanguage: (language) => {
    setSetting('language', language);
    set({ language });
  },

  saveAllSettings: (settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      setSetting(key, String(value));
    });
    set(settings);
  },

  // ─── DASHBOARD ────────────────────────────────────────
  expensesByCategory: [],
  last6Months: [],
  taskRates: {
    daily: { total: 0, completed: 0, rate: 0 },
    weekly: { total: 0, completed: 0, rate: 0 },
    monthly: { total: 0, completed: 0, rate: 0 },
  },

  loadDashboard: () => {
    const expensesByCategory = getExpensesByCategory();
    const last6Months = getLast6MonthsData();
    const taskRates = getTaskCompletionRate();
    const balance = getMonthlyBalance();
    const savingsGoals = getSavingsGoals();
    set({ expensesByCategory, last6Months, taskRates, balance, savingsGoals });
  },
}));