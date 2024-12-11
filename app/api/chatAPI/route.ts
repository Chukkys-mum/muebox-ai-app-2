// /app/api/chatAPI/route.ts

import OpenAI from 'openai';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return new Response('Conversation ID is required', { status: 400 });
  }

  try {
    const messages = await kv.get(`conversation:${conversationId}`);
    return new Response(JSON.stringify(messages), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return new Response('Error fetching conversation', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { messages, model, chatScope, personality, conversationId } = await req.json();

    const systemMessage = `You are an AI assistant with a ${personality} personality, focusing on ${chatScope} topics. Please respond accordingly.`;

    const response = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages
      ],
      stream: true,
    });

    // Create a custom stream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    // Store the conversation
    if (conversationId) {
      await kv.set(`conversation:${conversationId}`, messages);
    }

    // Return the stream
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error in POST method:', error);
    return new Response('Error', { status: 500 });
  }
}