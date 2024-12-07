// /app/api/chatAPI/route.ts

import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

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
    const { messages, model, chatScope, personality, conversationId, isBot } = await req.json();

    if (isBot) {
      const systemMessage = `You are an AI assistant with a ${personality} personality, focusing on ${chatScope} topics. Please respond accordingly.`;

      const response = await openai.createChatCompletion({
        model: model || 'gpt-3.5-turbo',
        stream: true,
        messages: [
          { role: 'system', content: systemMessage },
          ...messages
        ]
      });

      const stream = OpenAIStream(response);

      // Store the conversation
      if (conversationId) {
        await kv.set(`conversation:${conversationId}`, messages);
      }

      return new StreamingTextResponse(stream);
    } else {
      // Handle user-to-user communication
      if (!conversationId) {
        return new Response('Conversation ID is required for user messages', { status: 400 });
      }

      // Append the new message to the conversation
      await kv.lpush(`conversation:${conversationId}`, JSON.stringify(messages[messages.length - 1]));

      return new Response('Message sent', { status: 200 });
    }
  } catch (error) {
    console.error('Error in POST method:', error);
    return new Response('Error', { status: 500 });
  }
}