import { createSlice } from "@reduxjs/toolkit";
import { snakeKeysToCamel } from "../helpers/chatHelpers";


export const initialState = {
    accessToken: undefined,
    refreshToken: undefined,
};


export const selectIsAuthenticated = (state) => {
    const token = state.auth.accessToken;

    // Return true only if token is a non-empty string that looks like a JWT
    if (typeof token !== 'string') return false;          // cHECKS for string
    if (token.trim() === '') return false;                // Empty string → invalid
    if (token === 'undefined') return false;             // Literal "undefined" → invalid

    // Optional: check for basic JWT format (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;                // Not a valid JWT

    return true;                                        // Looks valid
};


export const selectAccessToken = state => state.auth.accessToken
export const selectRefreshToken = state => state.auth.refreshToken


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setTokens: (state, action) => {
            action.payload = snakeKeysToCamel(action.payload)
            console.log("Calling set tokens from reducer : ", action.payload)
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem("accessToken", state.accessToken)
            localStorage.setItem("refreshToken", state.refreshToken)
        },
        setAccessToken: (state, action) => {
            action.payload = snakeKeysToCamel(action.payload);
            state.accessToken = action.payload.accessToken
            localStorage.setItem("accessToken", state.accessToken)
        },

        setRefreshToken: (state, action) => {
            action.payload = snakeKeysToCamel(action.payload)
            state.refreshToken = action.payload.refreshToken
            localStorage.setItem("refreshToken", state.auth.refreshToken)
        },

        clearTokens: (state) => {
            state.accessToken = ""
            state.refreshToken = ""
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
        }
    },
});


export const { setTokens, setAccessToken, clearTokens } = authSlice.actions;
export default authSlice.reducer;
