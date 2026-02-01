import {chatWithCohere} from '../services/cohereService.js';
import { prompt, nutritionPrompt } from '../utils/prompts.js';


// =========================
// GENERATE RECIPE
// =========================
const generateRecipe = async (req, res) => {
    try {
        const { ingredients } = req.body;

        const recipePrompt = prompt(ingredients);

        const content = await chatWithCohere(recipePrompt, 0.7, 600);
        // const content = "Name: Test\nCooking Time: 10 min\nIngredients:\n- rice\nInstructions:\n1. cook\nTip: enjoy";


        res.json({ recipe: { type: 'Recipe', content, ingredients } });

    } catch (err) {
        console.error('❌ Cohere Error:', err);
        res.status(500).json({ error: 'Cohere failed.' });
    };
}

// =========================
// SURPRISE RECIPE
// =========================
const surpriseRecipe = async (req, res) => {
    try {

        const surpriseIngredients = [
            ['chicken', 'garlic', 'lemon', 'herbs'],
            ['pasta', 'tomatoes', 'basil', 'cheese'],
            ['rice', 'vegetables', 'soy sauce', 'ginger'],
            ['salmon', 'asparagus', 'butter', 'dill'],
            ['beef', 'onions', 'mushrooms', 'wine'],
            ['eggs', 'spinach', 'feta cheese', 'olive oil'],
            ['shrimp', 'avocado', 'lime', 'cilantro'],
            ['pork', 'apples', 'thyme', 'honey'],
            ['tofu', 'broccoli', 'sesame oil', 'garlic'],
            ['cod', 'potatoes', 'rosemary', 'lemon']
        ];

        const random = surpriseIngredients[Math.floor(Math.random() * surpriseIngredients.length)];

        const content = await chatWithCohere(
            `Create a fun SURPRISE recipe using: ${random.join(', ')}`,
            0.8,
            600);

        res.json({
            recipe: {
                type: 'Surprise Recipe',
                content,
                ingredients: random
            }
        });

    } catch (err) {
        console.error('❌ Cohere Error:', err);
        res.status(500).json({ error: 'Cohere failed.' });
    }
};

// =========================
// NUTRITION
// =========================
const getNutrition = async (req, res) => {
  try {
    const { recipeName, ingredients } = req.body;

    if (!recipeName || !ingredients?.length) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const prompt = nutritionPrompt(recipeName, ingredients);

    const content = await chatWithCohere(prompt, 0.5, 800);

    res.json({ nutrition: content });

  } catch (err) {
    console.error('❌ Cohere Error:', err);
    res.status(500).json({ error: 'Cohere failed.' });
  }
};


export { generateRecipe, surpriseRecipe, getNutrition };