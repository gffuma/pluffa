import fs from 'fs/promises'
import path from 'path'
import { useQuery } from 'react-query'

export default function Home() {
  const { data: posts } = useQuery('posts', async () => {
    if (process.env.IS_SNEXT_SERVER) {
      return JSON.parse(
        await fs.readFile(
          path.resolve(process.cwd(), 'src/posts.json'),
          'utf-8'
        )
      )
    }
  })

  return <div>{JSON.stringify(posts, null, 2)}</div>
}
