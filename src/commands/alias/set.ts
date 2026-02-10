/*
 * Copyright 2026, Salesforce, Inc.
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

import { loglevel, parseVarArgs } from '@salesforce/sf-plugins-core';
import { StateAggregator, Messages } from '@salesforce/core';
import { AliasCommand, AliasResults, aliasErrorHandler } from '../../alias.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'alias.set');

export default class AliasSet extends AliasCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');
  public static readonly strict = false; // This allows varargs
  public static readonly aliases = ['force:alias:set'];
  public static readonly deprecateAliases = true;
  public static readonly flags = { loglevel };

  public async run(): Promise<AliasResults> {
    await this.parse(AliasSet);
    const stateAggregator = await StateAggregator.getInstance();

    const { args, argv } = await this.parse(AliasSet);

    if (!argv.length) throw messages.createError('error.ArgumentsRequired');

    const parsed = parseVarArgs(args, argv as string[]);

    const results = await Promise.all(
      Object.entries(parsed).map(async ([alias, value]) => {
        try {
          if (alias.includes(' ')) {
            this.warn(messages.getMessage('warning.spaceAlias', [alias, alias]));
          }
          // to support plugin-settings in sfdx, which allowed setting an alias to undefined, when that happens we'll unset the alias
          // which is what the user wants
          if (!value) {
            await stateAggregator.aliases.unsetAndSave(alias);
          } else {
            await stateAggregator.aliases.setAndSave(alias, value);
          }
          return { alias, success: true, value };
        } catch (err) {
          return aliasErrorHandler(err, alias, value);
        }
      })
    );

    this.output('Alias Set', results);

    return results;
  }
}
