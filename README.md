# positional-args - Node.js positional argument parser

<a href="LICENSE.md"><img align="right" alt="AGPL-3.0 Logo"
src="https://www.gnu.org/graphics/lgplv3-with-text-154x68.png">
</a>

This library was originally written to be a lightweight, unintrusive alternative
to [Commando](https://www.npmjs.com/package/discord.js-commando) for Discord
bots.

Unlike other argument parsers, this library is built specifically for positional
arguments, allowing it to provide much more functionality and control over how
positional arguments are interpreted. It also doesn't force you to restructure
your code to use it. All the individual pieces are exposed and work standalone,
so you only have to use as much of the library as you need.

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

## Usage
[See full API here](API.md)

Coming soon!

## License

Copyright 2021 [Mimickal](https://github.com/Mimickal)

This code is licensed under the
[LGPL-3.0](https://www.gnu.org/licenses/lgpl-3.0-standalone.html) license.

Basically, you are free to use this library in your closed source projects, but
any modifications to this library must be made open source.

