import './App.css'
import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Pokedex from './Pokedex'
import Pokemon from './Pokemon'
import statik from 'snext/statik'

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/pokemon/:name" element={<Pokemon />} />
      </Routes>
    </Suspense>
  )
}
