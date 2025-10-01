import { createSlice } from "@reduxjs/toolkit";

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

export function snakeKeysToCamel(obj) {
    if (Array.isArray(obj)) {
        return obj.map(snakeKeysToCamel);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
            acc[camelKey] = snakeKeysToCamel(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

function getYouTubeEmbedUrl(urlOrId) {
  let videoId = urlOrId;

  // If the input looks like a full YouTube URL
  if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
    const url = new URL(urlOrId);

    if (url.hostname === 'youtu.be') {
      // Short URL: https://youtu.be/VIDEO_ID
      videoId = url.pathname.slice(1);
    } else {
      // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
      videoId = url.searchParams.get('v');
    }
  }

  return `https://www.youtube.com/embed/${videoId}?controls=0&rel=0&modestbranding=1`;
}

function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;

  let videoId = url;

  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const parsedUrl = new URL(url); // rename variable
      if (parsedUrl.hostname === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      } else {
        videoId = parsedUrl.searchParams.get("v");
      }
    }
  } catch {
    return null; // invalid URL
  }

  return videoId;
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
            delete action.payload.youtubeVideoUrl
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

        setIsTranscriptGeneratedToTrue: (state) => {
            state.currentChat.isTranscriptGenerated = true
        },


    }
})


export const { initializeCurrentChat, initializeUserChats, makeQuestionsAnswers, addNewChat, addNewQuestionsAnwers, setIsTranscriptGeneratedToTrue } = chatsSlice.actions
export default chatsSlice.reducer