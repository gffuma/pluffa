import request from 'superagent'

export function getPokemons() {
  console.log('~API POKEMONS~')
  return request.get(`https://pokeapi.co/api/v2/pokemon`).then((r) => r.body)
}

export function getPokemon(name: string) {
  console.log('~ API POKEMON ~', name)
  return request
    .get(`https://pokeapi.co/api/v2/pokemon/${name}/`)
    .then((r) => r.body)
}
