import './admin.css'
import { hydrateRoot } from 'react-dom/client'
import AdminApp from './AdminApp'

hydrateRoot(document.getElementById('root'), <AdminApp />)
