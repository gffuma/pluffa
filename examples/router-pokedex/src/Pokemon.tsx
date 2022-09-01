import { Link, useParams } from '@pluffa/router'
import { usePokemon } from './hooks'

export default function Pokemon() {
  const { name } = useParams()
  const { data: pokemon } = usePokemon(name!)
  usePokemon('bulbasaur')
  usePokemon('rattata')
  usePokemon('pidgeotto')
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
