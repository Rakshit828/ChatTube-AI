import axios from "axios";
import { BASE_URL, CHATS_PREFIX } from "./config";


export const createNewChat = async (chatData, headers) => {
    try {
        const response = await axios.post(
            `${BASE_URL}${CHATS_PREFIX}/newchat`,
            chatData,
            { headers }
        )
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message };
    }
}


export const deleteChat = async (chat_uid, headers) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}${CHATS_PREFIX}/delete/${chat_uid}`,
            { headers }
        )
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message };
    }
}


export const updateChat = async (chat_uid, chatData, headers) => {
    try {
        const response = await axios.post(
            `${BASE_URL}${CHATS_PREFIX}/updatechat/${chat_uid}`,
            chatData,
            { headers }
        )
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message };
    }
}



export const loadAllChats = async (headers) => {
    try {
        const response = await axios.get(`${BASE_URL}${CHATS_PREFIX}/allchats`, { headers })
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message }
    }
}


export const loadAllQAs = async (chat_uid, headers) => {
    try {
        const response = await axios.get(
            `${BASE_URL}${CHATS_PREFIX}/qa/${chat_uid}`,
            { headers }
        )
        return { success: true, data: response.data }
    }
    catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message };
    }
}


export const getResponseFromLLM = async (videoID, query, headers) => {
    try {
        const response = await axios.get(
            `${BASE_URL}${CHATS_PREFIX}/response/${videoID}/${query}`,
            { headers }
        )
        return { success: true, data: response.data }
    }
    catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message }
    }
}


export const getVideoTranscript = async (videoID, headers) => {
    try {
        const response = await axios.get(
            `${BASE_URL}${CHATS_PREFIX}/video/${videoID}`,
            { headers }
        )
        return { success: true, data: response.data }
    }
    catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message }
    }
}



export const createNewQA = async (chat_uid, headers) => {
    try {
        const response = await axios.get(
            `${BASE_URL}${CHATS_PREFIX}/qa/${chat_uid}`,
            { headers }
        )
        return { success: true, data: response.data }
    }
    catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message };
    }
}