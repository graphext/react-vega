const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: "./src/index.ts",
    devtool: 'source-map',
    output: {
        filename: "index.bundle.js",
        path: __dirname + "/dist",
        sourceMapFilename: '[file].map',
        library: 'ReactVega',
        libraryTarget: 'umd',
        umdNamedDefine: false
    },
    plugins: [
        new CleanWebpackPlugin()
    ],

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    configFile: 'tsconfig.prod.json'
                }
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "react",
        "react-dom": "reactDOM",
        "vega": "vega"
    }
};