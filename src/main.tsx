import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './App.css';
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/patrick-hand/400.css";
import './styles/student.css'
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
