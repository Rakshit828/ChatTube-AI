import { useState } from "react";
import ChatInput from "./ChatInput.jsx";
import UrlInput from "./UrlInput.jsx";

const ChatArea = () => {
  const [url, setUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState(null);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900">
      {/* Video + Messages */}
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        {embedUrl && (
          <div className="relative w-full mx-auto rounded-xl overflow-hidden shadow-lg aspect-video">
            <iframe
              src={embedUrl}
              title="YouTube Video"
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-4">
          <div className="space-y-4 text-gray-400">No messages yet</div>
        </div>

        {/* Input area */}
        <div className="w-full px-4 pb-4 flex flex-col gap-2">
          <UrlInput url={url} setUrl={setUrl} setEmbedUrl={setEmbedUrl} />
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
