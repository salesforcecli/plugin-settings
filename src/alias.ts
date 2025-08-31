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

export abstract class AliasCommand<T> extends SfCommand<T> {
  protected output(title: string, results: AliasResults): void {
    if (results.length === 0) {
      this.log('No results');
      return;
    }
    // If any result contains an Error, add the header and grab the message off of Error
    if (results.some((result) => result.error)) {
      process.exitCode = 1;
    }

    const data = results.map((result) => ({
      alias: result.alias,
      value: result.value,
      ...(title.includes('Set') || title.includes('Unset') ? { success: result.success } : {}),
      ...(result.error ? { message: result.error.message } : {}),
    }));

    this.table({
      data,
      title,
    });
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
