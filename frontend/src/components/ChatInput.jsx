import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const ChatInput = () => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 240; // 15rem
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY =
        textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [text]);

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
      <div className="bg-gray-700 rounded-3xl flex items-center p-1 gap-2 sm:gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none bg-gray-700 text-white rounded-3xl 
                     px-2 sm:px-3 py-1.5 sm:py-2 
                     leading-[1.5] text-sm sm:text-base 
                     focus:outline-none 
                     scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-700"
        />
        <button className="bg-blue-500 text-white 
                           p-2 sm:p-3 
                           rounded-full flex items-center justify-center 
                           hover:bg-blue-600 transition">
          <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
