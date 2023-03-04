/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Msg } from '../../../../src/config';
import { SetConfigCommandResult } from '../../../../src/commands/config/set';
let testSession: TestSession;

function verifyValidationError(key: string, value: string | number) {
  const expected = {
    result: {
      failures: [
        {
          error: {
            exitCode: 1,
            name: 'InvalidConfigValueError',
          },
          key,
          name: key,
          success: false,
          value: value as string,
        },
      ],
      successes: [],
    },
    status: 0,
    warnings: [],
  };
  const res = execCmd<SetConfigCommandResult>(`config:set ${key}=${value} --json`).jsonOutput;
  const result = res?.result.failures as Msg[];
  // validate error message / failures error message here and delete, it will vary based on the value.
  expect(result[0]?.message).to.include('Invalid config value:');
  delete result[0]?.message;
  expect(res).to.deep.equal(expected);
  execCmd(`config:unset ${key}`);
}

function verifyValidationStartsWith(key: string, value: string | number, message: string) {
  const res = execCmd<SetConfigCommandResult>(`config:set ${key}=${value} --json`).jsonOutput;
  expect(res?.result).to.have.property('successes').with.length(0);
  expect(res?.result).to.have.property('failures').with.length(1);
  const result = res?.result.failures[0] as Msg;
  expect(result.message?.startsWith(message)).to.be.true;
  execCmd(`config:unset ${key}`);
}

function verifyKeysAndValuesJson(key: string, value: string | boolean) {
  const res = execCmd<SetConfigCommandResult>(`config:set ${key}=${value} --json`, { ensureExitCode: 0 }).jsonOutput;
  expect(res?.result.successes[0]?.message).to.include(`Deprecated config name: ${key}. Please use`);
  delete res?.result.successes[0]?.message;
  expect(res).to.deep.equal({
    status: 0,
    result: {
      failures: [],
      successes: [
        {
          name: key,
          value: String(value),
          success: true,
          error: {
            name: 'DeprecatedConfigKeyError',
            exitCode: 1,
          },
        },
      ],
    },
    warnings: [],
  });
  execCmd(`config:unset ${key}`);
}
function verifyKeysAndValuesStdout(key: string, value: string | boolean, assertions: string[]) {
  const res = execCmd(`config:set ${key}=${value}`).shellOutput.stdout;
  expect(res).to.include('Set Config');
  assertions.forEach((assertion) => {
    expect(res).to.include(assertion);
  });

  execCmd(`config:unset ${key}`);
}

describe('config:set NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configSetNUTs' },
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
        verifyKeysAndValuesJson('apiVersion', '50.0');
        verifyKeysAndValuesStdout('apiVersion', '50.0', ['apiVersion', '50.0']);
      });

      it('will fail to validate apiVersion', () => {
        verifyValidationError('apiVersion', '50');
      });
    });

    describe('maxQueryLimit', () => {
      it('will set maxQueryLimit correctly', () => {
        verifyKeysAndValuesJson('maxQueryLimit', '50');
        verifyKeysAndValuesStdout('maxQueryLimit', '50', ['maxQueryLimit', '50']);
      });

      it('will fail to validate maxQueryLimit', () => {
        verifyValidationError('maxQueryLimit', '-2');
      });
    });

    describe('instanceUrl', () => {
      it('will set instanceUrl correctly', () => {
        verifyKeysAndValuesJson('instanceUrl', 'https://test.my.salesforce.com');
        verifyKeysAndValuesStdout('instanceUrl', 'https://test.my.salesforce.com', [
          'instanceUrl',
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
        verifyValidationError('instanceUrl', 'https://not-our-url.com');
      });
    });

    describe('isvDebuggerSid', () => {
      it('will set isvDebuggerSid correctly', () => {
        verifyKeysAndValuesJson('isvDebuggerSid', '12');
      });
    });

    describe('isvDebuggerUrl', () => {
      it('will set isvDebuggerUrl correctly', () => {
        verifyKeysAndValuesJson('isvDebuggerUrl', '12');
      });
    });

    describe('disableTelemetry', () => {
      it('will set disableTelemetry correctly', () => {
        verifyKeysAndValuesJson('disableTelemetry', 'true');
        verifyKeysAndValuesJson('disableTelemetry', false);
        verifyKeysAndValuesStdout('disableTelemetry', 'true', ['disableTelemetry', 'true']);
        verifyKeysAndValuesStdout('disableTelemetry', false, ['disableTelemetry', 'false']);
      });

      it('will fail to validate disableTelemetry', () => {
        verifyValidationError('disableTelemetry', 'ab');
      });
    });

    describe('restDeploy', () => {
      it('will set restDeploy correctly', () => {
        verifyKeysAndValuesJson('restDeploy', 'true');
        verifyKeysAndValuesJson('restDeploy', false);
        verifyKeysAndValuesStdout('restDeploy', 'true', ['restDeploy', 'true']);
        verifyKeysAndValuesStdout('restDeploy', false, ['restDeploy', 'false']);
      });
    });
  });

  describe('set two keys and values properly', () => {
    it('will set both apiVersion and maxQueryLimit in one command', () => {
      const res = execCmd('config:set apiVersion=51.0 maxQueryLimit=100 --json').jsonOutput;
      expect(res).to.deep.equal({
        status: 0,
        result: {
          failures: [],
          successes: [
            {
              name: 'apiVersion',
              value: '51.0',
              success: true,
              error: {
                name: 'DeprecatedConfigKeyError',
                exitCode: 1,
              },
              message: 'Deprecated config name: apiVersion. Please use org-api-version instead.',
            },
            {
              name: 'maxQueryLimit',
              value: '100',
              success: true,
              error: {
                name: 'DeprecatedConfigKeyError',
                exitCode: 1,
              },
              message: 'Deprecated config name: maxQueryLimit. Please use org-max-query-limit instead.',
            },
          ],
        },
        warnings: [],
      });
      execCmd('config:unset apiVersion maxQueryLimit');

      const res2 = execCmd('config:set apiVersion=51.0 maxQueryLimit=100', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res2).to.include('Set Config');
      expect(res2).to.include('apiVersion');
      expect(res2).to.include('51.0');
      expect(res2).to.include('maxQueryLimit');
      expect(res2).to.include('100');

      execCmd('config:unset apiVersion maxQueryLimit');
    });
  });
});

after(async () => {
  await testSession?.clean();
});