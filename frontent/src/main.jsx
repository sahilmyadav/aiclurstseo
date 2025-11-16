import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './components/context/AuthContext'
import { GoogleBusinessProvider } from './components/context/GoogleBusinessContext'
import { SubscriptionProvider } from './context/SubscriptionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <SubscriptionProvider>
          <GoogleBusinessProvider>
            <App />
          </GoogleBusinessProvider>
        </SubscriptionProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
