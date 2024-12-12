// /components/dashboard/ai-chat/ChatInput.tsx

// /components/dashboard/ai-chat/ChatInput.tsx

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import {
  HiMicrophone,
  HiPaperAirplane,
  HiPaperClip,
  HiFaceSmile,
  HiCodeBracket,
  HiMiniPencilSquare,
} from "react-icons/hi2";

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ChatInput = () => {
  const [input, setInput] = useState(""); // Manage input state
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setIsLoading(true);

    // Simulate sending the message
    setTimeout(() => {
      console.log("Message sent:", input);
      setInput(""); // Clear input after sending
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="relative w-full p-2 border-t bg-white dark:bg-zinc-800">
      <div className="max-w-2xl mx-auto flex flex-col space-y-2">
        {/* Rich Text Editor */}
        <ReactQuill
          value={input}
          onChange={(value) => setInput(value)}
          placeholder="Type your message here..."
          className="rounded-md border dark:bg-zinc-800"
        />

        {/* Mic and Send Buttons */}
        <div className="absolute right-2 bottom-2 flex items-center space-x-2">
          {/* Mic Button */}
          <button
            type="button"
            onClick={() => console.log("Listening...")}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <HiMicrophone className="h-5 w-5 text-gray-500" />
          </button>
          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            <HiPaperAirplane className="h-5 w-5" />
          </button>
        </div>

        {/* Icons below the editor */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              title="Attach File"
            >
              <HiPaperClip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              title="Insert Emoji"
            >
              <HiFaceSmile className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              title="Insert Code Block"
            >
              <HiCodeBracket className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              title="Draw"
            >
              <HiMiniPencilSquare className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-zinc-400">
          AI may produce inaccurate information
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
