/*******************************************************************************
 * This file is part of No BS Role Reacts, a role-assigning Discord bot.
 * Copyright (C) 2020 Mimickal (Mia Moretti).
 *
 * No BS Role Reacts is free software under the GNU Affero General Public
 * License v3.0. See LICENSE or <https://www.gnu.org/licenses/agpl-3.0.en.html>
 * for more information.
 ******************************************************************************/
const expect = require('chai').expect;

const pp = require('../src/positional');
const Argument = pp.Argument;
const Command = pp.Command;
const CommandError = pp.CommandError;
const CommandRegistry = pp.CommandRegistry;

describe('Positional command parser', function() {

	describe('Argument', function() {

		describe('Basic Errors', function() {

			it('Missing Argument name', function() {
				expect(() => new Argument()).to.throw(
					'name was [object Undefined], expected [object String]'
				);
			});

			it('Non-string Argument name', function() {
				expect(() => new Argument({})).to.throw(
					'name was [object Object], expected [object String]'
				);
			});

			it('Empty Argument name', function() {
				expect(() => new Argument('')).to.throw('name was empty string');
			});

			it('Non-boolean varargs flag', function() {
				expect(() => new Argument('test').varargs({})).to.throw(
					'enabled was [object Object], expected [object Boolean]'
				);
			});

			it('Non-function preprocessor', function () {
				expect(() => new Argument('test').preprocess({})).to.throw(
					'func was [object Object], expected [object Function]'
				);
			});

			it('Non-string and non-Array args', function() {
				expect(() => new Argument('test').parse({})).to.throw(
					"args was [object Object], expected [object String] or 'Array<string>'"
				);
				expect(() => new Argument('test').parse(true)).to.throw(
					"args was [object Boolean], expected [object String] or 'Array<string>'"
				);
			});

			it('Non-boolean optional flag', function() {
				expect(() => new Argument('test').optional({})).to.throw(
					'enabled was [object Object], expected [object Boolean]'
				);
			});
		});

		describe('Parsing and preprocessing', function() {

			it('Value passed through without preprocessor', function() {
				const arg = new Argument('test');
				expect(arg.parse('hello')).to.equal('hello');
			});

			it('Varargs value array passed through without preprocessor', function() {
				const arg = new Argument('test').varargs(true);
				const exp = ['hello', 'goodbye'];
				expect(arg.parse(exp)).to.deep.equal(exp);
			});

			it('Preprocessor automatically forwards value', function() {
				// NOTE: preprocessor does not return a value
				const arg = new Argument('test').preprocess(val => { /*no-op*/ });
				expect(arg.parse('thing')).to.equal('thing');
			});

			it('Preprocessor can modify value', function() {
				const arg = new Argument('test').preprocess(val => val + 'x');
				expect(arg.parse('thing')).to.equal('thingx');
			});

			it('Preprocessor applied to all varargs values', function() {
				const arg = new Argument('test')
					.varargs(true)
					.preprocess(val => {
						if (val.startsWith('x')) {
							throw new Error('This shouldn\'t happen');
						}
						return val + 'x';
					});
				expect(arg.parse(['aaa', 'bbb'])).to.deep.equal(['aaax', 'bbbx']);
			});

			it('Optional argument can be omitted', function() {
				const arg = new Argument('test').optional(true);
				expect(() => arg.parse()).to.not.throw;
				expect(arg.parse()).to.be.null;
			});

			it('Varargs can be optional too', function() {
				const arg = new Argument('test').varargs(true).optional(true);
				expect(() => arg.parse()).to.not.throw;
				expect(arg.parse()).to.be.an('array').that.is.empty;
			});

			it('Varargs can take single arguments', function() {
				const arg = new Argument('test')
					.varargs(true)
					.preprocess(val => val + 'thing');
				expect(arg.parse('my')).to.deep.equal(['mything']);
			});

			function validator(arg) {
				if (arg.startsWith('x')) {
					throw new RangeError('x is bad');
				}
			}

			it('Error thrown in preprocessor bubbles up', function() {
				const arg = new Argument('test').preprocess(validator);
				expect(() => arg.parse('xyz')).to.throw(
					RangeError,
					"Bad <test> value 'xyz': x is bad"
				);
			});

			it('Error thrown in preprocessor bubbles up for varargs', function() {
				const arg = new Argument('test')
					.preprocess(validator)
					.varargs(true);

				expect(() => arg.parse(['aaa', 'bxb', 'xcc'])).to.throw(
					RangeError,
					"Bad <test>(3) value 'xcc': x is bad"
				);
			});

			it('Error thrown for missing required argument', function() {
				const arg = new Argument('test');
				expect(() => arg.parse()).to.throw(
					CommandError,
					'Too few arguments! Missing argument <test>'
				);
			});

			it('Error thrown for missing at least one required varargs', function() {
				const arg = new Argument('test').varargs(true);
				expect(() => arg.parse()).to.throw(
					CommandError,
					'Too few arguments! Argument <test> requires at least one value'
				);
			});
		});

		describe('Usage strings', function() {

			it('Shows argument name', function() {
				const arg = new Argument('test');
				expect(arg.usage()).to.equal('<test>');
			});

			it('Optional arguments marked differently', function() {
				const arg = new Argument('test').optional(true);
				expect(arg.usage()).to.equal('[test]');
			});

			it('Varargs shows argument name multiple times', function() {
				const arg = new Argument('test').varargs(true);
				expect(arg.usage()).to.equal('<test_1> [test_2] ... [test_n]');
			});

			it('Optional varargs marked differently', function() {
				const arg = new Argument('test').varargs(true).optional(true);
				expect(arg.usage()).to.equal('[test_1] [test_2] ... [test_n]');
			});
		});
	});

	describe('Command', function() {

		describe('(static) split command string', function() {

			it('Command string split into object', function() {
				expect(Command.split('mycmd arg1 arg2 arg3')).to.deep.equal([
					'mycmd', 'arg1', 'arg2', 'arg3'
				])
			});

			it('Exception thrown for non-string values', function() {
				expect(() => Command.split({})).to.throw(
					'string was [object Object], expected [object String]'
				);
			});
		});

		describe('Basic Errors', function() {

			it('Missing Command name', function() {
				expect(() => new Command()).to.throw(
					'name was [object Undefined], expected [object String]'
				);
			});

			it('Non-string Command name', function() {
				expect(() => new Command({})).to.throw(
					'name was [object Object], expected [object String]'
				);
			});

			it('Empty Command name', function() {
				expect(() => new Command('')).to.throw('name was empty string');
			});

			it('Non-string description', function() {
				expect(() => new Command('test').description({})).to.throw(
					'name was [object Object], expected [object String]'
				);
			});

			it('Non-function handler', function() {
				expect(() => new Command('test').handler({})).to.throw(
					'func was [object Object], expected [object Function]'
				);
			});

			it('Non-function error handler', function() {
				expect(() => new Command('test').error({})).to.throw(
					'func was [object Object], expected [object Function]'
				);
			});
		});

		describe('Usage strings', function() {

			it('No arguments or description', function() {
				const cmd = new Command('test');
				expect(cmd.usage()).to.equal('test');
				expect(cmd.getDescription()).to.be.null;
			});

			it('Description only', function() {
				const cmd = new Command('test')
					.description('Some cool info');
				expect(cmd.usage()).to.equal('test');
				expect(cmd.getDescription()).to.equal('Some cool info');
			});

			it('Single argument set', function() {
				const cmd = new Command('test')
					.description('Stuff here')
					.addArgSet([new Argument('arg1')]);
				expect(cmd.usage()).to.equal('test <arg1>');
				expect(cmd.getDescription()).to.equal('Stuff here');
			});

			it('Multiple argument sets', function() {
				const cmd = new Command('test')
					.description('I am a cool description')
					.addArgSet([new Argument('one')])
					.addArgSet([new Argument('arg1'), new Argument('arg2')]);
				expect(cmd.usage()).to.equal('test <one>\n' + 'test <arg1> <arg2>');
				expect(cmd.getDescription()).to.equal('I am a cool description');
			});

			it('Argument set with varargs', function() {
				const cmd = new Command('test')
					.description('Hello')
					.addArgSet([
						new Argument('first'),
						new Argument('rest').varargs(true),
					]);
				expect(cmd.usage()).to.equal(
					'test <first> <rest_1> [rest_2] ... [rest_n]'
				);
				expect(cmd.getDescription()).to.equal('Hello');
			});
		});

		describe('Adding argument sets', function() {

			it('Exception for non-Array and non-Argument arg set', function() {
				const err = "argset must be of type 'Array<Argument>'";

				expect(() => new Command('test').addArgSet({})).to.throw(err)
				expect(() =>
					new Command('test').addArgSet(new Argument('test'))
				).to.throw(err);
				expect(() => new Command('test').addArgSet(['bad'])).to.throw(err);
				expect(() =>
					new Command('test').addArgSet([new Argument('test'), 'bad'])
				).to.throw(err);
			});

			const pre = 'Ambiguous argument sets';

			it('Exception for multiple arg sets with same length', function() {
				expect(() => new Command('test')
					.addArgSet([new Argument('test1'), new Argument('test2')])
					.addArgSet([new Argument('test3'), new Argument('test4')])
				).to.throw(`${pre}: Multiple sets of length 2`);
			});

			it('Exception thrown if multiple arg sets have varargs', function() {
				expect(() => new Command('test')
					.addArgSet([new Argument('var').varargs(true)])
					.addArgSet([new Argument('test'), new Argument('var').varargs(true)])
				).to.throw(`${pre}: Multiple sets containing varargs`);
			});

			it('Exception thrown for non-last optional argument', function() {
				expect(() => new Command('test')
					.addArgSet([
						new Argument('opt').optional(true),
						new Argument('req'),
					])
				).to.throw(`${pre}: optional argument must be last in set`);
			});

			it('Exception thrown if non-last varargs argument', function() {
				expect(() => new Command('test')
					.addArgSet([
						new Argument('test').varargs(true),
						new Argument('last'),
					])
				).to.throw(`${pre}: varargs argument must be last in set`);
			});

			it('Exception thrown if varargs arg set is not the largest set',
			function () {
				const err = `${pre}: set containing varargs must be largest set`;
				expect(() => new Command('test')
					.addArgSet([new Argument('var').varargs(true)])
					.addArgSet([new Argument('test1'), new Argument('test2')])
				).to.throw(err);
				expect(() => new Command('test')
					.addArgSet([new Argument('test1'), new Argument('test2')])
					.addArgSet([new Argument('test').varargs(true)])
				).to.throw(err);
			});
		});

		describe('Executing command', function() {

			it('Command with no handler does nothing', function() {
				const cmd = new Command('test');
				expect(() => cmd.execute()).to.not.throw();
				expect(cmd.execute()).to.be.undefined;
			});

			it('Command execution forwards handler return value', function() {
				const cmd = new Command('test')
					.handler(() => 123);
				expect(() => cmd.execute()).to.not.throw();
				expect(cmd.execute()).to.equal(123);
			});

			it('Command with args', function() {
				const cmd = new Command('test')
					.addArgSet([new Argument('xyz')])
					.handler(args => args);
				expect(() => cmd.execute(['value'])).to.not.throw();
				expect(cmd.execute(['value'])).to.deep.equal({
					_: ['value'],
					xyz: 'value',
				});
			});

			it('Forward arbitrary values to handler', function() {
				const cmd = new Command('test')
					.handler((args, thing1, thing2) => [thing1, thing2]);
				expect(() => cmd.execute([], 'aaa', {})).to.not.throw();
				expect(cmd.execute([], 'aaa', {x: 123})).to.deep.equal([
					'aaa',
					{x: 123},
				]);
			});

			it('Optional argument can be omitted', function() {
				const cmd = new Command('test')
					.addArgSet([ new Argument('arg').optional(true) ])
					.handler(args => args);
				expect(() => cmd.execute([])).to.not.throw;
				expect(cmd.execute([])).to.deep.equal({
					_: [],
					arg: null,
				});
			});

			it('Can execute command with string', function() {
				const cmd = new Command('test')
					.addArgSet([ new Argument('arg'), new Argument('aaa') ])
					.handler(args => args);
				expect(cmd.execute('hello goodbye')).to.deep.equal({
					_: ['hello', 'goodbye'],
					arg: 'hello',
					aaa: 'goodbye',
				});
			});

			it('Error thrown for invalid argument bubbles up', function() {
				const cmd = new Command('test')
					.addArgSet([ new Argument('xyz')
						.preprocess(() => { throw new Error('some fun reason') })
					]);
				expect(() => cmd.execute(['a'])).to.throw(
					"Bad <xyz> value 'a': some fun reason"
				);
			});

			it('Error thrown in handler bubbles up', function() {
				const cmd = new Command('test')
					.handler(() => { throw new Error('Handler broke') });
				expect(() => cmd.execute()).to.throw(
					'Command failed: Handler broke'
				);
			});

			const cmd = new Command('test')
				.addArgSet([ new Argument('arg')
					.preprocess(() => { throw new Error('preprocess err'); })
				])
				.handler(() => { throw new Error('handler err'); });

			it('Error handler catches error instead of throwing', function() {
				let capture;
				cmd.error(err => { capture = err; });

				expect(() => cmd.execute()).to.not.throw;
				cmd.execute();
				expect(capture).to.be.an.instanceof(Error);
				expect(capture.message).to.equal(
					'Too few arguments! Missing argument <arg>'
				);

				expect(() => cmd.execute(['abc'])).to.not.throw;
				cmd.execute(['abc']);
				expect(capture).to.be.an.instanceof(Error);
				expect(capture.message).to.equal(
					"Bad <arg> value 'abc': preprocess err"
				);
			});

			it('Forward arbitrary values to handler', function() {
				let capture;
				cmd.error((err, val1) => { capture = val1; });

				cmd.execute([], 'arbitrary data');
				expect(capture).to.equal('arbitrary data');
			});

			it('Command execution forwards handler return value', function() {
				cmd.error(err => 'some returned value');

				expect(cmd.execute()).to.equal('some returned value');
			});
		});

		// This is where all the fun happens
		describe('Parsing arguments', function() {

			describe('Single argument set', function() {
				const cmd = new Command('test')
					.addArgSet([
						new Argument('aaa'),
						new Argument('bbb'),
					]);

				it('Error thrown for no args', function() {
					expect(() => cmd.parse([])).to.throw(
						'Too few arguments! Missing argument <aaa>'
					);
				});

				it('Error thrown for missing args', function() {
					expect(() => cmd.parse(['hello'])).to.throw(
						'Too few arguments! Missing argument <bbb>'
					);
				});

				it('Error thrown for too many args', function() {
					expect(() =>
						cmd.parse(['hello', 'goodbye', 'things', 'stuff'])
					).to.throw(
						CommandError,
						"Too many arguments! Extras: 'things', 'stuff'"
					);
				});
			});

			describe('Multiple argument sets', function() {
				const cmd = new Command('test')
					.addArgSet([new Argument('aaa')])
					.addArgSet([
						new Argument('bbb'),
						new Argument('ccc'),
						new Argument('ddd'),
					])
					.addArgSet([
						new Argument('arg1'),
						new Argument('arg2'),
						new Argument('arg3'),
						new Argument('arg4'),
					]);

				it('Correct argument set is used', function() {
					expect(cmd.parse(['stuff'])).to.deep.equal({
						_: ['stuff'],
						aaa: 'stuff',
					});
					expect(cmd.parse(['hello', '123', 'xyz'])).to.deep.equal({
						_: ['hello', '123', 'xyz'],
						bbb: 'hello',
						ccc: '123',
						ddd: 'xyz',
					});
				});

				it('Error thrown if no argset matches (too few args)', function() {
					expect(() => cmd.parse([])).to.throw(
						CommandError,
						'Wrong number of arguments! See command help for details'
					);
				});

				it('Error thrown if no argset matches (middle args)', function() {
					expect(() => cmd.parse(['xx', 'yy'])).to.throw(
						CommandError,
						'Wrong number of arguments! See command help for details'
					);
				});

				it('Error thrown if no argset matches (too many args)', function() {
					expect(() => cmd.parse(['xx', 'yy', 'zz', 'ii', 'jj'])).to.throw(
						CommandError,
						'Wrong number of arguments! See command help for details'
					);
				});
			});

			describe('Varargs argument set', function() {
				const cmd = new Command('test')
					.addArgSet([new Argument('var').varargs(true)]);

				it('Varargs can have no arguments', function () {
					expect(cmd.parse([])).to.deep.equal({
						_: [],
						var: [],
					});
				});

				it('Varargs can have many arguments', function() {
					expect(cmd.parse(['aaa', 'bbb', 'ccc'])).to.deep.equal({
						_: ['aaa', 'bbb', 'ccc'],
						var: ['aaa', 'bbb', 'ccc'],
					});
				});
			});
		});
	});

	describe('CommandError', function() {
		const err = new CommandError('hello');

		it('CommandError is instanceof Error', function() {
			expect(err).to.be.instanceof(CommandError);
			expect(err).to.be.instanceof(Error);
		});

		it('CommandError has boolean set', function() {
			expect(err.is_command_error).to.be.true;
		});

		it('CommandError still behaves like Error', function() {
			expect(err.message).to.equal('hello');
		});
	});

	describe('CommandRegistry', function() {

		describe('Adding new commands', function() {

			it('Commands sucessfully added', function() {
				const cmdreg = new CommandRegistry();
				const cmd1 = new Command('test');
				const cmd2 = new Command('abc');
				cmdreg.add(cmd1).add(cmd2);

				expect(cmdreg.commands).to.have.lengthOf(2);
				expect(cmdreg.commands).to.include(cmd1).and.include(cmd2);
			});

			it('Error thrown for non-Command object', function() {
				const cmdreg = new CommandRegistry();
				expect(() => cmdreg.add({})).to.throw(
					'command was [object Object], expected [object Command]'
				);
			});

			it('Error thrown for duplicate commands', function() {
				const cmdreg = new CommandRegistry();
				cmdreg.add(new Command('test'));
				expect(() => cmdreg.add(new Command('test'))).to.throw(
					"Defined duplicate command 'test'"
				);
			});
		});

		describe('Default handler used for unrecognized commands', function () {

			it('No-op if no default handler defined', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('test'));
				expect(() => cmdreg.execute('unknown')).to.not.throw;
				expect(cmdreg.execute('unknown')).to.be.undefined;
			});

			it('Default handler throws an Error', function() {
				const cmdreg = new CommandRegistry()
					.defaultHandler();
				expect(() => cmdreg.execute('unknown')).to.throw(
					"Unrecognized command 'unknown'"
				);
			});

			it('Return value from default handler bubbles up', function() {
				const cmdreg = new CommandRegistry()
					.defaultHandler(() => 'My cool value');
				expect(cmdreg.execute('unknown')).to.equal('My cool value');
			});

			it('Args forwarded to handler', function() {
				const cmdreg = new CommandRegistry()
					.defaultHandler((args, forward1, forward2) => {
						return {
							thing1: forward1,
							thing2: forward2,
						};
					});
				expect(cmdreg.execute('unknown', 'aaa', {x: 'y'})).to.deep.equal({
					thing1: 'aaa',
					thing2: {x: 'y'},
				});
			});

			it('Error thrown for non-function handler', function() {
				const cmdreg = new CommandRegistry();
				expect(() => cmdreg.defaultHandler('not a function')).to.throw(
					'func was [object String], expected [object Function]'
				);
			});

			it('Error from handler bubbles up', function() {
				const cmdreg = new CommandRegistry()
					.defaultHandler(() => {
						throw new Error('I have a problem');
					});
				expect(() => cmdreg.execute('unknown')).to.throw(
					'I have a problem'
				);
			});
		});

		describe('Help', function() {
			const cmdreg = new CommandRegistry()
				.add(new Command('com1')
					.description('My test command 1')
					.addArgSet([new Argument('arg1')])
				)
				.add(new Command('com2')
					.description('Another test command')
					.addArgSet([new Argument('arg2')])
					.addArgSet([new Argument('ver2'), new Argument('ano')])
				);
			const usage =
				'com1 <arg1>\n' +
				'com2 <arg2>\n' +
				'com2 <ver2> <ano>\n' +
				'help [command]';

			it('No-op if no help handler defined', function() {
				expect(cmdreg.help()).to.be.undefined;
			});

			it('Default help handler returns usage string', function() {
				cmdreg.helpHandler();
				expect(cmdreg.help()).to.equal(usage);
			});

			it('Default help handler gracefully handles unknown commmands', function() {
				expect(cmdreg.help('unknown')).to.equal("Unknown command 'unknown'");
			});

			it('Can execute help as a command', function() {
				expect(cmdreg.execute('help')).to.equal(usage);
			});

			it('Can get help for a single command', function() {
				expect(cmdreg.help('com2')).to.equal(
					'com2 <arg2>\n' +
					'com2 <ver2> <ano>'
				);
			});

			it('Args forwarded to handler', function() {
				cmdreg.helpHandler((name, commands, arg1, arg2) => ({
					arg1: arg1,
					arg2: arg2,
				}));
				expect(cmdreg.help('ignored', 'aaa', {x: 'y'})).to.deep.equal({
					arg1: 'aaa',
					arg2: {x: 'y'},
				});
			});

			it('Handler function gets command list', function() {
				cmdreg.helpHandler((name, commands) => commands);
				expect(cmdreg.help('ignored')).to.equal(cmdreg.commands);
			});

			it('Error thrown for non-function handler', function() {
				expect(() => cmdreg.helpHandler({})).to.throw(
					'func was [object Object], expected [object Function]'
				);
			});

			it('Error from handler bubbles up', function() {
				cmdreg.helpHandler(() => {
					throw new Error('This thing broke');
				});
				expect(() => cmdreg.help('ignored')).to.throw('This thing broke');
			});
		});

		describe('Command execution', function() {

			it('Return value from command bubbles up', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('com1')
						.handler(() => 'My cool thing')
					);
				expect(cmdreg.execute('com1')).to.equal('My cool thing');
			});

			it('Error thrown from handler bubbles up', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('test')
						.handler(() => {
							throw new Error('Bad things happened');
						})
					);
				expect(() => cmdreg.execute('test')).to.throw('Bad things happened');
			});
		});
	});
});
