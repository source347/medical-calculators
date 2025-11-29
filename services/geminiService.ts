import { GoogleGenAI } from "@google/genai";
import { Calculator, CalculationResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize safely
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getClinicalInterpretation = async (
  calculator: Calculator,
  inputs: Record<string, any>,
  result: CalculationResult
): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Please check your environment settings.";
  }

  const inputSummary = Object.entries(inputs)
    .map(([key, value]) => {
      // Find the label for better context
      const inputDef = calculator.inputs.find(i => i.id === key);
      let displayValue = value;
      // If it's a select option, try to find the label
      if (inputDef?.type === 'select' && inputDef.options) {
        const option = inputDef.options.find(o => o.value === value);
        if (option) displayValue = option.label;
      }
      return `${inputDef?.label || key}: ${displayValue} ${inputDef?.unit || ''}`;
    })
    .join(', ');

  const prompt = `
    You are a senior medical consultant assistant. 
    Review the following medical calculation result.
    
    Calculator: ${calculator.name} (${calculator.description})
    Inputs Provided: ${inputSummary}
    Calculated Result: ${result.value} ${result.unit || ''}
    Interpretation: ${result.interpretation || 'N/A'}

    Task: Provide a concise, professional clinical interpretation of this result. 
    1. Explain what this score implies for the patient.
    2. Suggest general next steps or clinical considerations based on standard guidelines.
    3. Keep it brief (under 150 words).
    
    IMPORTANT: Start with a clear disclaimer that this is educational AI content and not a substitute for professional medical advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No interpretation generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI interpretation at this time. Please check your connection.";
  }
};