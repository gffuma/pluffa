import { Suspense, lazy } from 'react'
import { Link, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Qr = lazy(() => import('./pages/Qr'))

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/about">About</Link>
        {' | '}
        <Link to="/qr">Qr</Link>
      </header>
      <Suspense fallback={<div>Loading Y Route!</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/qr" element={<Qr />} />
        </Routes>
      </Suspense>
    </div>
  )
}
