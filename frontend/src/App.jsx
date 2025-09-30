import AuthPage from "./pages/AuthPage.jsx";
import { userLogIn } from "./api/auth.js";
import HomePage from "./pages/HomePage.jsx";
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {


  if (!isAuthenticated) {
    return <AuthPage onLogin={userLogIn} />;
  }

  return <HomePage />;
};

export default App;
