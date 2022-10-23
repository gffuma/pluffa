import { createElement } from 'react'
import { useSSRBundleInfo, useSSRContext } from './server'

export function Root() {
  const ctx = useSSRContext()
  if (ctx && ctx.Server) {
    return createElement(ctx.Server)
  }
  return null
}

export type ScriptsProps = { entry?: string } & Omit<
  React.DetailedHTMLProps<
    React.ScriptHTMLAttributes<HTMLScriptElement>,
    HTMLScriptElement
  >,
  'src'
>

export function Scripts({ entry = 'main', ...props }: ScriptsProps) {
  const bundle = useSSRBundleInfo()
  return (
    <>
      {bundle.entrypoints[entry]
        .filter((e) => e.endsWith('.js'))
        .map((e) => (
          <script key={e} src={`/${e}`} {...props} />
        ))}
    </>
  )
}

export type StylesProps = { entry?: string } & Omit<
  React.DetailedHTMLProps<
    React.LinkHTMLAttributes<HTMLLinkElement>,
    HTMLLinkElement
  >,
  'href'
>

export function Styles({ entry = 'main', ...props }: StylesProps) {
  const bundle = useSSRBundleInfo()
  return (
    <>
      {bundle.entrypoints[entry]
        .filter((e) => e.endsWith('.css'))
        .map((e) => (
          <link key={e} href={`/${e}`} {...props} rel="stylesheet" />
        ))}
    </>
  )
}
