const { resolve } = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const entry = {
    app: "./src/entry.js"
};
const output = {
    path: resolve(__dirname, "dist"),
    filename: "assets/js/[name].bundle.js",
    chunkFilename: "assets/js/[name].bundle.js"
    // publicPath: "/"
};

module.exports = {
    entry: entry,
    output: output,
    plugins: [
        new CleanWebpackPlugin({
            verbose: true
        }),
        new CopyPlugin([
                {
                    from: "src/static/",
                    to: "assets/[path][name].[ext]",
                }
            ],
            // {copyUnmodified: true}
            {logLevel: "debug", copyUnmodified: true}
        ),
        // new ImageminPlugin({
        //     test: /\.(jpe?g|png|gif|svg)$/i,
        //     optipng: {
        //         optimizationLevel: 5
        //     }
        // }),
        // new CopyPlugin([
        //     {
        //         from: "src/static/",
        //         to: "assets/",
        //         copyUnmodified: true
        //     },
        // ]),
        new HtmlWebpackPlugin({
            title: "Production",
            template: "./src/_pug/index.pug"
        }),
        new MiniCssExtractPlugin({
            filename: "assets/css/[name].css",
            chunkFilename: "assets/css/[name].css"
        }),
        new BrowserSyncPlugin({
            host: "localhost",
            port: 3000,
            files: "",
            server: {
                baseDir: resolve(__dirname, "dist"),
            }
        }),
    ],
    optimization: {
        minimizer: [
          new UglifyJsPlugin({
            test: /\.js(\?.*)?$/i,
          }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.m?js$/, exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-proposal-class-properties"]
                    }
                }
            },
            {
                test: /\.pug$/,
                use: ["pug-loader"]
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: process.env.NODE_ENV === "development",
                        reloadAll: true,
                    },
                }, "css-loader", "postcss-loader", "sass-loader"],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        name: "[path][name].[ext]",
                        context: resolve(__dirname, "src/"),
                        useRelativePaths: true
                    }
                }]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ["file-loader"]
            },
            {
                test: /\.xml$/,
                use: ["xml-loader"]
            }
        ]
    }
};