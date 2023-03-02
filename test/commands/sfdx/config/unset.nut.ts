/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { ConfigResponses } from '../../../../src/config';
let testSession: TestSession;

describe('config:unset NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configUnsetNUTs' },
  });

  describe('config:unset without keys', () => {
    it('errors when attempting to unset nothing', () => {
      const res = execCmd<ConfigResponses>('config:unset --json', { ensureExitCode: 1 }).jsonOutput;
      expect(res?.stack).to.include('NoConfigKeysFoundError');
      delete res?.stack;
      expect(res).to.deep.equal({
        message:
          'You must provide one or more configuration variables to unset. Run "sf config list" to see the configuration variables you\'ve previously set.',
        name: 'NoConfigKeysFoundError',
        status: 1,
        code: 1,
        exitCode: 1,
        warnings: [],
      });
    });

    it('prints error message', () => {
      const res: string = execCmd('config:unset').shellOutput.stderr;
      expect(res).to.include(
        'You must provide one or more configuration variables to unset. Run "sf config list" to see the configuration variables you\'ve previously set.'
      );
    });
  });

  describe('config:unset with singular result', () => {
    beforeEach(() => {
      execCmd('config:set apiVersion=51.0 --global');
    });

    it('lists singular config correctly', () => {
      const res = execCmd('config:unset apiVersion --json', { ensureExitCode: 0 });
      expect(res.jsonOutput).to.deep.equal({
        result: {
          failures: [],
          successes: [
            {
              error: {
                exitCode: 1,
                name: 'DeprecatedConfigKeyError',
              },
              message: 'Deprecated config name: apiVersion. Please use org-api-version instead.',
              name: 'apiVersion',
              success: true,
            },
          ],
        },
        status: 0,
        warnings: [],
      });
    });

    it('lists singular result correctly stdout', () => {
      const res: string = execCmd('config:unset apiVersion').shellOutput.stdout;
      expect(res).to.include('Unset Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('Name');
      expect(res).to.include('Success');
      expect(res).to.include('true');
    });
  });

  describe('config:unset with multiple results', () => {
    beforeEach(() => {
      execCmd('config:set apiVersion=51.0 --global');
      execCmd('config:set maxQueryLimit=100 --global');
    });

    it('unsets multiple configs correctly JSON', () => {
      execCmd('config:set restDeploy=false');
      const res = execCmd('config:unset restDeploy apiVersion maxQueryLimit --json', { ensureExitCode: 0 });
      expect(res.jsonOutput).to.deep.equal({
        status: 0,
        result: {
          successes: [
            {
              name: 'restDeploy',
              success: true,
              error: {
                name: 'DeprecatedConfigKeyError',
                exitCode: 1,
              },
              message: 'Deprecated config name: restDeploy. Please use org-metadata-rest-deploy instead.',
            },
            {
              name: 'apiVersion',
              success: true,
              error: {
                name: 'DeprecatedConfigKeyError',
                exitCode: 1,
              },
              message: 'Deprecated config name: apiVersion. Please use org-api-version instead.',
            },
            {
              name: 'maxQueryLimit',
              success: true,
              error: {
                name: 'DeprecatedConfigKeyError',
                exitCode: 1,
              },
              message: 'Deprecated config name: maxQueryLimit. Please use org-max-query-limit instead.',
            },
          ],
          failures: [],
        },
        warnings: [],
      });
    });

    it('lists multiple results correctly stdout', () => {
      execCmd('config:set restDeploy=false');
      const res: string = execCmd('config:unset restDeploy apiVersion maxQueryLimit', { ensureExitCode: 0 }).shellOutput
        .stdout;
      expect(res).to.include('Unset Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('maxQueryLimit');
      expect(res).to.include('restDeploy');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
