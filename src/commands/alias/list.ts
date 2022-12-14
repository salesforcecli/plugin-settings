/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { StateAggregator, Messages } from '@salesforce/core';
import { AliasCommand, AliasResults } from '../../alias';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.list', ['summary', 'description', 'examples']);
export default class AliasList extends AliasCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  public static readonly state = 'beta';

  public async run(): Promise<AliasResults> {
    const stateAggregator = await StateAggregator.getInstance();
    const aliases = stateAggregator.aliases.getAll();

    const results = Object.entries(aliases).map(([alias, value]) => ({ alias, value }));

    this.output('Alias List', results);

    return results;
  }
}
