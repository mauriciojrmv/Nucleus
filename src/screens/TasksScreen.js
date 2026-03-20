import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, Switch, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/colors';
import { strings } from '../theme/strings';
import { getTasks } from '../database/database';
import SwipeableTaskCard from '../components/SwipeableTaskCard';
import { scheduleTaskReminder, cancelTaskReminder } from '../utils/notifications';

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

const EMPTY_TASK = {
  title: '', notes: '', category: strings.categoryGeneral,
  frequency: 'daily', is_recurring: false, due_date: null, due_time: '',
};

export default function TasksScreen({ isFocused }) {
  const { colors } = useTheme();
  const {
    tasks, activeFrequency, setFrequency, loadTasks,
    createTask, completeTask, removeTask, editTask,
  } = useTaskStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [badges, setBadges] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTask, setNewTask] = useState(EMPTY_TASK);

  useEffect(() => {
    loadTasks(activeFrequency);
    refreshBadges();
  }, [activeFrequency]);

  const refreshBadges = () => {
    const daily = getTasks('daily').filter(t => !t.is_completed).length;
    const weekly = getTasks('weekly').filter(t => !t.is_completed).length;
    const monthly = getTasks('monthly').filter(t => !t.is_completed).length;
    setBadges({ daily, weekly, monthly });
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

  const handleAdd = async () => {
    if (!newTask.title.trim()) return;
    if (editingTask) {
      editTask(editingTask.id, newTask);
      if (newTask.due_time) {
        await scheduleTaskReminder({ ...newTask, id: editingTask.id });
      } else {
        await cancelTaskReminder(editingTask.id);
      }
    } else {
      createTask({ ...newTask });
      const allTasks = getTasks(newTask.frequency);
      const created = allTasks[0];
      if (created && newTask.due_time) {
        await scheduleTaskReminder({ ...newTask, id: created.id });
      }
    }
    loadTasks(activeFrequency);
    refreshBadges();
    setNewTask(EMPTY_TASK);
    setEditingTask(null);
    setModalVisible(false);
  };

  const handleComplete = (id, is_completed, is_recurring, streak, last_completed_date) => {
    completeTask(id, is_completed, is_recurring, streak, last_completed_date);
    refreshBadges();
  };

  const handleDelete = (id) => {
    removeTask(id);
    refreshBadges();
  };

  const handleDeleteFromModal = () => {
    Alert.alert(strings.deleteTask, strings.deleteTaskConfirm, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.delete,
        style: 'destructive',
        onPress: () => {
          handleDelete(editingTask.id);
          setModalVisible(false);
          setEditingTask(null);
          setNewTask(EMPTY_TASK);
        },
      },
    ]);
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
      due_time: task.due_time || '',
    });
    setModalVisible(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewTask({ ...newTask, due_date: selectedDate.toISOString().slice(0, 10) });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setNewTask({ ...newTask, due_time: hours + ':' + minutes });
    }
  };

  const getTimePickerValue = () => {
    if (newTask.due_time) {
      const [h, m] = newTask.due_time.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0);
      return d;
    }
    return new Date();
  };

  const completed = tasks.filter((t) => t.is_completed === 1);
  const pending = tasks.filter((t) => t.is_completed === 0);

  const getFrequencyLabel = () => {
    const found = FREQUENCIES.find(f => f.key === activeFrequency);
    return found ? found.label.toLowerCase() : activeFrequency;
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.segmentRow}>
        {FREQUENCIES.map((freq) => (
          <TouchableOpacity
            key={freq.key}
            style={[s.segment, activeFrequency === freq.key && s.segmentActive]}
            onPress={() => setFrequency(freq.key)}
          >
            <View style={s.segmentInner}>
              <Text style={[s.segmentText, activeFrequency === freq.key && s.segmentTextActive]}>
                {freq.label}
              </Text>
              {badges[freq.key] > 0 && (
                <View style={[s.badge, activeFrequency === freq.key ? s.badgeActive : s.badgeInactive]}>
                  <Text style={s.badgeText}>{badges[freq.key]}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{pending.length}</Text>
            <Text style={s.statLabel}>{strings.pending}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNumber, { color: colors.income }]}>{completed.length}</Text>
            <Text style={s.statLabel}>{strings.done}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNumber, { color: colors.primaryLight }]}>
              {tasks.length > 0
                ? Math.round((completed.length / tasks.length) * 100) + '%'
                : '0%'}
            </Text>
            <Text style={s.statLabel}>{strings.rate}</Text>
          </View>
        </View>

        {tasks.length > 0 && (
          <Text style={s.swipeHint}>{'← Eliminar  •  → Completar'}</Text>
        )}

        {pending.length > 0 && (
          <>
            <Text style={s.sectionLabel}>{strings.todo}</Text>
            {pending.map((task) => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={openEditModal}
                formatDueDate={formatDueDate}
              />
            ))}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Text style={s.sectionLabel}>{strings.completed}</Text>
            {completed.map((task) => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                formatDueDate={formatDueDate}
              />
            ))}
          </>
        )}

        {tasks.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>✨</Text>
            <Text style={s.emptyText}>{'Sin tareas ' + getFrequencyLabel()}</Text>
            <Text style={s.emptySubtext}>{strings.addFirstTask}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={s.fab}
        onPress={() => {
          setEditingTask(null);
          setNewTask(EMPTY_TASK);
          setModalVisible(true);
        }}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={s.overlay}
            onPress={() => {
              setModalVisible(false);
              setEditingTask(null);
              setNewTask(EMPTY_TASK);
            }}
          />
          <ScrollView
            style={{ backgroundColor: 'transparent' }}
            contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
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
            <View style={s.dueDateRow}>
              <Text style={s.label}>🔔 Recordatorio</Text>
              <View style={s.dueDateActions}>
                <TouchableOpacity style={s.dueDateBtn} onPress={() => setShowTimePicker(true)}>
                  <Text style={s.dueDateBtnText}>{newTask.due_time || 'Agregar hora'}</Text>
                </TouchableOpacity>
                {newTask.due_time ? (
                  <TouchableOpacity style={s.dueDateClear} onPress={() => setNewTask({ ...newTask, due_time: '' })}>
                    <Text style={s.dueDateClearText}>✕</Text>
                  </TouchableOpacity>
                ) : null}
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
            <TouchableOpacity style={s.addButton} onPress={handleAdd}>
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
        </ScrollView>
        </KeyboardAvoidingView>
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
      {showTimePicker && (
        <DateTimePicker
          value={getTimePickerValue()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.topPadding },
  segmentRow: { flexDirection: 'row', backgroundColor: colors.card, margin: 16, borderRadius: 14, padding: 4 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: colors.primary },
  segmentInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  segmentText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  segmentTextActive: { color: '#fff' },
  badge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  badgeInactive: { backgroundColor: colors.primary },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, alignItems: 'center' },
  statNumber: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  swipeHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
  sectionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, marginTop: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: colors.textSecondary, fontSize: 14, marginTop: 6 },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', marginTop: -2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
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