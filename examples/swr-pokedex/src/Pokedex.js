import { Link } from 'react-router-dom'
import useSWR from 'swr'

export default function Pokedex() {
  const {
    data: { results: pokemons },
  } = useSWR('https://pokeapi.co/api/v2/pokemon')
  return (
    <div>
      {pokemons.map((pokemon) => (
        <div key={pokemon.name} className="pokemon-list-item">
          <Link to={`/pokemon/${pokemon.name}`}>
            <h2>{pokemon.name}</h2>
          </Link>
        </div>
      ))}
    </div>
  )
}
