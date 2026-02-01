import { Router } from 'express';
import { generateRecipe, surpriseRecipe, getNutrition } from '../controllers/recipeController.js';

const router = Router();


router.post('/generate', generateRecipe);
router.post('/surprise', surpriseRecipe);
router.post('/nutrition', getNutrition);

export default router;
