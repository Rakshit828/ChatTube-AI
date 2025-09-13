import { useState, useEffect, useContext } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatArea from "./components/ChatArea.jsx";
import AuthPage from "./components/auth/AuthPage.jsx"; // new auth wrapper
import { userLogIn } from "./api/auth.js";
import { AuthContext } from './context/AuthContext.jsx'


const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const {isAuthenticated} = useContext(AuthContext)
  
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isAuthenticated) {
    // show auth page if not logged in
    return <AuthPage onLogin={userLogIn} />;
  }


  // main app after authentication
  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar
        sidebar={sidebarOpen}
        setSidebar={setSidebarOpen}
        isMobile={isMobile}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out`}>
        <ChatArea />
      </div>
    </div>
  );
};

export default App;
