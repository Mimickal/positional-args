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

			function validator(arg) {
				if (arg.startsWith('x')) {
					throw new Error('x is bad');
				}
			}

			it('Error thrown in preprocessor bubbles up', function() {
				const arg = new Argument('test').preprocess(validator);
				expect(() => arg.parse('xyz')).to.throw(
					"Bad <test> value 'xyz': x is bad"
				);
			});

			it('Error thrown in preprocessor bubbles up for varargs', function() {
				const arg = new Argument('test')
					.preprocess(validator)
					.varargs(true);

				expect(() => arg.parse(['aaa', 'bxb', 'xcc'])).to.throw(
					"Bad <test>(3) value 'xcc': x is bad"
				);
			});
		});

		describe('Usage strings', function() {

			it('Shows argument name', function() {
				const arg = new Argument('test');
				expect(arg.usage()).to.equal('<test>');
			});

			it('Varargs shows argument name multiple times', function() {
				const arg = new Argument('test').varargs(true);
				expect(arg.usage()).to.equal('<test_1> <test_2> ... <test_n>');
			});
		});
	});

	describe('Command', function() {

		describe('(static) split command string', function() {

			it('Command string split into object', function() {
				expect(Command.split('mycmd arg1 arg2 arg3')).to.deep.equal({
					name: 'mycmd',
					parts: ['arg1', 'arg2', 'arg3'],
				})
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
					'test <first> <rest_1> <rest_2> ... <rest_n>'
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

			it('Exception for multiple arg sets with same length', function() {
				expect(() => new Command('test')
					.addArgSet([new Argument('test1'), new Argument('test2')])
					.addArgSet([new Argument('test3'), new Argument('test4')])
				).to.throw('Multiple argument sets of length 2');
			});

			it('Exception thrown if non-last varargs argument', function() {
				expect(() => new Command('test')
					.addArgSet([
						new Argument('test').varargs(true),
						new Argument('last'),
					])
				).to.throw('Only the last argument may be a varargs argument');
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
					).to.throw("Too many arguments! Extras: 'things', 'stuff'");
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
						'Wrong number of arguments! See command help for details'
					);
				});

				it('Error thrown if no argset matches (middle args)', function() {
					expect(() => cmd.parse(['xx', 'yy'])).to.throw(
						'Wrong number of arguments! See command help for details'
					);
				});

				it('Error thrown if no argset matches (too many args)', function() {
					expect(() => cmd.parse(['xx', 'yy', 'zz', 'ii', 'jj'])).to.throw(
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

});
