/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { OutputArgs, ParserOutput } from '@oclif/core/lib/interfaces';
import { Messages } from '@salesforce/core';

// Helper function to validate passed arguments for 'config set' and 'alias set'

export default function validateArgs(
  parserOutput: ParserOutput,
  message: Messages<string>
): { [index: string]: string } {
  const result: { [index: string]: string } = {};

  // Filter out dynamic arguments (argv) that are defined in `static args = []` (args)
  // This is future proofing in case defined args are added later
  const argValues = Object.values(parserOutput.args as OutputArgs);
  const args = parserOutput.argv.filter((val) => !argValues.includes(val));

  if (!args.length) {
    throw message.createError('error.ArgumentsRequired');
  }

  // Support `set key value`
  if (args.length === 2 && !args[0].includes('=')) {
    return { [args[0]]: args[1] };
  }

  // Ensure that all args are in the right format (e.g. key1=value1 key2=value2)
  args.forEach((arg) => {
    const split = arg.split('=');

    if (split.length !== 2) {
      throw message.createError('error.InvalidArgumentFormat', [arg]);
    }

    const [name, value] = split;

    if (result[name]) {
      throw message.createError('error.DuplicateArgument', [name]);
    }

    if (value === '') {
      throw message.createError('error.ValueRequired', [name]);
    }

    result[name] = value || undefined;
  });

  return result;
}
