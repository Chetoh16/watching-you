import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './services/supabase'

// Called "context"
import{BrowserRouter} from "react-router-dom"

import './css/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Allows to change components to render on screen based on the / root we will go to */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
