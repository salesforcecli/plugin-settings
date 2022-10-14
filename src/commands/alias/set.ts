/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, parseVarArgs } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages } from '@salesforce/core';
import { AliasResults } from '../../types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.set', [
  'summary',
  'description',
  'examples',
  'error.ArgumentsRequired',
  'error.ValueRequired',
]);

export default class AliasSet extends SfCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  // This allows varargs
  public static readonly strict = false;

  public async run(): Promise<AliasResults> {
    const stateAggregator = await StateAggregator.getInstance();

    const { args, argv } = await this.parse(AliasSet);

    if (!argv.length) throw messages.createError('error.ArgumentsRequired');

    const parsed = parseVarArgs(args, argv);

    const results = Object.keys(parsed).map((key) => {
      const value = parsed[key];
      if (!value) throw messages.createError('error.ValueRequired');
      stateAggregator.aliases.set(key, value);
      return { alias: key, value };
    });

    await stateAggregator.aliases.write();

    const columns = {
      alias: { header: 'Alias' },
      value: { header: 'Value' },
    };

    this.table(results, columns, { title: 'Alias Set' });

    return results;
  }
}
