/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.unset', [
  'error.NameRequired',
  'error.NoAliasesSet',
  'warning.AliasIsNotSet',
]);

describe('alias unset NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: { name: 'aliasUnsetNUTs' },
      authStrategy: 'NONE',
    });
  });

  after(async () => {
    await session?.clean();
  });

  describe('alias unset non-existent key', () => {
    it("will skip a key if it doesn't exist", () => {
      const { result } = execCmd('alias unset noAlias --json', { ensureExitCode: 0 }).jsonOutput;

      expect(result).to.deep.equal([]);
    });

    it("will skip a key if it doesn't exist stdout", () => {
      const res: string = execCmd('alias unset noAlias', {
        ensureExitCode: 0,
      }).shellOutput;

      expect(res).to.include(messages.getMessage('warning.AliasIsNotSet', ['noAlias']));
      expect(res).to.include('No aliases unset');
    });
  });

  describe('alias unset single value', () => {
    beforeEach(() => {
      // putting these in a single `execCmd` speeds up NUTs
      execCmd('alias set DevHub=mydevhuborg@salesforce.com Admin=admin@salesforce.com user=user@salesforce.com');
    });

    it('alias unset --json', () => {
      const { result } = execCmd('alias unset DevHub --json', { ensureExitCode: 0 }).jsonOutput;

      expect(result).to.deep.equal([
        {
          alias: 'DevHub',
          success: true,
          value: 'mydevhuborg@salesforce.com',
        },
      ]);

      const { result: listResult } = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput;

      expect(listResult).to.deep.equal([
        {
          alias: 'Admin',
          value: 'admin@salesforce.com',
        },
        {
          alias: 'user',
          value: 'user@salesforce.com',
        },
      ]);
    });

    it('alias unset DevHub', () => {
      const res: string = execCmd('alias unset DevHub', {
        ensureExitCode: 0,
      }).shellOutput;

      expect(res).to.include(`Alias Unset${os.EOL}=====`); // Table header
      expect(res).to.include('Alias  Value                      Success');
      expect(res).to.include('DevHub mydevhuborg@salesforce.com true');
    });
  });

  describe('alias unset error cases', () => {
    it('throws an error if key is missing', () => {
      const res = execCmd('alias unset', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include(messages.getMessages('error.NameRequired'));
    });

    it('throws a (non-zero) error if --all is passed but no aliases are set', () => {
      execCmd('alias unset --all --no-prompt');

      const res = execCmd('alias unset --all --no-prompt', {
        // NOTE: exitcode 0 since the end goal is accomplished (no aliases being set)
        ensureExitCode: 0,
      }).shellOutput.stderr;

      expect(res).to.include(messages.getMessages('error.NoAliasesSet'));
    });
  });

  describe('alias unset multiple values', () => {
    beforeEach(() => {
      // putting these in a single `execCmd` speeds up NUTs
      execCmd('alias set DevHub=mydevhuborg@salesforce.com Admin=admin@salesforce.com user=user@salesforce.com');
    });

    it('alias unset --json', () => {
      const { result } = execCmd('alias unset DevHub user --json', { ensureExitCode: 0 }).jsonOutput;

      expect(result).to.deep.equal([
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
      ]);

      const { result: listResult } = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput;

      expect(listResult).to.deep.equal([
        {
          alias: 'Admin',
          value: 'admin@salesforce.com',
        },
      ]);
    });

    it('alias unset DevHub user', () => {
      const res: string = execCmd('alias unset DevHub user', {
        ensureExitCode: 0,
      }).shellOutput;

      expect(res).to.include(`Alias Unset${os.EOL}=====`); // Table header
      expect(res).to.include('Alias  Value                      Success');
      expect(res).to.include('DevHub mydevhuborg@salesforce.com true');
      expect(res).to.include('user   user@salesforce.com        true');
    });

    it('removes all aliases when passing --all', () => {
      const { result } = execCmd('alias unset --all --no-prompt --json', { ensureExitCode: 0 }).jsonOutput;

      expect(result).to.deep.equal([
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
      ]);

      const { result: listResult } = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput;

      expect(listResult).to.deep.equal([]);
    });
  });
});
