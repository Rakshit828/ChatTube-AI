import { useState, useContext } from "react";
import AuthForm from "../AuthForm.jsx";
import InputField from "../InputField.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import Spinner from "../Spinner.jsx"; // updated import

const LoginPage = ({ switchToSignup, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsAuthenticated, isLoading, setIsLoading } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await onLogin({ email, password });
    setIsLoading(false);

    if (response.success) {
      setIsAuthenticated(true);
    } else {
      console.error(response.error);
    }
  };

  return (
    <AuthForm
      title="Login to Your Account"
      onSubmit={handleLogin}
      submitText="Login"
      extraText="Don't have an account?"
      extraLinkText="Sign Up"
      onExtraLinkClick={switchToSignup}
    >
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
      />
      {isLoading && <Spinner />}
    </AuthForm>
  );
};

export default LoginPage;
