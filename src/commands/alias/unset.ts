/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages, SfError } from '@salesforce/core';
import { AliasCommand, AliasResults } from '../../alias';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.unset', [
  'summary',
  'description',
  'examples',
  'flags.all.summary',
  'flags.no-prompt.summary',
  'error.NameRequired',
  'warning.NoAliasesSet',
  'prompt.RemoveAllAliases',
]);

export default class AliasUnset extends AliasCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  public static readonly strict = false; // This allows varargs
  public static readonly state = 'beta';

  public static flags = {
    all: Flags.boolean({
      summary: messages.getMessage('flags.all.summary'),
      char: 'a',
    }),
    'no-prompt': Flags.boolean({
      summary: messages.getMessage('flags.no-prompt.summary'),
      char: 'p',
    }),
  };

  public async run(): Promise<AliasResults> {
    const { flags, argv } = await this.parse(AliasUnset);

    const stateAggregator = await StateAggregator.getInstance();
    const aliases = stateAggregator.aliases.getAll();

    const toRemove = flags.all ? Object.keys(aliases) : argv;

    if (toRemove.length === 0) {
      if (flags.all) {
        this.warn(messages.getMessage('warning.NoAliasesSet'));
        return [];
      }
      // No arg was passed, we don't know what to unset.
      throw messages.createError('error.NameRequired');
    }

    // Confirm the users wants to remove all aliases. Supports --no-prompt.
    if (flags.all && !flags['no-prompt'] && !(await this.confirm(messages.getMessage('prompt.RemoveAllAliases')))) {
      return;
    }

    const results = toRemove.map((alias) => {
      // We will log the value in the output in case an alias was unset by mistake.
      const value = aliases[alias];
      try {
        stateAggregator.aliases.unset(alias);
        return { alias, value, success: true };
      } catch (err) {
        const error = err as SfError;
        return { alias, value, success: false, error };
      }
    });

    await stateAggregator.aliases.write();

    this.output('Alias Unset', results);

    return results;
  }
}
