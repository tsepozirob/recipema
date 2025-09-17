const express = require('express');
const Joi = require('joi');
const { generateRecipe, getCachedRecipe, cacheRecipe } = require('../services/recipeService');
const { validateRequest } = require('../middleware/validation');
const { authenticateUser } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Validation schema
const generateRecipeSchema = Joi.object({
  ingredients: Joi.array().items(Joi.string().max(100)).min(1).max(20).required(),
  constraints: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  preferences: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  equipment: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  time_minutes: Joi.number().integer().min(5).max(480).default(30),
  servings: Joi.number().integer().min(1).max(12).default(4),
  locale: Joi.string().max(10).default('en-US')
});

router.post('/generate', 
  authenticateUser,
  validateRequest(generateRecipeSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const requestData = req.body;
      
      // Create cache key
      const cacheKey = JSON.stringify({
        ingredients: requestData.ingredients.sort(),
        constraints: requestData.constraints?.sort() || [],
        time_minutes: requestData.time_minutes,
        servings: requestData.servings
      });

      // Check cache first
      const cachedRecipe = await getCachedRecipe(cacheKey);
      if (cachedRecipe) {
        logger.info('Recipe served from cache', { userId, cacheKey });
        return res.json(cachedRecipe);
      }

      // Generate new recipe
      const recipe = await generateRecipe(requestData, userId);
      
      if (!recipe) {
        return res.status(500).json({ 
          error: 'Failed to generate recipe',
          message: 'Please try again with different ingredients'
        });
      }

      // Cache the result
      await cacheRecipe(cacheKey, recipe);

      logger.info('Recipe generated successfully', { 
        userId, 
        recipeId: recipe.id,
        ingredientCount: requestData.ingredients.length 
      });

      res.json(recipe);
    } catch (error) {
      logger.error('Recipe generation error', { error: error.message, userId: req.user?.id });
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Please wait before generating another recipe'
        });
      }
      
      if (error.message.includes('quota')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'AI service is temporarily unavailable'
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Please try again later'
      });
    }
  }
);

router.get('/history', 
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      
      // TODO: Implement recipe history from database
      const recipes = [];
      
      res.json({
        recipes,
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      });
    } catch (error) {
      logger.error('Recipe history error', { error: error.message, userId: req.user.id });
      res.status(500).json({ error: 'Failed to fetch recipe history' });
    }
  }
);

module.exports = router;