# summary

Unset local or global configuration variables.

# description

Local configuration variables apply only to your current project. Global configuration variables apply in any Salesforce DX project.

For the full list of available configuration variables, see https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

# examples

- Unset the local "target-org" configuration variable:

  <%= config.bin %> <%= command.id %> target-org

- Unset multiple configuration variables globally:

  <%= config.bin %> <%= command.id %> target-org api-version --global

# flags.global.summary

Unset the configuration variables globally.

# error.NoConfigKeysFound

You must provide one or more configuration variables to unset. Run "sf config list" to see the configuration variables you've previously set.

# didYouMean

Did you mean %s?

# unsetGlobalWarning

The %s config variable is still set globally, unset it by using the --global flag.
