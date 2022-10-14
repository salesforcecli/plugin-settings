/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages, SfError } from '@salesforce/core';
import { AliasResults } from '../../types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.unset', [
  'summary',
  'description',
  'examples',
  'flags.all.summary',
  'flags.no-prompt.summary',
  'error.NameRequired',
  'warning.NoAliasesSet',
  'warning.AliasIsNotSet',
]);

export default class AliasUnset extends SfCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');
  public static readonly strict = false; // This allows varargs

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

    if (flags.all && !flags['no-prompt'] && !(await this.confirm('Remove all aliases?'))) {
      return;
    }

    const results: AliasResults = [];

    toRemove.forEach((alias) => {
      // We will log the value in the output in case an alias was unset by mistake.
      const value = aliases[alias];
      try {
        if (value === undefined) {
          this.warn(messages.getMessage('warning.AliasIsNotSet', [alias]));
        } else {
          stateAggregator.aliases.unset(alias);
          results.push({ alias, value, success: true });
        }
      } catch (err) {
        const error = err as SfError;
        process.exitCode = 1;
        results.push({ alias, value, success: false, error });
      }
    });

    await stateAggregator.aliases.write();

    const columns = {
      alias: { header: 'Alias' },
      value: { header: 'Value' },
      success: { header: 'Success' },
    };

    if (results.length === 0) {
      this.warn('No aliases unset');
    } else {
      this.table(results, columns, { title: 'Alias Unset', 'no-truncate': true });
    }

    return results;
  }
}
