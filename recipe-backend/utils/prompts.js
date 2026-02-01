const prompt = (ingredients) => `Create a delicious recipe using these ingredients: ${ingredients.join(', ')}.
Format exactly like:

Name:
Cooking Time:
Ingredients:
Instructions:
Tip:`;

const nutritionPrompt = (recipeName, ingredients) =>
`Analyze nutrition for:
${recipeName}
Ingredients: ${ingredients.join(', ')}
Give calories, macros, vitamins, minerals, benefits.
`;

export { prompt, nutritionPrompt };