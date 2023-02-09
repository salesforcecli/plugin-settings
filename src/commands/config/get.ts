/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@salesforce/sf-plugins-core';
import { ConfigAggregator, Messages, SfdxConfigAggregator } from '@salesforce/core';
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
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public static configurationVariablesSection = CONFIG_HELP_SECTION;

  public async run(): Promise<ConfigResponses> {
    const { argv, flags } = await this.parse(Get);
    // instantiate a SfdxConfigAggregator to get the restDeploy <-> org-metadata-rest-deploy deprecation linked
    await SfdxConfigAggregator.create({});

    if (!argv || argv.length === 0) {
      throw messages.createError('error.NoConfigKeysFound');
    } else {
      const aggregator = await ConfigAggregator.create();

      (argv as string[]).forEach((configName) => {
        try {
          this.pushSuccess(aggregator.getInfo(configName, true));
        } catch (err) {
          const error = err as Error;
          if (error.message.includes('Deprecated config name')) {
            const info = aggregator.getInfo(aggregator.getPropertyMeta(configName).newKey);
            // deprecated key, so we'll get the replacement and return the value
            this.responses.push({
              name: info.key,
              key: configName,
              value: info.value as string,
              deprecated: true,
              location: info.location,
              path: info.path,
              error,
              message: error.message,
              success: true,
            });
          } else {
            this.pushFailure(configName, err as Error);
          }
        }
      });

      if (!this.jsonEnabled()) {
        this.output('Get Config', flags.verbose);
      }
      return this.responses;
    }
  }
}
