## Classes

<dl>
<dt><a href="#Argument">Argument</a></dt>
<dd><p>A single positional argument. These are intended to be nested within
<a href="#Command">Command</a> objects, but can also be used standalone.</p>
<p>By default, an <code>Argument</code> represents a single, required argument with no
validation or preprocessing applied. All of these defaults can be modified.</p>
<ul>
<li><a href="#Preprocessor">Preprocessor</a>s can validate and modify the argument.</li>
<li>An <code>Argument</code> can be optional, preventing <a href="#CommandError">CommandError</a>s from being
thrown for missing values.</li>
<li>Variable arguments (varargs) can be enabled to take in multiple values.</li>
</ul>
</dd>
<dt><a href="#Command">Command</a></dt>
<dd><p>A text-based command with positional arguments.</p>
<p>A <code>Command</code> can be given a set of <a href="#Argument">Argument</a>s (or multiple sets of
<a href="#Argument">Argument</a>s), parse strings into an object of values (see <a href="#Args">Args</a>),
and pass those values to a function that runs on command execution.</p>
</dd>
<dt><a href="#CommandError">CommandError</a> ⇐ <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error">Error</a></code></dt>
<dd><p>Error thrown during execution of <a href="#Argument">Argument</a>, <a href="#Command">Command</a>, and
<a href="#CommandRegistry">CommandRegistry</a> objects.</p>
<p>Anything thrown in user-provided code (command handlers and argument
preprocessors) is wrapped with a <code>CommandError</code>. The <code>CommandError</code> instance
also contains additional context, such as extended error messages and a
reference to the <a href="#Command">Command</a> that threw (if any). This allows callers
to do command-specific error handling, if necessary.</p>
</dd>
<dt><a href="#SetupError">SetupError</a> ⇐ <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error">Error</a></code></dt>
<dd><p>Error thrown when setting up <a href="#Argument">Argument</a>, <a href="#Command">Command</a>, and
<a href="#CommandRegistry">CommandRegistry</a> objects. These are typically thrown for invalid
values, such as passing non-Function values for handler functions.</p>
</dd>
<dt><a href="#CommandRegistry">CommandRegistry</a></dt>
<dd><p>A registry containing commands. Can take in command strings and delegate them
to the appropriate commands.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Args">Args</a></dt>
<dd><p>An <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">Object</a> of parsed arguments for a command. Matches the
format from other argument parsing libraries, such as
<a href="https://www.npmjs.com/package/yargs">Yargs</a>.</p>
</dd>
<dt><a href="#Handler">Handler</a> ⇒ <code>any</code> | <code>Promise.&lt;?any&gt;</code></dt>
<dd><p>A function a <a href="#Command">Command</a> calls when it is executed.</p>
</dd>
<dt><a href="#DefaultHandler">DefaultHandler</a> ⇒ <code>any</code> | <code>Promise.&lt;?any&gt;</code></dt>
<dd><p>A function a <a href="#CommandRegistry">CommandRegistry</a> can optionally call when it gets an
unrecognized command.</p>
<p><strong>NOTE</strong> the arguments passed to a <code>DefaultHandler</code> function are slightly
different than a normal <a href="#Handler">Handler</a>. It gets the string array of command
parts instead of a parsed <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">Object</a> of arguments.</p>
</dd>
<dt><a href="#ErrorHandler">ErrorHandler</a> ⇒ <code>any</code> | <code>Promise.&lt;?any&gt;</code></dt>
<dd><p>A function a <a href="#Command">Command</a> can optionally use to handle values thrown
during execution.</p>
<p><strong>NOTE</strong> the arguments passed to an <code>ErrorHandler</code> function are slightly
different than a normal <a href="#Handler">Handler</a>. It gets the value thrown during
execution.</p>
</dd>
<dt><a href="#HelpHandler">HelpHandler</a> ⇒ <code>any</code> | <code>Promise.&lt;?any&gt;</code></dt>
<dd><p>A function a <a href="#CommandRegistry">CommandRegistry</a> can optionally use for its help
command.</p>
<p><strong>NOTE</strong> the arguments passed to a <code>HelpHandler</code> function are slightly
different than a normal <a href="#Handler">Handler</a>. It gets the command map of a
<a href="#CommandRegistry">CommandRegistry</a> as the second parameter.</p>
</dd>
<dt><a href="#Preprocessor">Preprocessor</a> ⇒ <code>any</code></dt>
<dd><p>A function a <a href="#Argument">Argument</a> can optionally use to validate and apply
preprocessing to an argument.</p>
</dd>
</dl>

<a name="Argument"></a>

## Argument
A single positional argument. These are intended to be nested within
[Command](#Command) objects, but can also be used standalone.

By default, an `Argument` represents a single, required argument with no
validation or preprocessing applied. All of these defaults can be modified.
- [Preprocessor](#Preprocessor)s can validate and modify the argument.
- An `Argument` can be optional, preventing [CommandError](#CommandError)s from being
  thrown for missing values.
- Variable arguments (varargs) can be enabled to take in multiple values.

**Kind**: global class  

* [Argument](#Argument)
    * [new Argument(name)](#new_Argument_new)
    * _accessor_
        * [.is_async](#Argument+is_async)
        * [.is_optional](#Argument+is_optional)
        * [.is_varargs](#Argument+is_varargs)
        * [.name](#Argument+name)
        * [.preprocessor](#Argument+preprocessor)
    * _builder_
        * [.asynchronous(enabled)](#Argument+asynchronous) ⇒ [<code>Argument</code>](#Argument)
        * [.optional(enabled)](#Argument+optional) ⇒ [<code>Argument</code>](#Argument)
        * [.preprocess(func)](#Argument+preprocess) ⇒ [<code>Argument</code>](#Argument)
        * [.varargs(enabled)](#Argument+varargs) ⇒ [<code>Argument</code>](#Argument)
    * _execution_
        * [.parse(args)](#Argument+parse) ⇒ <code>any</code> \| <code>Array.&lt;any&gt;</code> \| <code>Promise.&lt;any&gt;</code> \| <code>Promise.&lt;Array.&lt;any&gt;&gt;</code>
        * [.usage()](#Argument+usage) ⇒ [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

<a name="new_Argument_new"></a>

### new Argument(name)
Creates a new `Argument` with the given name. This name is used in the
usage text (see [usage](#Argument+usage)).

**Throws**:

- [<code>SetupError</code>](#SetupError) for non-String or empty String names.


| Param | Type | Description |
| --- | --- | --- |
| name | [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | The name for this `Argument`. |

**Example**  
```js
function coerceToNumber(val) {
    if (!Number.isInteger(val)) throw new Error('not a number!');
    return Number.parseInt(val);
}
const arg = new Argument('thing')
    .optional(true)
    .varargs(true)
    .preprocessor(coerceToNumber);

const vals1 = arg.parse('123');           // vals1 = [123]
const vals2 = arg.parse(['1', '9', '5']); // vals2 = [1, 9, 5]
const vals3 = arg.parse();                // vals3 = []
const vals4 = arg.parse(['1', 'hello']);  // CommandError thrown, not a number!
const use = arg.usage(); // use = "[thing_1] [thing_2] ... [thing_n]"
```
<a name="Argument+is_async"></a>

### argument.is\_async
Directly get and set async mode for this `Argument`. Setting this has the
same effect as calling [asynchronous](#Argument+asynchronous).

**Kind**: instance property of [<code>Argument</code>](#Argument)  
**Default**: <code>false</code>  
**Category**: accessor  
**See**: [asynchronous](#Argument+asynchronous)  
<a name="Argument+is_optional"></a>

### argument.is\_optional
Directly get and set whether or not this `Argument` is optional. Setting
this has the same effect as calling [optional](#Argument+optional).

**Kind**: instance property of [<code>Argument</code>](#Argument)  
**Default**: <code>false</code>  
**Category**: accessor  
**See**: [optional](#Argument+optional)  
<a name="Argument+is_varargs"></a>

### argument.is\_varargs
Directly get and set whether or not this `Argument` is a varargs argument.
Setting this has the same effect as calling [varargs](#Argument+varargs).

**Kind**: instance property of [<code>Argument</code>](#Argument)  
**Default**: <code>false</code>  
**Category**: accessor  
**See**: [varargs](#Argument+varargs)  
<a name="Argument+name"></a>

### argument.name
Directly get and set the name for this `Argument`. Setting this has the
same effect as calling [new Argument()](#new_Argument_new).

**Kind**: instance property of [<code>Argument</code>](#Argument)  
**Category**: accessor  
**See**: [new Argument()](#new_Argument_new)  
<a name="Argument+preprocessor"></a>

### argument.preprocessor
Directly get and set the [Preprocessor](#Preprocessor) function for this
`Argument`. Setting this has the same effect as calling
[preprocess](#Argument+preprocess).

**Kind**: instance property of [<code>Argument</code>](#Argument)  
**Default**: <code>null</code>  
**Category**: accessor  
**See**: [preprocess](#Argument+preprocess)  
<a name="Argument+asynchronous"></a>

### argument.asynchronous(enabled) ⇒ [<code>Argument</code>](#Argument)
Enables or disables async mode. In async mode, [parse](#Argument+parse)
returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that fulfills based on parse
execution, instead of returning or throwing. This setting only applies
to this `Argument`.

An async `Argument` will have its async setting disabled if it is added
to a non-async [Command](#Command). This is intentional to discourage mixing
sync and async elements.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
**Returns**: [<code>Argument</code>](#Argument) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Boolean values.


| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>Boolean</code> | `true` to enable async, `false` to disable. |

<a name="Argument+optional"></a>

### argument.optional(enabled) ⇒ [<code>Argument</code>](#Argument)
Sets this `Argument` as optional. When an `Argument` is optional,
[parse](#Argument+parse) will not throw an error when a value is not
provided. **NOTE** Only the last argument in an argument list may be
optional.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
**Returns**: [<code>Argument</code>](#Argument) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Boolean values.


| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>Boolean</code> | `true` for optional, `false` for required. |

<a name="Argument+preprocess"></a>

### argument.preprocess(func) ⇒ [<code>Argument</code>](#Argument)
Sets up a preprocessor function that will be applied to any value that
passes through [parse](#Argument+parse) for this `Argument`. When called in
the context of a [Command](#Command), the return value of this preprocessor
will be added to the parsed [Args](#Args) Object. If the preprocessor does
not return anything (return value is `undefined`), the value will be
added to [Args](#Args) as-is. Values thrown from this preprocessor will
bubble up with additional context.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
**Returns**: [<code>Argument</code>](#Argument) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Function values.


| Param | Type | Description |
| --- | --- | --- |
| func | [<code>Preprocessor</code>](#Preprocessor) | The preprocessor function. |

<a name="Argument+varargs"></a>

### argument.varargs(enabled) ⇒ [<code>Argument</code>](#Argument)
Enables or disables variable arguments (varargs) for this `Argument`.
A varargs `Argument` can accept multiple values, and each individual
value will be separately subject to the preprocessor (if one is given).
The first value of a varargs `Argument` is required (unless optional is
enabled), but all subsequent values are always optional.
**NOTE** A varargs `Argument` must be the last argument in a set for a
[Command](#Command).

**Kind**: instance method of [<code>Argument</code>](#Argument)  
**Returns**: [<code>Argument</code>](#Argument) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Boolean values.


| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>Boolean</code> | `true` for enabled, `false` for disabled. |

<a name="Argument+parse"></a>

### argument.parse(args) ⇒ <code>any</code> \| <code>Array.&lt;any&gt;</code> \| <code>Promise.&lt;any&gt;</code> \| <code>Promise.&lt;Array.&lt;any&gt;&gt;</code>
Parses the given argument(s) using the preprocessor function (if set).
If no preprocessor function has been set, this function will still
perform basic validation on the argument(s), but will return it(them)
as-is.

In async mode, this function returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that
fulfills with the processed arguments. Any intermediate `Promise` is
internally resolved, so the final returned `Promise` will resolve to
a processed value. This is particularly useful for varargs.

In varargs mode, the returned (or resolved) value will always be an
[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), even if the given argument was a single,
non-Array value.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
**Returns**: <code>any</code> \| <code>Array.&lt;any&gt;</code> - The processed value (or array of values, in varargs
    mode).<code>Promise.&lt;any&gt;</code> \| <code>Promise.&lt;Array.&lt;any&gt;&gt;</code> - in async mode.  
**Category**: execution  
**Throws**:

- [<code>CommandError</code>](#CommandError) for non-String and non-Array-of-String data.
- [<code>CommandError</code>](#CommandError) for incorrect number of arguments.
- [<code>CommandError</code>](#CommandError) wrapping anything thrown from the preprocessor.
    Additional context is added where possible, indicating which argument
    caused the problem and why.


| Param | Type | Description |
| --- | --- | --- |
| args | [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [<code>?Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Argument strings to parse. |

<a name="Argument+usage"></a>

### argument.usage() ⇒ [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
Generates a human-readable string describing this `Argument`. Useful for
building command usage strings from multiple arguments.
- Required `<example>`
- Optional `[example]`
- Varargs  `<example_1> [example_2] ... [example_n]`

**Kind**: instance method of [<code>Argument</code>](#Argument)  
**Returns**: [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - A human-readable description of this `Argument`.  
**Category**: execution  
<a name="Command"></a>

## Command
A text-based command with positional arguments.

A `Command` can be given a set of [Argument](#Argument)s (or multiple sets of
[Argument](#Argument)s), parse strings into an object of values (see [Args](#Args)),
and pass those values to a function that runs on command execution.

**Kind**: global class  

* [Command](#Command)
    * [new Command()](#new_Command_new)
    * _instance_
        * _accessor_
            * [.argsets](#Command+argsets)
            * [.desc](#Command+desc)
            * [.is_async](#Command+is_async)
            * [.name](#Command+name)
        * _builder_
            * [.addArgSet(argset)](#Command+addArgSet) ⇒ [<code>Command</code>](#Command)
            * [.asynchronous(enabled)](#Command+asynchronous) ⇒ [<code>Command</code>](#Command)
            * [.description(desc)](#Command+description) ⇒ [<code>Command</code>](#Command)
            * [.error(func)](#Command+error) ⇒ [<code>Command</code>](#Command)
            * [.handler(func)](#Command+handler) ⇒ [<code>Command</code>](#Command)
        * _execution_
            * [.execute(parts)](#Command+execute) ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
            * [.parse(parts)](#Command+parse) ⇒ [<code>Args</code>](#Args) \| [<code>Promise.&lt;Args&gt;</code>](#Args)
            * [.usage()](#Command+usage) ⇒ [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
    * _static_
        * [.split(string)](#Command.split) ⇒ [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

<a name="new_Command_new"></a>

### new Command()
Creates a new `Command` with the given name.

**Throws**:

- [<code>SetupError</code>](#SetupError) Missing, empty, or non-String names.

**Example**  
```js
function coerceToNumber(val) {
    if (!Number.isInteger(val)) throw new Error('not a number!');
    return Number.parseInt(val);
}
const command = new Command('example')
    .description('My cool command that adds numbers')
    .addArgSet([
        new Argument('arg1').preprocess(coerceToNumber),
        new Argument('arg2').preprocess(coerceToNumber),
    ])
    .handler((args, arbitrary) => {
        const value = args.arg1 + args.arg2;
        console.log('Value is', value);
        console.log('Also got this from caller:', arbitrary);
        return value;
    });

const use  = command.usage();               // "example <arg1> <arg2>"
const val1 = command.execute('12 34');      // val1 = 46
const val2 = command.execute(['55', '45']); // val2 = 100
const val3 = command.execute('12');       // throws CommandError, missing second argument!
const val4 = command.execute('12 hello'); // throws CommandError, second argument not a number!
```
<a name="Command+argsets"></a>

### command.argsets
Directly access the argument sets for this `Command`. This is a read-only
property.

**Kind**: instance property of [<code>Command</code>](#Command)  
**Category**: accessor  
<a name="Command+desc"></a>

### command.desc
Directly get and set the description for this `Command`. Setting this has
the same effect as calling [description](#Command+description).

**Kind**: instance property of [<code>Command</code>](#Command)  
**Category**: accessor  
**See**: [description](#Command+description)  
<a name="Command+is_async"></a>

### command.is\_async
Directly get and set asynchronous mode for this `Command`. Setting this
has the same effect as calling [asynchronous](#Command+asynchronous).

**Kind**: instance property of [<code>Command</code>](#Command)  
**Default**: <code>false</code>  
**Category**: accessor  
**See**: [asynchronous](#Command+asynchronous)  
<a name="Command+name"></a>

### command.name
Directly get and set the name for this `Command`. Subject to the same
validation as [new Command()](#new_Command_new).

**Kind**: instance property of [<code>Command</code>](#Command)  
**Category**: accessor  
**See**: [new Command()](#new_Command_new)  
<a name="Command+addArgSet"></a>

### command.addArgSet(argset) ⇒ [<code>Command</code>](#Command)
Adds a set of [Argument](#Argument)s this `Command` can accept.
Arguments are all positional, so this function enforces several rules to
avoid ambiguous command definitions:
- A `Command` cannot have multiple argument sets with the same length.
- A `Command` cannot have multiple argument sets with varargs arguments.
- Optional arguments must be the last arguments in an argument set.
- A varargs argument must be the last argument in an argument set.
- The argument set containing a varargs argument must be the largest set.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>Command</code>](#Command) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Array values.
- [<code>SetupError</code>](#SetupError) for Arrays containing non-Argument values.
- [<code>SetupError</code>](#SetupError) if any argument set rule is violated.


| Param | Type | Description |
| --- | --- | --- |
| argset | [<code>Array.&lt;Argument&gt;</code>](#Argument) | [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of `Argument` objects. |

<a name="Command+asynchronous"></a>

### command.asynchronous(enabled) ⇒ [<code>Command</code>](#Command)
Enables or disables async mode. In async mode, [execute](#Command+execute)
and [parse](#Command+parse) will both return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that fulfills based on the parse and/or command execution, instead of
returning or throwing. Promises returned from [Argument](#Argument)s will also
be automatically resolved before adding them to the [Args](#Args).
This setting is applied recursively to all [Argument](#Argument)s in this
`Command`.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>Command</code>](#Command) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Boolean values.


| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>Boolean</code> | `true` to enable async, `false` to disable. |

<a name="Command+description"></a>

### command.description(desc) ⇒ [<code>Command</code>](#Command)
Sets the description text for this `Command`.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>Command</code>](#Command) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-String values.


| Param | Type | Description |
| --- | --- | --- |
| desc | [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | The description text. |

<a name="Command+error"></a>

### command.error(func) ⇒ [<code>Command</code>](#Command)
Sets up a handler function for values thrown during command execution.
When this is set, values will not be thrown (or passed to `.catch()` in
async mode). Instead, they will be passed to this handler function, along
with all of the arbitrary arguments originally forwarded from
[execute](#Command+execute). Additionally, values returned from this handler
will be returned to the caller (via `.then()` in async mode). Values
thrown within this handler will be re-thrown to the caller as a
[CommandError](#CommandError) (bubbled up via `.catch()` in async mode).

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>Command</code>](#Command) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Function values.


| Param | Type | Description |
| --- | --- | --- |
| func | [<code>ErrorHandler</code>](#ErrorHandler) | The error handler function. |

<a name="Command+handler"></a>

### command.handler(func) ⇒ [<code>Command</code>](#Command)
Sets up a handler function when this `Command` is executed.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>Command</code>](#Command) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Function values.


| Param | Type | Description |
| --- | --- | --- |
| func | [<code>Handler</code>](#Handler) | The handler function. |

<a name="Command+execute"></a>

### command.execute(parts) ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
Executes an argument string (or array) using the handler for this
`Command`. Additional arbitrary arguments can be forwarded to the command
handler. Values returned from the handler will be returned from this
function (or bubble up via `.then()` in async mode). Values thrown from
the handler will be rethrown from this function (or bubble up via
`.catch()` in async mode).

If an [ErrorHandler](#ErrorHandler) has been set via [error](#Command+error), values
thrown from the handler function will be passed to that handler instead
of being rethrown from this function. The error handler is subject to all
of the same conditions as the command handler, so values returned/thrown
from the error handler will be returned/thrown from this function
(or bubble up via `.then()` and `.catch()`, respectively in async mode).

If this `Command` has no handler, the given arguments will still be
processed and validated.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: <code>any</code> - Whatever the handler function returns.<code>Promise.&lt;?any&gt;</code> - in async mode.  
**Category**: execution  
**Throws**:

- [<code>CommandError</code>](#CommandError) for all reasons as [parse](#Command+parse).
- [<code>CommandError</code>](#CommandError) for anything thrown within the handler.


| Param | Type | Description |
| --- | --- | --- |
| parts | [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Arguments for this     command. Should not include the command's name. |
| ...forward | <code>Array.&lt;any&gt;</code> | Arbitrary additional values passed to handler. |

<a name="Command+parse"></a>

### command.parse(parts) ⇒ [<code>Args</code>](#Args) \| [<code>Promise.&lt;Args&gt;</code>](#Args)
Parses the given positional argument array into an Object of values.
This function does its best to match the given values to an appropriate
argument set. Since all arguments are positional, error diagnostics are
limited if this `Command` has multiple argument sets defined.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>Args</code>](#Args) - the parsed [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) of arguments.[<code>Promise.&lt;Args&gt;</code>](#Args) - in async mode.  
**Category**: execution  
**Throws**:

- [<code>CommandError</code>](#CommandError) if no argument set matches the given parts.
- [<code>CommandError</code>](#CommandError) if any argument preprocessor function throws.


| Param | Type | Description |
| --- | --- | --- |
| parts | [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Array of command parts from     [split](#Command.split). |

<a name="Command+usage"></a>

### command.usage() ⇒ [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
Generates a string describing the usage of this `Command`.
If this command has multiple argument sets, each version of the command
is in the string, separated by a newline. If the command has no argument
sets, this just returns the command name.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - description of command usage.  
**Category**: execution  
<a name="Command.split"></a>

### Command.split(string) ⇒ [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
Splits a command string into an array of tokens. This essentially just
splits on whitespace.

**Kind**: static method of [<code>Command</code>](#Command)  
**Returns**: [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of command tokens.  

| Param | Type | Description |
| --- | --- | --- |
| string | [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Command string to split. |

<a name="CommandError"></a>

## CommandError ⇐ [<code>Error</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
Error thrown during execution of [Argument](#Argument), [Command](#Command), and
[CommandRegistry](#CommandRegistry) objects.

Anything thrown in user-provided code (command handlers and argument
preprocessors) is wrapped with a `CommandError`. The `CommandError` instance
also contains additional context, such as extended error messages and a
reference to the [Command](#Command) that threw (if any). This allows callers
to do command-specific error handling, if necessary.

**Kind**: global class  
**Extends**: [<code>Error</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)  

* [CommandError](#CommandError) ⇐ [<code>Error</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
    * [.command](#CommandError+command)
    * [.is_command_error](#CommandError+is_command_error)
    * [.nested](#CommandError+nested)
    * [.full_message](#CommandError+full_message)

<a name="CommandError+command"></a>

### err.command
The [Command](#Command) this `CommandError` originated in, if any.

**Kind**: instance property of [<code>CommandError</code>](#CommandError)  
**Default**: <code>undefined</code>  
<a name="CommandError+is_command_error"></a>

### err.is\_command\_error
A simple flag callers can check to see if an `Error` is a `CommandError`.
This field is always `true`, and is provided only as an alternative to
`error instanceof CommandError`.

**Kind**: instance property of [<code>CommandError</code>](#CommandError)  
<a name="CommandError+nested"></a>

### err.nested
The value that was actually thrown in the user code. This could be
anything.

**Kind**: instance property of [<code>CommandError</code>](#CommandError)  
**Default**: <code>null</code>  
<a name="CommandError+full_message"></a>

### err.full\_message
Gets this `CommandError`'s `message` combined with `nested.message`, if
`nested` is an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error). Otherwise, this value is identical
to [CommandError#message](CommandError#message).

**Kind**: instance property of [<code>CommandError</code>](#CommandError)  
<a name="SetupError"></a>

## SetupError ⇐ [<code>Error</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
Error thrown when setting up [Argument](#Argument), [Command](#Command), and
[CommandRegistry](#CommandRegistry) objects. These are typically thrown for invalid
values, such as passing non-Function values for handler functions.

**Kind**: global class  
**Extends**: [<code>Error</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)  
<a name="CommandRegistry"></a>

## CommandRegistry
A registry containing commands. Can take in command strings and delegate them
to the appropriate commands.

**Kind**: global class  

* [CommandRegistry](#CommandRegistry)
    * [new CommandRegistry()](#new_CommandRegistry_new)
    * _instance_
        * _accessor_
            * [.commands](#CommandRegistry+commands)
            * [.is_async](#CommandRegistry+is_async)
            * [.default_handler](#CommandRegistry+default_handler)
        * _builder_
            * [.add(command)](#CommandRegistry+add) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
            * [.asynchronous(enabled)](#CommandRegistry+asynchronous) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
            * [.defaultHandler(func)](#CommandRegistry+defaultHandler) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
            * [.helpHandler(func)](#CommandRegistry+helpHandler) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
        * _execution_
            * [.execute(parts)](#CommandRegistry+execute) ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
            * [.help(cmd_name)](#CommandRegistry+help) ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
    * _static_
        * [.defaultDefaultHandler(cmd_parts)](#CommandRegistry.defaultDefaultHandler)
        * [.defaultHelpHandler(args, commands)](#CommandRegistry.defaultHelpHandler) ⇒ [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

<a name="new_CommandRegistry_new"></a>

### new CommandRegistry()
Creates a new `CommandRegistry`.

<a name="CommandRegistry+commands"></a>

### registry.commands
The [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) of [Command](#Command) objects. Useful for iterating.

**Kind**: instance property of [<code>CommandRegistry</code>](#CommandRegistry)  
**Category**: accessor  
<a name="CommandRegistry+is_async"></a>

### registry.is\_async
Directly get and set asynchronous mode for this `CommandRegistry`.
Setting this has the same effect as calling
[asynchronous](#CommandRegistry+asynchronous).

**Kind**: instance property of [<code>CommandRegistry</code>](#CommandRegistry)  
**Default**: <code>false</code>  
**Category**: accessor  
**See**: [asynchronous](#CommandRegistry+asynchronous)  
<a name="CommandRegistry+default_handler"></a>

### registry.default\_handler
Directly get and set the default handler for unrecognized commands for
this `CommandRegistry`. Setting this has the same effect as calling
[defaultHandler](#CommandRegistry+defaultHandler).

**Kind**: instance property of [<code>CommandRegistry</code>](#CommandRegistry)  
**Category**: accessor  
**See**: [defaultHandler](#CommandRegistry+defaultHandler)  
<a name="CommandRegistry+add"></a>

### registry.add(command) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
Adds a [Command](#Command) to this `CommandRegistry`. All commands must have
unique names. If this `CommandRegistry` is in async mode, the
`Command` will be switched to async mode too.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Returns**: [<code>CommandRegistry</code>](#CommandRegistry) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) For non-Command values.
- [<code>SetupError</code>](#SetupError) If the `CommandRegistry` already has a `Command`
    with the given name.


| Param | Type | Description |
| --- | --- | --- |
| command | [<code>Command</code>](#Command) | The command to add. |

<a name="CommandRegistry+asynchronous"></a>

### registry.asynchronous(enabled) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
Enables or disables async mode for this `CommandRegistry`. In async mode,
[help](#CommandRegistry+help) and [execute](#CommandRegistry+execute) will
both return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that fulfills based on the command
execution. This setting is applied recursively to all [Command](#Command)s
and [Argument](#Argument)s in this `CommandRegistry`.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Returns**: [<code>CommandRegistry</code>](#CommandRegistry) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Boolean values.


| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>Boolean</code> | `true` to enable async, `false` to disable. |

<a name="CommandRegistry+defaultHandler"></a>

### registry.defaultHandler(func) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
Sets up a handler function for unrecognized commands.
If this is not set, unknown commands are a no-op.

**NOTE** the default handler function signature is slightly different
from other handlers (see [DefaultHandler](#DefaultHandler)).

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Returns**: [<code>CommandRegistry</code>](#CommandRegistry) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Function values.


| Param | Type | Description |
| --- | --- | --- |
| func | [<code>DefaultHandler</code>](#DefaultHandler) | The handler function. If omitted, uses     [defaultDefaultHandler](#CommandRegistry.defaultDefaultHandler). |

<a name="CommandRegistry+helpHandler"></a>

### registry.helpHandler(func) ⇒ [<code>CommandRegistry</code>](#CommandRegistry)
Sets up a help command using the given [HelpHandler](#HelpHandler) function.
If this is not set, help commands are treated like unknown commands.

**NOTE** the help handler function signature is slightly different from
other handlers (see [HelpHandler](#HelpHandler)).

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Returns**: [<code>CommandRegistry</code>](#CommandRegistry) - instance so we can chain calls.  
**Category**: builder  
**Throws**:

- [<code>SetupError</code>](#SetupError) for non-Function values.


| Param | Type | Description |
| --- | --- | --- |
| func | [<code>HelpHandler</code>](#HelpHandler) | The handler function. If omitted, uses     [defaultHelpHandler](#CommandRegistry.defaultHelpHandler). |

<a name="CommandRegistry+execute"></a>

### registry.execute(parts) ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
Executes a string (or array) as a command. Additional arbitrary arguments
can be forwarded to the command handler, and the value returned from the
command handler will bubble up and return from this function. If this
`CommandRegistry` does not have a command matching the given string, this
is either a no-op, or the default command handler is called (if set). If
the given command's name is `help`, this call is equivalent to calling
[help](#CommandRegistry+help).

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Returns**: <code>any</code> - Return value forwarded back to caller.<code>Promise.&lt;?any&gt;</code> - In async mode.  
**Category**: execution  
**Throws**:

- [<code>CommandError</code>](#CommandError) Wraps anything thrown in handler.

**See**: [Command.execute](Command.execute)  

| Param | Type | Description |
| --- | --- | --- |
| parts | [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | A string containing a     command, or a pre-split [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of command parts. |
| ...forward | <code>Array.&lt;any&gt;</code> | Arbitrary additional values passed to handler. |

**Example**  
```js
// Call a command that adds two numbers
let x = registry.execute('add 12 14'); // x is 26
let x = registry.execute(['add', '10', '20']); // x is 30

// Call a command from a Discord.js message.
// Remember to sanitize your inputs! https://xkcd.com/327/
registry.execute(msg.content, msg);
```
<a name="CommandRegistry+help"></a>

### registry.help(cmd_name) ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
Executes the help command for this `CommandRegistry`. In order for this
function to do anything, [helpHandler](#CommandRegistry+helpHandler) needs to
be called first to set up a help command. Like
[execute](#CommandRegistry+execute), this function can forward additional
arbitrary arguments to the help handler function, and the value returned
from the help handler will bubble up to this function.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Returns**: <code>any</code> - Return value forwarded back to caller.<code>Promise.&lt;?any&gt;</code> - In async mode.  
**Category**: execution  
**Throws**:

- [<code>CommandError</code>](#CommandError) Wraps anything thrown in handler.


| Param | Type | Description |
| --- | --- | --- |
| cmd_name | [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | The name of a command to request help     for. In order to omit this value while providing forwarded arguments,     pass in a falsy value, like `null`. |
| ...forward | <code>Array.&lt;any&gt;</code> | Arbitrary additional values passed to handler. |

**Example**  
```js
registry.help();
registry.help('say');
registry.help('say', msg);
registry.help(null, msg);
```
<a name="CommandRegistry.defaultDefaultHandler"></a>

### CommandRegistry.defaultDefaultHandler(cmd_parts)
An optional default handler for unrecognized commands. Simply throws an
error.

**Kind**: static method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Throws**:

- [<code>Error</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) Always

**See**: [DefaultHandler](#DefaultHandler)  

| Param | Type | Description |
| --- | --- | --- |
| cmd_parts | [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Array of command parts from     [split](#Command.split). |

<a name="CommandRegistry.defaultHelpHandler"></a>

### CommandRegistry.defaultHelpHandler(args, commands) ⇒ [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
An optional default handler for the help command. Returns the usage for
the given command, according to its [usage](#Command+usage) function. If no
command name is given, returns the usage for all known commands,
separated by newlines.

**Kind**: static method of [<code>CommandRegistry</code>](#CommandRegistry)  
**Returns**: [<code>String</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) - Description of the given command, or all known
    commands.  
**See**: [HelpHandler](#HelpHandler)  

| Param | Type | Description |
| --- | --- | --- |
| args | [<code>Args</code>](#Args) | Argument [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) containing at least     `command`. |
| commands | [<code>Map.&lt;Command&gt;</code>](#Command) | The [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) of `Commands` in     the registry. |

<a name="Args"></a>

## Args
An [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) of parsed arguments for a command. Matches the
format from other argument parsing libraries, such as
<a href="https://www.npmjs.com/package/yargs">Yargs</a>.

**Kind**: global typedef  
**Example**  
```js
{
  _: ['my', 'cool', 'args'],
  arg1: 'my',
  arg2: 'cool',
  arg3: 'args',
  vararg1: ['thing1', 'thing2'],
}
```
<a name="Handler"></a>

## Handler ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
A function a [Command](#Command) calls when it is executed.

**Kind**: global typedef  
**Returns**: <code>any</code> - Return value forwarded back to caller.<code>Promise.&lt;?any&gt;</code> - In async mode.  
**Throws**:

- <code>any</code> Anything the user code wants to throw. This value will be
    captured and re-thrown as a [CommandError](#CommandError).


| Param | Type | Description |
| --- | --- | --- |
| args | [<code>Args</code>](#Args) | The [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) of parsed arguments. |
| ...forward | <code>Array.&lt;any&gt;</code> | Arbitrary additional values. |

**Example**  
```js
// Adds two numbers together and replies to a Discord.js message
function myHandler(args, message) {
    const val = args.val1 + args.val2;
    return message.reply('Result is ' + val);
}
```
<a name="DefaultHandler"></a>

## DefaultHandler ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
A function a [CommandRegistry](#CommandRegistry) can optionally call when it gets an
unrecognized command.

**NOTE** the arguments passed to a `DefaultHandler` function are slightly
different than a normal [Handler](#Handler). It gets the string array of command
parts instead of a parsed [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) of arguments.

**Kind**: global typedef  
**Returns**: <code>any</code> - Return value forwarded back to caller.<code>Promise.&lt;?any&gt;</code> - In async mode.  
**Throws**:

- <code>any</code> Anything the user code wants to throw. This value will be
    captured and re-thrown as a [CommandError](#CommandError).


| Param | Type | Description |
| --- | --- | --- |
| cmd_parts | [<code>Array.&lt;String&gt;</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Array of command parts from     [split](#Command.split). |
| ...forward | <code>Array.&lt;any&gt;</code> | Arbitrary additional values passed into     [CommandRegistry.execute](CommandRegistry.execute). |

**Example**  
```js
// Replying to a Discord.js message
function myDefaultHandler(cmd_parts, message) {
    return message.reply('Unrecognized command ' + cmd_parts.shift());
}
```
<a name="ErrorHandler"></a>

## ErrorHandler ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
A function a [Command](#Command) can optionally use to handle values thrown
during execution.

**NOTE** the arguments passed to an `ErrorHandler` function are slightly
different than a normal [Handler](#Handler). It gets the value thrown during
execution.

**Kind**: global typedef  
**Returns**: <code>any</code> - Return value forwarded back to caller.<code>Promise.&lt;?any&gt;</code> - In async mode.  
**Throws**:

- <code>any</code> Anything the user code wants to throw. This value will be
    captured and re-thrown as a [CommandError](#CommandError).


| Param | Type | Description |
| --- | --- | --- |
| value | <code>any</code> | Value thrown during command execution. |
| ...forward | <code>Array.&lt;any&gt;</code> | Arbitrary additional values passed into     [Command.execute](Command.execute). |

**Example**  
```js
// Replying to a Discord.js message with the error
function myErrorHandler(err, message) {
    return message.reply('Command failed: ' + err.message);
}
```
<a name="HelpHandler"></a>

## HelpHandler ⇒ <code>any</code> \| <code>Promise.&lt;?any&gt;</code>
A function a [CommandRegistry](#CommandRegistry) can optionally use for its help
command.

**NOTE** the arguments passed to a `HelpHandler` function are slightly
different than a normal [Handler](#Handler). It gets the command map of a
[CommandRegistry](#CommandRegistry) as the second parameter.

**Kind**: global typedef  
**Returns**: <code>any</code> - Return value forwarded back to caller.<code>Promise.&lt;?any&gt;</code> - In async mode.  
**Throws**:

- <code>any</code> Anything the user code wants to throw. This value will be
    captured and re-thrown as a [CommandError](#CommandError).


| Param | Type | Description |
| --- | --- | --- |
| args | [<code>Args</code>](#Args) | Argument [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) containing the following:     - command - The command name. |
| commands | [<code>Map.&lt;Command&gt;</code>](#Command) | The `CommandRegistry`'s Map of commands. |
| ...forward | <code>Array.&lt;any&gt;</code> | Arbitrary additional values passed into     [CommandRegistry.execute](CommandRegistry.execute). |

**Example**  
```js
// Replying to a Discord.js message
function myHelpHandler(args, commands, message) {
    return message.reply(commands.get(args.command).usage());
}
```
<a name="Preprocessor"></a>

## Preprocessor ⇒ <code>any</code>
A function a [Argument](#Argument) can optionally use to validate and apply
preprocessing to an argument.

**Kind**: global typedef  
**Returns**: <code>any</code> - The final value returned from [Argument.parse](Argument.parse).  
**Throws**:

- <code>any</code> Anything the user code wants to throw. This value will be
    captured and re-thrown as a [CommandError](#CommandError).


| Param | Type | Description |
| --- | --- | --- |
| value | <code>String</code> | The string representation of an argument. |

**Example**  
```js
function coerceToNumber(value) {
    if (!Number.isInteger(val)) throw new Error('not a number!');
    return Number.parseInt(val);
}
```
