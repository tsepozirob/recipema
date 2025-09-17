const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const { authenticateUser } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// OCR endpoint
router.post('/', 
  authenticateUser,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const userId = req.user?.id;
      logger.info('OCR processing started', { userId, fileSize: req.file.size });

      // Optimize image for OCR
      const optimizedImage = await sharp(req.file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .png({ quality: 90 })
        .toBuffer();

      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(optimizedImage, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Extract potential ingredients from text
      const ingredients = extractIngredients(text);

      logger.info('OCR completed', { 
        userId, 
        textLength: text.length, 
        ingredientsFound: ingredients.length 
      });

      res.json({
        raw_text: text,
        extracted_ingredients: ingredients,
        confidence: calculateConfidence(text),
        processing_time: Date.now()
      });

    } catch (error) {
      logger.error('OCR processing error', { error: error.message, userId: req.user?.id });
      
      if (error.message.includes('File too large')) {
        return res.status(413).json({ 
          error: 'File too large',
          message: 'Please upload an image smaller than 10MB'
        });
      }

      res.status(500).json({ 
        error: 'OCR processing failed',
        message: 'Please try again with a clearer image'
      });
    }
  }
);

// Extract ingredient-like words from OCR text
function extractIngredients(text) {
  // Common ingredient patterns and keywords
  const ingredientKeywords = [
    'tomato', 'onion', 'garlic', 'pepper', 'salt', 'oil', 'butter', 'flour',
    'sugar', 'egg', 'milk', 'cheese', 'chicken', 'beef', 'fish', 'rice',
    'pasta', 'bread', 'carrot', 'potato', 'lettuce', 'spinach', 'mushroom',
    'basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'ginger',
    'lemon', 'lime', 'apple', 'banana', 'strawberry', 'blueberry', 'avocado'
  ];

  // Split text into words and clean them
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  // Find potential ingredients
  const ingredients = [];
  const seen = new Set();

  words.forEach(word => {
    // Check if word matches or contains ingredient keywords
    const matchedKeyword = ingredientKeywords.find(keyword => 
      word.includes(keyword) || keyword.includes(word)
    );

    if (matchedKeyword && !seen.has(matchedKeyword)) {
      ingredients.push(capitalizeFirst(matchedKeyword));
      seen.add(matchedKeyword);
    }
  });

  // Also try to extract quantity + ingredient pairs
  const quantityPattern = /(\d+(?:\.\d+)?)\s*(?:cups?|tbsp|tsp|oz|lbs?|kg|g|ml|l)?\s+([a-zA-Z\s]+)/gi;
  let match;
  
  while ((match = quantityPattern.exec(text)) !== null) {
    const ingredient = match[2].trim().toLowerCase();
    if (ingredient.length > 2 && !seen.has(ingredient)) {
      ingredients.push(capitalizeFirst(ingredient));
      seen.add(ingredient);
    }
  }

  return ingredients.slice(0, 15); // Limit to 15 ingredients
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function calculateConfidence(text) {
  // Simple confidence based on text characteristics
  const hasLetters = /[a-zA-Z]/.test(text);
  const hasNumbers = /[0-9]/.test(text);
  const textLength = text.trim().length;
  
  let confidence = 0.5;
  
  if (hasLetters) confidence += 0.2;
  if (hasNumbers) confidence += 0.1;
  if (textLength > 50) confidence += 0.2;
  if (textLength > 200) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

module.exports = router;