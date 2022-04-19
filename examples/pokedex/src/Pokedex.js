import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useCrawl } from 'snext/crawl'
import request from 'superagent'

// useCrawl()

export default function Pokedex() {
  const {
    data: { results: pokemons },
  } = useQuery('pokemons', () =>
    request.get(`https://pokeapi.co/api/v2/pokemon`).then((r) => r.body)
  )
  useCrawl()
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
