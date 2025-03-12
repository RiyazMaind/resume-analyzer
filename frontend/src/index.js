import React from 'react';
import ReactDOM from 'react-dom/client'; // Ensure correct import for React 18+
import './index.css'; // Ensure this path is correct
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot for React 18+
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);