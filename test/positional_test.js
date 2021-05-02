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

describe('Positional command parser', function() {

	describe('Argument', function() {

		describe('Basic Errors', function() {

			it('Missing Argument name', function() {
				expect(() => new Argument()).to.throw(
					"name was 'undefined', expected 'string'"
				);
			});

			it('Non-string Argument name', function() {
				expect(() => new Argument({})).to.throw(
					"name was 'object', expected 'string'"
				);
			});

			it('Empty Argument name', function() {
				expect(() => new Argument('')).to.throw('name was empty string');
			});

			it('Non-boolean varargs flag', function() {
				expect(() => new Argument('test').varargs({})).to.throw(
					"enabled was 'object', expected 'boolean'"
				);
			});

			it('Non-function preprocessor', function () {
				expect(() => new Argument('test').preprocess({})).to.throw(
					"func was 'object', expected 'function'"
				);
			});

			it('Non-string and non-Array args', function() {
				expect(() => new Argument('test').parse({})).to.throw(
					"args was 'object', expected 'string' or 'Array<string>'"
				);
				expect(() => new Argument('test').parse(true)).to.throw(
					"args was 'boolean', expected 'string' or 'Array<string>'"
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
});
