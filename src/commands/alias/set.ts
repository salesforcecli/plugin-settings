/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand } from '@salesforce/sf-plugins-core';
import { Nullable } from '@salesforce/ts-types';
import { StateAggregator, Messages } from '@salesforce/core';

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

export type AliasSetResult = {
  alias: string;
  value?: Nullable<string>;
};

export default class AliasSet extends SfCommand<AliasSetResult[]> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');

  // This allows varargs
  // TODO: This causes issues with flag spelling mistakes. Typing `bin/dev alias set --hekp` takes '--hekp' as an arg and not an unknown flag
  public static readonly strict = false;

  public async run(): Promise<AliasSetResult[]> {
    const stateAggregator = await StateAggregator.getInstance();
    // TODO: add success: true ?
    // TODO: add example of `alias set foo bar` to both alias and config
    // TODO: add error to `config set`
    const args = await this.parseConfigKeysAndValues();

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

  // TODO: DRY this up! A good portion of this code is used in config:set
  protected async resolveArguments(): Promise<string[]> {
    // Filter out arguments that are defined in `static args = {}`
    // This is future proofing in case defined args are added later
    const { args, argv } = await this.parse(AliasSet);

    const argValues = Object.values(args);
    return argv.filter((val) => !argValues.includes(val));
  }

  protected async parseConfigKeysAndValues(): Promise<{ [index: string]: string }> {
    const configs: { [index: string]: string } = {};
    const args = await this.resolveArguments();

    if (!args.length) {
      throw messages.createError('error.ArgumentsRequired');
    }

    // Support `config set key value`
    if (args.length === 2 && !args[0].includes('=')) {
      return { [args[0]]: args[1] };
    }

    // Ensure that all args are in the right format (e.g. key=value key1=value1)
    args.forEach((arg) => {
      const split = arg.split('=');

      if (split.length !== 2) {
        throw messages.createError('error.InvalidArgumentFormat', [arg]);
      }

      const [name, value] = split;

      if (configs[name]) {
        throw messages.createError('error.DuplicateArgument', [name]);
      }

      if (value === '') {
        throw messages.createError('error.ValueRequired', [name]);
      }

      configs[name] = value || undefined;
    });

    return configs;
  }
}
