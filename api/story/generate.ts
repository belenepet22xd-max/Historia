import { processStoryTurn } from '../../src/server/engine';

export default async function handler(req: any, res: any) {
  // Enable CORS if accessed from outside
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // keep as is
      }
    }

    const { genre, history, currentChoice, customAction, chapterNumber, protagonistName } = body || {};

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

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel API error in /api/story/generate:', error);
    return res.status(500).json({
      error: 'Error al procesar el turno en Vercel Serverless Function.',
      details: error?.message,
    });
  }
}
