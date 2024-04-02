/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
