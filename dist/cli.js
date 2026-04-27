#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.endsWith("...")) {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.minWidthToWrap = 40;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
       * and just before calling `formatHelp()`.
       *
       * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
       *
       * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
       */
      prepareContext(contextOptions) {
        this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleSubcommandTerm(helper.subcommandTerm(command))
            )
          );
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleArgumentTerm(helper.argumentTerm(argument))
            )
          );
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (option.description) {
            return `${option.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return argument.description;
      }
      /**
       * Format a list of items, given a heading and an array of formatted items.
       *
       * @param {string} heading
       * @param {string[]} items
       * @param {Help} helper
       * @returns string[]
       */
      formatItemList(heading, items, helper) {
        if (items.length === 0) return [];
        return [helper.styleTitle(heading), ...items, ""];
      }
      /**
       * Group items by their help group heading.
       *
       * @param {Command[] | Option[]} unsortedItems
       * @param {Command[] | Option[]} visibleItems
       * @param {Function} getGroup
       * @returns {Map<string, Command[] | Option[]>}
       */
      groupItems(unsortedItems, visibleItems, getGroup) {
        const result = /* @__PURE__ */ new Map();
        unsortedItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) result.set(group, []);
        });
        visibleItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) {
            result.set(group, []);
          }
          result.get(group).push(item);
        });
        return result;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth ?? 80;
        function callFormatItem(term, description) {
          return helper.formatItem(term, termWidth, description, helper);
        }
        let output = [
          `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
          ""
        ];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.boxWrap(
              helper.styleCommandDescription(commandDescription),
              helpWidth
            ),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return callFormatItem(
            helper.styleArgumentTerm(helper.argumentTerm(argument)),
            helper.styleArgumentDescription(helper.argumentDescription(argument))
          );
        });
        output = output.concat(
          this.formatItemList("Arguments:", argumentList, helper)
        );
        const optionGroups = this.groupItems(
          cmd.options,
          helper.visibleOptions(cmd),
          (option) => option.helpGroupHeading ?? "Options:"
        );
        optionGroups.forEach((options, group) => {
          const optionList = options.map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(this.formatItemList(group, optionList, helper));
        });
        if (helper.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(
            this.formatItemList("Global Options:", globalOptionList, helper)
          );
        }
        const commandGroups = this.groupItems(
          cmd.commands,
          helper.visibleCommands(cmd),
          (sub) => sub.helpGroup() || "Commands:"
        );
        commandGroups.forEach((commands, group) => {
          const commandList = commands.map((sub) => {
            return callFormatItem(
              helper.styleSubcommandTerm(helper.subcommandTerm(sub)),
              helper.styleSubcommandDescription(helper.subcommandDescription(sub))
            );
          });
          output = output.concat(this.formatItemList(group, commandList, helper));
        });
        return output.join("\n");
      }
      /**
       * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
       *
       * @param {string} str
       * @returns {number}
       */
      displayWidth(str2) {
        return stripColor(str2).length;
      }
      /**
       * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
       *
       * @param {string} str
       * @returns {string}
       */
      styleTitle(str2) {
        return str2;
      }
      styleUsage(str2) {
        return str2.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word === "[command]") return this.styleSubcommandText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleCommandText(word);
        }).join(" ");
      }
      styleCommandDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleOptionDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleSubcommandDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleArgumentDescription(str2) {
        return this.styleDescriptionText(str2);
      }
      styleDescriptionText(str2) {
        return str2;
      }
      styleOptionTerm(str2) {
        return this.styleOptionText(str2);
      }
      styleSubcommandTerm(str2) {
        return str2.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleSubcommandText(word);
        }).join(" ");
      }
      styleArgumentTerm(str2) {
        return this.styleArgumentText(str2);
      }
      styleOptionText(str2) {
        return str2;
      }
      styleArgumentText(str2) {
        return str2;
      }
      styleSubcommandText(str2) {
        return str2;
      }
      styleCommandText(str2) {
        return str2;
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
       *
       * @param {string} str
       * @returns {boolean}
       */
      preformatted(str2) {
        return /\n[^\S\r\n]/.test(str2);
      }
      /**
       * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
       *
       * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
       *   TTT  DDD DDDD
       *        DD DDD
       *
       * @param {string} term
       * @param {number} termWidth
       * @param {string} description
       * @param {Help} helper
       * @returns {string}
       */
      formatItem(term, termWidth, description, helper) {
        const itemIndent = 2;
        const itemIndentStr = " ".repeat(itemIndent);
        if (!description) return itemIndentStr + term;
        const paddedTerm = term.padEnd(
          termWidth + term.length - helper.displayWidth(term)
        );
        const spacerWidth = 2;
        const helpWidth = this.helpWidth ?? 80;
        const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
        let formattedDescription;
        if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
          formattedDescription = description;
        } else {
          const wrappedDescription = helper.boxWrap(description, remainingWidth);
          formattedDescription = wrappedDescription.replace(
            /\n/g,
            "\n" + " ".repeat(termWidth + spacerWidth)
          );
        }
        return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
      }
      /**
       * Wrap a string at whitespace, preserving existing line breaks.
       * Wrapping is skipped if the width is less than `minWidthToWrap`.
       *
       * @param {string} str
       * @param {number} width
       * @returns {string}
       */
      boxWrap(str2, width) {
        if (width < this.minWidthToWrap) return str2;
        const rawLines = str2.split(/\r\n|\n/);
        const chunkPattern = /[\s]*[^\s]+/g;
        const wrappedLines = [];
        rawLines.forEach((line) => {
          const chunks = line.match(chunkPattern);
          if (chunks === null) {
            wrappedLines.push("");
            return;
          }
          let sumChunks = [chunks.shift()];
          let sumWidth = this.displayWidth(sumChunks[0]);
          chunks.forEach((chunk) => {
            const visibleWidth = this.displayWidth(chunk);
            if (sumWidth + visibleWidth <= width) {
              sumChunks.push(chunk);
              sumWidth += visibleWidth;
              return;
            }
            wrappedLines.push(sumChunks.join(""));
            const nextChunk = chunk.trimStart();
            sumChunks = [nextChunk];
            sumWidth = this.displayWidth(nextChunk);
          });
          wrappedLines.push(sumChunks.join(""));
        });
        return wrappedLines.join("\n");
      }
    };
    function stripColor(str2) {
      const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
      return str2.replace(sgrPattern, "");
    }
    exports2.Help = Help2;
    exports2.stripColor = stripColor;
  }
});

// node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
        this.helpGroupHeading = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as an object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        if (this.negate) {
          return camelcase(this.name().replace(/^no-/, ""));
        }
        return camelcase(this.name());
      }
      /**
       * Set the help group heading.
       *
       * @param {string} heading
       * @return {Option}
       */
      helpGroup(heading) {
        this.helpGroupHeading = heading;
        return this;
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str2) {
      return str2.split("-").reduce((str3, word) => {
        return str3 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const shortFlagExp = /^-[^-]$/;
      const longFlagExp = /^--[^-]/;
      const flagParts = flags.split(/[ |,]+/).concat("guard");
      if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
      if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
      if (!shortFlag && shortFlagExp.test(flagParts[0]))
        shortFlag = flagParts.shift();
      if (!shortFlag && longFlagExp.test(flagParts[0])) {
        shortFlag = longFlag;
        longFlag = flagParts.shift();
      }
      if (flagParts[0].startsWith("-")) {
        const unsupportedFlag = flagParts[0];
        const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
        if (/^-[^-][^-]/.test(unsupportedFlag))
          throw new Error(
            `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
          );
        if (shortFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many short flags`);
        if (longFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many long flags`);
        throw new Error(`${baseError}
- unrecognised flag format`);
      }
      if (shortFlag === void 0 && longFlag === void 0)
        throw new Error(
          `option creation failed due to no flags found in '${flags}'.`
        );
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("node:events").EventEmitter;
    var childProcess = require("node:child_process");
    var path2 = require("node:path");
    var fs2 = require("node:fs");
    var process2 = require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2, stripColor } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = false;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._savedState = null;
        this._outputConfiguration = {
          writeOut: (str2) => process2.stdout.write(str2),
          writeErr: (str2) => process2.stderr.write(str2),
          outputError: (str2, write) => write(str2),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
          getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
          stripColor: (str2) => stripColor(str2)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
        this._helpGroupHeading = void 0;
        this._defaultCommandGroup = void 0;
        this._defaultOptionGroup = void 0;
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // change how output being written, defaults to stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // change how output being written for errors, defaults to writeErr
       *     outputError(str, write) // used for displaying errors and not used for displaying help
       *     // specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // color support, currently only used with Help
       *     getOutHasColors()
       *     getErrHasColors()
       *     stripColor() // used to remove ANSI escape codes if output does not have colors
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        this._outputConfiguration = {
          ...this._outputConfiguration,
          ...configuration
        };
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom argument processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, parseArg, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof parseArg === "function") {
          argument.default(defaultValue).argParser(parseArg);
        } else {
          argument.default(parseArg);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument?.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          if (enableOrNameAndArgs && this._defaultCommandGroup) {
            this._initCommandGroup(this._getHelpCommand());
          }
          return this;
        }
        const nameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        if (enableOrNameAndArgs || description) this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this._initOptionGroup(option);
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this._initCommandGroup(command);
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._collectValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      _prepareForParse() {
        if (this._savedState === null) {
          this.saveStateBeforeParse();
        } else {
          this.restoreStateBeforeParse();
        }
      }
      /**
       * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state saved.
       */
      saveStateBeforeParse() {
        this._savedState = {
          // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
          _name: this._name,
          // option values before parse have default values (including false for negated options)
          // shallow clones
          _optionValues: { ...this._optionValues },
          _optionValueSources: { ...this._optionValueSources }
        };
      }
      /**
       * Restore state before parse for calls after the first.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state restored.
       */
      restoreStateBeforeParse() {
        if (this._storeOptionsAsProperties)
          throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
        this._name = this._savedState._name;
        this._scriptPath = null;
        this.rawArgs = [];
        this._optionValues = { ...this._savedState._optionValues };
        this._optionValueSources = { ...this._savedState._optionValueSources };
        this.args = [];
        this.processedArgs = [];
      }
      /**
       * Throw if expected executable is missing. Add lots of help for author.
       *
       * @param {string} executableFile
       * @param {string} executableDir
       * @param {string} subcommandName
       */
      _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
        if (fs2.existsSync(executableFile)) return;
        const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path2.resolve(baseDir, baseName);
          if (fs2.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path2.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs2.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs2.realpathSync(this._scriptPath);
          } catch {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path2.resolve(
            path2.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path2.basename(
              this._scriptPath,
              path2.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path2.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          this._checkForMissingExecutable(
            executableFile,
            executableDir,
            subcommand._name
          );
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            this._checkForMissingExecutable(
              executableFile,
              executableDir,
              subcommand._name
            );
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        subCommand._prepareForParse();
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise?.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent?.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Side effects: modifies command by storing options. Does not reset state if called again.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} args
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(args) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        const negativeNumberArg = (arg) => {
          if (!/^-(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(arg)) return false;
          return !this._getCommandAndAncestors().some(
            (cmd) => cmd.options.map((opt) => opt.short).some((short) => /^-\d$/.test(short))
          );
        };
        let activeVariadicOption = null;
        let activeGroup = null;
        let i = 0;
        while (i < args.length || activeGroup) {
          const arg = activeGroup ?? args[i++];
          activeGroup = null;
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args.slice(i));
            break;
          }
          if (activeVariadicOption && (!maybeOption(arg) || negativeNumberArg(arg))) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args[i++];
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (i < args.length && (!maybeOption(args[i]) || negativeNumberArg(args[i]))) {
                  value = args[i++];
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                activeGroup = `-${arg.slice(2)}`;
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (dest === operands && maybeOption(arg) && !(this.commands.length === 0 && negativeNumberArg(arg))) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              unknown.push(...args.slice(i));
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg, ...args.slice(i));
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg, ...args.slice(i));
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg, ...args.slice(i));
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str2, flags, description) {
        if (str2 === void 0) return this._version;
        this._version = str2;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str2}
`);
          this._exit(0, "commander.version", str2);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str2, argsDescription) {
        if (str2 === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str2;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str2) {
        if (str2 === void 0) return this._summary;
        this._summary = str2;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str2) {
        if (str2 === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str2;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str2) {
        if (str2 === void 0) return this._name;
        this._name = str2;
        return this;
      }
      /**
       * Set/get the help group heading for this subcommand in parent command's help.
       *
       * @param {string} [heading]
       * @return {Command | string}
       */
      helpGroup(heading) {
        if (heading === void 0) return this._helpGroupHeading ?? "";
        this._helpGroupHeading = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for subcommands added to this command.
       * (This does not override a group set directly on the subcommand using .helpGroup().)
       *
       * @example
       * program.commandsGroup('Development Commands:);
       * program.command('watch')...
       * program.command('lint')...
       * ...
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      commandsGroup(heading) {
        if (heading === void 0) return this._defaultCommandGroup ?? "";
        this._defaultCommandGroup = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for options added to this command.
       * (This does not override a group set directly on the option using .helpGroup().)
       *
       * @example
       * program
       *   .optionsGroup('Development Options:')
       *   .option('-d, --debug', 'output extra debugging')
       *   .option('-p, --profile', 'output profiling information')
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      optionsGroup(heading) {
        if (heading === void 0) return this._defaultOptionGroup ?? "";
        this._defaultOptionGroup = heading;
        return this;
      }
      /**
       * @param {Option} option
       * @private
       */
      _initOptionGroup(option) {
        if (this._defaultOptionGroup && !option.helpGroupHeading)
          option.helpGroup(this._defaultOptionGroup);
      }
      /**
       * @param {Command} cmd
       * @private
       */
      _initCommandGroup(cmd) {
        if (this._defaultCommandGroup && !cmd.helpGroup())
          cmd.helpGroup(this._defaultCommandGroup);
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path2.basename(filename, path2.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path3) {
        if (path3 === void 0) return this._executableDir;
        this._executableDir = path3;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        const context = this._getOutputContext(contextOptions);
        helper.prepareContext({
          error: context.error,
          helpWidth: context.helpWidth,
          outputHasColors: context.hasColors
        });
        const text = helper.formatHelp(this, helper);
        if (context.hasColors) return text;
        return this._outputConfiguration.stripColor(text);
      }
      /**
       * @typedef HelpContext
       * @type {object}
       * @property {boolean} error
       * @property {number} helpWidth
       * @property {boolean} hasColors
       * @property {function} write - includes stripColor if needed
       *
       * @returns {HelpContext}
       * @private
       */
      _getOutputContext(contextOptions) {
        contextOptions = contextOptions || {};
        const error = !!contextOptions.error;
        let baseWrite;
        let hasColors;
        let helpWidth;
        if (error) {
          baseWrite = (str2) => this._outputConfiguration.writeErr(str2);
          hasColors = this._outputConfiguration.getErrHasColors();
          helpWidth = this._outputConfiguration.getErrHelpWidth();
        } else {
          baseWrite = (str2) => this._outputConfiguration.writeOut(str2);
          hasColors = this._outputConfiguration.getOutHasColors();
          helpWidth = this._outputConfiguration.getOutHelpWidth();
        }
        const write = (str2) => {
          if (!hasColors) str2 = this._outputConfiguration.stripColor(str2);
          return baseWrite(str2);
        };
        return { error, write, hasColors, helpWidth };
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const outputContext = this._getOutputContext(contextOptions);
        const eventContext = {
          error: outputContext.error,
          write: outputContext.write,
          command: this
        };
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
        this.emit("beforeHelp", eventContext);
        let helpInformation = this.helpInformation({ error: outputContext.error });
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        outputContext.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", eventContext);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", eventContext)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            if (this._helpOption === null) this._helpOption = void 0;
            if (this._defaultOptionGroup) {
              this._initOptionGroup(this._getHelpOption());
            }
          } else {
            this._helpOption = null;
          }
          return this;
        }
        this._helpOption = this.createOption(
          flags ?? "-h, --help",
          description ?? "display help for command"
        );
        if (flags || description) this._initOptionGroup(this._helpOption);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        this._initOptionGroup(option);
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = Number(process2.exitCode ?? 0);
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * // Do a little typing to coordinate emit and listener for the help text events.
       * @typedef HelpTextEventContext
       * @type {object}
       * @property {boolean} error
       * @property {Command} command
       * @property {function} write
       */
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function useColor() {
      if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
        return false;
      if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== void 0)
        return true;
      return void 0;
    }
    exports2.Command = Command2;
    exports2.useColor = useColor;
  }
});

// node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// src/cli.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));

// node_modules/zstdify/dist/bitstream/littleEndian.js
function readU32LE(data, offset) {
  if (offset + 4 > data.length) {
    throw new RangeError(`readU32LE: offset ${offset} + 4 exceeds length ${data.length}`);
  }
  const a = data[offset];
  const b = data[offset + 1];
  const c = data[offset + 2];
  const d = data[offset + 3];
  if (a === void 0 || b === void 0 || c === void 0 || d === void 0)
    throw new Error("unreachable");
  return (a | b << 8 | c << 16 | d << 24) >>> 0;
}
function readU64LE(data, offset) {
  if (offset + 8 > data.length) {
    throw new RangeError(`readU64LE: offset ${offset} + 8 exceeds length ${data.length}`);
  }
  const b0 = data[offset];
  const b1 = data[offset + 1];
  const b2 = data[offset + 2];
  const b3 = data[offset + 3];
  const b4 = data[offset + 4];
  const b5 = data[offset + 5];
  const b6 = data[offset + 6];
  const b7 = data[offset + 7];
  if ([b0, b1, b2, b3, b4, b5, b6, b7].some((x) => x === void 0))
    throw new Error("unreachable");
  const lo = (b0 | b1 << 8 | b2 << 16 | b3 << 24) >>> 0;
  const hi = (b4 | b5 << 8 | b6 << 16 | b7 << 24) >>> 0;
  return BigInt(lo) | BigInt(hi) << 32n;
}

// node_modules/zstdify/dist/errors.js
var ZstdError = class _ZstdError extends Error {
  code;
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "ZstdError";
    Object.setPrototypeOf(this, _ZstdError.prototype);
  }
};

// node_modules/zstdify/dist/entropy/fse.js
var FSE_MIN_TABLELOG = 5;
var FSE_TABLESTEP = (tableSize) => (tableSize >> 1) + (tableSize >> 3) + 3;
function buildFSEDecodeTable(normalizedCounter, tableLog) {
  if (!normalizedCounter || normalizedCounter.length === 0) {
    throw new ZstdError("FSE: invalid normalized counter", "corruption_detected");
  }
  if (!Number.isInteger(tableLog) || tableLog < 1 || tableLog > 15) {
    throw new ZstdError("FSE: invalid tableLog", "corruption_detected");
  }
  if (normalizedCounter.length > 65535 + 1) {
    throw new ZstdError("FSE: symbol value out of range", "corruption_detected");
  }
  const tableSize = 1 << tableLog;
  let totalProbability = 0;
  for (let s = 0; s < normalizedCounter.length; s++) {
    const n = normalizedCounter[s];
    if (!Number.isInteger(n) || n === void 0 || n < -1) {
      throw new ZstdError("FSE: invalid normalized count", "corruption_detected");
    }
    totalProbability += n < 0 ? 1 : n;
    if (totalProbability > tableSize) {
      throw new ZstdError("FSE: invalid normalized sum", "corruption_detected");
    }
  }
  if (totalProbability !== tableSize) {
    throw new ZstdError("FSE: invalid normalized sum", "corruption_detected");
  }
  const tableSymbol = new Array(tableSize);
  const maxSymbolValue = normalizedCounter.length - 1;
  const symbolNext = new Array(maxSymbolValue + 1);
  let highThreshold = tableSize - 1;
  for (let s = 0; s <= maxSymbolValue; s++) {
    const n = normalizedCounter[s] ?? 0;
    if (n === -1) {
      tableSymbol[highThreshold] = s;
      highThreshold--;
      symbolNext[s] = 1;
    } else {
      symbolNext[s] = n;
    }
  }
  const step = FSE_TABLESTEP(tableSize);
  const tableMask = tableSize - 1;
  let position = 0;
  for (let s = 0; s <= maxSymbolValue; s++) {
    const n = normalizedCounter[s] ?? 0;
    if (n <= 0)
      continue;
    for (let i = 0; i < n; i++) {
      tableSymbol[position] = s;
      do {
        position = position + step & tableMask;
      } while (position > highThreshold);
    }
  }
  const symbolByState = new Uint16Array(tableSize);
  const numBitsByState = new Uint8Array(tableSize);
  const baselineByState = new Int32Array(tableSize);
  for (let u = 0; u < tableSize; u++) {
    const symbol = tableSymbol[u];
    if (symbol === void 0) {
      throw new ZstdError("FSE invalid decode table", "corruption_detected");
    }
    const nextState = symbolNext[symbol];
    if (nextState === void 0)
      throw new ZstdError("FSE invalid symbol", "corruption_detected");
    symbolNext[symbol] = nextState + 1;
    const nbBits = tableLog - 31 + Math.clz32(nextState);
    const baseline = (nextState << nbBits) - tableSize;
    symbolByState[u] = symbol;
    numBitsByState[u] = nbBits;
    baselineByState[u] = baseline;
  }
  return {
    symbol: symbolByState,
    numBits: numBitsByState,
    baseline: baselineByState,
    tableLog,
    length: tableSize
  };
}
function readU32LESafe(data, offset) {
  return (data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24) >>> 0;
}
function highbit32(v) {
  return 31 - Math.clz32(v >>> 0);
}
function ctz32(v) {
  const x = v >>> 0;
  if (x === 0)
    return 32;
  return 31 - Math.clz32((x & -x) >>> 0);
}
function readNCount(data, offset, maxSymbolValue, maxTableLog) {
  const remainingInput = data.length - offset;
  if (remainingInput <= 0) {
    throw new ZstdError("FSE readNCount: truncated input", "corruption_detected");
  }
  const parseBody = (buf, hbSize) => {
    const normalizedCounter = new Array(maxSymbolValue + 1).fill(0);
    let ip = 0;
    const iend = hbSize;
    const maxSV1 = maxSymbolValue + 1;
    let previous0 = false;
    let charnum = 0;
    let bitStream = readU32LESafe(buf, ip);
    let nbBits = (bitStream & 15) + 5;
    if (nbBits > maxTableLog) {
      throw new ZstdError("FSE readNCount: tableLog too large", "corruption_detected");
    }
    const tableLog = nbBits;
    bitStream >>>= 4;
    let bitCount = 4;
    let remaining = (1 << nbBits) + 1;
    let threshold = 1 << nbBits;
    nbBits += 1;
    const reload = () => {
      if (ip <= iend - 7 || ip + (bitCount >> 3) <= iend - 4) {
        ip += bitCount >> 3;
        bitCount &= 7;
      } else {
        bitCount -= 8 * (iend - 4 - ip);
        bitCount &= 31;
        ip = iend - 4;
      }
      bitStream = readU32LESafe(buf, ip) >>> bitCount;
    };
    while (true) {
      if (previous0) {
        let repeats = ctz32((~bitStream | 2147483648) >>> 0) >> 1;
        while (repeats >= 12) {
          charnum += 3 * 12;
          if (ip <= iend - 7) {
            ip += 3;
          } else {
            bitCount -= 8 * (iend - 7 - ip);
            bitCount &= 31;
            ip = iend - 4;
          }
          bitStream = readU32LESafe(buf, ip) >>> bitCount;
          repeats = ctz32((~bitStream | 2147483648) >>> 0) >> 1;
        }
        charnum += 3 * repeats;
        bitStream >>>= 2 * repeats;
        bitCount += 2 * repeats;
        const lastRepeat = bitStream & 3;
        if (lastRepeat >= 3) {
          throw new ZstdError("FSE readNCount: invalid zero repeat", "corruption_detected");
        }
        charnum += lastRepeat;
        bitCount += 2;
        if (charnum >= maxSV1)
          break;
        reload();
      }
      const max = 2 * threshold - 1 - remaining;
      let count;
      if ((bitStream & threshold - 1) < max) {
        count = bitStream & threshold - 1;
        bitCount += nbBits - 1;
      } else {
        count = bitStream & 2 * threshold - 1;
        if (count >= threshold)
          count -= max;
        bitCount += nbBits;
      }
      count -= 1;
      if (count >= 0) {
        remaining -= count;
      } else {
        remaining += count;
      }
      normalizedCounter[charnum] = count;
      charnum += 1;
      previous0 = count === 0;
      if (remaining < threshold) {
        if (remaining <= 1)
          break;
        nbBits = highbit32(remaining) + 1;
        threshold = 1 << nbBits - 1;
      }
      if (charnum >= maxSV1)
        break;
      reload();
    }
    if (remaining !== 1) {
      throw new ZstdError("FSE readNCount: invalid probability sum", "corruption_detected");
    }
    if (charnum > maxSV1 || bitCount > 32) {
      throw new ZstdError("FSE readNCount: corrupted header", "corruption_detected");
    }
    ip += bitCount + 7 >> 3;
    const outMaxSymbol = charnum - 1;
    for (let i = charnum; i <= maxSymbolValue; i++) {
      normalizedCounter[i] = 0;
    }
    return { normalizedCounter, tableLog, maxSymbolValue: outMaxSymbol, bytesRead: ip };
  };
  if (remainingInput < 8) {
    const scratch = new Uint8Array(8);
    scratch.set(data.subarray(offset));
    const parsed = parseBody(scratch, 8);
    if (parsed.bytesRead > remainingInput) {
      throw new ZstdError("FSE readNCount: truncated input", "corruption_detected");
    }
    return parsed;
  }
  return parseBody(data.subarray(offset), remainingInput);
}
function normalizeCountsForTable(counts, tableLog) {
  const tableSize = 1 << tableLog;
  if (tableSize <= 0) {
    throw new ZstdError("FSE normalize: invalid tableLog", "parameter_unsupported");
  }
  const maxSymbolValue = counts.length - 1;
  if (maxSymbolValue < 0) {
    throw new ZstdError("FSE normalize: empty counts", "parameter_unsupported");
  }
  const normalizedCounter = new Array(counts.length).fill(0);
  let total = 0;
  let nonZero = 0;
  for (let s = 0; s < counts.length; s++) {
    const c = counts[s] ?? 0;
    if (c > 0) {
      total += c;
      nonZero++;
    }
  }
  if (total <= 0 || nonZero === 0) {
    throw new ZstdError("FSE normalize: empty distribution", "parameter_unsupported");
  }
  if (nonZero > tableSize) {
    throw new ZstdError("FSE normalize: table too small for distribution", "parameter_unsupported");
  }
  const remainders = new Array(counts.length).fill(0);
  let assigned = 0;
  for (let s = 0; s < counts.length; s++) {
    const c = counts[s] ?? 0;
    if (c <= 0)
      continue;
    const scaled = c * tableSize / total;
    let value = Math.floor(scaled);
    if (value < 1)
      value = 1;
    normalizedCounter[s] = value;
    remainders[s] = scaled - Math.floor(scaled);
    assigned += value;
  }
  while (assigned > tableSize) {
    let bestSymbol = -1;
    let bestCount = 0;
    for (let s = 0; s < normalizedCounter.length; s++) {
      const n = normalizedCounter[s] ?? 0;
      if (n > 1 && n > bestCount) {
        bestCount = n;
        bestSymbol = s;
      }
    }
    if (bestSymbol < 0) {
      throw new ZstdError("FSE normalize: failed to reduce distribution", "parameter_unsupported");
    }
    normalizedCounter[bestSymbol] = (normalizedCounter[bestSymbol] ?? 1) - 1;
    assigned--;
  }
  while (assigned < tableSize) {
    let bestSymbol = -1;
    let bestRemainder = -1;
    let bestCount = -1;
    for (let s = 0; s < normalizedCounter.length; s++) {
      const n = normalizedCounter[s] ?? 0;
      if (n <= 0)
        continue;
      const rem = remainders[s] ?? 0;
      if (rem > bestRemainder || rem === bestRemainder && n > bestCount) {
        bestRemainder = rem;
        bestCount = n;
        bestSymbol = s;
      }
    }
    if (bestSymbol < 0) {
      throw new ZstdError("FSE normalize: failed to complete distribution", "parameter_unsupported");
    }
    normalizedCounter[bestSymbol] = (normalizedCounter[bestSymbol] ?? 0) + 1;
    assigned++;
  }
  return { normalizedCounter, maxSymbolValue };
}
function writeNCount(normalizedCounter, maxSymbolValue, tableLog) {
  if (tableLog < FSE_MIN_TABLELOG) {
    throw new ZstdError("FSE writeNCount: tableLog too small", "parameter_unsupported");
  }
  if (maxSymbolValue < 0 || maxSymbolValue >= normalizedCounter.length) {
    throw new ZstdError("FSE writeNCount: invalid max symbol", "parameter_unsupported");
  }
  const tableSize = 1 << tableLog;
  const out = [];
  let bitStream = 0 >>> 0;
  let bitCount = 0;
  let nbBits = tableLog + 1;
  let remaining = tableSize + 1;
  let threshold = tableSize;
  let symbol = 0;
  const alphabetSize = maxSymbolValue + 1;
  let previousIs0 = false;
  const flush16 = () => {
    out.push(bitStream & 255, bitStream >>> 8 & 255);
    bitStream >>>= 16;
    bitCount -= 16;
  };
  bitStream = bitStream + (tableLog - FSE_MIN_TABLELOG << bitCount) >>> 0;
  bitCount += 4;
  while (symbol < alphabetSize && remaining > 1) {
    if (previousIs0) {
      let start = symbol;
      while (symbol < alphabetSize && (normalizedCounter[symbol] ?? 0) === 0)
        symbol++;
      if (symbol === alphabetSize)
        break;
      while (symbol >= start + 24) {
        start += 24;
        bitStream = bitStream + (65535 << bitCount >>> 0) >>> 0;
        flush16();
      }
      while (symbol >= start + 3) {
        start += 3;
        bitStream = bitStream + (3 << bitCount >>> 0) >>> 0;
        bitCount += 2;
      }
      bitStream = bitStream + (symbol - start << bitCount) >>> 0;
      bitCount += 2;
      while (bitCount > 16) {
        flush16();
      }
    }
    let count = normalizedCounter[symbol] ?? 0;
    symbol++;
    const max = 2 * threshold - 1 - remaining;
    remaining -= count < 0 ? -count : count;
    count += 1;
    if (count >= threshold)
      count += max;
    bitStream = bitStream + (count >>> 0 << bitCount >>> 0) >>> 0;
    bitCount += nbBits;
    if (count < max)
      bitCount -= 1;
    previousIs0 = count === 1;
    if (remaining < 1) {
      throw new ZstdError("FSE writeNCount: invalid normalized distribution", "parameter_unsupported");
    }
    while (remaining < threshold) {
      nbBits--;
      threshold >>= 1;
    }
    while (bitCount > 16) {
      flush16();
    }
  }
  if (remaining !== 1) {
    throw new ZstdError("FSE writeNCount: invalid normalized sum", "parameter_unsupported");
  }
  out.push(bitStream & 255, bitStream >>> 8 & 255);
  const finalSize = out.length - (2 - (bitCount + 7 >> 3));
  return new Uint8Array(out.slice(0, finalSize));
}

// node_modules/zstdify/dist/entropy/huffman.js
function weightsToNumBits(weights, maxNumBits) {
  const result = [];
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] ?? 0;
    result.push(w ? maxNumBits + 1 - w : 0);
  }
  return result;
}
function buildHuffmanDecodeTable(numBits, maxNumBits) {
  const tableSize = 1 << maxNumBits;
  const symbolByPrefix = new Uint8Array(tableSize);
  const bitsByPrefix = new Uint8Array(tableSize);
  const rankCount = new Array(maxNumBits + 1).fill(0);
  for (let s = 0; s < numBits.length; s++) {
    const len = numBits[s] ?? 0;
    if (len < 0 || len > maxNumBits) {
      throw new ZstdError("Huffman invalid bit length", "corruption_detected");
    }
    rankCount[len] = (rankCount[len] ?? 0) + 1;
  }
  const rankIdx = new Array(maxNumBits + 1).fill(0);
  rankIdx[maxNumBits] = 0;
  for (let len = maxNumBits; len >= 1; len--) {
    const current = rankIdx[len] ?? 0;
    rankIdx[len - 1] = current + (rankCount[len] ?? 0) * (1 << maxNumBits - len);
  }
  if (rankIdx[0] !== tableSize) {
    throw new ZstdError("Huffman invalid tree", "corruption_detected");
  }
  for (let symbol = 0; symbol < numBits.length; symbol++) {
    const len = numBits[symbol] ?? 0;
    if (len === 0)
      continue;
    const code = rankIdx[len] ?? 0;
    const span = 1 << maxNumBits - len;
    for (let i = 0; i < span; i++) {
      symbolByPrefix[code + i] = symbol;
      bitsByPrefix[code + i] = len;
    }
    rankIdx[len] = code + span;
  }
  return {
    symbol: symbolByPrefix,
    numBits: bitsByPrefix,
    maxNumBits,
    length: tableSize
  };
}

// node_modules/zstdify/dist/entropy/weights.js
function readWeightsDirect(data, offset, numWeights) {
  const bytesNeeded = Math.ceil(numWeights / 2);
  if (offset + bytesNeeded > data.length) {
    throw new ZstdError("Huffman weights truncated", "corruption_detected");
  }
  const weights = [];
  for (let i = 0; i < numWeights; i++) {
    const byteIdx = Math.floor(i / 2);
    const byte = data[offset + byteIdx];
    if (byte === void 0)
      throw new ZstdError("Huffman weights truncated", "corruption_detected");
    const nibble = (i & 1) === 0 ? byte >> 4 & 15 : byte & 15;
    weights.push(nibble);
  }
  return { weights, bytesRead: bytesNeeded };
}
var MAX_WEIGHT_SYMBOL = 11;
var MAX_WEIGHT_TABLE_LOG = 7;
function readWeightsFSE(data, offset, compressedSize) {
  if (compressedSize < 2) {
    throw new ZstdError("FSE-compressed weights: need at least 2 bytes", "corruption_detected");
  }
  if (offset + compressedSize > data.length) {
    throw new ZstdError("FSE-compressed weights truncated", "corruption_detected");
  }
  const header = data.subarray(offset, offset + compressedSize);
  const { normalizedCounter, tableLog, bytesRead: ncountBytes } = readNCount(header, 0, MAX_WEIGHT_SYMBOL, MAX_WEIGHT_TABLE_LOG);
  const table = buildFSEDecodeTable(normalizedCounter, tableLog);
  const streamStart = ncountBytes;
  const streamLength = compressedSize - ncountBytes;
  if (streamLength <= 0) {
    throw new ZstdError("FSE-compressed weights: no stream after header", "corruption_detected");
  }
  const stream = header.subarray(streamStart, streamStart + streamLength);
  const lastByte = stream[stream.length - 1] ?? 0;
  if (lastByte === 0) {
    throw new ZstdError("FSE-compressed weights: invalid end marker", "corruption_detected");
  }
  const highestSetBit = 31 - Math.clz32(lastByte);
  const paddingBits = 8 - highestSetBit;
  let bitOffset = streamLength * 8 - paddingBits;
  const readBitsZeroExtended = (numBits) => {
    if (numBits <= 0)
      return 0;
    bitOffset -= numBits;
    let value = 0;
    for (let i = 0; i < numBits; i++) {
      const abs = bitOffset + i;
      if (abs < 0)
        continue;
      const byteIndex = abs >>> 3;
      const bitInByte = abs & 7;
      const bit = (stream[byteIndex] ?? 0) >>> bitInByte & 1;
      value |= bit << i;
    }
    return value;
  };
  const weights = [];
  const state1 = { value: readBitsZeroExtended(tableLog) };
  const state2 = { value: readBitsZeroExtended(tableLog) };
  while (weights.length < 255) {
    if (state1.value < 0 || state1.value >= table.length) {
      throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
    }
    const sym1 = table.symbol[state1.value];
    const bits1 = table.numBits[state1.value];
    const baseline1 = table.baseline[state1.value];
    weights.push(sym1);
    state1.value = baseline1 + readBitsZeroExtended(bits1);
    if (bitOffset < 0) {
      if (state2.value < 0 || state2.value >= table.length) {
        throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
      }
      weights.push(table.symbol[state2.value]);
      break;
    }
    if (weights.length >= 255)
      break;
    if (state2.value < 0 || state2.value >= table.length) {
      throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
    }
    const sym2 = table.symbol[state2.value];
    const bits2 = table.numBits[state2.value];
    const baseline2 = table.baseline[state2.value];
    weights.push(sym2);
    state2.value = baseline2 + readBitsZeroExtended(bits2);
    if (bitOffset < 0) {
      if (state1.value < 0 || state1.value >= table.length) {
        throw new ZstdError("FSE-compressed weights: invalid state", "corruption_detected");
      }
      weights.push(table.symbol[state1.value]);
      break;
    }
  }
  if (weights.length < 2) {
    throw new ZstdError("FSE-compressed weights: need at least 2 weights", "corruption_detected");
  }
  return { weights, bytesRead: compressedSize };
}

// node_modules/zstdify/dist/dictionary/decoderDictionary.js
var ZSTD_DICTIONARY_MAGIC = 3962610743;
function buildHuffmanTableFromWeights(weights) {
  let partialSum = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] ?? 0;
    if (w > 0)
      partialSum += 1 << w - 1;
  }
  if (partialSum === 0) {
    throw new ZstdError("Invalid Huffman weights", "corruption_detected");
  }
  const maxNumBits = 32 - Math.clz32(partialSum);
  const total = 1 << maxNumBits;
  const remainder = total - partialSum;
  if (remainder <= 0 || (remainder & remainder - 1) !== 0) {
    throw new ZstdError("Invalid Huffman weights: cannot complete to power of 2", "corruption_detected");
  }
  const lastWeight = 32 - Math.clz32(remainder);
  const fullWeights = [...weights, lastWeight];
  while (fullWeights.length < 256) {
    fullWeights.push(0);
  }
  const numBits = weightsToNumBits(fullWeights, maxNumBits);
  return {
    table: buildHuffmanDecodeTable(numBits, maxNumBits),
    maxNumBits
  };
}
function parseDictionaryHuffmanTable(data, offset) {
  if (offset >= data.length) {
    throw new ZstdError("Dictionary Huffman table truncated", "corruption_detected");
  }
  const headerByte = data[offset] ?? 0;
  let pos = offset + 1;
  let weights;
  if (headerByte >= 128) {
    const numWeights = headerByte - 127;
    const direct = readWeightsDirect(data, pos, numWeights);
    weights = direct.weights;
    pos += direct.bytesRead;
  } else {
    const fse = readWeightsFSE(data, pos, headerByte);
    weights = fse.weights;
    pos += headerByte;
  }
  const table = buildHuffmanTableFromWeights(weights);
  return { table, bytesRead: pos - offset };
}
function normalizeDecoderDictionary(dictionaryBytes, providedDictionaryId = null) {
  if (dictionaryBytes.length < 8 || readU32LE(dictionaryBytes, 0) !== ZSTD_DICTIONARY_MAGIC) {
    return {
      historyPrefix: dictionaryBytes.slice(),
      dictionaryId: providedDictionaryId,
      repOffsets: [1, 4, 8],
      huffmanTable: null,
      sequenceTables: null
    };
  }
  if (dictionaryBytes.length <= 8) {
    throw new ZstdError("Dictionary too small", "corruption_detected");
  }
  const parsedDictionaryId = readU32LE(dictionaryBytes, 4);
  if (parsedDictionaryId === 0) {
    throw new ZstdError("Dictionary ID must be non-zero", "corruption_detected");
  }
  if (providedDictionaryId !== null && providedDictionaryId !== parsedDictionaryId) {
    throw new ZstdError("Provided dictionary ID does not match dictionary content", "corruption_detected");
  }
  let pos = 8;
  const huffman = parseDictionaryHuffmanTable(dictionaryBytes, pos);
  pos += huffman.bytesRead;
  const ofNCount = readNCount(dictionaryBytes, pos, 31, 8);
  pos += ofNCount.bytesRead;
  const mlNCount = readNCount(dictionaryBytes, pos, 52, 9);
  pos += mlNCount.bytesRead;
  const llNCount = readNCount(dictionaryBytes, pos, 35, 9);
  pos += llNCount.bytesRead;
  if (pos + 12 > dictionaryBytes.length) {
    throw new ZstdError("Dictionary entropy section truncated", "corruption_detected");
  }
  const contentSize = dictionaryBytes.length - (pos + 12);
  const repOffsets = [
    readU32LE(dictionaryBytes, pos),
    readU32LE(dictionaryBytes, pos + 4),
    readU32LE(dictionaryBytes, pos + 8)
  ];
  for (const rep of repOffsets) {
    if (rep === 0 || rep > contentSize) {
      throw new ZstdError("Invalid dictionary repeat offset", "corruption_detected");
    }
  }
  pos += 12;
  const historyPrefix = dictionaryBytes.subarray(pos).slice();
  const sequenceTables = {
    ofTable: buildFSEDecodeTable(ofNCount.normalizedCounter, ofNCount.tableLog),
    ofTableLog: ofNCount.tableLog,
    mlTable: buildFSEDecodeTable(mlNCount.normalizedCounter, mlNCount.tableLog),
    mlTableLog: mlNCount.tableLog,
    llTable: buildFSEDecodeTable(llNCount.normalizedCounter, llNCount.tableLog),
    llTableLog: llNCount.tableLog
  };
  return {
    historyPrefix,
    dictionaryId: parsedDictionaryId,
    repOffsets,
    huffmanTable: huffman.table,
    sequenceTables
  };
}

// node_modules/zstdify/dist/dictionary/compressorDictionary.js
var ZSTD_DICTIONARY_MAGIC2 = 3962610743;
function resolveDictionaryContextForCompression(dictionaryBytes, providedDictionaryId = null) {
  if (dictionaryBytes.length < 8 || readU32LE(dictionaryBytes, 0) !== ZSTD_DICTIONARY_MAGIC2) {
    return {
      dictionaryId: providedDictionaryId,
      historyPrefix: dictionaryBytes,
      repOffsets: [1, 4, 8]
    };
  }
  const parsed = normalizeDecoderDictionary(dictionaryBytes, providedDictionaryId);
  return {
    dictionaryId: parsed.dictionaryId,
    historyPrefix: parsed.historyPrefix,
    repOffsets: [parsed.repOffsets[0], parsed.repOffsets[1], parsed.repOffsets[2]]
  };
}

// node_modules/zstdify/dist/encode/blockWriter.js
var sharedHeader = null;
function writeU24LE(arr, offset, value) {
  arr[offset] = value & 255;
  arr[offset + 1] = value >> 8 & 255;
  arr[offset + 2] = value >> 16 & 255;
}
function getHeader() {
  if (!sharedHeader)
    sharedHeader = new Uint8Array(3);
  return sharedHeader;
}
function writeRawBlock(data, offset, size, last) {
  const header = getHeader();
  const blockHeader2 = (last ? 1 : 0) | 0 << 1 | size << 3;
  writeU24LE(header, 0, blockHeader2);
  const result = new Uint8Array(3 + size);
  result.set(header);
  result.set(data.subarray(offset, offset + size), 3);
  return result;
}
function writeRLEBlock(byte, size, last) {
  const header = getHeader();
  const blockHeader2 = (last ? 1 : 0) | 1 << 1 | size << 3;
  writeU24LE(header, 0, blockHeader2);
  const result = new Uint8Array(4);
  result.set(header, 0);
  result[3] = byte & 255;
  return result;
}

// node_modules/zstdify/dist/bitstream/reverseBitWriter.js
var ReverseBitWriter = class {
  buffer = new Uint8Array(0);
  outputSize = 0;
  writePos = 0;
  bitContainer = 0;
  bitCount = 0;
  reset(bitLength) {
    this.outputSize = bitLength + 7 >>> 3;
    if (this.buffer.length < this.outputSize) {
      this.buffer = new Uint8Array(this.outputSize);
    }
    this.buffer.fill(0, 0, this.outputSize);
    this.writePos = 0;
    this.bitContainer = 0;
    this.bitCount = 0;
  }
  writeBits(n, bits) {
    let remaining = n;
    let value = bits >>> 0;
    while (remaining > 0) {
      const take = remaining > 24 ? 24 : remaining;
      const partMask = (1 << take) - 1 >>> 0;
      const part = value & partMask;
      this.bitContainer |= part << this.bitCount;
      this.bitCount += take;
      value >>>= take;
      remaining -= take;
      while (this.bitCount >= 8) {
        this.buffer[this.writePos++] = this.bitContainer & 255;
        this.bitContainer >>>= 8;
        this.bitCount -= 8;
      }
    }
  }
  finish() {
    if (this.bitCount > 0 && this.writePos < this.outputSize) {
      this.buffer[this.writePos++] = this.bitContainer & 255;
      this.bitContainer = 0;
      this.bitCount = 0;
    }
    return this.buffer.slice(0, this.outputSize);
  }
};
function encodeReverseBitstream(bitCounts, bitValues, writer = new ReverseBitWriter()) {
  let bitLength = 1;
  for (let i = 0; i < bitCounts.length; i++) {
    const n = bitCounts[i] ?? 0;
    if (n > 0)
      bitLength += n;
  }
  writer.reset(bitLength);
  for (let i = bitCounts.length - 1; i >= 0; i--) {
    const n = bitCounts[i] ?? 0;
    if (n > 0)
      writer.writeBits(n, bitValues[i] ?? 0);
  }
  writer.writeBits(1, 1);
  return writer.finish();
}

// node_modules/zstdify/dist/entropy/predefined.js
var LITERALS_LENGTH_DEFAULT_DISTRIBUTION = [
  4,
  3,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  3,
  2,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  -1,
  -1
];
var MATCH_LENGTH_DEFAULT_DISTRIBUTION = [
  1,
  4,
  3,
  2,
  2,
  2,
  2,
  2,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1
];
var OFFSET_CODE_DEFAULT_DISTRIBUTION = [
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  -1,
  -1,
  -1
];
var LITERALS_LENGTH_TABLE_LOG = 6;
var MATCH_LENGTH_TABLE_LOG = 6;
var OFFSET_CODE_TABLE_LOG = 5;

// node_modules/zstdify/dist/bitstream/bitWriter.js
var BitWriter = class {
  chunks = [];
  currentByte = 0;
  bitOffset = 0;
  // 0-7, bits written in current byte
  /** Write n bits (1-32), LSB first */
  writeBits(n, bits) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitWriter.writeBits: n must be 1-32, got ${n}`);
    }
    const mask = n === 32 ? 4294967295 : (1 << n) - 1;
    let value = bits >>> 0 & mask;
    let bitsLeft = n;
    while (bitsLeft > 0) {
      const spaceInByte = 8 - this.bitOffset;
      const take = Math.min(bitsLeft, spaceInByte);
      const maskTake = (1 << take) - 1;
      this.currentByte |= (value & maskTake) << this.bitOffset;
      this.bitOffset += take;
      bitsLeft -= take;
      value >>= take;
      if (this.bitOffset >= 8) {
        this.chunks.push(this.currentByte & 255);
        this.currentByte = 0;
        this.bitOffset = 0;
      }
    }
  }
  /** Flush remaining bits to output. Call when done writing. */
  flush() {
    const result = [...this.chunks];
    if (this.bitOffset > 0) {
      result.push(this.currentByte & 255);
    }
    return new Uint8Array(result);
  }
  /** Reset writer for reuse */
  reset() {
    this.chunks = [];
    this.currentByte = 0;
    this.bitOffset = 0;
  }
};

// node_modules/zstdify/dist/encode/literalsEncoder.js
var literalBitCountsScratch = null;
var literalBitValuesScratch = null;
var WEIGHT_MAX_SYMBOL = 11;
var WEIGHT_MAX_TABLE_LOG = 7;
function ensureLiteralBitScratch(minLength) {
  const counts = literalBitCountsScratch;
  const values = literalBitValuesScratch;
  if (counts && values && counts.length >= minLength && values.length >= minLength) {
    return { counts, values };
  }
  let capacity = counts?.length ?? 0;
  if (capacity === 0)
    capacity = 64;
  while (capacity < minLength)
    capacity *= 2;
  literalBitCountsScratch = new Uint8Array(capacity);
  literalBitValuesScratch = new Uint32Array(capacity);
  return { counts: literalBitCountsScratch, values: literalBitValuesScratch };
}
function buildRawLiteralsSection(literals) {
  const size = literals.length;
  if (size <= 31) {
    const out = new Uint8Array(1 + size);
    out[0] = size << 3 | 0;
    out.set(literals, 1);
    return out;
  }
  if (size <= 4095) {
    const out = new Uint8Array(2 + size);
    out[0] = (size & 15) << 4 | 1 << 2;
    out[1] = size >>> 4 & 255;
    out.set(literals, 2);
    return out;
  }
  if (size <= 1048575) {
    const out = new Uint8Array(3 + size);
    out[0] = (size & 15) << 4 | 3 << 2;
    out[1] = size >>> 4 & 255;
    out[2] = size >>> 12 & 255;
    out.set(literals, 3);
    return out;
  }
  return null;
}
function buildRLELiteralsSection(literals) {
  if (literals.length === 0)
    return null;
  const value = literals[0] ?? 0;
  for (let i = 1; i < literals.length; i++) {
    if ((literals[i] ?? 0) !== value)
      return null;
  }
  const size = literals.length;
  if (size <= 31) {
    return new Uint8Array([size << 3 | 1, value]);
  }
  if (size <= 4095) {
    return new Uint8Array([(size & 15) << 4 | 1 << 2 | 1, size >>> 4 & 255, value]);
  }
  if (size <= 1048575) {
    return new Uint8Array([(size & 15) << 4 | 3 << 2 | 1, size >>> 4 & 255, size >>> 12 & 255, value]);
  }
  return null;
}
function buildHuffmanDepths(freq) {
  const nodes = [];
  const active = [];
  for (let s = 0; s < freq.length; s++) {
    const f = freq[s] ?? 0;
    if (f > 0) {
      nodes.push({ freq: f, symbol: s, left: -1, right: -1 });
      active.push(nodes.length - 1);
    }
  }
  if (active.length < 2)
    return null;
  while (active.length > 1) {
    active.sort((a, b) => {
      const fa = nodes[a]?.freq ?? 0;
      const fb = nodes[b]?.freq ?? 0;
      if (fa !== fb)
        return fa - fb;
      return (nodes[a]?.symbol ?? 0) - (nodes[b]?.symbol ?? 0);
    });
    const leftIdx = active.shift();
    const rightIdx = active.shift();
    if (leftIdx === void 0 || rightIdx === void 0)
      return null;
    const merged = {
      freq: (nodes[leftIdx]?.freq ?? 0) + (nodes[rightIdx]?.freq ?? 0),
      symbol: Math.min(nodes[leftIdx]?.symbol ?? 0, nodes[rightIdx]?.symbol ?? 0),
      left: leftIdx,
      right: rightIdx
    };
    nodes.push(merged);
    active.push(nodes.length - 1);
  }
  const root = active[0];
  if (root === void 0)
    return null;
  const depths = new Uint8Array(freq.length);
  const stack = [{ idx: root, depth: 0 }];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur)
      break;
    const node = nodes[cur.idx];
    if (!node)
      return null;
    if (node.left < 0 && node.right < 0) {
      depths[node.symbol] = cur.depth === 0 ? 1 : cur.depth;
      continue;
    }
    if (node.left >= 0)
      stack.push({ idx: node.left, depth: cur.depth + 1 });
    if (node.right >= 0)
      stack.push({ idx: node.right, depth: cur.depth + 1 });
  }
  return depths;
}
function buildFrequencyHuffmanTable(literals) {
  if (literals.length < 8)
    return null;
  let maxSymbol = 0;
  const freq = new Uint32Array(256);
  for (let i = 0; i < literals.length; i++) {
    const b = literals[i] ?? 0;
    freq[b] = (freq[b] ?? 0) + 1;
    if (b > maxSymbol)
      maxSymbol = b;
  }
  let weights;
  let maxNumBits = 0;
  const fullWeights = new Array(256).fill(0);
  if (maxSymbol < 255) {
    const freqWithPseudo = new Uint32Array(257);
    freqWithPseudo.set(freq, 0);
    const pseudoSymbol = maxSymbol + 1;
    freqWithPseudo[pseudoSymbol] = 1;
    const depths = buildHuffmanDepths(freqWithPseudo);
    if (!depths)
      return null;
    let maxDepth = 0;
    for (let s = 0; s <= pseudoSymbol; s++) {
      const d = depths[s] ?? 0;
      if (d > maxDepth)
        maxDepth = d;
    }
    if (maxDepth <= 0 || maxDepth > 11)
      return null;
    maxNumBits = maxDepth;
    weights = new Array(maxSymbol + 1).fill(0);
    for (let s = 0; s <= maxSymbol; s++) {
      const d = depths[s] ?? 0;
      if (d > 0)
        weights[s] = maxDepth + 1 - d;
    }
    for (let i = 0; i < weights.length; i++)
      fullWeights[i] = weights[i] ?? 0;
    const pseudoDepth = depths[pseudoSymbol] ?? 0;
    if (pseudoDepth <= 0)
      return null;
    fullWeights[pseudoSymbol] = maxDepth + 1 - pseudoDepth;
  } else {
    const depths = buildHuffmanDepths(freq);
    if (!depths)
      return null;
    let maxDepth = 0;
    for (let s = 0; s < 256; s++) {
      const d = depths[s] ?? 0;
      if (d > maxDepth)
        maxDepth = d;
    }
    if (maxDepth <= 0 || maxDepth > 11)
      return null;
    maxNumBits = maxDepth;
    weights = new Array(255).fill(0);
    for (let s = 0; s < 256; s++) {
      const d = depths[s] ?? 0;
      if (d > 0)
        fullWeights[s] = maxDepth + 1 - d;
    }
    if ((fullWeights[255] ?? 0) <= 0)
      return null;
    for (let s = 0; s < 255; s++) {
      weights[s] = fullWeights[s] ?? 0;
    }
  }
  if (maxNumBits <= 0)
    return null;
  const numBits = weightsToNumBits(fullWeights, maxNumBits);
  const decodeTable = buildHuffmanDecodeTable(numBits, maxNumBits);
  const codeBySymbol = new Int32Array(256).fill(-1);
  const numBitsBySymbol = new Uint8Array(256);
  for (let i = 0; i < decodeTable.length; i++) {
    const bits = decodeTable.numBits[i];
    if (bits === 0)
      continue;
    const symbol = decodeTable.symbol[i] >>> 0;
    if (symbol >= codeBySymbol.length)
      return null;
    if ((codeBySymbol[symbol] ?? -1) < 0) {
      codeBySymbol[symbol] = i >>> maxNumBits - bits;
      numBitsBySymbol[symbol] = bits;
    }
  }
  for (let i = 0; i < literals.length; i++) {
    const sym = literals[i] ?? 0;
    if ((codeBySymbol[sym] ?? -1) < 0 || (numBitsBySymbol[sym] ?? 0) === 0)
      return null;
  }
  return { weights, table: { maxNumBits, codeBySymbol, numBitsBySymbol } };
}
function encodeLiteralsWithTable(table, literals, reverseBitWriter) {
  const scratch = ensureLiteralBitScratch(literals.length);
  const bitCounts = scratch.counts.subarray(0, literals.length);
  const bitValues = scratch.values.subarray(0, literals.length);
  for (let i = 0; i < literals.length; i++) {
    const sym = literals[i] ?? 0;
    const bits = table.numBitsBySymbol[sym] ?? 0;
    const code = table.codeBySymbol[sym] ?? -1;
    if (bits <= 0 || code < 0)
      return null;
    bitCounts[i] = bits;
    bitValues[i] = code;
  }
  return encodeReverseBitstream(bitCounts, bitValues, reverseBitWriter);
}
function splitLiteralsInto4(literals) {
  const total = literals.length;
  const s1Len = Math.floor((total + 3) / 4);
  const s2Len = Math.floor((total + 2) / 4);
  const s3Len = Math.floor((total + 1) / 4);
  const s4Len = total - s1Len - s2Len - s3Len;
  const s1 = literals.subarray(0, s1Len);
  const s2 = literals.subarray(s1Len, s1Len + s2Len);
  const s3 = literals.subarray(s1Len + s2Len, s1Len + s2Len + s3Len);
  const s4 = literals.subarray(s1Len + s2Len + s3Len, s1Len + s2Len + s3Len + s4Len);
  return [s1, s2, s3, s4];
}
function buildFSEUpdatePath(table, updateSymbols, requiredFinalSymbol) {
  const tableSize = table.length;
  if (tableSize <= 0)
    return null;
  if (updateSymbols.length === 0) {
    if (requiredFinalSymbol === null)
      return null;
    for (let state2 = 0; state2 < tableSize; state2++) {
      if ((table.symbol[state2] ?? -1) === requiredFinalSymbol) {
        return { states: [], updateBits: [], startState: state2 };
      }
    }
    return null;
  }
  const rowCount = updateSymbols.length;
  const reachable = new Uint8Array((rowCount + 1) * tableSize);
  const nextChoice = new Int32Array(rowCount * tableSize);
  nextChoice.fill(-1);
  const rowOffset = (rowIndex) => rowIndex * tableSize;
  const finalRowOffset = rowOffset(rowCount);
  for (let state2 = 0; state2 < tableSize; state2++) {
    if (requiredFinalSymbol === null || (table.symbol[state2] ?? -1) === requiredFinalSymbol) {
      reachable[finalRowOffset + state2] = 1;
    }
  }
  for (let row = rowCount - 1; row >= 0; row--) {
    const symbol = updateSymbols[row] ?? -1;
    if (symbol < 0 || symbol > WEIGHT_MAX_SYMBOL)
      return null;
    const curOffset = rowOffset(row);
    const nextOffset = rowOffset(row + 1);
    let anyReachable = false;
    for (let state2 = 0; state2 < tableSize; state2++) {
      if ((table.symbol[state2] ?? -1) !== symbol)
        continue;
      const baseline = table.baseline[state2] ?? 0;
      const bits = table.numBits[state2] ?? 0;
      const width = bits > 0 ? 1 << bits : 1;
      let minNext = baseline;
      let maxNext = baseline + width - 1;
      if (minNext < 0)
        minNext = 0;
      if (maxNext >= tableSize)
        maxNext = tableSize - 1;
      for (let next = minNext; next <= maxNext; next++) {
        if (reachable[nextOffset + next] === 0)
          continue;
        reachable[curOffset + state2] = 1;
        nextChoice[curOffset + state2] = next;
        anyReachable = true;
        break;
      }
    }
    if (!anyReachable)
      return null;
  }
  const startOffset = rowOffset(0);
  let startState = -1;
  for (let state2 = 0; state2 < tableSize; state2++) {
    if (reachable[startOffset + state2] !== 0) {
      startState = state2;
      break;
    }
  }
  if (startState < 0)
    return null;
  const states = new Array(rowCount);
  const updateBits = new Array(rowCount);
  let state = startState;
  for (let row = 0; row < rowCount; row++) {
    states[row] = state;
    const next = nextChoice[rowOffset(row) + state] ?? -1;
    if (next < 0)
      return null;
    updateBits[row] = next - (table.baseline[state] ?? 0);
    state = next;
  }
  return { states, updateBits, startState };
}
function buildCompressedLiteralsHeader(blockType, sizeFormat, regeneratedSize, compressedSize) {
  const bits = sizeFormat <= 1 ? 10 : sizeFormat === 2 ? 14 : 18;
  const writer = new BitWriter();
  writer.writeBits(2, blockType);
  writer.writeBits(2, sizeFormat);
  writer.writeBits(bits, regeneratedSize);
  writer.writeBits(bits, compressedSize);
  return writer.flush();
}
function makeCompressedSection(literals, table, blockType, treeBytes, reverseBitWriter) {
  const oneStream = encodeLiteralsWithTable(table, literals, reverseBitWriter);
  let bestPayload = null;
  let bestSizeFormat = null;
  if (oneStream) {
    const compressedSize = treeBytes.length + oneStream.length;
    if (literals.length <= 1023 && compressedSize <= 1023) {
      bestPayload = new Uint8Array(treeBytes.length + oneStream.length);
      bestPayload.set(treeBytes, 0);
      bestPayload.set(oneStream, treeBytes.length);
      bestSizeFormat = 0;
    }
  }
  if (literals.length >= 16) {
    const [s1, s2, s3, s4] = splitLiteralsInto4(literals);
    const e1 = encodeLiteralsWithTable(table, s1, reverseBitWriter);
    const e2 = encodeLiteralsWithTable(table, s2, reverseBitWriter);
    const e3 = encodeLiteralsWithTable(table, s3, reverseBitWriter);
    const e4 = encodeLiteralsWithTable(table, s4, reverseBitWriter);
    if (e1 && e2 && e3 && e4 && e1.length <= 65535 && e2.length <= 65535 && e3.length <= 65535) {
      const streamsSize = 6 + e1.length + e2.length + e3.length + e4.length;
      const compressedSize = treeBytes.length + streamsSize;
      let sizeFormat = null;
      if (literals.length <= 1023 && compressedSize <= 1023) {
        sizeFormat = 1;
      } else if (literals.length <= 16383 && compressedSize <= 16383) {
        sizeFormat = 2;
      } else if (literals.length <= 262143 && compressedSize <= 262143) {
        sizeFormat = 3;
      }
      if (sizeFormat !== null) {
        const payload = new Uint8Array(treeBytes.length + streamsSize);
        payload.set(treeBytes, 0);
        let pos = treeBytes.length;
        payload[pos++] = e1.length & 255;
        payload[pos++] = e1.length >>> 8 & 255;
        payload[pos++] = e2.length & 255;
        payload[pos++] = e2.length >>> 8 & 255;
        payload[pos++] = e3.length & 255;
        payload[pos++] = e3.length >>> 8 & 255;
        payload.set(e1, pos);
        pos += e1.length;
        payload.set(e2, pos);
        pos += e2.length;
        payload.set(e3, pos);
        pos += e3.length;
        payload.set(e4, pos);
        if (!bestPayload || payload.length < bestPayload.length) {
          bestPayload = payload;
          bestSizeFormat = sizeFormat;
        }
      }
    }
  }
  if (!bestPayload || bestSizeFormat === null)
    return null;
  const header = buildCompressedLiteralsHeader(blockType, bestSizeFormat, literals.length, bestPayload.length);
  const out = new Uint8Array(header.length + bestPayload.length);
  out.set(header, 0);
  out.set(bestPayload, header.length);
  return out;
}
function createDirectWeightsTreeBytes(weights) {
  if (weights.length < 1 || weights.length > 128)
    return null;
  const tree = new Uint8Array(1 + Math.ceil(weights.length / 2));
  tree[0] = 127 + weights.length;
  for (let i = 0; i < weights.length; i += 2) {
    const hi = weights[i] ?? 0;
    const lo = weights[i + 1] ?? 0;
    tree[1 + (i >>> 1)] = (hi & 15) << 4 | lo & 15;
  }
  return tree;
}
function createFSEWeightsTreeBytes(weights) {
  if (weights.length < 2 || weights.length > 255)
    return null;
  let maxWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    const value = weights[i] ?? 0;
    if (value < 0 || value > WEIGHT_MAX_SYMBOL)
      return null;
    if (value > maxWeight)
      maxWeight = value;
  }
  const histogram = new Array(maxWeight + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const value = weights[i] ?? 0;
    histogram[value] = (histogram[value] ?? 0) + 1;
  }
  const stream1 = [];
  const stream2 = [];
  for (let i = 0; i < weights.length; i++) {
    if ((i & 1) === 0)
      stream1.push(weights[i] ?? 0);
    else
      stream2.push(weights[i] ?? 0);
  }
  const tailOnStream1 = (weights.length & 1) === 1;
  const stream1Updates = tailOnStream1 ? stream1.slice(0, -1) : stream1.slice();
  const stream2Updates = tailOnStream1 ? stream2.slice() : stream2.slice(0, -1);
  const stream1Tail = tailOnStream1 ? stream1[stream1.length - 1] ?? null : null;
  const stream2Tail = tailOnStream1 ? null : stream2[stream2.length - 1] ?? null;
  const updateCount = weights.length - 1;
  const usedSymbols = [];
  for (let symbol = 0; symbol < histogram.length; symbol++) {
    if ((histogram[symbol] ?? 0) > 0)
      usedSymbols.push(symbol);
  }
  if (usedSymbols.length === 0)
    return null;
  for (let tableLog = WEIGHT_MAX_TABLE_LOG; tableLog >= 5; tableLog--) {
    const normalizedCandidates = [];
    normalizedCandidates.push(normalizeCountsForTable(histogram, tableLog));
    const tableSize = 1 << tableLog;
    if (usedSymbols.length <= tableSize) {
      const uniform = new Array(maxWeight + 1).fill(0);
      for (let i = 0; i < usedSymbols.length; i++) {
        const symbol = usedSymbols[i] ?? -1;
        if (symbol >= 0)
          uniform[symbol] = 1;
      }
      let remaining = tableSize - usedSymbols.length;
      let cursor = 0;
      while (remaining > 0) {
        const symbol = usedSymbols[cursor % usedSymbols.length] ?? -1;
        if (symbol >= 0)
          uniform[symbol] = (uniform[symbol] ?? 0) + 1;
        remaining--;
        cursor++;
      }
      normalizedCandidates.push({ normalizedCounter: uniform, maxSymbolValue: maxWeight });
    }
    for (const normalized of normalizedCandidates) {
      const header = writeNCount(normalized.normalizedCounter, normalized.maxSymbolValue, tableLog);
      const parsed = readNCount(header, 0, WEIGHT_MAX_SYMBOL, WEIGHT_MAX_TABLE_LOG);
      const table = buildFSEDecodeTable(parsed.normalizedCounter, parsed.tableLog);
      const path1 = buildFSEUpdatePath(table, stream1Updates, stream1Tail);
      if (!path1)
        continue;
      const path2 = buildFSEUpdatePath(table, stream2Updates, stream2Tail);
      if (!path2)
        continue;
      const readCounts = new Uint8Array(2 + updateCount);
      const readValues = new Uint32Array(2 + updateCount);
      let readPos = 0;
      readCounts[readPos] = parsed.tableLog;
      readValues[readPos++] = path1.startState;
      readCounts[readPos] = parsed.tableLog;
      readValues[readPos++] = path2.startState;
      let stream1Pos = 0;
      let stream2Pos = 0;
      for (let i = 0; i < updateCount; i++) {
        if ((i & 1) === 0) {
          const state = path1.states[stream1Pos] ?? -1;
          if (state < 0)
            return null;
          readCounts[readPos] = table.numBits[state] ?? 0;
          readValues[readPos++] = path1.updateBits[stream1Pos] ?? 0;
          stream1Pos++;
        } else {
          const state = path2.states[stream2Pos] ?? -1;
          if (state < 0)
            return null;
          readCounts[readPos] = table.numBits[state] ?? 0;
          readValues[readPos++] = path2.updateBits[stream2Pos] ?? 0;
          stream2Pos++;
        }
      }
      const bitstream = encodeReverseBitstream(readCounts, readValues, new ReverseBitWriter());
      const bodySize = header.length + bitstream.length;
      if (bodySize <= 0 || bodySize >= 128)
        continue;
      const tree = new Uint8Array(1 + bodySize);
      tree[0] = bodySize;
      tree.set(header, 1);
      tree.set(bitstream, 1 + header.length);
      const roundTrip = readWeightsFSE(tree, 1, bodySize).weights;
      if (roundTrip.length !== weights.length)
        continue;
      let mismatch = false;
      for (let i = 0; i < weights.length; i++) {
        if ((roundTrip[i] ?? -1) !== (weights[i] ?? -1)) {
          mismatch = true;
          break;
        }
      }
      if (mismatch)
        continue;
      return tree;
    }
  }
  return null;
}
function createWeightsTreeBytes(weights) {
  return createDirectWeightsTreeBytes(weights) ?? createFSEWeightsTreeBytes(weights);
}
function canEncodeTreeless(table, literals) {
  for (let i = 0; i < literals.length; i++) {
    const sym = literals[i] ?? 0;
    if ((table.codeBySymbol[sym] ?? -1) < 0 || (table.numBitsBySymbol[sym] ?? 0) === 0)
      return false;
  }
  return true;
}
function encodeLiteralsSection(literals, context, reverseBitWriter = new ReverseBitWriter()) {
  const raw = buildRawLiteralsSection(literals);
  if (!raw)
    return null;
  let bestSection = raw;
  let bestTable = context?.prevTable ?? null;
  const rle = buildRLELiteralsSection(literals);
  if (rle && rle.length < bestSection.length) {
    bestSection = rle;
  }
  const huffman = buildFrequencyHuffmanTable(literals);
  if (huffman) {
    const treeBytes = createWeightsTreeBytes(huffman.weights);
    if (treeBytes) {
      const compressed = makeCompressedSection(literals, huffman.table, 2, treeBytes, reverseBitWriter);
      if (compressed && compressed.length < bestSection.length) {
        bestSection = compressed;
        bestTable = huffman.table;
      }
    }
  }
  const prev = context?.prevTable ?? null;
  if (prev && canEncodeTreeless(prev, literals)) {
    const treeless = makeCompressedSection(literals, prev, 3, new Uint8Array(0), reverseBitWriter);
    if (treeless && treeless.length < bestSection.length) {
      bestSection = treeless;
      bestTable = prev;
    }
  }
  return { section: bestSection, table: bestTable };
}

// node_modules/zstdify/dist/encode/compressedBlock.js
var cachedLLTable = null;
var cachedOFTable = null;
var cachedMLTable = null;
function getPredefinedFSETables() {
  if (!cachedLLTable) {
    cachedLLTable = buildFSEDecodeTable(LITERALS_LENGTH_DEFAULT_DISTRIBUTION, LITERALS_LENGTH_TABLE_LOG);
    cachedOFTable = buildFSEDecodeTable(OFFSET_CODE_DEFAULT_DISTRIBUTION, OFFSET_CODE_TABLE_LOG);
    cachedMLTable = buildFSEDecodeTable(MATCH_LENGTH_DEFAULT_DISTRIBUTION, MATCH_LENGTH_TABLE_LOG);
  }
  return { ll: cachedLLTable, of: cachedOFTable, ml: cachedMLTable };
}
var LL_BASELINE = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16,
  18,
  20,
  22,
  24,
  28,
  32,
  40,
  48,
  64,
  128,
  256,
  512,
  1024,
  2048,
  4096,
  8192,
  16384,
  32768,
  65536
];
var LL_NUMBITS = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
];
var ML_BASELINE = [
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  37,
  39,
  41,
  43,
  47,
  51,
  59,
  67,
  83,
  99,
  131,
  259,
  515,
  1027,
  2051,
  4099,
  8195,
  16387,
  32771,
  65539
];
var ML_NUMBITS = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
];
function writeU24LE2(arr, offset, value) {
  arr[offset] = value & 255;
  arr[offset + 1] = value >> 8 & 255;
  arr[offset + 2] = value >> 16 & 255;
}
var pathTableCache = /* @__PURE__ */ new WeakMap();
var sequenceReadCountsScratch = null;
var sequenceReadValuesScratch = null;
function getPrecomputedPathTable(table) {
  const cached = pathTableCache.get(table);
  if (cached)
    return cached;
  const tableSize = table.length;
  const wordCount = Math.max(1, Math.ceil(tableSize / 32));
  const baselineByState = new Int32Array(tableSize);
  const minNextByState = new Int32Array(tableSize);
  const maxNextByState = new Int32Array(tableSize);
  let maxSymbol = -1;
  for (let s = 0; s < tableSize; s++) {
    const baseline = table.baseline[s];
    const bits = table.numBits[s];
    baselineByState[s] = baseline;
    const width = bits > 0 ? 1 << bits : 1;
    const minNext = baseline;
    const maxNext = baseline + width - 1;
    minNextByState[s] = minNext < 0 ? 0 : minNext;
    maxNextByState[s] = maxNext >= tableSize ? tableSize - 1 : maxNext;
    const symbol = table.symbol[s];
    if (symbol > maxSymbol)
      maxSymbol = symbol;
  }
  const statesBySymbol = Array.from({ length: maxSymbol + 1 }, () => []);
  const symbolMasks = Array.from({ length: maxSymbol + 1 }, () => new Uint32Array(wordCount));
  const bitTotalsBySymbol = new Float64Array(maxSymbol + 1);
  const stateCountsBySymbol = new Uint32Array(maxSymbol + 1);
  for (let s = 0; s < tableSize; s++) {
    const sym = table.symbol[s];
    const stateList = statesBySymbol[sym];
    const stateMask = symbolMasks[sym];
    if (!stateList || !stateMask)
      continue;
    stateList.push(s);
    stateMask[s >>> 5] = (stateMask[s >>> 5] | 1 << (s & 31)) >>> 0;
    bitTotalsBySymbol[sym] = (bitTotalsBySymbol[sym] ?? 0) + (table.numBits[s] ?? 0);
    stateCountsBySymbol[sym] = (stateCountsBySymbol[sym] ?? 0) + 1;
  }
  const avgBitsBySymbol = new Float64Array(maxSymbol + 1);
  for (let sym = 0; sym < avgBitsBySymbol.length; sym++) {
    const count = stateCountsBySymbol[sym] ?? 0;
    avgBitsBySymbol[sym] = count > 0 ? (bitTotalsBySymbol[sym] ?? 0) / count : Number.POSITIVE_INFINITY;
  }
  const precomputed = {
    tableSize,
    wordCount,
    statesBySymbol,
    symbolMasks,
    avgBitsBySymbol,
    baselineByState,
    minNextByState,
    maxNextByState
  };
  pathTableCache.set(table, precomputed);
  return precomputed;
}
function getSequenceReadCountsScratch(requiredLength) {
  if (!sequenceReadCountsScratch || sequenceReadCountsScratch.length < requiredLength) {
    sequenceReadCountsScratch = new Uint8Array(requiredLength);
  }
  return sequenceReadCountsScratch;
}
function getSequenceReadValuesScratch(requiredLength) {
  if (!sequenceReadValuesScratch || sequenceReadValuesScratch.length < requiredLength) {
    sequenceReadValuesScratch = new Uint32Array(requiredLength);
  }
  return sequenceReadValuesScratch;
}
function findLengthCode(value, baseline, extraBits, directMax, directBias) {
  if (value <= directMax) {
    const code = value - directBias;
    if (code < 0)
      return null;
    return { code, extra: 0, extraN: 0 };
  }
  for (let code = 0; code < baseline.length; code++) {
    const base = baseline[code] ?? 0;
    const n = extraBits[code] ?? 0;
    if (value >= base && value < base + (1 << n)) {
      return { code, extra: value - base, extraN: n };
    }
  }
  return null;
}
function encodeNumSequences(numSequences) {
  if (numSequences < 0 || numSequences > 65535 + 32512)
    return null;
  if (numSequences < 128) {
    return new Uint8Array([numSequences & 255]);
  }
  if (numSequences < 32512) {
    const hi = (numSequences >>> 8 & 127) + 128;
    const lo = numSequences & 255;
    return new Uint8Array([hi, lo]);
  }
  const value = numSequences - 32512;
  return new Uint8Array([255, value & 255, value >>> 8 & 255]);
}
function buildStatePath(codes, table) {
  if (codes.length === 0)
    return { states: [], updateBits: [] };
  const pre = getPrecomputedPathTable(table);
  const { tableSize, statesBySymbol, baselineByState } = pre;
  if (tableSize <= 0)
    return null;
  const rowCount = codes.length;
  const reachable = new Uint8Array(rowCount * tableSize);
  const nextChoice = new Int32Array(Math.max(0, rowCount - 1) * tableSize);
  nextChoice.fill(-1);
  const rowOffset = (rowIndex) => rowIndex * tableSize;
  const lastCode = codes[rowCount - 1] ?? -1;
  if (lastCode < 0 || lastCode >= statesBySymbol.length)
    return null;
  const lastStates = statesBySymbol[lastCode];
  if (!lastStates || lastStates.length === 0)
    return null;
  const lastRowOffset = rowOffset(rowCount - 1);
  for (let i = 0; i < lastStates.length; i++) {
    const state2 = lastStates[i];
    if (state2 !== void 0)
      reachable[lastRowOffset + state2] = 1;
  }
  for (let row = rowCount - 2; row >= 0; row--) {
    const code = codes[row] ?? -1;
    if (code < 0 || code >= statesBySymbol.length)
      return null;
    const candidateStates = statesBySymbol[code];
    if (!candidateStates || candidateStates.length === 0)
      return null;
    const curRowOffset = rowOffset(row);
    const nextRowOffset = rowOffset(row + 1);
    let anyReachable = false;
    for (let i = 0; i < candidateStates.length; i++) {
      const state2 = candidateStates[i];
      if (state2 === void 0)
        continue;
      const baseline = table.baseline[state2];
      const bits = table.numBits[state2];
      const width = bits > 0 ? 1 << bits : 1;
      let minNext = baseline;
      let maxNext = baseline + width - 1;
      if (minNext < 0)
        minNext = 0;
      if (maxNext >= tableSize)
        maxNext = tableSize - 1;
      for (let next = minNext; next <= maxNext; next++) {
        if (reachable[nextRowOffset + next] === 0)
          continue;
        reachable[curRowOffset + state2] = 1;
        nextChoice[curRowOffset + state2] = next;
        anyReachable = true;
        break;
      }
    }
    if (!anyReachable)
      return null;
  }
  const firstCode = codes[0] ?? -1;
  if (firstCode < 0 || firstCode >= statesBySymbol.length)
    return null;
  const firstStates = statesBySymbol[firstCode];
  if (!firstStates || firstStates.length === 0)
    return null;
  const firstRowOffset = rowOffset(0);
  let startState = -1;
  for (let i = 0; i < firstStates.length; i++) {
    const state2 = firstStates[i];
    if (state2 !== void 0 && reachable[firstRowOffset + state2] !== 0) {
      startState = state2;
      break;
    }
  }
  if (startState < 0)
    return null;
  const states = new Array(rowCount);
  const updateBits = new Array(Math.max(0, rowCount - 1));
  states[0] = startState;
  let state = startState;
  for (let row = 0; row < rowCount - 1; row++) {
    const choice = nextChoice[rowOffset(row) + state] ?? -1;
    if (choice < 0)
      return null;
    states[row + 1] = choice;
    updateBits[row] = choice - baselineByState[state];
    state = choice;
  }
  return { states, updateBits };
}
var symbolizedScratch = null;
function ensureSymbolizedScratch(minLength) {
  const existing = symbolizedScratch;
  if (existing && existing.llCodes.length >= minLength) {
    return existing;
  }
  let capacity = existing?.llCodes.length ?? 0;
  if (capacity === 0)
    capacity = 32;
  while (capacity < minLength)
    capacity *= 2;
  symbolizedScratch = {
    llCodes: new Uint8Array(capacity),
    llExtraN: new Uint8Array(capacity),
    llExtraValue: new Uint32Array(capacity),
    mlCodes: new Uint8Array(capacity),
    mlExtraN: new Uint8Array(capacity),
    mlExtraValue: new Uint32Array(capacity),
    ofCodes: new Uint8Array(capacity),
    ofExtraN: new Uint8Array(capacity),
    ofExtraValue: new Uint32Array(capacity)
  };
  return symbolizedScratch;
}
function symbolRange(codes) {
  let max = 0;
  for (let i = 0; i < codes.length; i++) {
    const value = codes[i] ?? 0;
    if (value > max)
      max = value;
  }
  return max + 1;
}
function buildHistogram(codes, alphabetSize) {
  const out = new Uint32Array(alphabetSize);
  for (let i = 0; i < codes.length; i++) {
    const c = codes[i] ?? 0;
    if (c < 0 || c >= alphabetSize)
      continue;
    out[c] = (out[c] ?? 0) + 1;
  }
  return out;
}
function scorePath(path2, table, tableLog) {
  if (path2.states.length === 0)
    return 0;
  let bits = tableLog;
  for (let i = 0; i < path2.states.length - 1; i++) {
    const state = path2.states[i] ?? -1;
    if (state < 0 || state >= table.length)
      return Number.POSITIVE_INFINITY;
    bits += table.numBits[state];
  }
  return bits;
}
function estimatePathBitsFromHistogram(histogram, table, tableLog, extraHeaderBits) {
  const pre = getPrecomputedPathTable(table);
  const avgBits = pre.avgBitsBySymbol;
  let bits = tableLog + extraHeaderBits;
  for (let sym = 0; sym < histogram.length; sym++) {
    const freq = histogram[sym] ?? 0;
    if (freq <= 0)
      continue;
    const avg = avgBits[sym] ?? Number.POSITIVE_INFINITY;
    if (!Number.isFinite(avg)) {
      return Number.POSITIVE_INFINITY;
    }
    bits += avg * freq;
  }
  return bits;
}
var normalizedTableCache = /* @__PURE__ */ new Map();
function hashHistogram(histogram) {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < histogram.length; i++) {
    hash ^= histogram[i] ?? 0;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}
function histogramsEqual(a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0))
      return false;
  }
  return true;
}
function getNormalizedTableCandidates(codes, maxTableLog, decodeMaxSymbolValue) {
  const alphabetSize = symbolRange(codes);
  if (alphabetSize <= 0)
    return [];
  const histogram = buildHistogram(codes, alphabetSize);
  let distinct = 0;
  for (let i = 0; i < histogram.length; i++) {
    if ((histogram[i] ?? 0) > 0)
      distinct++;
  }
  if (distinct <= 1)
    return [];
  let minTableLog = 5;
  while (1 << minTableLog < distinct && minTableLog < maxTableLog)
    minTableLog++;
  if (1 << minTableLog < distinct)
    return [];
  const maxLogFromSamples = codes.length > 1 ? 31 - Math.clz32(codes.length - 1) : 5;
  const limit = Math.max(minTableLog, Math.min(maxTableLog, maxLogFromSamples + 1));
  const results = [];
  const histogramHash = hashHistogram(histogram);
  for (let tableLog = minTableLog; tableLog <= limit; tableLog++) {
    const key = `${tableLog}:${alphabetSize}:${histogramHash}`;
    const cachedBucket = normalizedTableCache.get(key);
    if (cachedBucket) {
      let matched = false;
      for (const cached of cachedBucket) {
        if (histogramsEqual(cached.histogram, histogram)) {
          results.push(cached);
          matched = true;
          break;
        }
      }
      if (matched)
        continue;
    }
    const { normalizedCounter, maxSymbolValue: normalizedMaxSymbolValue } = normalizeCountsForTable(Array.from(histogram), tableLog);
    const header = writeNCount(normalizedCounter, normalizedMaxSymbolValue, tableLog);
    const parsed = readNCount(header, 0, decodeMaxSymbolValue, maxTableLog);
    const table = buildFSEDecodeTable(parsed.normalizedCounter, parsed.tableLog);
    const out = {
      histogram: histogram.slice(0),
      table,
      tableLog: parsed.tableLog,
      header
    };
    if (!cachedBucket) {
      normalizedTableCache.set(key, [out]);
    } else {
      cachedBucket.push(out);
    }
    results.push(out);
  }
  return results;
}
function getTableMaxSymbol(table) {
  let max = 0;
  for (let i = 0; i < table.length; i++) {
    const symbol = table.symbol[i] ?? 0;
    if (symbol > max)
      max = symbol;
  }
  return max;
}
function symbolizedSequences(sequences) {
  if (sequences.length === 0)
    return null;
  const numSequences = sequences.length;
  const scratch = ensureSymbolizedScratch(numSequences);
  const llCodes = scratch.llCodes.subarray(0, numSequences);
  const llExtraN = scratch.llExtraN.subarray(0, numSequences);
  const llExtraValue = scratch.llExtraValue.subarray(0, numSequences);
  const mlCodes = scratch.mlCodes.subarray(0, numSequences);
  const mlExtraN = scratch.mlExtraN.subarray(0, numSequences);
  const mlExtraValue = scratch.mlExtraValue.subarray(0, numSequences);
  const ofCodes = scratch.ofCodes.subarray(0, numSequences);
  const ofExtraN = scratch.ofExtraN.subarray(0, numSequences);
  const ofExtraValue = scratch.ofExtraValue.subarray(0, numSequences);
  for (let i = 0; i < numSequences; i++) {
    const sequence = sequences[i];
    const ll = findLengthCode(sequence.literalsLength, LL_BASELINE, LL_NUMBITS, 15, 0);
    const ml = findLengthCode(sequence.matchLength, ML_BASELINE, ML_NUMBITS, 34, 3);
    if (!ll || !ml)
      return null;
    const offsetValue = sequence.offset;
    if (offsetValue < 1)
      return null;
    const ofCode = 31 - Math.clz32(offsetValue);
    if (ofCode < 0 || ofCode > 28)
      return null;
    const ofEx = offsetValue - (1 << ofCode);
    llCodes[i] = ll.code;
    llExtraN[i] = ll.extraN;
    llExtraValue[i] = ll.extra;
    mlCodes[i] = ml.code;
    mlExtraN[i] = ml.extraN;
    mlExtraValue[i] = ml.extra;
    ofCodes[i] = ofCode;
    ofExtraN[i] = ofCode;
    ofExtraValue[i] = ofEx;
  }
  return { llCodes, llExtraN, llExtraValue, mlCodes, mlExtraN, mlExtraValue, ofCodes, ofExtraN, ofExtraValue };
}
function chooseStreamMode(codes, predefinedTable, predefinedTableLog, maxTableLog, prevTable, prevTableLog) {
  const alphabetSize = symbolRange(codes);
  const histogram = alphabetSize > 0 ? buildHistogram(codes, alphabetSize) : new Uint32Array(0);
  const predefinedPath = buildStatePath(codes, predefinedTable);
  if (!predefinedPath)
    return null;
  let best = {
    mode: 0,
    table: predefinedTable,
    tableLog: predefinedTableLog,
    path: predefinedPath,
    tableHeader: new Uint8Array(0)
  };
  let bestScore = scorePath(predefinedPath, predefinedTable, predefinedTableLog);
  if (prevTable && prevTableLog !== null) {
    const repeatEstimate = estimatePathBitsFromHistogram(histogram, prevTable, prevTableLog, 0);
    if (repeatEstimate < bestScore + 16) {
      const repeatPath = buildStatePath(codes, prevTable);
      if (repeatPath) {
        const repeatScore = scorePath(repeatPath, prevTable, prevTableLog);
        if (repeatScore < bestScore) {
          best = {
            mode: 3,
            table: prevTable,
            tableLog: prevTableLog,
            path: repeatPath,
            tableHeader: new Uint8Array(0)
          };
          bestScore = repeatScore;
        }
      }
    }
  }
  const compressedCandidates = getNormalizedTableCandidates(codes, maxTableLog, getTableMaxSymbol(predefinedTable));
  if (compressedCandidates.length > 0) {
    const ranked = compressedCandidates.map((compressed) => ({
      compressed,
      estimate: estimatePathBitsFromHistogram(histogram, compressed.table, compressed.tableLog, compressed.header.length * 8)
    })).sort((a, b) => a.estimate - b.estimate);
    const evalCount = Math.min(2, ranked.length);
    for (let i = 0; i < evalCount; i++) {
      const candidate = ranked[i];
      if (!candidate || candidate.estimate >= bestScore + 16)
        continue;
      const compressedPath = buildStatePath(codes, candidate.compressed.table);
      if (compressedPath) {
        const compressedScore = scorePath(compressedPath, candidate.compressed.table, candidate.compressed.tableLog) + candidate.compressed.header.length * 8;
        if (compressedScore < bestScore) {
          best = {
            mode: 2,
            table: candidate.compressed.table,
            tableLog: candidate.compressed.tableLog,
            path: compressedPath,
            tableHeader: candidate.compressed.header
          };
          bestScore = compressedScore;
        }
      }
    }
  }
  return best;
}
function buildSequenceSection(sequences, context, reverseBitWriter = new ReverseBitWriter()) {
  const encoded = symbolizedSequences(sequences);
  if (!encoded)
    return null;
  const numSequences = sequences.length;
  const numSequencesBytes = encodeNumSequences(numSequences);
  if (!numSequencesBytes)
    return null;
  const { ll: llTable, of: ofTable, ml: mlTable } = getPredefinedFSETables();
  const llChoice = chooseStreamMode(encoded.llCodes, llTable, LITERALS_LENGTH_TABLE_LOG, 9, context?.prevTables?.llTable ?? null, context?.prevTables?.llTableLog ?? null);
  const ofChoice = chooseStreamMode(encoded.ofCodes, ofTable, OFFSET_CODE_TABLE_LOG, 8, context?.prevTables?.ofTable ?? null, context?.prevTables?.ofTableLog ?? null);
  const mlChoice = chooseStreamMode(encoded.mlCodes, mlTable, MATCH_LENGTH_TABLE_LOG, 9, context?.prevTables?.mlTable ?? null, context?.prevTables?.mlTableLog ?? null);
  if (!llChoice || !ofChoice || !mlChoice)
    return null;
  const chunkCount = numSequences * 6;
  const readCounts = getSequenceReadCountsScratch(chunkCount).subarray(0, chunkCount);
  const readValues = getSequenceReadValuesScratch(chunkCount).subarray(0, chunkCount);
  const llStates = llChoice.path.states;
  const llUpdates = llChoice.path.updateBits;
  const ofStates = ofChoice.path.states;
  const ofUpdates = ofChoice.path.updateBits;
  const mlStates = mlChoice.path.states;
  const mlUpdates = mlChoice.path.updateBits;
  const ofExtraN = encoded.ofExtraN;
  const ofExtraValue = encoded.ofExtraValue;
  const mlExtraN = encoded.mlExtraN;
  const mlExtraValue = encoded.mlExtraValue;
  const llExtraN = encoded.llExtraN;
  const llExtraValue = encoded.llExtraValue;
  let readPos = 0;
  readCounts[readPos] = llChoice.tableLog;
  readValues[readPos++] = llStates[0];
  readCounts[readPos] = ofChoice.tableLog;
  readValues[readPos++] = ofStates[0];
  readCounts[readPos] = mlChoice.tableLog;
  readValues[readPos++] = mlStates[0];
  for (let i = 0; i < numSequences; i++) {
    readCounts[readPos] = ofExtraN[i];
    readValues[readPos++] = ofExtraValue[i];
    readCounts[readPos] = mlExtraN[i];
    readValues[readPos++] = mlExtraValue[i];
    readCounts[readPos] = llExtraN[i];
    readValues[readPos++] = llExtraValue[i];
    if (i !== numSequences - 1) {
      const llState = llStates[i];
      const mlState = mlStates[i];
      const ofState = ofStates[i];
      if (llState < 0 || llState >= llChoice.table.length || mlState < 0 || mlState >= mlChoice.table.length || ofState < 0 || ofState >= ofChoice.table.length) {
        return null;
      }
      readCounts[readPos] = llChoice.table.numBits[llState];
      readValues[readPos++] = llUpdates[i];
      readCounts[readPos] = mlChoice.table.numBits[mlState];
      readValues[readPos++] = mlUpdates[i];
      readCounts[readPos] = ofChoice.table.numBits[ofState];
      readValues[readPos++] = ofUpdates[i];
    }
  }
  const bitstream = encodeReverseBitstream(readCounts, readValues, reverseBitWriter);
  const tableHeaderSize = llChoice.tableHeader.length + ofChoice.tableHeader.length + mlChoice.tableHeader.length;
  const out = new Uint8Array(numSequencesBytes.length + 1 + tableHeaderSize + bitstream.length);
  out.set(numSequencesBytes, 0);
  const modeByte = llChoice.mode << 6 | ofChoice.mode << 4 | mlChoice.mode << 2;
  out[numSequencesBytes.length] = modeByte & 255;
  let pos = numSequencesBytes.length + 1;
  out.set(llChoice.tableHeader, pos);
  pos += llChoice.tableHeader.length;
  out.set(ofChoice.tableHeader, pos);
  pos += ofChoice.tableHeader.length;
  out.set(mlChoice.tableHeader, pos);
  pos += mlChoice.tableHeader.length;
  out.set(bitstream, pos);
  return {
    section: out,
    tables: {
      llTable: llChoice.table,
      llTableLog: llChoice.tableLog,
      ofTable: ofChoice.table,
      ofTableLog: ofChoice.tableLog,
      mlTable: mlChoice.table,
      mlTableLog: mlChoice.tableLog
    }
  };
}
function buildCompressedBlockPayload(literals, sequences, context) {
  const reverseBitWriter = new ReverseBitWriter();
  const literalsContext = {
    prevTable: context?.prevLiteralsTable ?? null
  };
  const encodedLiterals = encodeLiteralsSection(literals, literalsContext, reverseBitWriter);
  if (!encodedLiterals)
    return null;
  const literalsSection = encodedLiterals.section;
  const seqSection = buildSequenceSection(sequences, context, reverseBitWriter);
  if (!seqSection)
    return null;
  const out = new Uint8Array(literalsSection.length + seqSection.section.length);
  out.set(literalsSection, 0);
  out.set(seqSection.section, literalsSection.length);
  if (context) {
    context.prevTables = seqSection.tables;
    context.prevLiteralsTable = encodedLiterals.table;
  }
  return out;
}
function writeCompressedBlock(payload, last) {
  const header = new Uint8Array(3);
  const blockHeader2 = (last ? 1 : 0) | 2 << 1 | payload.length << 3;
  writeU24LE2(header, 0, blockHeader2);
  const out = new Uint8Array(3 + payload.length);
  out.set(header, 0);
  out.set(payload, 3);
  return out;
}

// node_modules/zstdify/dist/encode/frameWriter.js
var ZSTD_MAGIC = 4247762216;
function writeDictionaryId(chunks, dictionaryId) {
  if (dictionaryId <= 255) {
    chunks.push(dictionaryId & 255);
    return;
  }
  if (dictionaryId <= 65535) {
    chunks.push(dictionaryId & 255, dictionaryId >>> 8 & 255);
    return;
  }
  chunks.push(dictionaryId & 255, dictionaryId >>> 8 & 255, dictionaryId >>> 16 & 255, dictionaryId >>> 24 & 255);
}
function writeFrameHeader(contentSize, hasChecksum, dictionaryId = null) {
  if (!Number.isInteger(contentSize) || contentSize < 0 || contentSize > 4294967295) {
    throw new ZstdError("contentSize must be a 32-bit non-negative integer", "parameter_unsupported");
  }
  const chunks = [];
  chunks.push(ZSTD_MAGIC & 255, ZSTD_MAGIC >> 8 & 255, ZSTD_MAGIC >> 16 & 255, ZSTD_MAGIC >> 24 & 255);
  let fhd = 0;
  if (contentSize <= 255) {
    fhd |= 0 << 6;
    fhd |= 1 << 5;
  } else if (contentSize <= 256 + 65535 - 1) {
    fhd |= 1 << 6;
    fhd |= 1 << 5;
  } else {
    fhd |= 2 << 6;
    fhd |= 1 << 5;
  }
  if (dictionaryId !== null) {
    if (!Number.isInteger(dictionaryId) || dictionaryId <= 0 || dictionaryId > 4294967295) {
      throw new ZstdError("Invalid dictionaryId in frame header", "parameter_unsupported");
    }
    if (dictionaryId <= 255)
      fhd |= 1;
    else if (dictionaryId <= 65535)
      fhd |= 2;
    else
      fhd |= 3;
  }
  fhd |= (hasChecksum ? 1 : 0) << 2;
  chunks.push(fhd);
  if (dictionaryId !== null) {
    writeDictionaryId(chunks, dictionaryId >>> 0);
  }
  if (contentSize <= 255) {
    chunks.push(contentSize & 255);
  } else if (contentSize <= 256 + 65535 - 1) {
    chunks.push(contentSize - 256 & 255, contentSize - 256 >> 8 & 255);
  } else {
    chunks.push(contentSize & 255, contentSize >> 8 & 255, contentSize >> 16 & 255, contentSize >> 24 & 255);
  }
  return new Uint8Array(chunks);
}

// node_modules/zstdify/dist/encode/sequencePlanner.js
var WINDOW_SIZE = 128 * 1024;
var MIN_MATCH = 3;
var HASH_BITS = 16;
var HASH_SIZE = 1 << HASH_BITS;
function createSequencePlannerState() {
  const historyHeads = new Int32Array(HASH_SIZE);
  historyHeads.fill(-1);
  return {
    historyBytes: new Uint8Array(0),
    historyChainPrev: new Int32Array(0),
    historyHeads
  };
}
function hash3(data, pos) {
  const a = data[pos];
  const b = data[pos + 1];
  const c = data[pos + 2];
  return a * 2654435761 + b * 2246822519 + c * 3266489917 >>> 0 >>> 32 - HASH_BITS;
}
function bytesEqual(a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0))
      return false;
  }
  return true;
}
function buildChainPrev(data, historyLength, plannerState) {
  const heads = new Int32Array(HASH_SIZE);
  heads.fill(-1);
  const chainPrev = new Int32Array(data.length);
  chainPrev.fill(-1);
  let startPos = 0;
  if (plannerState && historyLength > 0 && plannerState.historyBytes.length === historyLength && plannerState.historyChainPrev.length === historyLength && bytesEqual(data.subarray(0, historyLength), plannerState.historyBytes)) {
    chainPrev.set(plannerState.historyChainPrev, 0);
    heads.set(plannerState.historyHeads);
    startPos = historyLength;
  }
  for (let pos = startPos; pos + MIN_MATCH <= data.length; pos++) {
    const h = hash3(data, pos);
    const prev = heads[h];
    chainPrev[pos] = prev;
    heads[h] = pos;
  }
  return chainPrev;
}
function updatePlannerState(plannerState, combined, chainPrev) {
  if (!plannerState)
    return;
  const historyStart = Math.max(0, combined.length - WINDOW_SIZE);
  const historyLength = combined.length - historyStart;
  const historyBytes = new Uint8Array(historyLength);
  historyBytes.set(combined.subarray(historyStart), 0);
  const historyChainPrev = new Int32Array(historyLength);
  for (let pos = 0; pos < historyLength; pos++) {
    const globalPos = historyStart + pos;
    const prev = chainPrev[globalPos] ?? -1;
    historyChainPrev[pos] = prev >= historyStart ? prev - historyStart : -1;
  }
  const historyHeads = new Int32Array(HASH_SIZE);
  historyHeads.fill(-1);
  for (let pos = 0; pos + MIN_MATCH <= historyLength; pos++) {
    const h = hash3(historyBytes, pos);
    historyHeads[h] = pos;
  }
  plannerState.historyBytes = historyBytes;
  plannerState.historyChainPrev = historyChainPrev;
  plannerState.historyHeads = historyHeads;
}
function longestMatch(data, pos, candidate, maxLength) {
  let len = 0;
  while (len + 8 <= maxLength) {
    if (data[pos + len] !== data[candidate + len] || data[pos + len + 1] !== data[candidate + len + 1] || data[pos + len + 2] !== data[candidate + len + 2] || data[pos + len + 3] !== data[candidate + len + 3] || data[pos + len + 4] !== data[candidate + len + 4] || data[pos + len + 5] !== data[candidate + len + 5] || data[pos + len + 6] !== data[candidate + len + 6] || data[pos + len + 7] !== data[candidate + len + 7]) {
      break;
    }
    len += 8;
  }
  while (len < maxLength && data[pos + len] === data[candidate + len]) {
    len++;
  }
  return len;
}
function scoreMatch(length, offset, repOffsets, repScoreBonus) {
  let score = length * 16;
  if (offset === repOffsets[0])
    score += repScoreBonus[0];
  else if (offset === repOffsets[1])
    score += repScoreBonus[1];
  else if (offset === repOffsets[2])
    score += repScoreBonus[2];
  return score;
}
function findBestMatchAt(parse, pos, repOffsets) {
  const data = parse.input;
  if (pos + MIN_MATCH > data.length)
    return null;
  let candidate = parse.chainPrev[pos] ?? -1;
  if (candidate < 0)
    return null;
  const minCandidate = Math.max(0, pos - WINDOW_SIZE);
  const maxLength = data.length - pos;
  let depth = 0;
  let best = null;
  while (candidate >= minCandidate && depth < parse.options.chainLimit) {
    const offset = pos - candidate;
    if (offset > 0 && data[pos] === data[candidate] && data[pos + 1] === data[candidate + 1] && data[pos + 2] === data[candidate + 2]) {
      const length = longestMatch(data, pos, candidate, maxLength);
      if (length >= MIN_MATCH) {
        const score = scoreMatch(length, offset, repOffsets, parse.options.repScoreBonus);
        if (!best || score > best.score || score === best.score && length > best.length) {
          best = { pos, offset, length, score };
          if (length >= maxLength)
            break;
        }
      }
    }
    candidate = parse.chainPrev[candidate] ?? -1;
    depth++;
  }
  return best;
}
function applyRepOffsetUpdate(repOffsets, offsetValue, literalsLength) {
  const next = [repOffsets[0], repOffsets[1], repOffsets[2]];
  const ll0 = literalsLength === 0;
  const isNonRepeat = offsetValue > 3 || offsetValue === 3 && ll0;
  if (isNonRepeat) {
    const actualOffset = offsetValue === 3 ? next[0] - 1 : offsetValue - 3;
    next[2] = next[1];
    next[1] = next[0];
    next[0] = actualOffset;
    return next;
  }
  let repeatIndex;
  if (ll0)
    repeatIndex = offsetValue === 1 ? 1 : 2;
  else
    repeatIndex = offsetValue - 1;
  if (repeatIndex === 1) {
    next[1] = next[0];
    next[0] = repOffsets[1];
  } else if (repeatIndex === 2) {
    next[2] = next[1];
    next[1] = next[0];
    next[0] = repOffsets[2];
  }
  return next;
}
function toOffsetValue(offset, literalsLength, repOffsets) {
  const offsetValue = offset + 3;
  return {
    offsetValue,
    nextRepOffsets: applyRepOffsetUpdate(repOffsets, offsetValue, literalsLength)
  };
}
function copyLiterals(dst, dstOffset, data, srcStart, srcEnd) {
  if (srcEnd <= srcStart)
    return dstOffset;
  dst.set(data.subarray(srcStart, srcEnd), dstOffset);
  return dstOffset + (srcEnd - srcStart);
}
function pickMatch(parse, pos) {
  const direct = findBestMatchAt(parse, pos, parse.repOffsets);
  if (parse.options.searchWindow <= 1)
    return direct;
  let best = direct;
  let bestScore = best?.score ?? 0;
  const end = Math.min(parse.input.length - MIN_MATCH, pos + parse.options.searchWindow - 1);
  const maxRepBonus = Math.max(...parse.options.repScoreBonus);
  for (let probePos = pos + 1; probePos <= end; probePos++) {
    const delayed = probePos - pos;
    const maxProbeLength = parse.input.length - probePos;
    const theoreticalBestDelayedScore = maxProbeLength * 16 + maxRepBonus - delayed * 8;
    if (theoreticalBestDelayedScore <= bestScore) {
      break;
    }
    const probeCandidate = parse.chainPrev[probePos] ?? -1;
    if (probeCandidate < 0 || probeCandidate < Math.max(0, probePos - WINDOW_SIZE))
      continue;
    const probe = findBestMatchAt(parse, probePos, parse.repOffsets);
    if (!probe)
      continue;
    const delayedScore = probe.score - delayed * 8;
    if (!best || delayedScore > bestScore) {
      best = { ...probe, score: delayedScore };
      bestScore = delayedScore;
    }
  }
  return best;
}
function planSequences(input, options) {
  if (input.length < MIN_MATCH) {
    return {
      literals: input.slice(),
      sequences: [],
      trailingLiterals: input.length,
      finalRepOffsets: options.repOffsets ?? [1, 4, 8]
    };
  }
  const history = options.history && options.history.length > 0 ? options.history.subarray(Math.max(0, options.history.length - WINDOW_SIZE)) : new Uint8Array(0);
  const historyLength = history.length;
  const combined = new Uint8Array(historyLength + input.length);
  if (historyLength > 0)
    combined.set(history, 0);
  combined.set(input, historyLength);
  const parse = {
    input: combined,
    chainPrev: buildChainPrev(combined, historyLength, options.plannerState),
    repOffsets: options.repOffsets ? [options.repOffsets[0], options.repOffsets[1], options.repOffsets[2]] : [1, 4, 8],
    options: {
      chainLimit: Math.max(1, options.chainLimit),
      repScoreBonus: options.repScoreBonus ?? [48, 24, 12],
      lazyDepth: Math.max(0, options.lazyDepth ?? 0),
      searchWindow: Math.max(1, options.searchWindow ?? 1)
    }
  };
  const sequences = [];
  const literals = new Uint8Array(input.length);
  let literalOut = 0;
  let anchor = historyLength;
  let pos = historyLength;
  while (pos + MIN_MATCH <= combined.length) {
    let best = pickMatch(parse, pos);
    if (best && parse.options.lazyDepth > 0 && best.pos === pos) {
      const maxDelta = Math.min(parse.options.lazyDepth, combined.length - pos - MIN_MATCH);
      for (let delta = 1; delta <= maxDelta; delta++) {
        const candidate = findBestMatchAt(parse, pos + delta, parse.repOffsets);
        if (!candidate)
          continue;
        if (candidate.score > best.score + delta * 8)
          best = { ...candidate };
      }
    }
    if (!best || best.length < MIN_MATCH) {
      pos++;
      continue;
    }
    const matchPos = best.pos;
    const literalsLength = matchPos - anchor;
    literalOut = copyLiterals(literals, literalOut, combined, anchor, matchPos);
    const { offsetValue, nextRepOffsets } = toOffsetValue(best.offset, literalsLength, parse.repOffsets);
    sequences.push({
      literalsLength,
      offset: offsetValue,
      matchLength: best.length
    });
    parse.repOffsets = nextRepOffsets;
    anchor = matchPos + best.length;
    pos = anchor;
  }
  const trailingLiterals = combined.length - anchor;
  literalOut = copyLiterals(literals, literalOut, combined, anchor, combined.length);
  updatePlannerState(options.plannerState, combined, parse.chainPrev);
  return {
    literals: literalOut < literals.length ? literals.subarray(0, literalOut) : literals,
    sequences,
    trailingLiterals,
    finalRepOffsets: [parse.repOffsets[0], parse.repOffsets[1], parse.repOffsets[2]]
  };
}

// node_modules/zstdify/dist/encode/fastMatcher.js
function buildFastMatcherSequences(input, options) {
  return planSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState,
    chainLimit: 8,
    repScoreBonus: [48, 24, 12],
    lazyDepth: 0,
    searchWindow: 1
  });
}

// node_modules/zstdify/dist/encode/lazyMatcher.js
function buildLazyMatcherSequences(input, options) {
  return planSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState,
    chainLimit: 20,
    repScoreBonus: [64, 32, 16],
    lazyDepth: 2,
    searchWindow: 4
  });
}

// node_modules/zstdify/dist/encode/optimalParser.js
function buildOptimalParserSequences(input, options) {
  return planSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState,
    chainLimit: 40,
    repScoreBonus: [80, 40, 20],
    lazyDepth: 0,
    searchWindow: 16
  });
}

// node_modules/zstdify/dist/encode/greedySequences.js
function buildGreedySequences(input, options) {
  const strategy = options?.strategy ?? "fast";
  if (strategy === "lazy") {
    return buildLazyMatcherSequences(input, {
      history: options?.history,
      repOffsets: options?.repOffsets,
      plannerState: options?.plannerState
    });
  }
  if (strategy === "optimal") {
    return buildOptimalParserSequences(input, {
      history: options?.history,
      repOffsets: options?.repOffsets,
      plannerState: options?.plannerState
    });
  }
  return buildFastMatcherSequences(input, {
    history: options?.history,
    repOffsets: options?.repOffsets,
    plannerState: options?.plannerState
  });
}

// node_modules/zstdify/dist/frame/checksum.js
var PRIME64_1 = 0x9e3779b185ebca87n;
var PRIME64_2 = 0xc2b2ae3d27d4eb4fn;
var PRIME64_3 = 0x165667b19e3779f9n;
var PRIME64_4 = 0x85ebca77c2b2ae63n;
var PRIME64_5 = 0x27d4eb2f165667c5n;
var MASK64 = 0xffffffffffffffffn;
function rotl64(x, r) {
  r = r & 63;
  return (x << BigInt(r) | x >> BigInt(64 - r)) & MASK64;
}
function round64(acc, input) {
  acc = acc + input * PRIME64_2 & MASK64;
  acc = rotl64(acc, 31);
  return acc * PRIME64_1 & MASK64;
}
function mergeRound64(acc, val) {
  val = round64(0n, val);
  acc ^= val;
  acc = acc * PRIME64_1 + PRIME64_4 & MASK64;
  return acc;
}
function xxh64(data, seed = 0n) {
  let acc;
  const len = data.length;
  let offset = 0;
  if (len >= 32) {
    let v1 = seed + PRIME64_1 + PRIME64_2 & MASK64;
    let v2 = seed + PRIME64_2 & MASK64;
    let v3 = seed & MASK64;
    let v4 = seed - PRIME64_1 & MASK64;
    const limit = len - 32;
    while (offset <= limit) {
      v1 = round64(v1, readU64LE(data, offset));
      v2 = round64(v2, readU64LE(data, offset + 8));
      v3 = round64(v3, readU64LE(data, offset + 16));
      v4 = round64(v4, readU64LE(data, offset + 24));
      offset += 32;
    }
    acc = rotl64(v1, 1) + rotl64(v2, 7) + rotl64(v3, 12) + rotl64(v4, 18) & MASK64;
    acc = mergeRound64(acc, v1);
    acc = mergeRound64(acc, v2);
    acc = mergeRound64(acc, v3);
    acc = mergeRound64(acc, v4);
  } else {
    acc = seed + PRIME64_5 & MASK64;
  }
  acc = acc + BigInt(len) & MASK64;
  while (offset + 8 <= len) {
    acc ^= round64(0n, readU64LE(data, offset));
    acc = rotl64(acc, 27) * PRIME64_1 + PRIME64_4;
    acc &= MASK64;
    offset += 8;
  }
  if (offset + 4 <= len) {
    acc ^= BigInt(readU32LE(data, offset)) * PRIME64_1 & 0xffffffffffffffffn;
    acc = rotl64(acc, 23) * PRIME64_2 + PRIME64_3 & MASK64;
    offset += 4;
  }
  while (offset < len) {
    acc ^= BigInt(data[offset] ?? 0) * PRIME64_5 & MASK64;
    acc = rotl64(acc, 11) * PRIME64_1 & MASK64;
    offset++;
  }
  acc ^= acc >> 33n;
  acc = acc * PRIME64_2 & MASK64;
  acc ^= acc >> 29n;
  acc = acc * PRIME64_3 & MASK64;
  acc ^= acc >> 32n;
  return acc & MASK64;
}
function validateContentChecksum(data, storedChecksum) {
  return computeContentChecksum32(data) === storedChecksum >>> 0;
}
function computeContentChecksum32(data) {
  const hash = xxh64(data, 0n);
  return Number(hash & 0xffffffffn) >>> 0;
}

// node_modules/zstdify/dist/compress.js
var BLOCK_MAX = 128 * 1024;
var WINDOW_SIZE2 = 128 * 1024;
function selectCompressionStrategy(level) {
  if (level <= 1)
    return null;
  if (level <= 3)
    return "fast";
  if (level <= 6)
    return "lazy";
  return "optimal";
}
function appendHistory(history, chunk) {
  if (chunk.length === 0)
    return history;
  if (chunk.length >= WINDOW_SIZE2) {
    const out2 = new Uint8Array(WINDOW_SIZE2);
    out2.set(chunk.subarray(chunk.length - WINDOW_SIZE2), 0);
    return out2;
  }
  const total = history.length + chunk.length;
  if (total <= WINDOW_SIZE2) {
    const out2 = new Uint8Array(total);
    out2.set(history, 0);
    out2.set(chunk, history.length);
    return out2;
  }
  const keepFromHistory = WINDOW_SIZE2 - chunk.length;
  const out = new Uint8Array(WINDOW_SIZE2);
  out.set(history.subarray(history.length - keepFromHistory), 0);
  out.set(chunk, keepFromHistory);
  return out;
}
function compress(input, options) {
  const requestedLevel = options?.level ?? 0;
  const level = Math.max(0, Math.min(9, Math.trunc(requestedLevel)));
  const strategy = selectCompressionStrategy(level);
  const hasChecksum = options?.checksum ?? false;
  const dictionary = options?.dictionary;
  const dictionaryBytes = dictionary instanceof Uint8Array ? dictionary : dictionary?.bytes;
  const providedDictionaryId = dictionary instanceof Uint8Array ? null : dictionary?.id ?? null;
  const dictionaryContext = dictionaryBytes && dictionaryBytes.length > 0 ? resolveDictionaryContextForCompression(dictionaryBytes, providedDictionaryId) : null;
  const dictionaryId = options?.noDictId ? null : dictionaryContext?.dictionaryId ?? providedDictionaryId;
  if (dictionaryId !== null && (!Number.isInteger(dictionaryId) || dictionaryId <= 0 || dictionaryId > 4294967295)) {
    throw new ZstdError("dictionary.id must be a 32-bit positive integer", "parameter_unsupported");
  }
  const chunks = [];
  chunks.push(writeFrameHeader(input.length, hasChecksum, dictionaryId));
  let offset = 0;
  const blockCount = input.length === 0 ? 1 : Math.ceil(input.length / BLOCK_MAX);
  let blockIndex = 0;
  let history = dictionaryContext && dictionaryContext.historyPrefix.length > 0 ? dictionaryContext.historyPrefix.subarray(Math.max(0, dictionaryContext.historyPrefix.length - WINDOW_SIZE2)) : new Uint8Array(0);
  let repOffsets = [1, 4, 8];
  const sequenceEntropyContext = { prevTables: null };
  const sequencePlannerState = createSequencePlannerState();
  while (offset < input.length || blockIndex < blockCount) {
    const size = Math.min(BLOCK_MAX, input.length - offset);
    const last = blockIndex === blockCount - 1;
    const block = input.subarray(offset, offset + size);
    if (level > 0 && size > 0) {
      if (strategy) {
        const plan = buildGreedySequences(block, { strategy, history, repOffsets, plannerState: sequencePlannerState });
        if (plan.sequences.length > 0) {
          const payload = buildCompressedBlockPayload(plan.literals, plan.sequences, sequenceEntropyContext);
          if (payload) {
            const compressed = writeCompressedBlock(payload, last);
            if (compressed.length < 3 + size) {
              chunks.push(compressed);
              repOffsets = plan.finalRepOffsets;
              history = appendHistory(history, block);
              offset += size;
              blockIndex++;
              continue;
            }
          }
        }
      }
      const first = input[offset] ?? 0;
      let isRLE = true;
      for (let i = offset + 1; i < offset + size; i++) {
        if ((input[i] ?? 0) !== first) {
          isRLE = false;
          break;
        }
      }
      if (isRLE) {
        chunks.push(writeRLEBlock(first, size, last));
      } else {
        chunks.push(writeRawBlock(input, offset, size, last));
      }
    } else {
      chunks.push(writeRawBlock(input, offset, size, last));
    }
    history = appendHistory(history, block);
    offset += size;
    blockIndex++;
  }
  if (hasChecksum) {
    const checksum = computeContentChecksum32(input);
    chunks.push(new Uint8Array([checksum & 255, checksum >>> 8 & 255, checksum >>> 16 & 255, checksum >>> 24 & 255]));
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
}

// node_modules/zstdify/dist/decode/block.js
var BLOCK_HEADER_SIZE = 3;
var MAX_BLOCK_SIZE = 128 * 1024;
function readU24LE(data, offset) {
  if (offset + 3 > data.length) {
    throw new RangeError(`readU24LE: offset ${offset} + 3 exceeds length ${data.length}`);
  }
  const a = data[offset] ?? 0;
  const b = data[offset + 1] ?? 0;
  const c = data[offset + 2] ?? 0;
  return a | b << 8 | c << 16;
}
function parseBlockHeader(data, offset) {
  if (offset + BLOCK_HEADER_SIZE > data.length) {
    throw new ZstdError("Block header truncated", "corruption_detected");
  }
  const w = readU24LE(data, offset);
  const lastBlock = (w & 1) === 1;
  const blockType = w >> 1 & 3;
  const blockSize = w >> 3;
  if (blockType === 3) {
    throw new ZstdError("Reserved block type", "corruption_detected");
  }
  if (blockSize > MAX_BLOCK_SIZE) {
    throw new ZstdError("Block size exceeds maximum", "corruption_detected");
  }
  return { lastBlock, blockType, blockSize };
}

// node_modules/zstdify/dist/bitstream/bitReaderReverse.js
var BIT_MASKS = new Uint32Array(33);
for (let i = 0; i <= 32; i++) {
  BIT_MASKS[i] = i === 32 ? 4294967295 : (1 << i) - 1 >>> 0;
}
function readU32LEBounded(data, idx) {
  return ((data[idx] ?? 0) | (data[idx + 1] ?? 0) << 8 | (data[idx + 2] ?? 0) << 16 | (data[idx + 3] ?? 0) << 24) >>> 0;
}
function readU32LEFast(data, idx) {
  return (data[idx] | data[idx + 1] << 8 | data[idx + 2] << 16 | data[idx + 3] << 24) >>> 0;
}
var BitReaderReverse = class {
  data;
  dataLength;
  startBit;
  endBit;
  bitOffset;
  constructor(data, startByteOffset, lengthBytes, skipBitsAtStart = 0) {
    if (lengthBytes < 0) {
      throw new RangeError(`BitReaderReverse: negative length ${lengthBytes}`);
    }
    this.data = data;
    this.dataLength = data.length;
    this.startBit = startByteOffset * 8 + skipBitsAtStart;
    this.endBit = (startByteOffset + lengthBytes) * 8;
    this.bitOffset = this.endBit;
  }
  /** Read n bits (1-32), LSB first from current position (reading backward) */
  readBits(n) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitReaderReverse.readBits: n must be 1-32, got ${n}`);
    }
    const requestedStart = this.bitOffset - n;
    const clampedStart = requestedStart < this.startBit ? this.startBit : requestedStart;
    this.bitOffset = clampedStart;
    if (requestedStart >= this.startBit) {
      const byteIndex = requestedStart >>> 3;
      const bitInByte = requestedStart & 7;
      if (bitInByte + n <= 8) {
        return (this.data[byteIndex] >>> bitInByte & BIT_MASKS[n]) >>> 0;
      }
      const hasEightBytes = byteIndex + 7 < this.dataLength;
      const word0 = hasEightBytes ? readU32LEFast(this.data, byteIndex) : readU32LEBounded(this.data, byteIndex);
      if (bitInByte + n <= 32) {
        const value2 = word0 >>> bitInByte;
        return n === 32 ? value2 >>> 0 : (value2 & BIT_MASKS[n]) >>> 0;
      }
      const low = word0 >>> bitInByte;
      const highBits = n - (32 - bitInByte);
      const word1 = hasEightBytes ? readU32LEFast(this.data, byteIndex + 4) : readU32LEBounded(this.data, byteIndex + 4);
      const high = (word1 & BIT_MASKS[highBits]) << 32 - bitInByte >>> 0;
      const merged = (low | high) >>> 0;
      return n === 32 ? merged : (merged & BIT_MASKS[n]) >>> 0;
    }
    let value = 0;
    for (let i = 0; i < n; i++) {
      const absoluteBit = requestedStart + i;
      if (absoluteBit < this.startBit) {
        continue;
      }
      const byteIndex = absoluteBit >>> 3;
      const bitInByte = absoluteBit & 7;
      const bit = (this.data[byteIndex] ?? 0) >>> bitInByte & 1;
      value |= bit << i;
    }
    return value;
  }
  /**
   * Read n bits and throw if request crosses the logical stream start.
   *
   * Use strict reads for inputs that must fail fast on truncation/corruption.
   * Keep readBits()/readBitsFast() for decode paths that intentionally rely on
   * zstd-compatible zero-fill behavior near the stream start.
   */
  readBitsStrict(n) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitReaderReverse.readBitsStrict: n must be 1-32, got ${n}`);
    }
    if (n > this.bitsRemaining) {
      throw new RangeError("BitReaderReverse: buffer underflow");
    }
    return this.readBits(n);
  }
  /**
   * Fast path used by validated hot loops.
   * Falls back to readBits() when the request crosses the logical stream start.
   */
  readBitsFast(n) {
    if (n < 1 || n > 24) {
      return this.readBits(n);
    }
    const requestedStart = this.bitOffset - n;
    if (requestedStart < this.startBit) {
      return this.readBits(n);
    }
    this.bitOffset = requestedStart;
    const byteIndex = requestedStart >>> 3;
    const bitInByte = requestedStart & 7;
    const word = byteIndex + 3 < this.dataLength ? readU32LEFast(this.data, byteIndex) : readU32LEBounded(this.data, byteIndex);
    return (word >>> bitInByte & BIT_MASKS[n]) >>> 0;
  }
  /** Fast-path strict variant that forbids crossing stream start. */
  readBitsFastStrict(n) {
    if (n < 1 || n > 24) {
      return this.readBitsStrict(n);
    }
    if (n > this.bitsRemaining) {
      throw new RangeError("BitReaderReverse: buffer underflow");
    }
    return this.readBitsFast(n);
  }
  /**
   * Hot-loop helper: read n bits quickly, returning 0 when n is 0.
   */
  readBitsFastOrZero(n) {
    if (n === 0) {
      return 0;
    }
    return this.readBitsFast(n);
  }
  /** Skip trailing zero padding and end-mark bit from the stream tail. */
  skipPadding() {
    if (this.endBit <= this.startBit) {
      throw new RangeError("BitReaderReverse: empty stream");
    }
    const lastByteIndex = (this.endBit >>> 3) - 1;
    const lastByte = this.data[lastByteIndex] ?? 0;
    if (lastByte === 0) {
      throw new RangeError("BitReaderReverse: invalid end marker");
    }
    const highestSetBit = 31 - Math.clz32(lastByte);
    const paddingBits = 8 - highestSetBit;
    this.bitOffset = this.endBit - paddingBits;
    if (this.bitOffset < this.startBit) {
      throw new RangeError("BitReaderReverse: invalid padding");
    }
  }
  get position() {
    if (this.bitOffset <= this.startBit) {
      return this.startBit >>> 3;
    }
    return this.bitOffset - 1 >>> 3;
  }
  get bitsRemaining() {
    return this.bitOffset - this.startBit;
  }
  /** Skip the first n bits at the logical start (the end of the buffer when reading backward). */
  skipBitsAtEnd(n) {
    if (n <= 0)
      return;
    this.bitOffset -= n;
    if (this.bitOffset < this.startBit) {
      throw new RangeError("BitReaderReverse: buffer underflow");
    }
  }
  /** Undo a previous readBits() by pushing the cursor forward. */
  unreadBits(n) {
    if (n <= 0)
      return;
    this.bitOffset += n;
    if (this.bitOffset > this.endBit) {
      throw new RangeError("BitReaderReverse: unread overflow");
    }
  }
};

// node_modules/zstdify/dist/decode/reconstruct.js
function createHistoryWindow(windowSize, initial) {
  const initialLength = initial?.length ?? 0;
  const capacity = Math.max(windowSize, initialLength);
  if (capacity <= 0) {
    return { buffer: new Uint8Array(0), length: 0, writePos: 0 };
  }
  const buffer = new Uint8Array(capacity);
  const history = { buffer, length: 0, writePos: 0 };
  if (initialLength > 0 && initial) {
    appendToHistoryWindow(history, initial);
  }
  return history;
}
function getOrCreateHistoryWindow(windowSize, initial, reuse) {
  const existing = reuse?._history;
  if (existing && existing.buffer.length >= windowSize) {
    existing.length = 0;
    existing.writePos = 0;
    if (initial && initial.length > 0) {
      appendToHistoryWindow(existing, initial);
    }
    return existing;
  }
  const history = createHistoryWindow(windowSize, initial);
  if (reuse) {
    reuse._history = history;
  }
  return history;
}
function appendToHistoryWindow(history, chunk) {
  const cap = history.buffer.length;
  if (cap === 0 || chunk.length === 0) {
    return;
  }
  if (chunk.length >= cap) {
    const tail = chunk.subarray(chunk.length - cap);
    history.buffer.set(tail, 0);
    history.length = cap;
    history.writePos = 0;
    return;
  }
  const firstLen = Math.min(chunk.length, cap - history.writePos);
  history.buffer.set(chunk.subarray(0, firstLen), history.writePos);
  const remaining = chunk.length - firstLen;
  if (remaining > 0) {
    history.buffer.set(chunk.subarray(firstLen), 0);
  }
  history.writePos = (history.writePos + chunk.length) % cap;
  history.length = Math.min(cap, history.length + chunk.length);
}
var APPEND_RANGE_LOOP_THRESHOLD = 16;
function appendRangeToHistoryWindow(history, source, start, length) {
  const cap = history.buffer.length;
  if (cap === 0 || length <= 0) {
    return;
  }
  if (start < 0 || length < 0 || start + length > source.length) {
    throw new RangeError("Invalid source range for history append");
  }
  if (length >= cap) {
    const tailStart = start + length - cap;
    history.buffer.set(source.subarray(tailStart, start + length), 0);
    history.length = cap;
    history.writePos = 0;
    return;
  }
  const firstLen = Math.min(length, cap - history.writePos);
  const remaining = length - firstLen;
  if (length <= APPEND_RANGE_LOOP_THRESHOLD) {
    let wp = history.writePos;
    for (let i = 0; i < length; i++) {
      history.buffer[wp] = source[start + i];
      wp = wp + 1 === cap ? 0 : wp + 1;
    }
  } else {
    history.buffer.set(source.subarray(start, start + firstLen), history.writePos);
    if (remaining > 0) {
      history.buffer.set(source.subarray(start + firstLen, start + firstLen + remaining), 0);
    }
  }
  history.writePos = (history.writePos + length) % cap;
  history.length = Math.min(cap, history.length + length);
}
function appendRLEToHistoryWindow(history, byte, length) {
  const cap = history.buffer.length;
  if (cap === 0 || length <= 0) {
    return;
  }
  const fillByte = byte & 255;
  if (length >= cap) {
    history.buffer.fill(fillByte, 0, cap);
    history.length = cap;
    history.writePos = 0;
    return;
  }
  const firstLen = Math.min(length, cap - history.writePos);
  history.buffer.fill(fillByte, history.writePos, history.writePos + firstLen);
  const remaining = length - firstLen;
  if (remaining > 0) {
    history.buffer.fill(fillByte, 0, remaining);
  }
  history.writePos = (history.writePos + length) % cap;
  history.length = Math.min(cap, history.length + length);
}

// node_modules/zstdify/dist/decode/fusedSequences.js
var LL_BASELINE2 = new Int32Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16,
  18,
  20,
  22,
  24,
  28,
  32,
  40,
  48,
  64,
  128,
  256,
  512,
  1024,
  2048,
  4096,
  8192,
  16384,
  32768,
  65536
]);
var LL_NUMBITS2 = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
]);
var ML_BASELINE2 = new Int32Array([
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  37,
  39,
  41,
  43,
  47,
  51,
  59,
  67,
  83,
  99,
  131,
  259,
  515,
  1027,
  2051,
  4099,
  8195,
  16387,
  32771,
  65539
]);
var ML_NUMBITS2 = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16
]);
var DEFAULT_LL_TABLE = buildFSEDecodeTable(LITERALS_LENGTH_DEFAULT_DISTRIBUTION, LITERALS_LENGTH_TABLE_LOG);
var DEFAULT_OF_TABLE = buildFSEDecodeTable(OFFSET_CODE_DEFAULT_DISTRIBUTION, OFFSET_CODE_TABLE_LOG);
var DEFAULT_ML_TABLE = buildFSEDecodeTable(MATCH_LENGTH_DEFAULT_DISTRIBUTION, MATCH_LENGTH_TABLE_LOG);
var RLE_TABLE_CACHE_5 = new Array(256);
var RLE_TABLE_CACHE_6 = new Array(256);
var FAST_LITERAL_COPY_LOOP_THRESHOLD = 8;
var FAST_SMALL_OFFSET_LOOP_THRESHOLD = 16;
var FAST_HISTORY_COPY_LOOP_THRESHOLD = 16;
function buildRLETable(symbol, tableLog) {
  const cache = tableLog === 5 ? RLE_TABLE_CACHE_5 : tableLog === 6 ? RLE_TABLE_CACHE_6 : null;
  if (cache) {
    const cached = cache[symbol];
    if (cached) {
      return cached;
    }
  }
  const tableSize = 1 << tableLog;
  const symbolByState = new Uint16Array(tableSize);
  const bitsByState = new Uint8Array(tableSize);
  const baselineByState = new Int32Array(tableSize);
  for (let i = 0; i < tableSize; i++) {
    symbolByState[i] = symbol;
    bitsByState[i] = tableLog;
  }
  const table = {
    symbol: symbolByState,
    numBits: bitsByState,
    baseline: baselineByState,
    tableLog,
    length: tableSize
  };
  if (cache) {
    cache[symbol] = table;
  }
  return table;
}
function decodeAndExecuteSequencesInto(blockContent, seqOffset, seqSize, prevSeqTables, literals, windowSize, output, outputStart, repOffsets, history, updateHistory, collectMetadata = true) {
  if (seqSize < 2) {
    throw new ZstdError("Sequences section too short", "corruption_detected");
  }
  const sectionStart = seqOffset;
  let pos = sectionStart;
  let numSequences = blockContent[pos];
  pos++;
  if (numSequences >= 128) {
    if (numSequences === 255) {
      if (pos + 2 > sectionStart + seqSize) {
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      }
      numSequences = blockContent[pos] + (blockContent[pos + 1] << 8) + 32512;
      pos += 2;
    } else {
      if (pos >= sectionStart + seqSize) {
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      }
      numSequences = (numSequences - 128 << 8) + blockContent[pos];
      pos++;
    }
  }
  let llMode = 0;
  let ofMode = 0;
  let mlMode = 0;
  let llTable = DEFAULT_LL_TABLE;
  let llTableLog = LITERALS_LENGTH_TABLE_LOG;
  let ofTable = DEFAULT_OF_TABLE;
  let ofTableLog = OFFSET_CODE_TABLE_LOG;
  let mlTable = DEFAULT_ML_TABLE;
  let mlTableLog = MATCH_LENGTH_TABLE_LOG;
  if (numSequences > 0) {
    if (pos >= sectionStart + seqSize) {
      throw new ZstdError("Sequences section truncated", "corruption_detected");
    }
    const modesByte = blockContent[pos];
    pos++;
    llMode = modesByte >> 6 & 3;
    ofMode = modesByte >> 4 & 3;
    mlMode = modesByte >> 2 & 3;
    if ((modesByte & 3) !== 0) {
      throw new ZstdError("Reserved bits set in sequences modes", "corruption_detected");
    }
    if (llMode === 1) {
      if (pos >= sectionStart + seqSize)
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      llTable = buildRLETable(blockContent[pos], 6);
      llTableLog = 6;
      pos++;
    } else if (llMode === 2) {
      const result = readNCount(blockContent, pos, 35, 9);
      pos += result.bytesRead;
      llTable = buildFSEDecodeTable(result.normalizedCounter, result.tableLog);
      llTableLog = result.tableLog;
    } else if (llMode === 3) {
      if (!prevSeqTables)
        throw new ZstdError("Repeat_Mode without previous table", "corruption_detected");
      llTable = prevSeqTables.llTable;
      llTableLog = prevSeqTables.llTableLog;
    }
    if (ofMode === 1) {
      if (pos >= sectionStart + seqSize)
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      ofTable = buildRLETable(blockContent[pos], 5);
      ofTableLog = 5;
      pos++;
    } else if (ofMode === 2) {
      const result = readNCount(blockContent, pos, 31, 8);
      pos += result.bytesRead;
      ofTable = buildFSEDecodeTable(result.normalizedCounter, result.tableLog);
      ofTableLog = result.tableLog;
    } else if (ofMode === 3) {
      if (!prevSeqTables)
        throw new ZstdError("Repeat_Mode without previous table", "corruption_detected");
      ofTable = prevSeqTables.ofTable;
      ofTableLog = prevSeqTables.ofTableLog;
    }
    if (mlMode === 1) {
      if (pos >= sectionStart + seqSize)
        throw new ZstdError("Sequences section truncated", "corruption_detected");
      mlTable = buildRLETable(blockContent[pos], 6);
      mlTableLog = 6;
      pos++;
    } else if (mlMode === 2) {
      const result = readNCount(blockContent, pos, 52, 9);
      pos += result.bytesRead;
      mlTable = buildFSEDecodeTable(result.normalizedCounter, result.tableLog);
      mlTableLog = result.tableLog;
    } else if (mlMode === 3) {
      if (!prevSeqTables)
        throw new ZstdError("Repeat_Mode without previous table", "corruption_detected");
      mlTable = prevSeqTables.mlTable;
      mlTableLog = prevSeqTables.mlTableLog;
    }
  }
  let outPos = outputStart;
  let litPos = 0;
  let totalMatchLength = 0;
  let repeatOffsetCandidateCount = 0;
  let rep0 = repOffsets[0];
  let rep1 = repOffsets[1];
  let rep2 = repOffsets[2];
  const historyLength = history.length;
  const historyCap = history.buffer.length;
  const historyOldestPos = historyCap > 0 ? (history.writePos - historyLength + historyCap) % historyCap : 0;
  const historyBuffer = history.buffer;
  if (numSequences > 0) {
    const bitstreamSize = sectionStart + seqSize - pos;
    if (bitstreamSize < 1) {
      throw new ZstdError("Sequences bitstream empty", "corruption_detected");
    }
    const reader = new BitReaderReverse(blockContent, pos, bitstreamSize);
    reader.skipPadding();
    let stateLL = llTableLog > 0 ? reader.readBits(llTableLog) : 0;
    let stateOF = ofTableLog > 0 ? reader.readBits(ofTableLog) : 0;
    let stateML = mlTableLog > 0 ? reader.readBits(mlTableLog) : 0;
    const llTableLength = llTable.length;
    const ofTableLength = ofTable.length;
    const mlTableLength = mlTable.length;
    if (stateOF >>> 0 >= ofTableLength || stateML >>> 0 >= mlTableLength || stateLL >>> 0 >= llTableLength) {
      throw new ZstdError("FSE invalid state", "corruption_detected");
    }
    const llSymbolByState = llTable.symbol;
    const ofSymbolByState = ofTable.symbol;
    const mlSymbolByState = mlTable.symbol;
    const llNumBitsByState = llTable.numBits;
    const ofNumBitsByState = ofTable.numBits;
    const mlNumBitsByState = mlTable.numBits;
    const llBaselineByState = llTable.baseline;
    const ofBaselineByState = ofTable.baseline;
    const mlBaselineByState = mlTable.baseline;
    const lastSequenceIndex = numSequences - 1;
    for (let i = 0; i <= lastSequenceIndex; i++) {
      const offsetCode = ofSymbolByState[stateOF];
      const mlCode = mlSymbolByState[stateML];
      const llCode = llSymbolByState[stateLL];
      const offsetValue = (1 << offsetCode) + reader.readBitsFastOrZero(offsetCode);
      if (mlCode >= ML_BASELINE2.length)
        throw new ZstdError("Invalid match length code", "corruption_detected");
      if (llCode >= LL_BASELINE2.length)
        throw new ZstdError("Invalid literals length code", "corruption_detected");
      const mlNumBits = ML_NUMBITS2[mlCode];
      const mlBase = ML_BASELINE2[mlCode];
      const matchLength = mlBase + reader.readBitsFastOrZero(mlNumBits);
      const llNumBits = LL_NUMBITS2[llCode];
      const llBase = LL_BASELINE2[llCode];
      const literalsLength = llCode <= 15 ? llCode : llBase + reader.readBitsFastOrZero(llNumBits);
      if (collectMetadata) {
        if (offsetValue <= 2 || offsetValue === 3 && literalsLength > 0) {
          repeatOffsetCandidateCount++;
        }
        totalMatchLength += matchLength;
      }
      if (literalsLength > 0) {
        const litEnd = litPos + literalsLength;
        if (litEnd > literals.length) {
          throw new ZstdError("Literals overrun while executing sequence", "corruption_detected");
        }
        if (literalsLength <= FAST_LITERAL_COPY_LOOP_THRESHOLD) {
          for (let j = 0; j < literalsLength; j++) {
            output[outPos + j] = literals[litPos + j];
          }
        } else {
          output.set(literals.subarray(litPos, litEnd), outPos);
        }
        outPos += literalsLength;
        litPos = litEnd;
      }
      const ll0 = literalsLength === 0;
      let offset;
      let repeatIndex = null;
      const isNonRepeat = offsetValue > 3 || offsetValue === 3 && ll0;
      if (isNonRepeat) {
        if (offsetValue === 3) {
          offset = rep0 - 1;
          if (offset === 0) {
            throw new ZstdError("Invalid match offset: repeat1-1 is 0", "corruption_detected");
          }
        } else {
          offset = offsetValue - 3;
        }
      } else {
        if (ll0) {
          repeatIndex = offsetValue === 1 ? 1 : 2;
        } else {
          repeatIndex = offsetValue - 1;
        }
        offset = repeatIndex === 0 ? rep0 : repeatIndex === 1 ? rep1 : rep2;
      }
      const produced = outPos - outputStart;
      const producedPlusHistory = produced + historyLength;
      const maxReachBack = producedPlusHistory < windowSize ? producedPlusHistory : windowSize;
      if (offset <= 0 || offset > maxReachBack) {
        throw new ZstdError(`Invalid match offset: offset=${offset} maxReachBack=${maxReachBack} produced=${produced} history=${historyLength} window=${windowSize}`, "corruption_detected");
      }
      const historyBytesNeeded = offset > produced ? offset - produced : 0;
      if (matchLength > 0) {
        if (historyBytesNeeded === 0) {
          const copyStart = outPos - offset;
          if (offset >= matchLength) {
            output.copyWithin(outPos, copyStart, copyStart + matchLength);
            outPos += matchLength;
          } else if (offset <= FAST_SMALL_OFFSET_LOOP_THRESHOLD) {
            for (let j = 0; j < matchLength; j++) {
              output[outPos + j] = output[outPos - offset + j];
            }
            outPos += matchLength;
          } else {
            let copied = offset;
            output.copyWithin(outPos, copyStart, copyStart + copied);
            outPos += copied;
            while (copied < matchLength) {
              const toCopy = Math.min(copied, matchLength - copied);
              output.copyWithin(outPos, outPos - copied, outPos - copied + toCopy);
              outPos += toCopy;
              copied += toCopy;
            }
          }
        } else {
          if (historyCap === 0) {
            throw new ZstdError("Invalid history read", "corruption_detected");
          }
          const historyCopyLen = Math.min(historyBytesNeeded, matchLength);
          const historyStart = historyLength - historyBytesNeeded;
          if (historyStart < 0 || historyStart + historyCopyLen > historyLength) {
            throw new ZstdError("Invalid history read", "corruption_detected");
          }
          let physicalStart = historyOldestPos + historyStart;
          if (physicalStart >= historyCap) {
            physicalStart -= historyCap;
          }
          const firstHistoryChunk = Math.min(historyCopyLen, historyCap - physicalStart);
          const remainingHistoryChunk = historyCopyLen - firstHistoryChunk;
          if (historyCopyLen <= FAST_HISTORY_COPY_LOOP_THRESHOLD) {
            let phys = physicalStart;
            for (let j = 0; j < historyCopyLen; j++) {
              output[outPos + j] = historyBuffer[phys];
              phys = phys + 1 === historyCap ? 0 : phys + 1;
            }
            outPos += historyCopyLen;
          } else {
            output.set(historyBuffer.subarray(physicalStart, physicalStart + firstHistoryChunk), outPos);
            outPos += firstHistoryChunk;
            if (remainingHistoryChunk > 0) {
              output.set(historyBuffer.subarray(0, remainingHistoryChunk), outPos);
              outPos += remainingHistoryChunk;
            }
          }
          const matchRemaining = matchLength - historyCopyLen;
          if (matchRemaining > 0) {
            const copyStart = outPos - offset;
            if (offset >= matchRemaining) {
              output.copyWithin(outPos, copyStart, copyStart + matchRemaining);
              outPos += matchRemaining;
            } else if (offset <= FAST_SMALL_OFFSET_LOOP_THRESHOLD) {
              for (let j = 0; j < matchRemaining; j++) {
                output[outPos + j] = output[outPos - offset + j];
              }
              outPos += matchRemaining;
            } else {
              let copied = offset;
              output.copyWithin(outPos, copyStart, copyStart + copied);
              outPos += copied;
              while (copied < matchRemaining) {
                const toCopy = Math.min(copied, matchRemaining - copied);
                output.copyWithin(outPos, outPos - copied, outPos - copied + toCopy);
                outPos += toCopy;
                copied += toCopy;
              }
            }
          }
        }
      }
      if (isNonRepeat) {
        rep2 = rep1;
        rep1 = rep0;
        rep0 = offset;
      } else if (repeatIndex === 1) {
        rep1 = rep0;
        rep0 = offset;
      } else if (repeatIndex === 2) {
        rep2 = rep1;
        rep1 = rep0;
        rep0 = offset;
      }
      if (i < lastSequenceIndex) {
        const llBits = llNumBitsByState[stateLL];
        const mlBits = mlNumBitsByState[stateML];
        const ofBits = ofNumBitsByState[stateOF];
        stateLL = llBaselineByState[stateLL] + reader.readBitsFastOrZero(llBits);
        stateML = mlBaselineByState[stateML] + reader.readBitsFastOrZero(mlBits);
        stateOF = ofBaselineByState[stateOF] + reader.readBitsFastOrZero(ofBits);
        if (stateOF >>> 0 >= ofTableLength || stateML >>> 0 >= mlTableLength || stateLL >>> 0 >= llTableLength) {
          throw new ZstdError("FSE invalid state", "corruption_detected");
        }
      }
    }
  }
  if (litPos < literals.length) {
    const remaining = literals.length - litPos;
    if (remaining <= FAST_LITERAL_COPY_LOOP_THRESHOLD) {
      for (let i = 0; i < remaining; i++) {
        output[outPos + i] = literals[litPos + i];
      }
    } else {
      output.set(literals.subarray(litPos), outPos);
    }
    outPos += remaining;
  }
  if (updateHistory && outPos > outputStart) {
    appendRangeToHistoryWindow(history, output, outputStart, outPos - outputStart);
  }
  repOffsets[0] = rep0;
  repOffsets[1] = rep1;
  repOffsets[2] = rep2;
  return {
    written: outPos - outputStart,
    tables: { llTable, llTableLog, ofTable, ofTableLog, mlTable, mlTableLog },
    metadata: {
      numSequences,
      llMode,
      ofMode,
      mlMode,
      llTableLog,
      ofTableLog,
      mlTableLog,
      totalMatchLength,
      repeatOffsetCandidateCount
    }
  };
}

// node_modules/zstdify/dist/bitstream/bitReader.js
var BitReader = class {
  data;
  byteOffset;
  bitOffset;
  // 0-7, bits consumed in current byte
  constructor(data, byteOffset = 0) {
    this.data = data;
    this.byteOffset = byteOffset;
    this.bitOffset = 0;
  }
  /** Current byte position (after last fully consumed byte) */
  get position() {
    return this.byteOffset;
  }
  /** Total bits consumed */
  get bitsConsumed() {
    return this.byteOffset * 8 + this.bitOffset;
  }
  /** True if no more bits available */
  get atEnd() {
    return this.byteOffset >= this.data.length;
  }
  /** Ensure at least n bits are available. Throws if not. */
  ensure(n) {
    const bitsAvailable = (this.data.length - this.byteOffset) * 8 - this.bitOffset;
    if (bitsAvailable < n) {
      throw new RangeError(`BitReader: requested ${n} bits, only ${bitsAvailable} available`);
    }
  }
  /** Read n bits (1-32), LSB first */
  readBits(n) {
    if (n < 1 || n > 32) {
      throw new RangeError(`BitReader.readBits: n must be 1-32, got ${n}`);
    }
    this.ensure(n);
    let value = 0;
    let bitsLeft = n;
    while (bitsLeft > 0) {
      const byte = this.data[this.byteOffset] ?? 0;
      const bitsInByte = 8 - this.bitOffset;
      const take = Math.min(bitsLeft, bitsInByte);
      const mask = (1 << take) - 1;
      const shift = this.bitOffset;
      value |= (byte >> shift & mask) << n - bitsLeft;
      this.bitOffset += take;
      bitsLeft -= take;
      if (this.bitOffset >= 8) {
        this.byteOffset++;
        this.bitOffset = 0;
      }
    }
    return value;
  }
  /** Align to next byte boundary (skip remaining bits in current byte) */
  align() {
    if (this.bitOffset !== 0) {
      this.bitOffset = 0;
      this.byteOffset++;
    }
  }
  /** Read a full byte (convenience, must be aligned or will read across boundary) */
  readByte() {
    if (this.bitOffset === 0) {
      if (this.byteOffset >= this.data.length) {
        throw new RangeError("BitReader: no more bytes");
      }
      const v = this.data[this.byteOffset++];
      if (v === void 0)
        throw new RangeError("BitReader: no more bytes");
      return v;
    }
    return this.readBits(8);
  }
  /** Slice remaining bytes from current position (after aligning) */
  readRemainingBytes() {
    this.align();
    if (this.byteOffset >= this.data.length) {
      return new Uint8Array(0);
    }
    return this.data.subarray(this.byteOffset);
  }
};

// node_modules/zstdify/dist/decode/literals.js
function parseLiteralsSectionHeader(data, offset) {
  if (offset >= data.length) {
    throw new ZstdError("Literals section header truncated", "corruption_detected");
  }
  const b0 = data[offset];
  const blockType = b0 & 3;
  const sizeFormat = b0 >> 2 & 3;
  if (blockType === 0 || blockType === 1) {
    if (sizeFormat === 0 || sizeFormat === 2) {
      const regeneratedSize = b0 >> 3;
      return {
        header: { blockType, regeneratedSize, headerSize: 1, numStreams: 1 },
        dataOffset: offset + 1
      };
    }
    if (sizeFormat === 1) {
      if (offset + 2 > data.length) {
        throw new ZstdError("Literals section header truncated", "corruption_detected");
      }
      const b1 = data[offset + 1];
      const regeneratedSize = (b0 >> 4) + (b1 << 4);
      return {
        header: { blockType, regeneratedSize, headerSize: 2, numStreams: 1 },
        dataOffset: offset + 2
      };
    }
    if (sizeFormat === 3) {
      if (offset + 3 > data.length) {
        throw new ZstdError("Literals section header truncated", "corruption_detected");
      }
      const b1 = data[offset + 1];
      const b2 = data[offset + 2];
      const regeneratedSize = (b0 >> 4) + (b1 << 4) + (b2 << 12);
      return {
        header: { blockType, regeneratedSize, headerSize: 3, numStreams: 1 },
        dataOffset: offset + 3
      };
    }
  }
  if (blockType === 2 || blockType === 3) {
    const reader = new BitReader(data, offset);
    const parsedBlockType = reader.readBits(2);
    const parsedSizeFormat = reader.readBits(2);
    if (parsedBlockType !== blockType || parsedSizeFormat !== sizeFormat) {
      throw new ZstdError("Invalid literals section header", "corruption_detected");
    }
    const numStreams = sizeFormat === 0 ? 1 : 4;
    const sizeBits = sizeFormat <= 1 ? 10 : sizeFormat === 2 ? 14 : 18;
    const regeneratedSize = reader.readBits(sizeBits);
    const compressedSize = reader.readBits(sizeBits);
    reader.align();
    const headerSize = reader.position - offset;
    if (offset + headerSize > data.length) {
      throw new ZstdError("Literals section header truncated", "corruption_detected");
    }
    return {
      header: { blockType, regeneratedSize, compressedSize, headerSize, numStreams },
      dataOffset: offset + headerSize
    };
  }
  throw new ZstdError("Invalid literals section header", "corruption_detected");
}
function decodeRawLiterals(data, offset, size) {
  if (offset + size > data.length) {
    throw new ZstdError("Raw literals truncated", "corruption_detected");
  }
  return data.subarray(offset, offset + size);
}
function decodeRLELiterals(data, offset, size) {
  if (offset >= data.length) {
    throw new ZstdError("RLE literals truncated", "corruption_detected");
  }
  const byte = data[offset];
  const result = new Uint8Array(size);
  result.fill(byte);
  return result;
}
function weightsToHuffmanTable(weights) {
  let partialSum = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] ?? 0;
    if (w > 0)
      partialSum += 1 << w - 1;
  }
  if (partialSum === 0) {
    throw new ZstdError("Invalid Huffman weights", "corruption_detected");
  }
  const maxNumBits = 32 - Math.clz32(partialSum);
  const total = 1 << maxNumBits;
  const remainder = total - partialSum;
  if (remainder <= 0 || (remainder & remainder - 1) !== 0) {
    throw new ZstdError("Invalid Huffman weights: cannot complete to power of 2", "corruption_detected");
  }
  const lastWeight = 32 - Math.clz32(remainder);
  const fullWeights = new Array(256).fill(0);
  for (let i = 0; i < weights.length; i++) {
    fullWeights[i] = weights[i] ?? 0;
  }
  fullWeights[weights.length] = lastWeight;
  const numBits = weightsToNumBits(fullWeights, maxNumBits);
  const table = buildHuffmanDecodeTable(numBits, maxNumBits);
  return { table, maxNumBits };
}
function decodeHuffmanStreamByCountInto(data, streamOffset, streamLength, table, maxNumBits, out, outOffset, numSymbols) {
  if (numSymbols === 0)
    return 0;
  if (streamLength <= 0) {
    throw new ZstdError("Huffman stream truncated", "corruption_detected");
  }
  const reader = new BitReaderReverse(data, streamOffset, streamLength);
  reader.skipPadding();
  let written = 0;
  for (let i = 0; i < numSymbols; i++) {
    const peek = reader.readBitsFast(maxNumBits);
    if (peek < 0 || peek >= table.length) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    const numBits = table.numBits[peek];
    if (numBits === 0) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    const overshoot = maxNumBits - numBits;
    if (overshoot > 0) {
      reader.unreadBits(overshoot);
    }
    out[outOffset + written] = table.symbol[peek];
    written++;
  }
  return written;
}
function decodeHuffmanStreamToEndInto(data, streamOffset, streamLength, table, maxNumBits, out, outOffset) {
  if (streamLength <= 0) {
    throw new ZstdError("Huffman stream truncated", "corruption_detected");
  }
  const stream = data.subarray(streamOffset, streamOffset + streamLength);
  const lastByte = stream[stream.length - 1];
  if (lastByte === 0) {
    throw new ZstdError("Huffman invalid end marker", "corruption_detected");
  }
  const highestSetBit = 31 - Math.clz32(lastByte);
  const paddingBits = 8 - highestSetBit;
  let bitOffset = streamLength * 8 - paddingBits;
  const streamBits = streamLength * 8;
  const mask = (1 << maxNumBits) - 1;
  let nextBitOffset = bitOffset - maxNumBits;
  let state = 0;
  if (nextBitOffset >= 0) {
    const byteIndex = nextBitOffset >>> 3;
    const bitInByte = nextBitOffset & 7;
    const word0 = (stream[byteIndex] ?? 0) | (stream[byteIndex + 1] ?? 0) << 8 | (stream[byteIndex + 2] ?? 0) << 16 | (stream[byteIndex + 3] ?? 0) << 24;
    if (bitInByte + maxNumBits <= 32) {
      state = word0 >>> bitInByte & (1 << maxNumBits) - 1;
    } else {
      const low = word0 >>> bitInByte;
      const highBits = maxNumBits - (32 - bitInByte);
      const word1 = (stream[byteIndex + 4] ?? 0) | (stream[byteIndex + 5] ?? 0) << 8 | (stream[byteIndex + 6] ?? 0) << 16 | (stream[byteIndex + 7] ?? 0) << 24;
      const high = (word1 & (1 << highBits) - 1) << 32 - bitInByte;
      state = (low | high) >>> 0;
    }
  } else {
    for (let i = 0; i < maxNumBits; i++) {
      const abs = nextBitOffset + i;
      if (abs < 0 || abs >= streamBits)
        continue;
      const byteIndex = abs >>> 3;
      const bitInByte = abs & 7;
      state |= (stream[byteIndex] >>> bitInByte & 1) << i;
    }
    state >>>= 0;
  }
  bitOffset = nextBitOffset;
  let written = 0;
  while (bitOffset > -maxNumBits) {
    if (state < 0 || state >= table.length) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    const numBits = table.numBits[state];
    if (numBits === 0) {
      throw new ZstdError("Huffman invalid code", "corruption_detected");
    }
    if (outOffset + written >= out.length) {
      throw new ZstdError("Huffman literals size mismatch", "corruption_detected");
    }
    out[outOffset + written] = table.symbol[state];
    written++;
    let rest = 0;
    nextBitOffset = bitOffset - numBits;
    if (numBits > 0) {
      if (nextBitOffset >= 0) {
        const byteIndex = nextBitOffset >>> 3;
        const bitInByte = nextBitOffset & 7;
        const word0 = (stream[byteIndex] ?? 0) | (stream[byteIndex + 1] ?? 0) << 8 | (stream[byteIndex + 2] ?? 0) << 16 | (stream[byteIndex + 3] ?? 0) << 24;
        if (bitInByte + numBits <= 32) {
          rest = word0 >>> bitInByte & (1 << numBits) - 1;
        } else {
          const low = word0 >>> bitInByte;
          const highBits = numBits - (32 - bitInByte);
          const word1 = (stream[byteIndex + 4] ?? 0) | (stream[byteIndex + 5] ?? 0) << 8 | (stream[byteIndex + 6] ?? 0) << 16 | (stream[byteIndex + 7] ?? 0) << 24;
          const high = (word1 & (1 << highBits) - 1) << 32 - bitInByte;
          rest = (low | high) >>> 0;
        }
      } else {
        for (let i = 0; i < numBits; i++) {
          const abs = nextBitOffset + i;
          if (abs < 0 || abs >= streamBits)
            continue;
          const byteIndex = abs >>> 3;
          const bitInByte = abs & 7;
          rest |= (stream[byteIndex] >>> bitInByte & 1) << i;
        }
        rest >>>= 0;
      }
    }
    bitOffset = nextBitOffset;
    state = (state << numBits & mask) + rest;
  }
  if (bitOffset !== -maxNumBits) {
    throw new ZstdError("Huffman stream did not end cleanly", "corruption_detected");
  }
  return written;
}
function parseFourStreamJumpTable(data, pos, totalStreamsSize) {
  if (totalStreamsSize < 10) {
    throw new ZstdError("4-stream mode requires at least 10 bytes", "corruption_detected");
  }
  const stream1Size = data[pos] | data[pos + 1] << 8;
  const stream2Size = data[pos + 2] | data[pos + 3] << 8;
  const stream3Size = data[pos + 4] | data[pos + 5] << 8;
  const stream4Size = totalStreamsSize - 6 - stream1Size - stream2Size - stream3Size;
  if (stream4Size < 0) {
    throw new ZstdError(`Invalid jump table in 4-stream literals: total=${totalStreamsSize} s1=${stream1Size} s2=${stream2Size} s3=${stream3Size}`, "corruption_detected");
  }
  return {
    stream1Size,
    stream2Size,
    stream3Size,
    stream4Size,
    streamOffset: pos + 6
  };
}
function decodeFourHuffmanStreamsInto(data, streamOffset, stream1Size, stream2Size, stream3Size, stream4Size, table, maxNumBits, out) {
  let outPos = 0;
  let pos = streamOffset;
  const decodeOne = (size) => {
    const written = decodeHuffmanStreamToEndInto(data, pos, size, table, maxNumBits, out, outPos);
    outPos += written;
    pos += size;
  };
  decodeOne(stream1Size);
  decodeOne(stream2Size);
  decodeOne(stream3Size);
  decodeOne(stream4Size);
  if (outPos !== out.length) {
    throw new ZstdError("Huffman literals size mismatch", "corruption_detected");
  }
}
function decodeCompressedLiterals(data, offset, compressedSize, regeneratedSize, numStreams) {
  let pos = offset;
  let huffmanTable;
  if (pos >= data.length) {
    throw new ZstdError("Huffman tree description truncated", "corruption_detected");
  }
  const headerByte = data[pos];
  pos++;
  let weights;
  let treeBytes;
  if (headerByte >= 128) {
    const numWeights = headerByte - 127;
    const { weights: w, bytesRead } = readWeightsDirect(data, pos, numWeights);
    weights = w;
    treeBytes = 1 + bytesRead;
    pos += bytesRead;
  } else {
    const { weights: w, bytesRead } = readWeightsFSE(data, pos, headerByte);
    weights = w;
    treeBytes = 1 + bytesRead;
    pos += headerByte;
  }
  huffmanTable = weightsToHuffmanTable(weights);
  const totalStreamsSize = compressedSize - treeBytes;
  if (totalStreamsSize <= 0) {
    throw new ZstdError("Invalid literals compressed size", "corruption_detected");
  }
  const result = new Uint8Array(regeneratedSize);
  if (numStreams === 1) {
    decodeHuffmanStreamByCountInto(data, pos, totalStreamsSize, huffmanTable.table, huffmanTable.maxNumBits, result, 0, regeneratedSize);
  } else {
    const jump = parseFourStreamJumpTable(data, pos, totalStreamsSize);
    decodeFourHuffmanStreamsInto(data, jump.streamOffset, jump.stream1Size, jump.stream2Size, jump.stream3Size, jump.stream4Size, huffmanTable.table, huffmanTable.maxNumBits, result);
  }
  return {
    literals: result,
    huffmanTable,
    bytesRead: compressedSize
  };
}
function decodeTreelessLiterals(data, offset, compressedSize, regeneratedSize, numStreams, huffmanTable) {
  const result = new Uint8Array(regeneratedSize);
  const pos = offset;
  if (numStreams === 1) {
    decodeHuffmanStreamByCountInto(data, pos, compressedSize, huffmanTable.table, huffmanTable.maxNumBits, result, 0, regeneratedSize);
  } else {
    const jump = parseFourStreamJumpTable(data, pos, compressedSize);
    decodeFourHuffmanStreamsInto(data, jump.streamOffset, jump.stream1Size, jump.stream2Size, jump.stream3Size, jump.stream4Size, huffmanTable.table, huffmanTable.maxNumBits, result);
  }
  return { literals: result, bytesRead: compressedSize };
}

// node_modules/zstdify/dist/decode/decompressFrame.js
function decompressFrame(data, offset, header, dictionary, maxSize, validateChecksum = true, reuseContext, debugTrace) {
  let pos = offset + 4 + header.headerSize;
  const knownOutputSize = header.contentSize ?? null;
  if (knownOutputSize !== null && maxSize !== void 0 && knownOutputSize > maxSize) {
    throw new ZstdError("Decompressed size exceeds maxSize", "parameter_unsupported");
  }
  let outputBuffer = knownOutputSize !== null ? new Uint8Array(knownOutputSize) : new Uint8Array(0);
  let totalSize = 0;
  const repOffsets = dictionary?.repOffsets ? [dictionary.repOffsets[0], dictionary.repOffsets[1], dictionary.repOffsets[2]] : [1, 4, 8];
  const history = getOrCreateHistoryWindow(header.windowSize, dictionary?.historyPrefix, reuseContext);
  let prevHuffmanTable = dictionary?.huffmanTable ?? null;
  let prevSeqTables = dictionary?.sequenceTables ?? null;
  const ensureOutputCapacity = (additional) => {
    const needed = totalSize + additional;
    if (needed <= outputBuffer.length) {
      return;
    }
    let nextCapacity = outputBuffer.length === 0 ? 64 * 1024 : outputBuffer.length;
    while (nextCapacity < needed) {
      nextCapacity *= 2;
    }
    const grown = new Uint8Array(nextCapacity);
    if (totalSize > 0) {
      grown.set(outputBuffer.subarray(0, totalSize), 0);
    }
    outputBuffer = grown;
  };
  const appendOutput = (chunk) => {
    if (chunk.length === 0) {
      return;
    }
    ensureOutputCapacity(chunk.length);
    outputBuffer.set(chunk, totalSize);
    totalSize += chunk.length;
  };
  let blockIndex = 0;
  const onBlockDecoded = debugTrace?.onBlockDecoded;
  while (true) {
    if (pos + 3 > data.length) {
      throw new ZstdError("Block header truncated", "corruption_detected");
    }
    const blockHeaderPos = pos;
    const block = parseBlockHeader(data, pos);
    pos += 3;
    const blockOutputStart = totalSize;
    let blockLiteralsInfo;
    let blockSequencesInfo;
    if (block.blockType === 0) {
      if (pos + block.blockSize > data.length) {
        throw new ZstdError("Raw literals truncated", "corruption_detected");
      }
      ensureOutputCapacity(block.blockSize);
      outputBuffer.set(data.subarray(pos, pos + block.blockSize), totalSize);
      if (!block.lastBlock) {
        appendRangeToHistoryWindow(history, data, pos, block.blockSize);
      }
      totalSize += block.blockSize;
      pos += block.blockSize;
    } else if (block.blockType === 1) {
      if (pos >= data.length) {
        throw new ZstdError("RLE literals truncated", "corruption_detected");
      }
      const byte = data[pos];
      ensureOutputCapacity(block.blockSize);
      outputBuffer.fill(byte, totalSize, totalSize + block.blockSize);
      if (!block.lastBlock) {
        appendRLEToHistoryWindow(history, byte, block.blockSize);
      }
      totalSize += block.blockSize;
      pos += 1;
    } else if (block.blockType === 2) {
      if (pos + block.blockSize > data.length) {
        throw new ZstdError("Compressed block truncated", "corruption_detected");
      }
      const blockContent = data.subarray(pos, pos + block.blockSize);
      const { header: litHeader, dataOffset: litDataOffset } = parseLiteralsSectionHeader(blockContent, 0);
      if (onBlockDecoded) {
        blockLiteralsInfo = {
          blockType: litHeader.blockType,
          regeneratedSize: litHeader.regeneratedSize,
          compressedSize: litHeader.compressedSize,
          numStreams: litHeader.numStreams,
          headerSize: litHeader.headerSize
        };
      }
      let literals;
      let litBytesConsumed;
      if (litHeader.blockType === 0) {
        literals = decodeRawLiterals(blockContent, litDataOffset, litHeader.regeneratedSize);
        litBytesConsumed = litHeader.headerSize + litHeader.regeneratedSize;
      } else if (litHeader.blockType === 1) {
        literals = decodeRLELiterals(blockContent, litDataOffset, litHeader.regeneratedSize);
        litBytesConsumed = litHeader.headerSize + 1;
      } else if (litHeader.blockType === 2) {
        const comp = decodeCompressedLiterals(blockContent, litDataOffset, litHeader.compressedSize, litHeader.regeneratedSize, litHeader.numStreams);
        literals = comp.literals;
        prevHuffmanTable = comp.huffmanTable;
        litBytesConsumed = litHeader.headerSize + comp.bytesRead;
      } else {
        if (!prevHuffmanTable) {
          throw new ZstdError("Treeless literals without previous Huffman table", "corruption_detected");
        }
        const comp = decodeTreelessLiterals(blockContent, litDataOffset, litHeader.compressedSize, litHeader.regeneratedSize, litHeader.numStreams, prevHuffmanTable);
        literals = comp.literals;
        litBytesConsumed = litHeader.headerSize + comp.bytesRead;
      }
      const seqSectionSize = block.blockSize - litBytesConsumed;
      if (seqSectionSize <= 0) {
        appendOutput(literals);
        if (!block.lastBlock) {
          appendToHistoryWindow(history, literals);
        }
      } else {
        ensureOutputCapacity(128 * 1024);
        const start = totalSize;
        const { written, tables, metadata } = decodeAndExecuteSequencesInto(blockContent, litBytesConsumed, seqSectionSize, prevSeqTables, literals, header.windowSize, outputBuffer, start, repOffsets, history, !block.lastBlock, !!onBlockDecoded);
        prevSeqTables = tables;
        if (onBlockDecoded) {
          blockSequencesInfo = {
            numSequences: metadata.numSequences,
            llMode: metadata.llMode,
            ofMode: metadata.ofMode,
            mlMode: metadata.mlMode,
            llTableLog: metadata.llTableLog,
            ofTableLog: metadata.ofTableLog,
            mlTableLog: metadata.mlTableLog,
            repeatOffsetCandidateCount: metadata.repeatOffsetCandidateCount
          };
        }
        totalSize += written;
      }
      pos += block.blockSize;
    } else {
      throw new ZstdError("Unsupported block type", "corruption_detected");
    }
    if (onBlockDecoded) {
      onBlockDecoded({
        blockIndex,
        blockType: block.blockType,
        blockSize: block.blockSize,
        lastBlock: block.lastBlock,
        inputOffset: blockHeaderPos,
        outputStart: blockOutputStart,
        outputEnd: totalSize,
        literals: blockLiteralsInfo,
        sequences: blockSequencesInfo
      });
    }
    blockIndex++;
    if (maxSize !== void 0 && totalSize > maxSize) {
      throw new ZstdError("Decompressed size exceeds maxSize", "parameter_unsupported");
    }
    if (block.lastBlock)
      break;
  }
  const output = outputBuffer.subarray(0, totalSize);
  if (header.contentSize !== null && output.length !== header.contentSize) {
    throw new ZstdError("Frame content size mismatch", "corruption_detected");
  }
  if (header.hasContentChecksum) {
    if (pos + 4 > data.length) {
      throw new ZstdError("Content checksum truncated", "corruption_detected");
    }
    if (validateChecksum) {
      const storedChecksum = readU32LE(data, pos);
      if (!validateContentChecksum(output, storedChecksum)) {
        throw new ZstdError("Content checksum mismatch", "corruption_detected");
      }
    }
    pos += 4;
    return { output, bytesConsumed: pos - offset };
  }
  return { output, bytesConsumed: pos - offset };
}

// node_modules/zstdify/dist/frame/frameHeader.js
var ZSTD_MAGIC2 = 4247762216;
function parseFrameHeader(data, offset) {
  if (offset + 2 > data.length) {
    throw new ZstdError("Frame header truncated", "corruption_detected");
  }
  const fhd = data[offset];
  offset++;
  const frameContentSizeFlag = fhd >> 6 & 3;
  const singleSegment = (fhd >> 5 & 1) === 1;
  const contentChecksumFlag = (fhd >> 2 & 1) === 1;
  const dictionaryIdFlag = fhd & 3;
  if ((fhd & 16) !== 0) {
    throw new ZstdError("Unused bit set in frame header", "corruption_detected");
  }
  if ((fhd & 8) !== 0) {
    throw new ZstdError("Reserved bit set in frame header", "corruption_detected");
  }
  let windowSize = 0;
  let contentSize = null;
  let headerSize = 1;
  if (singleSegment) {
  } else {
    if (offset + 1 > data.length) {
      throw new ZstdError("Frame header truncated (window descriptor)", "corruption_detected");
    }
    const wd = data[offset];
    offset++;
    headerSize++;
    const exponent = wd >> 3 & 31;
    const mantissa = wd & 7;
    const windowLog = 10 + exponent;
    const windowBase = 2 ** windowLog;
    const windowAdd = windowBase / 8 * mantissa;
    windowSize = windowBase + windowAdd;
  }
  let dictionaryId = null;
  const didFieldSize = [0, 1, 2, 4][dictionaryIdFlag];
  if (didFieldSize > 0) {
    if (offset + didFieldSize > data.length) {
      throw new ZstdError("Frame header truncated (dictionary ID)", "corruption_detected");
    }
    let did = 0;
    if (didFieldSize === 1)
      did = data[offset];
    else if (didFieldSize === 2)
      did = data[offset] | data[offset + 1] << 8;
    else
      did = readU32LE(data, offset);
    dictionaryId = did !== 0 ? did : null;
    offset += didFieldSize;
    headerSize += didFieldSize;
  }
  const fcsFieldSize = frameContentSizeFlag === 0 ? singleSegment ? 1 : 0 : frameContentSizeFlag === 1 ? 2 : frameContentSizeFlag === 2 ? 4 : 8;
  if (fcsFieldSize > 0) {
    if (offset + fcsFieldSize > data.length) {
      throw new ZstdError("Frame header truncated (content size)", "corruption_detected");
    }
    contentSize = readFrameContentSize(data, offset, fcsFieldSize);
    offset += fcsFieldSize;
    headerSize += fcsFieldSize;
    if (singleSegment) {
      windowSize = contentSize;
    }
  }
  return {
    headerSize,
    windowSize,
    contentSize,
    hasContentChecksum: contentChecksumFlag,
    dictionaryId: dictionaryId !== 0 ? dictionaryId : null,
    singleSegment
  };
}
function readFrameContentSize(data, offset, size) {
  if (size === 1) {
    return data[offset];
  }
  if (size === 2) {
    return 256 + (data[offset] | data[offset + 1] << 8);
  }
  if (size === 4) {
    return readU32LE(data, offset);
  }
  if (size === 8) {
    const lo = readU32LE(data, offset);
    const hi = readU32LE(data, offset + 4);
    const v = lo + hi * 4294967296;
    if (v > Number.MAX_SAFE_INTEGER) {
      throw new ZstdError("Content size exceeds safe integer range", "parameter_unsupported");
    }
    return v;
  }
  throw new ZstdError(`Invalid FCS field size: ${size}`, "corruption_detected");
}
function parseZstdFrame(data, offset) {
  if (offset + 4 > data.length) {
    throw new ZstdError("Input too short for magic number", "corruption_detected");
  }
  const magic = readU32LE(data, offset);
  if (magic !== ZSTD_MAGIC2) {
    throw new ZstdError(`Invalid zstd magic: 0x${magic.toString(16)}`, "corruption_detected");
  }
  const header = parseFrameHeader(data, offset + 4);
  return { magic, header };
}

// node_modules/zstdify/dist/frame/skippable.js
var SKIPPABLE_FRAME_MAGIC = 407710288;
var SKIPPABLE_FRAME_MAGIC_MASK = 4294967280;
function isSkippableFrame(data, offset) {
  if (offset + 4 > data.length)
    return false;
  const magic = readU32LE(data, offset);
  return (magic & SKIPPABLE_FRAME_MAGIC_MASK) === SKIPPABLE_FRAME_MAGIC;
}
function getSkippableFrameSize(data, offset) {
  if (offset + 8 > data.length) {
    throw new ZstdError("Skippable frame: truncated header", "corruption_detected");
  }
  return readU32LE(data, offset + 4);
}
function skipSkippableFrame(data, offset) {
  const frameSize = getSkippableFrameSize(data, offset);
  const nextOffset = offset + 8 + frameSize;
  if (nextOffset > data.length) {
    throw new ZstdError("Skippable frame: truncated payload", "corruption_detected");
  }
  return nextOffset;
}

// node_modules/zstdify/dist/decompress.js
function decompress(input, options) {
  if (input.length === 0) {
    throw new ZstdError("Empty input", "corruption_detected");
  }
  const maxSize = options?.maxSize;
  const dictionary = options?.dictionary;
  const validateChecksum = options?.validateChecksum !== false;
  const dictionaryBytes = dictionary instanceof Uint8Array ? dictionary : dictionary?.bytes;
  const providedDictionaryId = dictionary instanceof Uint8Array ? null : dictionary?.id ?? null;
  const normalizedDictionary = dictionaryBytes && dictionaryBytes.length > 0 ? normalizeDecoderDictionary(dictionaryBytes, providedDictionaryId) : null;
  const dictionaryId = normalizedDictionary?.dictionaryId ?? providedDictionaryId;
  const chunks = [];
  let totalOutputSize = 0;
  let offset = 0;
  while (offset < input.length) {
    if (offset + 4 > input.length) {
      throw new ZstdError("Truncated input", "corruption_detected");
    }
    if (isSkippableFrame(input, offset)) {
      offset = skipSkippableFrame(input, offset);
      continue;
    }
    const { header } = parseZstdFrame(input, offset);
    if (header.dictionaryId !== null && !dictionaryBytes) {
      throw new ZstdError("Dictionary frame requires dictionary option", "parameter_unsupported");
    }
    if (header.dictionaryId !== null && dictionaryId !== null && dictionaryId !== header.dictionaryId) {
      throw new ZstdError("Dictionary ID mismatch", "corruption_detected");
    }
    const { output, bytesConsumed } = decompressFrame(input, offset, header, normalizedDictionary, maxSize !== void 0 ? maxSize - totalOutputSize : void 0, validateChecksum, options?.reuseContext, options?.debugTrace);
    chunks.push(output);
    totalOutputSize += output.length;
    offset += bytesConsumed;
  }
  if (chunks.length === 0)
    return new Uint8Array(0);
  if (chunks.length === 1) {
    const c = chunks[0];
    if (!c)
      throw new ZstdError("Unreachable", "corruption_detected");
    return c;
  }
  const result = new Uint8Array(totalOutputSize);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
}

// src/core/zstd.ts
function decompressData(data) {
  if (data[0] === 40 && data[1] === 181 && data[2] === 47 && data[3] === 253) {
    return decompress(data);
  }
  return data;
}
function compressData(data) {
  return compress(data);
}
function isCompressed(data) {
  return data[0] === 40 && data[1] === 181 && data[2] === 47 && data[3] === 253;
}

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  })();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = (function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  })();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");

// src/core/byml.ts
var Writer = class {
  buffer;
  view;
  offset = 0;
  le = true;
  constructor(size = 10 * 1024 * 1024) {
    this.buffer = new Uint8Array(size);
    this.view = new DataView(this.buffer.buffer);
  }
  writeUInt8(v) {
    this.view.setUint8(this.offset++, v);
  }
  writeUInt16(v) {
    this.view.setUint16(this.offset, v, this.le);
    this.offset += 2;
  }
  writeUInt32(v) {
    this.view.setUint32(this.offset, v, this.le);
    this.offset += 4;
  }
  writeFloat32(v) {
    this.view.setFloat32(this.offset, v, this.le);
    this.offset += 4;
  }
  writeFloat64(v) {
    this.view.setFloat64(this.offset, v, this.le);
    this.offset += 8;
  }
  writeBigInt64(v) {
    this.view.setBigInt64(this.offset, v, this.le);
    this.offset += 8;
  }
  writeBigUint64(v) {
    this.view.setBigUint64(this.offset, v, this.le);
    this.offset += 8;
  }
  writeUInt24(v) {
    if (this.le) {
      this.writeUInt8(v & 255);
      this.writeUInt8(v >> 8 & 255);
      this.writeUInt8(v >> 16 & 255);
    } else {
      this.writeUInt8(v >> 16 & 255);
      this.writeUInt8(v >> 8 & 255);
      this.writeUInt8(v & 255);
    }
  }
  writeString(s) {
    const encoded = new TextEncoder().encode(s);
    for (const b of encoded) this.writeUInt8(b);
    this.writeUInt8(0);
  }
  align(n) {
    while (this.offset % n !== 0) this.writeUInt8(0);
  }
  seek(offset) {
    this.offset = offset;
  }
  tell() {
    return this.offset;
  }
  getBytes() {
    return this.buffer.slice(0, this.offset);
  }
};
function yamlToByml(yamlStr, originalData) {
  const obj = load(yamlStr);
  const writer = new Writer();
  let le = true;
  let version = 3;
  const typeMap = /* @__PURE__ */ new Map();
  if (originalData) {
    let crawl2 = function(offset, path2) {
      const type2 = decompressed[offset];
      typeMap.set(path2, type2);
      if (type2 === 193) {
        const cr = new Reader(decompressed);
        cr.le = le;
        cr.seek(offset + 1);
        const count = cr.readUInt24();
        cr.seek(offset + 4);
        for (let i = 0; i < count; i++) {
          const kidx = cr.readUInt24();
          const nt = cr.readUInt8();
          const val = cr.readUInt32();
          const k = oKeys[kidx];
          typeMap.set(path2 + "/" + k, nt);
          if (nt === 192 || nt === 193) crawl2(val, path2 + "/" + k);
        }
      } else if (type2 === 192) {
        const cr = new Reader(decompressed);
        cr.le = le;
        cr.seek(offset + 1);
        const count = cr.readUInt24();
        cr.seek(offset + 4);
        const types = [];
        for (let i = 0; i < count; i++) types.push(cr.readUInt8());
        cr.align(4);
        for (let i = 0; i < count; i++) {
          const nt = types[i];
          const val = cr.readUInt32();
          typeMap.set(path2 + "[" + i + "]", nt);
          if (nt === 192 || nt === 193) crawl2(val, path2 + "[" + i + "]");
        }
      }
    };
    var crawl = crawl2;
    const decompressed = isCompressed(originalData) ? decompressData(originalData) : originalData;
    if (decompressed[0] === 66 && decompressed[1] === 89) le = false;
    if (le) version = decompressed[3] << 8 | decompressed[2];
    else version = decompressed[2] << 8 | decompressed[3];
    const r = new Reader(decompressed);
    r.le = le;
    const oKeys = r.readStringTable(r.readUInt32At(4));
    const oRootOff = r.readUInt32At(12);
    try {
      crawl2(oRootOff, "");
    } catch (e) {
    }
  }
  writer.le = le;
  const keys = /* @__PURE__ */ new Set();
  const strings = /* @__PURE__ */ new Set();
  const extraData = new Writer();
  extraData.le = le;
  const patchLocations = [];
  function collect(node) {
    if (typeof node === "string") strings.add(node);
    else if (Array.isArray(node)) node.forEach(collect);
    else if (node && typeof node === "object") {
      Object.keys(node).forEach((k) => {
        keys.add(k);
        collect(node[k]);
      });
    }
  }
  collect(obj);
  const sortedKeys = Array.from(keys).sort();
  const sortedStrings = Array.from(strings).sort();
  writer.writeUInt8(le ? 89 : 66);
  writer.writeUInt8(le ? 66 : 89);
  writer.writeUInt16(version);
  const ktPos = writer.tell();
  writer.writeUInt32(0);
  const stPos = writer.tell();
  writer.writeUInt32(0);
  const rtPos = writer.tell();
  writer.writeUInt32(0);
  const keyTableOffset = writer.tell();
  writer.view.setUint32(ktPos, keyTableOffset, le);
  writeStringTable(writer, sortedKeys);
  writer.align(4);
  const stringTableOffset = writer.tell();
  writer.view.setUint32(stPos, stringTableOffset, le);
  writeStringTable(writer, sortedStrings);
  const nodeOffsets = /* @__PURE__ */ new Map();
  const pendingNodes = [];
  function writeStringTable(w, arr) {
    const start = w.tell();
    w.writeUInt8(194);
    w.writeUInt24(arr.length);
    const otPos = w.tell();
    for (let i = 0; i < arr.length + 1; i++) w.writeUInt32(0);
    const offsets = [];
    for (let i = 0; i < arr.length; i++) {
      offsets.push(w.tell() - start);
      w.writeString(arr[i]);
    }
    offsets.push(w.tell() - start);
    const end = w.tell();
    w.seek(otPos);
    for (const o of offsets) w.writeUInt32(o);
    w.seek(end);
  }
  function getNodeType(v, path2) {
    if (typeMap.has(path2)) return typeMap.get(path2);
    if (typeof v === "string") return 160;
    if (typeof v === "number") {
      if (Number.isInteger(v)) {
        if (v < -2147483648 || v > 2147483647) return 213;
        return 209;
      }
      if (Math.fround(v) === v) return 210;
      return 211;
    }
    if (typeof v === "boolean") return 208;
    if (Array.isArray(v)) return 192;
    if (v && typeof v === "object") return 193;
    return 255;
  }
  function writeNode2(node, path2) {
    const type2 = getNodeType(node, path2);
    const nodeKey = type2.toString(16) + ":" + JSON.stringify(node);
    if (nodeOffsets.has(nodeKey)) return nodeOffsets.get(nodeKey);
    writer.align(4);
    const offset = writer.tell();
    nodeOffsets.set(nodeKey, offset);
    if (Array.isArray(node)) {
      writer.writeUInt8(192);
      writer.writeUInt24(node.length);
      for (let i = 0; i < node.length; i++) writer.writeUInt8(getNodeType(node[i], path2 + "[" + i + "]"));
      writer.align(4);
      const valPos = writer.tell();
      for (let i = 0; i < node.length; i++) writer.writeUInt32(0);
      for (let i = 0; i < node.length; i++) {
        const p = path2 + "[" + i + "]", nt = getNodeType(node[i], p);
        if (nt === 192 || nt === 193) pendingNodes.push({ parentPos: valPos + i * 4, node: node[i], path: p });
        else {
          const saved = writer.tell();
          writer.seek(valPos + i * 4);
          writer.writeUInt32(encodeValue(nt, node[i], valPos + i * 4));
          writer.seek(saved);
        }
      }
    } else {
      const entries = Object.entries(node).sort((a, b) => sortedKeys.indexOf(a[0]) - sortedKeys.indexOf(b[0]));
      writer.writeUInt8(193);
      writer.writeUInt24(entries.length);
      const entryPos = writer.tell();
      for (const [k, v] of entries) {
        writer.writeUInt24(sortedKeys.indexOf(k));
        writer.writeUInt8(getNodeType(v, path2 + "/" + k));
        writer.writeUInt32(0);
      }
      for (let i = 0; i < entries.length; i++) {
        const p = path2 + "/" + entries[i][0], nt = getNodeType(entries[i][1], p);
        if (nt === 192 || nt === 193) pendingNodes.push({ parentPos: entryPos + i * 8 + 4, node: entries[i][1], path: p });
        else {
          const saved = writer.tell();
          writer.seek(entryPos + i * 8 + 4);
          writer.writeUInt32(encodeValue(nt, entries[i][1], entryPos + i * 8 + 4));
          writer.seek(saved);
        }
      }
    }
    return offset;
  }
  function encodeValue(type2, v, pos) {
    switch (type2) {
      case 160:
        return sortedStrings.indexOf(v);
      case 209:
        return v | 0;
      case 212:
        return v >>> 0;
      case 210: {
        const b = new ArrayBuffer(4);
        const vi = new DataView(b);
        vi.setFloat32(0, v, le);
        return vi.getUint32(0, le);
      }
      case 208:
        return v ? 1 : 0;
      case 211:
      case 213:
      case 214: {
        extraData.align(8);
        const off = extraData.tell();
        if (type2 === 211) extraData.writeFloat64(v);
        else if (type2 === 213) extraData.writeBigInt64(BigInt(v));
        else extraData.writeBigUint64(BigInt(v));
        patchLocations.push({ pos, extraOffset: off });
        return 0;
      }
      default:
        return 0;
    }
  }
  const rootOffset = writeNode2(obj, "");
  writer.view.setUint32(rtPos, rootOffset, le);
  while (pendingNodes.length > 0) {
    const { parentPos, node, path: path2 } = pendingNodes.shift();
    const offset = writeNode2(node, path2);
    const saved = writer.tell();
    writer.seek(parentPos);
    writer.writeUInt32(offset);
    writer.seek(saved);
  }
  writer.align(8);
  const baseLen = writer.tell();
  const extraBytes = extraData.getBytes();
  const finalOut = new Uint8Array(baseLen + extraBytes.length);
  finalOut.set(writer.getBytes());
  finalOut.set(extraBytes, baseLen);
  const finalView = new DataView(finalOut.buffer);
  for (const p of patchLocations) {
    finalView.setUint32(p.pos, baseLen + p.extraOffset, le);
  }
  return originalData && isCompressed(originalData) ? compressData(finalOut) : finalOut;
}
function bymlToYaml(data) {
  const decompressed = isCompressed(data) ? decompressData(data) : data;
  const reader = new Reader(decompressed);
  const magic = String.fromCharCode(reader.readUInt8(), reader.readUInt8());
  if (magic === "BY") reader.le = false;
  else reader.le = true;
  const version = reader.readUInt16();
  const ktOff = reader.readUInt32(), stOff = reader.readUInt32(), rtOff = reader.readUInt32();
  const keys = reader.readStringTable(ktOff), strings = reader.readStringTable(stOff);
  function parseNode(offset) {
    const prev = reader.tell();
    reader.seek(offset);
    const type2 = reader.readUInt8();
    let res;
    if (type2 === 192) {
      const count = reader.readUInt24();
      const types = [];
      for (let i = 0; i < count; i++) types.push(reader.readUInt8());
      reader.align(4);
      const arr = [];
      for (let i = 0; i < count; i++) arr.push(parseValue(types[i], reader.readUInt32()));
      res = arr;
    } else if (type2 === 193) {
      const count = reader.readUInt24();
      const dict = {};
      for (let i = 0; i < count; i++) {
        const kidx = reader.readUInt24(), nt = reader.readUInt8(), val = reader.readUInt32();
        dict[keys[kidx]] = parseValue(nt, val);
      }
      res = dict;
    }
    reader.seek(prev);
    return res;
  }
  function parseValue(type2, value) {
    switch (type2) {
      case 160:
        return strings[value];
      case 209: {
        const dv = new DataView(new ArrayBuffer(4));
        dv.setUint32(0, value, reader.le);
        return dv.getInt32(0, reader.le);
      }
      case 212:
        return value >>> 0;
      case 210: {
        const dv = new DataView(new ArrayBuffer(4));
        dv.setUint32(0, value, reader.le);
        return dv.getFloat32(0, reader.le);
      }
      case 211: {
        const p = reader.tell();
        reader.seek(value);
        const r = reader.readFloat64();
        reader.seek(p);
        return r;
      }
      case 213: {
        const p = reader.tell();
        reader.seek(value);
        const r = reader.readBigInt64();
        reader.seek(p);
        return Number(r);
      }
      case 214: {
        const p = reader.tell();
        reader.seek(value);
        const r = reader.readBigUint64();
        reader.seek(p);
        return Number(r);
      }
      case 208:
        return value !== 0;
      case 192:
      case 193:
        return parseNode(value);
      case 255:
        return null;
      default:
        return value;
    }
  }
  return dump(parseNode(rtOff), { indent: 2, noRefs: true, quotingType: '"' });
}
var Reader = class {
  view;
  offset = 0;
  le = true;
  constructor(buffer) {
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  readUInt8() {
    return this.view.getUint8(this.offset++);
  }
  readUInt16() {
    const r = this.view.getUint16(this.offset, this.le);
    this.offset += 2;
    return r;
  }
  readUInt32() {
    const r = this.view.getUint32(this.offset, this.le);
    this.offset += 4;
    return r;
  }
  readUInt32At(o) {
    return this.view.getUint32(o, this.le);
  }
  readFloat64() {
    const r = this.view.getFloat64(this.offset, this.le);
    this.offset += 8;
    return r;
  }
  readBigInt64() {
    const r = this.view.getBigInt64(this.offset, this.le);
    this.offset += 8;
    return r;
  }
  readBigUint64() {
    const r = this.view.getBigUint64(this.offset, this.le);
    this.offset += 8;
    return r;
  }
  readUInt24() {
    const b1 = this.readUInt8(), b2 = this.readUInt8(), b3 = this.readUInt8();
    return this.le ? b1 | b2 << 8 | b3 << 16 : b1 << 16 | b2 << 8 | b3;
  }
  seek(offset) {
    this.offset = offset;
  }
  tell() {
    return this.offset;
  }
  align(n) {
    while (this.offset % n !== 0) this.offset++;
  }
  readStringTable(offset) {
    if (offset === 0) return [];
    const prev = this.offset;
    this.seek(offset);
    if (this.readUInt8() !== 194) throw new Error("Invalid string table");
    const count = this.readUInt24();
    const offsets = [];
    for (let i = 0; i < count + 1; i++) offsets.push(this.readUInt32());
    const strings = [];
    for (let i = 0; i < count; i++) {
      this.seek(offset + offsets[i]);
      let bytes = [], b;
      while ((b = this.readUInt8()) !== 0) bytes.push(b);
      strings.push(new TextDecoder().decode(new Uint8Array(bytes)));
    }
    this.seek(prev);
    return strings;
  }
};

// src/core/logger.ts
var Logger = class {
  static channel;
  /**
   * In VS Code, we call this with the output channel.
   * In CLI, we don't call it, and it defaults to console logging.
   */
  static setChannel(channel) {
    this.channel = channel;
    this.info("BYML Lens Logger Initialized.");
  }
  static init() {
  }
  static get currentLevel() {
    return 1 /* INFO */;
  }
  static debug(message, data) {
    if (this.currentLevel <= 0 /* DEBUG */) this.write("DEBUG", message, data);
  }
  static info(message, data) {
    if (this.currentLevel <= 1 /* INFO */) this.write("INFO", message, data);
  }
  static warn(message, data) {
    if (this.currentLevel <= 2 /* WARN */) this.write("WARN", message, data);
  }
  static error(message, error) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    const header = `[${timestamp2}] \u274C ERROR: ${message}`;
    const stack = error?.stack || error || "";
    if (this.channel) {
      this.channel.appendLine(header);
      if (stack) this.channel.appendLine(`   Stack: ${stack}`);
      this.channel.show(true);
    } else {
      console.error(header);
      if (stack) console.error(stack);
    }
  }
  static write(label, message, data) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    let logMsg = `[${timestamp2}] [${label}] ${message}`;
    if (data) {
      logMsg += ` | Data: ${JSON.stringify(data)}`;
    }
    if (this.channel) {
      this.channel.appendLine(logMsg);
    } else {
      console.log(logMsg);
    }
  }
  static show() {
    if (this.channel) this.channel.show(true);
  }
};

// src/core/sarc.ts
var SarcArchive = class _SarcArchive {
  files = [];
  isCompressed = false;
  le = true;
  bom = 65279;
  constructor(data) {
    if (!data) return;
    try {
      this.isCompressed = isCompressed(data);
      const d = this.isCompressed ? decompressData(data) : data;
      const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
      const magic = String.fromCharCode(d[0], d[1], d[2], d[3]);
      if (magic !== "SARC") throw new Error(`Invalid magic: ${magic}`);
      const bom = view.getUint16(6, false);
      if (bom === 65279) this.le = false;
      else if (bom === 65534) this.le = true;
      else this.le = true;
      const headerSize = view.getUint16(4, this.le);
      const dataStart = view.getUint32(12, this.le);
      const sfatMagic = String.fromCharCode(d[headerSize], d[headerSize + 1], d[headerSize + 2], d[headerSize + 3]);
      if (sfatMagic !== "SFAT") throw new Error(`Invalid SFAT magic: ${sfatMagic}`);
      const sfatCount = view.getUint16(headerSize + 6, this.le);
      const sfatNodesPos = headerSize + 12;
      const stringTablePos = sfatNodesPos + sfatCount * 16 + 8;
      for (let i = 0; i < sfatCount; i++) {
        const nodeOff = sfatNodesPos + i * 16;
        const nameAttr = view.getUint32(nodeOff + 4, this.le);
        const nameOffset = (nameAttr & 16777215) * 4;
        const fileStart = view.getUint32(nodeOff + 8, this.le);
        const fileEnd = view.getUint32(nodeOff + 12, this.le);
        const fileData = d.slice(dataStart + fileStart, dataStart + fileEnd);
        let nEnd = stringTablePos + nameOffset;
        while (nEnd < d.length && d[nEnd] !== 0) nEnd++;
        const name = new TextDecoder().decode(d.slice(stringTablePos + nameOffset, nEnd));
        this.files.push({ name, data: fileData });
      }
    } catch (err) {
      Logger.error(`SARC Parsing Error`, err);
      throw err;
    }
  }
  static hash(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = Math.imul(h, 101) + name.charCodeAt(i) >>> 0;
    }
    return h;
  }
  encode(originalDataStart) {
    Logger.info(`Encoding SARC with ${this.files.length} files...`);
    const sortedFiles = [...this.files].sort((a, b) => {
      const ha = _SarcArchive.hash(a.name);
      const hb = _SarcArchive.hash(b.name);
      if (ha !== hb) return ha - hb;
      return a.name.localeCompare(b.name);
    });
    let stringTableSize = 0;
    const nameOffsets = sortedFiles.map((f) => {
      const off = stringTableSize;
      const bytes = new TextEncoder().encode(f.name);
      stringTableSize += bytes.length + 1;
      while (stringTableSize % 4 !== 0) stringTableSize++;
      return off;
    });
    const sfatSize = 12 + sortedFiles.length * 16;
    const sfntSize = 8 + stringTableSize;
    const headerSize = 20;
    let dataStart = originalDataStart || headerSize + sfatSize + sfntSize;
    if (dataStart < headerSize + sfatSize + sfntSize) dataStart = headerSize + sfatSize + sfntSize;
    while (dataStart % 4 !== 0) dataStart++;
    let totalSize = dataStart;
    const fileOffsets = sortedFiles.map((f, i) => {
      while (totalSize % 256 !== 0) totalSize++;
      const start = totalSize - dataStart;
      totalSize += f.data.length;
      const end = totalSize - dataStart;
      return { start, end };
    });
    while (totalSize % 8192 !== 0) totalSize++;
    const out = new Uint8Array(totalSize);
    const view = new DataView(out.buffer);
    out.set([83, 65, 82, 67], 0);
    view.setUint16(4, headerSize, this.le);
    view.setUint16(6, this.le ? 65534 : 65279, false);
    view.setUint32(8, totalSize, this.le);
    view.setUint32(12, dataStart, this.le);
    view.setUint32(16, 256, this.le);
    let pos = headerSize;
    out.set([83, 70, 65, 84], pos);
    view.setUint16(pos + 4, 12, this.le);
    view.setUint16(pos + 6, sortedFiles.length, this.le);
    view.setUint32(pos + 8, 101, this.le);
    pos += 12;
    for (let i = 0; i < sortedFiles.length; i++) {
      const f = sortedFiles[i];
      view.setUint32(pos, _SarcArchive.hash(f.name), this.le);
      view.setUint32(pos + 4, 16777216 | nameOffsets[i] / 4, this.le);
      view.setUint32(pos + 8, fileOffsets[i].start, this.le);
      view.setUint32(pos + 12, fileOffsets[i].end, this.le);
      pos += 16;
    }
    out.set([83, 70, 78, 84], pos);
    view.setUint16(pos + 4, 8, this.le);
    view.setUint32(pos + 8, stringTableSize + 8, this.le);
    pos += 8;
    out.fill(0, pos, pos + stringTableSize);
    for (let i = 0; i < sortedFiles.length; i++) {
      const nameBytes = new TextEncoder().encode(sortedFiles[i].name);
      out.set(nameBytes, pos + nameOffsets[i]);
    }
    pos += stringTableSize;
    for (let i = 0; i < sortedFiles.length; i++) {
      out.set(sortedFiles[i].data, dataStart + fileOffsets[i].start);
    }
    if (this.isCompressed) return compressData(out);
    return out;
  }
};

// src/cli.ts
var program2 = new Command();
var COMMIT_ID = true ? "0d25739" : "dev";
program2.name("byml-lens").description(`CLI tool for Nintendo BYML and SARC files (v0.2.4, commit: ${COMMIT_ID})`).version(`0.2.4 (${COMMIT_ID})`);
program2.command("deyaml").description("Convert binary BYML to YAML").argument("<input>", "Input binary BYML file (.byml, .bgyml, .zs)").argument("[output]", "Output YAML file").action(async (input, output) => {
  try {
    const data = fs.readFileSync(input);
    const yamlStr = bymlToYaml(new Uint8Array(data));
    if (output) {
      fs.writeFileSync(output, yamlStr);
      console.log(`Successfully converted ${input} to ${output}`);
    } else {
      console.log(yamlStr);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
});
program2.command("yaml2byml").description("Convert YAML to binary BYML").argument("<input>", "Input YAML file").argument("<output>", "Output binary BYML file").option("-r, --reference <file>", "Reference binary file to match version/endianness").action(async (input, output, options) => {
  try {
    const yamlStr = fs.readFileSync(input, "utf-8");
    let refData;
    if (options.reference) {
      refData = new Uint8Array(fs.readFileSync(options.reference));
    }
    const encoded = yamlToByml(yamlStr, refData);
    fs.writeFileSync(output, Buffer.from(encoded));
    console.log(`Successfully converted ${input} to ${output}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
});
program2.command("unpack").description("Unpack SARC archive").argument("<input>", "Input SARC file (.pack, .sarc, .zs)").argument("<outDir>", "Output directory").option("-y, --yaml", "Automatically convert internal BYML files to YAML", false).action(async (input, outDir, options) => {
  try {
    const data = fs.readFileSync(input);
    const archive = new SarcArchive(new Uint8Array(data));
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    let convertedCount = 0;
    for (const file of archive.files) {
      const outPath = path.join(outDir, file.name);
      const parentDir = path.dirname(outPath);
      if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
      fs.writeFileSync(outPath, file.data);
      console.log(`Extracted: ${file.name}`);
      if (options.yaml && (file.name.endsWith(".byml") || file.name.endsWith(".bgyml"))) {
        try {
          const yamlStr = bymlToYaml(file.data);
          fs.writeFileSync(outPath + ".yaml", yamlStr);
          convertedCount++;
        } catch (e) {
          console.warn(`Warning: Failed to deyaml ${file.name}`);
        }
      }
    }
    console.log(`Successfully unpacked ${archive.files.length} files to ${outDir} (${convertedCount} YAMLs generated)`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
});
program2.command("pack").description("Pack a directory into a SARC archive (Smart Hybrid Mode)").argument("<inDir>", "Input directory").argument("<output>", "Output SARC file").option("-z, --zstd", "Compress the output with Zstandard", false).option("-B, --big-endian", "Use Big Endian byte order", false).option("-y, --yaml", "Force re-compilation of all .yaml files even if binary exists", false).option("-r, --reference <file>", "Reference SARC file to match dataStart offset").action(async (inDir, output, options) => {
  try {
    if (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory()) {
      throw new Error(`${inDir} is not a directory`);
    }
    const archive = new SarcArchive();
    archive.isCompressed = options.zstd;
    archive.le = !options.bigEndian;
    const filesInFolder = [];
    const walk = (dir) => {
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
        else filesInFolder.push(fullPath);
      }
    };
    walk(inDir);
    const fileMap = /* @__PURE__ */ new Map();
    for (const f of filesInFolder) {
      const rel = path.relative(inDir, f);
      if (rel.endsWith(".yaml")) {
        const base = rel.slice(0, -5);
        const entry = fileMap.get(base) || {};
        entry.yaml = f;
        fileMap.set(base, entry);
      } else {
        const entry = fileMap.get(rel) || {};
        entry.binary = f;
        fileMap.set(rel, entry);
      }
    }
    for (const [name, paths] of fileMap.entries()) {
      if (paths.yaml && (options.yaml || !paths.binary)) {
        console.log(`Packing (Re-compiled): ${name}`);
        const yamlStr = fs.readFileSync(paths.yaml, "utf-8");
        let refData;
        if (paths.binary && fs.existsSync(paths.binary)) {
          refData = new Uint8Array(fs.readFileSync(paths.binary));
        }
        const encoded2 = yamlToByml(yamlStr, refData);
        archive.files.push({ name, data: new Uint8Array(encoded2) });
      } else if (paths.binary) {
        console.log(`Packing (Raw Binary): ${name}`);
        const data = fs.readFileSync(paths.binary);
        archive.files.push({ name, data: new Uint8Array(data) });
      }
    }
    let originalDataStart;
    if (options.reference && fs.existsSync(options.reference)) {
      try {
        const refBytes = fs.readFileSync(options.reference);
        const d = isCompressed(new Uint8Array(refBytes)) ? decompressData(new Uint8Array(refBytes)) : new Uint8Array(refBytes);
        const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
        originalDataStart = view.getUint32(12, d[6] === 255);
        console.log(`Inheriting original dataStart: ${originalDataStart} (0x${originalDataStart.toString(16)})`);
      } catch (e) {
        console.warn("Warning: Could not read dataStart from reference");
      }
    }
    const encoded = archive.encode(originalDataStart);
    fs.writeFileSync(output, encoded);
    console.log(`Successfully packed ${archive.files.length} files to ${output}.`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
});
program2.parse();
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
