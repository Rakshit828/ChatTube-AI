import axios from 'axios';
const BASE_URL = 'http://127.0.0.1:8000'


export async function userSignUp(userData) {
    try {
        const response = await axios.post(`${BASE_URL}/signup`, userData);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error during signup:", error);
        return { success: false, error: error.response?.data || error.message };
    }
}


export async function userLogIn(userData) {
    try {
        const response = await axios.post(`${BASE_URL}/login`, userData);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error during signup:", error);
        return { success: false, error: error.response?.data || error.message };
    }
}

