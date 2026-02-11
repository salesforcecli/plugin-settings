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
