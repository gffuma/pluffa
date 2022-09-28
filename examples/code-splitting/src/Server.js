import { StaticRouter } from 'react-router-dom/server'
import { useSSRUrl } from '@pluffa/ssr'
import App from './App'

export default function Server() {
  const url = useSSRUrl()
  return (
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
