import { createContext, useState } from "react"
import { createNewChat, updateChat, loadAllQAs } from "../api/chats";
import { ChartScatter } from "lucide-react";


export const ChatContext = createContext()

const ChatProvider = ({ children }) => {
    const [url, setUrl] = useState("");
    const [embedUrl, setEmbedUrl] = useState(null);
    const [chats, setChats] = useState([])
    const [qas, setQAs] = useState([])

    return (
        <ChatContext.Provider value={
            {
                url,
                setUrl,
                embedUrl,
                setEmbedUrl,
                createNewChat,
                updateChat,
                loadAllQAs,
                chats,
                setChats,
                qas,
                setQAs
            }
        }>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatProvider
