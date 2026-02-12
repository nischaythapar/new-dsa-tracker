import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Fixed: Removed "HQ" typo
import { db } from "../../../db";
import { searches } from "../../../db/schema";
import { eq } from "drizzle-orm";

// Initialize Gemini outside the handler to avoid recreating it on every request
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    if (!userInput || !userInput.trim()) {
      return NextResponse.json(
        { result: "Please enter a problem name or link." },
        { status: 200 }
      );
    }

    // Normalized key (lowercase) so "Two Sum" matches "two sum"
    const normalizedKey = userInput.trim().toLowerCase();

    // 1️⃣ CHECK DATABASE (The "Persistent" Cache)
    const existing = await db
      .select()
      .from(searches)
      .where(eq(searches.query, normalizedKey))
      .limit(1);

    if (existing.length > 0) {
      console.log("⚡ HIT: Serving from Database");
      return NextResponse.json({
        result: existing[0].response,
        source: "database",
      });
    }

    console.log("🤖 MISS: Calling Gemini...");

    // 2️⃣ CALL GEMINI (If not in DB)
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

    const prompt = `
You are an expert DSA tutor.
Explain the problem "${userInput}" clearly using this format:

1. Problem Summary
2. Key Insight
3. Optimal Approach
4. Time Complexity
5. Space Complexity
6. Common Mistakes
7. Example Walkthrough
`;

    const aiResult = await model.generateContent(prompt);
    const responseText = aiResult.response.text();

    // 3️⃣ SAVE TO DATABASE (So next time it's instant)
    await db.insert(searches).values({
      query: normalizedKey,
      response: responseText,
    });

    return NextResponse.json({
      result: responseText,
      source: "gemini",
    });

  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      { result: "Failed to generate explanation. Please try again." },
      { status: 500 }
    );
  }
}