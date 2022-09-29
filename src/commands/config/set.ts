/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { Config, Messages, Org, SfdxError, OrgConfigProperties } from '@salesforce/core';
import { CONFIG_HELP_SECTION, ConfigCommand, ConfigResponses } from '../../config';
import validateArgs from '../../shared/validate-args';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.set');

export class Set extends ConfigCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');

  public static readonly strict = false;

  public static readonly flags = {
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('flags.global.summary'),
    }),
  };

  public static configurationVariablesSection = CONFIG_HELP_SECTION;

  public async run(): Promise<ConfigResponses> {
    const parsed = await this.parse(Set);
    const config: Config = await loadConfig(parsed.flags.global);
    const args = validateArgs(parsed, messages);

    for (const name of Object.keys(args)) {
      const value = args[name];
      try {
        // core's builtin config validation requires synchronous functions but there's
        // currently no way to validate an org synchronously. Therefore, we have to manually
        // validate the org here and manually set the error message if it fails
        // eslint-disable-next-line no-await-in-loop
        if (isOrgKey(name) && value) await validateOrg(value);
        config.set(name, value);
        this.responses.push({ name, value, success: true });
      } catch (err) {
        this.pushFailure(name, err as Error, value);
      }
    }
    await config.write();
    if (!this.jsonEnabled()) {
      this.output('Set Config', false);
    }
    return this.responses;
  }
}

const loadConfig = async (global: boolean): Promise<Config> => {
  try {
    const config = await Config.create(Config.getDefaultOptions(global));
    await config.read();
    return config;
  } catch (error) {
    if (error instanceof SfdxError) {
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
