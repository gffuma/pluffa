import { Link, useParams } from 'react-router-dom'
import useSWR from 'swr'
import S from './Pokemon.module.css'

export default function Pokemon() {
  const { name } = useParams()
  const { data: pokemon } = useSWR(`https://pokeapi.co/api/v2/pokemon/${name}/`)
  return (
    <div className="pokemon">
      <h2>
        <Link className="bk" to="/">
          {'<'}
        </Link>
      </h2>
      <h1>{name}</h1>
      <img className={S.PokemonImage} src={pokemon.sprites.back_default} />
      <br />
      <img src={pokemon.sprites.front_default} />
    </div>
  )
}
