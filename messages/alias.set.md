# summary

Set one or more aliases on your local computer.

# description

Aliases are user-defined short names that make it easier to use the CLI. For example, users often set an alias for a scratch org usernames because they're long and unintuitive. Check the --help of a CLI command to determine where you can use an alias.

You can associate an alias with only one value at a time. If you set an alias multiple times, the alias points to the most recent value. Aliases are global; after you set an alias, you can use it in any Salesforce DX project on your computer.

Use quotes to specify an alias value that contains spaces. You typically use an equal sign to set your alias, although you don't need it if you're setting a single alias in a command.

# examples

- Set an alias for a scratch org username:

  <%= config.bin %> <%= command.id %> my-scratch-org=test-sadbiytjsupn@example.com

- Set multiple aliases with a single command:

  <%= config.bin %> <%= command.id %> my-scratch-org=test-sadbiytjsupn@example.com my-other-scratch-org=test-ss0xut7txzxf@example.com

- Set an alias that contains spaces:

  <%= config.bin %> <%= command.id %> my-alias='alias with spaces'

- Set a single alias without using an equal sign:

  <%= config.bin %> <%= command.id %> my-scratch-org test-ss0xut7txzxf@example.com

# error.ArgumentsRequired

You must provide one or more aliases to set. Use the --help flag to see examples.

# error.ValueRequired

You must provide a value when setting an alias. Use `sf alias unset my-alias-name` to remove existing aliases.

# warning.spaceAlias

The alias "%s" includes a space. We recommend aliases without spaces.

If you decide to keep "%s", you must wrap it in double quotes when using it in any CLI command.  For example:  sf project deploy start --target-org "my scratch". 
