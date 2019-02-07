const path = require("path");

module.exports = {
    entry: "./src/index-browser.ts",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ],
    },
    externals: {
        "noble": "noble",
        "noble-mac": "noble-mac"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "poweredup.js",
        path: path.resolve(__dirname, "dist", "browser")
    }
};