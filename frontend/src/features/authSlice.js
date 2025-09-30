import { createSlice, nanoid } from "@reduxjs/toolkit";


export const initialState = {
    "accessToken": "",
    "refreshToken": ""
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setTokens: (state, action) => {
            
        }
    }
})