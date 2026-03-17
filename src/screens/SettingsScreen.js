import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { useTaskStore } from '../store/taskStore';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/colors';
import { strings } from '../theme/strings';
import { getSetting } from '../database/database';
import { scheduleDailySummary } from '../utils/notifications';

const CURRENCIES = [
  { label: 'Bolivianos', symbol: 'Bs' },
  { label: 'Dólares', symbol: '$' },
  { label: 'Euros', symbol: '€' },
  { label: 'Pesos MX', symbol: 'MXN' },
  { label: 'Pesos CO', symbol: 'COP' },
  { label: 'Soles', symbol: 'S/' },
];

const BUDGET_CATEGORIES = [
  '🍔 Comida', '🏠 Alquiler', '🚗 Transporte',
  '🎮 Entretenimiento', '💊 Salud', '👕 Ropa', '📚 Educación',
];

const THEMES = {
  dark: {
    label: 'Oscuro',
    emoji: '🌙',
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    sub: '#94A3B8',
    accent: '#7C3AED',
  },
  light: {
    label: 'Claro',
    emoji: '☀️',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    sub: '#64748B',
    accent: '#7C3AED',
  },
};

const LANGUAGES = [
  { key: 'es', emoji: '🇪🇸', label: 'Español', preview: 'Buenos días 👋' },
  { key: 'en', emoji: '🇺🇸', label: 'English', preview: 'Good morning 👋' },
];

export default function SettingsScreen({ isFocused }) {
  const { colors, setTheme } = useTheme();
  const {
    currency, userName, theme, language,
    loadSettings, saveAllSettings,
  } = useTaskStore();

  const [localName, setLocalName] = useState('');
  const [localCurrency, setLocalCurrency] = useState('Bs');
  const [localTheme, setLocalTheme] = useState('dark');
  const [localLanguage, setLocalLanguage] = useState('es');
  const [budgetLimits, setBudgetLimits] = useState({});
  const [summaryHour, setSummaryHour] = useState('20');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
    try {
      const savedLimits = getSetting('budgetLimits');
      if (savedLimits) setBudgetLimits(JSON.parse(savedLimits));
      const hour = getSetting('summaryHour');
      if (hour) setSummaryHour(hour);
    } catch (e) {}
  }, []);

  useEffect(() => {
    setLocalName(userName || '');
    setLocalCurrency(currency || 'Bs');
    setLocalTheme(theme || 'dark');
    setLocalLanguage(language || 'es');
  }, [userName, currency, theme, language]);

  const handleSave = async () => {
    saveAllSettings({
      userName: localName,
      currency: localCurrency,
      theme: localTheme,
      language: localLanguage,
      budgetLimits: JSON.stringify(budgetLimits),
      summaryHour: summaryHour,
    });
    setTheme(localTheme);
    try {
      const hour = parseInt(summaryHour) || 20;
      await scheduleDailySummary(hour, 0);
    } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateBudget = (category, value) => {
    const updated = { ...budgetLimits };
    if (!value || value === '') {
      delete updated[category];
    } else {
      updated[category] = parseFloat(value);
    }
    setBudgetLimits(updated);
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <Text style={s.screenTitle}>{'⚙️ ' + strings.settingsTitle}</Text>

        {/* Profile */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>👤 PERFIL</Text>
          <View style={s.card}>
            <Text style={s.label}>{strings.userName}</Text>
            <TextInput
              style={s.input}
              placeholder={strings.userNamePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={localName}
              onChangeText={setLocalName}
            />
          </View>
        </View>

        {/* Currency */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💰 MONEDA</Text>
          <View style={s.card}>
            <View style={s.currencyGrid}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c.symbol}
                  style={[s.currencyPill, localCurrency === c.symbol && s.currencyPillActive]}
                  onPress={() => setLocalCurrency(c.symbol)}
                >
                  <Text style={[s.currencySymbol, localCurrency === c.symbol && s.currencySymbolActive]}>
                    {c.symbol}
                  </Text>
                  <Text style={[s.currencyLabel, localCurrency === c.symbol && s.currencyLabelActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Theme */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎨 TEMA</Text>
          <View style={s.themeRow}>
            {Object.entries(THEMES).map(([key, t]) => (
              <TouchableOpacity
                key={key}
                style={[s.themeCard, localTheme === key && s.themeCardActive]}
                onPress={() => setLocalTheme(key)}
              >
                <View style={[s.themePreview, { backgroundColor: t.bg }]}>
                  <View style={[s.themePreviewCard, { backgroundColor: t.card }]}>
                    <View style={[s.themePreviewLine, { backgroundColor: t.text, width: '70%' }]} />
                    <View style={[s.themePreviewLine, { backgroundColor: t.sub, width: '50%', marginTop: 4 }]} />
                  </View>
                  <View style={[s.themePreviewAccent, { backgroundColor: t.accent }]} />
                </View>
                <Text style={s.themeEmoji}>{t.emoji}</Text>
                <Text style={[s.themeLabel, localTheme === key && s.themeLabelActive]}>
                  {t.label}
                </Text>
                {localTheme === key && (
                  <View style={s.themeCheck}>
                    <Text style={s.themeCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.note}>* El cambio de tema se aplica al guardar</Text>
        </View>

        {/* Language 
        <View style={s.section}>
          <Text style={s.sectionTitle}>🌍 IDIOMA</Text>
          <View style={s.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[s.langCard, localLanguage === lang.key && s.langCardActive]}
                onPress={() => setLocalLanguage(lang.key)}
              >
                <Text style={s.langEmoji}>{lang.emoji}</Text>
                <Text style={[s.langLabel, localLanguage === lang.key && s.langLabelActive]}>
                  {lang.label}
                </Text>
                <Text style={s.langPreview}>{lang.preview}</Text>
                {localLanguage === lang.key && (
                  <View style={s.themeCheck}>
                    <Text style={s.themeCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.note}>* El cambio de idioma se aplicará en la próxima versión</Text>
        </View> */}

        {/* Budget Limits */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💸 LÍMITES DE PRESUPUESTO</Text>
          <View style={s.card}>
            <Text style={s.note}>
              Recibirás una alerta al alcanzar el 80% de tu límite mensual
            </Text>
            {BUDGET_CATEGORIES.map((cat) => (
              <View key={cat} style={s.budgetRow}>
                <Text style={s.budgetCategory}>{cat}</Text>
                <TextInput
                  style={s.budgetInput}
                  placeholder="Sin límite"
                  placeholderTextColor={colors.textMuted}
                  value={budgetLimits[cat] ? String(budgetLimits[cat]) : ''}
                  onChangeText={(val) => updateBudget(cat, val)}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔔 NOTIFICACIONES</Text>
          <View style={s.card}>
            <View style={s.notifRow}>
              <View style={s.notifInfo}>
                <Text style={s.notifTitle}>Resumen diario</Text>
                <Text style={s.note}>Recordatorio diario de tareas y gastos</Text>
              </View>
              <View style={s.hourInput}>
                <TextInput
                  style={s.budgetInput}
                  value={summaryHour}
                  onChangeText={setSummaryHour}
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={s.hourLabel}>:00 h</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{'ℹ️ ' + strings.aboutTitle.toUpperCase()}</Text>
          <View style={s.card}>
            <View style={s.aboutRow}>
              <Text style={s.aboutLabel}>App</Text>
              <Text style={s.aboutValue}>Nucleus</Text>
            </View>
            <View style={s.divider} />
            <View style={s.aboutRow}>
              <Text style={s.aboutLabel}>Versión</Text>
              <Text style={s.aboutValue}>1.0.0</Text>
            </View>
            <View style={s.divider} />
            <View style={s.aboutRow}>
              <Text style={s.aboutLabel}>Plataforma</Text>
              <Text style={s.aboutValue}>Android & iOS</Text>
            </View>
            <View style={s.divider} />
            <View style={s.aboutRow}>
              <Text style={s.aboutLabel}>Desarrollado por</Text>
              <Text style={s.aboutValue}>Mauricio Mattinen</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[s.saveButton, saved && s.saveButtonSaved]}
          onPress={handleSave}
        >
          <Text style={s.saveButtonText}>
            {saved ? '✅ ¡Guardado!' : strings.saveSettings}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.topPadding },
  scroll: { padding: 20, paddingBottom: 100 },
  screenTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  input: { backgroundColor: colors.cardLight, borderRadius: 12, padding: 14, color: colors.textPrimary, fontSize: 15 },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  currencyPill: { backgroundColor: colors.cardLight, borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 80, borderWidth: 2, borderColor: 'transparent' },
  currencyPillActive: { borderColor: colors.primary, backgroundColor: 'rgba(124,58,237,0.15)' },
  currencySymbol: { color: colors.textSecondary, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  currencySymbolActive: { color: colors.primaryLight },
  currencyLabel: { color: colors.textMuted, fontSize: 10 },
  currencyLabelActive: { color: colors.primaryLight },
  themeRow: { flexDirection: 'row', gap: 12 },
  themeCard: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: colors.cardLight, backgroundColor: colors.card },
  themeCardActive: { borderColor: colors.primary },
  themePreview: { height: 80, padding: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start' },
  themePreviewCard: { flex: 1, borderRadius: 8, padding: 8, marginRight: 6 },
  themePreviewLine: { height: 6, borderRadius: 3 },
  themePreviewAccent: { width: 24, height: 24, borderRadius: 12, alignSelf: 'flex-end' },
  themeEmoji: { fontSize: 20, textAlign: 'center', marginTop: 8 },
  themeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  themeLabelActive: { color: colors.primaryLight },
  themeCheck: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  themeCheckText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  langRow: { flexDirection: 'row', gap: 12 },
  langCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: colors.cardLight },
  langCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(124,58,237,0.1)' },
  langEmoji: { fontSize: 32, marginBottom: 8 },
  langLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  langLabelActive: { color: colors.primaryLight },
  langPreview: { color: colors.textMuted, fontSize: 11, fontStyle: 'italic', textAlign: 'center' },
  note: { color: colors.textMuted, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.cardLight },
  budgetCategory: { color: colors.textPrimary, fontSize: 14, flex: 1 },
  budgetInput: { backgroundColor: colors.cardLight, borderRadius: 8, padding: 8, color: colors.textPrimary, fontSize: 14, width: 90, textAlign: 'right' },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifInfo: { flex: 1 },
  notifTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  hourInput: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hourLabel: { color: colors.textSecondary, fontSize: 13 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  aboutLabel: { color: colors.textSecondary, fontSize: 14 },
  aboutValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.cardLight },
  saveButton: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  saveButtonSaved: { backgroundColor: colors.income },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});