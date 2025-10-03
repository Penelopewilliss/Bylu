// fonts.ts
export default {
  header: {
    fontFamily: 'PatrickHand_400Regular',
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: 'Montserrat_400Regular',
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600' as const,
  },
};

// Voeg font-bestanden toe voor Expo asset loading
export const fontAssets = {
  PatrickHand_400Regular: require('../../assets/fonts/PatrickHand-Regular.ttf'),
  Montserrat_400Regular: require('../../assets/fonts/Montserrat-Regular.ttf'),
  Montserrat_600SemiBold: require('../../assets/fonts/Montserrat-SemiBold.ttf'),
};
