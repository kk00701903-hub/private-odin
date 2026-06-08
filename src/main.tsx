import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        console.info('[ODIN PWA] Service worker registered:', swUrl)
      }
    },
    onRegisterError(error) {
      console.warn('[ODIN PWA] Service worker registration failed:', error)
    },
  })
}

createRoot(document.getElementById('root')!).render(<App />)
