// /utils/chatUtils.ts

import { ChatScope } from '@/types/chat';


export function generateChatName(userInput: string): string {
  // Implement chat name generation logic here
  // This could involve NLP techniques, keyword extraction, etc.
  // For now, let's use a simple example:
  const keywords = extractKeywords(userInput);
  return keywords.length > 0 ? `Chat about ${keywords[0]}` : 'New Chat';
}

function extractKeywords(input: string): string[] {
  // Implement keyword extraction logic
  // This is a placeholder implementation
  const words = input.toLowerCase().split(/\W+/);
  const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'is', 'are']);
  return words.filter(word => word.length > 3 && !stopWords.has(word)).slice(0, 3);
}

export function requestSpeechPermissions(
    onChatScopeChange: (newScope: Partial<ChatScope>) => void,
    chatScope: ChatScope
  ) {
    // This is a placeholder implementation
    // In a real application, you would use the Web Speech API to request permissions
    const wantsSpeechFeatures = confirm("Do you want to enable speech features?");
    
    if (wantsSpeechFeatures) {
      // In a real implementation, you would check if the permissions are actually granted
      onChatScopeChange({
        settings: {
          chatName: chatScope.settings?.chatName || '',
          botName: chatScope.settings?.botName || '',
          textToSpeech: true,
          speechToText: true,
          llmId: chatScope.settings?.llmId || '',
        }
      });
      alert("Speech features enabled. You can adjust these in the Chat Scope settings.");
    } else {
      alert("Speech features will remain disabled. You can enable them later in the Chat Scope settings.");
    }
  }