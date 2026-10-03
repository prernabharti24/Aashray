import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ShelterProvider } from './context/ShelterContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ShelterProvider>
      <App />
    </ShelterProvider>
  </React.StrictMode>
);
