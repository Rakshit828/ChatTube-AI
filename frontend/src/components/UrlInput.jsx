import { AiFillYoutube } from 'react-icons/ai'
import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import ThreeDotLoader from './ThreeDotLoader'


const UrlInput = () => {
  const { header } = useContext(AuthContext)

  const {
    videoID,
    getVideoTranscript,
    url,
    setUrl,
    chats,
    setChats,
    updateChat,
    createNewChat,
    selectedChatID,
    setSelectedChatID,
    handleSetURLs,
  } = useContext(ChatContext)

  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")

  const handleSubmit = async () => {
    setErrorText("")
    const chatData = {
      youtubeVideo: url
    }
    if (!selectedChatID) {
      chatData.title = "New Chat"
      console.log(chatData)
      setIsLoading(true)
      setLoadingMsg("Creating New Chat")
      const response = await createNewChat(chatData, header)
      if (response.success) {
        setChats([...chats, response.data])
        setSelectedChatID(response.data?.uuid)
        setLoadingMsg("Generating video transcript")
        handleSetURLs(url)
        const transcript = await getVideoTranscript(videoID, header)
        if (transcript.success) {
          setIsLoading(false)
          setLoadingMsg("")
        } else {
          setIsLoading(false)
          setErrorText(transcript.data)
        }
      } else {
        setIsLoading(false)
        setErrorText(response.data)
      }
    }
    else {
      setIsLoading(true)
      setLoadingMsg("Updating Video")
      const response = await updateChat(selectedChatID, chatData, header)
      if (response.success) {
        handleSetURLs(response.data?.youtube_video)
        setLoadingMsg("Generating Video Transcript")
        const transcript = await getVideoTranscript(videoID, header)
        if (transcript.success) {
          setIsLoading(false)
          setLoadingMsg("")
        }
        else {
          setIsLoading(false)
          setErrorText(transcript.data)
        }
      }
      else {
        setIsLoading(false)
        setErrorText(response.data + " Retry.")
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-full px-2 sm:max-w-md">
      <div className="flex items-center">
        <input
          type="text"
          value={url}
          onChange={(event) => { setUrl(event.target.value) }}
          placeholder="Enter YouTube URL..."
          className="flex-1 px-2 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 shadow-md focus:outline-none transition"
        />
        <button
          onClick={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-r-lg shadow-md flex items-center justify-center transition"
        >
          <AiFillYoutube size={16} />
        </button>
      </div>

      {errorText && (
        <p className='text-red-800'>{errorText}</p>
      )}

      {
        isLoading && (
          <div className='text-gray-500 mt-2 flex gap-4'>
            {loadingMsg}
            <ThreeDotLoader size={7} color='white' />
          </div>
        )
      }

    </div>
  )
}

export default UrlInput;
