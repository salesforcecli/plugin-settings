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

import { Flags, loglevel, SfCommand, Ux } from '@salesforce/sf-plugins-core';
import { Config, Messages } from '@salesforce/core';
import { CONFIG_HELP_SECTION, buildFailureMsg, calculateSuggestion, output } from '../../config.js';
import { SetOrUnsetConfigCommandResult } from './set.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.unset');

export class UnSet extends SfCommand<SetOrUnsetConfigCommandResult> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly strict = false;
  public static readonly aliases = ['force:config:unset'];
  public static readonly deprecateAliases = true;
  public static configurationVariablesSection = CONFIG_HELP_SECTION;
  public static readonly flags = {
    loglevel,
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('flags.global.summary'),
    }),
  };
  private responses: SetOrUnsetConfigCommandResult = { successes: [], failures: [] };

  public async run(): Promise<SetOrUnsetConfigCommandResult> {
    const { argv, flags } = await this.parse(UnSet);

    if (!argv || argv.length === 0) {
      throw messages.createError('error.NoConfigKeysFound');
    }
    const config = await Config.create(Config.getDefaultOptions(flags.global));
    const globalConfig = flags.global ? config : await Config.create(Config.getDefaultOptions(true));

    await globalConfig.read();
    await config.read();
    for (const key of argv as string[]) {
      try {
        const resolvedName = this.configAggregator.getPropertyMeta(key)?.newKey ?? key;
        config.unset(resolvedName);

        if (!flags.global && globalConfig.has(resolvedName)) {
          // If the config var is still set globally after an unset and the user didn't have the `--global` flag set, warn them.
          this.warn(messages.getMessage('unsetGlobalWarning', [resolvedName]));
        }
        this.responses.successes.push({ name: resolvedName, success: true });
      } catch (error) {
        if (error instanceof Error && error.name.includes('UnknownConfigKeyError') && !this.jsonEnabled()) {
          const suggestion = calculateSuggestion(key);
          // eslint-disable-next-line no-await-in-loop
          const answer = await this.confirm({ message: messages.getMessage('didYouMean', [suggestion]) });
          if (answer) {
            config.unset(suggestion);
            this.responses.successes.push({
              name: suggestion,
              success: true,
            });
          }
        } else {
          this.responses.failures.push(buildFailureMsg(key, error));
          process.exitCode = 1;
        }
      }
    }
    await config.write();

    output(
      new Ux({ jsonEnabled: this.jsonEnabled() }),
      [...this.responses.successes, ...this.responses.failures],
      'unset'
    );

    return this.responses;
  }
}
