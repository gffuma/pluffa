import { Link } from 'react-router-dom'
import { usePokemons } from './hooks'

export default function Pokedex() {
  const {
    data: { results: pokemons },
  } = usePokemons()
  return (
    <div>
      {pokemons.map((pokemon: any) => (
        <div key={pokemon.name} className="pokemon-list-item">
          <Link
            to={`/pokemon/${pokemon.name}`}
            onClick={() => {
              console.log('Click')
            }}
          >
            <h2>{pokemon.name}</h2>
          </Link>
        </div>
      ))}
    </div>
  )
}
