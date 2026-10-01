import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { processStoryTurn } from './src/server/engine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Engine status endpoint
app.get('/api/engine/status', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Story generation endpoint
app.post('/api/story/generate', async (req, res) => {
  try {
    const { genre, history, currentChoice, customAction, chapterNumber, protagonistName } = req.body;

    if (!genre) {
      return res.status(400).json({ error: 'El género es requerido.' });
    }

    const result = await processStoryTurn({
      genre,
      protagonistName,
      chapterNumber,
      currentChoice,
      customAction,
      history,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error generating story turn:', error);
    return res.status(500).json({
      error: 'Error interno al generar el turno narrativo.',
      details: error?.message,
    });
  }
});

// Vite middleware / production static server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Motor de Ficción Interactiva listo en http://localhost:${PORT}`);
  });
}

startServer();
