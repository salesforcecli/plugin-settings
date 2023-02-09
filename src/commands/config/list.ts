/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigAggregator, Messages, SfdxConfigAggregator } from '@salesforce/core';
import { ConfigCommand, ConfigResponses } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.list');

export default class List extends ConfigCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:config:list'];
  public static readonly deprecateAliases = true;
  public static flags = {};

  public async run(): Promise<ConfigResponses> {
    await SfdxConfigAggregator.create({});
    const aggregator = await ConfigAggregator.create();

    aggregator.getConfigInfo().forEach((c) => {
      this.pushSuccess(c);
    });

    if (!this.jsonEnabled()) {
      this.output('List Config', true);
    }
    return this.responses;
  }
}
