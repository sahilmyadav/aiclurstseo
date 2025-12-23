import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './components/context/AuthContext';
import { GoogleBusinessProvider } from './components/context/GoogleBusinessContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthContextProvider>
          <GoogleBusinessProvider>
            <App />
          </GoogleBusinessProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)