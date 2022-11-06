import { StaticRouter } from 'react-router-dom/server'
import { useSSRRequest } from '@pluffa/ssr'
import App from './App'

export default function Server() {
  const { url } = useSSRRequest()
  return (
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
