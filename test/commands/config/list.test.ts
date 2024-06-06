/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import { ConfigAggregator, OrgConfigProperties } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import sinon from 'sinon';
import { SfConfigProperties } from '@salesforce/core/config';
import { ConfigResponses } from '../../../src/config.js';

describe('config:list', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return values for all configured properties', async () => {
    stubMethod(sinon, ConfigAggregator.prototype, 'getConfigInfo').returns([
      { key: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location: 'Global' },
      { key: SfConfigProperties.DISABLE_TELEMETRY, value: true, location: 'Global' },
      { key: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location: 'Local' },
      { key: OrgConfigProperties.ORG_API_VERSION, value: '49.0', location: 'Local' },
    ]);

    const { result } = await runCommand<ConfigResponses>('config list');
    expect(result).to.deep.equal([
      {
        name: OrgConfigProperties.TARGET_DEV_HUB,
        key: OrgConfigProperties.TARGET_DEV_HUB,
        value: 'MyDevhub',
        location: 'Global',
        path: undefined,
        success: true,
      },
      {
        name: SfConfigProperties.DISABLE_TELEMETRY,
        key: SfConfigProperties.DISABLE_TELEMETRY,
        value: true,
        location: 'Global',
        path: undefined,
        success: true,
      },
      {
        name: OrgConfigProperties.TARGET_ORG,
        key: OrgConfigProperties.TARGET_ORG,
        value: 'MyUser',
        location: 'Local',
        path: undefined,
        success: true,
      },
      {
        name: OrgConfigProperties.ORG_API_VERSION,
        key: OrgConfigProperties.ORG_API_VERSION,
        value: '49.0',
        location: 'Local',
        path: undefined,
        success: true,
      },
    ]);
  });

  it('should handle no results found', async () => {
    stubMethod(sinon, ConfigAggregator.prototype, 'getConfigInfo').returns([]);
    const { result } = await runCommand<ConfigResponses>('config list');
    expect(result).to.deep.equal([]);
  });
});
