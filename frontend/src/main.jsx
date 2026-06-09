import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './navbar.css'
import './search.css'
import './home.css'
import './busdetails.css'
import './seatselection.css'
import './forms.css'
import './profile-history.css'
import './chatbot.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
