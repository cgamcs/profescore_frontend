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
        apiKey: "oE5BeRE132yjhyikfDZF", // es mi API Key publica
        endpoint: "https://your-proxy-server.com"
      }}
    >
      <Router>
        <App />
      </Router>
    </FpjsProvider>
    
  </React.StrictMode>
)
