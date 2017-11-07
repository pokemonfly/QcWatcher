var webpack = require( 'webpack' )

var cfg = {
    entry: './src/index.js',
    output: {
        path: './dist/',
        filename: 'qc-watcher.js'
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    plugins: [
                        'transform-runtime', "transform-class-properties", 'transform-decorators-legacy'
                    ],
                    presets: [
                        'es2015',
                        'stage-0',
                        [
                            'env', {
                                'targets': {
                                    'node': 4
                                }
                            }
                        ]
                    ]
                }
            }
        ]
    }
}
if ( process.env.NODE_ENV == 'prod' ) {
    cfg.plugins = [
        new webpack.optimize.OccurrenceOrderPlugin( ),
        new webpack.optimize.DedupePlugin( ),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                unused: true,
                dead_code: true,
                warnings: false
            }
        })
    ]
}
module.exports = cfg
