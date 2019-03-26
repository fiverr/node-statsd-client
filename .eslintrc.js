module.exports = {
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	env: {
		node: true,
		es6: true,
	},
	extends: 'eslint:recommended',
	rules: {
		indent: [
			'error', 'tab', {
				SwitchCase: 1,
				FunctionDeclaration: {
					body: 1,
					parameters: 2,
				},
			},
		],
		semi: ['error', 'always'],
		'arrow-parens': [2, 'as-needed'],
		'comma-dangle': ['error', 'always-multiline'],
		quotes: ['error', 'single'],
		'dot-location': ['error', 'property'],
		'dot-notation': 'error',
		'no-implicit-globals': 'error',
	},
	overrides: [
		{
			files: [ '**/spec.js' ],
			env: {
				mocha: true,
			},
			globals: {
				expect: true,
				assert: true,
				wait: true,
			},
		},
	],
};
