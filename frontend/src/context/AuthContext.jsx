import React, { createContext, useRef, useState } from "react";
import { userLogIn, userSignUp } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [accessToken, setAccessToken] = useState("");

  const signup = async (userData) => {
    setIsLoading(true);
    const result = await userSignUp(userData);
    setIsLoading(false);
    return result;
  };

  const login = async (userData) => {
    setIsLoading(true);
    const result = await userLogIn(userData);
    setIsLoading(false);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{ signup, login, isAuthenticated, setIsAuthenticated, isLoading, accessToken}}
    >
      {children}
    </AuthContext.Provider>
  );
};
