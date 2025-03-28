import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FpjsProvider
      loadOptions={{
        apiKey: import.meta.env.VITE_PUBLIC_KEY,
        endpoint: `${import.meta.env.VITE_BACKEND_URL}/fingerprint`
      }}
    >
      <Router>
        <App />
      </Router>
    </FpjsProvider>
    
  </React.StrictMode>
)
