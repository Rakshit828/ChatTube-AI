import { createContext, useState } from "react"
import { createNewChat, updateChat, loadAllChats, loadAllQAs, getResponseFromLLM, getVideoTranscript } from "../api/chats";


export const ChatContext = createContext()

const ChatProvider = ({ children }) => {
    const [url, setUrl] = useState("");
    const [embedUrl, setEmbedUrl] = useState("");
    const [chats, setChats] = useState([])
    const [qas, setQAs] = useState([])
    const [selectedChatID, setSelectedChatID] = useState("")
    const [videoID, setVideoID] = useState(null)
    
    const handleSetURLs = (videoURL) => {
        setUrl(videoURL)
        console.log(videoURL)
        const params = new URLSearchParams(new URL(videoURL).search)
        let video = params.get('v')
        if (video) {
            setVideoID(video)
            setEmbedUrl(`https://www.youtube.com/embed/${videoID}?controls=0&rel=0&modestbranding=1`)
        }
    }

    return (
        <ChatContext.Provider value={
            {
                videoID,
                setVideoID,
                url,
                setUrl,
                embedUrl,
                setEmbedUrl,
                chats,
                setChats,
                getResponseFromLLM,
                getVideoTranscript,
                selectedChatID,
                setSelectedChatID,
                handleSetURLs,
                qas,
                setQAs,
                createNewChat,
                updateChat,
                loadAllQAs,
                loadAllChats
            }
        }>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatProvider
