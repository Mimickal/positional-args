/*******************************************************************************
 * This file is part of positional-args, an argument parsing library for Node.js
 * Copyright (C) 2021 Mimickal (Mia Moretti).
 *
 * positional-args is free software under the GNU Lesser General Public License
 * v3.0. See LICENSE.md or <https://www.gnu.org/licenses/lgpl-3.0.en.html>
 * for more information.
 ******************************************************************************/

// Since you're reading this, I assume you either want to know how this code
// works, or want to make modifications to it (bless you).
//
// A bit of forewarning: if you don't have a very strong grasp of Promises,
// you might be in for a rough time here. The whole async portion of this
// library is built on Promise chains. If you're still feeling brave, I strongly
// recommend reading this excellent article on Promises:
// https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html


// Define references for JSDoc
/**
 * @external Array
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 */
/**
 * @external Error
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 */
/**
 * @external Map
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 */
/**
 * @external Object
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
 */
/**
 * @external Promise
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */
/**
 * @external String
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */
/**
 * An {@link external:Object} of parsed arguments for a command. Matches the
 * format from other argument parsing libraries, such as
 * <a href="https://www.npmjs.com/package/yargs">Yargs</a>.
 *
 * @typedef Args
 * @example
 * {
 *   _: ['my', 'cool', 'args'],
 *   arg1: 'my',
 *   arg2: 'cool',
 *   arg3: 'args',
 *   vararg1: ['thing1', 'thing2'],
 * }
 */
/**
 * A function a {@link Command} calls when it is executed.
 *
 * @callback Handler
 * @param {Args} args The {@link external:Object} of parsed arguments.
 * @param {?any[]} forward Arbitrary additional values.
 * @return {?any} Return value forwarded back to caller.
 * @return {Promise<?any>} In async mode.
 * @example
 * // Adds two numbers together and replies to a Discord.js message
 * function myHandler(args, message) {
 *     const val = args.val1 + args.val2;
 *     return message.reply('Result is ' + val);
 * }
 */
/**
 * A function a {@link CommandRegistry} can optionally call when it gets an
 * unrecognized command.
 *
 * **NOTE** the arguments passed to a `DefaultHandler` function are slightly
 * different than a normal `Handler`. It gets the string array of command parts
 * instead of a parsed {@link external:Object} of arguments.
 *
 * @callback DefaultHandler
 * @param {external:String[]} cmd_parts Array of command parts from
 *     {@link Command.split}.
 * @param {?any[]} forward Arbitrary additional values passed into
 *     {@link CommandRegistry.execute}.
 * @return {?any} Return value forwarded back to caller.
 * @return {Promise<?any>} In async mode.
 * @example
 * // Replying to a Discord.js message
 * function myDefaultHandler(cmd_parts, message) {
 *     return message.reply('Unrecognized command ' + cmd_parts.shift());
 * }
 */
/**
 * A function a {@link Command} can optionally use to handle values thrown
 * during execution.
 *
 * **NOTE** the arguments passed to an `ErrorHandler` function are slightly
 * different than a normal `Handler`. It gets the value thrown during execution.
 *
 * @callback ErrorHandler
 * @param {any} value Value thrown during command execution.
 * @param {?any[]} forward Arbitrary additional values passed into
 *     {@link Command.execute}.
 * @return {?any} Return value forwarded back to caller.
 * @return {Promise<?any>} In async mode.
 * @example
 * // Replying to a Discord.js message with the error
 * function myErrorHandler(err, message) {
 *     return message.reply('Command failed: ' + err.message);
 * }
 */
/**
 * A function a {@link CommandRegistry} can optionally use for its help
 * command.
 *
 * **NOTE** the arguments passed to a `HelpHandler` function are slightly
 * different than a normal `Handler`. It gets the `CommandRegistry`'s command
 * map as the second parameter.
 *
 * @callback HelpHandler
 * @param {Args} args Argument {@link external:Object} containing the following:
 *     - command - The command name.
 * @param {Map<Command>} commands The `CommandRegistry`'s Map of commands.
 * @param {?any[]} forward Arbitrary additional values passed into
 *     {@link CommandRegistry.execute}.
 * @return {?any} Return value forwarded back to caller.
 * @return {Promise<?any>} In async mode.
 * @example
 * // Replying to a Discord.js message
 * function myHelpHandler(args, commands, message) {
 *     return message.reply(commands.get(args.command).usage());
 * }
 */

/**
 * Represents a single positional argument for a command.
 */
class Argument {

	/**
	 * Constructs an argument with the given name.
	 */
	constructor(name) {
		if (!isString(name)) {
			throw new SetupError(`name was ${type(name)}, expected [object String]`);
		}
		if (!name) {
			throw new SetupError('name was empty string');
		}

		this._async = false;
		this._name = name;
		this._optional = false;
		this._preprocessor = null;
		this._varargs = false;
	}

	/**
	 * Enables/disables async mode. In async mode, Promises returned from
	 * preprocessors will be resolved automatically. This means
	 * <code>parse</code> will also return a Promise.
	 *
	 * Returns this so we can chain calls.
	 */
	asynchronous(enabled) {
		if (!isBoolean(enabled)) {
			throw new SetupError(
				`enabled was ${type(enabled)}, expected [object Boolean]`
			);
		}

		this._async = enabled;
		return this;
	}

	/**
	 * Marks this argument as optional. Only the last argument in an argument
	 * list may be optional.
	 *
	 * Returns this so we can chain calls.
	 */
	optional(enabled) {
		if (!isBoolean(enabled)) {
			throw new SetupError(
				`enabled was ${type(enabled)}, expected [object Boolean]`
			);
		}

		this._optional = enabled;
		return this;
	}

	/**
	 * Parses the given arg(s) using this Argument's preprocessor function.
	 *
	 * If the preprocessor command throws an error, this function will re-throw
	 * it with additional context.
	 *
	 * If no preprocessor is defined, the args are returned as given.
	 *
	 * If a single (non-array) value is given for a varargs argument, an array
	 * will still be returned.
	 *
	 * In async mode, this will always return a Promise that resolves to the
	 * parsed values.
	 */
	parse(args) {
		if (args != null && !isString(args) && !Array.isArray(args)) {
			throw new CommandError( // Because this is during command execution
				`args was ${type(args)}, expected [object String] or 'Array<string>'`
			);
		}

		if (this._async) {
			// Will auto-reject if this throws
			return new Promise(resolve => resolve(this._parseStart(args)));
		} else {
			return this._parseStart(args);
		}
	}

	/// Break this out so we can optionally async wrap
	_parseStart(args) {
		if (this._varargs) {
			return this._parseVarargs(args);
		} else {
			return this._parseSingle(args);
		}
	}

	/// Branch for parsing a single argument
	_parseSingle(arg) {
		if (arg == null && !this._optional) {
			throw new CommandError(
				`Too few arguments! Missing argument <${this._name}>`
			);
		}

		return this._applyPreprocessor(arg);
	}

	/// Branch for parsing multiple (varargs) arguments
	_parseVarargs(args) {
		if (args == null && !this._optional) {
			throw new CommandError('Too few arguments! ' +
				`Argument <${this._name}> requires at least one value.`
			);
		}

		if (args == null) {
			args = [];
		} else if (!Array.isArray(args)) {
			args = [args];
		}

		// Resolve individual Promises in async mode so we can return an array
		// of values instead of an array of Promises.
		const vals = args.map((val, index) => this._applyPreprocessor(val, index));
		return this._async ? Promise.all(vals) : vals;
	}

	/// Shared logic for applying the preprocessor function to an argument.
	_applyPreprocessor(input, index) {
		if (!input && this._optional) {
			// Important so this argument still shows up in the final object
			return null;
		}
		if (!this._preprocessor) {
			return input;
		}

		// Defining these in here so they have access to scoped variables.
		// Pass-through input value if preprocessor returned undefined
		const getReturnValue = val => val === undefined ? input : val;

		// Dress up errors thrown in preprocessor with additional context
		const throwWithContext = err => {
			let arg_id = `<${this._name}>`;

			// Give a little more context for varargs errors
			if (index != null) { // So index 0 is still true
				arg_id += `(${index + 1})`;
			}

			throw new CommandError(`Bad ${arg_id} value '${input}'`, err);
		};

		try {
			const processed = this._preprocessor(input);
			if (this._async && processed instanceof Promise) {
				return processed.then(getReturnValue).catch(throwWithContext);
			} else {
				return getReturnValue(processed);
			}
		} catch (err) {
			throwWithContext(err);
		}
	}

	/**
	 * Adds a function that processes an argument value before it reaches
	 * the command handler. This can double as a validator, and thrown
	 * exceptions will bubble up in a user-readable way.
	 * The return value of the given function will be forwarded to the command
	 * handler. If the given function does not return anything, the argument
	 * will be forwarded as-is.
	 *
	 * Returns this so we can chain calls.
	 */
	preprocess(func) {
		if (!isFunction(func) && !isAsyncFunction(func)) {
			throw new SetupError(`func was ${type(func)}, ` +
				'expected [object Function] or [object AsyncFunction]'
			);
		}

		this._preprocessor = func;
		return this;
	}

	/**
	 * Returns a human-readable string describing this argument.
	 */
	usage() {
		// b for bracket
		const lb = this._optional ? '[' : '<';
		const rb = this._optional ? ']' : '>';

		if (this._varargs) {
			return `${lb}${this._name}_1${rb} [${this._name}_2] ... [${this._name}_n]`;
		} else {
			return `${lb}${this._name}${rb}`;
		}
	}

	/**
	 * Allows this argument to accept multiple values. Each individual argument
	 * will be subject to the preprocessor, if one is given.
	 * A varargs argument must be the last argument for a command.
	 *
	 * Returns this so we can chain calls.
	 */
	varargs(enabled) {
		if (!isBoolean(enabled)) {
			throw new SetupError(
				`enabled was ${type(enabled)}, expected [object Boolean]`
			);
		}

		this._varargs = enabled;
		return this;
	}
}

/**
 * A text-based command with positional arguments.
 *
 * A `Command` can be given a set of {@link Argument}s (or multiple sets of
 * {@link Argument}s), parse strings into an object of values (see {@link Args}),
 * and pass those values to a function that runs on command execution.
 *
 * @example
 * function coerceToNumber(val) {
 *     if (!Number.isInteger(val)) throw new Error('not a number!');
 *     return Number.parseInt(val);
 * }
 * const command = new Command('example')
 *     .description('My cool command that adds numbers')
 *     .addArgSet([
 *         new Argument('arg1').preprocess(coerceToNumber),
 *         new Argument('arg2').preprocess(coerceToNumber),
 *     ])
 *     .handler((args, arbitrary) => {
 *         const value = args.arg1 + args.arg2;
 *         console.log('Value is', value);
 *         console.log('Also got this from caller:', arbitrary);
 *         return value;
 *     });
 *
 * const use  = command.usage();               // "example <arg1> <arg2>"
 * const val1 = command.execute('12 34');      // val1 = 46
 * const val2 = command.execute(['55', '45']); // val2 = 100
 * const val3 = command.execute('12');       // throws CommandError, missing second argument!
 * const val4 = command.execute('12 hello'); // throws CommandError, second argument not a number!
 */
class Command {

	/**
	 * Splits a command string into an array of tokens. This essentially just
	 * splits on whitespace.
	 *
	 * @param {external:String} string Command string to split.
	 * @return {external:String[]} {@link external:Array} of command tokens.
	 */
	static split(string) {
		if (!isString(string)) {
			throw new CommandError(
				`string was ${type(string)}, expected [object String]`
			);
		}

		// TODO maybe add ability to put args in quotes
		return string.split(/\s+/).filter(Boolean);
	}

	#argsets = [];
	#desc = null;
	#handler = null;
	#handler_err = null;
	#is_async = false;
	#name;

	/**
	 * Directly access the argument sets for this `Command`. This is a read-only
	 * property.
	 *
	 * @category accessor
	 */
	get argsets() {
		return this.#argsets.map(set => set.slice()); // Return a deep copy
	}

	/**
	 * Directly get and set the description for this `Command`. Setting this has
	 * the same effect as calling {@link Command.description}.
	 *
	 * @see {@link Command.description}
	 * @category accessor
	 */
	set desc(string) {
		if (!isString(string)) {
			throw new SetupError(`name was ${type(string)}, expected [object String]`);
		}

		this.#desc = string;
	}
	get desc() {
		return this.#desc;
	}

	/**
	 * Directly get and set asynchronous mode for this `Command`. Setting this
	 * has the same effect as calling {@link Command.asynchronous}.
	 *
	 * @see {@link Command.asynchronous}
	 * @category accessor
	 */
	set is_async(enabled) {
		if (!isBoolean(enabled)) {
			throw new SetupError(
				`enabled was ${type(enabled)}, expected [object Boolean]`
			);
		}

		this.#is_async = enabled;
		this.#applyAsyncToArgsets();
	}
	get is_async() {
		return this.#is_async;
	}

	/**
	 * Directly get and set the name for this `Command`. Subject to the same
	 * validation as `new Command(...)`.
	 *
	 * @category accessor
	 */
	set name(string) {
		if (!isString(string)) {
			throw new SetupError(`name was ${type(string)}, expected [object String]`);
		}
		if (!string) {
			throw new SetupError('name was empty string');
		}

		this.#name = string;
	}
	get name() {
		return this.#name;
	}

	/**
	 * Creates a new `Command` with the given name.
	 *
	 * @throws {SetupError} Missing, empty, or non-string names.
	 */
	constructor(name) {
		this.name = name;
	}

	/**
	 * Adds a set of {@link Argument}s this `Command` can accept.
	 * Arguments are all positional, so this function enforces several rules to
	 * avoid ambiguous command definitions:
	 * - A `Command` cannot have multiple argument sets with the same length.
	 * - A `Command` cannot have multiple argument sets with varargs arguments.
	 * - Optional arguments must be the last arguments in an argument set.
	 * - A varargs argument must be the last argument in an argument set.
	 * - The argument set containing a varargs argument must be the largest set.
	 *
	 * @category builder
	 * @param {Argument[]} argset {@link external:Array} of `Argument` objects.
	 * @throws {SetupError} for non-Array values.
	 * @throws {SetupError} for Arrays containing non-Argument values.
	 * @throws {SetupError} if any argument set rule is violated.
	 * @return {Command} instance so we can chain calls.
	 */
	addArgSet(argset) {
		if (!Array.isArray(argset) || !argset.every(arg => arg instanceof Argument)) {
			throw new SetupError("argset must be of type 'Array<Argument>'");
		}

		const pre = 'Ambiguous argument sets';
		const hasVarargs = (set) => set.find(arg => arg._varargs);
		const allsets = [...this.#argsets, argset];
		const max_set_len = allsets.reduce(
			(max, cur) => (cur.length > max ? cur.length : max), 0
		);

		if (this.#argsets.find(set => set.length === argset.length)) {
			throw new SetupError(`${pre}: Multiple sets of length ${argset.length}`);
		}

		if (argset.find(arg => arg._optional) &&
			argset.findIndex(arg => arg._optional) != argset.length - 1) {
			throw new SetupError(`${pre}: optional argument must be last in set`);
		}

		if (hasVarargs(argset) &&
			argset.findIndex(arg => arg._varargs) != argset.length - 1
		) {
			throw new SetupError(`${pre}: varargs argument must be last in set`);
		}

		if (allsets.filter(hasVarargs).length > 1) {
			throw new SetupError(`${pre}: Multiple sets containing varargs`);
		}

		if (allsets.find(hasVarargs) && (
				allsets.findIndex(hasVarargs) !==
				allsets.findIndex(set => set.length === max_set_len)
			)
		) {
			throw new SetupError(`${pre}: set containing varargs must be largest set`);
		}

		this.#argsets.push(argset);
		this.#applyAsyncToArgsets();
		return this;
	}

	 /**
	 * Enables or disables async mode. In async mode, {@link Command.execute}
	 * and {@link Command.parse} will both return a {@link external:Promise}
	 * that fulfills based on the command execution, instead of returning or
	 * throwing. This setting is applied recursively to all {@link Argument}s
	 * in this `Command`.
	 *
	 * @category builder
	 * @param {Boolean} enabled `true` to enable async, `false` to disable.
	 * @throws {SetupError} for non-`Boolean` values.
	 * @return {Command} instance so we can chain calls.
	 */
	asynchronous(enabled) {
		this.is_async = enabled;
		return this;
	}

	// Applies this Command's async setting to all known Arguments too.
	#applyAsyncToArgsets() {
		this.#argsets.forEach(argset =>
			argset.forEach(arg => arg.asynchronous(this.is_async))
		);
	}

	/**
	 * Sets the description text for this `Command`.
	 *
	 * @category builder
	 * @param {external:String} desc The description text.
	 * @throws {SetupError} for non-`String` values.
	 * @return {Command} instance so we can chain calls.
	 */
	description(desc) {
		this.desc = desc;
		return this;
	}

	/**
	 * Sets up a handler function for values thrown during command execution.
	 * When this is set, values will not be thrown (or passed to `.catch()` in
	 * async mode). Instead, they will be passed to this handler function, along
	 * with all of the arbitrary arguments originally forwarded from
	 * {@link Command.execute}. Additionally, values returned from this handler
	 * will be returned to the caller (via `.then()` in async mode). Values
	 * thrown within this handler will be re-thrown to the caller as a
	 * {@link CommandError} (bubbled up via `.catch()` in async mode).
	 *
	 * @category builder
	 * @param {ErrorHandler} func The error handler function.
	 * @throws {SetupError} for non-Function values.
	 * @return {Command} instance so we can chain calls.
	 */
	error(func) {
		if (!isFunction(func) && !isAsyncFunction(func)) {
			throw new SetupError(`func was ${type(func)}, ` +
				'expected [object Function] or [object AsyncFunction]'
			);
		}

		this.#handler_err = func;
		return this;
	}

	/**
	 * Executes an argument string (or array) using the handler for this
	 * `Command`. Additional arbitrary arguments can be forwarded to the command
	 * handler. Values returned from the handler will be returned from this
	 * function (or bubble up via `.then()` in async mode). Values thrown from
	 * the handler will be rethrown from this function (or bubble up via
	 * `.catch()` in async mode).
	 *
	 * If an {@link ErrorHandler} has been set via {@link Command.error}, values
	 * thrown from the handler function will be passed to that handler instead
	 * of being rethrown from this function. The error handler is subject to all
	 * of the same conditions as the command handler, so values returned/thrown
	 * from the error handler will be returned/thrown from this function
	 * (or bubble up via `.then()` and `.catch()`, respectively in async mode).
	 *
	 * If this `Command` has no handler, the given arguments will still be
	 * processed and validated.
	 *
	 * @category execution
	 * @param {external:String|external:String[]} parts Arguments for this
	 *     command. Should not include the command's name.
	 * @param {?any[]} forward Arbitrary additional values passed to handler.
	 * @throws {CommandError} for all reasons as {@link Command.parse}.
	 * @throws {CommandError} for anything thrown within the handler.
	 * @return {?any} Whatever the handler function returns.
	 * @return {Promise<?any>} in async mode.
	 */
	execute(parts, ...forward) {
		if (isString(parts)) {
			parts = Command.split(parts);
		}

		return this.is_async ?
			this.#executeAsync(parts, ...forward) :
			this.#executeSync(parts, ...forward);
	}

	// Sync branch of execute
	#executeSync(parts, ...forward) {
		let parsed_parts;
		try {
			parsed_parts = this.parse(parts);
		} catch (err) {
			return this.#executeHandleError(err, ...forward);
		}

		if (this.#handler) {
			try {
				return this.#handler(parsed_parts, ...forward);
			} catch (err) {
				const cmderr = new CommandError('Command failed', err);
				return this.#executeHandleError(cmderr, ...forward);
			}
		}
	}

	// Async branch of execute that always returns a Promise
	#executeAsync(parts, ...forward) {
		return Promise.resolve(this.parse(parts))
			.then(parsed_parts => {
				if (!this.#handler) {
					return Promise.resolve(); // Resolve to undefined
				}

				// Wrap in new Promise to catch both sync and async errors
				return new Promise(resolve => {
					resolve(this.#handler(parsed_parts, ...forward));
				})
				.catch(err => {
					// Bubble up to the next .catch with additional context
					throw new CommandError('Command failed', err);
				});
			})
			.catch(err => this.#executeHandleError(err, ...forward));
	}

	// De-duplicated logic for passing execution errors to the error handler.
	#executeHandleError(err, ...forward) {
		err = this.#wrap(err);

		if (this.#handler_err) {
			return this.#handler_err(err, ...forward);
		}

		throw err;
	}

	/**
	 * Sets up a handler function when this `Command` is executed.
	 *
	 * @category builder
	 * @param {Handler} func The handler function.
	 * @throws {SetupError} for non-Function values.
	 * @return {Command} instance so we can chain calls.
	 */
	handler(func) {
		if (!isFunction(func) && !isAsyncFunction(func)) {
			throw new SetupError(`func was ${type(func)}, ` +
				'expected [object Function] or [object AsyncFunction]'
			);
		}

		this.#handler = func;
		return this;
	}

	/**
	 * Parses the given positional argument array into an Object of values.
	 * This function does its best to match the given values to an appropriate
	 * argument set. Since all arguments are positional, error diagnostics are
	 * limited if this `Command` has multiple argument sets defined.
	 *
	 * @category execution
	 * @param {external:String[]} parts Array of command parts from
	 *     {@link Command.split}.
	 * @throws {CommandError} if no argument set matches the given parts.
	 * @throws {CommandError} if any argument preprocessor function throws.
	 * @return {Args} the parsed {@link external:Object} of arguments.
	 * @return {Promise<Args>} in async mode.
	 */
	parse(parts) {
		parts = parts || [];
		const copy = parts.slice(); // Operate on a copy

		const parsed = {};
		parsed['_'] = parts.slice(); // Store a (second) copy

		let argset;

		if (this.#argsets.length <= 1) {
			argset = this.#argsets[0] || [];
		} else {
			argset = this.#argsets.find(set => set.length === copy.length);

			if (!argset) {
				const err = this.#wrap(new CommandError(
					'Wrong number of arguments! See command help for details'
				));
				if (this.is_async) return Promise.reject(err);
				throw err;
			}
		}

		// If this command has multiple argument sets, the above logic ensures
		// we have the correct number of arguments once we get here.
		// All the validation in addArgSet guarantees varargs arguments
		// only appear once, as the last argument in the largest set.
		// Also yeah, I know we're modifying things by reference here. It's
		// weird, but so is mixing async and sync.
		if (this.is_async) {
			return executeSequentially(
				argset, arg => this.#parseAsync(arg, parsed, copy)
			)
			.then(() => this.#parseCheckExtraArgs(copy))
			.then(() => parsed)
			.catch(err => { throw this.#wrap(err) });
		} else {
			try {
				argset.forEach(arg => this.#parseSync(arg, parsed, copy));
				this.#parseCheckExtraArgs(copy);
				return parsed;
			} catch (err) {
				throw this.#wrap(err);
			}
		}
	}

	// The sync version of argument parsing
	#parseSync(arg, parsed, parts_ref) {
		if (arg._varargs) {
			parsed[arg._name] = arg.parse(parts_ref);
			parts_ref.length = 0; // Clear array to avoid below length Error
		} else {
			parsed[arg._name] = arg.parse(parts_ref.shift());
		}
	}

	// The async version of argument parsing
	async #parseAsync(arg, parsed, parts_ref) {
		if (arg._varargs) {
			parsed[arg._name] = await arg.parse(parts_ref);
			parts_ref.length = 0; // Clear array since varargs parsed all of it.
			// This is safe to do here because varargs Arguments must be last in
			// the arg list, and we execute argument parsing sequentially.
		} else {
			parsed[arg._name] = await arg.parse(parts_ref.shift());
		}
	}

	// Shared check for extraneous args used by both sync and async workflow
	#parseCheckExtraArgs(parts_ref) {
		if (parts_ref.length > 0) {
			// We'll catch and wrap this later
			throw new CommandError(
				'Too many arguments! Extras: ' +
				parts_ref.map(val => `'${val}'`).join(', '),
			);
		}
	}

	/**
	 * Generates a string describing the usage of this `Command`.
	 * If this command has multiple argument sets, each version of the command
	 * is in the string, separated by a newline. If the command has no argument
	 * sets, this just returns the command name.
	 *
	 * @category execution
	 * @return {external:String} description of command usage.
	 */
	usage() {
		// TODO consider "fullUsage" that also includes description, or take bool
		const use = this.#argsets.map(argset =>
			`${this.name} ${argset.map(arg => arg.usage()).join(' ')}`
		).join('\n');
		// Just return the command name if there are no arguments.
		return use || `${this.name}`;
	}

	// Injects this command instance into CommandErrors
	#wrap(err) {
		if (err instanceof CommandError) {
			err.command = this;
		}
		return err;
	}
}

/**
 * Error thrown during execution of {@link Argument}, {@link Command}, and
 * {@link CommandRegistry} objects.
 *
 * Anything thrown in user-provided code (command handlers and argument
 * preprocessors) is wrapped with a `CommandError`. The `CommandError` instance
 * also contains additional context, such as extended error messages and a
 * reference to the {@link Command} that threw (if any). This allows callers
 * to do command-specific error handling, if necessary.
 *
 * @extends {external:Error}
 * @typicalname err
 */
class CommandError extends Error {

	/**
	 * The {@link Command} this `CommandError` originated in, if any.
	 */
	command = undefined;

	/**
	 * A simple flag callers can check to see if an `Error` is a `CommandError`.
	 * This field is always `true`, and is provided only as an alternative to
	 * `error instanceof CommandError`.
	 */
	is_command_error = true;

	/**
	 * The value that was actually thrown in the user code. This could be
	 * anything.
	 */
	nested = null;

	constructor(message, nested_err) {
		super(message);
		this.nested = nested_err;
	}

	/**
	 * Gets this `CommandError`'s `message` combined with `nested.message`, if
	 * `nested` is an {@link external:Error}. Otherwise, this value is identical
	 * to {@link CommandError.message}.
	 */
	get full_message() {
		let msg = this.message;
		// TODO handle wrapping another CommandError?
		if (this.nested instanceof Error && this.nested.message) {
			msg += `: ${this.nested.message}`;
		}
		return msg;
	}
}

/**
 * Error thrown when setting up {@link Argument}, {@link Command}, and
 * {@link CommandRegistry} objects. These are typically thrown for invalid
 * values, such as passing non-Function values for handler functions.
 *
 * @extends {external:Error}
 * @typicalname err
 */
class SetupError extends Error {
	constructor(message) {
		super(message);
	}
}

/**
 * A registry containing commands. Can take in command strings and delegate them
 * to the appropriate commands.
 *
 * @typicalname registry
 */
class CommandRegistry {

	/**
	 * An optional default handler for unrecognized commands. Simply throws an
	 * error.
	 *
	 * @see {@link DefaultHandler}
	 * @param {external:String[]} cmd_parts Array of command parts from
	 *     {@link Command.split}.
	 * @throws {Error} Always
	 */
	static defaultDefaultHandler(cmd_parts) {
		const cmd_name = cmd_parts.shift();
		throw new Error(`Unrecognized command '${cmd_name}'`);
	}

	/**
	 * An optional default handler for the help command. Returns the usage for
	 * the given command, according to its {@link Command.usage} function. If no
	 * command name is given, returns the usage for all known commands,
	 * separated by newlines.
	 *
	 * @see {@link HelpHandler}
	 * @param {Args} args Argument {@link external:Object} containing at least
	 *     `command`.
	 * @param {Map<Command>} commands The `Map` of `Commands` in the registry.
	 * @return {external:String} Description of the given command, or all known
	 *     commands.
	 */
	static defaultHelpHandler(args, commands) {
		if (args.command) {
			const cmd = commands.get(args.command);
			if (cmd) {
				return cmd.usage();
			} else {
				return `Unknown command '${args.command}'`;
			}
		} else {
			return Array.from(commands.values())
				.map(cmd => cmd.usage())
				.join('\n');
		}
	}

	/**
	 * The {@link external:Map} of {@link Command} objects. Useful for iterating.
	 *
	 * @category accessor
	 */
	commands = new Map();
	#is_async = false;
	#default_handler = null;

	/**
	 * Directly get and set asynchronous mode for this `CommandRegistry`.
	 * Setting this has the same effect as calling
	 * {@link CommandRegistry.asynchronous}.
	 *
	 * @see {@link CommandRegistry.asynchronous}
	 * @category accessor
	 */
	set is_async(enabled) {
		if (!isBoolean(enabled)) {
			throw new SetupError(
				`enabled was ${type(enabled)}, expected [object Boolean]`
			);
		}

		this.#is_async = enabled;
		this.#applyAsyncToCommands();
	}
	get is_async() {
		return this.#is_async;
	}

	/**
	 * Directly get and set the default handler for unrecognized commands for
	 * this `CommandRegistry`. Setting this has the same effect as calling
	 * {@link CommandRegistry.defaultHandler}.
	 *
	 * @see {@link CommandRegistry.defaultHandler}
	 * @category accessor
	 */
	set default_handler(func) {
		if (!isFunction(func) && !isAsyncFunction(func)) {
			throw new SetupError(`func was ${type(func)}, ` +
				'expected [object Function] or [object AsyncFunction]'
			);
		}

		this.#default_handler = func;
	}
	get default_handler() {
		return this.#default_handler;
	}

	/**
	 * Creates a new `CommandRegistry`.
	 */
	constructor() { }

	/**
	 * Adds a {@link Command} to this `CommandRegistry`. All commands must have
	 * unique names. If this `CommandRegistry` is in async mode, the
	 * `Command` will be switched to async mode too.
	 *
	 * @category builder
	 * @param {Command} command The command to add.
	 * @throws {SetupError} For non-`Command` values.
	 * @throws {SetupError} If the `CommandRegistry` already has a `Command`
	 *     with the given name.
	 * @return {CommandRegistry} instance so we can chain calls.
	 */
	add(command) {
		if (!(command instanceof Command)) {
			throw new SetupError(
				`command was ${type(command)}, expected [object Command]`
			);
		}
		if (this.commands.has(command.name)) {
			throw new SetupError(`Defined duplicate command '${command.name}'`);
		}

		this.commands.set(command.name, command);
		this.#applyAsyncToCommands();
		return this;
	}

	/**
	 * Enables or disables async mode for this `CommandRegistry`. In async mode,
	 * {@link CommandRegistry.help} and {@link CommandRegistry.execute} will
	 * both return a {@link external:Promise} that fulfills based on the command
	 * execution. This setting is applied recursively to all {@link Command}s
	 * and {@link Argument}s in this `CommandRegistry`.
	 *
	 * @category builder
	 * @param {Boolean} enabled `true` to enable async, `false` to disable.
	 * @throws {SetupError} for non-`Boolean` values.
	 * @return {CommandRegistry} instance so we can chain calls.
	 */
	asynchronous(enabled) {
		this.is_async = enabled;
		return this
	}

	// Recursively apply this CommandRegistry's async setting to all commands.
	#applyAsyncToCommands() {
		this.commands.forEach(cmd => cmd.asynchronous(this.is_async));
	}

	/**
	 * Sets up a handler function for unrecognized commands.
	 * If this is not set, unknown commands are a no-op.
	 *
	 * **NOTE** the default handler function signature is slightly different
	 * from other handlers (see {@link DefaultHandler}).
	 *
	 * @category builder
	 * @param {?DefaultHandler} func The handler function. If omitted, uses
	 *     {@link CommandRegistry.defaultDefaultHandler}.
	 * @throws {SetupError} for non-Function values.
	 * @return {CommandRegistry} instance so we can chain calls.
	 */
	defaultHandler(func) {
		func = func || CommandRegistry.defaultDefaultHandler;
		this.default_handler = func;
		return this;
	}

	/**
	 * Executes a string (or array) as a command. Additional arbitrary arguments
	 * can be forwarded to the command handler, and the value returned from the
	 * command handler will bubble up and return from this function. If this
	 * `CommandRegistry` does not have a command matching the given string, this
	 * is either a no-op, or the default command handler is called (if set). If
	 * the given command's name is `help`, this call is equivalent to calling
	 * {@link CommandRegistry.help}.
	 *
	 * @category execution
	 * @see {@link Command.execute}
	 * @param {external:String|external:String[]} parts A string containing a
	 *     command, or a pre-split {@link external:Array} of command parts.
	 * @param {?any[]} forward Arbitrary additional values passed to handler.
	 * @throws {CommandError} Wraps anything thrown in handler.
	 * @return {?any} Return value forwarded back to caller.
	 * @return {Promise<?any>} In async mode.
	 * @example
	 * // Call a command that adds two numbers
	 * let x = registry.execute('add 12 14'); // x is 26
	 * let x = registry.execute(['add', '10', '20']); // x is 30
	 *
	 * // Call a command from a Discord.js message.
	 * // Remember to sanitize your inputs! https://xkcd.com/327/
	 * registry.execute(msg.content, msg);
	 */
	execute(parts, ...forward) {
		const executeInner = () => {
			if (isString(parts)) {
				parts = Command.split(parts);
			}
			const cmd_name = parts.shift();

			if (this.commands.has(cmd_name)) {
				const mod_forward = [...forward];
				if (cmd_name === 'help') {
					mod_forward.unshift(this.commands);
				}

				return this.commands.get(cmd_name).execute(parts, ...mod_forward);
			} else if (this.default_handler) {
				return this.default_handler([cmd_name, ...parts], ...forward);
			}
		};

		return this.is_async ?
			new Promise(resolve => resolve(executeInner())) :
			executeInner();
	}

	/**
	 * Executes the help command for this `CommandRegistry`. In order for this
	 * function to do anything, {@link CommandRegistry.helpHandler} needs to
	 * be called first to set up a help command. Like
	 * {@link CommandRegistry.execute}, this function can forward additional
	 * arbitrary arguments to the help handler function, and the value returned
	 * from the help handler will bubble up to this function.
	 *
	 * @category execution
	 * @param {?external:String} cmd_name The name of a command to request help
	 *     for. In order to omit this value while providing forwarded arguments,
	 *     pass in a falsy value, like `null`.
	 * @param {?any[]} forward Arbitrary additional values passed to handler.
	 * @throws {CommandError} Wraps anything thrown in handler.
	 * @return {?any} Return value forwarded back to caller.
	 * @return {Promise<?any>} In async mode.
	 * @example
	 * registry.help();
	 * registry.help('say');
	 * registry.help('say', msg);
	 * registry.help(null, msg);
	 */
	help(cmd_name, ...forward) {
		// TODO Maybe registries should come with the help command set up already?
		cmd_name = cmd_name || '';
		return this.execute(`help ${cmd_name}`, ...forward);
	}

	/**
	 * Sets up a help command using the given {@link HelpHandler} function.
	 * If this is not set, help commands are treated like unknown commands.
	 *
	 * **NOTE** the help handler function signature is slightly different from
	 * other handlers (see {@link HelpHandler}).
	 *
	 * @category builder
	 * @param {?HelpHandler} func The handler function. If omitted, uses
	 *     {@link CommandRegistry.defaultHelpHandler}.
	 * @throws {SetupError} for non-Function values.
	 * @return {CommandRegistry} instance so we can chain calls.
	 */
	helpHandler(func) {
		// Command.handler checks if this is a valid function
		func = func || CommandRegistry.defaultHelpHandler;

		if (!this.commands.has('help')) {
			this.add(new Command('help')
				.description('Generates command help text')
				.addArgSet([new Argument('command').optional(true)])
				.handler(func)
			);
		}

		this.commands.get('help').handler(func);
		return this;
	}
}

async function executeSequentially(values, func) {
	for (const val of values) {
		await func(val);
	}
}

// This is probably why TypeScript was created.
function isBoolean(value) {
	return type(value) === '[object Boolean]';
}

function isFunction(value) {
	return type(value) === '[object Function]';
}

function isAsyncFunction(value) {
	return type(value) === '[object AsyncFunction]';
}

function isString(value) {
	return type(value) === '[object String]';
}

function type(value) {
	return Object.prototype.toString.call(value)
}

module.exports = {
	Argument,
	Command,
	CommandError,
	CommandRegistry,
	SetupError,
};
