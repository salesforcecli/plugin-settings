/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import { Config, Org, OrgConfigProperties } from '@salesforce/core';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import sinon from 'sinon';

describe('config:set', () => {
  let configStub: StubbedType<Config>;
  let orgStub: StubbedType<Org>;
  let orgCreateSpy: sinon.SinonStub;

  afterEach(() => {
    sinon.restore();
  });

  async function prepareStubs() {
    configStub = stubInterface<Config>(sinon, {});
    stubMethod(sinon, Config, 'create').callsFake(async () => configStub);
  }

  it('should return values for all configured properties', async () => {
    await prepareStubs();
    const { result } = await runCommand(['config:set', `${OrgConfigProperties.ORG_API_VERSION}=49.0`, '--global']);
    expect(result).to.deep.equal({
      successes: [{ name: OrgConfigProperties.ORG_API_VERSION, value: '49.0', success: true }],
      failures: [],
    });
    expect(configStub.set.callCount).to.equal(1);
  });

  it('should instantiate an Org when target-org is set', async () => {
    await prepareStubs();
    orgStub = stubInterface<Org>(sinon, {});
    orgCreateSpy = stubMethod(sinon, Org, 'create').callsFake(async () => orgStub);
    const { result } = await runCommand([
      'config:set',
      `${OrgConfigProperties.TARGET_ORG}=MyUser`,
      '--global',
      '--json',
    ]);
    expect(result).to.deep.equal({
      failures: [],
      successes: [{ name: OrgConfigProperties.TARGET_ORG, value: 'MyUser', success: true }],
    });
    expect(configStub.set.callCount).to.equal(1);
    expect(orgCreateSpy.callCount).to.equal(1);
  });

  it('should instantiate an Org when target-dev-hub is set', async () => {
    await prepareStubs();
    orgStub = stubInterface<Org>(sinon, {});
    orgCreateSpy = stubMethod(sinon, Org, 'create').callsFake(async () => orgStub);
    const { result } = await runCommand([
      'config:set',
      `${OrgConfigProperties.TARGET_DEV_HUB}=MyDevhub`,
      '--global',
      '--json',
    ]);
    expect(result).to.deep.equal({
      failures: [],
      successes: [{ name: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', success: true }],
    });
    expect(configStub.set.callCount).to.equal(1);
    expect(orgCreateSpy.callCount).to.equal(1);
  });

  describe('error cases', () => {
    beforeEach(() => {
      stubMethod(sinon, Org, 'create').callsFake(async () => {
        throw new Error('No AuthInfo found');
      });
    });

    it('should handle failed org create with --json flag', async () => {
      const { stdout } = await runCommand([
        'config:set',
        `${OrgConfigProperties.TARGET_ORG}=NonExistentOrg`,
        '--global',
        '--json',
      ]);
      const { result } = JSON.parse(stdout);
      expect(result).to.deep.equal({
        successes: [],
        failures: [
          {
            error: {
              cause: {},
              exitCode: 1,
              name: 'Error',
            },
            name: OrgConfigProperties.TARGET_ORG,
            message: 'Invalid config value: org "NonExistentOrg" is not authenticated.',
            success: false,
            value: 'NonExistentOrg',
          },
        ],
      });
    });

    it('should handle failed org create with no --json flag', async () => {
      const { stdout } = await runCommand([
        'config:set',
        `${OrgConfigProperties.TARGET_ORG}=NonExistentOrg`,
        '--global',
      ]);
      expect(stdout).to.include(OrgConfigProperties.TARGET_ORG);
      expect(stdout).to.include('NonExistentOrg');
      expect(stdout).to.include('false');
    });
  });
});
