import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { skill, level, prevQuestion, studentAnswer } = await req.json();

        if (!process.env?.GEMINI_KEY) {
            throw new Error("GEMINI_KEY is not defined in the environment variables.");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";

        if (!prevQuestion || !studentAnswer) {
            // First question
            prompt = `
You are an expert tutor. Start an adaptive quiz to test a student's skill in "${skill}" at "${level}" level.

Generate the first question with:
- A clear question statement
- 4 options (A, B, C, D)
- Correct answer
- Explanation
- Difficulty level (easy, medium, hard)

Respond in this strict JSON format:
{
  "quiz": {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct answer",
    "explanation": "Detailed explanation",
    "difficulty": "easy"
  }
}
Only return the raw JSON without any Markdown formatting or extra commentary.
            `;
        } else {
            // Follow-up question based on previous response
            prompt = `
You are an adaptive quiz engine assessing a student’s skill in "${skill}" at "${level}" level.

Here is the previous question:
${JSON.stringify(prevQuestion)}

The student's answer was: "${studentAnswer}"

Evaluate their answer and generate the next question accordingly:
- If correct, increase difficulty.
- If incorrect, simplify or reinforce the concept.
- Maintain JSON format.

Respond in this exact format:
{
  "quiz": {
    "question": "Next question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct answer",
    "explanation": "Explanation for correct answer",
    "difficulty": "easy" | "medium" | "hard"
  }
}
Only return the JSON object with no extra formatting or explanation.
            `;
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Remove Markdown formatting if needed
        let jsonString = responseText;
        if (jsonString.startsWith("```json")) {
            jsonString = jsonString.slice(7);
        }
        if (jsonString.endsWith("```")) {
            jsonString = jsonString.slice(0, -3);
        }

        const quizData = JSON.parse(jsonString);

        return NextResponse.json(quizData);

    } catch (error) {
        console.error("Error in quiz generation:", error);
        return NextResponse.json(
            {
                error: "Failed to generate quiz",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
