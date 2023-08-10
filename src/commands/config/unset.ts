/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel, SfCommand, Ux } from '@salesforce/sf-plugins-core';
import { Config, Messages } from '@salesforce/core';
import { CONFIG_HELP_SECTION, buildFailureMsg, calculateSuggestion, output } from '../../config';
import { SetOrUnsetConfigCommandResult } from './set';

Messages.importMessagesDirectory(__dirname);
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

    await config.read();
    for (const key of argv as string[]) {
      try {
        const resolvedName = this.configAggregator.getPropertyMeta(key)?.newKey ?? key;
        config.unset(resolvedName);

        if (!flags.global && this.configAggregator.getLocation(resolvedName) === 'Global') {
          // If the config var is still set globally after an unset and the user didn't have the `--global` flag set, warn them.
          this.warn(messages.getMessage('unsetGlobalWarning', [resolvedName]));
        }
        this.responses.successes.push({ name: resolvedName, success: true });
      } catch (error) {
        if (error instanceof Error && error.name.includes('UnknownConfigKeyError') && !this.jsonEnabled()) {
          const suggestion = calculateSuggestion(key);
          // eslint-disable-next-line no-await-in-loop
          const answer = (await this.confirm(messages.getMessage('didYouMean', [suggestion]), 10 * 1000)) ?? false;
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
