import './index.css'
import ReactDOM from 'react-dom'
import App from './App'

const hydrateRoot = (ReactDOM as any).hydrateRoot
hydrateRoot(document.getElementById('root'), <App />)
