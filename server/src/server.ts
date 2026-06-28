import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import path from 'path';
import fs from 'fs';

// Load environment variables relative to the server folder
const envPath = path.join(__dirname, '../.env');
console.log(`ℹ️ Env path: ${envPath} | exists: ${fs.existsSync(envPath)}`);
dotenv.config({ path: envPath });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for simplicity in local development, can restrict in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY;
let groq: Groq | null = null;

if (apiKey) {
  groq = new Groq({ apiKey });
  console.log('✅ Groq API client initialized successfully.');
} else {
  console.warn('⚠️ Warning: GROQ_API_KEY is not defined in the environment. Translation requests will fail until an API key is provided.');
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiConfigured: !!process.env.GROQ_API_KEY
  });
});

// Translation endpoint
app.post('/api/translate', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { text, sourceLang, targetLang, tone = 'default' } = req.body;

    // Input Validation
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Text to translate is required and must be a valid string.' });
    }

    if (!targetLang || typeof targetLang !== 'string') {
      return res.status(400).json({ error: 'Target language is required.' });
    }

    // Check API Key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Groq API key is missing on the server. Please add your GROQ_API_KEY in the server/.env file and restart the server.'
      });
    }

    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    const sourceLangDisplay = sourceLang === 'auto' ? 'Auto-Detect' : sourceLang;
    const toneInstruction = tone !== 'default' ? `Tone: Use a ${tone} tone/style.` : 'Tone: Preserve the original text\'s tone (formal/informal/neutral/etc.).';

    // Construct a strict and clear translation prompt
    const systemPrompt = `You are a professional, expert AI translator. Your goal is to translate text from one language to another while maintaining absolute accuracy, natural expression, and structural layout.

Instructions:
1. Translate the user's text into the target language: "${targetLang}".
2. Source Language is "${sourceLangDisplay}". If "Auto-Detect", you must first identify the source language, translate it, and output the translated text.
3. ${toneInstruction}
4. Preserve the exact layout of the input, including formatting, paragraph breaks, capitalization, emojis, links, punctuation, and markdown syntax. Do not alter or omit them.
5. Return ONLY the raw translated text. Do not include any explanations, introductory text (like "Here is the translation:"), notes, or wrap the response in markdown code blocks (e.g. \`\`\`text). Your output will be consumed directly by an API.
6. If the source language matches the target language, or if the text is language-neutral (like a list of numbers or punctuation), return the text exactly as it is.`;

    console.log(`[Translate Request] Length: ${text.length} chars | Source: ${sourceLangDisplay} | Target: ${targetLang} | Tone: ${tone}`);

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // High speed, high quality, free-tier compatible model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
    });

    const translatedText = response.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('Received an empty response from the Groq API.');
    }

    // Return translation response
    return res.json({
      translatedText,
      toneUsed: tone,
      targetLanguage: targetLang
    });

  } catch (error: any) {
    console.error('Translation Error:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'An error occurred during translation. Please try again later.'
    });
  }
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal server error. Please check server logs.'
  });
});

// Serve frontend static build
const clientDistPath = path.join(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log(`✅ Serving static frontend from: ${clientDistPath}`);
} else {
  console.log(`ℹ️ Static frontend dist folder not found at ${clientDistPath}. Run 'npm run build' in client directory to enable static serving.`);
}

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
