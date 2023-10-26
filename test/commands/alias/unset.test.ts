/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, test } from '@oclif/test';
import { TestContext } from '@salesforce/core/lib/testSetup.js';

describe('alias unset', () => {
  const $$ = new TestContext();
  beforeEach(async () => {
    $$.stubAliases({ Coffee: 'espresso', Bacon: 'breakfast' });
  });

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  test
    .stdout()
    .command(['alias unset', 'Coffee', '--json'])
    .it('removes alias', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.result).to.deep.equal([
        {
          alias: 'Coffee',
          success: true,
          value: 'espresso',
        },
      ]);
    });

  test
    .stdout()
    .command(['alias unset', 'Coffee', 'Bacon', '--json'])
    .it('removes multiple aliases', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.result).to.deep.equal([
        { alias: 'Coffee', success: true, value: 'espresso' },
        { alias: 'Bacon', success: true, value: 'breakfast' },
      ]);
    });
});
