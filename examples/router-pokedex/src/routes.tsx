import { QueryClient } from 'react-query'
import { prefetchPokemon, prefetchPokemons } from './hooks'
import { PageRouteObject } from '@pluffa/router'
import Pokedex from './Pokedex'
import Pokemon from './Pokemon'

export const routes: PageRouteObject<{ queryClient: QueryClient }>[] = [
  {
    path: '/',
    prefetchPage({ queryClient }) {
      prefetchPokemons(queryClient)
    },
    element: <Pokedex />,
  },
  {
    path: '/pokemon/:name',
    prefetchPage({ queryClient }, { params }) {
      prefetchPokemon(queryClient, params.name!)
      prefetchPokemon(queryClient, 'bulbasaur')
      prefetchPokemon(queryClient, 'rattata')
      prefetchPokemon(queryClient, 'pidgeotto')
    },
    element: <Pokemon />,
  },
]
