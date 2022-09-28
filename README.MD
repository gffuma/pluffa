# Pluffa.js
> SSR & SSG For React Apps

- :package: Works out of the box with [Create React App](https://create-react-app.dev).
- :smiling_face_with_three_hearts: The developer experience you deserve: **Fast Refresh**, **HMR** both on client and server.
- :rocket: Use new React **Streaming Server Side Rendering** architecture.
- :gear: Also available for [Cloudflare Workers](https://workers.cloudflare.com).

## Why Pluffa.js?
There are already [Next.js](https://nextjs.org) and [Remix](https://remix.run) why i need **Pluffa**?

- First you can easily add **SSR** or **SSG** to an App built with *Create React App* with minimal effort.
- In second place **Pluffa** is not a **Framework** is more a **Build Tool**. The spirit of Pluffa is to be a Create React App but for server side rendering, your code, your choice ... but without the overhead of configuring all the build environment.

## Switch from Create React App

Install pluffa and pluffa node bindings.
```sh
yarn remove react-scripts
yarn add --dev pluffa @pluffa/node
```
or
```
npm remove react-scripts
npm install --save-dev pluffa @pluffa/node
```

Update field `"scripts"` in **package.json** ([See](README.MD#Commands) in depth all availables commands):

```json
"scripts": {
  "dev": "pluffa dev",
  "start": "pluffa start",
  "build": "pluffa build",
  "staticize": "pluffa staticize"
},
```

Create a configuration file ([See](README.MD#Configuration) in depth how configuration works):

```sh
touch pluffa.json
```

`pluffa.json`
```json
{
  "$schema": "https://cdn.giova.fun/pluffa/schema.json",
  "runtime": "node",
  "clientEntry": "./src/index.js",
  "serverComponent": "./src/App.js",
  "skeletonComponent": "./src/Skeleton.js"
}
```

The `Skeleton.js` is `index.html` of your SSR App:
`Skeleton.js`

```js
import { Root, Scripts, Styles } from '@pluffa/ssr/skeleton'

export default function Skeleton() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <Styles />
      </head>
      <body>
        <div id="root">
          <Root />
        </div>
        <Scripts />
      </body>
    </html>
  )
}
```

Yeah you did it!
:fire:

```sh
yarn dev
```
> **NOTE:** The above commands works also for TypeScript simple keep your `tsconfig.json` and use `.tsx` extensions.

## Templates
If you start with pluffa you can create a blank App with:

```sh
yarn create pluffa-app YourAppFolder
```
or
```sh
npx create-pluffa-app YourAppFolder
```

You can also specify a `--template` option, availables are:

- **node**: Base SSR Pluffa node template.
- **node-typescript**: Base SSR Pluffa node template but in TypeScript.

## Concepts

### Client Entry
The `clientEntry` is your client entrypoint this file will be the 

## Configuration

## Commands



## LICENSE

MIT
