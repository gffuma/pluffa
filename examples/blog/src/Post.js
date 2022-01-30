import fs from 'fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import path from 'path'
import * as matter from 'gray-matter'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'

async function getPost(slug) {
  const md = await fs.readFile(
    path.resolve(process.cwd(), 'content/posts', `${slug}.md`),
    'utf-8'
  )
  const parsed = matter(md)

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(parsed.content)

  const html = String(file)

  return {
    ...parsed.data,
    html,
  }
}

export default function Post() {
  console.log('Post')
  const { slug } = useParams()
  const { data: post } = useQuery(['post', slug], () => {
    if (process.env.IS_SNEXT_SERVER) {
      return getPost(slug)
    }
  })

  return (
    <div>
      POST
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
    </div>
  )
}
