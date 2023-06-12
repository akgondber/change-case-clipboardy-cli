import React from 'react';
import chalk from 'chalk';
import test from 'ava';
import {render} from 'ink-testing-library';
import changeCase from 'change-case';
import App, {initStore} from './source/app.js';

test.beforeEach(() => {
	initStore({source: '', method: ''});
});

const methods = [
	'camelCase',
	'capitalCase',
	'constantCase',
	'dotCase',
	'headerCase',
	'noCase',
	'paramCase',
	'pascalCase',
	'pathCase',
	'sentenceCase',
	'snakeCase',
];

test('displays message about methods naviagation', t => {
	const {lastFrame} = render(<App />);

	t.true(
		lastFrame().includes(`${chalk.bold('<tab>')} activates the next method`),
	);
});

test('displays source and result labels:', t => {
	const {lastFrame} = render(<App />);

	t.true(lastFrame().includes(`${chalk.italic('Source: ')}`));
	t.true(lastFrame().includes(`${chalk.italic('Result: ')}`));
});

const escapeRegExp = string => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

test('displays methods panel', t => {
	const {lastFrame} = render(<App str="foo_bar" />);
	const containsColoredMethod = (methodName, color, bgColor) => {
		t.regex(
			lastFrame(),
			new RegExp(escapeRegExp(chalk.bgHex(bgColor).hex(color)(methodName))),
		);
	};

	const methodBgColor = '#093145';
	const methodColor = '#ffffff';
	const activeMethodColor = '#fcf6f5';
	const activeMethodBgColor = '#9a2617';

	for (const item of methods) {
		const methodName = changeCase[item](item);
		containsColoredMethod(
			methodName,
			item === 'camelCase' ? activeMethodColor : methodColor,
			item === 'camelCase' ? activeMethodBgColor : methodBgColor,
		);
	}

	t.regex(lastFrame(), new RegExp(changeCase.pascalCase('pascalCase')));
});
