/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { assert, expect, config as chaiConfig } from 'chai';
import { ConfigResponses } from '../../../../src/config';
let testSession: TestSession;
chaiConfig.truncateThreshold = 0;

describe('config:get NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configGetNUTs' },
    devhubAuthStrategy: 'NONE',
  });

  describe('config:get errors', () => {
    it('attempt to config get without keys', () => {
      const res = execCmd<ConfigResponses>('config:get --json', {
        ensureExitCode: 1,
      }).jsonOutput;
      expect(res?.stack).to.include('NoConfigKeysFound');
      expect(res?.name).to.include('NoConfigKeysFound');
      expect(res?.exitCode).to.equal(1);
    });

    it('attempt to config get without keys stdout', () => {
      const res: string = execCmd<ConfigResponses>('config:get').shellOutput.stderr;
      expect(res).to.include('You must provide one or more configuration variables to get.');
    });
  });

  describe('config:get with singular result', () => {
    before(() => {
      execCmd('config:set apiVersion=51.0 --global', { ensureExitCode: 0 });
    });

    it('gets singular config correctly', () => {
      const res = execCmd<ConfigResponses>('config:get apiVersion --json', { ensureExitCode: 0 }).jsonOutput;
      assert(res?.result[0]);
      const result = res.result[0];
      // the path variable will change machine to machine, ensure it has the config file and then delete it
      expect(result.path).to.include('config.json');
      // you can ask for the old name, but it'll give you the new one, along with a warning
      expect(result.key).to.include('org-api-version');
      expect(result.location).to.include('Global');
      expect(result.value).to.include('51.0');
      expect(res?.status).to.equal(0);
      assert('warnings' in res);
      expect(res.warnings).to.deep.equal(['Deprecated config name: apiVersion. Please use org-api-version instead.']);
    });

    it('properly overwrites config values, with local > global', () => {
      execCmd('config:set apiVersion=52.0', { ensureExitCode: 0 });
      const res = execCmd<ConfigResponses>('config:get apiVersion --json', { ensureExitCode: 0 }).jsonOutput;
      // the path variable will change machine to machine, ensure it has the config file and then delete it
      expect(res?.result[0].path).to.include('config.json');
      delete res?.result[0].path;

      expect(res).to.deep.equal({
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
        warnings: ['Deprecated config name: apiVersion. Please use org-api-version instead.'],
      });
    });

    it('gets singular result correctly stdout', () => {
      const res: string = execCmd<ConfigResponses>('config:get apiVersion', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res).to.include('Get Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('52.0');
    });
  });

  describe('config:get with multiple results', () => {
    beforeEach(() => {
      execCmd('config:set apiVersion=51.0 --global', { ensureExitCode: 0 });
      execCmd('config:set maxQueryLimit=100 --global', { ensureExitCode: 0 });
    });

    it('gets multiple results correctly', () => {
      execCmd('config:set restDeploy=false', { ensureExitCode: 0 });
      execCmd('config:set apiVersion=51.0', { ensureExitCode: 0 });
      const res = execCmd<ConfigResponses>('config:get apiVersion maxQueryLimit restDeploy --json', {
        ensureExitCode: 0,
      });
      Object.values(res.jsonOutput?.result ?? []).forEach((result) => {
        expect(result.path).to.include('config.json');
        delete result.path;
      });
      assert(res);
      assert(res.jsonOutput && 'warnings' in res.jsonOutput);
      expect(res?.jsonOutput.warnings).to.deep.equal([
        'Deprecated config name: apiVersion. Please use org-api-version instead.',
        'Deprecated config name: maxQueryLimit. Please use org-max-query-limit instead.',
        'Deprecated config name: restDeploy. Please use org-metadata-rest-deploy instead.',
      ]);

      expect(res.jsonOutput?.result).to.deep.equal([
        {
          key: 'org-api-version',
          location: 'Local',
          name: 'org-api-version',
          success: true,
          value: '51.0',
        },
        {
          key: 'org-max-query-limit',
          location: 'Global',
          name: 'org-max-query-limit',
          success: true,
          value: '100',
        },
        {
          key: 'org-metadata-rest-deploy',
          location: 'Local',
          name: 'org-metadata-rest-deploy',
          success: true,
          value: 'false',
        },
      ]);
    });

    it('gets multiple results correctly stdout', () => {
      const res = execCmd<ConfigResponses>('config:get  apiVersion maxQueryLimit restDeploy', { ensureExitCode: 0 })
        .shellOutput.stdout;
      expect(res).to.include('Get Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('51.0');
      expect(res).to.include('org-max-query-limit');
      expect(res).to.include('100');
      expect(res).to.include('org-metadata-rest-deploy');
      expect(res).to.include('false');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
