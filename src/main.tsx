import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/animated-borders.css'

const rootElement = document.getElementById('root') as HTMLElement
createRoot(rootElement).render(<App />)
