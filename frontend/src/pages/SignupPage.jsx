import { useState, useContext } from "react";
import AuthForm from "../components/auth/AuthForm.jsx";
import InputFormField from "../components/auth/InputFormField.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

const SignupPage = ({ switchToLogin }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { signup, login, setIsAuthenticated, isLoading, setAccessToken } =
    useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const userData = { firstName, lastName, username, email, password };

    const signupResult = await signup(userData);
    if (signupResult.success) {
      const loginResult = await login({ email, password });
      if (loginResult.success) {
        setIsAuthenticated(true);
        setAccessToken(loginResult.data?.access_token)
      } else {
        setError(loginResult.data);
        setIsAuthenticated(false);
      }
    } else {
      setError(signupResult.data);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthForm
      title="Create Your Account"
      onSubmit={handleSignup}
      submitText="Sign Up"
      extraText="Already have an account?"
      extraLinkText="Login"
      onExtraLinkClick={switchToLogin}
    >
      <InputFormField label="First Name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <InputFormField label="Last Name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <InputFormField label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      <InputFormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputFormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <div className="text-red-800">{error}</div>}
      {isLoading && <Spinner />}
    </AuthForm>
  );
};

export default SignupPage;
