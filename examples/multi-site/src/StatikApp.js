import AdminApp from './AdminApp'
import App from './App'

export default function StatikApp({ url }) {
  const app = url.startsWith('/admin') ? 'admin' : 'main'
  if (app === 'admin') {
    return <AdminApp />
  }
  return <App />
}

export function getSkeletonProps({ url }) {
  return {
    props: {
      url,
    },
  }
}
