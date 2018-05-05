var webpack = require('webpack');
const base = require('./webpack.config.js');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules').filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    }).forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = Object.assign({}, base, {
    output : Object.assign({}, base.output, {
        filename : 'key.js'
    }),
    node : {
        __dirname : true
    },
    target : 'node',
    externals : nodeModules
});