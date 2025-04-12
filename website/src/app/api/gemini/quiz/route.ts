import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { skill, level } = await req.json();

        if (!process.env?.GEMINI_KEY) {
            throw new Error("GEMINI_KEY is not defined in the environment variables.");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a quiz question about ${skill} at ${level} level. 
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
        Only return the raw JSON without any Markdown formatting or additional text.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // More robust JSON extraction
        let jsonString = responseText.trim();
        
        // Remove Markdown code blocks if present
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.slice(7); // Remove ```json
        }
        if (jsonString.endsWith('```')) {
            jsonString = jsonString.slice(0, -3); // Remove ```
        }
        
        // Parse the JSON
        const quizData = JSON.parse(jsonString);

        return NextResponse.json(quizData);
        
    } catch (error) {
        console.error("Error in quiz generation:", error);
        return NextResponse.json(
            { error: "Failed to generate quiz", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}