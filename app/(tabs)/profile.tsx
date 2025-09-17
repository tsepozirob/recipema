import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { isPremium, restorePurchases } = useSubscription();

  const handleRestorePurchases = async () => {
    const success = await restorePurchases();
    if (success) {
      Alert.alert('Success', 'Purchases restored successfully');
    } else {
      Alert.alert('Error', 'Failed to restore purchases');
    }
  };

  const menuItems = [
    {
      title: 'Subscription',
      subtitle: isPremium ? 'Premium Active' : 'Free Plan',
      icon: '💎',
      onPress: () => router.push('/subscription'),
    },
    {
      title: 'Restore Purchases',
      subtitle: 'Restore previous purchases',
      icon: '🔄',
      onPress: handleRestorePurchases,
    },
    {
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      icon: '🔒',
      onPress: () => router.push('/privacy'),
    },
    {
      title: 'Terms of Service',
      subtitle: 'Terms and conditions',
      icon: '📋',
      onPress: () => router.push('/terms'),
    },
    {
      title: 'Support',
      subtitle: 'Get help and support',
      icon: '💬',
      onPress: () => router.push('/support'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.background, Colors.light.surface]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.subscriptionBadge}>
              <Text style={[
                styles.subscriptionText,
                isPremium ? styles.premiumText : styles.freeText
              ]}>
                {isPremium ? '💎 Premium' : '🆓 Free Plan'}
              </Text>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.appName}>RecipeMa</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.footerText}>
              Made with ❤️ for home cooks everywhere
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  subscriptionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  premiumText: {
    color: Colors.light.primary,
  },
  freeText: {
    color: Colors.light.textSecondary,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  menuItemArrow: {
    fontSize: 20,
    color: Colors.light.textTertiary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    textAlign: 'center',
  },
});