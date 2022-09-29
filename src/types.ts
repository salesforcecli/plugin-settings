/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfError } from '@salesforce/core';

export type AliasResult = {
  alias: string;
  value?: string;
  success?: boolean;
  error?: SfError;
};

export type AliasResults = AliasResult[];
