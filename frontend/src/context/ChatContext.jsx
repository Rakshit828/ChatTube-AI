import { createContext, useState } from "react"

import { 
    createNewChat, 
    updateChat, 
    loadAllChats, 
    loadAllQAs, 
    getResponseFromLLM, 
    getVideoTranscript, 
    deleteChat } 
from "../api/chats";

export const ChatContext = createContext()


const ChatProvider = ({ children }) => {
    const [url, setUrl] = useState("");  // A state for two-way binding, this is the url entered
    const [embedUrl, setEmbedUrl] = useState(""); // A state for embedURL, for iframe component
    const [videoID, setVideoID] = useState(null)  // Video ID for http requests
    
    const [chats, setChats] = useState([]) // A state for the current user chats
    const [qas, setQAs] = useState([])   // A state for the QAs for the current chat
    
    const [selectedChatID, setSelectedChatID] = useState("") 
    const [isTranscriptGenerated, setIsTranscriptGenerated] = useState(false)


    const handleSetURLs = (videoURL) => {
        setUrl(videoURL)
        console.log(videoURL)
        const params = new URLSearchParams(new URL(videoURL).search)
        let video = params.get('v')
        if (video) {
            setVideoID(video)
            setEmbedUrl(`https://www.youtube.com/embed/${video}?controls=0&rel=0&modestbranding=1`)
        }
    }

    return (
        <ChatContext.Provider value={
            {
                isTranscriptGenerated,
                setIsTranscriptGenerated,

                videoID,
                setVideoID,
                url,
                setUrl,
                embedUrl,
                setEmbedUrl,
                chats,
                setChats,
                qas,
                setQAs,
                selectedChatID,
                setSelectedChatID,
                handleSetURLs,

                getResponseFromLLM,
                getVideoTranscript,
                createNewChat,
                updateChat,
                deleteChat,
                loadAllQAs,
                loadAllChats
            }
        }>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatProvider
