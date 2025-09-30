import { useState, useRef, useEffect, useContext } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext"
import ThreeDotLoader from "./ThreeDotLoader";


const ChatInput = () => {
  const [query, setQuery] = useState("");
  const textareaRef = useRef(null);
  const { qas, setQAs, selectedChatID, getResponseFromLLM, videoID } = useContext(ChatContext);

  const { header } = useContext(AuthContext)

  const handleSendQueries = async (event) => {
    event?.preventDefault();
    if (!query.trim()) return;

    const textarea = textareaRef.current;
    // lock current height to prevent immediate layout jump when we clear query
    if (textarea) textarea.style.height = `${textarea.clientHeight}px`;

    setQAs((prev) => [
      ...prev,
      { query: query.trim(), answer: <ThreeDotLoader />, chatUID: selectedChatID },
    ]);

    const response = await getResponseFromLLM(videoID = videoID, query, header)
    if (response) {
      setQAs((prev) => [
        ...prev.slice(0, -1),
        { query: query.trim(), answer: response.data, chatUID: selectedChatID },
      ]);
    }


    setQuery("");
    // release height next frame so the auto-resize useEffect can recalc without a jump
    requestAnimationFrame(() => {
      if (textarea) textarea.style.height = "auto";
    });
  };

  // auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 240; // px
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [query]);

  // Enter to send, Shift+Enter to newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQueries();
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
      <form
        onSubmit={handleSendQueries}
        className="bg-gray-700 rounded-3xl flex items-center p-1 gap-2 sm:gap-3"
        aria-label="Chat input form"
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none bg-gray-700 text-white rounded-3xl 
                     px-2 sm:px-3 py-1.5 sm:py-2 
                     leading-[1.5] text-sm sm:text-base 
                     focus:outline-none 
                     custom-dark-scrollbar"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="bg-blue-500 text-white 
                     p-2 sm:p-3 
                     rounded-full flex items-center justify-center 
                     hover:bg-blue-600 transition"
        >
          <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
