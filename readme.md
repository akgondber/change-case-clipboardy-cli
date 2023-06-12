# change-case-clipboardy-cli [![NPM version][npm-image]][npm-url]

> This readme is automatically generated by [create-ink-app](https://github.com/vadimdemedes/create-ink-app)

## Install

```bash
$ npm install --global change-case-clipboardy-cli
```

## Usage

![](https://github.com/akgondber/change-case-clipboardy-cli/blob/main/media/usage-demo.gif)

Execute

```
$ change-case-clipboardy-cli
```

or

```
$ cccc
```

or

```
$ ccc
```

The ui will be loaded where you can type a source and apply the appropriate change case method.

You can also provide a source and a method (default is camelCase) when running a command:

```
$ ccc --str my_bar_baz --method constantCase
```

or using short flags

```
$ ccc -s my_bar_baz -m constantCase
```

In order to do a single transformation you can run a program without running ui, by using the `--exit` (`-e`) flag. The program will show transformed string into the console and copy it to clipboard.

```
$ ccc --str my_bar_baz --method constantCase --exit
```

or

```
$ ccc -s my_bar_baz -m constantCase -e
```

```
$ change-case-clipboardy-cli --help

Usage
$ change-case-clipboardy-cli

Options
--str Source string
--method Method to be used in change-case
--exit Exit immediately after showing a result and copying it to clipboard (without running ui)

Examples
$ change-case-clipboardy-cli --str=my_baz --method constantCase
$ change-case-clipboardy-cli -s=my_baz -m constantCase
$ change-case-clipboardy-cli --str=my_header --method capitalCase --exit
```

## License

MIT © [Rushan Alyautdinov](https://github.com/akgondber)

[npm-image]: https://img.shields.io/npm/v/change-case-clipboardy-cli.svg?style=flat
[npm-url]: https://npmjs.org/package/change-case-clipboardy-cli
```