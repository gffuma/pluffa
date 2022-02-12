import logo from './logo.svg'
/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react/macro'
import styled from '@emotion/styled/macro'

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Image = styled.img`
  height: 40vmin;
  pointer-events: none;
  animation: ${spin} infinite 20s linear;
`

export default function App() {
  return (
    <div
      css={css`
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
          'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
          'Helvetica Neue', sans-serif;
      `}
    >
      <h1
        css={css`
          color: hotpink;
        `}
      >
        Emotion + SNext.js = ❤️
      </h1>
      <Image src={logo} />
    </div>
  )
}
