import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import { Suspense } from 'react'
import Post from './Post'

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:slug" element={<Post />} />
      </Routes>
    </Suspense>
  )
}
