/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import { Flags, loglevel, SfCommand, Ux } from '@salesforce/sf-plugins-core';
import { ConfigAggregator, Messages } from '@salesforce/core';
import {
  CONFIG_HELP_SECTION,
  calculateSuggestion,
  buildFailureMsg,
  buildSuccessMsg,
  output,
  ConfigResponses,
} from '../../config.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.get');

export class Get extends SfCommand<ConfigResponses> {
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
    const responses: ConfigResponses = [];
    if (!argv || argv.length === 0) {
      throw messages.createError('error.NoConfigKeysFound');
    }

    const aggregator = await ConfigAggregator.create();

    for (const configName of argv as string[]) {
      try {
        responses.push(buildSuccessMsg(aggregator.getInfo(configName)));
      } catch (err) {
        if (err instanceof Error && err.name.includes('UnknownConfigKeyError') && !this.jsonEnabled()) {
          const suggestion = calculateSuggestion(configName);
          // eslint-disable-next-line no-await-in-loop
          const answer = (await this.confirm(messages.getMessage('didYouMean', [suggestion]), 10 * 1000)) ?? false;
          if (answer) {
            responses.push(buildSuccessMsg(aggregator.getInfo(suggestion, false)));
          }
        } else {
          responses.push(buildFailureMsg(configName, err));
          process.exitCode = 1;
        }
      }
    }

    output(new Ux({ jsonEnabled: this.jsonEnabled() }), responses, 'get', flags.verbose);
    return responses;
  }
}
