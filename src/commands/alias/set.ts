/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { parseVarArgs } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages, SfError } from '@salesforce/core';
import { AliasCommand, AliasResults } from '../../alias';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.set', [
  'summary',
  'description',
  'examples',
  'error.ArgumentsRequired',
  'error.ValueRequired',
]);

export default class AliasSet extends AliasCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  public static readonly strict = false; // This allows varargs
  public static readonly state = 'beta';

  public async run(): Promise<AliasResults> {
    const stateAggregator = await StateAggregator.getInstance();

    const { args, argv } = await this.parse(AliasSet);

    if (!argv.length) throw messages.createError('error.ArgumentsRequired');

    const parsed = parseVarArgs(args, argv as string[]);

    const results = Object.entries(parsed).map(([alias, value]) => {
      try {
        if (!value) {
          return { alias, success: false, error: messages.createError('error.ValueRequired'), value };
        } else {
          stateAggregator.aliases.set(alias, value);
          return { alias, success: true, value };
        }
      } catch (err) {
        const error = err as SfError;
        return { alias, success: false, error, value };
      }
    });

    await stateAggregator.aliases.write();

    this.output('Alias Set', results);

    return results;
  }
}
