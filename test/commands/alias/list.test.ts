/*
 * Copyright 2026, Salesforce, Inc.
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
