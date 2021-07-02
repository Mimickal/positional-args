/*******************************************************************************
 * This file is part of No BS Role Reacts, a role-assigning Discord bot.
 * Copyright (C) 2020 Mimickal (Mia Moretti).
 *
 * No BS Role Reacts is free software under the GNU Affero General Public
 * License v3.0. See LICENSE or <https://www.gnu.org/licenses/agpl-3.0.en.html>
 * for more information.
 ******************************************************************************/
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const pp = require('../src/positional');
const Argument = pp.Argument;
const Command = pp.Command;
const CommandError = pp.CommandError;
const CommandRegistry = pp.CommandRegistry;
const SetupError = pp.SetupError;

describe('Positional command parser', function() {

	describe('Argument', function() {

		describe('Basic Errors', function() {

			it('Missing Argument name', function() {
				expect(() => new Argument()).to.throw(
					SetupError,
					'name was [object Undefined], expected [object String]'
				);
			});

			it('Non-string Argument name', function() {
				expect(() => new Argument({})).to.throw(
					SetupError,
					'name was [object Object], expected [object String]'
				);
			});

			it('Empty Argument name', function() {
				expect(() => new Argument('')).to.throw(
					SetupError,
					'name was empty string'
				);
			});

			it('Non-function preprocessor', function () {
				expect(() => new Argument('test').preprocess({})).to.throw(
					SetupError,
					'func was [object Object], expected [object Function]'
				);
			});

			it('Non-string and non-Array args', function() {
				const arg = new Argument('test');
				expect(() => arg.parse({})).to.throw(
					CommandError,
					"args was [object Object], expected [object String] or 'Array<string>'"
				);
				expect(() => arg.parse(true)).to.throw(
					CommandError,
					"args was [object Boolean], expected [object String] or 'Array<string>'"
				);
			});

			it('Non-boolean asynchronous flag', function() {
				expect(() => new Argument('test').asynchronous({})).to.throw(
					SetupError,
					'enabled was [object Object], expected [object Boolean]'
				);
			});

			it('Non-boolean optional flag', function() {
				expect(() => new Argument('test').optional({})).to.throw(
					SetupError,
					'enabled was [object Object], expected [object Boolean]'
				);
			});

			it('Non-boolean varargs flag', function() {
				expect(() => new Argument('test').varargs({})).to.throw(
					SetupError,
					'enabled was [object Object], expected [object Boolean]'
				);
			});
		});

		describe('Parsing and preprocessing', function() {

			it('Value passed through without preprocessor', function() {
				const arg = new Argument('test');
				expect(arg.parse('hello')).to.equal('hello');
			});

			it('Value passed through without preprocessor (async)', function() {
				const arg = new Argument('test').asynchronous(true);
				return expect(arg.parse('hello')).to.eventually.equal('hello');
			});

			it('Value passed through without preprocessor (varargs)', function() {
				const arg = new Argument('test').varargs(true);
				const exp = ['hello', 'goodbye'];
				expect(arg.parse(exp)).to.deep.equal(exp);
			});

			it('Value passed through without preprocessor (varargs) (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.varargs(true);
				const exp = ['hello', 'goodbye'];
				return expect(arg.parse(exp)).to.eventually.deep.equal(exp);
			});

			it('Preprocessor automatically forwards value', function() {
				// NOTE: preprocessor does not return a value
				const arg = new Argument('test').preprocess(val => { /*no-op*/ });
				expect(arg.parse('thing')).to.equal('thing');
			});

			it('Preprocessor automatically forwards value (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.preprocess(async val => { /*no-op*/ });
				return expect(arg.parse('thing')).to.eventually.equal('thing');
			});

			it('Preprocessor automatically forwards value (varargs) (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.preprocess(async val => { /*no-op*/ })
					.varargs(true);
				return expect(arg.parse(['aaa', 'bbb']))
					.to.eventually.deep.equal(['aaa', 'bbb']);
			});

			it('Parse always returns Promise in async mode', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.preprocess(val => 123); // NOTE: not async
				return expect(arg.parse('aaa')).to.eventually.equal(123);
			});

			it('Preprocessor can modify value', function() {
				const arg = new Argument('test').preprocess(val => val + 'x');
				expect(arg.parse('thing')).to.equal('thingx');
			});

			it('Preprocessor can modify value (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.preprocess(async val => val + 'x');
				return expect(arg.parse('thing')).to.eventually.equal('thingx');
			});

			it('Preprocessor can modify value (varargs)', function() {
				const arg = new Argument('test')
					.preprocess(val => val + 'x')
					.varargs(true);
				expect(arg.parse(['aaa', 'bbb'])).to.deep.equal(['aaax', 'bbbx']);
			});

			it('Preprocessor can modify value (varargs) (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.preprocess(async val => val + 'x')
					.varargs(true);
				return expect(arg.parse(['aaa', 'bbb']))
					.to.eventually.deep.equal(['aaax', 'bbbx']);
			});

			it('Optional argument can be omitted', function() {
				const arg = new Argument('test')
					.optional(true);
				expect(() => arg.parse()).to.not.throw;
				expect(arg.parse()).to.be.null;
			});

			it('Optional argument can be omitted (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.optional(true);
				return expect(arg.parse()).to.eventually.be.null;
			});

			it('Optional argument can be omitted (varargs)', function() {
				const arg = new Argument('test')
					.optional(true)
					.varargs(true);
				expect(() => arg.parse()).to.not.throw;
				expect(arg.parse()).be.instanceof(Array).that.is.empty;
			});

			it('Optional argument can be omitted (varargs) (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.optional(true)
					.varargs(true);
				return expect(arg.parse())
					.to.eventually.be.instanceof(Array).that.is.empty;
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

			it('Error thrown in preprocessor bubbles up (async)', function() {
				const arg1 = new Argument('test')
					.asynchronous(true)
					.preprocess(validator); // Given func not async
				const arg2 = new Argument('test')
					.asynchronous(true)
					.preprocess(async () => { throw new RangeError('x is bad') });
				return Promise.all([arg1, arg2].map(arg =>
					expect(arg.parse('xyz')).to.be.rejectedWith(
						RangeError,
						"Bad <test> value 'xyz': x is bad"
					)
				));
			});

			it('Error thrown in preprocessor bubbles up (varargs)', function() {
				const arg = new Argument('test')
					.preprocess(validator)
					.varargs(true);
				expect(() => arg.parse(['aaa', 'bxb', 'xcc'])).to.throw(
					RangeError,
					"Bad <test>(3) value 'xcc': x is bad"
				);
			});

			it('Error thrown in preprocessor bubbles up (varargs) (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.preprocess(validator)
					.varargs(true);
				return expect(arg.parse(['aaa', 'bxb', 'xcc'])).to.be.rejectedWith(
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

			it('Error thrown for missing required argument (async)', function() {
				const arg = new Argument('test').asynchronous(true);
				return expect(arg.parse()).to.be.rejectedWith(
					CommandError,
					'Too few arguments! Missing argument <test>'
				);
			});

			it('Error thrown for missing required argument (varargs)', function() {
				const arg = new Argument('test').varargs(true);
				expect(() => arg.parse()).to.throw(
					CommandError,
					'Too few arguments! Argument <test> requires at least one value'
				);
			});

			it('Error thrown for missing required argument (varargs) (async)', function() {
				const arg = new Argument('test')
					.asynchronous(true)
					.varargs(true);
				return expect(arg.parse()).to.be.rejectedWith(
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

			it('Empty splits ignored', function() {
				expect(Command.split('   mycmd  arg1	arg2	'))
					.to.deep.equal(['mycmd', 'arg1', 'arg2']);
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
					SetupError,
					'name was [object Undefined], expected [object String]'
				);
			});

			it('Non-string Command name', function() {
				expect(() => new Command({})).to.throw(
					SetupError,
					'name was [object Object], expected [object String]'
				);
			});

			it('Empty Command name', function() {
				expect(() => new Command('')).to.throw(
					SetupError, 'name was empty string'
				);
			});

			it('Non-boolean asynchronous flag', function() {
				expect(() => new Command('test').asynchronous({})).to.throw(
					SetupError,
					'enabled was [object Object], expected [object Boolean]'
				);
			});

			it('Non-string description', function() {
				expect(() => new Command('test').description({})).to.throw(
					SetupError,
					'name was [object Object], expected [object String]'
				);
			});

			it('Non-function handler', function() {
				expect(() => new Command('test').handler({})).to.throw(
					SetupError,
					'func was [object Object], expected [object Function]'
				);
			});

			it('Non-function error handler', function() {
				expect(() => new Command('test').error({})).to.throw(
					SetupError,
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

		// NOTE: We're accessing private data for these tests. Sorry.
		describe('Changing async setting', function() {

			it('Command async setting applied to new argument set', function() {
				const cmd = new Command('test').asynchronous(true);
				const arg = new Argument('test');

				expect(arg._async).to.be.false;

				cmd.addArgSet([arg]);

				expect(arg._async).to.be.true;
			});

			it('Async setting applied recursively to all argument sets', function() {
				const cmd = new Command('test')
					.addArgSet([new Argument('arga1')])
					.addArgSet([new Argument('argb1'), new Argument('argb2')]);

				const asyncArgs = () => cmd._argsets
					.reduce((acc, set) => acc.concat(set), [])
					.filter(arg => arg._async);

				expect(asyncArgs()).to.be.empty;

				cmd.asynchronous(true);

				expect(asyncArgs()).to.have.lengthOf(3);
			});
		});

		describe('Adding argument sets', function() {

			it('Exception for non-Array and non-Argument arg set', function() {
				const err = "argset must be of type 'Array<Argument>'";

				expect(() => new Command('test').addArgSet({}))
					.to.throw(SetupError, err)
				expect(() => new Command('test').addArgSet(new Argument('test')))
					.to.throw(SetupError, err);
				expect(() => new Command('test').addArgSet(['bad']))
					.to.throw(SetupError, err);
				expect(() =>
					new Command('test').addArgSet([new Argument('test'), 'bad'])
				).to.throw(SetupError, err);
			});

			const pre = 'Ambiguous argument sets';

			it('Exception for multiple arg sets with same length', function() {
				expect(() => new Command('test')
					.addArgSet([new Argument('test1'), new Argument('test2')])
					.addArgSet([new Argument('test3'), new Argument('test4')])
				).to.throw(SetupError, `${pre}: Multiple sets of length 2`);
			});

			it('Exception thrown if multiple arg sets have varargs', function() {
				expect(() => new Command('test')
					.addArgSet([new Argument('var').varargs(true)])
					.addArgSet([new Argument('test'), new Argument('var').varargs(true)])
				).to.throw(SetupError, `${pre}: Multiple sets containing varargs`);
			});

			it('Exception thrown for non-last optional argument', function() {
				expect(() => new Command('test')
					.addArgSet([
						new Argument('opt').optional(true),
						new Argument('req'),
					])
				).to.throw(SetupError, `${pre}: optional argument must be last in set`);
			});

			it('Exception thrown if non-last varargs argument', function() {
				expect(() => new Command('test')
					.addArgSet([
						new Argument('test').varargs(true),
						new Argument('last'),
					])
				).to.throw(SetupError, `${pre}: varargs argument must be last in set`);
			});

			it('Exception thrown if varargs arg set is not the largest set',
			function () {
				const err = `${pre}: set containing varargs must be largest set`;
				expect(() => new Command('test')
					.addArgSet([new Argument('var').varargs(true)])
					.addArgSet([new Argument('test1'), new Argument('test2')])
				).to.throw(SetupError, err);
				expect(() => new Command('test')
					.addArgSet([new Argument('test1'), new Argument('test2')])
					.addArgSet([new Argument('test').varargs(true)])
				).to.throw(SetupError, err);
			});
		});

		describe('Executing command', function() {

			it('Command with no handler does nothing', function() {
				const cmd = new Command('test');
				expect(() => cmd.execute()).to.not.throw();
				expect(cmd.execute()).to.be.undefined;
			});

			it('Command with no handler does nothing (async)', function() {
				const cmd = new Command('test').asynchronous(true);
				return expect(cmd.execute()).to.eventually.be.undefined;
			});

			it('Command execution forwards handler return value', function() {
				const cmd = new Command('test')
					.handler(() => 123);
				expect(() => cmd.execute()).to.not.throw();
				expect(cmd.execute()).to.equal(123);
			});

			it('Command execution forwards handler return value (async)',
			function() {
				const cmd = new Command('test')
					.asynchronous(true)
					.handler(async () => 123);
				return expect(cmd.execute()).to.eventually.equal(123);
			});

			it('Command always returns promise in async mode', function() {
				const cmd = new Command('test')
					.asynchronous(true)
					.handler(() => 123); // Not async
				return expect(cmd.execute()).to.eventually.equal(123);
			});

			it('Command with arguments', function() {
				const cmd = new Command('test')
					.addArgSet([new Argument('xyz')])
					.handler(args => args);
				expect(() => cmd.execute(['value'])).to.not.throw();
				expect(cmd.execute(['value'])).to.deep.equal({
					_: ['value'],
					xyz: 'value',
				});
			});

			it('Command with arguments (async)', function() {
				const cmd = new Command('test')
					.addArgSet([new Argument('xyz')])
					.asynchronous(true)
					.handler(args => args);
				return expect(cmd.execute(['value'])).to.eventually.deep.equal({
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

			it('Error thrown for invalid argument bubbles up (async)', function() {
				const cmd = new Command('test')
					.addArgSet([ new Argument('xyz')
						.preprocess(() => { throw new Error('some fun reason') })
					])
					.asynchronous(true);
				return expect(cmd.execute(['a'])).to.be.rejectedWith(
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

			it('Error thrown in handler bubbles up (async)', function() {
				const cmd = new Command('test')
					.asynchronous(true)
					.handler(() => { throw new Error('Handler broke') });
				return expect(cmd.execute()).to.be.rejectedWith(
					'Command failed: Handler broke'
				);
			});

			const arg = new Argument('arg')
				.preprocess(() => { throw new Error('preprocess err'); });

			it('Error handler catches error instead of throwing', function() {
				let capture;
				const cmd = new Command('test')
					.addArgSet([arg])
					.error(err => { capture = err; })
					.handler(() => { throw new Error('should not see this'); });

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

			it('Error handler catches error instead of throwing (async)', function() {
				let capture;
				const cmd = new Command('test')
					.addArgSet([arg])
					.asynchronous(true)
					.error(err => { capture = err; })
					.handler(() => { throw new Error('should not see this'); });

				return expect(cmd.execute(['abc'])).to.eventually.be.undefined
					.then(() => {
						expect(capture).to.be.an.instanceof(Error);
						expect(capture.message).to.equal(
							"Bad <arg> value 'abc': preprocess err"
						);
					});
			});

			it('Forward arbitrary values to error handler', function() {
				let capture;
				const cmd = new Command('test')
					.addArgSet([arg])
					.error((err, val1) => { capture = val1; })
					.handler(() => { throw new Error('handler err'); });

				cmd.execute([], 'arbitrary data');
				expect(capture).to.equal('arbitrary data');
			});

			it('Command execution forwards error handler return value', function() {
				const cmd = new Command('test')
					.addArgSet([arg])
					.error(err => 'some returned value')
					.handler(() => { throw new Error('handler err'); });

				expect(cmd.execute()).to.equal('some returned value');
			});

			it('Command execution forwards error handler return value (async)',
			function() {
				const cmd = new Command('test')
					.addArgSet([arg])
					.asynchronous(true)
					.error(() => 'my cool error return value')
					.handler(() => { throw new Error('handler err'); });

				return expect(cmd.execute())
					.to.eventually.equal('my cool error return value');
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
				const asc = new Command('test')
					.addArgSet([
						new Argument('aaa'),
						new Argument('bbb'),
					])
					.asynchronous(true);

				it('Error thrown for no args', function() {
					expect(() => cmd.parse([])).to.throw(
						CommandError,
						'Too few arguments! Missing argument <aaa>'
					);
				});

				it('Error thrown for no args (async)', function() {
					return expect(asc.parse([])).to.be.rejectedWith(
						CommandError,
						'Too few arguments! Missing argument <aaa>'
					);
				});

				it('Error thrown for missing args', function() {
					expect(() => cmd.parse(['hello'])).to.throw(
						CommandError,
						'Too few arguments! Missing argument <bbb>'
					);
				});

				it('Error thrown for missing args (async)', function() {
					return expect(asc.parse(['hello'])).to.be.rejectedWith(
						CommandError,
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

				it('Error thrown for too many args (async)', function() {
					return expect(
						asc.parse(['hello', 'goodbye', 'things', 'stuff'])
					).to.be.rejectedWith(
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

				it('Error thrown if no argset matches (async)', function() {
					const asm = new Command('test')
						.addArgSet([new Argument('aaa')])
						.addArgSet([
							new Argument('bbb'),
							new Argument('ccc'),
							new Argument('ddd'),
						])
						.asynchronous(true);
					return expect(asm.parse(['xx', 'yy'])).to.be.rejectedWith(
						CommandError,
						'Wrong number of arguments! See command help for details'
					);
				});
			});

			describe('Varargs argument set', function() {
				const cmd = new Command('test')
					.addArgSet([new Argument('var').varargs(true)]);

				const asm = new Command('test')
					.addArgSet([new Argument('var').varargs(true)])
					.asynchronous(true);

				it('Varargs can have no arguments', function () {
					expect(cmd.parse([])).to.deep.equal({
						_: [],
						var: [],
					});
				});

				it('Varargs can have no arguments (async)', function () {
					return expect(asm.parse([])).to.eventually.deep.equal({
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

				it('Varargs can have many arguments (async)', function() {
					return expect(asm.parse(['aaa', 'bbb', 'ccc']))
						.to.eventually.deep.equal({
							_: ['aaa', 'bbb', 'ccc'],
							var: ['aaa', 'bbb', 'ccc'],
						});
				});
			});

			describe('Argument parsing in async mode', function() {

				it('Parse always returns promise in async mode', function() {
					const cmd = new Command('test').asynchronous(true);
					expect(cmd.parse()).to.be.instanceof(Promise);
				});

				it('Synchronous arguments promoted to Promises', function() {
					const cmd = new Command('test')
						.addArgSet([new Argument('bbb').preprocess(() => 123)])
						.asynchronous(true);
					return expect(cmd.parse(['xyz'])).to.eventually.deep.equal({
						_: ['xyz'],
						bbb: 123,
					});
				});

				it('Async arguments resolved', function() {
					const cmd = new Command('test')
						.addArgSet([
							new Argument('aaa')
								.asynchronous(true)
								.preprocess(async val => val + 'a'),
						])
						.asynchronous(true);
					return expect(cmd.parse(['xyz'])).to.eventually.deep.equal({
						_: ['xyz'],
						aaa: 'xyza',
					});
				});

				it('Mixed sync and async arguments handled gracefully', function() {
					const cmd = new Command('test')
						.addArgSet([
							new Argument('aaa')
								.asynchronous(true)
								.preprocess(async val => val + 'a'),
							new Argument('bbb') // Intentionally not async
								.preprocess(val => val + 'b'),
							new Argument('ccc')
								.asynchronous(true)
								.preprocess(val => val + 'c'),
						])
						.asynchronous(true);
					return expect(
						cmd.parse(['111', '222', '333'])
					).to.eventually.deep.equal({
						_: ['111', '222', '333'],
						aaa: '111a',
						bbb: '222b',
						ccc: '333c',
					});
				});
			});
		});
	});

	describe('CommandError', function() {

		it('Is instanceof Error', function() {
			const cmderr = new CommandError();
			expect(cmderr).to.be.instanceof(CommandError);
			expect(cmderr).to.be.instanceof(Error);
		});

		it('Has boolean set', function() {
			expect(new CommandError().is_command_error).to.be.true;
		});

		it('Still behaves like Error', function() {
			const cmderr = new CommandError('hello');
			expect(cmderr.message).to.equal('hello');
		});

		it('Can wrap other thrown things', function() {
			const suberr = new RangeError('sub thing');
			const cmderr = new CommandError('more info', suberr);
			expect(cmderr.wrapped).to.equal(suberr);
		});

		describe('Full message', function() {

			it('Just the outer message by default', function() {
				const cmderr = new CommandError('hello');
				expect(cmderr.full_message).to.equal('hello');
			});

			it('Includes wrapped error text', function() {
				const cmderr1 = new CommandError('hello', new RangeError());
				expect(cmderr1.full_message).to.equal('hello');

				const cmderr2 = new CommandError('hello', new RangeError('goodbye'));
				expect(cmderr2.full_message).to.equal('hello: goodbye');
			});
		});
	});

	describe('CommandRegistry', function() {

		describe('Basic errors', function() {

			it('Error thrown for non-boolean asynchronous flag', function() {
				const cmdreg = new CommandRegistry();
				expect(() => cmdreg.asynchronous({})).to.throw(
					SetupError,
					'enabled was [object Object], expected [object Boolean]'
				);
			});

			it('Error thrown for non-function default handler', function() {
				const cmdreg = new CommandRegistry();
				expect(() => cmdreg.defaultHandler('not a function')).to.throw(
					SetupError,
					'func was [object String], expected [object Function]'
				);
			});

			it('Error thrown for non-function help handler', function() {
				const cmdreg = new CommandRegistry();
				expect(() => cmdreg.helpHandler({})).to.throw(
					SetupError,
					'func was [object Object], expected [object Function]'
				);
			});
		});

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
					SetupError,
					'command was [object Object], expected [object Command]'
				);
			});

			it('Error thrown for duplicate commands', function() {
				const cmdreg = new CommandRegistry();
				cmdreg.add(new Command('test'));
				expect(() => cmdreg.add(new Command('test'))).to.throw(
					SetupError,
					"Defined duplicate command 'test'"
				);
			});
		});

		describe('Default handler used for unrecognized commands', function () {

			it('No-op if default handler undefined', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('test'));
				expect(() => cmdreg.execute('unknown')).to.not.throw;
				expect(cmdreg.execute('unknown')).to.be.undefined;
			});

			it('No-op if default handler undefined (async)', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('test'))
					.asynchronous(true);
				return expect(cmdreg.execute('unknown'))
					.to.eventually.be.undefined;
			});

			it('Built-in default handler throws an Error', function() {
				const cmdreg = new CommandRegistry()
					.defaultHandler();
				expect(() => cmdreg.execute('unknown')).to.throw(
					"Unrecognized command 'unknown'"
				);
			});

			it('Built-in default handler throws an Error (async)', function() {
				const cmdreg = new CommandRegistry()
					.asynchronous(true)
					.defaultHandler();
				return expect(cmdreg.execute('unknown')).to.be.rejectedWith(
					"Unrecognized command 'unknown'"
				);
			});

			it('Return value from default handler bubbles up', function() {
				const cmdreg = new CommandRegistry()
					.defaultHandler(() => 'My cool value');
				expect(cmdreg.execute('unknown')).to.equal('My cool value');
			});

			it('Return value from default handler bubbles up (async)', function() {
				const cmdreg = new CommandRegistry()
					.asynchronous(true)
					.defaultHandler(() => 'My cool value');
				return expect(cmdreg.execute('unknown'))
					.to.eventually.equal('My cool value');
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

			it('Args forwarded to handler (async)', function() {
				const cmdreg = new CommandRegistry()
					.asynchronous(true)
					.defaultHandler((args, forward1, forward2) => {
						return {
							thing1: forward1,
							thing2: forward2,
						};
					});
				return expect(cmdreg.execute('unknown', 'aaa', {x: 'y'}))
					.to.eventually.deep.equal({
						thing1: 'aaa',
						thing2: {x: 'y'},
					});
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

			it('Error from handler bubbles up (async)', function() {
				const cmdreg = new CommandRegistry()
					.asynchronous(true)
					.defaultHandler(() => {
						throw new Error('I have a problem');
					});
				expect(cmdreg.execute('unknown')).to.be.rejectedWith(
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

			const asmreg = new CommandRegistry()
				.add(new Command('com1')
					.description('My test command 1')
					.addArgSet([new Argument('arg1')])
				)
				.add(new Command('com2')
					.description('Another test command')
					.addArgSet([new Argument('arg2')])
					.addArgSet([new Argument('ver2'), new Argument('ano')])
				)
				.asynchronous(true);

			const usage =
				'com1 <arg1>\n' +
				'com2 <arg2>\n' +
				'com2 <ver2> <ano>\n' +
				'help [command]';

			it('No-op if no help handler defined', function() {
				expect(cmdreg.help()).to.be.undefined;
			});

			it('No-op if no help handler defined (async)', function() {
				return expect(asmreg.help()).to.eventually.be.undefined;
			});

			it('Default help handler returns usage string', function() {
				cmdreg.helpHandler();
				expect(cmdreg.help()).to.equal(usage);
			});

			it('Default help handler returns usage string (async)', function() {
				asmreg.helpHandler();
				return expect(asmreg.help()).to.eventually.equal(usage);
			});

			it('Default help handler gracefully handles unknown commmands',
			function() {
				cmdreg.helpHandler();
				expect(cmdreg.help('unknown')).to.equal("Unknown command 'unknown'");
			});

			it('Default help handler gracefully handles unknown commmands (async)',
			function() {
				asmreg.helpHandler();
				return expect(asmreg.help('unknown'))
					.to.eventually.equal("Unknown command 'unknown'");
			});

			it('Can execute help as a command', function() {
				expect(cmdreg.execute('help')).to.equal(usage);
			});

			it('Can execute help as a command (async)', function() {
				return expect(asmreg.execute('help')).to.eventually.equal(usage);
			});

			it('Can get help for a single command', function() {
				expect(cmdreg.help('com2')).to.equal(
					'com2 <arg2>\n' +
					'com2 <ver2> <ano>'
				);
			});

			it('Can get help for a single command (async)', function() {
				return expect(asmreg.help('com2')).to.eventually.equal(
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

			it('Args forwarded to handler (async)', function() {
				asmreg.helpHandler((name, commands, arg1, arg2) => ({
					arg1: arg1,
					arg2: arg2,
				}));
				return expect(asmreg.help('ignored', 'aaa', {x: 'y'}))
					.to.eventually.deep.equal({
						arg1: 'aaa',
						arg2: {x: 'y'},
					});
			});

			it('Handler function gets command list', function() {
				cmdreg.helpHandler((name, commands) => commands);
				expect(cmdreg.help('ignored')).to.equal(cmdreg.commands);
			});

			it('Handler function gets command list (async)', function() {
				asmreg.helpHandler((name, commands) => commands);
				return expect(asmreg.help('ignored'))
					.to.eventually.equal(asmreg.commands);
			});

			it('Error from handler bubbles up', function() {
				cmdreg.helpHandler(() => {
					throw new Error('This thing broke');
				});
				expect(() => cmdreg.help('ignored')).to.throw('This thing broke');
			});

			it('Error from handler bubbles up (async)', function() {
				asmreg.helpHandler(() => {
					throw new Error('This thing broke');
				});
				return expect(asmreg.help('ignored'))
					.to.be.rejectedWith('This thing broke');
			});
		});

		describe('Command execution', function() {

			it('Return value from command bubbles up', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('com1').handler(() => 'My cool thing'));
				expect(cmdreg.execute('com1')).to.equal('My cool thing');
			});

			it('Return value from command bubbles up (async)', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('com1').handler(() => 'My cool thing'))
					.asynchronous(true);
				return expect(cmdreg.execute('com1'))
					.to.eventually.equal('My cool thing');
			});

			it('Error thrown from handler bubbles up', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('test').handler(() => {
						throw new Error('Bad things happened');
					}));
				expect(() => cmdreg.execute('test')).to.throw('Bad things happened');
			});

			it('Error thrown from handler bubbles up (async)', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('test').handler(() => {
						throw new Error('Bad things happened');
					}))
					.asynchronous(true);
				return expect(cmdreg.execute('test'))
					.to.be.rejectedWith('Bad things happened');
			});
		});

		describe('Switching async mode', function() {

			it('New commands inherit async setting', function() {
				const cmd = new Command('test');
				const cmdreg = new CommandRegistry().asynchronous(true);

				expect(cmd._async).to.be.false;

				cmdreg.add(cmd);

				expect(cmd._async).to.be.true;
			});

			it('Async changes applied recursively to commands', function() {
				const cmdreg = new CommandRegistry()
					.add(new Command('test1'))
					.add(new Command('test2'));
				const asyncCmds = () =>
					Array.from(cmdreg.commands.values()).filter(cmd => cmd._async);

				expect(asyncCmds()).to.be.empty;

				cmdreg.asynchronous(true);

				expect(asyncCmds()).to.have.lengthOf(2);
			});
		});
	});
});
