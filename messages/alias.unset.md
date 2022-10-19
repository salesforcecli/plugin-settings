# summary

Unset one or more aliases that are currently set on your local computer.

# description

Aliases are global, so when you unset one it's no longer available in any Salesforce DX project.

# flags.all.summary

Unset all currently set aliases.

# flags.no-prompt.summary

Don't prompt the user for confirmation when unsetting all aliases.

# examples

- Unset an alias:

  <%= config.bin %> <%= command.id %> my-alias

- Unset multiple aliases with a single command:

  <%= config.bin %> <%= command.id %> my-alias my-other-alias

- Unset all aliases:

  <%= config.bin %> <%= command.id %> --all [--no-prompt]

# error.NameRequired

You must provide an alias name when unsetting an alias.

# warning.NoAliasesSet

The `--all` flag was passed, but no aliases are currently set. Exiting.

# prompt.RemoveAllAliases

Are you sure you want to unset all aliases?
