/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Msg } from '../../src/config.js';

export const removePath = (responses: Msg[]): Array<Omit<Msg, 'path'>> =>
  responses.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, ...rMinusPath } = r;
    return rMinusPath;
  });
