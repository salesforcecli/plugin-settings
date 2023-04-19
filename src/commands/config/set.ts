/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { parseVarArgs, Flags, loglevel } from '@salesforce/sf-plugins-core';
import { Config, Messages, Org, SfError, OrgConfigProperties, SfdxConfigAggregator } from '@salesforce/core';
import { CONFIG_HELP_SECTION, ConfigCommand, Msg } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.set');

export type SetConfigCommandResult = { successes: Msg[]; failures: Msg[] };

export class Set extends ConfigCommand<SetConfigCommandResult> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:config:set'];
  public static readonly deprecateAliases = true;
  public static readonly strict = false;
  public static readonly flags = {
    loglevel,
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('flags.global.summary'),
    }),
  };

  public static configurationVariablesSection = CONFIG_HELP_SECTION;
  private setResponses: SetConfigCommandResult = { successes: [], failures: [] };

  public async run(): Promise<SetConfigCommandResult> {
    const { args, argv, flags } = await this.parse(Set);
    const config: Config = await loadConfig(flags.global);

    if (!argv.length) throw messages.createError('error.ArgumentsRequired');

    const parsed = parseVarArgs(args, argv as string[]);

    for (const name of Object.keys(parsed)) {
      const value = parsed[name] as string;
      const resolvedName = this.configAggregator.getPropertyMeta(name)?.newKey ?? name;
      // const resolvedName = Config.getAllowedProperties().find((p) => p.key === name)?.newKey ?? name;
      try {
        if (!value) {
          // Push a failure if users are try to unset a value with `set=`.
          this.pushFailure(name, messages.createError('error.ValueRequired'), value);
        } else {
          // core's builtin config validation requires synchronous functions but there's
          // currently no way to validate an org synchronously. Therefore, we have to manually
          // validate the org here and manually set the error message if it fails
          // eslint-disable-next-line no-await-in-loop
          if (isOrgKey(resolvedName) && value) await validateOrg(value);
          config.set(resolvedName, value);
          this.setResponses.successes.push({ name: resolvedName, value, success: true });
        }
      } catch (err) {
        const error = err as Error;
        if (error.name.includes('UnknownConfigKeyError')) {
          if (this.jsonEnabled()) {
            process.exitCode = 1;
            this.setResponses.failures.push({
              name: resolvedName,
              value,
              success: false,
              error,
              message: error.message.replace(/\.\.$/, '.'),
            });
          } else {
            const suggestion = this.calculateSuggestion(name);
            // eslint-disable-next-line no-await-in-loop
            const answer = (await this.confirm(messages.getMessage('didYouMean', [suggestion]), 10 * 1000)) ?? false;
            if (answer) {
              const key = Config.getPropertyConfigMeta(suggestion)?.key ?? suggestion;
              config.set(key, value);
              this.setResponses.successes.push({ name: key, value, success: true });
            }
          }
        } else {
          this.pushFailure(resolvedName, err as Error, value);
        }
      }
    }
    await config.write();
    if (!this.jsonEnabled()) {
      this.responses = [...this.setResponses.successes, ...this.setResponses.failures];
      this.output('Set Config', false);
    }
    return this.setResponses;
  }

  protected pushFailure(name: string, err: string | Error, value?: string): void {
    const error = SfError.wrap(err);
    this.setResponses.failures.push({
      name,
      success: false,
      value,
      error,
      message: error.message.replace(/\.\.$/, '.'),
    });
    process.exitCode = 1;
  }
}

const loadConfig = async (global: boolean): Promise<Config> => {
  try {
    await SfdxConfigAggregator.create({});
    const config = await Config.create(Config.getDefaultOptions(global));
    await config.read();
    return config;
  } catch (error) {
    if (error instanceof SfError) {
      error.actions = error.actions ?? [];
      error.actions.push('Run with --global to set for your entire workspace.');
    }
    throw error;
  }
};

const isOrgKey = (name: string): boolean =>
  [OrgConfigProperties.TARGET_DEV_HUB as string, OrgConfigProperties.TARGET_ORG as string].includes(name);

const validateOrg = async (value: string): Promise<void> => {
  try {
    await Org.create({ aliasOrUsername: value });
  } catch {
    throw new Error(`Invalid config value: org "${value}" is not authenticated.`);
  }
};
