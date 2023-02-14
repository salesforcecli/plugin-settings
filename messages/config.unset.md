# summary

Unset local or global configuration variables.

# description

Local configuration variables apply only to your current project. Global configuration variables apply in any Salesforce DX project.

# examples

- Unset the local "target-org" configuration variable:

  <%= config.bin %> <%= command.id %> target-org

- Unset multiple configuration variables globally:

  <%= config.bin %> <%= command.id %> target-org api-version --global

# flags.global.summary

Unset the configuration variables globally, so they can no longer be used from any Salesforce DX project.

# error.NoConfigKeysFound

You must provide one or more configuration variables to unset. Run "sf config list" to see the configuration variables you've previously set.

# didYouMean

Did you mean %s?
