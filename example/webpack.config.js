const path=require('path');


module.exports = {
    entry : './arcsapp.json',
    mode: "production",

    output: {
        path: path.resolve(__dirname, ''),
        filename: "loop_bundle.js"
    },
    module: {
        rules: [
            {
                test: /arcsapp\.json$/,
                rules: [{
                    loader: "val-loader",
                    options: {
                        executableFile: path.resolve( __dirname, "../src", "arcsapp_bundler.js"),
                        enginePath: "../build"
                    }
                }]
            },
            {
                test: /arcsapp\.json$/,
                //type: "asset/inline"
                type: "javascript/auto"
            }
        ]
    }

};
