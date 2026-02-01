const { CohereClient } = require('cohere-ai');
require('dotenv').config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

(async () => {
  const res = await cohere.models.list();

  console.log("\nFULL RESPONSE:\n");
  console.log(res);   // ← print everything first

})();
