# summary

Get the value of a configuration variable.

# description

Run "sf config list" to see the configuration variables you've already set and their level (local or global).

Run "sf config set" to set a configuration variable. For the full list of available configuration variables, see https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

# examples

- Get the value of the "target-org" configuration variable.

  <%= config.bin %> <%= command.id %> target-org

- Get multiple configuration variables and display whether they're set locally or globally:

  <%= config.bin %> <%= command.id %> target-org api-version --verbose

# flags.verbose.summary

Display whether the configuration variables are set locally or globally.

# error.NoConfigKeysFound

You must provide one or more configuration variables to get. Run "sf config list" to see the configuration variables you've previously set.

# didYouMean

Did you mean %s?
