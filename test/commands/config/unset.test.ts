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
import { Config, OrgConfigProperties } from '@salesforce/core';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { SinonSandbox } from 'sinon';
import sinon from 'sinon';

describe('config:unset', () => {
  let configStub: StubbedType<Config>;
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  async function prepareStubs(throwsError = false) {
    if (throwsError) {
      configStub = stubInterface<Config>(sandbox, {
        unset: () => {
          throw new Error('Unset Error!');
        },
      });
    } else {
      configStub = stubInterface<Config>(sandbox, {});
    }

    stubMethod(sandbox, Config, 'create').callsFake(async () => configStub);
  }

  it('should unset values for a single property', async () => {
    await prepareStubs();
    const { result } = await runCommand([
      'config:unset',
      `${OrgConfigProperties.ORG_API_VERSION}`,
      '--global',
      '--json',
    ]);
    expect(result).to.deep.equal({
      failures: [],
      successes: [{ name: OrgConfigProperties.ORG_API_VERSION, success: true }],
    });
    expect(configStub.unset.callCount).to.equal(1);
  });

  it('should unset values for multiple properties', async () => {
    await prepareStubs();
    const { result } = await runCommand([
      'config:unset',
      `${OrgConfigProperties.ORG_API_VERSION}`,
      `${OrgConfigProperties.TARGET_DEV_HUB}`,
      '--global',
      '--json',
    ]);
    expect(result).to.deep.equal({
      successes: [
        { name: OrgConfigProperties.ORG_API_VERSION, success: true },
        { name: OrgConfigProperties.TARGET_DEV_HUB, success: true },
      ],
      failures: [],
    });
    expect(configStub.unset.callCount).to.equal(2);
  });

  it('should handle errors with --json flag', async () => {
    await prepareStubs(true);
    const { stdout } = await runCommand([
      'config:unset',
      `${OrgConfigProperties.ORG_API_VERSION}`,
      '--global',
      '--json',
    ]);
    const { result } = JSON.parse(stdout);
    expect(result).to.deep.equal({
      successes: [],
      failures: [
        {
          name: OrgConfigProperties.ORG_API_VERSION,
          message: 'Unset Error!',
          success: false,
          error: {
            name: 'Error',
            cause: {},
            exitCode: 1,
          },
        },
      ],
    });
  });

  it('should handle errors with no --json flag', async () => {
    await prepareStubs(true);
    const { stdout } = await runCommand(['config:unset', `${OrgConfigProperties.ORG_API_VERSION}`, '--global']);
    expect(stdout).to.include(OrgConfigProperties.ORG_API_VERSION);
    expect(stdout).to.include('false');
  });
});
