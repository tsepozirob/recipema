import { useState } from 'react';
import { Recipe, RecipeGenerationRequest } from '@/types/Recipe';
import { useRecipes } from './useRecipes';
import { generateUniqueId } from '@/utils/helpers';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export function useRecipeGeneration() {
  const [loading, setLoading] = useState(false);
  const { addRecentRecipe } = useRecipes();

  const generateRecipe = async (request: RecipeGenerationRequest): Promise<Recipe | null> => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/v1/recipes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add ID and timestamp if not present
      const recipe: Recipe = {
        ...data,
        id: data.id || generateUniqueId(),
        created_at: data.created_at || new Date().toISOString(),
      };

      // Save to recent recipes
      await addRecentRecipe(recipe);

      return recipe;
    } catch (error) {
      console.error('Recipe generation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateRecipe,
    loading,
  };
}