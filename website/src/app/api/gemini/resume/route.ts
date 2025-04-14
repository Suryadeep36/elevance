import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: 'edge',
};

export async function POST(req: NextRequest) {
  try {
    // Check for API key
    if (!process.env?.GEMEINI_KEY) {
      throw new Error("GEMEINI_KEY is not defined in the environment variables.");
    }

    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      throw new Error("No resume file uploaded.");
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMEINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to format Gemini can use
    const fileData = await file.arrayBuffer();
    const mimeType = file.type;

    // Create a file part for Gemini
    const filePart = {
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType: mimeType
      }
    };

    // Create the combined prompt for resume analysis and interview tips
    const prompt = `You are an expert resume analyzer and career coach. Please analyze the provided resume thoroughly and provide detailed feedback in the following comprehensive JSON format:

{
  "analysis": {
    "ats_score": [0-100],
    "score_breakdown": {
      "keyword_optimization": [0-20],
      "formatting": [0-20],
      "readability": [0-20],
      "relevance": [0-20],
      "completeness": [0-10],
      "customization": [0-10]
    },
    "summary": "Brief overall assessment of the resume quality",
    "strengths": {
      "content": ["List specific strong points about content"],
      "structure": ["List structural strengths"]
    },
    "improvement_areas": {
      "critical": ["List must-fix issues"],
      "recommended": ["List suggested improvements"]
    },
    "keyword_analysis": {
      "missing_keywords": ["List important missing keywords"],
      "overused_terms": ["List overused or vague terms"]
    },
    "section_analysis": {
      "contact_info": "Assessment of contact information section",
      "summary": "Assessment of professional summary",
      "experience": "Assessment of work experience section",
      "education": "Assessment of education section",
      "skills": "Assessment of skills section"
    },
    "actionable_recommendations": {
      "immediate_actions": ["List 3-5 critical fixes"],
      "enhancements": ["List 3-5 value-added improvements"]
    },
    "ats_specific_advice": [
      "List specific tips for better ATS performance"
    ],
    "VideoRecommendation": [
      {
        "title": "How to Write a Resume That Gets Noticed",
        "url": "https://www.youtube.com/watch?v=XYZ123",
        "thumbnail": "https://i.ytimg.com/vi/XYZ123/mqdefault.jpg",
        "channel": "Career Success Channel",
        "duration": "12:45"
      }
    ]
  },
  "interviewTips": {
    "generalTips": [
      "Research the company thoroughly before the interview",
      "Prepare specific examples that demonstrate your key skills",
      "Use the STAR method (Situation, Task, Action, Result) to structure your answers"
    ],
    "behavioralQuestions": [
      {
        "question": "Tell me about a time when you had to meet a tight deadline",
        "category": "Time Management",
        "difficulty": "Medium",
        "tips": [
          "Focus on your planning and prioritization methods",
          "Mention specific tools or techniques you used",
          "Emphasize the successful outcome and what you learned"
        ]
      }
    ],
    "technicalQuestions": [
      {
        "question": "Explain your experience with [KEY_SKILL_FROM_RESUME]",
        "category": "Technical Skills",
        "difficulty": "Medium",
        "tips": [
          "Give specific project examples where you used this skill",
          "Mention any measurable improvements or outcomes",
          "Discuss how you stay updated in this area"
        ]
      }
    ],
    "questionsToAsk": [
      "What does success look like in this role in the first 90 days?",
      "How is performance measured and reviewed?",
      "What are the biggest challenges facing the team/department right now?"
    ],
    "selfPresentation": {
      "appearance": [
        "Dress one level above the company's standard dress code",
        "Ensure clothes are clean, pressed and professional"
      ],
      "communication": [
        "Speak clearly and at a moderate pace",
        "Use industry terminology appropriately but avoid jargon"
      ],
      "body_language": [
        "Maintain good posture throughout the interview",
        "Offer a firm handshake at the beginning and end"
      ]
    },
    "preparationChecklist": [
      "Research the company's products, services, and recent news",
      "Review the job description and match your experiences to requirements",
      "Prepare 5-7 stories about your achievements that demonstrate relevant skills"
    ]
  }
}

Analysis Guidelines:
1. Be specific and constructive in all feedback
2. Focus on measurable improvements
3. Provide industry-relevant keyword suggestions
4. Highlight both strengths and areas for improvement
5. Consider modern resume best practices
6. Evaluate ATS compatibility factors

Interview Tips Guidelines:
1. Generate personalized questions based on the resume content
2. Include both behavioral and technical questions
3. Provide practical tips for each question
4. Suggest questions the candidate should ask the interviewer
5. Include presentation and communication advice
6. Create a comprehensive preparation checklist

Important Notes:
- Return ONLY valid JSON without any additional text
- Do not include markdown formatting
- Ensure all scores add up to the total ats_score
- Make all suggestions practical and actionable
- Personalize interview questions based on the resume content
- Include 3-5 items for each list category`;

    // Send both the text prompt and file to Gemini
    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();

    // Process the response to extract JSON
    let jsonString = responseText.trim();

    // Remove Markdown code blocks if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7); // Remove ```json
    }
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.slice(0, -3); // Remove ```
    }

    // Parse the JSON
    const responseData = JSON.parse(jsonString);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error in resume analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze resume",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}