import { useState } from 'react'
import './App.css'
import image from './j.jpg'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <img src={image} />
      <div>hello</div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}
