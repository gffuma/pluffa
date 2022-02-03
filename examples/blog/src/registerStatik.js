import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import showdown from 'showdown'

export default function registerStatik(router) {
  router.get('/posts', async () => {
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
    return posts.concat({
      slug: 'hot',
      title: 'YEE',
    })
  })

  router.get('/posts/:slug', async ({ params }) => {
    const { slug } = params
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
    }
  })
}
