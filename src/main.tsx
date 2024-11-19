import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ContextProvider } from './context/index.tsx'
import { Toaster } from 'react-hot-toast';

if (typeof global === 'undefined') {
  window.global = window;
}


createRoot(document.getElementById('root')!).render(
  <>
    <ContextProvider>
      <App />
      <Toaster />
    </ContextProvider>
  </>,
)
