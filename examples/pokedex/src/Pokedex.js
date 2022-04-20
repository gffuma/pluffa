import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import request from 'superagent'

export default function Pokedex() {
  const {
    data: { results: pokemons },
  } = useQuery('pokemons', () =>
    request.get(`https://pokeapi.co/api/v2/pokemon`).then((r) => r.body)
  )

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
