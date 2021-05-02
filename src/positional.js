/*******************************************************************************
 * This file is part of No BS Role Reacts, a role-assigning Discord bot.
 * Copyright (C) 2020 Mimickal (Mia Moretti).
 *
 * No BS Role Reacts is free software under the GNU Affero General Public
 * License v3.0. See LICENSE or <https://www.gnu.org/licenses/agpl-3.0.en.html>
 * for more information.
 ******************************************************************************/


/**
 * Represents a single positional argument for a command.
 */
class Argument {

	/**
	 * Constructs an argument with the given name.
	 */
	constructor(name) {
		if (!isString(name)) {
			throw new Error(`name was ${type(name)}, expected [object String]`);
		}
		if (!name) {
			throw new Error('name was empty string');
		}

		this._name = name;
		this._preprocessor = null;
		this._varargs = false;
	}

	/**
	 * Parses the given arg(s) using this Argument's preprocessor function.
	 * If the preprocessor command throws an error, this function will re-throw
	 * it with additional context.
	 * If no preprocessor is defined, the args are returned as given.
	 */
	parse(args) {
		// TODO async preprocessor function?
		if (!isString(args) && !Array.isArray(args)) {
			throw new Error(
				`args was ${type(args)}, expected [object String] or 'Array<string>'`
			);
		}

		const applyPreprocessor = (input, index) => {
			if (!this._preprocessor) {
				return input;
			}

			// Save a copy so processor can't molest the value
			const copy = `${input}`;

			try {
				const returned = this._preprocessor(input);
				return returned === undefined ? copy : returned;
			}
			catch (err) {
				let arg_id = `<${this._name}>`;

				// Give a little more context for varargs errors
				if (index != null) { // So index 0 is still true
					arg_id += `(${index + 1})`;
				}

				throw new Error(
					`Bad ${arg_id} value '${copy}': ${err.message}`
				);
			}
		}

		if (this._varargs && Array.isArray(args)) {
			return args.map(applyPreprocessor);
		} else {
			return applyPreprocessor(args);
		}
	}

	/**
	 * Adds a function that processes an argument value before it reaches
	 * the command handler. This can double as a validator, and thrown
	 * exceptions will bubble up in a user-readable way.
	 * The return value of the given function will be forwarded to the command
	 * handler. If the given function does not return anything, the argument
	 * will be forwarded as-is.
	 */
	preprocess(func) {
		if (!isFunction(func)) {
			throw new Error(`func was ${type(func)}, expected [object Function]`);
		}

		this._preprocessor = func;
		return this;
	}

	/**
	 * Returns a human-readable string describing this argument.
	 */
	usage() {
		if (this._varargs) {
			return `<${this._name}_1> <${this._name}_2> ... <${this._name}_n>`;
		} else {
			return `<${this._name}>`;
		}
	}

	/**
	 * Allows this argument to accept multiple values. Each individual argument
	 * will be subject to the preprocessor, if one is given.
	 * A varargs argument must be the last argument for a command.
	 */
	varargs(enabled) {
		if (!isBoolean(enabled)) {
			throw new Error(`enabled was ${type(enabled)}, expected [object Boolean]`);
		}

		this._varargs = enabled;
		return this;
	}
}

/**
 * Represents a text-based command with positional arguments.
 */
class Command {

	/**
	 * Splits a string into a hash describing the command name and split command
	 * parts.
	 */
	static split(string) {
		if (!isString(string)) {
			throw new Error(
				`string was ${type(string)}, expected [object String]`
			);
		}

		let parts = string.split(/\s+/);
		return {
			name: parts.shift(),
			parts: parts,
		};
	}

	/**
	 * Begins constructing a command with the given name.
	 */
	constructor(name) {
		if (!isString(name)) {
			throw new Error(`name was ${type(name)}, expected [object String]`);
		}
		if (!name) {
			throw new Error('name was empty string');
		}

		this._name = name;
		this._argsets = [];
		this._description = null;
		this._handler = null;
	}

	/**
	 * Adds a set of arguments this command can accept.
	 * Expects an array of <code>Argument</code> objects. A command cannot have
	 * multiple argument sets with the same length. If an argument set contains
	 * a varargs argument, the varargs argument must be the last one in the set.
	 * Returns this so we can chain calls.
	 */
	addArgSet(argset) {
		if (!Array.isArray(argset) || !argset.every(arg => arg instanceof Argument)) {
			throw new Error("argset must be of type 'Array<Argument>'");
		}
		if (this._argsets.find(set => set.length === argset.length)) {
			throw new Error(`Multiple argument sets of length ${argset.length}`);
		}
		if (
			argset.find(arg => arg._varargs) &&
			argset.findIndex(arg => arg._varargs) !== argset.length - 1
		) {
			throw new Error('Only the last argument may be a varargs argument');
		}

		this._argsets.push(argset);
		return this;
	}

	/**
	 * Sets the description for this command.
	 * Returns this so we can chain calls.
	 */
	description(desc) {
		if (!isString(desc)) {
			throw new Error(`name was ${type(desc)}, expected [object String]`);
		}

		this._description = desc;
		return this;
	}

	/**
	 * Parses the given positional argument array, then passes the resulting
	 * structure into this command's handler function. Additional values can be
	 * passed in to forward them directly to the handler.
	 * The return value is whatever the handler function returns.
	 * If this command does not have a handler, the arguments will still be
	 * proecessed and validation will still be applied.
	 */
	execute(parts, ...forward) {
		const parsed_parts = this.parse(parts);
		if (this._handler) {
			try {
				return this._handler(parsed_parts, ...forward);
			} catch (err) {
				throw new Error(`Command failed: ${err.message}`);
			}
		}
	}

	/**
	 * Returns the command's description. We'll usually do this alongside
	 * usage(), so make this look like a function call too.
	 */
	getDescription() {
		return this._description;
	}

	/**
	 * Sets the function to execute when this command is called.
	 * The parsed argument hash is passed into this function, along with any
	 * forwarded arguments passed into <code>execute</code>.
	 * Returns this so we can chain calls.
	 */
	handler(func) {
		if (!isFunction(func)) {
			throw new Error(`func was ${type(func)}, expected [object Function]`);
		}

		this._handler = func;
		return this;
	}

	/**
	 * Returns a string describing command usage.
	 * If the command has multiple argument sets, each version of the command is
	 * in the string, separated by a newline.
	 */
	usage() {
		const use = this._argsets.map(argset =>
			`${this._name} ${argset.map(arg => arg.usage()).join(' ')}`
		).join('\n');
		// Just return the command name if there are no arguments.
		return use || `${this._name}`;
	}

	/**
	 * Parses the given positional value array into a structure resembling
	 * argument parsing libraries like yargs.
	 *
	 * This function do its best to match the values to one of the command's
	 * argument sets. Since all arguments are positional, diagnostics are
	 * limited if the argument has multiple argument sets defined.
	 */
	parse(parts) {
		parts = parts || [];
		const copy = parts.slice(); // Operate on a copy

		const parsed = {};
		parsed['_'] = parts.slice(); // Store a (second) copy

		let argset;

		if (this._argsets.length <= 1) {
			argset = this._argsets[0] || [];
		} else {
			argset = this._argsets.find(set => set.length === copy.length);

			if (!argset) {
				throw new Error(
					'Wrong number of arguments! See command help for details'
				);
			}
		}

		// If this command has multiple argument sets, the above logic ensures
		// we have the correct number of arguments once we get here.
		argset.forEach(arg => {
			if (arg._varargs) {
				parsed[arg._name] = copy.map(value => arg.parse(value));
				copy.length = 0; // Clear array
			} else {
				const value = copy.shift();
				if (value !== undefined) {
					parsed[arg._name] = arg.parse(value);
				} else {
					throw new Error(
						`Too few arguments! Missing argument <${arg._name}>`
					);
				}
			}
		});

		if (copy.length > 0) {
			throw new Error(
				'Too many arguments! Extras: ' +
				copy.map(val => `'${val}'`).join(', ')
			);
		}

		return parsed;
	}
}

// This is probably why TypeScript was created.
function isBoolean(value) {
	return type(value) === '[object Boolean]';
}

function isFunction(value) {
	return type(value) === '[object Function]';
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
};
