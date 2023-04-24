/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, loglevel } from '@salesforce/sf-plugins-core';
import { Config, Messages, SfError } from '@salesforce/core';
import { CONFIG_HELP_SECTION, ConfigCommand } from '../../config';
import { SetConfigCommandResult } from './set';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.unset');

export class UnSet extends ConfigCommand<SetConfigCommandResult> {
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
  private unsetResponses: SetConfigCommandResult = { successes: [], failures: [] };

  public async run(): Promise<SetConfigCommandResult> {
    const { argv, flags } = await this.parse(UnSet);

    if (!argv || argv.length === 0) {
      throw messages.createError('error.NoConfigKeysFound');
    }
    const config: Config = await Config.create(Config.getDefaultOptions(flags.global));

    await config.read();
    for (const key of argv as string[]) {
      const resolvedName = this.configAggregator.getPropertyMeta(key)?.newKey ?? key;

      try {
        config.unset(resolvedName);
        this.unsetResponses.successes.push({ name: resolvedName, success: true });
      } catch (err) {
        const error = err as Error;
        if (error.name.includes('UnknownConfigKeyError') && !this.jsonEnabled()) {
          const suggestion = this.calculateSuggestion(key);
          // eslint-disable-next-line no-await-in-loop
          const answer = (await this.confirm(messages.getMessage('didYouMean', [suggestion]), 10 * 1000)) ?? false;
          if (answer) {
            config.unset(suggestion);
            this.unsetResponses.successes.push({
              name: suggestion,
              success: true,
              error,
              message: error.message.replace(/\.\.$/, '.'),
            });
          }
        } else {
          this.pushFailure(resolvedName, err as Error);
        }
      }
    }
    await config.write();
    this.responses = [...this.unsetResponses.successes, ...this.unsetResponses.failures];

    this.output('Unset Config', false);

    return this.unsetResponses;
  }

  protected pushFailure(name: string, err: string | Error, value?: string): void {
    const error = SfError.wrap(err);
    this.unsetResponses.failures.push({
      name,
      success: false,
      value,
      error,
      message: error.message.replace(/\.\.$/, '.'),
    });
    process.exitCode = 1;
  }
}
