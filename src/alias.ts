/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfError } from '@salesforce/core';
import { ux } from '@oclif/core';
import { SfCommand } from '@salesforce/sf-plugins-core';

export type AliasResult = {
  alias: string;
  value?: string;
  success?: boolean;
  message?: string;
  error?: SfError;
};

export type AliasResults = AliasResult[];

export abstract class AliasCommand<T> extends SfCommand<T> {
  protected output(title: string, results: AliasResults): void {
    if (results.length === 0) {
      this.log('No results');
      return;
    }

    const columns: ux.Table.table.Columns<AliasResult> = {
      alias: { header: 'Alias' },
      value: { header: 'Value' },
    };

    if (title.includes('Set') || title.includes('Unset')) {
      columns.success = { header: 'Success' };
    }

    // If any result contains an Error, add the header and grab the message off of Error
    if (results.some((result) => result.error)) {
      process.exitCode = 1;

      columns.message = { header: 'Message' };

      results.map((result) => (result.message = result.error?.message));
    }

    this.table(results, columns, { title, 'no-truncate': true });
  }
}
