import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, domain } = await req.json();

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ 
        feedback: "AI service not configured. Unable to generate specific feedback.",
        score: "N/A",
        tips: ["Ensure you answer all questions confidently.", "Review the technical requirements for the role."]
      });
    }

    // Filter out the initial greeting and system messages if any, keep user and assistant Q&A
    // Format: "Interviewer: Question? \n Candidate: Answer"
    const transcript = messages.map((m: any) => 
      `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`
    ).join('\n\n');

    const prompt = `
      You are an expert technical interviewer for the ${domain} role. 
      Analyze the transcript below. 
      
      Transcript:
      ${transcript}

      Your task is to JUDGE the candidate's answers and identify areas for improvement.
      
      Rules:
      1. DO NOT provide the "correct" answer or "better" answer.
      2. For weak answers, strictly explain WHAT was missing, wrong, or unclear.
      3. Be extremely concise (bullet points).

      Return strictly valid JSON with these fields:
      1. "score": Number (1-10).
      2. "feedback": 1 sentence summary of performance.
      3. "question_feedback": Array of objects for ONLY the questions that need improvement.
         Format: { "question": "The question asked", "improvement_needed": "What specifically to improve (e.g., 'Missed the concept of X', 'Explanation too vague', 'Should mention Y')" }
         Max 3 items.

      JSON only. No markdown.
    `;

    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: "You are a strict technical interviewer. Output strictly valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          top_p: 0.9,
          max_tokens: 1024
        }),
      }
    );

    if (!res.ok) {
        throw new Error("AI API error");
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    
    // Clean up markdown if present (```json ... ```)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Feedback generation error:", error);
    return NextResponse.json({ 
      feedback: "Unable to generate detailed feedback at this time.",
      score: "N/A",
      tips: ["Practice the STAR method.", "Review core concepts for your domain."]
    });
  }
}
