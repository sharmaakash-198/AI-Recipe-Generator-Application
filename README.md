# AI Recipe Generator — Intelligent Cooking Assistant 

A compact, full-stack app that uses Cohere AI to generate detailed, cookable recipes from user-provided ingredients. This repo contains two folders: `recipe-backend` (Express API) and `recipe-frontend` (Vite + React UI).

---

## Quick Start (short and actionable)

Prerequisites:
- Node.js 16+
- A Cohere API key (create at https://cohere.ai)

1) Configure the backend:
```bash
cd recipe-backend
cp .env.example .env  # create .env (or create manually)
# set COHERE_API_KEY in recipe-backend/.env
npm install
npm run dev
# server: http://localhost:4000
```

2) Run the frontend:
```bash
cd recipe-frontend
npm install
npm run dev
# app: http://localhost:5173 (Vite default)
```

> Tip: For auto-reloading the backend during development, install `nodemon` globally (`npm i -g nodemon`) or add it as a devDependency and run `npx nodemon server.js`.

---

## What’s inside (Tech Stack)
- Frontend: React 18, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, dotenv, cors, Cohere AI SDK
- Dev tools: npm, Vite dev server

## Project Structure
```
recipe-backend/   # Express API (port 4000)
  ├─ controllers/
  ├─ routes/
  ├─ services/
  ├─ utils/
  ├─ server.js
  └─ package.json

recipe-frontend/  # Vite + React frontend
  ├─ src/
  ├─ index.html
  └─ package.json
```

## API (backend)
Base URL (development): `http://localhost:4000/api/recipes`

Endpoints:
- POST /api/recipes/generate
  - Body: `{ "ingredients": ["onion","garlic",...] }`
  - Response: `{ "recipe": { type, content, ingredients } }`
- POST /api/recipes/surprise — returns a surprise recipe
- POST /api/recipes/nutrition — returns nutrition info for a recipe

Example (curl):
```bash
curl -X POST http://localhost:4000/api/recipes/generate \
  -H "Content-Type: application/json" \
  -d '{"ingredients":["chicken","rice","garlic"]}'
```

## Environment variables
Create `recipe-backend/.env` with:
```env
COHERE_API_KEY=your_cohere_api_key_here
```
Do NOT commit `.env` to version control. Keep an example file `recipe-backend/.env.example` in the repo instead.

## Development notes & troubleshooting
- If you see CORS issues, confirm the frontend is talking to `http://localhost:4000` and the backend `cors()` middleware is enabled.
- If the backend doesn't start, check that `COHERE_API_KEY` is set and valid.
- Vite dev server runs on 5173 by default; if already in use, it will prompt to use a different port.

## Future ideas
- Save favorite recipes (DB + auth)
- Nutritional breakdown and scaling
- Shareable recipe links or PDF export
- Image generation for recipes via an image model

---

## Author
Akash Sharma

## License
MIT

