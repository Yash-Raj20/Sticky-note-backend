import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const getFriendlyErrorMessage = (error: any): string => {
  const msg = error?.message || '';
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'AI Quota Exceeded. Please wait a moment and try again.';
  }
  if (msg.includes('503') || msg.includes('overloaded')) {
    return 'AI is currently overloaded. Please try again later.';
  }
  return 'AI request failed. Please try again.';
};

export const brainstorm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic } = req.body;
    if (!topic) {
      res.status(400).json({ success: false, message: 'Topic is required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Brainstorm 5 to 6 unique, creative, and actionable sticky notes about the topic: "${topic}". 
Return a JSON array of objects. Each object must have a 'title' (short string), 'content' (1-2 sentences), and 'color' (one of: 'yellow', 'blue', 'green', 'pink', 'purple', 'orange').`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              color: { type: Type.STRING, enum: ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'] }
            },
            required: ['title', 'content', 'color']
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('No response from AI');

    const notes = JSON.parse(text);

    res.status(200).json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

export const categorize = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes } = req.body; // array of { id, title, content }
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      res.status(400).json({ success: false, message: 'Notes array is required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Group the following notes into 2 to 4 logical categories based on their semantic meaning or topic.
Return a JSON array where each object has a 'categoryName' (a short title for the frame) and 'noteIds' (an array of note IDs that belong to this category). Every note ID must be assigned to exactly one category.

Notes:
${JSON.stringify(notes)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              categoryName: { type: Type.STRING },
              noteIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['categoryName', 'noteIds']
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('No response from AI');

    const categories = JSON.parse(text);

    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

export const summarize = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes } = req.body; // array of { title, content }
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      res.status(400).json({ success: false, message: 'Notes array is required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Summarize the following sticky notes. Provide a well-structured markdown summary with key takeaways and main themes. Keep it concise but comprehensive.

Notes:
${JSON.stringify(notes)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.status(200).json({ success: true, data: { summary: response.text } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

export const editNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, text } = req.body;
    if (!text) {
      res.status(400).json({ success: false, message: 'Text is required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let prompt = '';

    if (action === 'summarize') {
      prompt = `Provide a very short (1-2 sentences) for the following text:\n\n${text}`;
    } else if (action === 'grammar') {
      prompt = `Fix all grammar and spelling errors in the following text. Keep the exact same tone and formatting, just output the corrected text:\n\n${text}`;
    } else if (action === 'expand') {
      prompt = `Expand the following text with more details, depth, and clarity. Keep it well-structured and easy to read:\n\n${text}`;
    } else if (action === 'extract-tasks') {
      prompt = `Extract all actionable tasks or implied to-dos from the following text. 
Return ONLY a valid HTML string matching exactly this TipTap TaskList format, with no markdown wrapping and no other text:
<ul data-type="taskList">
  <li data-type="taskItem"><label><input type="checkbox"></label><div><p>Task 1</p></div></li>
  <li data-type="taskItem"><label><input type="checkbox"></label><div><p>Task 2</p></div></li>
</ul>

Text to extract tasks from:
${text}`;
    } else {
      res.status(400).json({ success: false, message: 'Invalid action' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.status(200).json({ success: true, data: { result: response.text } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

export const autoColor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes)) {
      res.status(400).json({ success: false, message: 'Notes array is required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze the following sticky notes. For each note, determine its priority/category and assign a color:
- 'pink' for Urgent/Important tasks or things with deadlines.
- 'blue' for Information, Ideas, or generic thoughts.
- 'green' for Completed tasks or things that are good to go/positive.
- 'yellow' for to-dos or anything else.

IMPORTANT: You MUST use the exact 'id' from the provided Notes. Do NOT modify, truncate, or invent IDs.

Return ONLY a valid JSON array of objects with 'id' and 'color' properties. Example:
[{"id": "6a11cf6ceea32225eda67a0e", "color": "red"}]

Notes:
${JSON.stringify(notes)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = (response.text || '').replace(/```json|```/g, '').trim();
    const colorUpdates = JSON.parse(resultText);

    res.status(200).json({ success: true, data: colorUpdates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};
export const autoConnect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes)) {
      res.status(400).json({ success: false, message: 'Notes array is required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze the following sticky notes. I want to build a mind map. Find notes that are logically connected, share similar concepts, or represent a sequence (e.g., 'Frontend' connects to 'Backend', 'Bug 1' connects to 'Fix 1'). 
IMPORTANT: You MUST use the exact 'id' from the provided Notes for sourceId and targetId. Do NOT modify, truncate, or invent IDs.

Return ONLY a valid JSON array of objects with 'sourceId' and 'targetId'. Example:
[{"sourceId": "6a11cf6ceea32225eda67a0e", "targetId": "6a11cf6ceea32225eda67a0f"}]

Only connect notes if there is a strong logical relationship.

Notes:
${JSON.stringify(notes)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = (response.text || '').replace(/```json|```/g, '').trim();
    const connections = JSON.parse(resultText);

    res.status(200).json({ success: true, data: connections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};

export const generateActionPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      res.status(400).json({ success: false, message: 'No notes provided' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Act as an expert Project Manager.
Analyze the following sticky notes from a brainstorming session:
${JSON.stringify(notes, null, 2)}

Extract all actionable items, tasks, and decisions. Group them logically.
Format the output as a clean, structured HTML list using <ul>, <li>, and <strong> tags.
Keep it concise and actionable. DO NOT wrap the output in markdown blocks. Return only HTML.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let actionPlan = (response.text || '').replace(/```html|```/g, '').trim();

    res.status(200).json({ success: true, data: { actionPlan } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: getFriendlyErrorMessage(error) });
  }
};
