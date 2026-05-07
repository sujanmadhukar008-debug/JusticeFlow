import { GoogleGenAI, Type } from "@google/genai";
import { DEPARTMENTS } from "../constants";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    // Try to get from localStorage (client-side) if available
    let apiKey = '';
    if (typeof window !== 'undefined') {
      apiKey = localStorage.getItem('justiceflow_gemini_api_key') || '';
    }
    
    // Fallback to process.env (server-side or build-time)
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || '';
    }

    if (!apiKey) {
      throw new Error("Gemini API Key is not configured. Please set it in Settings or environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export function resetAIInstance() {
  aiInstance = null;
}

const TASK_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "Actionable command directed by the court" },
      department: { type: Type.STRING, description: "Responsible government body" },
      deadline: { type: Type.STRING, description: "Specified timeline for compliance" },
      deliverable: { type: Type.STRING, description: "Expected output (report, order, etc.)" },
      confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Confidence in directive detection" },
      reasoning: { type: Type.STRING, description: "Why this was flagged as a directive" },
      source_text: { type: Type.STRING, description: "Segment of original text" },
      page: { type: Type.NUMBER, description: "Page number where found" },
      urgency: { type: Type.STRING, enum: ["Critical", "Regular", "Low"] },
      impact: { type: Type.STRING, description: "Legal or operational impact" }
    },
    required: ["action", "department", "deadline", "deliverable", "confidence", "reasoning", "source_text", "urgency", "impact"]
  }
};

const METADATA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    case_number: { type: Type.STRING },
    date_of_order: { type: Type.STRING },
    court_name: { type: Type.STRING }
  },
  required: ["title", "case_number", "date_of_order", "court_name"]
};

export async function processJudgmentAI(text: string) {
  // Pre-filter text to directive-heavy sections to stay within context and focus
  // Actually Gemini 1.5 Flash handles large context well, but we can give it context.
  
  const systemInstruction = `You are a Legal Analyst for a Government Decision Support System. 
  Your goal is to extract mandatory legal directives and convert them into actionable compliance tasks.
  Focus on words like 'shall', 'must', 'directed', 'compliance', 'submit'.
  Be conservative: only flag actual orders, not summaries of arguments.
  
  You MUST assign each task to one of these valid departments: ${DEPARTMENTS.join(', ')}.
  
  Format the output as JSON.`;

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { text: `Process this court judgment text:\n\n${text.substring(0, 30000)}` }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: METADATA_SCHEMA,
          tasks: TASK_SCHEMA
        },
        required: ["metadata", "tasks"]
      }
    }
  });

  try {
    const rawText = response.text || "{}";
    // Sanitize markdown code blocks if present
    const sanitized = rawText.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    return JSON.parse(sanitized);
  } catch (e) {
    console.error("AI JSON Parse Error:", e);
    throw new Error("Failed to parse AI response");
  }
}
