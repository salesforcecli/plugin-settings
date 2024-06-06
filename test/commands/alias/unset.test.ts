/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import { TestContext } from '@salesforce/core/testSetup';

describe('alias unset', () => {
  const $$ = new TestContext();
  beforeEach(async () => {
    $$.stubAliases({ Coffee: 'espresso', Bacon: 'breakfast' });
  });

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('removes alias', async () => {
    const { result } = await runCommand('alias unset Coffee --json');
    expect(result).to.deep.equal([
      {
        alias: 'Coffee',
        success: true,
        value: 'espresso',
      },
    ]);
  });

  it('removes multiple aliases', async () => {
    const { result } = await runCommand('alias unset Coffee Bacon --json');
    expect(result).to.deep.equal([
      { alias: 'Coffee', success: true, value: 'espresso' },
      { alias: 'Bacon', success: true, value: 'breakfast' },
    ]);
  });
});
