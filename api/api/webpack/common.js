const path = require("path");

module.exports.entry = path.join(__dirname, '..', 'src', 'app.ts');

module.exports.output = {
    path: path.join(__dirname, '..', 'build'),
    filename: 'app.js',
    libraryTarget: 'commonjs'
}
module.exports.resolve = {
    modules: [
        'node_modules',
        path.join(__dirname, '..', 'node_modules')
    ],
    extensions: [ '.ts', '.js', '.json' ]
}
