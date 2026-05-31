/**
 * server.js
 *
 * This server acts as a secure backend for the proto/Stylist application.
 * It uses the `@google/generative-ai` SDK, which authenticates with a simple
 * API key. This is the standard method for accessing Gemini models for most
 * web applications and aligns with the setup that previously worked.
 *
 * Why is this necessary?
 * - Security: An API key should never be exposed in client-side code. This
 *   server keeps the key private and acts as a proxy.
 *
 * How it works:
 * 1. Loads the `GEMINI_API_KEY` from the `.env` file.
 * 2. Initializes the GoogleGenerativeAI client.
 * 3. Defines a POST `/api/generate` endpoint.
 * 4. When the endpoint is hit, it takes the `prompt` from the request body.
 * 5. It sends the prompt to the Gemini model and streams the response back.
 */
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize dotenv
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Allows requests from your front-end
app.use(express.json()); // Parses incoming JSON requests

// --- Google AI Initialization ---
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro', // UPDATE THIS with the name from the diagnostic script
    safety_settings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
    generation_config: { max_output_tokens: 2048 },
}, {
    // Force the SDK to use the stable v1 API endpoint instead of the default v1beta
    apiVersion: 'v1'
});

// --- API Endpoint ---
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
    }

    try {
        const result = await model.generateContentStream({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        // Pipe the streaming response directly to the client
        res.setHeader('Content-Type', 'text/plain');
        for await (const item of result.stream) {
            res.write(item.candidates[0]?.content?.parts[0]?.text || '');
        }
        res.end();
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Send a more detailed error message to the client for better debugging.
        // The `error.message` from the Vertex AI client is often very informative.
        res.status(500).send({ 
            error: 'Failed to call Gemini API',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`proto/Stylist server listening at http://localhost:${port}`);
    console.log('Using Google AI Studio (API Key) for generation.');
});