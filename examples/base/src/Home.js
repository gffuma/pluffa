import fs from 'fs/promises'
import path from 'path'
import * as matter from 'gray-matter'
import { useQuery } from 'react-query'
import j from './j.jpg'

async function getPosts() {
  const ls = await fs.readdir(path.resolve(process.cwd(), 'content/posts'))
  const posts = []
  for (const pathname of ls) {
    const md = await fs.readFile(
      path.resolve(process.cwd(), 'content/posts', pathname),
      'utf-8'
    )
    const content = matter(md)
    posts.push(content.data)
  }
  return posts
}

function Post({ title, slug }) {
  return (
    <div>
      <h2>
        <a href={`/post/${slug}`}>{title}</a>
      </h2>
    </div>
  )
}

export default function Home() {
  const { data: posts } = useQuery('posts', () => {
    if (process.env.IS_SNEXT_SERVER) {
      return getPosts()
    }
  })

  return (
    <div>
      <h2>Posts</h2>
      <img src={j} />
      {posts.map((post) => (
        <Post {...post} key={post.slug} />
      ))}
    </div>
  )
}
