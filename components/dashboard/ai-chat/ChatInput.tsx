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
  const [input, setInput] = useState("");

  // Custom Toolbar Configuration
  const toolbarOptions = [
    ["bold", "italic", "underline"], // Basic formatting options
    [{ list: "ordered" }, { list: "bullet" }], // Lists
    [{ align: [] }], // Alignment options
    ["link"], // Hyperlinks
    [{ color: [] }, { background: [] }], // Text and background color
    ["clean"], // Remove formatting
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      console.log("Message sent:", input);
      setInput(""); // Clear input after sending
    }
  };

  return (
    <div className="flex-shrink-0 border-t bg-white dark:bg-zinc-800 p-2">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
          <div className="relative w-full">
            {/* Rich Text Editor */}
            <ReactQuill
              value={input}
              onChange={setInput}
              placeholder="Type your message here..."
              className="bg-white dark:bg-zinc-700 dark:text-white border rounded-md"
              theme="snow"
              modules={{
                toolbar: toolbarOptions,
              }}
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
                type="submit"
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <HiPaperAirplane className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Icon Bar Below Input */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <HiPaperClip className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <HiFaceSmile className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <HiCodeBracket className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <HiMiniPencilSquare className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* AI Disclaimer */}
          <div className="flex justify-center">
            <p className="text-[8px] text-zinc-500 dark:text-zinc-400 mt-1 text-center">
              AI may produce inaccurate information
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
