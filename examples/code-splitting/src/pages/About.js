import { useState } from 'react'

export default function About() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h1>About!</h1>
      <p>Some about text</p>
      <button onClick={() => setCount(count + 1)}>Commit today: {count}</button>
    </div>
  )
}
