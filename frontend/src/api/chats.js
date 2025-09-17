import axios from "axios";
import { BASE_URL } from "./config";


export const createNewChat = async (chatData, headers) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/newchat`,
            chatData,
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
            `${BASE_URL}/newchat/${chat_uid}`,
            chatData,
            { headers }
        )
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, data: error.response?.data?.detail || error.message };
    }
}


export const loadAllQAs = async ( chat_uid, headers) => {
    try{
        const response = await axios.get(
            `${BASE_URL}/qa/${chat_uid}`,
            { headers }
        )
        return { success: true, data: response.data }
    } 
    catch (error){
         return { success: false, data: error.response?.data?.detail || error.message };
    }
}