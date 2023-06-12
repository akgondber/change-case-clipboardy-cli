#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import clipboard from 'clipboardy';
import {includes, tryCatch} from 'rambda';
import * as changeCase from 'change-case';
import App, {methods, initStore} from './app.js';

const cli = meow(
	`
		Usage
		  $ change-case-clipboardy-cli

		Options
			--str Source string to be transformed
			--method Method to be used for transformartion of source string
			--exit Exit without running ui after copying a transformed string to clipboard

		Examples
		  $ change-case-clipboardy-cli --str MyBar --method snakeCase -e
		  Result: my_bar. Copied to clipboard!
		  $ change-case-clipboardy-cli -s bar_baz -m paramCase
	`,
	{
		importMeta: import.meta,
		flags: {
			method: {
				default: 'camelCase',
				shortFlag: 'm',
			},
			str: {
				isRequired: (flags, _input) => Boolean(flags.exit),
				shortFlag: 's',
			},
			exit: {
				type: 'boolean',
				shortFlag: 'e',
			},
		},
	},
);

const {str, method, exit} = cli.flags;
const methodName = changeCase.camelCase(method);

if (exit) {
	const transformAndCopyToClipboard = () => {
		if (!includes(methodName, methods)) {
			throw new Error(
				`Provided method is not supported. Supported methods are:\n${methods.join(
					', ',
				)}.`,
			);
		}

		const result = changeCase[methodName](str);

		clipboard.writeSync(result);
		console.log(`Result: ${result}. Copied to clipboard!`);
	};

	tryCatch(transformAndCopyToClipboard, error => {
		console.log(error.message);
	})();
} else {
	initStore({source: str, method: methodName});
	render(<App />);
}
