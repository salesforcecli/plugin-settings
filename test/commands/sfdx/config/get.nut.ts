/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { ConfigResponses, Msg } from '../../../../src/config';
let testSession: TestSession;

describe('config:get NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configGetNUTs' },
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
      execCmd('config:set apiVersion=51.0 --global');
    });

    it('gets singular config correctly', () => {
      const res = execCmd<ConfigResponses>('config:get apiVersion --json', { ensureExitCode: 0 }).jsonOutput;
      const result = res?.result[0] ?? ({} as Msg);
      // the path variable will change machine to machine, ensure it has the config file and then delete it
      expect(result.path).to.include('config.json');
      expect(result.key).to.include('apiVersion');
      expect(result.location).to.include('Global');
      expect(result.value).to.include('51.0');
      expect(res?.status).to.equal(0);
    });

    it('properly overwrites config values, with local > global', () => {
      execCmd('config:set apiVersion=52.0');
      const res = execCmd<ConfigResponses>('config:get apiVersion --json', { ensureExitCode: 0 }).jsonOutput;
      // the path variable will change machine to machine, ensure it has the config file and then delete it
      expect(res?.result[0].path).to.include('config.json');
      delete res?.result[0].path;
      expect(res).to.deep.equal({
        result: [
          {
            deprecated: true,
            error: {
              exitCode: 1,
              name: 'DeprecatedConfigKeyError',
            },
            key: 'apiVersion',
            message: 'Deprecated config name: apiVersion. Please use org-api-version instead.',
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

    it('gets singular result correctly stdout', () => {
      const res: string = execCmd<ConfigResponses>('config:get apiVersion').shellOutput.stdout;
      expect(res).to.include('Get Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('52.0');
    });
  });

  describe('config:get with multiple results', () => {
    beforeEach(() => {
      execCmd('config:set apiVersion=51.0 --global');
      execCmd('config:set maxQueryLimit=100 --global');
    });

    it('gets multiple results correctly', () => {
      execCmd('config:set restDeploy=false');
      execCmd('config:set apiVersion=51.0');
      const res = execCmd<ConfigResponses>('config:get apiVersion maxQueryLimit restDeploy --json', {
        ensureExitCode: 0,
      });
      Object.values(res.jsonOutput?.result ?? []).forEach((result) => {
        expect(result.path).to.include('config.json');
        delete result.path;
      });

      expect(res.jsonOutput?.result).to.deep.equal([
        {
          deprecated: true,
          error: {
            exitCode: 1,
            name: 'DeprecatedConfigKeyError',
          },
          key: 'apiVersion',
          location: 'Local',
          message: 'Deprecated config name: apiVersion. Please use org-api-version instead.',
          name: 'org-api-version',
          success: true,
          value: '51.0',
        },
        {
          deprecated: true,
          error: {
            exitCode: 1,
            name: 'DeprecatedConfigKeyError',
          },
          key: 'maxQueryLimit',
          location: 'Global',
          message: 'Deprecated config name: maxQueryLimit. Please use org-max-query-limit instead.',
          name: 'org-max-query-limit',
          success: true,
          value: '100',
        },
        {
          deprecated: true,
          error: {
            exitCode: 1,
            name: 'DeprecatedConfigKeyError',
          },
          key: 'restDeploy',
          location: 'Local',
          message: 'Deprecated config name: restDeploy. Please use org-metadata-rest-deploy instead.',
          name: 'org-metadata-rest-deploy',
          success: true,
          value: 'false',
        },
      ]);
    });

    it('gets multiple results correctly stdout', () => {
      const res = execCmd<ConfigResponses>('config:get  apiVersion maxQueryLimit restDeploy').shellOutput.stdout;
      expect(res).to.include('Get Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('51.0');
      expect(res).to.include('maxQueryLimit');
      expect(res).to.include('100');
      expect(res).to.include('restDeploy');
      expect(res).to.include('false');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
