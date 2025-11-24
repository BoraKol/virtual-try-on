import { GoogleGenAI, Modality } from '@google/genai';

const GEMINI_MODEL = 'gemini-3-pro-image-preview';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY missing' });
    return;
  }

  try {
    const { base64Image, prompt } = req.body as { base64Image?: string; prompt?: string };
    if (!base64Image || !prompt) {
      res.status(400).json({ error: 'Missing base64Image or prompt' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    const imageData = parts && parts[0]?.inlineData?.data;

    if (!imageData) {
      res.status(502).json({ error: 'No image data returned from Gemini.' });
      return;
    }

    res.status(200).json({ image: `data:image/png;base64,${imageData}` });
  } catch (err: any) {
    console.error('Gemini Edit API Error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
