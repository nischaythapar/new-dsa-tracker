import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const models = await genAI.listModels();
console.log(models);

export async function explainProblem(input: string) {
  const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

  const prompt = `You are an expert DSA tutor. Explain the following problem in 7 clear interview-focused points.\nProblem: ${input}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}