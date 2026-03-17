export const strings = {
  // General
  appName: 'Nucleus',
  loading: 'Cargando Nucleus...',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  add: 'Agregar',
  save: 'Guardar',
  confirm: 'Confirmar',
  optional: 'opcional',
  comingSoon: '¡Próximamente!',

  // Greetings
  greetingMorning: 'Buenos días',
  greetingAfternoon: 'Buenas tardes',
  greetingEvening: 'Buenas noches',

  // Home Screen
  thisMonthBalance: 'Balance del Mes',
  income: 'Ingresos',
  expenses: 'Gastos',
  todayTasks: 'Tareas de Hoy',
  noTasksToday: '¡Sin tareas por hoy!',
  tapToAdd: 'Toca + para agregar una',
  whatToAdd: '¿Qué quieres agregar?',
  task: 'Tarea',
  transaction: 'Transacción',
  transactionComingSoon: 'Transacción (próximamente)',

  // Tasks Screen
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  pending: 'Pendientes',
  done: 'Hechas',
  rate: 'Tasa',
  todo: 'POR HACER',
  completed: 'COMPLETADAS',
  noTasksYet: 'Sin tareas',
  addFirstTask: 'Toca + para agregar la primera',
  newTask: 'Nueva Tarea',
  taskTitle: 'Título de la tarea...',
  notes: 'Notas',
  notesPlaceholder: 'Notas (opcional)...',
  category: 'Categoría',
  frequency: 'Frecuencia',
  recurring: 'Recurrente 🔁',
  addTask: 'Agregar Tarea',
  deleteTask: 'Eliminar Tarea',
  deleteTaskConfirm: '¿Estás seguro que quieres eliminar esta tarea?',

  // Task Categories
  categoryGeneral: 'General',
  categoryWork: 'Trabajo',
  categoryHealth: 'Salud',
  categoryPersonal: 'Personal',
  categoryFinance: 'Finanzas',

  // Wallet Screen
  wallet: 'Billetera',
  walletComingSoon: '¡Viene en la Fase 2!',
  totalBalance: 'Balance Total',
  thisMonth: 'Este mes',
  all: 'Todos',
  incomeTab: 'Ingresos',
  expensesTab: 'Gastos',
  noTransactions: 'Sin transacciones',
  noTransactionsSubtext: 'Toca + para registrar una',
  newTransaction: 'Nueva Transacción',
  transactionAmount: 'Monto...',
  transactionNote: 'Nota (opcional)...',
  transactionType: 'Tipo',
  incomeType: '💚 Ingreso',
  expenseType: '🔴 Gasto',
  addTransaction: 'Agregar Transacción',
  deleteTransaction: 'Eliminar transacción',
  deleteTransactionConfirm: '¿Eliminar esta transacción?',
  savingsGoals: 'Metas de Ahorro',
  noGoals: 'Sin metas de ahorro',
  addGoal: 'Nueva Meta',
  goalName: 'Nombre de la meta...',
  goalTarget: 'Monto objetivo...',
  goalCurrent: 'Monto actual ahorrado...',
  goalDeadline: 'Fecha límite (opcional)...',
  of: 'de',
  saved: 'ahorrado',
  completed2: '¡Completada!',

  // Transaction Categories
  catFood: '🍔 Comida',
  catRent: '🏠 Alquiler',
  catTransport: '🚗 Transporte',
  catEntertainment: '🎮 Entretenimiento',
  catHealth: '💊 Salud',
  catClothing: '👕 Ropa',
  catEducation: '📚 Educación',
  catSalary: '💼 Salario',
  catFreelance: '💻 Freelance',
  catOtherIncome: '💰 Otros ingresos',
  catOther: '📦 Otros gastos',

  // Dashboard Screen
  dashboard: 'Resumen',
  dashboardComingSoon: '¡Viene en la Fase 3!',

  // Tab Bar
  tabHome: 'Inicio',
  tabTasks: 'Tareas',
  tabWallet: 'Billetera',
  tabDashboard: 'Resumen',

  // Settings
  settingsTitle: 'Ajustes',
  userName: 'Tu nombre',
  userNamePlaceholder: 'Escribe tu nombre...',
  currencyTitle: 'Moneda',
  themeTitle: 'Tema',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  languageTitle: 'Idioma',
  langSpanish: 'Español',
  langEnglish: 'English',
  saveSettings: 'Guardar Cambios',
  settingsSaved: '¡Ajustes guardados!',
  aboutTitle: 'Acerca de',
  appVersion: 'Versión 1.0.0',
  madeWith: 'Hecho con ❤️',
};

export const formatDateSpanish = (date = new Date()) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};