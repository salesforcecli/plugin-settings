# summary

List the configuration variables that you've previously set.

# description

Global configuration variables apply to any Salesforce DX project and are always displayed. If you run this command from a project directory, local configuration variables are also displayed.

For the full list of available configuration variables, see https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

# examples

- List both global configuration variables and those local to your project:

  $ <%= config.bin %> <%= command.id %>
