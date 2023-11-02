/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { assert, expect, config as chaiConfig } from 'chai';
import { Msg } from '../../../../src/config.js';
import { SetOrUnsetConfigCommandResult } from '../../../../src/commands/config/set.js';
chaiConfig.truncateThreshold = 0;

let testSession: TestSession;

function verifyValidationError(key: string, value: string | number, newKey: string) {
  const expected = {
    result: {
      failures: [
        {
          error: {
            exitCode: 1,
            name: 'InvalidConfigValueError',
          },
          name: newKey,
          success: false,
          value,
        },
      ],
      successes: [],
    },
    status: 1,
    warnings: [`Deprecated config name: ${key}. Please use ${newKey} instead.`],
  };
  const res = execCmd<SetOrUnsetConfigCommandResult>(`config:set ${key}=${value} --json`, { cli: 'dev' }).jsonOutput;
  assert(res?.result.failures, 'there were no failures');
  const failures = res?.result.failures;
  // validate error message / failures error message here and delete, it will vary based on the value.
  expect(failures[0]?.message).to.include('Invalid config value:');
  delete failures[0]?.message;
  expect(res).to.deep.equal(expected);
  execCmd(`config:unset ${key}`);
}

function verifyValidationStartsWith(key: string, value: string | number, message: string) {
  const res = execCmd<SetOrUnsetConfigCommandResult>(`config:set ${key}=${value} --json`, { cli: 'dev' }).jsonOutput;
  expect(res?.result).to.have.property('successes').with.length(0);
  expect(res?.result).to.have.property('failures').with.length(1);
  const result = res?.result.failures[0] as Msg;
  expect(result.message?.startsWith(message)).to.be.true;
  execCmd(`config:unset ${key}`);
}

function verifyKeysAndValuesJson(key: string, value: string | boolean, newKey: string) {
  const res = execCmd<SetOrUnsetConfigCommandResult>(`config:set ${key}=${value} --json`, {
    cli: 'dev',
    ensureExitCode: 0,
  }).jsonOutput;
  assert(res);
  expect(res).to.deep.equal({
    status: 0,
    result: {
      failures: [],
      successes: [
        {
          name: newKey,
          value: String(value),
          success: true,
        },
      ],
    },
    warnings: [`Deprecated config name: ${key}. Please use ${newKey} instead.`],
  });
  execCmd(`config:unset ${key}`);
}
function verifyKeysAndValuesStdout(key: string, value: string | boolean, assertions: string[]) {
  const res = execCmd(`config:set ${key}=${value}`, { cli: 'dev' }).shellOutput.stdout;
  expect(res).to.include('Set Config');
  assertions.forEach((assertion) => {
    expect(res).to.include(assertion);
  });

  execCmd(`config:unset ${key}`);
}

describe('config:set NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configSetNUTs' },
    devhubAuthStrategy: 'NONE',
  });

  describe('config:set errors', () => {
    it('fails to set a randomKey with InvalidVarargsFormat error', () => {
      const res = execCmd('config:set randomKey --json').jsonOutput;
      expect(res?.stack).to.include('InvalidArgumentFormatError');
      expect(res?.status).to.equal(1);
      expect(res?.exitCode).to.equal(1);
      expect(res?.name).to.include('InvalidArgumentFormatError');
    });
  });

  describe('setting valid configs and values', () => {
    describe('apiVersion', () => {
      it('will set apiVersion correctly', () => {
        verifyKeysAndValuesJson('apiVersion', '50.0', 'org-api-version');
        verifyKeysAndValuesStdout('apiVersion', '50.0', ['org-api-version', '50.0']);
      });

      it('will fail to validate apiVersion', () => {
        verifyValidationError('apiVersion', '50', 'org-api-version');
      });
    });

    describe('maxQueryLimit', () => {
      it('will set maxQueryLimit correctly', () => {
        verifyKeysAndValuesJson('maxQueryLimit', '50', 'org-max-query-limit');
        verifyKeysAndValuesStdout('maxQueryLimit', '50', ['org-max-query-limit', '50']);
      });

      it('will fail to validate maxQueryLimit', () => {
        verifyValidationError('maxQueryLimit', '-2', 'org-max-query-limit');
      });
    });

    describe('instanceUrl', () => {
      it('will set instanceUrl correctly', () => {
        verifyKeysAndValuesJson('instanceUrl', 'https://test.my.salesforce.com', 'org-instance-url');
        verifyKeysAndValuesStdout('instanceUrl', 'https://test.my.salesforce.com', [
          'org-instance-url',
          'https://test.my.salesforce.com',
        ]);
      });

      it('will fail to validate instanceUrl when bad URL', () => {
        verifyValidationStartsWith(
          'instanceUrl',
          'abc.com',
          'Invalid config value: Specify a valid Salesforce instance URL.'
        );
      });

      it('will fail to validate instanceUrl when non-Salesforce URL', () => {
        verifyValidationError('instanceUrl', 'https://not-our-url.com', 'org-instance-url');
      });
    });

    describe('isvDebuggerSid', () => {
      it('will set isvDebuggerSid correctly', () => {
        verifyKeysAndValuesJson('isvDebuggerSid', '12', 'org-isv-debugger-sid');
      });
    });

    describe('isvDebuggerUrl', () => {
      it('will set isvDebuggerUrl correctly', () => {
        verifyKeysAndValuesJson('isvDebuggerUrl', '12', 'org-isv-debugger-url');
      });
    });

    describe('disableTelemetry', () => {
      it('will set disableTelemetry correctly', () => {
        verifyKeysAndValuesJson('disableTelemetry', 'true', 'disable-telemetry');
        verifyKeysAndValuesJson('disableTelemetry', false, 'disable-telemetry');
        verifyKeysAndValuesStdout('disableTelemetry', 'true', ['disable-telemetry', 'true']);
        verifyKeysAndValuesStdout('disableTelemetry', false, ['disable-telemetry', 'false']);
      });

      it('will fail to validate disableTelemetry', () => {
        verifyValidationError('disableTelemetry', 'ab', 'disable-telemetry');
      });
    });

    describe('restDeploy', () => {
      it('will set restDeploy correctly', () => {
        verifyKeysAndValuesJson('restDeploy', 'true', 'org-metadata-rest-deploy');
        verifyKeysAndValuesJson('restDeploy', false, 'org-metadata-rest-deploy');
        verifyKeysAndValuesStdout('restDeploy', 'true', ['org-metadata-rest-deploy', 'true']);
        verifyKeysAndValuesStdout('restDeploy', false, ['org-metadata-rest-deploy', 'false']);
      });
    });
  });

  describe('set two keys and values properly', () => {
    it('will set both apiVersion and maxQueryLimit in one command', () => {
      const res = execCmd<SetOrUnsetConfigCommandResult>(
        'config:set apiVersion=51.0 maxQueryLimit=100 --json'
      ).jsonOutput;
      expect(res).to.deep.equal({
        status: 0,
        result: {
          failures: [],
          successes: [
            {
              name: 'org-api-version',
              value: '51.0',
              success: true,
            },
            {
              name: 'org-max-query-limit',
              value: '100',
              success: true,
            },
          ],
        },
        warnings: [
          'Deprecated config name: apiVersion. Please use org-api-version instead.',
          'Deprecated config name: maxQueryLimit. Please use org-max-query-limit instead.',
        ],
      });
      execCmd('config:unset apiVersion maxQueryLimit', { ensureExitCode: 0 });

      const res2 = execCmd('config:set apiVersion=51.0 maxQueryLimit=100', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res2).to.include('Set Config');
      // has these in the output table, but we don't want to catch the names from the warnings
      expect(res2).to.match(/org-max-query-limit\s+100/);
      expect(res2).to.match(/org-api-version\s+51.0/);

      execCmd('config:unset apiVersion maxQueryLimit', { ensureExitCode: 0 });
    });
  });
});

after(async () => {
  await testSession?.clean();
});
