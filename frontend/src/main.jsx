import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ChatProvider from './context/ChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ChatProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </ChatProvider>
  </AuthProvider>
)
