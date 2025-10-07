import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useCalendarSync } from '../context/CalendarSyncContext';
import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar';

const { width } = Dimensions.get('window');

interface OnboardingPage {
  emoji: string;
  title: string;
  subtitle: string;
}

const pages: OnboardingPage[] = [
  {
    emoji: "🦋",
    title: "Welcome to Glowgetter",
    subtitle: "Your beautiful companion for productivity and self-care"
  },
  {
    emoji: "🌸",
    title: "Manage Your Tasks",
    subtitle: "Stay organized with cute and efficient task management"
  },
  {
    emoji: "🌟",
    title: "Track Your Goals",
    subtitle: "Achieve your dreams with our goal tracking system"
  },
  {
    emoji: "✨",
    title: "Schedule Appointments",
    subtitle: "Never miss important moments with our calendar"
  }
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { authenticateGoogle, isAuthenticating } = useCalendarSync();

  const goToNext = () => {
    if (currentPage < pages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const success = await authenticateGoogle();
      if (success) {
        Alert.alert(
          '✅ Connected!',
          GOOGLE_CALENDAR_CONFIG.DEMO_MODE 
            ? 'Demo calendar connected! You can now test sync features with sample data.'
            : 'Successfully connected to Google Calendar!',
          [{ text: 'Continue', onPress: onComplete }]
        );
      } else {
        Alert.alert(
          'Connection Failed',
          GOOGLE_CALENDAR_CONFIG.DEMO_MODE
            ? 'Demo mode setup failed. You can try again in Settings.'
            : 'No worries! You can connect Google Calendar later in Settings.',
          [{ text: 'Continue', onPress: onComplete }]
        );
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      Alert.alert(
        'Connection Failed',
        GOOGLE_CALENDAR_CONFIG.DEMO_MODE
          ? 'Demo mode setup failed. You can try again in Settings.'
          : 'No worries! You can connect Google Calendar later in Settings.',
        [{ text: 'Continue', onPress: onComplete }]
      );
    }
  };

  const handleSkipGoogle = () => {
    onComplete();
  };

  const goToPrevious = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      scrollViewRef.current?.scrollTo({
        x: prevPage * width,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const page = Math.round(scrollX / width);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.content}>
              <Text style={styles.emoji}>{page.emoji}</Text>
              <Text style={styles.title}>{page.title}</Text>
              <Text style={styles.subtitle}>{page.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {currentPage > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={goToPrevious}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentPage === pages.length - 1 ? (
            // Last page - Get Started
            <TouchableOpacity style={styles.nextButton} onPress={onComplete}>
              <Text style={styles.nextButtonText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF69B4',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'System',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF69B4',
  },
  inactiveDot: {
    backgroundColor: '#E0E0E0',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'System',
  },
  nextButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  googleButtons: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
    marginLeft: 12,
  },
  skipButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  connectButton: {
    backgroundColor: '#4285F4', // Google blue
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});
