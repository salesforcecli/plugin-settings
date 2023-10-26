/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@oclif/test';
import { Plugin } from '@oclif/core';
import { Config } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import sinon from 'sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import tsSrcConfigMetaMock from '../config-meta-mocks/typescript-src/src/config-meta.js';
// @ts-expect-error because it's js
import jsLibConfigMetaMock from '../config-meta-mocks/javascript-lib/lib/config-meta.js';

process.env.NODE_ENV = 'development';

describe('hooks', () => {
  let sandbox: SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    stubMethod(sandbox, Config, 'addAllowedProperties');
  });

  afterEach(() => {
    sandbox.restore();
  });
  test
    .stdout()
    .loadConfig()
    .do((ctx) => {
      const mockPluginRoot = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../config-meta-mocks/typescript-src'
      );
      ctx.config.plugins.set('sfdx-cli-ts-plugin', {
        root: mockPluginRoot,
        hooks: {},
        pjson: path.resolve(mockPluginRoot, 'package.json'),
      } as unknown as Plugin);
    })
    .hook('init')
    .do(() => {
      expect(tsSrcConfigMetaMock).to.deep.equal([
        {
          key: 'customKey',
        },
      ]);
      // modified since devPlugins now includes plugin-deploy-retrieve to exercise a config-meta that it includes.
      // see https://github.com/salesforcecli/plugin-deploy-retrieve/blob/main/src/configMeta.ts
      expect((Config.addAllowedProperties as SinonStub).firstCall.args[0][1]).to.equal(tsSrcConfigMetaMock);
    })
    .it('loads config metas from a ts src directory');

  test
    .stdout()
    .loadConfig()
    .do((ctx) => {
      const mockPluginRoot = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../config-meta-mocks/javascript-lib'
      );
      ctx.config.plugins.set('sfdx-cli-ts-plugin', {
        root: mockPluginRoot,
        hooks: {},
        pjson: path.resolve(mockPluginRoot, 'package.json'),
      } as unknown as Plugin);
    })
    .hook('init')
    .do(() => {
      expect(jsLibConfigMetaMock).to.deep.equal([
        {
          key: 'customKey',
        },
      ]);
      expect((Config.addAllowedProperties as SinonStub).firstCall.args[0][1]).to.equal(jsLibConfigMetaMock[0]);
    })
    .it('loads config metas from a js lib directory');
});
