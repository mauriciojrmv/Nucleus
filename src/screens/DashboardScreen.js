import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
} from 'react-native';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/colors';
import { strings } from '../theme/strings';
import { BarChart, PieChart } from 'react-native-gifted-charts';

const CATEGORY_COLORS = [
  '#7C3AED', '#10B981', '#F59E0B', '#F43F5E',
  '#38BDF8', '#EC4899', '#A78BFA', '#34D399',
];

export default function DashboardScreen({ isFocused }) {
  const { colors } = useTheme();
  const {
    balance, expensesByCategory, last6Months,
    taskRates, savingsGoals, loadDashboard, currency,
  } = useTaskStore();

  useEffect(() => {
    if (isFocused) {
      loadDashboard();
    }
  }, [isFocused]);

  const formatAmount = (amount) => currency + ' ' + parseFloat(amount).toFixed(0);

  const getFinancialScore = () => {
    if (balance.income === 0 && balance.expenses === 0) return null;
    let score = 100;
    if (balance.expenses > balance.income) score -= 50;
    else if (balance.expenses > balance.income * 0.9) score -= 30;
    else if (balance.expenses > balance.income * 0.7) score -= 10;
    const goalsOnTrack = savingsGoals.filter(g => g.current_amount >= g.target_amount * 0.3).length;
    if (savingsGoals.length > 0) {
      if (goalsOnTrack === 0) score -= 20;
      else if (goalsOnTrack < savingsGoals.length) score -= 10;
    }
    return Math.max(0, Math.min(100, score));
  };

  const getFinancialStatus = (score) => {
    if (score === null) return { color: colors.textMuted, emoji: '⚪', label: 'Sin datos', message: 'Agrega transacciones para ver tu salud financiera.' };
    if (score >= 70) return { color: colors.income, emoji: '🟢', label: '¡Vas muy bien!', message: balance.expenses <= balance.income * 0.7 ? 'Tus gastos están bajo control este mes.' : 'Cerca del límite pero aún en verde.' };
    if (score >= 40) return { color: colors.warning, emoji: '🟡', label: 'Atención', message: balance.expenses > balance.income * 0.9 ? 'Estás gastando casi todo tu ingreso.' : 'Algunas metas de ahorro necesitan atención.' };
    return { color: colors.expense, emoji: '🔴', label: 'Alerta', message: 'Tus gastos superan tus ingresos este mes.' };
  };

  const getTaskScore = () => {
    const total = taskRates.daily.total + taskRates.weekly.total + taskRates.monthly.total;
    if (total === 0) return null;
    let sum = 0; let count = 0;
    if (taskRates.daily.total > 0) { sum += taskRates.daily.rate; count++; }
    if (taskRates.weekly.total > 0) { sum += taskRates.weekly.rate; count++; }
    if (taskRates.monthly.total > 0) { sum += taskRates.monthly.rate; count++; }
    return count > 0 ? Math.round(sum / count) : null;
  };

  const getTaskStatus = (score) => {
    if (score === null) return { color: colors.textMuted, emoji: '⚪', label: 'Sin tareas', message: 'Agrega tareas para ver tu productividad.' };
    if (score >= 75) return { color: colors.income, emoji: '🟢', label: '¡Muy productivo!', message: 'Completaste el ' + score + '% de tus tareas. ¡Excelente!' };
    if (score >= 50) return { color: colors.warning, emoji: '🟡', label: 'Puede mejorar', message: 'Completaste el ' + score + '% de tus tareas. ¡Tú puedes!' };
    return { color: colors.expense, emoji: '🔴', label: 'Baja productividad', message: 'Solo completaste el ' + score + '% de tus tareas.' };
  };

  const financialScore = getFinancialScore();
  const taskScore = getTaskScore();
  const financialStatus = getFinancialStatus(financialScore);
  const taskStatus = getTaskStatus(taskScore);
  const avgTaskRate = taskScore || 0;

  const pieData = expensesByCategory.slice(0, 6).map((item, index) => ({
    value: item.total,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    label: item.category.split(' ')[0],
    text: Math.round((item.total / (balance.expenses || 1)) * 100) + '%',
  }));

  const maxBarValue = Math.max(...last6Months.map(m => Math.max(m.income, m.expenses)), 1);

  const barData = last6Months.flatMap((m, i) => [
    { value: m.income, label: i % 2 === 0 ? m.label : '', frontColor: colors.income, spacing: 2, labelTextStyle: { color: colors.textMuted, fontSize: 10 } },
    { value: m.expenses, frontColor: colors.expense, spacing: 16, labelTextStyle: { color: colors.textMuted, fontSize: 10 } },
  ]);

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <Text style={s.screenTitle}>{'📊 ' + strings.dashboard}</Text>

        {/* Health Row */}
        <View style={s.healthRow}>
          <View style={[s.healthCard, { borderTopColor: financialStatus.color, borderTopWidth: 3 }]}>
            <Text style={s.healthCardIcon}>💰</Text>
            <Text style={s.healthCardTitle}>Finanzas</Text>
            <Text style={[s.healthCardScore, { color: financialStatus.color }]}>
              {financialScore !== null ? String(financialScore) : '—'}
            </Text>
            <Text style={s.healthCardScoreLabel}>pts</Text>
            <View style={s.healthBarSmall}>
              <View style={[s.healthBarFill, { width: (financialScore || 0) + '%', backgroundColor: financialStatus.color }]} />
            </View>
            <Text style={s.healthCardEmoji}>{financialStatus.emoji}</Text>
            <Text style={[s.healthCardLabel, { color: financialStatus.color }]}>{financialStatus.label}</Text>
            <Text style={s.healthCardMessage}>{financialStatus.message}</Text>
          </View>
          <View style={[s.healthCard, { borderTopColor: taskStatus.color, borderTopWidth: 3 }]}>
            <Text style={s.healthCardIcon}>✅</Text>
            <Text style={s.healthCardTitle}>Tareas</Text>
            <Text style={[s.healthCardScore, { color: taskStatus.color }]}>
              {taskScore !== null ? String(taskScore) : '—'}
            </Text>
            <Text style={s.healthCardScoreLabel}>%</Text>
            <View style={s.healthBarSmall}>
              <View style={[s.healthBarFill, { width: (taskScore || 0) + '%', backgroundColor: taskStatus.color }]} />
            </View>
            <Text style={s.healthCardEmoji}>{taskStatus.emoji}</Text>
            <Text style={[s.healthCardLabel, { color: taskStatus.color }]}>{taskStatus.label}</Text>
            <Text style={s.healthCardMessage}>{taskStatus.message}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryEmoji}>↑</Text>
            <Text style={s.summaryLabel}>Ingresos</Text>
            <Text style={[s.summaryAmount, { color: colors.income }]}>{formatAmount(balance.income)}</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryEmoji}>↓</Text>
            <Text style={s.summaryLabel}>Gastos</Text>
            <Text style={[s.summaryAmount, { color: colors.expense }]}>{formatAmount(balance.expenses)}</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryEmoji}>💰</Text>
            <Text style={s.summaryLabel}>Balance</Text>
            <Text style={[s.summaryAmount, { color: balance.balance >= 0 ? colors.income : colors.expense }]}>
              {formatAmount(balance.balance)}
            </Text>
          </View>
        </View>

        {/* Pie Chart */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🍩 Gastos por Categoría</Text>
          {pieData.length > 0 ? (
            <>
              <View style={s.pieContainer}>
                <PieChart
                  data={pieData}
                  donut
                  radius={90}
                  innerRadius={55}
                  centerLabelComponent={() => (
                    <View style={s.pieCenter}>
                      <Text style={s.pieCenterAmount}>{formatAmount(balance.expenses)}</Text>
                      <Text style={s.pieCenterLabel}>total</Text>
                    </View>
                  )}
                />
              </View>
              <View style={s.legendContainer}>
                {expensesByCategory.slice(0, 6).map((item, index) => (
                  <View key={index} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }]} />
                    <Text style={s.legendText} numberOfLines={1}>{item.category}</Text>
                    <Text style={s.legendAmount}>{formatAmount(item.total)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={s.emptySection}>
              <Text style={s.emptySectionEmoji}>📭</Text>
              <Text style={s.emptySectionText}>Sin gastos este mes</Text>
            </View>
          )}
        </View>

        {/* Bar Chart */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📊 Últimos 6 Meses</Text>
          <View style={s.barLegendRow}>
            <View style={s.barLegendItem}>
              <View style={[s.barLegendDot, { backgroundColor: colors.income }]} />
              <Text style={s.barLegendText}>Ingresos</Text>
            </View>
            <View style={s.barLegendItem}>
              <View style={[s.barLegendDot, { backgroundColor: colors.expense }]} />
              <Text style={s.barLegendText}>Gastos</Text>
            </View>
          </View>
          {maxBarValue > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={barData} barWidth={18} noOfSections={4}
                maxValue={maxBarValue * 1.2} yAxisColor="transparent"
                xAxisColor={colors.borderLight}
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 9 }}
                xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
                hideRules barBorderRadius={4} backgroundColor="transparent"
                height={180} width={320}
              />
            </ScrollView>
          ) : (
            <View style={s.emptySection}>
              <Text style={s.emptySectionEmoji}>📭</Text>
              <Text style={s.emptySectionText}>Sin datos aún</Text>
            </View>
          )}
        </View>

        {/* Task Completion */}
        <View style={s.card}>
          <Text style={s.cardTitle}>✅ Completado de Tareas</Text>
          <View style={s.taskRateRow}>
            {[
              { key: 'daily', label: 'Diario' },
              { key: 'weekly', label: 'Semanal' },
              { key: 'monthly', label: 'Mensual' },
            ].map((item) => (
              <View key={item.key} style={s.taskRateCard}>
                <Text style={[s.taskRateNumber, {
                  color: taskRates[item.key].rate >= 75 ? colors.income :
                    taskRates[item.key].rate >= 50 ? colors.warning : colors.expense
                }]}>
                  {taskRates[item.key].rate + '%'}
                </Text>
                <Text style={s.taskRateLabel}>{item.label}</Text>
                <Text style={s.taskRateSub}>
                  {taskRates[item.key].completed + '/' + taskRates[item.key].total}
                </Text>
              </View>
            ))}
          </View>
          <View style={s.avgRateRow}>
            <Text style={s.avgRateLabel}>Promedio general</Text>
            <Text style={[s.avgRateValue, {
              color: avgTaskRate >= 75 ? colors.income :
                avgTaskRate >= 50 ? colors.warning : colors.expense
            }]}>
              {avgTaskRate + '%'}
            </Text>
          </View>
          <View style={s.avgBar}>
            <View style={[s.avgBarFill, {
              width: avgTaskRate + '%',
              backgroundColor: avgTaskRate >= 75 ? colors.income :
                avgTaskRate >= 50 ? colors.warning : colors.expense,
            }]} />
          </View>
        </View>

        {/* Savings Goals */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🎯 Metas de Ahorro</Text>
          {savingsGoals.length === 0 ? (
            <View style={s.emptySection}>
              <Text style={s.emptySectionEmoji}>🎯</Text>
              <Text style={s.emptySectionText}>Sin metas creadas</Text>
            </View>
          ) : (
            savingsGoals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              return (
                <View key={goal.id} style={s.goalRow}>
                  <View style={s.goalRowInfo}>
                    <Text style={s.goalRowName}>{goal.name}</Text>
                    <Text style={s.goalRowAmount}>
                      {formatAmount(goal.current_amount) + ' / ' + formatAmount(goal.target_amount)}
                    </Text>
                  </View>
                  <View style={s.goalRowBar}>
                    <View style={[s.goalRowFill, { width: progress + '%', backgroundColor: goal.color }]} />
                  </View>
                  <Text style={[s.goalRowPercent, { color: goal.color }]}>
                    {Math.round(progress) + '%'}
                  </Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.topPadding },
  scroll: { padding: 20, paddingBottom: 100 },
  screenTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 20 },
  healthRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  healthCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 14, alignItems: 'center' },
  healthCardIcon: { fontSize: 24, marginBottom: 4 },
  healthCardTitle: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 8 },
  healthCardScore: { fontSize: 32, fontWeight: '800', lineHeight: 36 },
  healthCardScoreLabel: { color: colors.textMuted, fontSize: 10, marginBottom: 8 },
  healthBarSmall: { width: '100%', height: 5, backgroundColor: colors.cardLight, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  healthBarFill: { height: '100%', borderRadius: 3 },
  healthCardEmoji: { fontSize: 16, marginBottom: 4 },
  healthCardLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  healthCardMessage: { color: colors.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 14 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, alignItems: 'center' },
  summaryEmoji: { fontSize: 18, marginBottom: 4 },
  summaryLabel: { color: colors.textMuted, fontSize: 10, marginBottom: 4 },
  summaryAmount: { fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 16 },
  pieContainer: { alignItems: 'center', marginBottom: 16 },
  pieCenter: { alignItems: 'center' },
  pieCenterAmount: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  pieCenterLabel: { color: colors.textMuted, fontSize: 10 },
  legendContainer: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { flex: 1, color: colors.textSecondary, fontSize: 12 },
  legendAmount: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  barLegendRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  barLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLegendDot: { width: 10, height: 10, borderRadius: 2 },
  barLegendText: { color: colors.textSecondary, fontSize: 12 },
  taskRateRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  taskRateCard: { flex: 1, backgroundColor: colors.cardLight, borderRadius: 12, padding: 12, alignItems: 'center' },
  taskRateNumber: { fontSize: 20, fontWeight: '800' },
  taskRateLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  taskRateSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  avgRateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  avgRateLabel: { color: colors.textSecondary, fontSize: 13 },
  avgRateValue: { fontSize: 16, fontWeight: '800' },
  avgBar: { height: 8, backgroundColor: colors.cardLight, borderRadius: 4, overflow: 'hidden' },
  avgBarFill: { height: '100%', borderRadius: 4 },
  goalRow: { marginBottom: 14 },
  goalRowInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalRowName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  goalRowAmount: { color: colors.textMuted, fontSize: 11 },
  goalRowBar: { height: 6, backgroundColor: colors.cardLight, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  goalRowFill: { height: '100%', borderRadius: 3 },
  goalRowPercent: { fontSize: 11, fontWeight: '600', textAlign: 'right' },
  emptySection: { alignItems: 'center', paddingVertical: 24 },
  emptySectionEmoji: { fontSize: 32, marginBottom: 8 },
  emptySectionText: { color: colors.textSecondary, fontSize: 14 },
});