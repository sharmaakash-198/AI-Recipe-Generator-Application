import cohere from "../config/cohere.js";

async function chatWithCohere(prompt, temperature = 0.7, maxTokens = 600) {
  const response = await cohere.chat({
    model: 'command-r7b-12-2024',
    message: prompt,
    temperature,
    maxTokens,
  });

  return response.text.trim();
}
export { chatWithCohere };