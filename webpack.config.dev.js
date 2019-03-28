const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: "development",
    entry: "./demo/src/main.tsx",
    output: {
        filename: "main_bundle.js",
        path: path.resolve(__dirname, "/demo/dist")
    },
    plugins: [new HtmlWebpackPlugin()],

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    devServer: {
        contentBase: './demo/dist',
        port: 9009
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

            { test: /.css$/, use: [
                // style-loader
                { loader: 'style-loader' },
                // css-loader
                {
                  loader: 'css-loader',
                  options: {
                    modules: true
                  }
                }
              ] }
        ]
    }
};