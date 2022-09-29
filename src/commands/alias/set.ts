/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages } from '@salesforce/core';
import validateArgs from '../../shared/validate-args';
import { AliasResults } from '../../types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.set', [
  'summary',
  'description',
  'examples',
  'error.ArgumentsRequired',
  'error.DuplicateArgument',
  'error.InvalidArgumentFormat',
  'error.ValueRequired',
]);

export default class AliasSet extends SfCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  // This allows varargs
  // TODO: This causes issues with flag spelling mistakes. Typing `bin/dev alias set --hekp` takes '--hekp' as an arg and not an unknown flag
  public static readonly strict = false;

  public async run(): Promise<AliasResults> {
    const stateAggregator = await StateAggregator.getInstance();

    const parsed = await this.parse(AliasSet);
    const args = validateArgs(parsed, messages);

    const results = Object.keys(args).map((key) => {
      const value = args[key];
      stateAggregator.aliases.set(key, value ?? 'undefined');
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
