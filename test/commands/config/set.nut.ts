/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { assert, expect } from 'chai';
import { Messages } from '@salesforce/core';
import { SetOrUnsetConfigCommandResult } from '../../../src/commands/config/set.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.set');

let testSession: TestSession;

function verifyValidationError(key: string, value: string) {
  const expected = {
    result: {
      failures: [
        {
          error: {
            exitCode: 1,
            name: 'InvalidConfigValueError',
          },
          name: key,
          success: false,
          value,
        },
      ],
      successes: [],
    },
    status: 1,
    warnings: [],
  };
  const res = execCmd<SetOrUnsetConfigCommandResult>(`config:set ${key}=${value} --json`).jsonOutput;
  const failures = res?.result.failures;
  assert(failures, 'there were no failures');
  // validate error message / failures error message here and delete, it will vary based on the value.
  expect(failures[0]?.message).to.include('Invalid config value:');
  delete failures[0]?.message;
  expect(res).to.deep.equal(expected);
  execCmd(`config:unset ${key}`);
}

function verifyKeysAndValuesJson(key: string, value: string | boolean) {
  const result = execCmd<SetOrUnsetConfigCommandResult>(`config set ${key}=${value} --json`, { ensureExitCode: 0 })
    .jsonOutput?.result;
  const expected = { failures: [], successes: [{ name: key, success: true }] } as SetOrUnsetConfigCommandResult;
  if (value !== '') expected.successes[0].value = `${value}`;
  expect(result).to.deep.equal(expected);
  execCmd(`config unset ${key}`);
}

function verifyKeysAndValuesStdout(key: string, value: string | boolean, assertions: string[]) {
  const res = execCmd(`config set ${key}=${value}`).shellOutput.stdout;
  expect(res).to.include('Set Config');
  assertions.forEach((assertion) => {
    expect(res).to.include(assertion);
  });

  execCmd(`config unset ${key}`);
}

describe('config set NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configSetNUTs' },
    devhubAuthStrategy: 'NONE',
  });

  describe('config set errors', () => {
    it('fails to set a randomKey with InvalidArgumentFormat error', () => {
      const res = execCmd('config set randomKey --json', {
        ensureExitCode: 1,
      }).jsonOutput;
      expect(res?.name).to.include('InvalidArgumentFormat');
    });

    it('throws an error if no varargs are passed', () => {
      const res: string = execCmd('config set', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include(messages.getMessages('error.ArgumentsRequired'));
    });

    it('don\'t allow using "set=" to unset a config key', () => {
      execCmd<SetOrUnsetConfigCommandResult>('config set org-api-version=50.0 --json', { cli: 'sf', ensureExitCode: 0 })
        .jsonOutput;

      const result = execCmd<SetOrUnsetConfigCommandResult>('config set org-api-version= --json', {
        ensureExitCode: 1,
      }).jsonOutput?.result.failures;

      expect(result).to.deep.equal([
        {
          name: 'org-api-version',
          success: false,
          error: {
            name: 'ValueRequiredError',
            exitCode: 1,
          },
          message: messages.getMessage('error.ValueRequired'),
        },
      ]);
    });
  });

  describe('setting valid configs and values', () => {
    describe('org-api-version', () => {
      it('will set org-api-version correctly', () => {
        verifyKeysAndValuesJson('org-api-version', '50.0');
        verifyKeysAndValuesStdout('org-api-version', '50.0', ['org-api-version', '50.0']);
      });

      it('will fail to validate org-api-version', () => {
        verifyValidationError('org-api-version', '50');
      });
    });

    describe('org-max-query-limit', () => {
      it('will set org-max-query-limit correctly', () => {
        verifyKeysAndValuesJson('org-max-query-limit', '50');
        verifyKeysAndValuesStdout('org-max-query-limit', '50', ['org-max-query-limit', '50']);
      });

      it('will fail to validate org-max-query-limit', () => {
        verifyValidationError('org-max-query-limit', '-2');
      });
    });

    describe('org-instance-url', () => {
      it('will set org-instance-url correctly', () => {
        verifyKeysAndValuesJson('org-instance-url', 'https://test.my.salesforce.com');
        verifyKeysAndValuesStdout('org-instance-url', 'https://test.my.salesforce.com', [
          'org-instance-url',
          'https://test.my.salesforce.com',
        ]);
      });

      it('will fail to validate org-instance-url when non-Salesforce URL', () => {
        verifyValidationError('org-instance-url', 'abc.com');
      });
    });

    describe('target orgs', () => {
      it('will fail to validate target-org', () => {
        const expected = {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'target-org',
                success: false,
                value: 'ab',
                error: {
                  cause: {},
                  name: 'Error',
                  exitCode: 1,
                },
                message: 'Invalid config value: org "ab" is not authenticated.',
              },
            ],
          },
          warnings: [],
        };
        const res = execCmd<SetOrUnsetConfigCommandResult>('config:set target-org=ab --json').jsonOutput;
        expect(res).to.deep.equal(expected);
      });

      it('will fail to validate target-dev-org', () => {
        const expected = {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'target-dev-hub',
                success: false,
                value: 'ab',
                error: {
                  cause: {},
                  name: 'Error',
                  exitCode: 1,
                },
                message: 'Invalid config value: org "ab" is not authenticated.',
              },
            ],
          },
          warnings: [],
        };
        const res = execCmd<SetOrUnsetConfigCommandResult>('config:set target-dev-hub=ab --json').jsonOutput;
        expect(res).to.deep.equal(expected);
      });
    });

    describe('org-isv-debugger-sid', () => {
      it('will set org-isv-debugger-sid correctly', () => {
        verifyKeysAndValuesJson('org-isv-debugger-sid', '12');
      });
    });

    describe('org-isv-debugger-url', () => {
      it('will set org-isv-debugger-url correctly', () => {
        verifyKeysAndValuesJson('org-isv-debugger-url', '12');
      });
    });

    describe('disable-telemetry', () => {
      it('will set disable-telemetry correctly', () => {
        verifyKeysAndValuesJson('disable-telemetry', 'true');
        verifyKeysAndValuesJson('disable-telemetry', false);
        verifyKeysAndValuesStdout('disable-telemetry', 'true', ['disable-telemetry', 'true']);
        verifyKeysAndValuesStdout('disable-telemetry', false, ['disable-telemetry', 'false']);
      });

      it('will fail to validate disable-telemetry', () => {
        verifyValidationError('disable-telemetry', 'ab');
      });
    });
  });

  describe('set two keys and values properly', () => {
    it('will set both org-api-version and org-max-query-limit in one command', () => {
      const result = execCmd<SetOrUnsetConfigCommandResult>(
        'config set org-api-version=51.0 org-max-query-limit=100 --json'
      ).jsonOutput?.result.successes;
      expect(result).to.deep.equal([
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
      ]);
      execCmd('config unset org-api-version org-max-query-limit');

      const res2 = execCmd('config set org-api-version=51.0 org-max-query-limit=100', { ensureExitCode: 0 }).shellOutput
        .stdout;
      expect(res2).to.include('Set Config');
      expect(res2).to.include('org-api-version');
      expect(res2).to.include('51.0');
      expect(res2).to.include('org-max-query-limit');
      expect(res2).to.include('100');

      execCmd('config unset org-api-version org-max-query-limit');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
