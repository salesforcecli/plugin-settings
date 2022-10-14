# summary

Set one or more aliases.

# description

You can associate an alias with only one value at a time. If you’ve set an alias multiple times, the alias points to the most recent value.

# examples

- <%= config.bin %> <%= command.id %>

- Set an alias for a scratch org username:
  <%= config.bin %> <%= command.id %> my-alias=username@example.com

- Set multiple aliases with a single command:
  <%= config.bin %> <%= command.id %> my-alias=username@example.com my-other-alias=devhub@example.com

- Set an alias that contains spaces:
  <%= config.bin %> <%= command.id %> my-alias='alias with spaces'

- Single aliases can be set without an equal sign
  <%= config.bin %> <%= command.id %> my-alias username@example.com

# error.ArgumentsRequired

You must provide one or more aliases to set. Use the --help flag to see more examples.

# error.ValueRequired

You must provide a value when setting an alias. Use `sf alias unset my-alias-name` to remove existing aliases.
