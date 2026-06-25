/**
 * Vercel serverless function: POST /api/generate
 *
 * Securely proxies a prompt to the Gemini API. The API key lives only in the
 * server-side environment variable GEMINI_API_KEY (set in the Vercel project
 * settings), never in client code or the repo.
 *
 * Local dev: run `vercel dev` so this function and the static files are served
 * together at the same origin (the client fetches the relative path /api/generate).
 */
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server missing GEMINI_API_KEY environment variable' });
    return;
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-2.5-pro',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        generationConfig: { maxOutputTokens: 2048 },
      },
      { apiVersion: 'v1' }
    );

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(result.response.text());
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to call Gemini API', details: error.message });
  }
}
