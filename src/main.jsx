import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NotificationProvider } from './context/NotificationContext';


const google_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <GoogleOAuthProvider clientId={google_id}>
          <App />
        </GoogleOAuthProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
)
