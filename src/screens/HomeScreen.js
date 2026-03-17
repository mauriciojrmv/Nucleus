import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, Switch, StatusBar, Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/colors';
import { strings, formatDateSpanish } from '../theme/strings';
import SwipeableTaskCard from '../components/SwipeableTaskCard';

const TASK_CATEGORIES = [
  strings.categoryGeneral,
  strings.categoryWork,
  strings.categoryHealth,
  strings.categoryPersonal,
  strings.categoryFinance,
];

const FREQUENCIES = [
  { key: 'daily', label: strings.daily },
  { key: 'weekly', label: strings.weekly },
  { key: 'monthly', label: strings.monthly },
];

const EXPENSE_CATEGORIES = [
  '🍔 Comida', '🏠 Alquiler', '🚗 Transporte',
  '🎮 Entretenimiento', '💊 Salud', '👕 Ropa',
  '📚 Educación', '📦 Otros gastos',
];

const INCOME_CATEGORIES = [
  '💼 Salario', '💻 Freelance', '💰 Otros ingresos',
];

const EMPTY_TASK = {
  title: '', notes: '', category: strings.categoryGeneral,
  frequency: 'daily', is_recurring: false, due_date: null,
};

export default function HomeScreen({ isFocused }) {
  const { colors } = useTheme();
  const {
    homeTasks, balance, savingsGoals, currency, userName,
    upcomingTasks,
    loadTodayTasks, loadTransactions, loadSavingsGoals,
    loadSettings, loadUpcomingTasks,
    createTask, completeTask, removeTask,
    createTransaction, editTask,
  } = useTaskStore();

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [choiceVisible, setChoiceVisible] = useState(false);
  const [txType, setTxType] = useState('expense');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTask, setNewTask] = useState(EMPTY_TASK);
  const [newTx, setNewTx] = useState({
    type: 'expense', amount: '', category: '🍔 Comida', note: '',
  });

  useEffect(() => {
    loadTodayTasks();
    loadTransactions();
    loadSavingsGoals();
    loadSettings();
    loadUpcomingTasks();
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadTodayTasks();
      loadTransactions();
      loadSavingsGoals();
      loadSettings();
      loadUpcomingTasks();
    }
  }, [isFocused]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return strings.greetingMorning;
    if (h < 18) return strings.greetingAfternoon;
    return strings.greetingEvening;
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().slice(0, 10);
    const [ty, tm, td] = today.split('-').map(Number);
    const [dy, dm, dd] = dateStr.split('-').map(Number);
    const todayDate = new Date(ty, tm - 1, td);
    const dueDate = new Date(dy, dm - 1, dd);
    const daysLeft = Math.ceil((dueDate - todayDate) / 86400000);
    if (daysLeft < 0) return { label: 'Vencida', color: colors.expense };
    if (daysLeft === 0) return { label: 'Hoy', color: colors.warning };
    if (daysLeft === 1) return { label: 'Mañana', color: colors.warning };
    if (daysLeft <= 7) return { label: 'en ' + daysLeft + ' días', color: colors.info };
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return { label: dd + ' ' + months[dm - 1], color: colors.textMuted };
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      notes: task.notes || '',
      category: task.category,
      frequency: task.frequency,
      is_recurring: task.is_recurring === 1,
      due_date: task.due_date || null,
    });
    setTaskModalVisible(true);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    if (editingTask) {
      editTask(editingTask.id, newTask);
    } else {
      createTask(newTask);
    }
    loadTodayTasks();
    loadUpcomingTasks();
    setNewTask(EMPTY_TASK);
    setEditingTask(null);
    setTaskModalVisible(false);
  };

  const handleDeleteTask = (id) => {
    removeTask(id);
    loadTodayTasks();
    loadUpcomingTasks();
  };

  const handleDeleteFromModal = () => {
    Alert.alert(strings.deleteTask, strings.deleteTaskConfirm, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.delete,
        style: 'destructive',
        onPress: () => {
          handleDeleteTask(editingTask.id);
          setTaskModalVisible(false);
          setEditingTask(null);
          setNewTask(EMPTY_TASK);
        },
      },
    ]);
  };

  const handleAddTx = () => {
    if (!newTx.amount || isNaN(newTx.amount)) return;
    createTransaction({
      ...newTx,
      amount: parseFloat(newTx.amount),
      date: new Date().toISOString(),
    });
    setNewTx({ type: 'expense', amount: '', category: '🍔 Comida', note: '' });
    setTxModalVisible(false);
  };

  const openTxModal = (type) => {
    setTxType(type);
    setNewTx({
      type,
      amount: '',
      category: type === 'expense' ? '🍔 Comida' : '💼 Salario',
      note: '',
    });
    setChoiceVisible(false);
    setTxModalVisible(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewTask({ ...newTask, due_date: selectedDate.toISOString().slice(0, 10) });
    }
  };

  const formatAmount = (amount) => currency + ' ' + parseFloat(amount).toFixed(2);
  const tasks = homeTasks || [];
  const displayedTasks = showAllTasks ? tasks : tasks.slice(0, 5);
  const pendingTasks = tasks.filter(t => t.is_completed === 0);
  const completedTasks = tasks.filter(t => t.is_completed === 1);
  const txCategories = txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>
              {greeting() + (userName ? ', ' + userName : '') + ' 👋'}
            </Text>
            <Text style={s.date}>{formatDateSpanish()}</Text>
          </View>
          <View style={s.headerStats}>
            <Text style={s.headerStatNumber}>{pendingTasks.length}</Text>
            <Text style={s.headerStatLabel}>pendientes</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>{strings.thisMonthBalance}</Text>
          <Text style={s.balanceAmount}>{formatAmount(balance.balance)}</Text>
          <View style={s.balanceRow}>
            <View style={s.balanceItem}>
              <Text style={s.incomeLabel}>{'↑ ' + strings.income}</Text>
              <Text style={s.incomeAmount}>{formatAmount(balance.income)}</Text>
            </View>
            <View style={s.balanceDivider} />
            <View style={s.balanceItem}>
              <Text style={s.expenseLabel}>{'↓ ' + strings.expenses}</Text>
              <Text style={s.expenseAmount}>{formatAmount(balance.expenses)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.quickActions}>
          <TouchableOpacity
            style={s.quickBtn}
            onPress={() => {
              setEditingTask(null);
              setNewTask(EMPTY_TASK);
              setTaskModalVisible(true);
            }}
          >
            <Text style={s.quickBtnEmoji}>📝</Text>
            <Text style={s.quickBtnText}>Nueva Tarea</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => openTxModal('expense')}>
            <Text style={s.quickBtnEmoji}>💸</Text>
            <Text style={s.quickBtnText}>Nuevo Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => openTxModal('income')}>
            <Text style={s.quickBtnEmoji}>💵</Text>
            <Text style={s.quickBtnText}>Nuevo Ingreso</Text>
          </TouchableOpacity>
        </View>

        {/* Savings Goals Mini */}
        {savingsGoals.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{'🎯 ' + strings.savingsGoals}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {savingsGoals.map((goal) => {
                const progress = Math.min(
                  (goal.current_amount / goal.target_amount) * 100, 100
                );
                return (
                  <View
                    key={goal.id}
                    style={[s.miniGoalCard, { borderLeftColor: goal.color, borderLeftWidth: 3 }]}
                  >
                    <Text style={s.miniGoalName} numberOfLines={1}>{goal.name}</Text>
                    <View style={s.miniProgressBar}>
                      <View style={[s.miniProgressFill, {
                        width: progress + '%',
                        backgroundColor: goal.color,
                      }]} />
                    </View>
                    <Text style={[s.miniGoalPercent, { color: goal.color }]}>
                      {Math.round(progress) + '%'}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Upcoming Due Tasks */}
        {upcomingTasks && upcomingTasks.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>⚠️ Próximas a vencer</Text>
            {upcomingTasks.map((task) => {
              const dueDateInfo = formatDueDate(task.due_date);
              return (
                <View key={task.id} style={s.upcomingCard}>
                  <View style={[s.upcomingDot, { backgroundColor: dueDateInfo?.color }]} />
                  <Text style={s.upcomingTitle} numberOfLines={1}>{task.title}</Text>
                  <View style={[s.dueDateChip, {
                    backgroundColor: (dueDateInfo?.color || colors.textMuted) + '22'
                  }]}>
                    <Text style={[s.dueDateChipText, { color: dueDateInfo?.color }]}>
                      {'📅 ' + dueDateInfo?.label}
                    </Text>
                  </View>
                  <TouchableOpacity style={s.upcomingEditBtn} onPress={() => openEditModal(task)}>
                    <Text style={s.upcomingEditText}>✏️</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Today's Tasks */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{strings.todayTasks}</Text>
            {tasks.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllTasks(!showAllTasks)}>
                <Text style={s.sectionAction}>
                  {showAllTasks ? 'Ver menos' : 'Ver todas (' + tasks.length + ')'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {tasks.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyEmoji}>🎉</Text>
              <Text style={s.emptyText}>{strings.noTasksToday}</Text>
              <Text style={s.emptySubtext}>{strings.tapToAdd}</Text>
            </View>
          ) : (
            <>
              {displayedTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onDelete={handleDeleteTask}
                  onEdit={openEditModal}
                  formatDueDate={formatDueDate}
                />
              ))}
              {tasks.length > 0 && (
                <View style={s.taskProgress}>
                  <View style={s.taskProgressBar}>
                    <View style={[s.taskProgressFill, {
                      width: (tasks.length > 0
                        ? Math.round((completedTasks.length / tasks.length) * 100)
                        : 0) + '%'
                    }]} />
                  </View>
                  <Text style={s.taskProgressText}>
                    {completedTasks.length + '/' + tasks.length + ' completadas'}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setChoiceVisible(true)}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* Choice Modal */}
      <Modal visible={choiceVisible} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setChoiceVisible(false)} />
        <View style={s.choiceSheet}>
          <Text style={s.choiceTitle}>{strings.whatToAdd}</Text>
          <TouchableOpacity
            style={s.choiceButton}
            onPress={() => {
              setEditingTask(null);
              setNewTask(EMPTY_TASK);
              setChoiceVisible(false);
              setTaskModalVisible(true);
            }}
          >
            <Text style={s.choiceEmoji}>📝</Text>
            <Text style={s.choiceText}>{strings.task}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.choiceButton} onPress={() => openTxModal('expense')}>
            <Text style={s.choiceEmoji}>💸</Text>
            <Text style={s.choiceText}>Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.choiceButton} onPress={() => openTxModal('income')}>
            <Text style={s.choiceEmoji}>💵</Text>
            <Text style={s.choiceText}>Ingreso</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add / Edit Task Modal */}
      <Modal visible={taskModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={s.overlay}
          onPress={() => {
            setTaskModalVisible(false);
            setEditingTask(null);
            setNewTask(EMPTY_TASK);
          }}
        />
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>
            {editingTask ? '✏️ Editar Tarea' : strings.newTask}
          </Text>
          <TextInput
            style={s.input}
            placeholder={strings.taskTitle}
            placeholderTextColor={colors.textMuted}
            value={newTask.title}
            onChangeText={(t) => setNewTask({ ...newTask, title: t })}
            autoFocus={!editingTask}
          />
          <TextInput
            style={[s.input, { height: 70 }]}
            placeholder={strings.notesPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={newTask.notes}
            onChangeText={(t) => setNewTask({ ...newTask, notes: t })}
            multiline
          />
          <Text style={s.label}>{strings.category}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {TASK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[s.pill, newTask.category === cat && s.pillActive]}
                onPress={() => setNewTask({ ...newTask, category: cat })}
              >
                <Text style={[s.pillText, newTask.category === cat && s.pillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={s.label}>{strings.frequency}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq.key}
                style={[s.pill, newTask.frequency === freq.key && s.pillActive]}
                onPress={() => setNewTask({ ...newTask, frequency: freq.key })}
              >
                <Text style={[s.pillText, newTask.frequency === freq.key && s.pillTextActive]}>{freq.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.dueDateRow}>
            <Text style={s.label}>📅 Fecha límite</Text>
            <View style={s.dueDateActions}>
              <TouchableOpacity style={s.dueDateBtn} onPress={() => setShowDatePicker(true)}>
                <Text style={s.dueDateBtnText}>
                  {newTask.due_date ? formatDueDate(newTask.due_date)?.label : 'Agregar fecha'}
                </Text>
              </TouchableOpacity>
              {newTask.due_date && (
                <TouchableOpacity style={s.dueDateClear} onPress={() => setNewTask({ ...newTask, due_date: null })}>
                  <Text style={s.dueDateClearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={s.switchRow}>
            <Text style={s.label}>{strings.recurring}</Text>
            <Switch
              value={newTask.is_recurring}
              onValueChange={(v) => setNewTask({ ...newTask, is_recurring: v })}
              trackColor={{ true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <TouchableOpacity style={s.addButton} onPress={handleAddTask}>
            <Text style={s.addButtonText}>
              {editingTask ? '💾 Guardar Cambios' : strings.addTask}
            </Text>
          </TouchableOpacity>
          {editingTask && (
            <TouchableOpacity style={s.deleteButton} onPress={handleDeleteFromModal}>
              <Text style={s.deleteButtonText}>🗑 Eliminar Tarea</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={txModalVisible} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setTxModalVisible(false)} />
        <View style={s.sheet}>
          <Text style={s.sheetTitle}>
            {txType === 'income' ? '💵 Nuevo Ingreso' : '💸 Nuevo Gasto'}
          </Text>
          <TextInput
            style={s.input}
            placeholder={strings.transactionAmount}
            placeholderTextColor={colors.textMuted}
            value={newTx.amount}
            onChangeText={(t) => setNewTx({ ...newTx, amount: t })}
            keyboardType="numeric"
          />
          <TextInput
            style={s.input}
            placeholder={strings.transactionNote}
            placeholderTextColor={colors.textMuted}
            value={newTx.note}
            onChangeText={(t) => setNewTx({ ...newTx, note: t })}
          />
          <Text style={s.label}>{strings.category}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {txCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[s.pill, newTx.category === cat && s.pillActive]}
                onPress={() => setNewTx({ ...newTx, category: cat })}
              >
                <Text style={[s.pillText, newTx.category === cat && s.pillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[s.addButton, {
              backgroundColor: txType === 'income' ? colors.income : colors.expense
            }]}
            onPress={handleAddTx}
          >
            <Text style={s.addButtonText}>{strings.addTransaction}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={newTask.due_date ? new Date(newTask.due_date) : new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.topPadding },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  headerStats: { backgroundColor: colors.card, borderRadius: 12, padding: 10, alignItems: 'center', minWidth: 60 },
  headerStatNumber: { color: colors.primary, fontSize: 20, fontWeight: '800' },
  headerStatLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 24, marginBottom: 20 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  incomeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  incomeAmount: { color: '#A7F3D0', fontSize: 16, fontWeight: '700' },
  expenseLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  expenseAmount: { color: '#FCA5A5', fontSize: 16, fontWeight: '700' },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  quickBtnEmoji: { fontSize: 22, marginBottom: 6 },
  quickBtnText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  sectionAction: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  miniGoalCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginRight: 10, width: 140 },
  miniGoalName: { color: colors.textPrimary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  miniProgressBar: { height: 4, backgroundColor: colors.cardLight, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  miniProgressFill: { height: '100%', borderRadius: 2 },
  miniGoalPercent: { fontSize: 11, fontWeight: '700' },
  upcomingCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  upcomingDot: { width: 8, height: 8, borderRadius: 4 },
  upcomingTitle: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  upcomingEditBtn: { padding: 4 },
  upcomingEditText: { fontSize: 16 },
  dueDateChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  dueDateChipText: { fontSize: 11, fontWeight: '600' },
  emptyCard: { backgroundColor: colors.card, borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  taskProgress: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskProgressBar: { flex: 1, height: 4, backgroundColor: colors.cardLight, borderRadius: 2, overflow: 'hidden' },
  taskProgressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.primary },
  taskProgressText: { color: colors.textMuted, fontSize: 11 },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 12 },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', marginTop: -2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  choiceSheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28 },
  choiceTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  choiceButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardLight, borderRadius: 14, padding: 18, marginBottom: 12 },
  choiceEmoji: { fontSize: 24, marginRight: 14 },
  choiceText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: colors.cardLight, borderRadius: 12, padding: 14, color: colors.textPrimary, fontSize: 15, marginBottom: 14 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  pill: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.cardLight, marginRight: 8 },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  dueDateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dueDateActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dueDateBtn: { backgroundColor: colors.cardLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  dueDateBtnText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
  dueDateClear: { backgroundColor: colors.cardLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  dueDateClearText: { color: colors.expense, fontSize: 13, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addButton: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteButton: { backgroundColor: 'rgba(244,63,94,0.15)', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: colors.expense },
  deleteButtonText: { color: colors.expense, fontSize: 16, fontWeight: '700' },
});