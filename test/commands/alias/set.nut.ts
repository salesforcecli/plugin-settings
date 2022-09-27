/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { getNumber, getString } from '@salesforce/ts-types';
import { expect } from 'chai';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-settings', 'alias.set', [
  // 'summary',
  // 'description',
  // 'examples',
  'error.ArgumentsRequired',
  // 'error.DuplicateArgument',
  // 'error.InvalidArgumentFormat',
  'error.ValueRequired',
]);

function unsetAll() {
  execCmd('alias unset DevHub Admin user');
}

describe('alias set NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: { name: 'aliasSetNUTs' },
      authStrategy: 'NONE',
    });
  });

  after(async () => {
    await session?.clean();
  });

  describe('initial alias setup', () => {
    beforeEach(() => {
      unsetAll();
    });

    it('alias set multiple values and json', () => {
      const { result } = execCmd('alias set DevHub=devhuborg@salesforce.com Admin=admin@salesforce.com --json', {
        ensureExitCode: 0,
      }).jsonOutput;

      expect(result).to.deep.equal([
        { alias: 'DevHub', value: 'devhuborg@salesforce.com' },
        { alias: 'Admin', value: 'admin@salesforce.com' },
      ]);
    });

    it('alias set multiple values stdout', () => {
      const res: string = execCmd('alias set DevHub=devhuborg@salesforce.com Admin=admin@salesforce.com', {
        ensureExitCode: 0,
      }).shellOutput;

      expect(res).to.include(`Alias Set${os.EOL}=====`); // Table header
      expect(res).to.include('Alias  Value');
      expect(res).to.include('DevHub');
      expect(res).to.include('devhuborg@salesforce.com');
      expect(res).to.include('Admin');
      expect(res).to.include('admin@salesforce.com');
    });
  });

  describe('alias set overwrites existing entry', () => {
    beforeEach(() => {
      unsetAll();
      execCmd('alias set DevHub=mydevhuborg@salesforce.com');
    });

    it('alias set overwrites existing entry correctly json', () => {
      // overwriting DevHub entry to point to newdevhub
      const { result } = execCmd('alias set DevHub=newdevhub@salesforce.com Admin=admin@salesforce.com --json', {
        ensureExitCode: 0,
      }).jsonOutput;

      expect(result).to.deep.equal([
        // newdevhub verified
        { alias: 'DevHub', value: 'newdevhub@salesforce.com' },
        { alias: 'Admin', value: 'admin@salesforce.com' },
      ]);
    });

    it('alias set overwrites entry correctly stdout', () => {
      const res: string = execCmd('alias set DevHub=newdevhub@salesforce.com Admin=admin@salesforce.com', {
        ensureExitCode: 0,
      }).shellOutput;
      expect(res).to.include(`Alias Set${os.EOL}=====`); // Table header
      expect(res).to.include('Alias  Value');
      expect(res).to.include('DevHub');
      expect(res).to.include('newdevhub@salesforce.com');
      expect(res).to.include('Admin');
      expect(res).to.include('admin@salesforce.com');
    });

    it('alias set DevHub= shows error to use alias unset command', () => {
      const res = execCmd('alias set DevHub=', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include(messages.getMessages('error.ValueRequired'));
    });
  });

  describe('alias set without varargs throws error', () => {
    it('alias set --json', () => {
      // access each member individually because the stack trace will be different
      const res = execCmd('alias set  --json');
      expect(getNumber(res.jsonOutput, 'status')).to.equal(1);
      expect(getString(res.jsonOutput, 'name')).to.equal('ArgumentsRequiredError');
      expect(getString(res.jsonOutput, 'stack')).to.contain('ArgumentsRequiredError');
      expect(getString(res.jsonOutput, 'message')).to.include(messages.getMessages('error.ArgumentsRequired'));
      expect(getNumber(res.jsonOutput, 'exitCode')).to.equal(1);
    });

    it('alias set without varargs stdout', () => {
      const res: string = execCmd('alias set', {
        ensureExitCode: 1,
      }).shellOutput.stderr;

      expect(res).to.include(messages.getMessages('error.ArgumentsRequired'));
    });
  });
});
