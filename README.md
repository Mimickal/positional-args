# positional-args - Node.js positional argument parser

<a href="LICENSE.md"><img align="right" alt="AGPL-3.0 Logo"
src="https://www.gnu.org/graphics/lgplv3-with-text-154x68.png">
</a>

Unlike other argument parsers, this library is built specifically (and only) for
positional arguments, allowing it to provide much more functionality and control
over how positional arguments are interpreted. It also doesn't force you to
restructure your code to use it. All the individual pieces are exposed and work
standalone, so you only have to use as much of the library as you need.

This library was originally written to be a lightweight, unintrusive alternative
to [Commando](https://www.npmjs.com/package/discord.js-commando) for Discord
bots. There are no Discord-specific things in this library, but it does still
work well for this purpose.

Features:
- No external dependencies.
- Lightweight, unintrusive API that doesn't change the paradigm of your code.
- Each class of the library is exposed, so you can use as much or as little as
  you want.
- Parses from strings or arrays from any source.
- Validate and transform arguments with user-specified functions.
- Provides parsed arguments in a format similar to other argparse libraries,
  such as [yargs](https://www.npmjs.com/package/yargs).
- Define commands with multiple argument lists and auto-generated help text.
- Command registry can consume a command string and delegate it to the
  appropriate command.
- Async / Promise friendly. All user-specified functions may be async.
- Useful alternative to Commando.js for Discord bots.

## Installation

Available on [npm](https://www.npmjs.com/package/positional-args).

```
npm install positional-args
```

## Usage and examples
[See full API here!](API.md)

[See GitHub releases page for API changes.](
https://github.com/Mimickal/positional-args/releases)

This example creates a `CommandRegistry` with multiple commands and handler for
unrecognized commands.
```js
const registry = new CommandRegistry()
    .add(new Command('say')
        .description('Prints the args given. Also has multiple argument sets, for fun')
        .addArgSet([ new Argument('first') ])
        .addArgSet([
            new Argument('first'),
            new Argument('extras')
                .varargs(true)
                .optional(true),
        ])
        .handler(args => console.log('I got', args))
    )
    .add(new Command('die_always')
        .description('I always throw because I am not nice')
        .handler(() => { throw new Error('I strike again!') })
    )
    .helpHandler() // Use the built-in help handler
    .defaultHandler((parts) => console.log('Unrecognized command', parts));

registry.help('say'); /* Returns string:
"say <first>\n" +
"say <first> <extras_1> [extras_2] ... [extras_n]" */

registry.execute('say one'); /* Prints:
I got {
  _: ["one"],
  first: "one",
} */

registry.execute('say one two three four'); /* Prints:
I got {
  _: ["one", "two", "three", "four"],
  first: "one",
  extras: ["two", "three", "four"],
} */

try {
    registry.execute('die_always');
} catch (err) {
    // CommandError
    // .message: "Command failed"
    // .nested: Error("I strike again!")
    // .full_message: "Command failed: I strike again!"
}

registry.execute('some random thing'); /* Prints:
Unrecognized command ["some", "random", "thing"] */
```

There are more examples in the [API docs](API.md).

### A note on async
This library has a permissive enough API that one could force mixing sync and
async elements together. While this is possible, it is explicitly discouraged
and not officially supported. If you need both sync and async commands, consider
either making all commands async or dividing them into two separate registries.

```js
// DON'T DO THIS!
const registry = new CommandRegistry()
    .asynchronous(false)
    .add(new Command('example'))
    .add(new Command('other'));
registry.commands.get('example').is_async = true;

try {
    registry.execute('example').then(...).catch(...);
} catch (err) {
    ...
}

// Do this instead!
const registry = new CommandRegistry()
    .asynchronous(true)
    .add(new Command('example'))
    .add(new Command('other'));

registry.execute('example').then(...).catch(...);
```

## License

Copyright 2021 [Mimickal](https://github.com/Mimickal)

This code is licensed under the
[LGPL-3.0](https://www.gnu.org/licenses/lgpl-3.0-standalone.html) license.

Basically, you are free to use this library in your closed source projects, but
any modifications to this library must be made open source.
