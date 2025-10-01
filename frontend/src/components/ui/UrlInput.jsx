import { FileText, Edit, Check } from "lucide-react";
import { useState } from 'react'
import useApiCall from '../../hooks/useApiCall.js'
import ThreeDotLoader from './ThreeDotLoader'
import { useDispatch, useSelector } from "react-redux";
import { getVideoTranscript } from "../../api/chats";
import { setIsTranscriptGeneratedToTrue } from "../../features/chatsSlice.js";


const UrlInput = () => {
  const [videoURL, setVideoURL] = useState("")
  
  const currentChat = useSelector(state => state.chats.currentChat)
  const { videoId, isTranscriptGenerated } = currentChat

  const [isEditing, setIsEditing] = useState(!isTranscriptGenerated)
  
  const {
    isLoading,
    loadingMsg,
    isError,
    errorMsg,
    handleApiCall
  } = useApiCall(getVideoTranscript, "Loading Video Content")

  const dispatch = useDispatch()

  const handlefetchTranscript = async (event) => {
   event.preventDefault()
   const dataFromServer = await handleApiCall([videoId]) // Needs videoID and header
   if(dataFromServer){
    dispatch(setIsTranscriptGeneratedToTrue())
    setIsEditing(true)
   }
  }

  return (
    <div className="mx-auto w-full max-w-full px-2 sm:max-w-md">
      <div className="flex items-center">
        <input
          type="text"
          value={videoURL}
          onChange={(e) => setVideoURL(e.target.value)}
          placeholder="Enter YouTube URL..."
          disabled={isTranscriptGenerated && (isEditing === false)}
          className="flex-1 px-2 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 shadow-md focus:outline-none transition disabled:opacity-70"
        />

        <button
          onClick={handlefetchTranscript}
          disabled={isTranscriptGenerated && (isEditing === false)}
          className={`${!isTranscriptGenerated && (isEditing === false) ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500"} text-white px-3 py-2 shadow-md flex items-center justify-center transition`}
        >
          {isTranscriptGenerated && (isEditing === false) ? (<Check size={20} />) : (<FileText size={20} />)}
        </button>

        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-green-700 text-white px-3 py-2 rounded-r-lg shadow-md flex items-center justify-center transition"
        >
          <Edit size={20} />
        </button>

      </div>


      {isError && (
        <p className="text-red-800 mt-2">{errorMsg}</p>
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
