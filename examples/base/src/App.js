import { useState } from 'react'
import './App.css'
import image from './j.jpg'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <img className="banner" src={image} />
      <div>G A N G !</div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}
