import { generateText, Output } from "ai";
import { z } from "zod";

const feedbackSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall speaking score from 0-100"),
  fluency: z.object({
    score: z.number().min(0).max(100).describe("Fluency score from 0-100"),
    feedback: z.string().describe("Brief feedback about fluency"),
  }),
  grammar: z.object({
    score: z.number().min(0).max(100).describe("Grammar score from 0-100"),
    corrections: z.array(
      z.object({
        original: z.string().describe("The original phrase with the error"),
        suggestion: z.string().describe("The corrected phrase"),
        explanation: z.string().describe("Brief explanation of the correction"),
      })
    ).describe("List of grammar corrections, max 3"),
  }),
  vocabulary: z.object({
    level: z.string().describe("Vocabulary level: basic, intermediate, or advanced"),
    suggestions: z.array(z.string()).describe("Alternative words or phrases to enhance vocabulary, max 5"),
  }),
  pronunciation: z.object({
    tips: z.array(z.string()).describe("Pronunciation tips based on common issues, max 3"),
  }),
  encouragement: z.string().describe("A brief encouraging message for the learner"),
});

export async function POST(req: Request) {
  try {
    const { transcript, prompt } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return Response.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      output: Output.object({
        schema: feedbackSchema,
      }),
      messages: [
        {
          role: "system",
          content: `You are an expert English language teacher providing constructive feedback on spoken English. 
Analyze the transcribed speech and provide detailed, encouraging feedback.
Be specific with corrections but always maintain a positive, supportive tone.
Focus on the most important areas for improvement.
Keep vocabulary suggestions relevant to the topic being discussed.
Limit grammar corrections to the 3 most important ones.
Limit vocabulary suggestions to 5 words/phrases.
Limit pronunciation tips to 3 practical tips.`,
        },
        {
          role: "user",
          content: `The speaker was asked to: "${prompt}"

Their response (transcribed): "${transcript}"

Please analyze this speech and provide structured feedback on fluency, grammar, vocabulary, and pronunciation.`,
        },
      ],
    });

    return Response.json({ feedback: output });
  } catch (error) {
    console.error("[v0] Speech analysis error:", error);
    return Response.json(
      { error: "Failed to analyze speech" },
      { status: 500 }
    );
  }
}
