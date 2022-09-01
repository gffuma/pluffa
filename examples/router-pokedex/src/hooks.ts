import { QueryClient, useQuery } from 'react-query'
import { getPokemon, getPokemons } from './api'

export function prefetchPokemons(client: QueryClient) {
  client.prefetchQuery('pokemons', getPokemons)
}

export function usePokemons() {
  return useQuery('pokemons', getPokemons)
}

export function prefetchPokemon(client: QueryClient, name: string) {
  client.prefetchQuery(['pokemon', name], () => getPokemon(name))
}

export function usePokemon(name: string) {
  return useQuery(['pokemon', name], () => getPokemon(name))
}
