export interface Recipe {
  id?: string;
  title: string;
  summary: string;
  ingredients: Array<{
    name: string;
    amount: string;
    notes: string;
  }>;
  steps: Array<{
    order: number;
    instruction: string;
    timer_seconds: number;
    voice_hint: string;
  }>;
  prep_minutes: number;
  cook_minutes: number;
  total_minutes: number;
  servings: number;
  nutrition: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
  substitutions: Array<{
    missing: string;
    replacement: string;
    notes: string;
  }>;
  allergen_warnings: string[];
  sources: Array<{
    label: string;
    url: string;
  }>;
  created_at?: string;
  is_favorite?: boolean;
}

export interface RecipeGenerationRequest {
  ingredients: string[];
  constraints?: string[];
  preferences?: string[];
  equipment?: string[];
  time_minutes?: number;
  servings?: number;
  locale?: string;
}

export interface RecipeGenerationResponse {
  recipe: Recipe;
  usage?: {
    tokens_used: number;
    cost_usd: number;
  };
}