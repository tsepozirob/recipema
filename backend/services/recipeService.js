const axios = require('axios');
const { createHash } = require('crypto');
const { getRedisClient } = require('./redis');
const { logger } = require('../utils/logger');

const DEEPSEEK_API_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Prompt templates
const SYSTEM_PROMPT = `You are a professional chef and recipe creator. Generate recipes in EXACTLY the JSON format specified. Return ONLY valid JSON, no additional text.

IMPORTANT RULES:
1. Return ONLY the JSON object, no markdown formatting
2. All string values must be properly escaped
3. timer_seconds should be 0 unless timing is critical
4. voice_hint should be concise cooking tips
5. Ensure all nutrition values are realistic numbers
6. Include practical substitutions if ingredients are unavailable`;

const generateUserPrompt = (data) => {
  return `Create a recipe using these ingredients: ${data.ingredients.join(', ')}.

Requirements:
- Cooking time: approximately ${data.time_minutes} minutes
- Servings: ${data.servings}
- Dietary constraints: ${data.constraints?.join(', ') || 'none'}
- Available equipment: ${data.equipment?.join(', ') || 'basic kitchen tools'}

Return the recipe in this EXACT JSON format:
{
  "title": "Recipe Name",
  "summary": "Brief description of the dish",
  "ingredients": [{"name": "ingredient", "amount": "quantity", "notes": "optional notes"}],
  "steps": [{"order": 1, "instruction": "detailed step", "timer_seconds": 300, "voice_hint": "helpful tip"}],
  "prep_minutes": 15,
  "cook_minutes": 20,
  "total_minutes": 35,
  "servings": ${data.servings},
  "nutrition": {"calories": 400, "protein_g": 25, "fat_g": 15, "carbs_g": 45},
  "substitutions": [{"missing": "ingredient", "replacement": "alternative", "notes": "substitution notes"}],
  "allergen_warnings": ["list", "of", "allergens"],
  "sources": [{"label": "Traditional", "url": ""}]
}`;
};

// Fallback recipe generator
const generateFallbackRecipe = (ingredients, servings = 4) => {
  return {
    title: `Simple ${ingredients[0]} Recipe`,
    summary: `A basic recipe using ${ingredients.slice(0, 3).join(', ')} and other ingredients.`,
    ingredients: ingredients.map(ing => ({
      name: ing,
      amount: "as needed",
      notes: ""
    })),
    steps: [
      {
        order: 1,
        instruction: `Prepare all ingredients: ${ingredients.join(', ')}.`,
        timer_seconds: 0,
        voice_hint: "Take your time with preparation"
      },
      {
        order: 2,
        instruction: "Combine ingredients according to your preference and cook until done.",
        timer_seconds: 0,
        voice_hint: "Taste and adjust seasoning as needed"
      },
      {
        order: 3,
        instruction: "Serve hot and enjoy your meal!",
        timer_seconds: 0,
        voice_hint: "Let it rest for a moment before serving"
      }
    ],
    prep_minutes: 10,
    cook_minutes: 15,
    total_minutes: 25,
    servings: servings,
    nutrition: {
      calories: 300,
      protein_g: 15,
      fat_g: 10,
      carbs_g: 30
    },
    substitutions: [],
    allergen_warnings: [],
    sources: [{ label: "Generated Recipe", url: "" }]
  };
};

const generateRecipe = async (requestData, userId = null) => {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: generateUserPrompt(requestData) }
    ];

    const response = await axios.post(`${DEEPSEEK_API_URL}/chat/completions`, {
      model: 'deepseek-chat',
      messages,
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const content = response.data.choices[0].message.content;
    
    try {
      const recipe = JSON.parse(content);
      
      // Validate required fields
      if (!recipe.title || !recipe.ingredients || !recipe.steps) {
        throw new Error('Invalid recipe structure');
      }

      // Add metadata
      recipe.id = generateRecipeId();
      recipe.created_at = new Date().toISOString();
      recipe.generated_by = 'deepseek';

      logger.info('Recipe generated successfully', { 
        recipeId: recipe.id,
        userId,
        tokensUsed: response.data.usage?.total_tokens 
      });

      return recipe;
    } catch (parseError) {
      logger.error('Failed to parse DeepSeek response', { content, error: parseError.message });
      // Fall back to deterministic recipe
      return generateFallbackRecipe(requestData.ingredients, requestData.servings);
    }
  } catch (error) {
    logger.error('DeepSeek API error', { 
      error: error.message, 
      status: error.response?.status,
      data: error.response?.data 
    });
    
    // Return fallback recipe instead of failing
    return generateFallbackRecipe(requestData.ingredients, requestData.servings);
  }
};

const generateRecipeId = () => {
  return 'recipe_' + createHash('sha1')
    .update(Date.now() + Math.random().toString())
    .digest('hex')
    .substring(0, 12);
};

const getCachedRecipe = async (cacheKey) => {
  try {
    const redis = getRedisClient();
    const hashedKey = createHash('sha256').update(cacheKey).digest('hex');
    const cached = await redis.get(`recipe:${hashedKey}`);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  } catch (error) {
    logger.error('Redis get error', { error: error.message });
    return null;
  }
};

const cacheRecipe = async (cacheKey, recipe, ttl = 24 * 60 * 60) => {
  try {
    const redis = getRedisClient();
    const hashedKey = createHash('sha256').update(cacheKey).digest('hex');
    
    await redis.setex(
      `recipe:${hashedKey}`,
      ttl,
      JSON.stringify(recipe)
    );
  } catch (error) {
    logger.error('Redis set error', { error: error.message });
  }
};

module.exports = {
  generateRecipe,
  getCachedRecipe,
  cacheRecipe,
  generateFallbackRecipe
};