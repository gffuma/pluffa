import './App.css'
import { Suspense } from 'react'
import { PageRoutes } from './lib'
// import { Routes, Route, useRoutes } from 'react-router-dom'
// import Pokedex from './Pokedex'
// import Pokemon from './Pokemon'

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageRoutes />
      {/* <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/pokemon/:name" element={<Pokemon />} />
      </Routes> */}
    </Suspense>
  )
}
