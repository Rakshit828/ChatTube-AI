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

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setVideoURL(youtubeVideoUrl || "");
  }, [youtubeVideoUrl]);

  const {
    isLoading: isLoadingFetch,
    loadingMsg: loadingMsgFetch,
    handleApiCall: handleApiCallFetch
  } = useApiCall(getVideoTranscript, "Generating transcript");

  const {
    isLoading: isLoadingUpdate,
    handleApiCall: handleApiCallUpdate
  } = useApiCall(updateChat, "Saving video URL");

  const isAnyLoading = isLoadingFetch || isLoadingUpdate;

  // Clear messages after 3 seconds
  useEffect(() => {
    if (localError || successMessage) {
      const timer = setTimeout(() => {
        setLocalError("");
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localError, successMessage]);

  // Fetch transcript when videoId changes and transcript not yet generated
  useEffect(() => {
    const run = async () => {
      if (!videoId || isTranscriptGenerated) return;

      lastFetchRequestRef.current += 1;
      const requestId = lastFetchRequestRef.current;

      const response = await handleApiCallFetch([videoId]);
      if (!mountedRef.current || requestId !== lastFetchRequestRef.current) return;

      if (response && response.success) {
        dispatch(setIsTranscriptGeneratedToTrue());
        setSuccessMessage("Transcript generated successfully!");
      }
    };
    run();
  }, [videoId, isTranscriptGenerated, handleApiCallFetch, dispatch]);

  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();

    setLocalError("");
    setSuccessMessage("");

    const trimmed = (videoURL || "").trim();

    if (!trimmed) {
      setLocalError("Please enter a YouTube URL or ID");
      return;
    }

    if (!isValidYouTubeUrlOrId(trimmed)) {
      setLocalError("Invalid YouTube URL or ID");
      return;
    }

    if ((youtubeVideoUrl || "").trim() === trimmed) {
      setIsEditing(false);
      setSuccessMessage("No changes to save");
      return;
    }

    lastUpdateRequestRef.current += 1;
    const requestId = lastUpdateRequestRef.current;

    const payload = { youtubeVideoUrl: trimmed };
    const updateResponse = await handleApiCallUpdate([selectedChatId, payload]);

    if (!mountedRef.current || requestId !== lastUpdateRequestRef.current) return;

    if (!updateResponse.success) {
      setLocalError(updateResponse.data?.message || "Failed to update URL");
      return;
    }

    if (updateResponse.success) {
      dispatch(updateCurrentChat(updateResponse.data));
      setIsEditing(false);
      setSuccessMessage("URL saved successfully!");
    }
  }, [videoURL, selectedChatId, youtubeVideoUrl, handleApiCallUpdate, dispatch]);

  const handleEdit = () => {
    setIsEditing(true);
    setLocalError("");
    setSuccessMessage("");
  };

  // Logic for disabling/enabling input and buttons
  const inputDisabled = isTranscriptGenerated && !isEditing || isAnyLoading;
  const canEdit = isTranscriptGenerated && !isEditing && !isAnyLoading;
  const canSave = videoURL.trim().length > 0 && (isEditing || !isTranscriptGenerated) && !isAnyLoading;

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
            disabled={inputDisabled}
            className={`flex-1 px-2 py-1.5 rounded-xl bg-gray-800 text-white placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          />

          <button
            type="submit"
            disabled={!canSave}
            title={isTranscriptGenerated && !isEditing ? "Click Edit to change URL" : "Save URL and generate transcript"}
            className={`rounded-xl px-2 py-1.5 shadow-md flex items-center justify-center transition ${canSave ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'} text-white`}
          >
            {isTranscriptGenerated && !isEditing ? <Check size={20} /> : <FileText size={20} />}
          </button>

          <button
            type="button"
            onClick={handleEdit}
            disabled={!canEdit}
            title={canEdit ? "Edit URL to change it" : "Already editing or no transcript yet"}
            className={`rounded-xl px-2 py-1.5 shadow-md flex items-center justify-center transition ${canEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 cursor-not-allowed'} text-white`}
          >
            <Edit size={20} />
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setVideoURL(youtubeVideoUrl || "");
                setIsEditing(false);
                setLocalError("");
                setSuccessMessage("Edit cancelled");
              }}
              className="rounded-xl px-2 py-1.5 shadow-md flex items-center justify-center bg-red-600 hover:bg-red-700 text-white"
              title="Cancel editing"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="mt-1">
          {isAnyLoading && (
            <div className="text-gray-400 text-sm p-2 bg-gray-800/50 rounded-lg flex gap-2 items-center">
              <ThreeDotLoader />
              <span>{isLoadingFetch ? "Generating transcript..." : "Saving URL..."}</span>
            </div>
          )}

          {!isAnyLoading && (localError) && (
            <div className="text-red-400 text-sm p-2 bg-red-900/20 rounded-lg">
              <strong>Error:</strong>&nbsp;{localError}
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
