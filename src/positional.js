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
		if (typeof name !== 'string') {
			throw new Error(`name was '${typeof name}', expected 'string'`);
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
		if (typeof args !== 'string' && !(args instanceof Array)) {
			throw new Error(
				`args was '${typeof args}', expected 'string' or 'Array<string>'`
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
				return typeof returned === 'undefined' ? copy : returned;
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

		if (this._varargs && args instanceof Array) {
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
		if (typeof func !== 'function') {
			throw new Error(`func was '${typeof func}', expected 'function'`);
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
		if (typeof enabled !== 'boolean') {
			throw new Error(`enabled was '${typeof enabled}', expected 'boolean'`);
		}

		this._varargs = enabled;
		return this;
	}
}
