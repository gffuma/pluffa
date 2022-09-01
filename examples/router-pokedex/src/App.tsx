import './App.css'
import { Suspense } from 'react'
import { PageRoutes } from '@pluffa/router'

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageRoutes />
    </Suspense>
  )
}
