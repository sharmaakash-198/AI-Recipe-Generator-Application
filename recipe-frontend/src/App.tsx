import { useState, useEffect } from "react";
import axios from "axios";

interface Recipe {
  type: string;
  content: string;
  ingredients?: string[];
}

interface ParsedRecipe {
  name: string;
  time: string;
  ingredients: string[];
  instructions: string[];
  tip: string;
}


function parseRecipeContent(content: string): ParsedRecipe {
  const lines = content.split('\n').filter(line => line.trim());
  
  let name = "Unknown Recipe";
  let time = "Unknown";
  let ingredients: string[] = [];
  let instructions: string[] = [];
  let tip = "";
  
  let currentSection = "";
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.toLowerCase().startsWith('name:')) {
      name = trimmedLine.substring(5).trim();
    } else if (trimmedLine.toLowerCase().startsWith('cooking time:')) {
      time = trimmedLine.substring(13).trim();
    } else if (trimmedLine.toLowerCase().startsWith('ingredients:')) {
      currentSection = 'ingredients';
    } else if (trimmedLine.toLowerCase().startsWith('instructions:')) {
      currentSection = 'instructions';
    } else if (trimmedLine.toLowerCase().startsWith('tip:')) {
      tip = trimmedLine.substring(4).trim();
      currentSection = '';
    } else if (currentSection === 'ingredients' && trimmedLine.startsWith('-')) {
      ingredients.push(trimmedLine.substring(1).trim());
    } else if (currentSection === 'instructions' && /^\d+\./.test(trimmedLine)) {
      instructions.push(trimmedLine);
    }
  }
  
  return { name, time, ingredients, instructions, tip };
}

function formatRecipeText(text: string) {
  const withEmojis = text
    .replace(/Name:/gi, "📝 <span class='text-indigo-500 font-semibold'>Name:</span>")
    .replace(/Cooking Time:/gi, "⏱️ <span class='text-yellow-600 font-semibold'>Cooking Time:</span>")
    .replace(/Ingredients:/gi, "🧂 <span class='text-green-600 font-semibold'>Ingredients:</span>")
    .replace(/Instructions:/gi, "👨‍🍳 <span class='text-orange-600 font-semibold'>Instructions:</span>")
    .replace(/Tip:/gi, "💡 <span class='text-blue-600 font-semibold'>Tip:</span>")
    .replace(/Calories:/gi, "🔥 <span class='text-red-600 font-semibold'>Calories:</span>")
    .replace(/Macronutrients:/gi, "📊 <span class='text-purple-600 font-semibold'>Macronutrients:</span>")
    .replace(/Vitamins:/gi, "🍊 <span class='text-orange-600 font-semibold'>Vitamins:</span>")
    .replace(/Minerals:/gi, "⚡ <span class='text-gray-600 font-semibold'>Minerals:</span>")
    .replace(/Health Benefits:/gi, "💚 <span class='text-green-600 font-semibold'>Health Benefits:</span>")
    .replace(/Note:/gi, "⚠️ <span class='text-amber-600 font-semibold'>Note:</span>");

  const html = withEmojis
    .replace(/\n/g, "<br>")
    .replace(/(\d+\.)/g, "<span class='font-semibold text-purple-600'>$1</span>")
    .replace(/^- /gm, "• ");

  return html;
}

function getImageQuery(recipeName: string): string {
  // Extract key words from recipe name for better image search
  const cleanName = recipeName.toLowerCase()
    .replace(/recipe|dish|meal/g, '')
    .trim();
  return cleanName || 'delicious food';
}

function RecipeCard({ recipe, index }: { recipe: Recipe, index: number }) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const parsedRecipe = parseRecipeContent(recipe.content);
  
  const recipeTypeColors = {
    'Quick & Easy': 'from-green-400 to-green-600',
    'Healthy Option': 'from-blue-400 to-blue-600',
    'Creative or Trending': 'from-purple-400 to-purple-600',
    'Surprise Recipe': 'from-pink-400 to-pink-600'
  };

  const colorClass = recipeTypeColors[recipe.type as keyof typeof recipeTypeColors] || 'from-gray-400 to-gray-600';

  useEffect(() => {
    // Use a reliable food image service
    const fetchImage = async () => {
      try {
        // Use FoodiesFeed API or fallback to a food placeholder
        const foodImages = [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop'
        ];
        
        const randomImage = foodImages[Math.floor(Math.random() * foodImages.length)];
        setImageUrl(randomImage);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl('https://via.placeholder.com/400x300?text=🍽️+Recipe+Image');
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();
  }, [parsedRecipe.name]);

  
  const suggestAlternatives = (ingredients: string[]) => {
    const alternatives: { [key: string]: string[] } = {
      'milk': ['almond milk', 'oat milk', 'coconut milk'],
      'butter': ['olive oil', 'coconut oil', 'margarine'],
      'eggs': ['flax eggs', 'chia eggs', 'applesauce'],
      'flour': ['almond flour', 'coconut flour', 'oat flour'],
      'sugar': ['honey', 'maple syrup', 'stevia'],
      'chicken': ['tofu', 'mushrooms', 'jackfruit'],
      'beef': ['lentils', 'black beans', 'portobello mushrooms'],
      'cheese': ['nutritional yeast', 'cashew cheese', 'vegan cheese']
    };

    return ingredients.map(ingredient => {
      const baseIngredient = ingredient.toLowerCase().split(' ')[0];
      const alt = alternatives[baseIngredient];
      return alt ? `${ingredient} (alternatives: ${alt.join(', ')})` : ingredient;
    });
  };

  const enhancedIngredients = suggestAlternatives(parsedRecipe.ingredients);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700 backdrop-blur-sm">
      {/* Recipe Type Header */}
      <div className={`bg-gradient-to-r ${colorClass} text-white p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-wide">{recipe.type}</h3>
            <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Recipe Image */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
        {imageLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-300 opacity-20"></div>
            </div>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={parsedRecipe.name}
            className="w-full h-full object-cover"
            onError={() => setImageUrl('https://via.placeholder.com/400x300?text=Recipe+Image')}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Recipe Content */}
      <div className="p-8 text-gray-900 dark:text-white space-y-8">
        <div className="border-b border-gray-200 dark:border-slate-600 pb-6">
          <h4 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            📝 {parsedRecipe.name}
          </h4>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-full">
              <span className="text-amber-500">⏱️</span>
              <span className="font-medium text-amber-700 dark:text-amber-400">{parsedRecipe.time}</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full">
              <span className="text-green-500">👥</span>
              <span className="font-medium text-green-700 dark:text-green-400">4 Servings</span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
          <h5 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">🧂</span>
            Ingredients
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enhancedIngredients.map((ingredient, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-green-100 dark:border-green-800/50">
                <span className="text-green-500 text-sm font-bold mt-0.5">•</span>
                <span className="text-sm leading-relaxed">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions with TTS */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800">
          <div className="flex items-center justify-between mb-6">
            <h5 className="text-xl font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <span className="text-2xl">👨‍🍳</span>
              Instructions
            </h5>
            
          </div>
          <div className="space-y-4">
            {parsedRecipe.instructions.map((instruction, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  // currentStep === i 
                  false
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-800/40 border-yellow-300 dark:border-yellow-600 shadow-md transform scale-105' 
                    : 'bg-white/60 dark:bg-slate-800/60 border-orange-100 dark:border-orange-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'
                }`}
              >
                <div className="flex gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    // currentStep === i 
                    false
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed pt-1">
                    {instruction.replace(/^\d+\.\s*/, '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        {parsedRecipe.tip && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h5 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Pro Tip
            </h5>
            <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200 bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
              {parsedRecipe.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [nutrition, setNutrition] = useState<string>("");
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [showVoiceInfo, setShowVoiceInfo] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const generateRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setRecipe(null);
    setNutrition("");
    
    try {
      const res = await axios.post("http://localhost:4000/api/recipes/generate", {
        ingredients: ingredients.split(",").map((i) => i.trim()),
      });
      setRecipe(res.data.recipe);
    } catch (error: any) {
      console.error("Error:", error.message);
      // Create error recipe
      setRecipe({
        type: 'Error',
        content: 'Name: Error\nCooking Time: 0 minutes\nIngredients:\n- Unable to generate recipe\nInstructions:\n1. Please try again later\nTip: Check your internet connection'
      });
    }
    setLoading(false);
  };

  const generateSurpriseRecipe = async () => {
    setSurpriseLoading(true);
    setRecipe(null);
    setNutrition("");
    
    try {
      const res = await axios.post("http://localhost:4000/api/recipes/surprise");
      setRecipe(res.data.recipe);
      // Update ingredients field with surprise ingredients
      if (res.data.recipe.ingredients) {
        setIngredients(res.data.recipe.ingredients.join(', '));
      }
    } catch (error: any) {
      console.error("Error:", error.message);
      setRecipe({
        type: 'Error',
        content: 'Name: Error\nCooking Time: 0 minutes\nIngredients:\n- Unable to generate surprise recipe\nInstructions:\n1. Please try again later\nTip: Check your internet connection'
      });
    }
    setSurpriseLoading(false);
  };

  const fetchNutrition = async (recipe: Recipe) => {
    setNutritionLoading(true);
    try {
      const parsedRecipe = parseRecipeContent(recipe.content);
      const res = await axios.post("http://localhost:4000/api/recipes/nutrition", {
        recipeName: parsedRecipe.name,
        ingredients: parsedRecipe.ingredients.map(ingredient => ingredient.split(' ')[0]),
      });
      setNutrition(res.data.nutrition);
    } catch (error) {
      console.error("Error fetching nutrition:", error.message);
      setNutrition("Unable to fetch nutrition information. Please try again later.");
    } finally {
      setNutritionLoading(false);
    }
  };

  const fetchNutritionInfo = () => {
    if (recipe) {
      fetchNutrition(recipe);
    }
  };

  
  return (
    <div className="min-h-screen relative p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 text-slate-800 dark:text-white">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700"
      >
        <span className="flex items-center gap-2 font-medium">
          {darkMode ? (
            <>
              <span className="text-lg">☀️</span>
              Light
            </>
          ) : (
            <>
              <span className="text-lg">🌙</span>
              Dark
            </>
          )}
        </span>
      </button>

      {/* Watermark */}
      <div className="absolute top-6 right-6 text-sm bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">Created By</div>
          <div className="font-bold text-slate-700 dark:text-white">AKASH SHARMA</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🥘 AI Recipe Generator
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Transform your ingredients into culinary masterpieces with AI-powered recipe generation
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter ingredients (e.g., chicken, tomatoes, onions)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-300 text-center font-medium"
                  onKeyPress={(e) => e.key === 'Enter' && generateRecipe()}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🥕
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateRecipe}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl"
                  disabled={loading || !ingredients.trim()}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Generating Recipe...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      🔍 Generate Recipe
                    </span>
                  )}
                </button>
                
                <button
                  onClick={generateSurpriseRecipe}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl"
                  disabled={surpriseLoading}
                >
                  {surpriseLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Surprising You...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      🎲 Surprise Me!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        {(loading || surpriseLoading) && (
          <div className="flex justify-center mb-12">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-indigo-300 opacity-20"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white">
                    {loading ? "Creating Your Recipe..." : "Preparing a Surprise..."}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    This might take a few moments
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Card */}
        {recipe && (
          <div className="max-w-4xl mx-auto">
            <RecipeCard recipe={recipe} index={0} />

            {/* Action Buttons */}
            <div className="text-center mt-8 space-y-4">
              {/* Nutrition Button */}
              <div>
                <button
                  onClick={fetchNutritionInfo}
                  disabled={nutritionLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
                >
                  {nutritionLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Analyzing Nutrition...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      🥗 Get Nutrition Information
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Information */}
        {nutrition && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 shadow-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  🥗
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Nutrition Information
                </h2>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50">
                <div className="text-base leading-relaxed space-y-3 max-h-80 overflow-y-auto" dangerouslySetInnerHTML={{ __html: formatRecipeText(nutrition) }} />
              </div>
            </div>
          </div>
        )}

        
        {/* Features Info */}
        {!recipe && !loading && !surpriseLoading && (
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  ✨ Powerful Features
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Discover what makes our AI Recipe Generator special
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-pink-100 dark:border-pink-800">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                    🎲
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Surprise Me</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Get random recipes with curated ingredients for culinary adventures</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                    🔊
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Text-to-Speech</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Listen to cooking instructions step by step with AI voice</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                    🖼️
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Food Images</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Beautiful high-quality images for visual recipe inspiration</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                    💡
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Pro Tips</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Expert cooking tips and tricks to perfect your dishes</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                    🥗
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Nutrition Analysis</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Detailed nutritional information and health insights</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-100 dark:border-cyan-800">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                    🤖
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">AI Powered</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Advanced AI technology for personalized recipe generation</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
