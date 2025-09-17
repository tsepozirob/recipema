import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/types/Recipe';

const RECENT_RECIPES_KEY = 'recent_recipes';
const FAVORITES_KEY = 'favorite_recipes';

export function useRecipes() {
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const [recentData, favoritesData] = await Promise.all([
        AsyncStorage.getItem(RECENT_RECIPES_KEY),
        AsyncStorage.getItem(FAVORITES_KEY),
      ]);

      if (recentData) {
        setRecentRecipes(JSON.parse(recentData));
      }

      if (favoritesData) {
        setFavoriteRecipes(JSON.parse(favoritesData));
      }
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecentRecipe = async (recipe: Recipe) => {
    try {
      const updated = [recipe, ...recentRecipes.filter(r => r.id !== recipe.id)].slice(0, 10);
      setRecentRecipes(updated);
      await AsyncStorage.setItem(RECENT_RECIPES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent recipe:', error);
    }
  };

  const toggleFavorite = async (recipe: Recipe) => {
    try {
      const isFavorite = favoriteRecipes.some(r => r.id === recipe.id);
      let updated: Recipe[];

      if (isFavorite) {
        updated = favoriteRecipes.filter(r => r.id !== recipe.id);
      } else {
        updated = [recipe, ...favoriteRecipes];
      }

      setFavoriteRecipes(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return !isFavorite;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  };

  const isFavorite = (recipeId: string) => {
    return favoriteRecipes.some(r => r.id === recipeId);
  };

  const refreshRecipes = () => {
    loadRecipes();
  };

  return {
    recentRecipes,
    favoriteRecipes,
    loading,
    addRecentRecipe,
    toggleFavorite,
    isFavorite,
    refreshRecipes,
  };
}