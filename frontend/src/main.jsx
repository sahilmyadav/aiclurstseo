import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './components/context/AuthContext'
import { GoogleBusinessProvider } from './components/context/GoogleBusinessContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <GoogleBusinessProvider>
          <App />
        </GoogleBusinessProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
