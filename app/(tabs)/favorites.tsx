import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RecipeCard } from '@/components/RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';
import { Colors } from '@/constants/Colors';

export default function FavoritesScreen() {
  const { favoriteRecipes, loading } = useRecipes();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.background, Colors.light.surface]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Favorites</Text>
          <Text style={styles.subtitle}>
            {favoriteRecipes.length} saved recipe{favoriteRecipes.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {favoriteRecipes.length > 0 ? (
              <View style={styles.recipesList}>
                {favoriteRecipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id || index}
                    recipe={recipe}
                    style={styles.recipeCard}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>❤️</Text>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptyText}>
                  Recipes you save will appear here for easy access
                </Text>
              </View>
            )}
          </ScrollView>
        )}
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  recipesList: {
    padding: 20,
    gap: 16,
  },
  recipeCard: {
    width: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});