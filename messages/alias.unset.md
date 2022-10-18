# summary

Unset one or more aliases.

# description

Use this command to remove aliases that are currently set on your machine.

# flags.all.summary

Remove all currently set aliases.

# flags.no-prompt.summary

Don't prompt the user to confirm the deletion.

# examples

- Unset an alias:
  <%= config.bin %> <%= command.id %> my-alias
- Unset multiple aliases with a single command:
  <%= config.bin %> <%= command.id %> my-alias my-other-alias
- Unset ALL aliases:
  <%= config.bin %> <%= command.id %> --all [--no-prompt]

# error.NameRequired

You must provide an alias name when removing an alias.

# warning.NoAliasesSet

The `--all` flag was passed, but no aliases are currently set. Exiting.

# prompt.RemoveAllAliases

Remove all aliases?
