const path = require('path');
const VuePlugin = require('rollup-plugin-vue').default;
const css = require('rollup-plugin-css-porter')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const { camelCase } = require('lodash')
const { name, dependencies } = require('../package.json')


const basePath = path.resolve(__dirname, '..');
const distPath = path.resolve(basePath, 'dist');
const entryPointPath = path.resolve(basePath, 'src/index')

// input options to export
const input = {
	input: entryPointPath,
	plugins: [
		VuePlugin(),
	    css(),
	    resolve({ external: ['vue'] }),
	    commonjs(),
	    babel({
	      plugins: ['external-helpers']
	    })
	]
	// TODO: add external
}

//output options to export
const output = [
	{
		exports: 'named',
		format: 'cjs',
		name: camelCase(name),
		file: path.resolve(distPath, name + '.common.js'),
		sourcemap: true
	},
	{
		exports: 'named',
		format: 'umd',
		name: camelCase(name),
		file: path.resolve(distPath, name + '.js'),
		sourcemap: true
	},
	{
		exports: 'named',
		format: 'es',
		name: camelCase(name),
		file: path.resolve(distPath, name + '.esm.js'),
		sourcemap: true
	}
]

module.exports = { input, output, distPath }
