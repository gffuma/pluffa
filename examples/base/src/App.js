import { useEffect } from 'react'
import './App.css'
import logo from './logo.svg'
// import { babu } from 'babu'

export default function App() {
  // useEffect(() => {
  //   async function callBabu() {
  //     const b = await babu()
  //     console.log('__BABU__', b)
  //   }
  //   callBabu()
  // }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}
