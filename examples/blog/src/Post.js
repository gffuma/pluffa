import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import statik from '@pluffa/statik'

export default function Post() {
  const { slug } = useParams()
  const { data: post } = useQuery(['post', slug], () =>
    statik(`/posts/${slug}`)
  )

  return (
    <div>
      <Helmet>
        <title>{`De Blog | ${post.title}`}</title>
      </Helmet>
      <Link to="/">Back</Link>
      <h2 data-crawl-url="/Dr4g0">{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
    </div>
  )
}
