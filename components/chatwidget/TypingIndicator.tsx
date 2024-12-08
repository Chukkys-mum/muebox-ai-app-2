// components/chatwidget/TypingIndicator.tsx
export const TypingIndicator = () => (
    <div className="flex space-x-2 p-3 bg-secondary rounded-lg mr-auto">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
    </div>
  );