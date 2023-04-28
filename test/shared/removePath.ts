/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigResponses } from '../../src/config';

export const removePath = (responses: ConfigResponses) =>
  responses.map((r) => {
    const { path, ...rMinusPath } = r;
    return rMinusPath;
  });
