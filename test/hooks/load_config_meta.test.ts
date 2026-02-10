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

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { expect } from 'chai';
import { Config as OclifConfig, Plugin } from '@oclif/core';
import { Config } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import sinon from 'sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import tsSrcConfigMetaMock from '../config-meta-mocks/typescript-src/src/config-meta.js';
// @ts-expect-error because it's a js file with no types
import jsLibConfigMetaMock from '../config-meta-mocks/javascript-lib/lib/config-meta.js';

process.env.NODE_ENV = 'development';

describe('hooks', () => {
  let sandbox: SinonSandbox;
  let config: OclifConfig;
  let addAllowedPropertiesStub: SinonStub;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    addAllowedPropertiesStub = stubMethod(sandbox, Config, 'addAllowedProperties');
    config = await OclifConfig.load(process.cwd());
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should load config metas from a ts src directory', async () => {
    const mockPluginRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../config-meta-mocks/typescript-src'
    );

    sandbox.stub(config, 'plugins').value(
      new Map(config.plugins).set('sfdx-cli-ts-plugin', {
        root: mockPluginRoot,
        hooks: {},
        name: 'sf-cli-ts-plugin',
        pjson: JSON.parse(readFileSync(path.resolve(mockPluginRoot, 'package.json'), 'utf-8')),
      } as Plugin)
    );

    await config.runHook('init', { argv: [], id: 'test' });
    expect(addAllowedPropertiesStub.firstCall.args[0][1]).to.equal(tsSrcConfigMetaMock.default[0]);
  });

  it('should load config metas from a js lib directory', async () => {
    const mockPluginRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../config-meta-mocks/javascript-lib'
    );

    sandbox.stub(config, 'plugins').value(
      new Map(config.plugins).set('sfdx-cli-js-plugin', {
        root: mockPluginRoot,
        hooks: {},
        name: 'sf-cli-js-plugin',
        pjson: JSON.parse(readFileSync(path.resolve(mockPluginRoot, 'package.json'), 'utf-8')),
      } as Plugin)
    );

    await config.runHook('init', { argv: [], id: 'test' });
    expect(addAllowedPropertiesStub.firstCall.args[0][1]).to.equal(jsLibConfigMetaMock.default[0]);
  });
});
