import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mockExplain } from "../../../lib/mockExplain";
import {
  getCachedExplain,
  setCachedExplain,
} from "../../../lib/explainCache";

export async function POST(req: Request) {
  const { userInput } = await req.json();

  if (!userInput || !userInput.trim()) {
    return NextResponse.json(
      { result: "Please enter a problem name or link." },
      { status: 200 }
    );
  }

  // 1️⃣ Cache check
  const cached = getCachedExplain(userInput);
if (cached) {
  console.log("CACHE HIT");
  return NextResponse.json({
    result: cached.response,
    cachedAt: cached.timestamp,
    source: "cache",
  });
}

  try {
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    );

    // ✅ Free-tier friendly & confirmed working
    const model = genAI.getGenerativeModel({
      model: "gemma-3-27b-it",
    });

    const prompt = `
You are an expert DSA tutor.
Explain the problem using this format:

1. Problem Summary
2. Key Insight
3. Optimal Approach
4. Time Complexity
5. Space Complexity
6. Common Mistakes
7. Example Walkthrough

Problem:
${userInput}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 2️⃣ Save to cache
    setCachedExplain(userInput, text);

    return NextResponse.json({
      result: text,
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Gemini failed, using mock:", error?.message);

    const fallback = mockExplain(userInput);

    // Cache mock too (important!)
    setCachedExplain(userInput, fallback);

    return NextResponse.json({
      result: fallback,
      source: "mock",
      note: "Mock response (Gemini quota exceeded)",
    });
  }
}