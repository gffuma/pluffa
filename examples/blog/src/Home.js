import { useQuery } from 'react-query'
import jolteon from './jolteon.jpg'
import { ReactComponent as Rocket } from './rocket.svg'
import statik from 'snext/statik'
import { Link } from 'react-router-dom'

function Post({ title, slug }) {
  return (
    <div>
      <h2>
        <Link to={`/post/${slug}`}>{title}</Link>
      </h2>
    </div>
  )
}

export default function Home() {
  const { data: posts } = useQuery('posts', () => statik('/posts'))

  return (
    <div>
      <h1>An ugly Blog</h1>
      <Rocket height={50} />
      <a href="http://github.com/gffuma">It's me!</a>
      <img className="banner" src={jolteon} />
      {posts.map((post) => (
        <Post {...post} key={post.slug} />
      ))}
    </div>
  )
}
