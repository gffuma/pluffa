import fs from 'fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import path from 'path'
import showdown from 'showdown'
import * as matter from 'gray-matter'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'

async function getPost(slug) {
  const md = await fs.readFile(
    path.resolve(process.cwd(), 'content/posts', `${slug}.md`),
    'utf-8'
  )
  const parsed = matter(md)
  const converter = new showdown.Converter({
    strikethrough: true,
  })
  const html = converter.makeHtml(parsed.content)
  return {
    ...parsed.data,
    html,
    // content: parsed.content,
  }
}

export default function Post() {
  const { slug } = useParams()
  const { data: post } = useQuery(['post', slug], () => {
    if (process.env.IS_SNEXT_SERVER) {
      return getPost(slug)
    }
  })

  return (
    <div>
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
    </div>
  )
}
