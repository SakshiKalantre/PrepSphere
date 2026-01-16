import { NextResponse } from "next/server";
import { getChatReply } from "@/lib/chatbotKnowledge";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const kb = getChatReply(String(message || ""));
    if (kb) {
      return NextResponse.json({ reply: kb });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ reply: "I'm configured to answer site questions and guide you. Ask me about sign-in, sign-up, dashboards, jobs, or events." });
    }
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
              content: "You are a helpful AI assistant for PrepSphere, a college placement management system. Be concise, friendly, and professional."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          top_p: 0.95,
          max_tokens: 1024
        }),
      }
    );
    if (!res.ok) {
      const fallback = getChatReply(String(message || "")) || "Sorry, I couldn't reach the AI service. I can still help with registrations, logins, dashboards, jobs, and events."
      return NextResponse.json({ reply: fallback });
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "No response.";
    return NextResponse.json({ reply });
  } catch {
    const fallback = "I encountered an error. Here’s what I can help with: Sign Up/Sign In (Student social login; TPO/Admin manual), role-based dashboards, jobs and events. Ask me a question like 'How do I sign up as a student?'"
    return NextResponse.json({ reply: fallback });
  }
}
