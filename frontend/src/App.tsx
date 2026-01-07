import { useState, useEffect } from "react";
import axios from "axios";

function formatRecipeText(text: string) {
  const withEmojis = text
    .replace(/Title:/g, "📝 <span class='text-indigo-500 font-semibold'>Title:</span>")
    .replace(/Ingredients:/g, "🧂 <span class='text-green-600 font-semibold'>Ingredients:</span>")
    .replace(/Instructions:/g, "👨‍🍳 <span class='text-orange-600 font-semibold'>Instructions:</span>")
    .replace(/Preparation:/g, "⏱️ <span class='text-yellow-600 font-semibold'>Preparation:</span>")
    .replace(/Notes:/g, "🗒️ <span class='text-blue-600 font-semibold'>Notes:</span>");

  const html = withEmojis
    .replace(/\n/g, "<br>")
    .replace(/(\d+\.)/g, "<span class='font-semibold text-purple-600'>$1</span>");

  return html;
}

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const generateRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/generate", {
        ingredients: ingredients.split(",").map((i) => i.trim()),
      });
      setRecipe(res.data.recipe);
    } catch (error: any) {
      console.error("Error:", error.message);
      setRecipe("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative p-4 flex flex-col items-center justify-center
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white
      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* 🔘 Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 left-4 bg-white dark:bg-gray-700 text-indigo-600 dark:text-white px-3 py-1 rounded-md shadow hover:scale-105 transition"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* ✍️ Watermark */}
      <div className="absolute top-4 right-4 text-sm text-white/70 dark:text-white/40">
        Created By
        <div>
          <span className="font-semibold display: inline-block">AKASH SHARMA</span>
        </div>
      </div>

      {/* 💡 Heading */}
      <h1 className="text-4xl font-bold mb-4">🥘 AI Recipe Generator</h1>

      {/* 📝 Input */}
      <input
        type="text"
        placeholder="Enter ingredients (comma-separated)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        className="p-2 rounded text-black w-full max-w-md mb-4"
      />

      {/* ▶️ Button */}
      <button
        onClick={generateRecipe}
        className="bg-white text-indigo-600 px-4 py-2 rounded font-semibold hover:bg-gray-200 transition"
        disabled={loading}
      >
        {loading ? "Generating..." : "Get Recipe"}
      </button>

      {/* 📋 Recipe Output */}
      {recipe && (
        <div className="mt-6 bg-white dark:bg-gray-100 text-gray-900 p-6 rounded-2xl shadow-lg max-w-2xl w-full space-y-4 overflow-y-auto max-h-[70vh]">
          <h2 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            🍽 Recipe
          </h2>
          <div
            className="text-base leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: formatRecipeText(recipe) }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
