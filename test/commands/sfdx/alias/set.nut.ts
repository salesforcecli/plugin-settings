/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
let testSession: TestSession;

function unsetAll() {
  execCmd('alias:unset DevHub');
  execCmd('alias:unset Admin');
  execCmd('alias:unset user');
}

describe('alias:set NUTs', async () => {
  testSession = await TestSession.create({
    devhubAuthStrategy: 'NONE',
  });

  describe('initial alias setup', () => {
    beforeEach(() => {
      unsetAll();
    });

    it('alias:set multiple values and json', () => {
      const res = execCmd('alias:set DevHub=devhuborg@salesforce.com Admin=admin@salesforce.com --json', {
        ensureExitCode: 0,
      });
      expect(res.jsonOutput).to.deep.equal({
        result: [
          { alias: 'DevHub', success: true, value: 'devhuborg@salesforce.com' },
          { alias: 'Admin', success: true, value: 'admin@salesforce.com' },
        ],
        status: 0,
        warnings: [],
      });
    });

    it('alias:set multiple values stdout', () => {
      const res: string = execCmd('alias:set DevHub=devhuborg@salesforce.com Admin=admin@salesforce.com', {
        ensureExitCode: 0,
      }).shellOutput;
      expect(res).to.include('Alias Set');
      expect(res).to.include('Alias  Value');
      expect(res).to.include('DevHub');
      expect(res).to.include('devhuborg@salesforce.com');
      expect(res).to.include('Admin');
      expect(res).to.include('admin@salesforce.com');
    });
  });

  describe('alias:set overwrites existing entry', () => {
    beforeEach(() => {
      unsetAll();
      execCmd('alias:set DevHub=mydevhuborg@salesforce.com');
    });

    it('alias:set overwrites existing entry correctly json', () => {
      // overwriting DevHub entry to point to newdevhub
      const res = execCmd('alias:set DevHub=newdevhub@salesforce.com Admin=admin@salesforce.com --json', {
        ensureExitCode: 0,
      });
      expect(res.jsonOutput).to.deep.equal({
        result: [
          // newdevhub verified
          { alias: 'DevHub', success: true, value: 'newdevhub@salesforce.com' },
          { alias: 'Admin', success: true, value: 'admin@salesforce.com' },
        ],
        warnings: [],
        status: 0,
      });
    });

    it('alias:set overwrites entry correctly stdout', () => {
      const res: string = execCmd('alias:set DevHub=newdevhub@salesforce.com Admin=admin@salesforce.com', {
        ensureExitCode: 0,
      }).shellOutput;
      expect(res).to.include('Alias Set');
      expect(res).to.include('Alias  Value');
      expect(res).to.include('DevHub');
      expect(res).to.include('newdevhub@salesforce.com');
      expect(res).to.include('Admin');
      expect(res).to.include('admin@salesforce.com');
    });

    it('alias:set DevHub= sets DevHub entry to undefined stdout', () => {
      const res: string = execCmd('alias:set DevHub=', {
        ensureExitCode: 0,
      }).shellOutput;
      expect(res).to.include('Alias Set');
      expect(res).to.include('Alias  Value');
      expect(res).to.include('DevHub');
      expect(res).to.not.include('newdevhub@salesforce.com');
    });
  });

  describe('alias:set without varargs throws error', () => {
    it('alias:set --json', () => {
      // access each member individually because the stack trace will be different
      const res = execCmd('alias:set  --json');
      expect(res.jsonOutput?.status).to.equal(1);
      expect(res.jsonOutput?.name).to.equal('ArgumentsRequiredError');
      expect(res.jsonOutput?.stack).to.contain('ArgumentsRequiredError');
      expect(res.jsonOutput?.message).to.contain(
        'You must provide one or more aliases to set. Use the --help flag to see examples.'
      );
      expect(res.jsonOutput?.exitCode).to.equal(1);
    });

    it('alias:set without varargs stdout', () => {
      const res: string = execCmd('alias:set ').shellOutput.stderr;
      expect(res).to.include('You must provide one or more aliases to set. Use the --help flag to see examples.');
    });
  });
});

afterEach(async () => {
  await testSession?.clean();
});
