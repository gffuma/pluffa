import { Suspense, useState } from 'react'
import { useQuery } from 'react-query'

function Babu() {
  const pokemons = useQuery(['pokedex'], () =>
    fetch(`https://pokeapi.co/api/v2/pokemon`).then((r) => r.json())
  )
  const [counter, setCounter] = useState(0)
  return (
    <div>
      <button onClick={() => setCounter(counter + 1)}>{counter} X</button>
      <h1>Pokedex Worker Gang</h1>
      <pre>{JSON.stringify(pokemons.data, null, 2)}</pre>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <Babu />
    </Suspense>
  )
}
