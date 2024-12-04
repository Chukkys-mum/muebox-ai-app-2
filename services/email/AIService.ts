// /services/ai/AIService.ts

import { createClient } from '@/utils/supabase/server';
import type { 
  Email, 
  EmailData, 
  EmailSender, 
  EmailRecipient
} from '@/types/email';
import { Json } from '@/types/types_db';
import OpenAI from 'openai';

// First, make AIEmailMetadata compatible with Json type
interface AIEmailMetadata {
    [key: string]: Json | undefined;
    sentiment: 'positive' | 'negative' | 'neutral';
    priority: 'high' | 'medium' | 'low';
    category: string;
    key_topics: string[];
    suggested_tags: string[];
    action_items: string[];
    requires_response: boolean;
    suggested_response_tone: string;
    analyzed_at: string;
  }
  
  type JsonEmailMetadata = {
    [key: string]: Json | undefined;
    analysis: {
      [key: string]: Json | undefined;
      sentiment: 'positive' | 'negative' | 'neutral';
      priority: 'high' | 'medium' | 'low';
      category: string;
      key_topics: string[];
      suggested_tags: string[];
      action_items: string[];
      requires_response: boolean;
      suggested_response_tone: string;
      analyzed_at: string;
    };
    category: string;
    tags: string[];
    priority: 'high' | 'medium' | 'low';
    requires_response: boolean;
  }

export class AIService {
  private openai: OpenAI;
  private supabase;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
    this.supabase = createClient();
  }

  async processEmailForTraining(emailData: EmailData, userId: string): Promise<void> {
    try {
      const email = this.transformEmailData(emailData);
      const content = this.prepareEmailContent(email);
      const analysis = await this.analyzeEmail(content);
      await this.updateEmailWithAnalysis(emailData.id, analysis);
    } catch (error) {
      console.error('Error processing email for training:', error);
      throw error;
    }
  }

  private transformEmailData(emailData: EmailData): Email {
    const parsedSender = typeof emailData.sender === 'string' && emailData.sender
      ? JSON.parse(emailData.sender) as EmailSender
      : null;
  
    const parsedRecipients = typeof emailData.recipient === 'string' && emailData.recipient
      ? JSON.parse(emailData.recipient) as EmailRecipient[]
      : [];
  
    return {
      id: emailData.id,
      user_id: emailData.user_id,
      email_account_id: emailData.email_account_id,
      subject: emailData.subject || '',
      sender: {
        name: parsedSender?.name || 'Unknown',
        email: parsedSender?.email || '',
        avatar: parsedSender?.avatar || null
      },
      recipients: parsedRecipients,
      body: emailData.email_body || '',
      status: emailData.status,
      attachments: [],
      read_at: null,
      starred: false,
      labels: [],
      created_at: emailData.created_at,
      updated_at: emailData.updated_at
    };
  }

  private prepareEmailContent(email: Email): string {
    return `
Subject: ${email.subject}
From: ${email.sender.name} <${email.sender.email}>
Content: ${email.body}
    `.trim();
  }

  async analyzeEmail(content: string): Promise<AIEmailMetadata> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Analyze the following email and provide:
            1. Sentiment (positive, negative, neutral)
            2. Priority (high, medium, low)
            3. Category (personal, work, promotional, etc.)
            4. Key topics (comma-separated)
            5. Suggested tags
            6. Action items (if any)
            7. Required response (yes/no)
            8. Suggested response tone (formal, casual, etc.)
            
            Format the response as JSON.`
        },
        {
          role: 'user',
          content
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
  return {
    ...result,
    analyzed_at: new Date().toISOString()
  };
}

private async updateEmailWithAnalysis(emailId: string, analysis: AIEmailMetadata) {
    const metadata: JsonEmailMetadata = {
      analysis,
      category: analysis.category,
      tags: analysis.suggested_tags,
      priority: analysis.priority,
      requires_response: analysis.requires_response
    };
  
    await this.supabase
      .from('emails')
      .update({
        status: 'analyzed',
        metadata
      })
      .eq('id', emailId);
  }

  async generateSmartReply(email: Email): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Generate a professional and contextually appropriate reply.'
        },
        {
          role: 'user',
          content: `
Original Email:
Subject: ${email.subject}
From: ${email.sender.name}
Content: ${email.body}

Generate a reply that is:
1. Professional and courteous
2. Addresses all points
3. Clear and concise
4. Maintains appropriate tone
          `
        }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content || '';
  }

  async summarizeThread(threadId: string): Promise<string> {
    const { data: emailsData } = await this.supabase
      .from('emails')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (!emailsData?.length) return '';

    const emails = emailsData.map(this.transformEmailData);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Summarize the following email thread concisely.'
        },
        {
          role: 'user',
          content: emails.map(email => `
From: ${email.sender.name}
Time: ${new Date(email.created_at).toLocaleString()}
Content: ${email.body}
---
          `).join('\n')
        }
      ],
      temperature: 0.3
    });
    
    return completion.choices[0].message.content || '';
  }
}

export const aiService = new AIService();