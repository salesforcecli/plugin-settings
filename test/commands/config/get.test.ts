/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { test, expect } from '@oclif/test';
import { ConfigAggregator, OrgConfigProperties, SfConfigProperties } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import { Plugin } from '@oclif/core';
import sinon from 'sinon';
import { calculateSuggestion } from '../../../src/config.js';

process.env.NODE_ENV = 'development';

describe('config:get', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  async function prepareStubs(global = true) {
    const location = global ? 'Global' : 'Local';
    stubMethod(sandbox, ConfigAggregator.prototype, 'getInfo')
      .withArgs(OrgConfigProperties.TARGET_DEV_HUB)
      .returns({ key: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location })
      .withArgs(OrgConfigProperties.TARGET_ORG)
      .returns({ key: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location })
      .withArgs(OrgConfigProperties.ORG_API_VERSION)
      .returns({ key: OrgConfigProperties.ORG_API_VERSION })
      .withArgs(SfConfigProperties.DISABLE_TELEMETRY)
      .throws('FAILED');
  }

  test
    .do(async () => prepareStubs(true))
    .stdout()
    .command(['config:get', OrgConfigProperties.TARGET_DEV_HUB, OrgConfigProperties.TARGET_ORG, '--json'])
    .it('should return values for globally configured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        {
          name: OrgConfigProperties.TARGET_DEV_HUB,
          key: OrgConfigProperties.TARGET_DEV_HUB,
          value: 'MyDevhub',
          location: 'Global',
          success: true,
        },
        {
          name: OrgConfigProperties.TARGET_ORG,
          key: OrgConfigProperties.TARGET_ORG,
          value: 'MyUser',
          location: 'Global',
          success: true,
        },
      ]);
    });

  test
    .do(async () => prepareStubs(false))
    .stdout()
    .command(['config:get', OrgConfigProperties.TARGET_DEV_HUB, OrgConfigProperties.TARGET_ORG, '--json'])
    .it('should return values for locally configured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        {
          name: OrgConfigProperties.TARGET_DEV_HUB,
          key: OrgConfigProperties.TARGET_DEV_HUB,
          value: 'MyDevhub',
          location: 'Local',
          success: true,
        },
        {
          name: OrgConfigProperties.TARGET_ORG,
          key: OrgConfigProperties.TARGET_ORG,
          value: 'MyUser',
          location: 'Local',
          success: true,
        },
      ]);
    });

  test
    .do(async () => prepareStubs())
    .stdout()
    .command(['config:get', OrgConfigProperties.ORG_API_VERSION, '--json'])
    .it('should gracefully handle unconfigured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        { key: OrgConfigProperties.ORG_API_VERSION, name: OrgConfigProperties.ORG_API_VERSION, success: true },
      ]);
    });

  test
    .do(async () => prepareStubs())
    .stdout()
    .command(['config:get', SfConfigProperties.DISABLE_TELEMETRY, '--json'])
    .it('should gracefully handle failed attempts to ConfigAggregator.getInfo', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.result[0].error.name).to.equal('FAILED');
    });

  describe('load custom config meta', () => {
    test
      .stdout()
      .command(['config:get', 'customKey', '--json'])
      .it('fails when there is no matching loaded custom key', (ctx) => {
        const response = JSON.parse(ctx.stdout);
        expect(response.result[0].message).to.equal('Unknown config name: customKey.');
      });

    test
      .loadConfig()
      .do((ctx) => {
        const mockPluginRoot = path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          '../../config-meta-mocks/typescript-src'
        );
        ctx.config.plugins.set('sfdx-cli-ts-plugin-2', {
          root: mockPluginRoot,
          hooks: {},
          pjson: JSON.parse(readFileSync(path.resolve(mockPluginRoot, 'package.json'), 'utf-8')),
          name: 'sfdx-cli-ts-plugin-2',
          commands: [],
        } as unknown as Plugin);
      })
      .stdout()
      .stderr()
      .command(['config:get', 'customKey', '--json'])
      .it('should allow custom config meta for allowedProperties', (ctx) => {
        const response = JSON.parse(ctx.stdout);
        expect(response.result).to.deep.equal([
          {
            key: 'customKey',
            name: 'customKey',
            success: true,
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
