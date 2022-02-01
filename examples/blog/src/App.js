import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import Home from './Home'
import Post from './Post'
import Secret from './Secret'

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:slug" element={<Post />} />
        <Route path="/secret" element={<Secret />} />
      </Routes>
    </Suspense>
  )
}
