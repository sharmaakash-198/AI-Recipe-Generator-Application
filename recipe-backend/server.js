import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import recipeRoutes from './routes/recipeRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;

app.use('/api/recipes',recipeRoutes);


app.listen(PORT, (err) => {
  if (err) {
    console.error(`❌ Server failed to start on port ${PORT}:`, err);
  } else {
    console.log(`✅ Cohere-powered server running at http://localhost:${PORT}`);
  }
});
