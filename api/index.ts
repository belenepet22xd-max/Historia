import express from 'express';
import { processStoryTurn } from '../src/server/engine';

const app = express();
app.use(express.json());

app.get('/api/engine/status', (req, res) => {
  res.json({
    status: 'online',
    platform: 'vercel',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

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
    return res.status(500).json({
      error: 'Error al procesar el turno en Vercel.',
      details: error?.message,
    });
  }
});

export default app;
