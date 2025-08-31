/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Flags, loglevel } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages } from '@salesforce/core';
import { AliasCommand, AliasResults, aliasErrorHandler } from '../../alias.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'alias.unset');

export default class AliasUnset extends AliasCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');
  public static readonly strict = false; // This allows varargs
  public static readonly aliases = ['force:alias:unset'];
  public static readonly deprecateAliases = true;
  public static flags = {
    loglevel,
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

    const toRemove = flags.all ? Object.keys(aliases) : (argv as string[]);

    if (toRemove.length === 0) {
      if (flags.all) {
        this.warn(messages.getMessage('warning.NoAliasesSet'));
        return [];
      }
      // No arg was passed, we don't know what to unset.
      throw messages.createError('error.NameRequired');
    }

    // Confirm the users wants to remove all aliases. Supports --no-prompt.
    if (
      flags.all &&
      !flags['no-prompt'] &&
      !(await this.confirm({ message: messages.getMessage('prompt.RemoveAllAliases') }))
    ) {
      return [];
    }

    const results = await Promise.all(
      toRemove
        // We will log the value in the output in case an alias was unset by mistake.
        .map((alias) => ({ alias, value: aliases[alias] }))
        .map(async ({ alias, value }) => {
          try {
            // safe to parallelize because of file locking
            await stateAggregator.aliases.unsetAndSave(alias);
            return { alias, value, success: true };
          } catch (err) {
            return aliasErrorHandler(err, alias, value);
          }
        })
    );

    this.output('Alias Unset', results);

    return results;
  }
}
