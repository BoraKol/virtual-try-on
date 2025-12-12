import { VTO_SYSTEM_INSTRUCTION } from "../constants";

// Client-side service now calls serverless API routes to keep API key secret.

/**
 * Edit an image using a text prompt.
 */
export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    const resp = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, prompt }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Edit API error');
    }
    const data = await resp.json();
    return data.image as string;
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};

/**
 * Perform Virtual Try-On using User Image and Garment Image.
 */
// Define input interface for clarity and flexibility
export interface VTOOptions {
  userBase64: string;
  garmentBase64?: string;
  upperBase64?: string;
  lowerBase64?: string;
}

/**
 * Perform Virtual Try-On using User Image and Garment Image(s).
 */
export const generateVTOWithGemini = async (
  options: VTOOptions
): Promise<string> => {
  try {
    const resp = await fetch('/api/vto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userBase64: options.userBase64,
        garmentBase64: options.garmentBase64,
        upperBase64: options.upperBase64,
        lowerBase64: options.lowerBase64,
        instruction: VTO_SYSTEM_INSTRUCTION
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'VTO API error');
    }
    const data = await resp.json();
    return data.image as string;
  } catch (error) {
    console.error("Gemini VTO Error:", error);
    throw error;
  }
};
