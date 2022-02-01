import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import request from 'superagent'

export default function Pokemon() {
  const { name } = useParams()
  const { data: pokemon } = useQuery(['pokemon', name], () =>
    request
      .get(`https://pokeapi.co/api/v2/pokemon/${name}/`)
      .then((r) => r.body)
  )
  return (
    <div className="pokemon">
      <h2>
        <Link className="bk" to="/">
          {'<'}
        </Link>
      </h2>
      <h1>{name}</h1>
      <img src={pokemon.sprites.back_default} />
      <br />
      <img src={pokemon.sprites.front_default} />
    </div>
  )
}
