/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractHtmlFromText } from "../utils/html";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const IMAGE_SYSTEM_PROMPT = "Generate an isolated object/scene on a simple background.";
export const VOXEL_PROMPT = "I have provided an image. Code a beautiful voxel art scene inspired by this image. Write threejs code as a single-page.";

export const generateImage = async (prompt: string, aspectRatio: string = '1:1', optimize: boolean = true): Promise<string> => {
  try {
    let finalPrompt = prompt;

    // Apply the shortened optimization prompt if enabled
    if (optimize) {
      finalPrompt = `${IMAGE_SYSTEM_PROMPT}\n\nSubject: ${prompt}`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([finalPrompt]);
    const response = await result.response;
    const text = response.text();

    // Note: Google Generative AI SDK doesn't directly support image generation
    // This is a placeholder implementation - you may need to use a different service
    throw new Error("Image generation not supported with @google/generative-ai. Consider using Imagen API or another service.");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

export const generateVoxelScene = async (
  imageBase64: string,
  onThoughtUpdate?: (thought: string) => void
): Promise<string> => {
  // Extract the base64 data part if it includes the prefix
  const base64Data = imageBase64.split(',')[1] || imageBase64;

  // Extract MIME type from the data URL if present, otherwise default to jpeg
  const mimeMatch = imageBase64.match(/^data:(.*?);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  let fullHtml = "";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContentStream([
      VOXEL_PROMPT,
      imagePart
    ]);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullHtml += chunkText;
    }

    return extractHtmlFromText(fullHtml);

  } catch (error) {
    console.error("Voxel scene generation failed:", error);
    throw error;
  }
};
