import React, { useState, useEffect, useRef, useCallback } from "react";
import { FileText, Edit, Check, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useApiCall from '../../hooks/useApiCall.js';
import ThreeDotLoader from './ThreeDotLoader';
import { getVideoTranscript, updateChat } from "../../api/chats";
import { setIsTranscriptGeneratedToTrue, updateCurrentChat } from "../../features/chatsSlice.js";
import { isValidYouTubeUrlOrId } from "../../helpers/chatHelpers.js";


const UrlInput = () => {
  const dispatch = useDispatch();
  const currentChat = useSelector((s) => s.chats.currentChat);
  const { youtubeVideoUrl, videoId, selectedChatId, isTranscriptGenerated } = currentChat || {};

  const [videoURL, setVideoURL] = useState(youtubeVideoUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const lastFetchRequestRef = useRef(0);
  const lastUpdateRequestRef = useRef(0);
  const mountedRef = useRef(true);
  const videoURLRef = useRef(videoURL)

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    videoURLRef.current = videoURL
  }, [videoURL])

  // useEffect(() => {
  //   if (!isEditing) setVideoURL(youtubeVideoUrl || "");
  // }, [youtubeVideoUrl, isEditing]);

  useEffect(() => {
    setVideoURL(youtubeVideoUrl)
  }, [youtubeVideoUrl])

  const {
    isLoading: isLoadingFetch,
    loadingMsg: loadingMsgFetch,
    isError: isErrorFetch,
    errorMsg: errorMsgFetch,
    setIsError: setIsErrorFetch,
    setErrorMsg: setErrorMsgFetch,
    handleApiCall: handleApiCallFetch
  } = useApiCall(getVideoTranscript, "Generating transcript");

  const {
    isLoading: isLoadingUpdate,
    loadingMsg: loadingMsgUpdate,
    isError: isErrorUpdate,
    errorMsg: errorMsgUpdate,
    setIsError: setIsErrorUpdate,
    setErrorMsg: setErrorMsgUpdate,
    handleApiCall: handleApiCallUpdate
  } = useApiCall(updateChat, "Saving video URL");


  const isAnyLoading = isLoadingFetch || isLoadingUpdate;

  useEffect(() => {
    if (localError || errorMsgFetch || errorMsgUpdate || successMessage) {
      const timer = setTimeout(() => {
        setLocalError("");
        setSuccessMessage("");
        setIsErrorFetch(false);
        setErrorMsgFetch("");
        setIsErrorUpdate(false);
        setErrorMsgUpdate("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localError, errorMsgFetch, errorMsgUpdate, successMessage, setIsErrorFetch, setErrorMsgFetch, setIsErrorUpdate, setErrorMsgUpdate]);

  useEffect(() => {
    const run = async () => {
      if (!videoId) return;
      if (isTranscriptGenerated) return;
      lastFetchRequestRef.current += 1;
      const requestId = lastFetchRequestRef.current;
      setLocalError("");
      setSuccessMessage("");
      const response = await handleApiCallFetch([videoId]);
      if (!mountedRef.current || requestId !== lastFetchRequestRef.current) return;

      if (!response.success) {
        setLocalError(response.data?.message || 'Failed to fetch transcript');
      } else if (response.success) {
        dispatch(setIsTranscriptGeneratedToTrue(true));
        setSuccessMessage('Transcript generated');
      }
    };
    run();
  }, [videoId, isTranscriptGenerated, handleApiCallFetch, dispatch]);


  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLocalError("");
    setSuccessMessage("");
    setIsErrorUpdate(false);
    setErrorMsgUpdate("");
    setIsErrorFetch(false);
    setErrorMsgFetch("");
    const trimmed = (videoURLRef.current || "").trim();
    if (!trimmed) {
      setLocalError('Please enter a YouTube URL or ID');
      return;
    }
    if (!isValidYouTubeUrlOrId(trimmed)) {
      setLocalError('Invalid YouTube URL or ID');
      return;
    }
    console.log("YOutube video", youtubeVideoUrl, "Trimmed / videoURL: ", trimmed)
    if ((youtubeVideoUrl || '').trim() === trimmed) {
      setIsEditing(false);
      return;
    }

    lastUpdateRequestRef.current += 1;
    const requestId = lastUpdateRequestRef.current;
    dispatch(setIsTranscriptGeneratedToTrue(false)); // Runs the useEffect to fetch the transcript
    const payload = { youtubeVideoUrl: trimmed };
    const updateResponse = await handleApiCallUpdate([selectedChatId, payload]);
     
    console.log("From update chat (server data): ", updateResponse)

    if (!mountedRef.current || requestId !== lastUpdateRequestRef.current) return;

    console.log("Updated data type", typeof updateResponse === 'object')
    
    // Error Check for update
    if (updateResponse && !updateResponse.success) {
      // console.log("From update chat (if update data is not successful): ", updateResponse)
      setLocalError(updateResponse.data?.message || 'Failed to update URL');
      dispatch(setIsTranscriptGeneratedToTrue(false));
      return;
    }

    // Handling successful update
    if (updateResponse) {
      dispatch(updateCurrentChat(updateResponse));
      setIsEditing(false);
      setSuccessMessage('URL saved');
    }
  }, [selectedChatId, youtubeVideoUrl, handleApiCallUpdate, dispatch, setIsErrorUpdate, setErrorMsgUpdate, setIsErrorFetch, setErrorMsgFetch]);
  // setting videoURL as a dependency causes race condition


  const inputDisabled = isTranscriptGenerated && !isEditing;
  const canEdit = !isAnyLoading && !isEditing;
  const canSave = !isAnyLoading && (isEditing || !isTranscriptGenerated) && videoURL.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-full px-2 sm:max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex w-full gap-1">
          <input
            aria-label="YouTube URL"
            type="text"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            placeholder="Enter YouTube URL or ID"
            disabled={inputDisabled || isAnyLoading}
            className={`flex-1 px-2 py-1.5 rounded-xl bg-gray-800 text-white placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          />

          <button
            type="submit"
            disabled={!canSave}
            title={isTranscriptGenerated && !isEditing ? 'Transcript already generated. Click edit to change URL.' : 'Generate transcript / save URL'}
            className={`rounded-xl px-2 py-1.5 shadow-md flex items-center justify-center transition ${canSave ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'} text-white`}
          >
            {(!isTranscriptGenerated || isEditing) ? <FileText size={20} /> : <Check size={20} />}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setLocalError("");
              setSuccessMessage("");
            }}
            disabled={!canEdit}
            title="Edit URL"
            className={`rounded-xl px-2 py-1.5 shadow-md flex items-center justify-center transition ${canEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 cursor-not-allowed'} text-white`}
          >
            <Edit size={20} />
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setVideoURL(youtubeVideoUrl || '');
                setIsEditing(false);
                setLocalError('');
                setSuccessMessage('Edit cancelled');
              }}
              className="rounded-xl px-2 py-1.5 shadow-md flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-r-xl"
              title="Cancel editing"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="mt-1">
          {(isLoadingFetch || isLoadingUpdate) && (
            <div className="text-gray-400 text-sm p-2 bg-gray-800/50 rounded-lg flex gap-2 items-center">
              <ThreeDotLoader />
              <span>{isLoadingFetch ? loadingMsgFetch : loadingMsgUpdate}</span>
            </div>
          )}

          {!isAnyLoading && (isErrorFetch || isErrorUpdate || localError) && (
            <div className="text-red-400 text-sm p-2 bg-red-900/20 rounded-lg">
              <strong>Error:</strong>&nbsp;{localError || errorMsgFetch || errorMsgUpdate}
            </div>
          )}

          {!isAnyLoading && successMessage && (
            <div className="text-green-300 text-sm p-2 bg-green-900/10 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default UrlInput;