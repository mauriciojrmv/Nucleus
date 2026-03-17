# ⚡ Nucleus

> Tu centro de control personal — gestión de tareas y finanzas personales en una sola app.

![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_55-000020?style=flat-square&logo=expo)
![SQLite](https://img.shields.io/badge/SQLite-Local_DB-003B57?style=flat-square&logo=sqlite)
![Platform](https://img.shields.io/badge/Platform-Android_|_iOS-lightgrey?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📱 Screenshots

> *Built with React Native + Expo. Runs on Android and iOS.*

---

## 🌟 Features

### ✅ Task Management
- **Daily, weekly and monthly tasks** with frequency-based organization
- **Recurring tasks** with automatic reset and streak tracking 🔥
- **Due dates** with smart labels (Vencida / Hoy / Mañana / en X días)
- **Task reminders** — set a specific time for notifications per task
- **Swipe gestures** — swipe right to complete, swipe left to delete
- **Haptic feedback** on task completion
- **Progress tracking** with completion rate stats per frequency

### 💰 Wallet & Finances
- **Income and expense tracking** with categories
- **Monthly balance** overview (income vs expenses)
- **Savings goals** with progress bars and color coding
- **Budget limits** per category with 80% alert notifications
- **Swipe to delete** transactions
- **Filter transactions** by all / income / expense

### 📊 Dashboard
- **Financial health score** (0–100 pts) based on spending habits
- **Task productivity score** (0–100%) based on completion rates
- **Expense pie chart** by category
- **6-month bar chart** — income vs expenses history
- **Savings goals summary** with progress

### ⚙️ Settings
- **Profile** — personalize your name
- **Currency selector** — Bs, $, €, MXN, COP, S/
- **Theme** — Dark 🌙 / Light ☀️ with live preview
- **Budget limits** per expense category
- **Daily summary** notification time (configurable)

### 🎨 UX & Design
- **Swipe navigation** between tabs (like Instagram)
- **Bottom tab bar** with animated indicator
- **Dark / Light theme** system
- **Onboarding flow** — name + currency setup on first launch
- **Fully in Spanish** UI

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React Native + Expo SDK 55 | Cross-platform mobile framework |
| expo-sqlite | Local SQLite database (offline-first) |
| zustand | Lightweight state management |
| react-native-pager-view | Swipeable tab navigation |
| react-native-gesture-handler | Swipe gestures on cards |
| react-native-gifted-charts | Pie chart + bar chart |
| react-native-edge-to-edge | Edge-to-edge display support |
| expo-haptics | Haptic feedback |
| @react-native-community/datetimepicker | Date & time pickers |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone v.55 ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Or an Android/iOS simulator

### Installation

```bash
# Clone the repository
git clone https://github.com/mauriciojrmv/nucleus.git
cd nucleus

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on your phone

1. Open **Expo Go** on your phone
2. Scan the QR code shown in the terminal
3. The app will load on your device

### Running on a simulator

```bash
# Android
npx expo start --android

# iOS (macOS only)
npx expo start --ios
```

---

## 📁 Project Structure

```
Nucleus/
├── App.js                          # Root component + PagerView navigation
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build configuration
├── assets/                         # App icons and splash screen
└── src/
    ├── components/
    │   └── SwipeableTaskCard.js    # Reusable swipeable task card
    ├── database/
    │   └── database.js             # SQLite schema + all queries
    ├── screens/
    │   ├── HomeScreen.js           # Dashboard home with today's tasks
    │   ├── TasksScreen.js          # Full task management
    │   ├── WalletScreen.js         # Finance tracker
    │   ├── DashboardScreen.js      # Charts and health scores
    │   ├── SettingsScreen.js       # App settings
    │   └── OnboardingScreen.js     # First-launch setup
    ├── store/
    │   └── taskStore.js            # Zustand global state
    ├── theme/
    │   ├── colors.js               # Dark/light color palettes
    │   ├── strings.js              # Spanish UI strings
    │   └── ThemeContext.js         # Theme provider + useTheme hook
    └── utils/
        └── notifications.js        # Local notification helpers
```

---

## 🗄 Database Schema

```sql
-- Tasks
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'General',
  frequency TEXT DEFAULT 'daily',   -- daily | weekly | monthly
  due_date TEXT,
  due_time TEXT,
  is_recurring INTEGER DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_completed_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Transactions
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,               -- income | expense
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  date TEXT DEFAULT (datetime('now'))
);

-- Savings Goals
CREATE TABLE savings_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  deadline TEXT,
  color TEXT DEFAULT '#7C3AED'
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

---

## 📦 Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds.

### Android APK (for direct install)

```bash
eas build -p android --profile preview
```

### Android App Bundle (for Google Play Store)

```bash
eas build -p android --profile production
```

### iOS (requires Apple Developer account)

```bash
eas build -p ios --profile production
```

---

## 🔮 Roadmap

- [ ] 📤 Export data to CSV (to-do)
- [ ] 🔔 Push notifications (requires dev build) (to-do)
- [ ] 🌍 English language support (to-do)
- [*] 🎨 Full theme switching (light mode)
- [*] 📊 Weekly/monthly reports
- [ ] 🔄 Cloud sync / backup (to-do)
- [ ] 🏆 Achievements and badges (to-do)

---

## 👨‍💻 Author

**Mauricio Mattinen**

- GitHub: [@mauriciojrmv](https://github.com/mauriciojrmv)

---
