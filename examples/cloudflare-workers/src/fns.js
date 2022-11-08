import { Router } from "itty-router";

const router = Router({ base: '/x/fns' })

router.get('/', (req) => {
  return [
    {
      id: 23,
      title: 'lol'
    }
  ]
})

export default router.handle