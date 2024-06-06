/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
