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
