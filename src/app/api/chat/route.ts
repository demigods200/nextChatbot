import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

interface ChatContext {
  userInfo: {
    [key: string]: string;
  };
  conversationHistory: Message[];
}

// Function to extract user information from AI response
const extractUserInfo = (message: string): Record<string, string> => {
  const nameMatch = message.match(/my name is (\w+)/i);
  const extractedInfo: Record<string, string> = {};
  
  if (nameMatch) {
    extractedInfo.name = nameMatch[1];
  }
  
  return extractedInfo;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context } = body as { message: string; context: ChatContext };

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare conversation history for the AI
    const conversationHistory: Message[] = [
      {
        role: "system",
        content: `You are Tipsiti Assistant, an AI-powered local discovery guide specializing in helping users find and learn about:
        1. Places - restaurants, cafes, attractions, parks, and venues
        2. Products - local and online products with reviews and recommendations
        3. People - local experts, service providers, and professionals
        4. Cities - city guides, local tips, and recommendations
        
        Important: You should remember and use information about the user that they share. When they tell you personal information (like their name),
        acknowledge it and use it in future responses. If they ask about information they've shared before, recall it from the conversation history.
        
        Current user information:
        ${Object.entries(context?.userInfo || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}
        
        Provide helpful, concise responses focused on these categories. If the query is outside these areas, 
        politely redirect the conversation to how you can help with places, products, people, or cities.
        
        Always maintain a friendly, knowledgeable tone and focus on providing practical, actionable information.`
      }
    ];

    // Add relevant conversation history (last 5 messages)
    if (context?.conversationHistory) {
      const recentMessages = context.conversationHistory.slice(-5);
      conversationHistory.push(...recentMessages);
    }

    // Add the current message
    conversationHistory.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // Extract any new user information from the current message
    const newUserInfo = extractUserInfo(message);

    return NextResponse.json({ 
      message: reply,
      updatedContext: Object.keys(newUserInfo).length > 0 ? newUserInfo : undefined
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 