# summary

Set one or more configuration variables, such as your default org.

# description

Use configuration variables to set CLI defaults, such as your default org or the API version you want the CLI to use. For example, if you set the "target-org" configuration variable, you don't need to specify it as a "sf deploy metadata" flag if you're deploying to your default org.

Local configuration variables apply only to your current project. Global variables, specified with the --global flag, apply in any Salesforce DX project.

The resolution order if you've set a flag value in multiple ways is as follows:

    1. Flag value specified at the command line.
    2. Local (project-level) configuration variable.
    3. Global configuration variable.

Run "sf config list" to see the configuration variables you've already set and their level (local or global).

If you're setting a single config variable, you don't need to use an equal sign between the variable and value. But you must use the equal sign if setting multiple config variables.

For the full list of available configuration variables, see https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_config_values.htm.

# examples

- Set the local target-org configuration variable to an org username:

  <%= config.bin %> <%= command.id %> target-org me@my.org

- Set the local target-org configuration variable to an alias:

  <%= config.bin %> <%= command.id %> target-org my-scratch-org

- Set the global target-org and target-dev-hub configuration variables using aliases:

  <%= config.bin %> <%= command.id %> --global target-org=my-scratch-org target-dev-hub=my-dev-hub

# flags.global.summary

Set the configuration variables globally, so they can be used from any Salesforce DX project.

# error.ArgumentsRequired

You must provide one or more configuration variables to set. Use the --help flag to view the available configuration variables.

# error.ValueRequired

You must provide a value when setting a config. Use `sf config unset the-config-name` to unset existing configs.

# didYouMean

Did you mean %s?
