/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { runCommand } from '@oclif/test';

describe('alias set', () => {
  it('returns new alias', async () => {
    const { stdout } = await runCommand('alias set Coffee=espresso --json');
    const response = JSON.parse(stdout);
    expect(response.result).to.deep.equal([
      {
        alias: 'Coffee',
        success: true,
        value: 'espresso',
      },
    ]);
  });
});
