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
  const postCssLoader: RuleSetUseItem | false = isClient
    ? {
        loader: require.resolve('postcss-loader'),
        // NOTE: Stolen from https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/webpack.config.js
        options: {
          postcssOptions: {
            ident: 'postcss',
            config: false,
            plugins: [
              'postcss-flexbugs-fixes',
              [
                'postcss-preset-env',
                {
                  autoprefixer: {
                    flexbox: 'no-2009',
                  },
                  stage: 3,
                },
                // Adds PostCSS Normalize as the reset css with default options,
                // so that it honors browserslist config in package.json
                // which in turn let's users customize the target behavior as per their needs.
                'postcss-normalize',
              ],
            ],
          },
          sourceMap: isProd,
        },
      }
    : // Skip post css on "runtime"
      false
  return {
    test,
    exclude,
    use: [
      styleLoader,
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: isClient
            ? useModules
            : {
                mode: useModules ? 'local' : undefined,
                exportOnlyLocals: true,
              },
        },
      },
      postCssLoader,
      ...processors,
    ].filter(B),
  }
}

export interface GetWebPackCodeRulesOptions {
  useTypescript: boolean
  isProd: boolean
  isClient: boolean
  useSwc: boolean
}

export function getWebPackCodeRules({
  useTypescript,
  useSwc,
  isClient,
  isProd,
}: GetWebPackCodeRulesOptions): RuleSetRule {
  if (isClient) {
    // JavaScript running in the broswer
    if (useSwc) {
      // Experiment using swc for speed up compilation step
      return {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: useTypescript ? 'typescript' : 'ecmascript',
              tsx: true,
              jsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
                refresh: !isProd,
              },
            },
          },
        },
      }
    } else {
      // Old good babel
      return {
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
          plugins: [!isProd && require.resolve('react-refresh/babel')].filter(
            Boolean
          ),
        },
      }
    }
  } else {
    // JavaScript running in runtime like Node, Deno, Bun, CF Workers ecc
    if (useSwc) {
      // Experiment using swc for speed up compilation step
      return {
        loader: 'swc-loader',
        options: {
          jsc: {
            target: 'es2016',
            parser: {
              syntax: useTypescript ? 'typescript' : 'ecmascript',
              tsx: true,
              jsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
      }
    } else {
      // Old good babel
      return {
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
      }
    }
  }
}

export interface GetWebPackRulesOptions {
  useTypescript: boolean
  isProd: boolean
  isClient: boolean
  useSwc: boolean
}

export function getWebPackRules({
  useTypescript,
  isProd,
  isClient,
  useSwc,
}: GetWebPackRulesOptions): RuleSetRule[] {
  return [
    {
      oneOf: [
        // ... JS/TS ...
        {
          test: useTypescript ? /\.(js|mjs|jsx|ts|tsx)$/ : /\.(js|mjs|jsx)$/,
          exclude: /(node_modules)/,
          use: getWebPackCodeRules({
            isClient,
            isProd,
            useTypescript,
            useSwc,
          }),
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
