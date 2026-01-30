import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

 
// Import translation files
import enTranslation from './locales/en/translation.json'
import hnTranslation from './locales/hn/translation.json';
 
 
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation},
    hn: { translation: hnTranslation},
 
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});
 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
    <App />
  </React.StrictMode>,
);
 