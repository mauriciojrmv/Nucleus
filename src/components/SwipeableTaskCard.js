import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { strings } from '../theme/strings';

export default function SwipeableTaskCard({
  task,
  onComplete,
  onDelete,
  onEdit,
  formatDueDate,
}) {
  const { colors } = useTheme();
  const swipeableRef = useRef(null);
  const checkAnim = useRef(new Animated.Value(task.is_completed ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: task.is_completed ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [task.is_completed]);

  const handleComplete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, tension: 300, friction: 10 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();

    if (task.is_recurring === 1 && task.is_completed !== 1) {
      Alert.alert(
        '🔁 Tarea Recurrente',
        '¿Marcar "' + task.title + '" como completada?\nSe reiniciará automáticamente mañana.',
        [
          { text: strings.cancel, style: 'cancel' },
          {
            text: '✅ Completar',
            onPress: () => onComplete(
              task.id, task.is_completed,
              task.is_recurring, task.streak,
              task.last_completed_date
            ),
          },
        ]
      );
    } else {
      onComplete(
        task.id, task.is_completed,
        task.is_recurring, task.streak,
        task.last_completed_date
      );
    }
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(strings.deleteTask, strings.deleteTaskConfirm, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.delete,
        style: 'destructive',
        onPress: () => onDelete(task.id),
      },
    ]);
  };

  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.5, 1], extrapolate: 'clamp' });
    const opacity = dragX.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.income, borderRadius: 14,
          justifyContent: 'center', alignItems: 'center',
          width: 80, marginBottom: 10,
        }}
        onPress={() => { swipeableRef.current?.close(); handleComplete(); }}
      >
        <Animated.View style={{ transform: [{ scale }], opacity, alignItems: 'center' }}>
          <Text style={{ fontSize: 22 }}>✅</Text>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 }}>
            Completar
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.5], extrapolate: 'clamp' });
    const opacity = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.expense, borderRadius: 14,
          justifyContent: 'center', alignItems: 'center',
          width: 80, marginBottom: 10,
        }}
        onPress={handleDelete}
      >
        <Animated.View style={{ transform: [{ scale }], opacity, alignItems: 'center' }}>
          <Text style={{ fontSize: 22 }}>🗑</Text>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 }}>
            Eliminar
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const dueDateInfo = task.due_date ? formatDueDate(task.due_date) : null;
  const showStreak = task.is_recurring === 1 && task.streak > 1;
  const isCompleted = task.is_completed === 1;
  const checkScale = checkAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] });

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={isCompleted ? null : renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={60}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
    >
      <Animated.View style={[{
        backgroundColor: colors.card, borderRadius: 14,
        padding: 16, flexDirection: 'row',
        alignItems: 'center', marginBottom: 10,
      }, { transform: [{ scale: scaleAnim }] }]}>

        {/* Checkbox */}
        <TouchableOpacity onPress={handleComplete} style={{ marginRight: 14 }}>
          <Animated.View style={[
            {
              width: 26, height: 26, borderRadius: 13,
              borderWidth: 2, borderColor: colors.primary,
              alignItems: 'center', justifyContent: 'center',
            },
            isCompleted && { backgroundColor: colors.primary, borderColor: colors.primary },
            { transform: [{ scale: checkScale }] },
          ]}>
            {isCompleted
              ? <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
              : null}
          </Animated.View>
        </TouchableOpacity>

        {/* Task Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={[
                { color: colors.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
                isCompleted && { color: colors.textMuted, textDecorationLine: 'line-through' },
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {showStreak
              ? (
                <View style={{
                  backgroundColor: 'rgba(245,158,11,0.15)',
                  borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.warning }}>
                    {'🔥 ' + task.streak}
                  </Text>
                </View>
              )
              : null}
          </View>

          <View style={{
            flexDirection: 'row', marginTop: 4,
            gap: 8, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <Text style={{
              color: colors.primaryLight, fontSize: 11,
              backgroundColor: 'rgba(124,58,237,0.2)',
              paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
            }}>
              {task.category}
            </Text>
            {task.is_recurring === 1
              ? <Text style={{ fontSize: 12 }}>🔁</Text>
              : null}
            {dueDateInfo && !isCompleted
              ? (
                <View style={{
                  backgroundColor: dueDateInfo.color + '22',
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: dueDateInfo.color }}>
                    {'📅 ' + dueDateInfo.label}
                  </Text>
                </View>
              )
              : null}
          </View>

          {task.notes
            ? (
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                {task.notes}
              </Text>
            )
            : null}
        </View>

        {/* Edit button */}
        {!isCompleted && onEdit
          ? (
            <TouchableOpacity
              style={{
                padding: 8, marginLeft: 4,
                backgroundColor: colors.cardLight, borderRadius: 8,
              }}
              onPress={() => onEdit(task)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          )
          : null}

      </Animated.View>
    </Swipeable>
  );
}