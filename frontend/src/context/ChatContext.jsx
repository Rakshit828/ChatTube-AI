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

    const [ errorText, setErrorText ] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMsg, setLoadingMsg] = useState("")

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
                errorText,
                setErrorText,
                isLoading,
                setIsLoading,
                loadingMsg,
                setLoadingMsg,

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
                loadAllQAs,
                loadAllChats
            }
        }>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatProvider
