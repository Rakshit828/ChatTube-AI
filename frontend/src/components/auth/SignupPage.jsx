import { useState, useContext } from "react";
import AuthForm from "../AuthForm.jsx";
import InputField from "../InputField.jsx";
import { AuthContext } from '../../context/AuthContext.jsx'
import Spinner from "../Spinner.jsx";

const SignupPage = ({ switchToLogin, onLogin }) => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setIsAuthenticated, userSignUp, isLoading, setIsLoading } = useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password
    }
    setIsLoading(true);
    const { success, data } = await userSignUp(userData);
    if (success) {
      const response = await onLogin({ email: userData.email, password: userData.password })
      setIsLoading(false);
      if (response.success) {
        setIsAuthenticated(true);
      }
    } else {
      console.error(error)
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
      <InputField
        label="First Name"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Your name"
      />
      <InputField
        label="Last Name"
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Your name"
      />
      <InputField
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your name"
      />
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

export default SignupPage;
