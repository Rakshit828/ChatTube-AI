import { configureStore } from "@reduxjs/toolkit";
import authReducer, { initialState as authInitialState } from "../features/authSlice.js";
import chatReducer from "../features/chatsSlice.js";

// Loading the accessToken from the local storage if exists
const preloadedAuth = {
  ...authInitialState,
  accessToken: localStorage.getItem("accessToken") || "",
  refreshToken: localStorage.getItem("refreshToken") || ""
};

// combine preloaded state
const preloadedState = {
  auth: preloadedAuth,
  // chats slice will use its own default initialState automatically
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chats: chatReducer
  },
  preloadedState
});
