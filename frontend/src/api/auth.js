import axios from "axios"
import { BASE_URL, AUTH_PREFIX, handleRequest } from "./base"

export const userSignUp = (userData) =>
  handleRequest(() => axios.post(`${BASE_URL}${AUTH_PREFIX}/signup`, userData))

export const userLogIn = (userData) =>
  handleRequest(() => axios.post(`${BASE_URL}${AUTH_PREFIX}/login`, userData))

export const handleRefreshToken = (headers) =>
    handleRequest(() => axios.get(`${BASE_URL}${AUTH_PREFIX}/refresh`, { headers }))
