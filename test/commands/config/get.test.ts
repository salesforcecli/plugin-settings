/*
 * Copyright 2025, Salesforce, Inc.
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

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import { ConfigAggregator, OrgConfigProperties, SfConfigProperties } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import { Config, Plugin } from '@oclif/core';
import sinon from 'sinon';
import { ConfigResponses, calculateSuggestion } from '../../../src/config.js';

describe('config:get', () => {
  afterEach(() => {
    sinon.restore();
  });

  async function prepareStubs(global = true) {
    const location = global ? 'Global' : 'Local';
    stubMethod(sinon, ConfigAggregator.prototype, 'getInfo')
      .withArgs(OrgConfigProperties.TARGET_DEV_HUB)
      .returns({ key: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location })
      .withArgs(OrgConfigProperties.TARGET_ORG)
      .returns({ key: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location })
      .withArgs(OrgConfigProperties.ORG_API_VERSION)
      .returns({ key: OrgConfigProperties.ORG_API_VERSION })
      .withArgs(SfConfigProperties.DISABLE_TELEMETRY)
      .throws('FAILED');
  }

  it('should return values for globally configured properties', async () => {
    await prepareStubs(true);
    const { result } = await runCommand([
      'config:get',
      OrgConfigProperties.TARGET_DEV_HUB,
      OrgConfigProperties.TARGET_ORG,
      '--json',
    ]);
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
        name: OrgConfigProperties.TARGET_ORG,
        key: OrgConfigProperties.TARGET_ORG,
        value: 'MyUser',
        location: 'Global',
        path: undefined,
        success: true,
      },
    ]);
  });

  it('should return values for locally configured properties', async () => {
    await prepareStubs(false);
    const { result } = await runCommand([
      'config:get',
      OrgConfigProperties.TARGET_DEV_HUB,
      OrgConfigProperties.TARGET_ORG,
      '--json',
    ]);
    expect(result).to.deep.equal([
      {
        name: OrgConfigProperties.TARGET_DEV_HUB,
        key: OrgConfigProperties.TARGET_DEV_HUB,
        value: 'MyDevhub',
        location: 'Local',
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
    ]);
  });

  it('should gracefully handle un-configured properties', async () => {
    await prepareStubs();
    const { result } = await runCommand(['config:get', OrgConfigProperties.ORG_API_VERSION, '--json']);
    expect(result).to.deep.equal([
      {
        key: OrgConfigProperties.ORG_API_VERSION,
        name: OrgConfigProperties.ORG_API_VERSION,
        success: true,
        value: undefined,
        path: undefined,
        location: undefined,
      },
    ]);
  });

  it('should gracefully handle failed attempts to ConfigAggregator.getInfo', async () => {
    await prepareStubs();
    const { result } = await runCommand<ConfigResponses>([
      'config:get',
      SfConfigProperties.DISABLE_TELEMETRY,
      '--json',
    ]);
    expect(result?.[0].error?.name).to.equal('FAILED');
  });

  describe('load custom config meta', () => {
    it('fails when there is no matching loaded custom key', async () => {
      const { result } = await runCommand<ConfigResponses>(['config:get', 'customKey', '--json']);
      expect(result?.[0].message).to.equal('Unknown config name: customKey.');
    });

    it('should allow custom config meta for allowedProperties', async () => {
      const root = path.dirname(fileURLToPath(import.meta.url));
      const mockPluginRoot = path.resolve(root, '../../config-meta-mocks/javascript-lib');
      const config = await Config.load(root);
      config.plugins.set('sfdx-cli-js-plugin-2', {
        root: mockPluginRoot,
        hooks: {},
        pjson: JSON.parse(readFileSync(path.resolve(mockPluginRoot, 'package.json'), 'utf-8')),
        name: 'sfdx-cli-js-plugin-2',
        commands: [],
        topics: [],
      } as unknown as Plugin);

      const { result } = await runCommand<ConfigResponses>(['config:get', 'customKey', '--json'], config);
      expect(result).to.deep.equal([
        {
          key: 'customKey',
          location: undefined,
          name: 'customKey',
          path: undefined,
          success: true,
          value: undefined,
        },
      ]);
    });
  });

  describe('calculate suggestion', () => {
    it('will calculate the correct suggestions based on inputs', () => {
      expect(calculateSuggestion('target-de-hub')).to.equal('target-dev-hub');
      expect(calculateSuggestion('org-api-versi')).to.equal('org-api-version');
      expect(calculateSuggestion('target-o')).to.equal('target-org');
      expect(calculateSuggestion('target')).to.equal('target-org');
      expect(calculateSuggestion('org-instance')).to.equal('org-instance-url');
      expect(calculateSuggestion('org')).to.equal('target-org');
    });
  });
});
