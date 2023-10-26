/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { assert, expect } from 'chai';
import { ConfigResponses } from '../../../../src/config.js';
import { removePath } from '../../../shared/removePath.js';
let testSession: TestSession;

describe('config:list NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configListNUTs' },
    devhubAuthStrategy: 'NONE',
  });
  describe('config:list with no configs set', () => {
    it('lists no config entries correctly', () => {
      const res = execCmd('config:list --json', {
        ensureExitCode: 0,
        env: { ...process.env, SF_DISABLE_TELEMETRY: undefined },
      });
      expect(res.jsonOutput).to.deep.equal({
        result: [],
        status: 0,
        warnings: [],
      });
    });

    it('lists no configs stdout', () => {
      const res: string = execCmd('config:list', {
        ensureExitCode: 0,
        env: { ...process.env, SF_DISABLE_TELEMETRY: undefined },
      }).shellOutput;
      expect(res).to.include('No results found');
    });
  });

  describe('config:list with singular result', () => {
    before(() => {
      execCmd('config:set apiVersion=51.0 --global', { ensureExitCode: 0 });
    });

    it('lists singular config correctly', () => {
      const res = execCmd<ConfigResponses>('config:list --json', {
        ensureExitCode: 0,
        env: { ...process.env, SF_DISABLE_TELEMETRY: undefined },
      });
      // path will be different on each machine/test run
      assert(res.jsonOutput);
      res.jsonOutput.result = removePath(res.jsonOutput?.result);
      expect(res.jsonOutput).to.deep.equal({
        result: [
          {
            name: 'org-api-version',
            success: true,
            key: 'org-api-version',
            location: 'Global',
            value: '51.0',
          },
        ],
        status: 0,
        warnings: [],
      });
    });

    it('properly overwrites config values, with local > global', () => {
      execCmd('config:set apiVersion=52.0 --json', { ensureExitCode: 0 });
      const res = execCmd<ConfigResponses>('config:list --json', {
        ensureExitCode: 0,
        env: { ...process.env, SF_DISABLE_TELEMETRY: undefined },
      });
      assert(res.jsonOutput);
      res.jsonOutput.result = removePath(res.jsonOutput?.result);
      expect(res.jsonOutput).to.deep.equal({
        result: [
          {
            key: 'org-api-version',
            name: 'org-api-version',
            success: true,
            location: 'Local',
            value: '52.0',
          },
        ],
        status: 0,
        warnings: [],
      });
    });

    it('lists singular result correctly stdout', () => {
      const res: string = execCmd('config:list', {
        ensureExitCode: 0,
        env: { ...process.env, SF_DISABLE_TELEMETRY: undefined },
      }).shellOutput.stdout;
      expect(res).to.include('List Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('Local');
      expect(res).to.include('52.0');
      execCmd('config:unset apiVersion');
    });
  });

  describe('config:list with multiple results', () => {
    beforeEach(() => {
      execCmd('config:set apiVersion=51.0 --global', { ensureExitCode: 0 });
      execCmd('config:set maxQueryLimit=100 --global', { ensureExitCode: 0 });
    });

    it('lists multiple results correctly JSON', () => {
      execCmd('config:set restDeploy=false', { ensureExitCode: 0 });
      const res = execCmd<ConfigResponses>('config:list --json', { ensureExitCode: 0 });
      assert(res.jsonOutput);
      res.jsonOutput.result = removePath(res.jsonOutput?.result);
      expect(res.jsonOutput.result).to.deep.include({
        key: 'org-api-version',
        name: 'org-api-version',
        success: true,
        location: 'Global',
        value: '51.0',
      });
      expect(res.jsonOutput.result).to.deep.include({
        key: 'org-max-query-limit',
        name: 'org-max-query-limit',
        success: true,
        location: 'Global',
        value: '100',
      });
      expect(res.jsonOutput.result).to.deep.include({
        key: 'org-metadata-rest-deploy',
        name: 'org-metadata-rest-deploy',
        success: true,
        location: 'Local',
        value: 'false',
      });
    });

    it('lists multiple results correctly stdout', () => {
      execCmd('config:set restDeploy=false');
      const res: string = execCmd('config:list', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res).to.include('List Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('51.0');
      expect(res).to.include('org-max-query-limit');
      expect(res).to.include('100');
      expect(res).to.include('org-metadata-rest-deploy');
      expect(res).to.include('false');
    });
  });

  after(async () => {
    await testSession?.clean();
  });
});
