import { useRef, useEffect, useState } from "react";
import ChatInput from "./ChatInput.jsx";
import UrlInput from "./UrlInput.jsx";
import { User, Bot, Play } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addNewQuestionsAnwers } from "../../features/chatsSlice.js";
import ThreeDotLoader from "./ThreeDotLoader.jsx";
import useApiCall from "../../hooks/useApiCall.js";
import { getResponseFromLLM } from "../../api/chats.js";

const ChatArea = () => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [query, setQuery] = useState("");

  const currentChat = useSelector(state => state.chats.currentChat);
  const { selectedChatId, videoId, embedUrl, questionsAnswers } = currentChat;

  const dispatch = useDispatch();

  const {
    isLoading,
    loadingMsg,
    isError,
    errorMsg,
    handleApiCall
  } = useApiCall(getResponseFromLLM, "Thinking");


  const handleGetResponse = async () => {
    // Store user's question first
    dispatch(addNewQuestionsAnwers({
      query: query.trim(),
      answer: "", // empty string for now
      chatUID: selectedChatId
    }));

    // Call API
    const response = await handleApiCall([videoId, query]);

    // Update the last question-answer entry with the response
    const updatedAnswer = response || "Error: " + errorMsg;
    dispatch(addNewQuestionsAnwers({
      query: query.trim(),
      answer: updatedAnswer,
      chatUID: selectedChatId
    }));
  };

  const scrollToBottom = (smooth = true) => {
    const container = chatContainerRef.current;
    if (!container) return;
    const top = container.scrollHeight - container.clientHeight;
    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    } else {
      container.scrollTop = top;
    }
  };

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    const t = setTimeout(() => scrollToBottom(true), 50);
    return () => clearTimeout(t);
  }, [questionsAnswers]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden w-full relative">
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain scroll-smooth custom-dark-scrollbar pb-32"
        >
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">

            {/* Landing page */}
            {(!questionsAnswers || questionsAnswers.length === 0) && !embedUrl && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
                <div className="w-12 h-12 sm:w-16 md:w-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6 sm:w-8 md:w-10 text-gray-400" />
                </div>
                <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-white mb-3">
                  Your New Youtube Companion
                </h2>
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-gray-200">
                  Ask | Learn | Chat
                </h1>
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gradient mt-2">
                  ChatTube AI
                </h1>
              </div>
            )}

            {/* Video embed */}
            {embedUrl && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-300">Video Content</span>
                </div>
                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-gray-800 border border-gray-700">
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      title="YouTube Video"
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Questions & Answers */}
            {questionsAnswers && questionsAnswers.length > 0 && (
              <div className="space-y-6">
                {questionsAnswers.map((qa, index) => (
                  <div key={index} className="space-y-4">
                    {/* User query */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-base text-gray-100 leading-relaxed break-words">
                        {qa.query}
                      </div>
                    </div>

                    {/* Bot answer */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="flex-1 text-base text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                        {isLoading && index === questionsAnswers.length - 1 ? (
                          <div className="flex items-center gap-2">
                            {loadingMsg} <ThreeDotLoader size={10} />
                          </div>
                        ) : isError && index === questionsAnswers.length - 1 ? (
                          <div className="text-red-600">{errorMsg}</div>
                        ) : (
                          qa.answer
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} className="h-6" />
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="sticky bottom-0 w-full max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 pt-4 z-20 bg-gradient-to-t from-gray-900/90 to-transparent backdrop-blur-sm">
        <UrlInput />
        <ChatInput
          query={query}
          setQuery={setQuery}
          generateResponse={handleGetResponse}
        />
      </div>

      {/* Footer */}
      <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 pb-2">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
