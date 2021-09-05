## Classes

<dl>
<dt><a href="#Argument">Argument</a></dt>
<dd><p>Represents a single positional argument for a command.</p>
</dd>
<dt><a href="#Command">Command</a></dt>
<dd><p>Represents a text-based command with positional arguments.</p>
</dd>
<dt><a href="#CommandError">CommandError</a></dt>
<dd><p>Gives us an object oriented way to wrap any errors thrown during command
parsing and execution.</p>
<p>Anything thrown in user-provided code (handlers, preprocessors) will be
contained within this Error object. This class also contains some additional
context such as extended error messages and the Command the Error originated
in, allowing callers to do command-specific error handling.</p>
</dd>
<dt><a href="#CommandRegistry">CommandRegistry</a></dt>
<dd><p>A registry containing commands. Can take in command strings and delegate them
to the appropriate commands.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#defaultDefaultHandler">defaultDefaultHandler()</a></dt>
<dd><p>The default handler for unrecognized commands. Simply throws an error.</p>
</dd>
<dt><a href="#defaultHelpHandler">defaultHelpHandler()</a></dt>
<dd><p>The default handler for the help command. Returns the usage for the given
commnd name. If no command name is given, returns the usage for all known
commands, separated by newlines.</p>
</dd>
</dl>

<a name="Argument"></a>

## Argument
Represents a single positional argument for a command.

**Kind**: global class  

* [Argument](#Argument)
    * [new Argument()](#new_Argument_new)
    * [.asynchronous()](#Argument+asynchronous)
    * [.optional()](#Argument+optional)
    * [.parse()](#Argument+parse)
    * [.preprocess()](#Argument+preprocess)
    * [.usage()](#Argument+usage)
    * [.varargs()](#Argument+varargs)

<a name="new_Argument_new"></a>

### new Argument()
Constructs an argument with the given name.

<a name="Argument+asynchronous"></a>

### argument.asynchronous()
Enables/disables async mode. In async mode, Promises returned from
preprocessors will be resolved automatically. This means
<code>parse</code> will also return a Promise.

Returns this so we can chain calls.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
<a name="Argument+optional"></a>

### argument.optional()
Marks this argument as optional. Only the last argument in an argument
list may be optional.

Returns this so we can chain calls.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
<a name="Argument+parse"></a>

### argument.parse()
Parses the given arg(s) using this Argument's preprocessor function.

If the preprocessor command throws an error, this function will re-throw
it with additional context.

If no preprocessor is defined, the args are returned as given.

If a single (non-array) value is given for a varargs argument, an array
will still be returned.

In async mode, this will always return a Promise that resolves to the
parsed values.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
<a name="Argument+preprocess"></a>

### argument.preprocess()
Adds a function that processes an argument value before it reaches
the command handler. This can double as a validator, and thrown
exceptions will bubble up in a user-readable way.
The return value of the given function will be forwarded to the command
handler. If the given function does not return anything, the argument
will be forwarded as-is.

Returns this so we can chain calls.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
<a name="Argument+usage"></a>

### argument.usage()
Returns a human-readable string describing this argument.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
<a name="Argument+varargs"></a>

### argument.varargs()
Allows this argument to accept multiple values. Each individual argument
will be subject to the preprocessor, if one is given.
A varargs argument must be the last argument for a command.

Returns this so we can chain calls.

**Kind**: instance method of [<code>Argument</code>](#Argument)  
<a name="Command"></a>

## Command
Represents a text-based command with positional arguments.

**Kind**: global class  

* [Command](#Command)
    * [new Command()](#new_Command_new)
    * _instance_
        * [.addArgSet()](#Command+addArgSet)
        * [.asynchronous()](#Command+asynchronous)
        * [.description()](#Command+description)
        * [.error()](#Command+error)
        * [.execute()](#Command+execute)
        * [.getDescription()](#Command+getDescription)
        * [.handler()](#Command+handler)
        * [.usage()](#Command+usage)
        * [.parse()](#Command+parse)
    * _static_
        * [.split()](#Command.split)

<a name="new_Command_new"></a>

### new Command()
Begins constructing a command with the given name.

<a name="Command+addArgSet"></a>

### command.addArgSet()
Adds a set of arguments this command can accept.
Expects an array of <code>Argument</code> objects. Because all arguments
are positional, there are several rules to avoid ambiguous command
definitions:
 - A command must not have multiple argument sets with the same size.
 - A command must not have multiple argument sets with varargs arguments.
 - An optional argument must be the last argument in an argument set.
 - The varargs argument must be the last argument in an argument set.
 - The argument set containing the varargs argument must be the largest
   argument set.

Returns this so we can chain calls.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+asynchronous"></a>

### command.asynchronous()
Enable/disable async mode. In async mode, Promises returned from argument
preprocessors and command handlers will be automatically resolved. This
means <code>execute</code> will always return a Promise. This also
enables async mode for all known argument sets.

Returns this so we can chain calls.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+description"></a>

### command.description()
Sets the description for this command.
Returns this so we can chain calls.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+error"></a>

### command.error()
Sets the function to execute when an error is thrown while executing the
command. If this is not set, errors are thrown to the caller instead.
The handler takes the error, along with any arguments originally
forwarded to the handler.

In async mode, errors are routed through this function instead of
.catch(...). Additionally, values returned from this handler will bubble
up via execute's .then(...).

Returns this so we can chain calls.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+execute"></a>

### command.execute()
Parses the given positional argument array, then passes the resulting
structure into this command's handler function. Additional values can be
passed in to forward them directly to the handler.

The return value is whatever the handler function returns.
If this command does not have a handler, the arguments will still be
proecessed and validation will still be applied.

This can also take command strings so commands can be executed
independently of the CommandRegistry.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+getDescription"></a>

### command.getDescription()
Returns the command's description. We'll usually do this alongside
usage(), so make this look like a function call too.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+handler"></a>

### command.handler()
Sets the function to execute when this command is called.
The parsed argument hash is passed into this function, along with any
forwarded arguments passed into <code>execute</code>.
Returns this so we can chain calls.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+usage"></a>

### command.usage()
Returns a string describing command usage.
If the command has multiple argument sets, each version of the command is
in the string, separated by a newline.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command+parse"></a>

### command.parse()
Parses the given positional value array into a structure resembling
argument parsing libraries like yargs.

This function do its best to match the values to one of the command's
argument sets. Since all arguments are positional, diagnostics are
limited if the argument has multiple argument sets defined.

**Kind**: instance method of [<code>Command</code>](#Command)  
<a name="Command.split"></a>

### Command.split()
Splits a command string into an array of parts. This essentially just
splits on whitespace.

**Kind**: static method of [<code>Command</code>](#Command)  
<a name="CommandError"></a>

## CommandError
Gives us an object oriented way to wrap any errors thrown during command
parsing and execution.

Anything thrown in user-provided code (handlers, preprocessors) will be
contained within this Error object. This class also contains some additional
context such as extended error messages and the Command the Error originated
in, allowing callers to do command-specific error handling.

**Kind**: global class  
<a name="CommandRegistry"></a>

## CommandRegistry
A registry containing commands. Can take in command strings and delegate them
to the appropriate commands.

**Kind**: global class  

* [CommandRegistry](#CommandRegistry)
    * [new CommandRegistry()](#new_CommandRegistry_new)
    * [.add()](#CommandRegistry+add)
    * [.asynchronous()](#CommandRegistry+asynchronous)
    * [.defaultHandler()](#CommandRegistry+defaultHandler)
    * [.execute()](#CommandRegistry+execute)
    * [.help()](#CommandRegistry+help)
    * [.helpHandler()](#CommandRegistry+helpHandler)

<a name="new_CommandRegistry_new"></a>

### new CommandRegistry()
Sets up the Map that contains all of the commands.

<a name="CommandRegistry+add"></a>

### commandRegistry.add()
Adds a new command to the registry. All commands must have unique names.
Returns this so we can chain calls.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
<a name="CommandRegistry+asynchronous"></a>

### commandRegistry.asynchronous()
Sets every command and argument in this registry to async mode. In async
mode, <code>help</code> and <code>execute</code> will both return
Promises that resolve/reject based on the command execution.

This setting will be applied to all new and existing commands.

Returns this so we can chain calls.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
<a name="CommandRegistry+defaultHandler"></a>

### commandRegistry.defaultHandler()
Sets up a handler function for unrecognized commands (or the default
handler, if none is specified. See <code>defaultDefaultHandler</code>).
If this is not set, unknown commands are a no-op.

NOTE the default handler function signature is slightly different from
other handlers. Default handlers receive an object containing the
result from <code>Command.parse</code>.

Returns this so we can chain calls.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
<a name="CommandRegistry+execute"></a>

### commandRegistry.execute()
Executes the command that corresponds to the given string. If the
referenced command doesn't exist, we fall back on the default command
handler, if there is one. If the command name is 'help', we use the
special help command handler.
In all cases, arbitrary additional values can be forwarded to the
handlers.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
<a name="CommandRegistry+help"></a>

### commandRegistry.help()
Executes the help handler. In order for this function to do anything,
<code>helpHandler</code> needs to have been called, otherwise this
function is a no-op.
Returns the help handler's return value. Additional arbitrary arguments
will be forwarded to the help handler.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
<a name="CommandRegistry+helpHandler"></a>

### commandRegistry.helpHandler()
Sets up a help command using the given handler function (or the default
handler, if none is specified. See <code>defaultHelpHandler</code>).

NOTE the help handler function signature is slightly different from other
handlers. Help handlers get the command Map object as a second
parameter.

Returns this so we can chain calls.

**Kind**: instance method of [<code>CommandRegistry</code>](#CommandRegistry)  
<a name="defaultDefaultHandler"></a>

## defaultDefaultHandler()
The default handler for unrecognized commands. Simply throws an error.

**Kind**: global function  
<a name="defaultHelpHandler"></a>

## defaultHelpHandler()
The default handler for the help command. Returns the usage for the given
commnd name. If no command name is given, returns the usage for all known
commands, separated by newlines.

**Kind**: global function  
