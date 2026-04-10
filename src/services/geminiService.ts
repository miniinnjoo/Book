import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async getBookRecommendations(userInterests: string, currentListings: any[]) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Based on the user's interests: "${userInterests}" and the current available book listings: ${JSON.stringify(currentListings)}, recommend the top 3 books. Return the IDs of the recommended books in a JSON array.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          responseMimeType: "application/json",
        },
      });

      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Gemini Error:", error);
      return [];
    }
  },

  async analyzeBookCondition(imageDescription: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze the condition of a book based on this description: "${imageDescription}". Categorize it as "new", "like-new", "good", or "acceptable" and provide a brief justification. Return as JSON.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          responseMimeType: "application/json",
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }
};
