import { GoogleGenAI, Modality } from '@google/genai';

const GEMINI_MODEL = 'gemini-3-pro-image';

const VTO_SYSTEM_INSTRUCTION = `You are an expert AI specialized in Virtual Try-On (VTO) technology and photorealistic image synthesis. Your task is to generate a new image based on two inputs:

User Image: A photo of a person.
Garment Image: A photo of an outfit.

Task: Seamlessly dress the person from the 'User Image' in the clothing shown in the 'Garment Image'.

Strict Constraints (CRITICAL):
Identity Preservation: You must NOT alter the user's facial features, skin tone, facial expression, mimiques, hair style, or hair color. The person's identity must remain 100% identical to the original photo.
Body Pose: Retain the exact body pose and structure of the user.
Garment Fitting: The new outfit must fit the user's body naturally, respecting gravity, folds, and lighting conditions of the original 'User Image'.
Background: Keep the background consistent with the original user photo if possible, or render a neutral background that matches the lighting.

Output: A high-resolution, photorealistic image showing the user wearing the selected outfit.`;

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
    const { userBase64, garmentBase64 } = req.body as { userBase64?: string; garmentBase64?: string };
    if (!userBase64 || !garmentBase64) {
      res.status(400).json({ error: 'Missing userBase64 or garmentBase64' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const userMimeMatch = userBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const userMime = userMimeMatch ? userMimeMatch[1] : 'image/jpeg';
    const cleanUser = userBase64.replace(/^data:[^;]+;base64,/, '');

    const garmentMimeMatch = garmentBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const garmentMime = garmentMimeMatch ? garmentMimeMatch[1] : 'image/jpeg';
    const cleanGarment = garmentBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { data: cleanUser, mimeType: userMime } },
          { inlineData: { data: cleanGarment, mimeType: garmentMime } },
          { text: VTO_SYSTEM_INSTRUCTION },
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
    console.error('Gemini VTO API Error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
