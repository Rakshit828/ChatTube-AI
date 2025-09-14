import { useContext, useState } from "react";
import LoginPage from "./LoginPage.jsx";
import SignupPage from "./SignupPage.jsx";
import { AuthContext } from "../context/AuthContext.jsx";


const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { userLogIn } = useContext(AuthContext)

  return showLogin ? (
    <LoginPage
      switchToSignup={() => setShowLogin(false)}
      onLogin={userLogIn} // pass callback
    />
  ) : (
    <SignupPage
      switchToLogin={() => setShowLogin(true)}
      onLogin={userLogIn} // after signup, consider auto-login
    />
  );
};

export default AuthPage;
