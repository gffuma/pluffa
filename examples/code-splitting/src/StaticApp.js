import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export default function StaticApp({ url }) {
  return (
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
