// fonts.ts

export default {
  // Elegant handwritten font voor titels en headers
  title: {
    fontFamily: 'DancingScript_700Bold',
    fontWeight: '700' as const,
  },
  // Klassieke serif font voor subtitels en belangrijke tekst
  subtitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontWeight: '600' as const,
  },
  // Klassieke serif font voor normale tekst
  body: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontWeight: '400' as const,
  },
  // Bold versie voor belangrijke body tekst
  bodyBold: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontWeight: '600' as const,
  },
  // Extra elegante handwritten font voor accenten
  accent: {
    fontFamily: 'DancingScript_400Regular',
    fontWeight: '400' as const,
  },
  // Fallback voor als fonts niet laden
  fallback: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
};
