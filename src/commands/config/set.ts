/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { parseVarArgs, Flags, loglevel, Ux, SfCommand } from '@salesforce/sf-plugins-core';
import { Config, Messages, Org, SfError, OrgConfigProperties } from '@salesforce/core';
import { CONFIG_HELP_SECTION, Msg, buildFailureMsg, calculateSuggestion, output } from '../../config.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.set');

export type SetOrUnsetConfigCommandResult = { successes: Msg[]; failures: Msg[] };

export class Set extends SfCommand<SetOrUnsetConfigCommandResult> {
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

  public async run(): Promise<SetOrUnsetConfigCommandResult> {
    const { args, argv, flags } = await this.parse(Set);
    const config: Config = await loadConfig(flags.global);
    const responses: SetOrUnsetConfigCommandResult = { successes: [], failures: [] };

    if (!argv.length) throw messages.createError('error.ArgumentsRequired');

    const parsed = parseVarArgs(args, argv as string[]);

    for (const [name, value] of Object.entries(parsed)) {
      let resolvedName = name;
      try {
        // this needs to be inside the try/catch because it can throw an error
        resolvedName = this.configAggregator.getPropertyMeta(name)?.newKey ?? name;
        if (!value) {
          // Push a failure if users are try to unset a value with `set=`.
          responses.failures.push(buildFailureMsg(name, messages.createError('error.ValueRequired'), value));
        } else {
          // core's builtin config validation requires synchronous functions but there's
          // currently no way to validate an org synchronously. Therefore, we have to manually
          // validate the org here and manually set the error message if it fails
          // eslint-disable-next-line no-await-in-loop
          if (isOrgKey(resolvedName) && value) await validateOrg(value);
          config.set(resolvedName, value);
          responses.successes.push({ name: resolvedName, value, success: true });
        }
      } catch (error) {
        if (error instanceof Error && error.name.includes('UnknownConfigKeyError')) {
          if (this.jsonEnabled()) {
            responses.failures.push(buildFailureMsg(resolvedName, error, value));
          } else {
            const suggestion = calculateSuggestion(name);
            // eslint-disable-next-line no-await-in-loop
            const answer = (await this.confirm({ message: messages.getMessage('didYouMean', [suggestion]) })) ?? false;
            if (answer && value) {
              const key = Config.getPropertyConfigMeta(suggestion)?.key ?? suggestion;
              config.set(key, value);
              responses.successes.push({ name: key, value, success: true });
            }
          }
        } else {
          responses.failures.push(buildFailureMsg(resolvedName, error, value));
        }
      }
    }
    await config.write();
    if (responses.failures.length) {
      process.exitCode = 1;
    }
    output(new Ux({ jsonEnabled: this.jsonEnabled() }), [...responses.successes, ...responses.failures], 'set');

    return responses;
  }
}

const loadConfig = async (global: boolean): Promise<Config> => {
  try {
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
