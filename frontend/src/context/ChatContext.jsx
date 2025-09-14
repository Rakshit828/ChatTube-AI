import { createContext, useState } from "react"


const ChatContext = createContext()

const ChatProvider = ({ children }) => {
    const [url, setUrl] = useState("");
    const [embedUrl, setEmbedUrl] = useState(null);

    return (
        <ChatContext.Provider value={{ url, embedUrl }}>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatProvider
