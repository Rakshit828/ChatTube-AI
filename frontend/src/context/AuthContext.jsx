import React, { createContext, useState } from "react";
import { userLogIn, userSignUp } from "../api/auth";

export const AuthContext = createContext();

const BASE_URL = 'http://127.0.0.1:8000'

export const AuthProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    return (
        <AuthContext.Provider value={{ userSignUp, userLogIn, isAuthenticated, setIsAuthenticated, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
