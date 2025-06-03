import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NotificationProvider } from './context/NotificationContext';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <GoogleOAuthProvider clientId="52840799545-9uk0d6pclru5norrsdm936v981vnimj0.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
)
