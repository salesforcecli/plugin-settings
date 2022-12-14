/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, test } from '@oclif/test';
import { testSetup } from '@salesforce/core/lib/testSetup';

const $$ = testSetup();

describe('alias unset', () => {
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

  test
    .stdout()
    .stderr()
    .command(['alias unset'])
    .it('throws error when no aliases provided', (ctx) => {
      expect(ctx.stderr).to.contain('You must provide an alias name when unsetting an alias.');
    });
});
