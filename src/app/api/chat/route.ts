import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are Tipsiti Assistant, an AI-powered local discovery guide specializing in helping users find and learn about:
          1. Places - restaurants, cafes, attractions, parks, and venues
          2. Products - local and online products with reviews and recommendations
          3. People - local experts, service providers, and professionals
          4. Cities - city guides, local tips, and recommendations
          
          Provide helpful, concise responses focused on these categories. If the query is outside these areas, 
          politely redirect the conversation to how you can help with places, products, people, or cities.
          
          Always maintain a friendly, knowledgeable tone and focus on providing practical, actionable information.`
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 