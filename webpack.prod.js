const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const ImageminPlugin = require('imagemin-webpack-plugin').default;

const optimization = {
    splitChunks: {
        cacheGroups: {
            node_vendors: {
                test: /[\\/]node_modules[\\/]/,
                chunks: "initial",
                priority: 1,
                name: "vendor"
            }
        }
    }
};

module.exports = merge(common, {
    mode: "production",
    optimization: optimization,
    // devtool: "source-map"
    plugins: [
        new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            pngquant: {
                optimizationLevel: 5
            }
        })
    ]
});