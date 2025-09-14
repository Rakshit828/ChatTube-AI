import axios from "axios";
import { BASE_URL } from "./config";

export async function userSignUp(userData) {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data?.detail || error.message };
  }
}

export async function userLogIn(userData) {
  try {
    const response = await axios.post(`${BASE_URL}/login`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response?.data?.detail || error.message };
  }
}
