// Notifications are disabled in Expo Go (SDK 53+)
// They will be enabled when building the final APK

export const requestNotificationPermission = async () => false;
export const scheduleTaskReminder = async () => null;
export const cancelTaskReminder = async () => {};
export const sendBudgetAlert = async () => {};
export const scheduleDailySummary = async () => {};
export const cancelAllNotifications = async () => {};