/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import { TestContext } from '@salesforce/core/testSetup';

describe('alias list', () => {
  const $$ = new TestContext();
  describe('no existing aliases', () => {
    it('shows no results', async () => {
      $$.stubAliases({});
      const { stdout, result } = await runCommand('alias list');
      expect(stdout).to.contain('No results');
      expect(result).to.be.empty;
    });

    it('shows no results with --json', async () => {
      $$.stubAliases({});
      const { stdout, result } = await runCommand('alias list --json');
      const response = JSON.parse(stdout);
      expect(response.status).to.equal(0);
      expect(response.result.length).to.equal(0);
      expect(result).to.be.empty;
    });

    it('shows existing aliases', async () => {
      $$.stubAliases({ Coffee: 'espresso' });
      const { result } = await runCommand('alias list');
      expect(result).to.deep.equal([
        {
          alias: 'Coffee',
          value: 'espresso',
        },
      ]);
    });
  });
});
