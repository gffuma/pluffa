import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { createRequire } from 'module'
import { RuleSetRule, RuleSetUseItem } from 'webpack'
import { B } from './utils.js'

const require = createRequire(import.meta.url)

export interface GetStyleRuleOptions {
  test: RegExp
  exclude?: RegExp
  isClient: boolean
  isProd: boolean
  useModules: boolean
  processors?: RuleSetUseItem[]
}

export function getWebPackStyleRule({
  test,
  exclude,
  isClient,
  isProd,
  useModules,
  processors = [],
}: GetStyleRuleOptions): RuleSetRule {
  const styleLoader: RuleSetUseItem | false = isClient
    ? isProd
      ? {
          loader: MiniCssExtractPlugin.loader,
        }
      : 'style-loader'
    : // Skip loading css on "runtime"
      false
  return {
    test,
    exclude,
    use: [
      styleLoader,
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: isClient ? useModules : {
            mode: useModules ? 'local' : undefined,
            exportOnlyLocals: true,
          },
        },
      },
      ...processors,
    ].filter(B),
  }
}

export interface GetWebPackRulesOptions {
  useTypescript: boolean
  isProd: boolean
  isClient: boolean
}

export function getWebPackRules({
  useTypescript,
  isProd,
  isClient,
}: GetWebPackRulesOptions): RuleSetRule[] {
  return [
    {
      oneOf: [
        // ... JS/TS ...
        {
          test: useTypescript ? /\.(js|mjs|jsx|ts|tsx)$/ : /\.(js|mjs|jsx)$/,
          exclude: /(node_modules)/,
          use: isClient
            ? // CLIENT BABEL
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    [
                      'react-app',
                      {
                        runtime: 'automatic',
                        flow: false,
                        typescript: useTypescript,
                      },
                    ],
                  ],
                  plugins: [
                    !isProd && require.resolve('react-refresh/babel'),
                  ].filter(Boolean),
                },
              }
            : // "RUNTIME" BABEL
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    useTypescript && '@babel/preset-typescript',
                    [
                      '@babel/preset-react',
                      {
                        runtime: 'automatic',
                      },
                    ],
                  ].filter(Boolean),
                  plugins: ['macros'],
                },
              },
        },
        // ... STYLES ...
        getWebPackStyleRule({
          isProd,
          isClient,
          useModules: true,
          test: /\.module.css$/i,
        }),
        getWebPackStyleRule({
          isProd,
          isClient,
          useModules: false,
          test: /\.css$/i,
          exclude: /\.module.css$/i,
        }),
        getWebPackStyleRule({
          isProd,
          isClient,
          useModules: true,
          test: /\.module\.s[ac]ss$/i,
          processors: ['sass-loader'],
        }),
        getWebPackStyleRule({
          isProd,
          isClient,
          useModules: false,
          test: /\.s[ac]ss$/i,
          exclude: /\.module\.s[ac]ss$/i,
          processors: ['sass-loader'],
        }),
        // ... ASSETS ...
        {
          test: /\.svg$/,
          use: [
            {
              loader: require.resolve('@svgr/webpack'),
              options: {
                prettier: false,
                svgo: false,
                svgoConfig: {
                  plugins: [{ removeViewBox: false }],
                },
                titleProp: true,
                ref: true,
              },
            },
            {
              loader: require.resolve('file-loader'),
              options: {
                emitFile: isClient,
                name: 'static/media/[name].[hash].[ext]',
              },
            },
          ],
          issuer: {
            and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
          },
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          type: 'asset',
          generator: {
            emit: isClient,
          },
          parser: {
            dataUrlCondition: {
              maxSize: 10000,
            },
          },
        },
        // NOTE: to import raw content use:
        // import helloContent from './hello.txt?raw'
        {
          exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          resourceQuery: { not: [/raw/] },
          type: 'asset/resource',
          generator: {
            emit: isClient,
          },
        },
        {
          exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          resourceQuery: /raw/,
          type: 'asset/source',
        },
      ],
    },
  ]
}
