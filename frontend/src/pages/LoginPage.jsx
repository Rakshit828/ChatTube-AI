import { useState, useContext } from "react";
import AuthForm from "../components/auth/AuthForm.jsx";
import InputFormField from "../components/auth/InputFormField.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

const LoginPage = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, setIsAuthenticated, isLoading, setAccessToken } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    const result = await login({ email, password });
    if (result.success) {
      setIsAuthenticated(true);
      setAccessToken(result.data?.access_token)
    } else {
      setError(result.data);
      setIsAuthenticated(false);
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
      <InputFormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputFormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <div className="text-red-800">{error}</div>}
      {isLoading && <Spinner />}
    </AuthForm>
  );
};

export default LoginPage;
