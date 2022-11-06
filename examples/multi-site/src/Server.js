import AdminApp from './AdminApp'
import { useSSRData } from '@pluffa/ssr'
import App from './App'

export default function Server() {
  const { appType } = useSSRData()
  if (appType === 'admin') {
    return <AdminApp />
  }
  return <App />
}

export function getServerData({ request }) {
  const appType = request.url.startsWith('/admin') ? 'admin' : 'main'
  return {
    data: {
      appType,
    },
  }
}
