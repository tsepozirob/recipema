import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Recipe } from '@/types/Recipe';
import { RecipeCard } from '@/components/RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { recentRecipes, loading, refreshRecipes } = useRecipes();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.background, Colors.light.surface]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.subtitle}>What would you like to cook today?</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Start</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: Colors.light.primary }]}
                onPress={() => router.push('/generate')}
              >
                <Text style={styles.actionIcon}>🔥</Text>
                <Text style={styles.actionTitle}>Generate Recipe</Text>
                <Text style={styles.actionSubtitle}>From ingredients</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: Colors.light.secondary }]}
                onPress={() => router.push('/generate?mode=camera')}
              >
                <Text style={styles.actionIcon}>📷</Text>
                <Text style={styles.actionTitle}>Scan Ingredients</Text>
                <Text style={styles.actionSubtitle}>Use your camera</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: Colors.light.accent }]}
                onPress={() => router.push('/generate?mode=voice')}
              >
                <Text style={styles.actionIcon}>🎙️</Text>
                <Text style={styles.actionTitle}>Voice Input</Text>
                <Text style={styles.actionSubtitle}>Speak ingredients</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: Colors.light.surface }]}
                onPress={() => router.push('/favorites')}
              >
                <Text style={styles.actionIcon}>❤️</Text>
                <Text style={styles.actionTitle}>My Favorites</Text>
                <Text style={styles.actionSubtitle}>Saved recipes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Recipes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Recipes</Text>
              <TouchableOpacity onPress={refreshRecipes}>
                <Text style={styles.seeAll}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentRecipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id || index}
                    recipe={recipe}
                    style={[
                      styles.recipeCard,
                      index === 0 && styles.firstCard,
                      index === recentRecipes.length - 1 && styles.lastCard,
                    ]}
                  />
                ))}
                {recentRecipes.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No recipes yet</Text>
                    <Text style={styles.emptySubtext}>Generate your first recipe!</Text>
                  </View>
                )}
              </ScrollView>
            )}
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
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  recipeCard: {
    width: width * 0.7,
    marginHorizontal: 4,
  },
  firstCard: {
    marginLeft: 0,
  },
  lastCard: {
    marginRight: 0,
  },
  loader: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textTertiary,
  },
});