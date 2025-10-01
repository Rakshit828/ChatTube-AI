import axios from "axios";
import { BASE_URL, AUTH_PREFIX } from "./config";

export async function userSignUp(userData) {
  try {
    const response = await axios.post(`${BASE_URL}${AUTH_PREFIX}/signup`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, status_code: error.response?.status, data: error.response?.data?.detail || error.message };
  }
}


export async function userLogIn(userData) {
  try {
    const response = await axios.post(`${BASE_URL}${AUTH_PREFIX}/login`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, status_code: error.response?.status, data: error.response?.data?.detail || error.message };
  }
}

