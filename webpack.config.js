const path = require('path');
const jsdoc = require('jsdoc-webpack-plugin');
const copy = require('copy-webpack-plugin');
const eslint = require('eslint-webpack-plugin');

module.exports = [
    {
        name: "core",
        experiments : {
            outputModule: true
        },
        entry: { 
            'arcs' : {
                import : './src/arcs.js',
            },
        },
        mode: 'none',
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'build'),
            library: {
                type: 'module',
            }
        },
        module: {
            parser: {
                javascript: {
                    commonjsMagicComments: true
                }
            }
        },
        plugins: [
            new eslint({}),
            new copy({
                patterns: [
                    { from :'src/arcs_browser.js', to: 'arcs_browser.js'},
                    { from: 'src/arcs_node.mjs', to: 'arcs_node.mjs'}
                ]
            })
        ]
    },
    {
        name: "core-min",
        experiments : {
            outputModule: true
        },
        entry: { 
            'arcs' : {
                import : './src/arcs.js',
            },
        },
        mode: 'production',
        output: {
            filename: '[name].min.js',
            path: path.resolve(__dirname, 'build'),
            library: {
                type: 'module',
            }
        },
        module: {
            parser: {
                javascript: {
                    commonjsMagicComments: true
                }
            }
        },
    },
    {
        name: "doc",
        mode: "development",
        entry: {},
        output: {
            path: path.resolve(__dirname, 'docs')
        },
        plugins: [
            new jsdoc({
                conf: 'docs/engine.conf.json',
                destination:  'docs/engine',
                preserveTmpFile: false,
                template: 'docs/arcs',            
            })
        ]
    }
];

