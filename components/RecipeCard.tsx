import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Recipe } from '@/types/Recipe';
import { Colors } from '@/constants/Colors';

interface RecipeCardProps {
  recipe: Recipe;
  style?: ViewStyle;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export function RecipeCard({ recipe, style }: RecipeCardProps) {
  const handlePress = () => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: recipe.id || 'temp', data: JSON.stringify(recipe) },
    });
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {recipe.title}
            </Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{recipe.total_minutes}m</Text>
            </View>
          </View>

          <Text style={styles.summary} numberOfLines={3}>
            {recipe.summary}
          </Text>

          <View style={styles.footer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                🍽️ {recipe.servings} servings
              </Text>
              <Text style={styles.metaText}>
                🔥 {recipe.nutrition.calories} cal
              </Text>
            </View>
            
            <View style={styles.ingredientsPreview}>
              <Text style={styles.ingredientsText} numberOfLines={1}>
                {recipe.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
                {recipe.ingredients.length > 3 && '...'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginRight: 8,
  },
  timeContainer: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  summary: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    fontWeight: '500',
  },
  ingredientsPreview: {
    marginTop: 4,
  },
  ingredientsText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
});