/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand } from '@salesforce/sf-plugins-core';
import { ux } from '@oclif/core';
import { ConfigInfo, SfError, Config } from '@salesforce/core';
import { toHelpSection } from '@salesforce/sf-plugins-core';
import * as Levenshtein from 'fast-levenshtein';

export type Msg = {
  name: string;
  value?: string;
  success: boolean;
  location?: string;
  path?: string;
  message?: string;
  error?: Error;
  // added to support plugin-config in sfdx
  successes?: Array<{ message?: string; name: string }>;
  failures?: Array<{ message?: string; name: string }>;
  key?: string;
  deprecated?: boolean;
};

export type ConfigResponses = Msg[];

export const CONFIG_HELP_SECTION = toHelpSection(
  'CONFIGURATION VARIABLES',
  ...new Set(Config.getAllowedProperties().map((k) => k.newKey ?? k.key))
);

export abstract class ConfigCommand<T> extends SfCommand<T> {
  protected responses: ConfigResponses = [];
  // eslint-disable-next-line class-methods-use-this
  public calculateSuggestion(userEnteredConfig: string): string {
    // we'll use this array to keep track of which key is the closest to the users entered value.
    // keys closer to the index 0 will be a closer guess than keys indexed further from 0
    // an entry at 0 would be a direct match, an entry at 1 would be a single character off, etc.
    const index: string[] = [];
    Config.getAllowedProperties()
      .map((k) => k.newKey ?? k.key)
      .map((k) => (index[Levenshtein.get(userEnteredConfig, k)] = k));
    return index.find((item) => item !== undefined) ?? '';
  }
  protected pushSuccess(configInfo: ConfigInfo): void {
    this.responses.push({
      name: configInfo.key,
      key: configInfo.key,
      value: configInfo.value as string | undefined,
      success: true,
      location: configInfo.location,
    });
  }

  protected pushFailure(name: string, err: string | Error, value?: string): void {
    const error = SfError.wrap(err);
    this.responses.push({
      name,
      success: false,
      value,
      error,
      message: error.message.replace(/\.\.$/, '.'),
    });
    process.exitCode = 1;
  }

  protected output(title: string, verbose: boolean): void {
    if (this.responses.length === 0) {
      this.log('No results found');
      return;
    }

    const columns: ux.Table.table.Columns<Msg> = {
      name: { header: 'Name' },
    };

    if (!title.includes('Unset')) {
      columns.value = {
        header: 'Value',
        get: (row): string => row.value ?? '',
      };
    }

    if (!title.includes('List')) {
      columns.success = { header: 'Success' };
    }

    if (verbose) {
      columns.location = {
        header: 'Location',
        get: (row): string => row.location ?? '',
      };
    }

    if (this.responses.some((msg) => msg.error)) {
      columns.message = {
        header: 'Message',
        get: (row): string => row.message ?? '',
      };
      this.responses.map((msg) => (msg.message = msg.error?.message));
    }

    this.table(this.responses, columns, { title });
  }
}
