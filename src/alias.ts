/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand } from '@salesforce/sf-plugins-core';

export type AliasResult = {
  alias: string;
  value?: string;
  success?: boolean;
  message?: string;
  error?: {
    name: string;
    message: string;
  };
};

export type AliasResults = AliasResult[];

type AliasColumns = {
  alias: { header: string };
  value: { header: string };
  success?: { header: string };
  message?: { header: string };
};

export abstract class AliasCommand<T> extends SfCommand<T> {
  protected output(title: string, results: AliasResults): void {
    if (results.length === 0) {
      this.log('No results');
      return;
    }

    const columns: AliasColumns = {
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

      // results.map((r) => ({ ...r, message: r.error?.message }));
      results.map((result) => (result.message = result.error?.message));
    }

    this.table(results, columns, { title, 'no-truncate': true });
  }
}

export const aliasErrorHandler = (err: unknown, alias: string, value?: string): AliasResult => {
  const { name, message } =
    err instanceof Error
      ? err
      : typeof err === 'string'
      ? new Error(err)
      : { name: 'UnknownError', message: 'Unknown Error' };
  return { alias, success: false, error: { name, message }, value };
};
