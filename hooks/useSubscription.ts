import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { router } from 'expo-router';

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      // Initialize RevenueCat
      await Purchases.configure({
        apiKey: Platform.select({
          ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'your_ios_key',
          android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'your_android_key',
        }) as string,
      });

      // Check current subscription status
      const customerInfo = await Purchases.getCustomerInfo();
      setIsPremium(customerInfo.activeSubscriptions.length > 0);
    } catch (error) {
      console.error('Failed to initialize purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const showPaywall = () => {
    router.push('/subscription');
  };

  const purchaseSubscription = async (productId: string) => {
    try {
      const { customerInfo } = await Purchases.purchaseProduct(productId);
      setIsPremium(customerInfo.activeSubscriptions.length > 0);
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      setIsPremium(customerInfo.activeSubscriptions.length > 0);
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  };

  return {
    isPremium,
    loading,
    showPaywall,
    purchaseSubscription,
    restorePurchases,
  };
}