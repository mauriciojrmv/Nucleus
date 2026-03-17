import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, Alert,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/colors';
import { strings } from '../theme/strings';
import { sendBudgetAlert } from '../utils/notifications';

const EXPENSE_CATEGORIES = [
  '🍔 Comida', '🏠 Alquiler', '🚗 Transporte',
  '🎮 Entretenimiento', '💊 Salud', '👕 Ropa',
  '📚 Educación', '📦 Otros gastos',
];

const INCOME_CATEGORIES = [
  '💼 Salario', '💻 Freelance', '💰 Otros ingresos',
];

const GOAL_COLORS = [
  '#7C3AED', '#10B981', '#F59E0B',
  '#F43F5E', '#38BDF8', '#EC4899',
];

const FILTERS = [
  { key: 'all', label: strings.all },
  { key: 'income', label: strings.incomeTab },
  { key: 'expense', label: strings.expensesTab },
];

function SwipeableTxCard({ tx, onDelete, formatAmount, formatDate, colors }) {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        style={{ backgroundColor: colors.expense, borderRadius: 14, justifyContent: 'center', alignItems: 'center', width: 80, marginBottom: 10 }}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
          <Text style={{ fontSize: 22 }}>🗑</Text>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 }}>Eliminar</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={{
        backgroundColor: colors.card, borderRadius: 14,
        padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10,
      }}>
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          alignItems: 'center', justifyContent: 'center', marginRight: 12,
          backgroundColor: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
        }}>
          <Text style={{ fontSize: 20 }}>{tx.category.split(' ')[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>{tx.category}</Text>
          {tx.note ? <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{tx.note}</Text> : null}
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{formatDate(tx.date)}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: tx.type === 'income' ? colors.income : colors.expense }}>
          {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
        </Text>
      </View>
    </Swipeable>
  );
}

export default function WalletScreen({ isFocused }) {
  const { colors } = useTheme();
  const {
    transactions, balance, activeFilter, currency,
    loadTransactions, loadSavingsGoals, loadSettings,
    createTransaction, removeTransaction, setFilter,
    savingsGoals, createSavingsGoal, removeSavingsGoal,
    addToSavingsGoal,
  } = useTaskStore();

  const [txModalVisible, setTxModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [addSavingModalVisible, setAddSavingModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [savingAmount, setSavingAmount] = useState('');
  const [choiceVisible, setChoiceVisible] = useState(false);
  const [txType, setTxType] = useState('expense');
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', category: '🍔 Comida', note: '' });
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', current_amount: '', deadline: '', color: '#7C3AED' });

  useEffect(() => {
    loadTransactions();
    loadSavingsGoals();
    loadSettings();
  }, []);

  const handleAddTx = async () => {
    if (!newTx.amount || isNaN(newTx.amount)) return;
    createTransaction({ ...newTx, amount: parseFloat(newTx.amount), date: new Date().toISOString() });
    if (newTx.type === 'expense') {
      try {
        const alert = useTaskStore.getState().checkBudgetAlert(newTx.category);
        if (alert) await sendBudgetAlert(alert.category, alert.spent, alert.limit);
      } catch (e) {}
    }
    setNewTx({ type: 'expense', amount: '', category: '🍔 Comida', note: '' });
    setTxModalVisible(false);
  };

  const handleAddGoal = () => {
    if (!newGoal.name.trim() || !newGoal.target_amount) return;
    createSavingsGoal({ ...newGoal, target_amount: parseFloat(newGoal.target_amount), current_amount: parseFloat(newGoal.current_amount) || 0 });
    setNewGoal({ name: '', target_amount: '', current_amount: '', deadline: '', color: '#7C3AED' });
    setGoalModalVisible(false);
  };

  const handleAddSaving = () => {
    if (!savingAmount || isNaN(savingAmount)) return;
    addToSavingsGoal(selectedGoal.id, parseFloat(savingAmount), selectedGoal.current_amount);
    setSavingAmount('');
    setAddSavingModalVisible(false);
    setSelectedGoal(null);
  };

  const handleDeleteTx = (id) => {
    Alert.alert(strings.deleteTransaction, strings.deleteTransactionConfirm, [
      { text: strings.cancel, style: 'cancel' },
      { text: strings.delete, style: 'destructive', onPress: () => removeTransaction(id) },
    ]);
  };

  const handleDeleteGoal = (id) => {
    Alert.alert(strings.deleteTask, strings.deleteTaskConfirm, [
      { text: strings.cancel, style: 'cancel' },
      { text: strings.delete, style: 'destructive', onPress: () => removeSavingsGoal(id) },
    ]);
  };

  const openTxModal = (type) => {
    setTxType(type);
    setNewTx({ type, amount: '', category: type === 'expense' ? '🍔 Comida' : '💼 Salario', note: '' });
    setChoiceVisible(false);
    setTxModalVisible(true);
  };

  const openAddSaving = (goal) => {
    setSelectedGoal(goal);
    setSavingAmount('');
    setAddSavingModalVisible(true);
  };

  const formatAmount = (amount) => currency + ' ' + parseFloat(amount).toFixed(2);
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  };
  const categories = txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Balance Card */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>{strings.thisMonth}</Text>
          <Text style={s.balanceAmount}>{formatAmount(balance.balance)}</Text>
          <View style={s.balanceRow}>
            <View style={s.balanceItem}>
              <Text style={s.incomeLabel}>{'↑ ' + strings.incomeTab}</Text>
              <Text style={s.incomeAmount}>{formatAmount(balance.income)}</Text>
            </View>
            <View style={s.balanceDivider} />
            <View style={s.balanceItem}>
              <Text style={s.expenseLabel}>{'↓ ' + strings.expensesTab}</Text>
              <Text style={s.expenseAmount}>{formatAmount(balance.expenses)}</Text>
            </View>
          </View>
        </View>

        {/* Savings Goals */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{strings.savingsGoals}</Text>
            <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
              <Text style={s.sectionAction}>{'+ ' + strings.addGoal}</Text>
            </TouchableOpacity>
          </View>
          {savingsGoals.length === 0 ? (
            <View style={s.emptyGoal}>
              <Text style={s.emptyGoalText}>{'🎯 ' + strings.noGoals}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {savingsGoals.map((goal) => {
                const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                return (
                  <View key={goal.id} style={[s.goalCard, { borderTopColor: goal.color, borderTopWidth: 3 }]}>
                    <TouchableOpacity style={s.goalDeleteBtn} onPress={() => handleDeleteGoal(goal.id)}>
                      <Text style={s.goalDeleteText}>🗑</Text>
                    </TouchableOpacity>
                    <Text style={s.goalName}>{goal.name}</Text>
                    <Text style={s.goalAmount}>
                      {formatAmount(goal.current_amount)}
                      <Text style={s.goalTarget}>{' / ' + formatAmount(goal.target_amount)}</Text>
                    </Text>
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: progress + '%', backgroundColor: goal.color }]} />
                    </View>
                    <Text style={[s.goalPercent, { color: goal.color }]}>
                      {progress >= 100 ? strings.completed2 : Math.round(progress) + '% ' + strings.saved}
                    </Text>
                    {progress < 100 && (
                      <TouchableOpacity
                        style={[s.addSavingBtn, { backgroundColor: goal.color + '22' }]}
                        onPress={() => openAddSaving(goal)}
                      >
                        <Text style={[s.addSavingText, { color: goal.color }]}>+ Agregar ahorro</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={s.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterTab, activeFilter === f.key && s.filterTabActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterText, activeFilter === f.key && s.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {transactions.length > 0 && (
          <Text style={s.swipeHint}>← Desliza para eliminar</Text>
        )}

        {transactions.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>💸</Text>
            <Text style={s.emptyText}>{strings.noTransactions}</Text>
            <Text style={s.emptySubtext}>{strings.noTransactionsSubtext}</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <SwipeableTxCard
              key={tx.id}
              tx={tx}
              onDelete={() => handleDeleteTx(tx.id)}
              formatAmount={formatAmount}
              formatDate={formatDate}
              colors={colors}
            />
          ))
        )}

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
          <TouchableOpacity style={s.choiceButton} onPress={() => openTxModal('income')}>
            <Text style={s.choiceEmoji}>💚</Text>
            <Text style={s.choiceText}>{strings.incomeType}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.choiceButton} onPress={() => openTxModal('expense')}>
            <Text style={s.choiceEmoji}>🔴</Text>
            <Text style={s.choiceText}>{strings.expenseType}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.choiceButton} onPress={() => { setChoiceVisible(false); setGoalModalVisible(true); }}>
            <Text style={s.choiceEmoji}>🎯</Text>
            <Text style={s.choiceText}>{strings.addGoal}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={txModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={s.overlay} onPress={() => setTxModalVisible(false)} />
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>
              {txType === 'income' ? strings.incomeType : strings.expenseType}
            </Text>
            <TextInput style={s.input} placeholder={strings.transactionAmount} placeholderTextColor={colors.textMuted} value={newTx.amount} onChangeText={(t) => setNewTx({ ...newTx, amount: t })} keyboardType="numeric" />
            <TextInput style={s.input} placeholder={strings.transactionNote} placeholderTextColor={colors.textMuted} value={newTx.note} onChangeText={(t) => setNewTx({ ...newTx, note: t })} />
            <Text style={s.label}>{strings.category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {categories.map((cat) => (
                <TouchableOpacity key={cat} style={[s.pill, newTx.category === cat && s.pillActive]} onPress={() => setNewTx({ ...newTx, category: cat })}>
                  <Text style={[s.pillText, newTx.category === cat && s.pillTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[s.addButton, { backgroundColor: txType === 'income' ? colors.income : colors.expense }]}
              onPress={handleAddTx}
            >
              <Text style={s.addButtonText}>{strings.addTransaction}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Savings Goal Modal */}
      <Modal visible={goalModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={s.overlay} onPress={() => setGoalModalVisible(false)} />
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{strings.addGoal}</Text>
            <TextInput style={s.input} placeholder={strings.goalName} placeholderTextColor={colors.textMuted} value={newGoal.name} onChangeText={(t) => setNewGoal({ ...newGoal, name: t })} />
            <TextInput style={s.input} placeholder={strings.goalTarget} placeholderTextColor={colors.textMuted} value={newGoal.target_amount} onChangeText={(t) => setNewGoal({ ...newGoal, target_amount: t })} keyboardType="numeric" />
            <TextInput style={s.input} placeholder={strings.goalCurrent} placeholderTextColor={colors.textMuted} value={newGoal.current_amount} onChangeText={(t) => setNewGoal({ ...newGoal, current_amount: t })} keyboardType="numeric" />
            <Text style={s.label}>Color</Text>
            <View style={s.colorRow}>
              {GOAL_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[s.colorDot, { backgroundColor: c }, newGoal.color === c && s.colorDotActive]} onPress={() => setNewGoal({ ...newGoal, color: c })} />
              ))}
            </View>
            <TouchableOpacity style={s.addButton} onPress={handleAddGoal}>
              <Text style={s.addButtonText}>{strings.addGoal}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Saving to Goal Modal */}
      <Modal visible={addSavingModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={s.overlay} onPress={() => setAddSavingModalVisible(false)} />
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>
              {'💰 ' + (selectedGoal?.name || '')}
            </Text>
            <Text style={s.goalModalSubtitle}>
              {selectedGoal
                ? formatAmount(selectedGoal.current_amount) + ' / ' + formatAmount(selectedGoal.target_amount)
                : ''}
            </Text>
            <TextInput style={s.input} placeholder="¿Cuánto vas a agregar?..." placeholderTextColor={colors.textMuted} value={savingAmount} onChangeText={setSavingAmount} keyboardType="numeric" autoFocus />
            <TouchableOpacity style={[s.addButton, { backgroundColor: selectedGoal?.color || colors.primary }]} onPress={handleAddSaving}>
              <Text style={s.addButtonText}>+ Agregar ahorro</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.topPadding },
  scroll: { padding: 20, paddingBottom: 100 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 24, marginBottom: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  incomeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  incomeAmount: { color: '#A7F3D0', fontSize: 16, fontWeight: '700' },
  expenseLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  expenseAmount: { color: '#FCA5A5', fontSize: 16, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  sectionAction: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  goalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginRight: 12, width: 190 },
  goalDeleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4, zIndex: 1 },
  goalDeleteText: { fontSize: 16 },
  goalName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 8, paddingRight: 24 },
  goalAmount: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  goalTarget: { color: colors.textMuted, fontSize: 11 },
  progressBar: { height: 6, backgroundColor: colors.cardLight, borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  goalPercent: { fontSize: 11, fontWeight: '600', marginBottom: 10 },
  addSavingBtn: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  addSavingText: { fontSize: 12, fontWeight: '700' },
  goalModalSubtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 16, marginTop: -12 },
  emptyGoal: { backgroundColor: colors.card, borderRadius: 14, padding: 16, alignItems: 'center' },
  emptyGoalText: { color: colors.textSecondary, fontSize: 14 },
  filterRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 12 },
  filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  filterTabActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  swipeHint: { color: colors.textMuted, fontSize: 11, textAlign: 'right', marginBottom: 8, fontStyle: 'italic' },
  emptyCard: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: colors.textSecondary, fontSize: 14, marginTop: 6 },
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
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff' },
  addButton: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});