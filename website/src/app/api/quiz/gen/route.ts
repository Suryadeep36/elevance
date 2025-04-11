import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { skill, level } = await req.json();
  const chatCompletion = await getGroqChatCompletion(skill, level);
  const ans = chatCompletion.choices[0]?.message?.content || "";
  let jsonString = ans.trim();

  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.slice(7);
  }
  if (jsonString.endsWith('```')) {
    jsonString = jsonString.slice(0, -3);
  }

  const quizData = JSON.parse(jsonString);
  return NextResponse.json(quizData);
}

export async function getGroqChatCompletion(skill: string, level: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Generate a quiz question about ${skill} at ${level} level. 
        Provide the question, 4 options, the correct answer, and an explanation.
        Return the response in valid JSON format like this example:
        {
          "quiz": {
            "question": "Question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": "Correct answer",
            "explanation": "Detailed explanation"
          }
        }
        Only return the raw JSON without any Markdown formatting or additional text.`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
