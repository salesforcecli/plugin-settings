/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Messages } from '@salesforce/core';
import { AliasResults } from '../../../src/alias.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'alias.unset');

describe('alias unset NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: { name: 'aliasUnsetNUTs' },
      devhubAuthStrategy: 'NONE',
    });
  });

  after(async () => {
    await session?.clean();
  });

  describe('unsetting non-existent key is a success (json)', () => {
    it('unsetting a non-existent key will report success', () => {
      const result = execCmd('alias unset noAlias --json', { ensureExitCode: 0 }).jsonOutput?.result;

      expect(result).to.deep.equal([
        {
          alias: 'noAlias',
          success: true,
        },
      ]);
    });

    it('unsetting non-existent key is a success (stdout)', () => {
      const res = execCmd('alias unset noAlias', {
        ensureExitCode: 0,
        env: { ...process.env, SF_NO_TABLE_STYLE: 'true' },
      }).shellOutput;

      expect(res).to.include('Alias Unset'); // Table header
      expect(res).to.include('alias     value   success');
      expect(res).to.include('noAlias           true');
    });
  });

  describe('alias unset single value', () => {
    beforeEach(() => {
      // putting these in a single `execCmd` speeds up NUTs
      execCmd('alias set DevHub=mydevhuborg@salesforce.com Admin=admin@salesforce.com user=user@salesforce.com');
    });

    it('alias unset --json', () => {
      const result = execCmd('alias unset DevHub --json', { ensureExitCode: 0 }).jsonOutput?.result;

      expect(result).to.deep.equal([
        {
          alias: 'DevHub',
          success: true,
          value: 'mydevhuborg@salesforce.com',
        },
      ]);

      const res = execCmd<AliasResults>('alias list --json', { ensureExitCode: 0 }).jsonOutput?.result;
      expect(res).lengthOf(2);
      [
        {
          alias: 'Admin',
          value: 'admin@salesforce.com',
        },
        {
          alias: 'user',
          value: 'user@salesforce.com',
        },
      ].map((expected) => expect(res).to.deep.include(expected));
    });

    it('alias unset DevHub', () => {
      const res = execCmd('alias unset DevHub', {
        ensureExitCode: 0,
        env: { ...process.env, SF_NO_TABLE_STYLE: 'true' },
      }).shellOutput;

      expect(res).to.include('Alias Unset'); // Table header
      expect(res).to.include('alias    value                        success');
      expect(res).to.include('DevHub   mydevhuborg@salesforce.com   true');
    });
  });

  describe('alias unset error cases', () => {
    it('throws an error if key is missing', () => {
      const res = execCmd('alias unset', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include(messages.getMessages('error.NameRequired'));
    });

    it('shows a warning if --all is passed but no aliases are set', () => {
      execCmd('alias unset --all --no-prompt');

      const res = execCmd('alias unset --all --no-prompt --json', { ensureExitCode: 0 }).shellOutput.stdout;

      expect(res).to.include(messages.getMessages('warning.NoAliasesSet'));
    });
  });

  describe('alias unset multiple values', () => {
    beforeEach(() => {
      // putting these in a single `execCmd` speeds up NUTs
      execCmd('alias set DevHub=mydevhuborg@salesforce.com Admin=admin@salesforce.com user=user@salesforce.com');
    });

    it('alias unset --json', () => {
      const result = execCmd('alias unset DevHub user --json', { ensureExitCode: 0 }).jsonOutput?.result;
      expect(result).lengthOf(2);
      [
        {
          alias: 'DevHub',
          success: true,
          value: 'mydevhuborg@salesforce.com',
        },
        {
          alias: 'user',
          success: true,
          value: 'user@salesforce.com',
        },
      ].map((expected) => expect(result).to.deep.include(expected));

      const res = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput?.result;

      expect(res).to.deep.equal([
        {
          alias: 'Admin',
          value: 'admin@salesforce.com',
        },
      ]);
    });

    it('alias unset DevHub user', () => {
      const res = execCmd('alias unset DevHub user', {
        ensureExitCode: 0,
        env: { ...process.env, SF_NO_TABLE_STYLE: 'true' },
      }).shellOutput;

      expect(res).to.include('Alias Unset'); // Table header
      expect(res).to.include('alias    value                        success');
      expect(res).to.include('DevHub   mydevhuborg@salesforce.com   true');
      expect(res).to.include('user     user@salesforce.com          true');
    });

    it('removes all aliases when passing --all', () => {
      const result = execCmd('alias unset --all --no-prompt --json', { ensureExitCode: 0 }).jsonOutput?.result;
      expect(result).lengthOf(3);
      [
        {
          alias: 'Admin',
          success: true,
          value: 'admin@salesforce.com',
        },
        {
          alias: 'DevHub',
          success: true,
          value: 'mydevhuborg@salesforce.com',
        },
        {
          alias: 'user',
          success: true,
          value: 'user@salesforce.com',
        },
      ].map((expected) => expect(result).to.deep.include(expected));

      const res = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput?.result;

      expect(res).to.deep.equal([]);
    });
  });
});
