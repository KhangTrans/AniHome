import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#FF6B6B',
            borderRadius: 8,
          },
        }}
      >
        <App />
      </ConfigProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
