import { useContext } from "react";
import AuthPage from "./pages/AuthPage.jsx";
import { userLogIn } from "./api/auth.js";
import { AuthContext } from "./context/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import './App.css'

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <AuthPage onLogin={userLogIn} />;
  }

  return <HomePage />;
};

export default App;
