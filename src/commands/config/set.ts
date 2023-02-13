/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { parseVarArgs, Flags } from '@salesforce/sf-plugins-core';
import { Config, Messages, Org, SfError, OrgConfigProperties, SfdxConfigAggregator, Lifecycle } from '@salesforce/core';
import * as Levenshtein from 'fast-levenshtein';
import { CONFIG_HELP_SECTION, ConfigCommand, ConfigResponses } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'config.set', [
  'summary',
  'description',
  'examples',
  'flags.global.summary',
  'error.ArgumentsRequired',
  'error.ValueRequired',
]);

export class Set extends ConfigCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:config:set'];
  public static readonly deprecateAliases = true;
  public static readonly strict = false;
  public static readonly flags = {
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('flags.global.summary'),
    }),
  };

  public static configurationVariablesSection = CONFIG_HELP_SECTION;

  public async run(): Promise<ConfigResponses> {
    const { args, argv, flags } = await this.parse(Set);
    const config: Config = await loadConfig(flags.global);

    if (!argv.length) throw messages.createError('error.ArgumentsRequired');

    const parsed = parseVarArgs(args, argv as string[]);

    for (const name of Object.keys(parsed)) {
      const value = parsed[name];
      try {
        if (!value) {
          // Push a failure if users are try to unset a value with `set=`.
          this.pushFailure(name, messages.createError('error.ValueRequired'), value);
        } else {
          // core's builtin config validation requires synchronous functions but there's
          // currently no way to validate an org synchronously. Therefore, we have to manually
          // validate the org here and manually set the error message if it fails
          // eslint-disable-next-line no-await-in-loop
          if (isOrgKey(name) && value) await validateOrg(value);
          config.set(name, value);
          this.responses.push({ name, value, success: true });
        }
      } catch (err) {
        const error = err as Error;
        if (error.name === 'DeprecatedConfigKeyError') {
          const newKey = Config.getPropertyConfigMeta(name).key ?? name;
          try {
            config.set(newKey, value);
            this.responses.push({
              name,
              value,
              success: true,
              error,
              message: error.message.replace(/\.\.$/, '.'),
            });
          } catch (e) {
            const secondError = e as Error;
            void Lifecycle.getInstance().emitTelemetry({ event: 'DeprecatedConfigValueSet', key: name });
            this.warn(
              `The json output format will be changing in v58.0. Use the new key ${newKey} instead. The 'success','failures', and 'key' properties will be removed.`
            );
            // if that deprecated value was also set to an invalid value
            this.responses.push({
              // sf default of invalid config value e.g. org-metadata-rest-deploy=foo, it must be true/false
              name,
              key: name,
              success: false,
              value,
              error: secondError,
              message: secondError.message.replace(/\.\.$/, '.'),
              // add sfdx properties
              successes: [],
              failures: [{ name, message: secondError.message.replace(/\.\.$/, '.') }],
            });
          }
        } else if (error.name.includes('UnknownConfigKeyError')) {
          if (this.jsonEnabled()) {
            this.responses.push({ name, value, success: true, error, message: error.message.replace(/\.\.$/, '.') });
          } else {
            const suggestion = closest(name);
            // eslint-disable-next-line no-await-in-loop
            const answer = (await this.confirm(`did you mean: ${suggestion} (y/n)`, 10 * 1000)) ?? false;
            if (answer) {
              const key = Config.getPropertyConfigMeta(suggestion).key;
              config.set(key, value);
              this.responses.push({ name: key, value, success: true });
            }
          }
        } else {
          this.pushFailure(name, err as Error, value);
        }
      }
    }
    await config.write();
    if (!this.jsonEnabled()) {
      this.output('Set Config', false);
    }
    return this.responses;
  }
}

function closest(cmd: string): string {
  // we'll use this array to keep track of which key is the closest to the users entered value.
  // keys closer to the index 0 will be a closer guess than keys indexed further from 0
  // an entry at 0 would be a direct match, an entry at 1 would be a single character off, etc.
  const index: string[] = [];
  Object.keys(
    Config.getAllowedProperties()
      .map((k) => k.key)
      .map((k) => (index[Levenshtein.get(cmd, k)] = k))
  );
  return index.find((item) => item !== undefined);
}

const loadConfig = async (global: boolean): Promise<Config> => {
  try {
    await SfdxConfigAggregator.create({});
    const config = await Config.create(Config.getDefaultOptions(global));
    await config.read();
    return config;
  } catch (error) {
    if (error instanceof SfError) {
      error.actions = error.actions || [];
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
