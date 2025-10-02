import { createSlice } from "@reduxjs/toolkit";
import { snakeKeysToCamel, getYouTubeEmbedUrl, getYouTubeVideoId } from "../helpers/chatHelpers";

export const initialState = {
  userChats: [], // A list of objects with keys: uuid, title, youtube_video
  currentChat: {
    youtubeVideoUrl: "",
    selectedChatId: "",
    videoId: "",
    embedUrl: "",
    isTranscriptGenerated: "",
    questionsAnswers: []
  }
}


export const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    initializeUserChats: (state, action) => {
      action.payload = snakeKeysToCamel(action.payload)
      state.userChats = action.payload
    },

    initializeCurrentChat: (state, action) => {
      action.payload = snakeKeysToCamel(action.payload)
      console.log("Payload : ", action.payload)
      action.payload['embedUrl'] = getYouTubeEmbedUrl(action.payload.youtubeVideoUrl)
      action.payload['videoId'] = getYouTubeVideoId(action.payload.youtubeVideoUrl)
      state.currentChat = action.payload
      console.log("Current Chat: ", state.currentChat)
    },

    makeQuestionsAnswers: (state, action) => {
      state.currentChat.questionsAnswers = action.payload
    },

    addNewQuestionsAnwers: (state, action) => {
      state.currentChat.questionsAnswers = state.currentChat.questionsAnswers.slice(0, -1)
      state.currentChat.questionsAnswers.push(action.payload)
    },

    addNewChat: (state, action) => {
      state.userChats.push(action.payload)
    },

    // chatsSlice.js
    setIsTranscriptGeneratedToTrue: (state, action) => {
      // If payload is provided, use it; otherwise default to true
      state.currentChat.isTranscriptGenerated = action.payload ?? true;
    },


    updateCurrentChat: (state, action) => {
      action.payload = snakeKeysToCamel(action.payload)
      state.currentChat.selectedChatId = action.payload.uuid
      state.currentChat.youtubeVideoUrl = action.payload.youtubeVideoUrl
      state.currentChat.embedUrl = getYouTubeEmbedUrl(state.currentChat.youtubeVideoUrl)
      state.currentChat.videoId = getYouTubeVideoId(state.currentChat.youtubeVideoUrl)
    }

  }
})


export const {
  initializeCurrentChat,
  initializeUserChats,
  makeQuestionsAnswers,
  addNewChat,
  addNewQuestionsAnwers,
  setIsTranscriptGeneratedToTrue,
  updateCurrentChat
} = chatsSlice.actions

export default chatsSlice.reducer