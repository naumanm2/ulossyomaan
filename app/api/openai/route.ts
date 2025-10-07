import { NextRequest, NextResponse } from "next/server";
import { system_prompt } from "../../../lib/knowledge";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = system_prompt();

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-5-nano",
      max_output_tokens: 5000,
      instructions: `${SYSTEM_PROMPT}`,
      input: message,
      reasoning: { effort: "low" },

      tool_choice: "required",
      tools: [
        {
          type: "file_search",
          vector_store_ids: ["vs_68dfabf5258c81918d4770afd9dfddff"], // reference your vector store(s)
        },
      ],
    });

    console.log(response.output_text);

    const data =
      response.output_text || "I'm sorry, I don't have an answer for that.";
    return NextResponse.json({ message: data }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
