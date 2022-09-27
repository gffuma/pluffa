import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export default function Server({ url }) {
  return (
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
