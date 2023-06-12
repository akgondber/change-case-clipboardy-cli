import React from 'react';
import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware'; // eslint-disable-line n/file-extension-in-import
import {
	defaultTo,
	path,
	prop,
	lens,
	assoc,
	isNil,
	set,
	includes,
	reduce,
	join,
	take,
	takeLast,
	mergeWith,
} from 'rambda';
import {Text, Box, Newline, Spacer, useInput} from 'ink';
import TextInput from 'ink-text-input';
import clipboard from 'clipboardy';
import * as changeCase from 'change-case';
import RangeStepper from 'range-stepper';

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

const shortKeys = methods.map((_method, i) =>
	i < 9 ? String(i + 1) : String.fromCodePoint('a'.codePointAt(0) + i - 9),
);

const darkestIndigo = '#093145';
const statusColor = '#800080';
const whiteColor = '#ffffff';
const activeMethodColor = '#fcf6f5';
const activeMethodBgColor = '#9a2617';

const panelColors = {
	active: '#a0fc02',
	common: '#f0f0fc',
};

let useTransformStringStore;

const initTransformStringStore = (options = {}) => {
	options = mergeWith(
		defaultTo,
		{
			source: '',
			lastSubmitted: '',
			transformedString: '',
		},
		options,
	);
	useTransformStringStore = create(
		subscribeWithSelector((set, get) => ({
			...options,
			setMethod(value) {
				const newMethodStepper = get().methodStepper;
				newMethodStepper.setValue(methods.indexOf(value));
				set({methodStepper: newMethodStepper.dup()});
			},
			setMethodByIndex(index) {
				const newMethodStepper = get().methodStepper;
				newMethodStepper.setValue(index);
				set({methodStepper: newMethodStepper.dup()});
			},
			transformString: () =>
				set({
					transformedString: changeCase[methods[get().methodStepper.value]](
						get().lastSubmitted,
					),
				}),
			nextMethod: () =>
				set(() => ({
					methodStepper: get().methodStepper.next().dup(),
				})),
			previousMethod: () =>
				set(() => ({
					methodStepper: get().methodStepper.previous().dup(),
				})),
			setSource: newSource => set({source: newSource}),
			setLastSubmitted: value => set({lastSubmitted: value}),
			setTransformedString: value => set({transformedString: value}),
			clearSource: () => set({source: ''}),
		})),
	);
};

const initStore = ({source, method}) => {
	const currentMethodIndex =
		!isNil(method) && includes(method, methods) ? methods.indexOf(method) : 0;
	let copied = false;
	const methodStepper = new RangeStepper({
		max: methods.length - 1,
		current: currentMethodIndex,
	});

	if (isNil(source)) {
		initTransformStringStore({methodStepper});
	} else {
		const methodName = methods[currentMethodIndex];
		const transformedString = changeCase[methodName](source);

		initTransformStringStore({
			source,
			lastSubmitted: source,
			transformedString,
			methodStepper,
		});
		clipboard.writeSync(transformedString);
		copied = true;
	}

	initClipboardStore(copied);
};

const usePanelsStore = create((set, get) => ({
	mainPanelStepper: new RangeStepper({max: 1}),
	statusTextPrefix: '',
	activateNextPanel: () =>
		set({
			mainPanelStepper: get().mainPanelStepper.next().dup(),
		}),
	activatePreviousPanel: () =>
		set({
			mainPanelStepper: get().mainPanelStepper.previous().dup(),
		}),
}));

let useClipboardStore;
const initClipboardStore = (copied = false) => {
	useClipboardStore = create((set, get) => ({
		copied,
		markCopied: () => set({copied: true}),
		markUncopied: () =>
			set(state => {
				if (get().copied) return {copied: !true};
				return state;
			}),
		toggleCopied: () => set({copied: !get().copied}),
	}));
};

/* eslint-disable react/prop-types */
function BoldText({children}) {
	return <Text bold>{children}</Text>;
}
/* eslint-enable react/prop-types */

export {methods, initStore};

export default function App() {
	const usables = reduce(
		(acc, current) =>
			set(
				lens(prop(current), assoc(current)),
				useTransformStringStore(path(current)), // eslint-disable-line react-hooks/rules-of-hooks
				acc,
			),
		{},
		[
			'source',
			'setSource',
			'setMethod',
			'setMethodByIndex',
			'transformedString',
			'methodStepper',
			'lastSubmitted',
			'setLastSubmitted',
			'transformString',
			'nextMethod',
			'previousMethod',
		],
	);

	const mainPanelStepper = usePanelsStore(path('mainPanelStepper'));
	const activateNextPanel = usePanelsStore(path('activateNextPanel'));
	const activatePreviousPanel = usePanelsStore(path('activatePreviousPanel'));

	const copied = useClipboardStore(path('copied'));
	const markCopied = useClipboardStore(path('markCopied'));
	const markUncopied = useClipboardStore(path('markUncopied'));

	useTransformStringStore.subscribe(
		state => state.transformedString,
		value => {
			clipboard.writeSync(value);
			markCopied();
		},
	);
	useTransformStringStore.subscribe(path('source'), source => {
		if (source !== usables.lastSubmitted) {
			markUncopied();
		}
	});
	useTransformStringStore.subscribe(path('methodStepper'), _value => {
		usables.transformString();
	});
	const isMethodsPanelActive = () => mainPanelStepper.isCurrent(1);

	useInput((input, key) => {
		if (key.upArrow) {
			activateNextPanel();
		} else if (key.downArrow) {
			activatePreviousPanel();
		} else if (key.tab) {
			usables.nextMethod();
		} else if (isMethodsPanelActive()) {
			if (key.rightArrow) usables.nextMethod();
			if (key.leftArrow) usables.previousMethod();
			if (shortKeys.includes(input))
				usables.setMethodByIndex(shortKeys.indexOf(input));
		}
	});

	const onSourceChange = value => {
		usables.setSource(value);
	};

	const getPanelBorderColor = index => {
		return mainPanelStepper.value === index
			? panelColors.active
			: panelColors.common;
	};

	const getPanelWidth = () => process.stdout.columns / (3 / 2); // eslint-disable-line n/prefer-global/process

	return (
		<Box flexDirection="column">
			<Box
				width={getPanelWidth()}
				borderStyle="single"
				borderColor={getPanelBorderColor(0)}
			>
				<Text italic>Source: </Text>

				<TextInput
					value={usables.source}
					focus={mainPanelStepper.value === 0}
					onChange={onSourceChange}
					onSubmit={value => {
						usables.setLastSubmitted(value);
						usables.transformString();
					}}
				/>
				<Spacer />
				<Text italic>Result: </Text>
				<Text>{usables.transformedString}</Text>
			</Box>

			<Newline />

			<Box width={getPanelWidth()}>
				<Text>
					<BoldText>{'<tab>'}</BoldText> activates the next method
				</Text>
				<Spacer />
				<Text>
					<BoldText>↑</BoldText> and <BoldText>↓</BoldText> - activates the next
					panel
				</Text>
			</Box>

			<Box
				width={getPanelWidth()}
				marginTop={1}
				flexWrap="wrap"
				rowGap={1}
				columnGap={1}
				justifyContent="space-around"
				borderStyle="single"
				borderColor={getPanelBorderColor(1)}
			>
				{methods.map((methodName, i) => (
					<Box key={methodName} paddingX={1}>
						<Text
							backgroundColor={
								usables.methodStepper.isCurrent(i)
									? activeMethodBgColor
									: darkestIndigo
							}
							color={
								usables.methodStepper.isCurrent(i)
									? activeMethodColor
									: whiteColor
							}
						>
							{(isMethodsPanelActive() ? `${shortKeys[i]}) ` : '') +
								changeCase[methodName](methodName)}
						</Text>
					</Box>
				))}
			</Box>

			<Spacer />

			<Box marginTop={1} width={getPanelWidth()}>
				{isMethodsPanelActive() ? (
					<Text>
						<BoldText> ←</BoldText>,<BoldText> →</BoldText>,
						<BoldText> {join(',', take(2, shortKeys))}</BoldText>
						..
						<BoldText>{join(',', takeLast(2, shortKeys))} </BoldText>
						activates appropriate method
					</Text>
				) : (
					<Text>
						Press<BoldText>{'<Enter>'}</BoldText> to submit
					</Text>
				)}
				<Spacer />
				<Text color={whiteColor} backgroundColor={statusColor}>
					{copied ? 'Copied to clipboard!' : 'Typing a new string...'}
				</Text>
			</Box>
		</Box>
	);
}
