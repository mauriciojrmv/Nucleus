import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTaskStore } from '../store/taskStore';
import { setOnboardingComplete } from '../database/database';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const CURRENCIES = [
  { label: 'Bolivianos', symbol: 'Bs' },
  { label: 'Dólares', symbol: '$' },
  { label: 'Euros', symbol: '€' },
  { label: 'Pesos MX', symbol: 'MXN' },
  { label: 'Pesos CO', symbol: 'COP' },
  { label: 'Soles', symbol: 'S/' },
];

export default function OnboardingScreen({ onComplete }) {
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('Bs');
  const { saveAllSettings } = useTaskStore();

  const goToSlide = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < 2) goToSlide(currentSlide + 1);
  };

  const handleFinish = () => {
    saveAllSettings({
      userName: name.trim() || 'Usuario',
      currency,
      theme: 'dark',
      language: 'es',
    });
    setOnboardingComplete();
    onComplete();
  };

  const handleScroll = (e) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slide);
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Slide 1 — Welcome */}
        <View style={[s.slide, { width }]}>
          <View style={s.slideContent}>
            <View style={s.logoContainer}>
              <Text style={s.logoEmoji}>⚡</Text>
            </View>
            <Text style={s.appName}>Nucleus</Text>
            <Text style={s.tagline}>Tu centro de control personal</Text>
            <Text style={s.description}>
              Organiza tus tareas diarias y controla tus finanzas en un solo lugar.
            </Text>
            <View style={s.featuresContainer}>
              <FeatureRow colors={colors} emoji="✅" text="Tareas diarias, semanales y mensuales" />
              <FeatureRow colors={colors} emoji="💰" text="Control de ingresos y gastos" />
              <FeatureRow colors={colors} emoji="🎯" text="Metas de ahorro con progreso" />
              <FeatureRow colors={colors} emoji="📊" text="Dashboard con tu salud financiera" />
            </View>
          </View>
          <TouchableOpacity style={s.nextButton} onPress={handleNext}>
            <Text style={s.nextButtonText}>Siguiente →</Text>
          </TouchableOpacity>
        </View>

        {/* Slide 2 — Name */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width }}
        >
          <View style={[s.slide, { width }]}>
            <View style={s.slideContent}>
              <Text style={s.slideEmoji}>👋</Text>
              <Text style={s.slideTitle}>¿Cómo te llamas?</Text>
              <Text style={s.slideSubtitle}>Personalizaremos la app para ti</Text>
              <TextInput
                style={s.nameInput}
                placeholder="Tu nombre..."
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />
              <Text style={s.skipText}>Puedes cambiarlo después en Ajustes</Text>
            </View>
            <TouchableOpacity
              style={[s.nextButton, !name.trim() && s.nextButtonSecondary]}
              onPress={handleNext}
            >
              <Text style={s.nextButtonText}>
                {name.trim() ? '¡Hola ' + name + '! →' : 'Saltar →'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Slide 3 — Currency */}
        <View style={[s.slide, { width }]}>
          <View style={s.slideContent}>
            <Text style={s.slideEmoji}>💱</Text>
            <Text style={s.slideTitle}>¿Qué moneda usas?</Text>
            <Text style={s.slideSubtitle}>
              Se usará en toda la app para mostrar tus finanzas
            </Text>
            <View style={s.currencyGrid}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c.symbol}
                  style={[s.currencyPill, currency === c.symbol && s.currencyPillActive]}
                  onPress={() => setCurrency(c.symbol)}
                >
                  <Text style={[s.currencySymbol, currency === c.symbol && s.currencySymbolActive]}>
                    {c.symbol}
                  </Text>
                  <Text style={[s.currencyLabel, currency === c.symbol && s.currencyLabelActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={s.finishButton} onPress={handleFinish}>
            <Text style={s.finishButtonText}>¡Empezar! 🚀</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Dots */}
      <View style={s.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
            <View style={[s.dot, currentSlide === i && s.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FeatureRow({ emoji, text, colors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Text style={{ fontSize: 22, width: 32 }}>{emoji}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '500', flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  slide: {
    flex: 1, paddingHorizontal: 28,
    paddingTop: 80, paddingBottom: 120,
    justifyContent: 'space-between',
  },
  slideContent: { flex: 1, justifyContent: 'center' },
  logoContainer: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, alignSelf: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    color: colors.textPrimary, fontSize: 42,
    fontWeight: '900', textAlign: 'center',
    marginBottom: 8, letterSpacing: -1,
  },
  tagline: {
    color: colors.primaryLight, fontSize: 18,
    textAlign: 'center', fontWeight: '600', marginBottom: 16,
  },
  description: {
    color: colors.textSecondary, fontSize: 15,
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  featuresContainer: { gap: 14 },
  slideEmoji: { fontSize: 64, textAlign: 'center', marginBottom: 20 },
  slideTitle: {
    color: colors.textPrimary, fontSize: 28,
    fontWeight: '800', textAlign: 'center', marginBottom: 10,
  },
  slideSubtitle: {
    color: colors.textSecondary, fontSize: 15,
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  nameInput: {
    backgroundColor: colors.card, borderRadius: 16,
    padding: 18, color: colors.textPrimary,
    fontSize: 20, textAlign: 'center',
    fontWeight: '600', borderWidth: 2, borderColor: colors.primary,
  },
  skipText: {
    color: colors.textMuted, fontSize: 12,
    textAlign: 'center', marginTop: 12,
  },
  currencyGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, justifyContent: 'center',
  },
  currencyPill: {
    backgroundColor: colors.card, borderRadius: 14,
    padding: 16, alignItems: 'center', width: 100,
    borderWidth: 2, borderColor: 'transparent',
  },
  currencyPillActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(124,58,237,0.2)',
  },
  currencySymbol: {
    color: colors.textSecondary, fontSize: 20,
    fontWeight: '800', marginBottom: 4,
  },
  currencySymbolActive: { color: colors.primaryLight },
  currencyLabel: { color: colors.textMuted, fontSize: 11 },
  currencyLabelActive: { color: colors.primaryLight },
  nextButton: {
    backgroundColor: colors.primary, borderRadius: 16,
    padding: 18, alignItems: 'center',
  },
  nextButtonSecondary: { backgroundColor: colors.cardLight },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  finishButton: {
    backgroundColor: colors.primary, borderRadius: 16,
    padding: 18, alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  finishButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  dotsContainer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8,
    position: 'absolute', bottom: 50, left: 0, right: 0,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cardLight },
  dotActive: { width: 24, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});