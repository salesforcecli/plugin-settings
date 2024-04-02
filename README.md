# plugin-settings

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-settings.svg?label=@salesforce/plugin-settings)](https://www.npmjs.com/package/@salesforce/plugin-settings) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-settings/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-settings/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-settings.svg)](https://npmjs.org/package/@salesforce/plugin-settings) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-settings/main/LICENSE.txt)

Config and alias commands for the `sf` Salesforce CLI

> NOTE: This repo combines `plugin-config` and `plugin-alias` for `sf`.
>
> If you are looking for the `sfdx` command repos, they can be found here: [plugin-config](https://github.com/salesforcecli/plugin-config) and [plugin-alias](https://github.com/salesforcecli/plugin-alias)

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands bundled with the CLI, however, you can install a specific version or tag if needed.

## Install

```bash
sf plugins install settings@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-settings

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/dev.js` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev config
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins link .
# To verify
sf plugins
```

# Commands

<!-- commands -->

- [`sf alias list`](#sf-alias-list)
- [`sf alias set`](#sf-alias-set)
- [`sf alias unset`](#sf-alias-unset)
- [`sf config get`](#sf-config-get)
- [`sf config list`](#sf-config-list)
- [`sf config set`](#sf-config-set)
- [`sf config unset`](#sf-config-unset)

## `sf alias list`

List all aliases currently set on your local computer.

```
USAGE
  $ sf alias list [--json] [--flags-dir <value>]

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  List all aliases currently set on your local computer.

  Aliases are global, which means that you can use all the listed aliases in any Salesforce DX project on your computer.

ALIASES
  $ sf force alias list

EXAMPLES
  List all the aliases you've set:

    $ sf alias list
```

_See code: [src/commands/alias/list.ts](https://github.com/salesforcecli/plugin-settings/blob/2.1.2/src/commands/alias/list.ts)_

## `sf alias set`

Set one or more aliases on your local computer.

```
USAGE
  $ sf alias set [--json] [--flags-dir <value>]

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Set one or more aliases on your local computer.

  Aliases are user-defined short names that make it easier to use the CLI. For example, users often set an alias for a
  scratch org usernames because they're long and unintuitive.  Check the --help of a CLI command to determine where you
  can use an alias.

  You can associate an alias with only one value at a time. If you set an alias multiple times, the alias points to the
  most recent value. Aliases are global; after you set an alias, you can use it in any Salesforce DX project on your
  computer.

  Use quotes to specify an alias value that contains spaces. You typically use an equal sign to set your alias, although
  you don't need it if you're setting a single alias in a command.

ALIASES
  $ sf force alias set

EXAMPLES
  Set an alias for a scratch org username:

    $ sf alias set my-scratch-org=test-sadbiytjsupn@example.com

  Set multiple aliases with a single command:

    $ sf alias set my-scratch-org=test-sadbiytjsupn@example.com my-other-scratch-org=test-ss0xut7txzxf@example.com

  Set an alias that contains spaces:

    $ sf alias set my-alias='alias with spaces'

  Set a single alias without using an equal sign:

    $ sf alias set my-scratch-org test-ss0xut7txzxf@example.com
```

_See code: [src/commands/alias/set.ts](https://github.com/salesforcecli/plugin-settings/blob/2.1.2/src/commands/alias/set.ts)_

## `sf alias unset`

Unset one or more aliases that are currently set on your local computer.

```
USAGE
  $ sf alias unset [--json] [--flags-dir <value>] [-a] [-p]

FLAGS
  -a, --all        Unset all currently set aliases.
  -p, --no-prompt  Don't prompt the user for confirmation when unsetting all aliases.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Unset one or more aliases that are currently set on your local computer.

  Aliases are global, so when you unset one it's no longer available in any Salesforce DX project.

ALIASES
  $ sf force alias unset

EXAMPLES
  Unset an alias:

    $ sf alias unset my-alias

  Unset multiple aliases with a single command:

    $ sf alias unset my-alias my-other-alias

  Unset all aliases:

    $ sf alias unset --all [--no-prompt]
```

_See code: [src/commands/alias/unset.ts](https://github.com/salesforcecli/plugin-settings/blob/2.1.2/src/commands/alias/unset.ts)_

## `sf config get`

Get the value of a configuration variable.

```
USAGE
  $ sf config get [--json] [--flags-dir <value>] [--verbose]

FLAGS
  --verbose  Display whether the configuration variables are set locally or globally.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Get the value of a configuration variable.

  Run "sf config list" to see the configuration variables you've already set and their level (local or global).

  Run "sf config set" to set a configuration variable. For the full list of available configuration variables, see
  https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

ALIASES
  $ sf force config get

EXAMPLES
  Get the value of the "target-org" configuration variable.

    $ sf config get target-org

  Get multiple configuration variables and display whether they're set locally or globally:

    $ sf config get target-org api-version --verbose
```

_See code: [src/commands/config/get.ts](https://github.com/salesforcecli/plugin-settings/blob/2.1.2/src/commands/config/get.ts)_

## `sf config list`

List the configuration variables that you've previously set.

```
USAGE
  $ sf config list [--json] [--flags-dir <value>]

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  List the configuration variables that you've previously set.

  A config variable can be global or local, depending on whether you used the --global flag when you set it. Local
  config variables apply only to the current project and override global config variables, which apply to all projects.
  You can set all config variables as environment variables. Environment variables override their equivalent local and
  global config variables.

  The output of this command takes into account your current context. For example, let's say you run this command from a
  Salesforce DX project in which you've locally set the "target-org" config variable. The command displays the local
  value, even if you've also set "target-org" globally. If you haven't set the config variable locally, then the global
  value is displayed, if set. If you set the SF_TARGET_ORG environment variable, it's displayed as such and overrides
  any locally or globally set "target-org" config variable.

  For the full list of available configuration variables, see
  https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

ALIASES
  $ sf force config list

EXAMPLES
  List the global and local configuration variables that apply to your current context:

    $ sf config list
```

_See code: [src/commands/config/list.ts](https://github.com/salesforcecli/plugin-settings/blob/2.1.2/src/commands/config/list.ts)_

## `sf config set`

Set one or more configuration variables, such as your default org.

```
USAGE
  $ sf config set [--json] [--flags-dir <value>] [-g]

FLAGS
  -g, --global  Set the configuration variables globally, so they can be used from any Salesforce DX project.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Set one or more configuration variables, such as your default org.

  Use configuration variables to set CLI defaults, such as your default org or the API version you want the CLI to use.
  For example, if you set the "target-org" configuration variable, you don't need to specify it as a "sf deploy
  metadata" flag if you're deploying to your default org.

  Local configuration variables apply only to your current project. Global variables, specified with the --global flag,
  apply in any Salesforce DX project.

  The resolution order if you've set a flag value in multiple ways is as follows:

  1. Flag value specified at the command line.
  2. Local (project-level) configuration variable.
  3. Global configuration variable.

  Run "sf config list" to see the configuration variables you've already set and their level (local or global).

  If you're setting a single config variable, you don't need to use an equal sign between the variable and value. But
  you must use the equal sign if setting multiple config variables.

  For the full list of available configuration variables, see
  https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

ALIASES
  $ sf force config set

EXAMPLES
  Set the local target-org configuration variable to an org username:

    $ sf config set target-org me@my.org

  Set the local target-org configuration variable to an alias:

    $ sf config set target-org my-scratch-org

  Set the global target-org and target-dev-hub configuration variables using aliases:

    $ sf config set --global target-org=my-scratch-org target-dev-hub=my-dev-hub
```

_See code: [src/commands/config/set.ts](https://github.com/salesforcecli/plugin-settings/blob/2.1.2/src/commands/config/set.ts)_

## `sf config unset`

Unset local or global configuration variables.

```
USAGE
  $ sf config unset [--json] [--flags-dir <value>] [-g]

FLAGS
  -g, --global  Unset the configuration variables globally.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Unset local or global configuration variables.

  Local configuration variables apply only to your current project. Global configuration variables apply in any
  Salesforce DX project.

  For the full list of available configuration variables, see
  https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

ALIASES
  $ sf force config unset

EXAMPLES
  Unset the local "target-org" configuration variable:

    $ sf config unset target-org

  Unset multiple configuration variables globally:

    $ sf config unset target-org api-version --global
```

_See code: [src/commands/config/unset.ts](https://github.com/salesforcecli/plugin-settings/blob/2.1.2/src/commands/config/unset.ts)_

<!-- commandsstop -->
