import { useState } from "react";
import AuthForm from "../components/auth/AuthForm.jsx";
import InputFormField from "../components/auth/InputFormField.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import userLogIn from "../api/auth.js";


const LoginPage = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    isLoading, 
    isError, 
    errorMsg, 
    handleApiCall: handleLogin
  } = useApiCall(userLogIn, [{email: email, password: password}])


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

      {isError && <div className="text-red-800">{errorMsg}</div>}
      {isLoading && <Spinner />}
    </AuthForm>
  );
};

export default LoginPage;
