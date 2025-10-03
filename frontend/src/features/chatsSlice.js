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
      const payload = snakeKeysToCamel(action.payload)
      state.userChats = payload
    },
    
    deleteUserChat: (state, action) => {
      const payload = snakeKeysToCamel(action.payload)
      state.userChats = state.userChats.filter((chat) => chat.uuid !== payload.uuid )
    },

    updateUserChats: (state, action) => {
      const payload = snakeKeysToCamel(action.payload)
      const chatUUID = payload?.uuid
      const chat = state.userChats.find(chat => chat.uuid === chatUUID)

      if (chat) {
        chat.title = payload?.title
        chat.youtube_video_url = payload?.youtubeVideoUrl
      }
    },

    addNewChat: (state, action) => {
      const payload = snakeKeysToCamel(action.payload)
      state.userChats.push(payload)
    },

    initializeCurrentChat: (state, action = {}) => {
      //To check for empty object
      if(typeof action.payload === 'object' && Object.keys(action.payload).length === 0){
        state.currentChat = initialState.currentChat
        return;
      }
      const payload = snakeKeysToCamel(action.payload)
      console.log("Payload : ", payload)
      payload['embedUrl'] = getYouTubeEmbedUrl(payload.youtubeVideoUrl)
      payload['videoId'] = getYouTubeVideoId(payload.youtubeVideoUrl)
      state.currentChat = payload
      console.log("Current Chat: ", state.currentChat)
    },

    updateQAs: (state, action) => {
      state.currentChat.questionsAnswers = state.currentChat.questionsAnswers.slice(0, -1)
      state.currentChat.questionsAnswers.push(action.payload)
    },

    // addNewQuestionsAnswers: (state, action) => {
    //   const payload = snakeKeysToCamel(action.payload)
    //   state.currentChat.q
    // },
    

    setIsTranscriptGeneratedToTrue: (state, action) => {
      state.currentChat.isTranscriptGenerated = action.payload ?? true;
    },

    updateCurrentChat: (state, action) => {
      const payload = snakeKeysToCamel(action.payload)
      state.currentChat.selectedChatId = payload.uuid
      state.currentChat.youtubeVideoUrl = payload.youtubeVideoUrl
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
  updateCurrentChat,
  deleteUserChat,
  updateUserChats
} = chatsSlice.actions

export default chatsSlice.reducer
