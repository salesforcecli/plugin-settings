/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'alias.set');

function unsetAll() {
  // putting these in a single `execCmd` speeds up NUTs
  execCmd('alias unset DevHub Admin user');
}

describe('alias set NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: { name: 'aliasSetNUTs' },
      devhubAuthStrategy: 'NONE',
    });
  });

  after(async () => {
    await session?.clean();
  });

  describe('alias set basics', () => {
    beforeEach(() => {
      unsetAll();
    });

    it('alias set multiple values json', () => {
      const result = execCmd('alias set DevHub=devhuborg@salesforce.com Admin=admin@salesforce.com --json', {
        ensureExitCode: 0,
      }).jsonOutput?.result;

      expect(result).to.deep.equal([
        { alias: 'DevHub', success: true, value: 'devhuborg@salesforce.com' },
        { alias: 'Admin', success: true, value: 'admin@salesforce.com' },
      ]);
    });

    it('alias set multiple values stdout', () => {
      const res = execCmd('alias set DevHub=devhuborg@salesforce.com Admin=admin@salesforce.com', {
        ensureExitCode: 0,
        env: { ...process.env, SF_NO_TABLE_STYLE: 'true' },
      }).shellOutput;

      expect(res).to.include('Alias Set'); // Table header
      expect(res).to.include('alias    value                      success');
      expect(res).to.include('DevHub   devhuborg@salesforce.com   true');
      expect(res).to.include('Admin    admin@salesforce.com       true');
    });

    it('alias set with spaces in value', () => {
      const result = execCmd('alias set foo="alias with spaces" --json', {
        ensureExitCode: 0,
      }).jsonOutput?.result;

      expect(result).to.deep.equal([{ alias: 'foo', success: true, value: 'alias with spaces' }]);
    });

    it('alias set with spaces in alias (produces warning)', () => {
      const value = 'bar';
      const result = execCmd(`alias set "foo with space"=${value} --json`, {
        ensureExitCode: 0,
      }).jsonOutput;

      expect(result?.result).to.deep.equal([{ alias: 'foo with space', success: true, value }]);
      expect(result?.warnings?.map(stripLineEndings)).to.deep.equal(
        [messages.getMessage('warning.spaceAlias', ['foo with space', 'foo with space'])].map(stripLineEndings)
      );
    });

    it('allow setting a single alias without an equal sign', () => {
      const result = execCmd('alias set theKey theValue --json', {
        ensureExitCode: 0,
      }).jsonOutput?.result;

      expect(result).to.deep.equal([{ alias: 'theKey', success: true, value: 'theValue' }]);
    });

    it('throws an error if format is not correct', () => {
      const res = execCmd('alias set this=is=wrong', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include('Set varargs with this format');
    });

    it('throws an error when duplicate key is passed', () => {
      const res = execCmd('alias set foo=bar foo=baz', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include('Found duplicate argument');
    });
  });

  describe('alias set overwrites existing entry', () => {
    beforeEach(() => {
      unsetAll();
      execCmd('alias set DevHub=mydevhuborg@salesforce.com');
    });

    it('alias set overwrites existing entry correctly json', () => {
      const result = execCmd('alias set DevHub=newdevhub@salesforce.com Admin=admin@salesforce.com --json', {
        ensureExitCode: 0,
      }).jsonOutput?.result;

      expect(result).to.deep.equal([
        { alias: 'DevHub', success: true, value: 'newdevhub@salesforce.com' },
        { alias: 'Admin', success: true, value: 'admin@salesforce.com' },
      ]);
    });

    it('alias set overwrites entry correctly stdout', () => {
      const res = execCmd('alias set DevHub=newdevhub@salesforce.com Admin=admin@salesforce.com', {
        ensureExitCode: 0,
        env: { ...process.env, SF_NO_TABLE_STYLE: 'true' },
      }).shellOutput;

      expect(res).to.include('Alias Set'); // Table header
      expect(res).to.include('alias    value                      success');
      expect(res).to.include('DevHub   newdevhub@salesforce.com   true');
      expect(res).to.include('Admin    admin@salesforce.com       true');
    });
  });

  describe('alias set without varargs throws error', () => {
    it('alias set --json', () => {
      // access each member individually because the stack trace will be different
      const res = execCmd('alias set  --json');
      expect(res.jsonOutput?.status).to.equal(1);
      expect(res.jsonOutput?.name).to.equal('ArgumentsRequiredError');
      expect(res.jsonOutput?.stack).to.contain('ArgumentsRequiredError');
      expect(res.jsonOutput?.message).to.include(messages.getMessages('error.ArgumentsRequired'));
      expect(res.jsonOutput?.exitCode).to.equal(1);
    });

    it('alias set without varargs stdout', () => {
      const res = execCmd('alias set', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include(messages.getMessages('error.ArgumentsRequired'));
    });
  });
});

const stripLineEndings = (str?: string): string => str?.replace(/\r?\n|\r/g, '') ?? '';
