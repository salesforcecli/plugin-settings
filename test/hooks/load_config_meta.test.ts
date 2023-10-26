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
import { Plugin } from '@oclif/core';
import { Config } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import sinon from 'sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import tsSrcConfigMetaMock from '../config-meta-mocks/typescript-src/src/config-meta.js';

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
        pjson: JSON.parse(readFileSync(path.resolve(mockPluginRoot, 'package.json'), 'utf-8')),
      } as unknown as Plugin);
    })
    .hook('init')
    .do(() => {
      expect(tsSrcConfigMetaMock.default).to.deep.equal([
        {
          key: 'customKey',
        },
      ]);
      // modified since devPlugins now includes plugin-deploy-retrieve to exercise a config-meta that it includes.
      // see https://github.com/salesforcecli/plugin-deploy-retrieve/blob/main/src/configMeta.ts
      expect((Config.addAllowedProperties as SinonStub).firstCall.args[0][1]).to.equal(tsSrcConfigMetaMock.default);
    })
    .it('loads config metas from a ts src directory');
});
