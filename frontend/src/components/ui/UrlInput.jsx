import { FileText, Edit, Check } from "lucide-react";
import { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
import ThreeDotLoader from './ThreeDotLoader'

const UrlInput = () => {
  const { header } = useContext(AuthContext)

  const {
    isTranscriptGenerated,
    setIsTranscriptGenerated,
    videoID,
    url,
    setUrl,
    chats,
    setChats,
    selectedChatID,
    setSelectedChatID,

    handleSetURLs,
    updateChat,
    createNewChat,
    getVideoTranscript
  } = useContext(ChatContext)

  const [errorText, setErrorText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")
  const [isEditing, setIsEditing] = useState(!isTranscriptGenerated)


  const fetchTranscript = async () => {
    setLoadingMsg("Generating video transcript")
    const transcript = await getVideoTranscript(videoID, header)
    if (!transcript.success) {
      throw new Error(transcript.data)
    }
    setIsTranscriptGenerated(true)
  }

  const handleLoad = async () => {
    if (!url.trim()) {
      setErrorText("Please enter a valid YouTube URL")
      return
    }

    setErrorText("")
    setIsLoading(true)

    try {
      const chatData = { youtubeVideo: url }

      if (!selectedChatID) {
        chatData.title = "New Chat"
        setLoadingMsg("Creating new chat")
        const response = await createNewChat(chatData, header)
        if (!response.success) throw new Error(response.data)

        setChats([...chats, response.data])
        setSelectedChatID(response.data?.uuid)
        handleSetURLs(url)
        await fetchTranscript()
      } else {
        setLoadingMsg("Updating video")
        const response = await updateChat(selectedChatID, chatData, header)
        if (!response.success) throw new Error(response.data + " Retry.")

        handleSetURLs(response.data?.youtube_video)
        await fetchTranscript()
      }
    } catch (err) {
      setErrorText(err.message || "Unexpected error. Try again.")
    } finally {
      setIsLoading(false)
      setLoadingMsg("")
    }
  }

  const handleUrlChange = (event) => {
    setIsTranscriptGenerated(false)
    setUrl(event.target.value)
  }

  const handleButtonClick = (event) => {
    event.preventDefault()
    handleSubmit()
  }

  return (
    <div className="mx-auto w-full max-w-full px-2 sm:max-w-md">
      <div className="flex items-center">
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter YouTube URL..."
          disabled={!isEditing}
          className="flex-1 px-2 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 shadow-md focus:outline-none transition disabled:opacity-70"
        />

        <button
          onClick={handleLoad}
          disabled={!isEditing}
          className={`${!isTranscriptGenerated ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500"} text-white px-3 py-2 shadow-md flex items-center justify-center transition`}
        >
          {isTranscriptGenerated ? (<Check size={20} />) : (<FileText size={20} />)}
        </button>

        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-green-700 text-white px-3 py-2 rounded-r-lg shadow-md flex items-center justify-center transition"
        >
          <Edit size={20} />
        </button>

      </div>

      {errorText && (
        <p className="text-red-800 mt-2">{errorText}</p>
      )}

      {isLoading && (
        <div className="text-gray-500 mt-2 flex gap-4 items-center">
          {loadingMsg}
          <ThreeDotLoader size={7} color="white" />
        </div>
      )}
    </div>
  )
}

export default UrlInput
