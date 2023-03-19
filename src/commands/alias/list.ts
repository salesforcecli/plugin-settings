/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { StateAggregator, Messages } from '@salesforce/core';
import { loglevel } from '@salesforce/sf-plugins-core';
import { AliasCommand, AliasResults } from '../../alias';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'alias.list');
export default class AliasList extends AliasCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');
  public static readonly aliases = ['force:alias:list'];
  public static readonly deprecateAliases = true;
  public static readonly flags = { loglevel };
  public async run(): Promise<AliasResults> {
    await this.parse(AliasList);
    const stateAggregator = await StateAggregator.getInstance();
    const aliases = stateAggregator.aliases.getAll();

    const results = Object.entries(aliases).map(([alias, value]) => ({ alias, value }));

    this.output('Alias List', results);

    return results;
  }
}
