/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags, loglevel } from '@salesforce/sf-plugins-core';
import { ConfigAggregator, Messages } from '@salesforce/core';
import { ConfigCommand, ConfigResponses, CONFIG_HELP_SECTION } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.get');

export class Get extends ConfigCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:config:get'];
  public static readonly deprecateAliases = true;
  public static readonly strict = false;
  public static readonly flags = {
    loglevel,
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public static configurationVariablesSection = CONFIG_HELP_SECTION;

  public async run(): Promise<ConfigResponses> {
    const { argv, flags } = await this.parse(Get);
    if (!argv || argv.length === 0) {
      throw messages.createError('error.NoConfigKeysFound');
    }

    const aggregator = await ConfigAggregator.create();

    for (const configName of argv as string[]) {
      try {
        this.pushSuccess(aggregator.getInfo(configName));
      } catch (err) {
        const error = err as Error;
        if (error.name.includes('UnknownConfigKeyError') && !this.jsonEnabled()) {
          const suggestion = this.calculateSuggestion(configName);
          // eslint-disable-next-line no-await-in-loop
          const answer = (await this.confirm(messages.getMessage('didYouMean', [suggestion]), 10 * 1000)) ?? false;
          if (answer) {
            this.pushSuccess(aggregator.getInfo(suggestion, false));
          }
        } else {
          this.pushFailure(configName, err as Error);
        }
      }
    }

    this.output('Get Config', flags.verbose);

    return this.responses;
  }
}
