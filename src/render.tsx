import React, { ComponentType } from 'react'
import streamBuffers from 'stream-buffers'
import ReacDOMServer from 'react-dom/server'
const { renderToString } = ReacDOMServer

const renderToPipeableStream = (ReacDOMServer as any)
  .renderToPipeableStream as (
  element: Element,
  options?: {
    onCompleteAll?(): void
    onError?(err: any): void
  }
) => {
  pipe(stream: any): void
}
export interface SnextProps {
  /**
   * URL of incoming request
   */
  url: string

  /**
   * List of entrypoints file names
   */
  entrypoints: string[]
}

export interface AppProps {
  /**
   * URL of incoming request
   */
  url: string
}

export interface SkeletonProps<InitialData> {
  /**
   * List of entrypoints file names
   */
  entrypoints: string[]

  /**
   * Rendered html of app
   */
  appHtml: string

  /**
   * Data to inject from <App /> static method + result of side effects XD
   */
  initialData?: InitialData
}

export type AppComponent<Props, InitialData> = ComponentType<
  Props & AppProps
> & {
  /**
   * Called before each request.
   * Get the static props to inject into the App Component.
   */
  getStaticProps?(props: SnextProps):
    | Promise<{
        props: Props
      }>
    | { props: Props }

  /**
   * Callend after the <App /> component has fully rendered.
   * Get the initial data to inject into <Skeleton />.
   */
  getInitialData?(
    props: SnextProps,
    initialProps?: Props
  ):
    | Promise<{
        initialData: InitialData
      }>
    | { initialData: InitialData }
}

export default async function render<Props, InitialData>(
  {
    App,
    Skeleton,
  }: {
    App: AppComponent<Props, InitialData>
    Skeleton: ComponentType<SkeletonProps<InitialData>>
  },
  props: SnextProps
): Promise<string> {
  const out = new streamBuffers.WritableStreamBuffer()

  return new Promise(async (resolve, reject) => {
    let didError = false
    let initialProps: Props | undefined
    if (App.getStaticProps) {
      const result = await App.getStaticProps(props)
      initialProps = result.props
    }
    const { pipe } = renderToPipeableStream(
      <App url={props.url} {...initialProps!} />,
      {
        onCompleteAll() {
          if (didError) {
            return
          }
          out.on('finish', async () => {
            const appHtml = out.getContentsAsString() as string
            let initialData: InitialData | undefined
            if (typeof App.getInitialData === 'function') {
              const result = await App.getInitialData(props, initialProps)
              initialData = result.initialData
            }
            resolve(
              renderToString(
                <Skeleton
                  entrypoints={props.entrypoints}
                  appHtml={appHtml}
                  initialData={initialData}
                />
              )
            )
          })
          pipe(out)
        },
        onError(err) {
          didError = true
          reject(err)
        },
      }
    )
  })
}
