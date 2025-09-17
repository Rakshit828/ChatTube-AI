import { AiFillYoutube } from 'react-icons/ai'
import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'

const UrlInput = ({ }) => {
  const { header } = useContext(AuthContext)
  const { videoID, getVideoTranscript, url, setUrl, updateChat, createNewChat, selectedChatID, setSelectedChatID, handleSetURLs } = useContext(ChatContext)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    const chatData = {
      youtubeVideo: url
    }
    if (!selectedChatID) {
      chatData.title = "New Chat"
      console.log(chatData)
      const response = await createNewChat(chatData, header)
      if (response.success) {
        setSelectedChatID(response.data?.uuid)
        const transcript = await getVideoTranscript(videoID, header)
        if (transcript.success) {
          console.log("Transcript loaded")
        }
      }
    }
    else {
      const response = await updateChat(selectedChatID, chatData, header)
      if (response.success) {
        handleSetURLs(response.data?.youtube_video)
        const transcript = await getVideoTranscript(videoID, header)
        if (transcript.success) {
          console.log("Transcript loaded")
        }
      } else {
        setError(response.data + " Retry.")
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

      {error && (
        <p className='text-red-800'>{error}</p>
      )}

    </div>
  )
}

export default UrlInput;
