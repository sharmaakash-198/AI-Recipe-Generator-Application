const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { CohereClient } = require('cohere-ai');

dotenv.config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { ingredients } = req.body;

  const prompt = `Give me a detailed cooking recipe using these ingredients: ${ingredients.join(', ')}. Include preparation steps.`;

  try {
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      maxTokens: 800,
      temperature: 0.7,
    });

    const recipe = response.generations[0].text.trim();
    res.json({ recipe });
  } catch (err) {
    console.error('❌ Cohere Error:', err);
    res.status(500).json({ error: 'Something went wrong with Cohere API.' });
  }
});

app.listen(4000, () => {
  console.log('✅ Cohere-powered server running at http://localhost:4000');
});

