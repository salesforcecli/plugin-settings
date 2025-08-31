/*
 * Copyright 2025, Salesforce, Inc.
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
import { ConfigAggregator, Messages } from '@salesforce/core';
import {
  CONFIG_HELP_SECTION,
  calculateSuggestion,
  buildFailureMsg,
  buildSuccessMsg,
  output,
  ConfigResponses,
} from '../../config.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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
          const answer = await this.confirm({ message: messages.getMessage('didYouMean', [suggestion]) });
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
