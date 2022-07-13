import { ComponentType } from 'react'
import streamBuffers from 'stream-buffers'
import {
  RenderToPipeableStreamOptions,
  renderToString,
  renderToPipeableStream,
} from 'react-dom/server'

export interface PluffaProps {
  /**
   * URL of incoming request
   */
  url: string

  /**
   * List of entrypoints file names by webpack entry name
   */
  entrypoints: Record<string, string[]>
}

export interface AppProps {
  /**
   * URL of incoming request
   */
  url: string
}

export interface SkeletonProps {
  /**
   * List of entrypoints file names by webpack entry name
   */
  entrypoints: Record<string, string[]>

  /**
   * Rendered html of app
   */
  appHtml: string
}

export type GetStaticProps<Props = any> = (
  props: AppProps
) => { props: Props } | Promise<{ props: Props }>

export type GetSkeletonProps<StaticProps = any, Props = any> = (
  props: AppProps,
  staticProps: StaticProps
) => { props: Props } | Promise<{ props: Props }>

export type AppComponent<Props> = ComponentType<AppProps & Props>

export type SkeletonComponent<Props> = ComponentType<SkeletonProps & Props>

export default async function render<StaticProps, HydrateSkeletonProps>(
  {
    App,
    getStaticProps,
    getSkeletonProps,
    Skeleton,
    throwOnError = false,
    ...renderOptions
  }: {
    /**
     * The static App Component
     */
    App: AppComponent<StaticProps>
    /**
     * Called before each request.
     * Get the static props to inject into the App Component.
     */
    getStaticProps?: GetStaticProps<StaticProps>
    /**
     * Callend after the <App /> component has fully rendered.
     * Get the initial data to inject into <Skeleton />.
     */
    getSkeletonProps?: GetSkeletonProps<StaticProps, HydrateSkeletonProps>
    /**
     * The Skeleton Component
     */
    Skeleton: SkeletonComponent<HydrateSkeletonProps>

    /**
     * Shoudl throw promise on error
     */
    throwOnError?: boolean
  } & RenderToPipeableStreamOptions,
  props: PluffaProps
): Promise<string> {
  const out = new streamBuffers.WritableStreamBuffer()
  const { entrypoints, url } = props
  const appProps = { url }

  return new Promise(async (resolve, reject) => {
    let didError = false
    let staticProps: StaticProps | undefined
    if (getStaticProps) {
      const result = await getStaticProps(appProps)
      staticProps = result.props
    }
    const { pipe } = renderToPipeableStream(
      <App {...staticProps!} url={props.url} />,
      {
        ...renderOptions,
        onAllReady() {
          renderOptions?.onAllReady?.()
          if (didError && throwOnError) {
            return
          }
          out.on('finish', async () => {
            const appHtml = out.getContentsAsString() || ''
            let skeletonProps: HydrateSkeletonProps | undefined
            if (getSkeletonProps) {
              const result = await getSkeletonProps(appProps, staticProps!)
              skeletonProps = result.props
            }
            resolve(
              renderToString(
                <Skeleton
                  {...skeletonProps!}
                  entrypoints={entrypoints}
                  appHtml={appHtml}
                />
              )
            )
          })
          pipe(out)
        },
        onError(error) {
          didError = true
          renderOptions?.onError?.(error)
          if (throwOnError) {
            reject(error)
          }
        },
      }
    )
  })
}
