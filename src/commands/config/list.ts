/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { ConfigAggregator, Messages } from '@salesforce/core';
import { loglevel, SfCommand, Ux } from '@salesforce/sf-plugins-core';
import { ConfigResponses, buildSuccessMsg, output } from '../../config.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.list');

export default class List extends SfCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:config:list'];
  public static readonly deprecateAliases = true;
  public static readonly flags = { loglevel };

  public async run(): Promise<ConfigResponses> {
    const aggregator = await ConfigAggregator.create();

    const responses = aggregator.getConfigInfo().map((c) => buildSuccessMsg(c));

    output(new Ux({ jsonEnabled: this.jsonEnabled() }), responses, 'list', true);

    return responses;
  }
}
