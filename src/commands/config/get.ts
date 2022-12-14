/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@salesforce/sf-plugins-core';
import { ConfigAggregator, Messages } from '@salesforce/core';
import { ConfigCommand, ConfigResponses, CONFIG_HELP_SECTION } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.get');

export class Get extends ConfigCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly strict = false;
  public static readonly flags = {
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public static configurationVariablesSection = CONFIG_HELP_SECTION;

  public async run(): Promise<ConfigResponses> {
    const { argv, flags } = await this.parse(Get);

    if (!argv || argv.length === 0) {
      throw messages.createError('error.NoConfigKeysFound');
    } else {
      const aggregator = await ConfigAggregator.create();

      argv.forEach((configName) => {
        try {
          this.pushSuccess(aggregator.getInfo(configName, true));
        } catch (err) {
          this.pushFailure(configName, err as Error);
        }
      });

      if (!this.jsonEnabled()) {
        this.output('Get Config', flags.verbose);
      }
      return this.responses;
    }
  }
}
