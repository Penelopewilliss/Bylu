// fonts.ts
export default {
  header: {
    fontFamily: 'PatrickHand_400Regular',
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: 'System', // Use system font as fallback
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontFamily: 'System', // Use system font as fallback
    fontWeight: '600' as const,
  },
  // Luxury handwritten fonts for ultra-chic design
  dancingScript: {
    fontFamily: 'DancingScript_400Regular',
    fontWeight: '400' as const,
  },
  greatVibes: {
    fontFamily: 'GreatVibes_400Regular', 
    fontWeight: '400' as const,
  },
  allura: {
    fontFamily: 'Allura_400Regular',
    fontWeight: '400' as const,
  },
};

// Voeg font-bestanden toe voor Expo asset loading (only working fonts)
export const fontAssets = {
  PatrickHand_400Regular: require('../../assets/fonts/PatrickHand-Regular.ttf'),
  // Ultra-chic handwritten fonts
  DancingScript_400Regular: require('../../assets/fonts/DancingScript.ttf'),
  GreatVibes_400Regular: require('../../assets/fonts/GreatVibes.ttf'),
  Allura_400Regular: require('../../assets/fonts/Allura.ttf'),
};
