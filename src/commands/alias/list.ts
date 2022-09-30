/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages } from '@salesforce/core';
import { AliasResults } from '../../types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.list', ['summary', 'description', 'examples']);
export default class AliasList extends SfCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  public async run(): Promise<AliasResults> {
    const stateAggregator = await StateAggregator.getInstance();
    const aliases = stateAggregator.aliases.getAll();

    const results = Object.keys(aliases).map((key) => ({ alias: key, value: aliases[key] }));

    const columns = {
      alias: { header: 'Alias' },
      value: { header: 'Value' },
    };

    if (results.length === 0) {
      this.warn('No aliases found');
    } else {
      this.table(results, columns, { title: 'Alias List', 'no-truncate': true });
    }

    return results;
  }
}
