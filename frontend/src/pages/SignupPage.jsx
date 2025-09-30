import { useState } from "react";
import AuthForm from "../components/auth/AuthForm.jsx";
import InputFormField from "../components/auth/InputFormField.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import useApiCall from "../hooks/useApiCall.jsx";
import { userSignUp } from "../api/auth.js";

const SignupPage = ({ switchToLogin }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   
  const {
    isLoading,
    isError,
    errorMsg,
    handleApiCall: handleSignUp
  } = useApiCall(userSignUp, [firstName, lastName, username, email, password])

  // Implementation of autologin is remaining
  return (
    <AuthForm
      title="Create Your Account"
      onSubmit={handleSignUp}
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

      {isError && <div className="text-red-800">{errorMsg}</div>}
      {isLoading && <Spinner />}
    </AuthForm> 
  );
};

export default SignupPage;
