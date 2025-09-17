import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

export function generateUniqueId(): string {
  return Crypto.randomUUID();
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatServings(servings: number): string {
  return servings === 1 ? '1 serving' : `${servings} servings`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export function hapticFeedback() {
  if (Platform.OS !== 'web') {
    // Import haptics dynamically to avoid web errors
    import('expo-haptics').then(({ ImpactFeedbackStyle, impactAsync }) => {
      impactAsync(ImpactFeedbackStyle.Light);
    });
  }
}