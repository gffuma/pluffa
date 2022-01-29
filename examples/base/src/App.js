import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import { Suspense } from 'react'

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Suspense>
  )
}
