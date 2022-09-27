/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

function unsetAll() {
  execCmd('sf alias unset DevHub');
  execCmd('sf alias unset Admin');
  execCmd('sf alias unset user');
}

describe('alias list NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: { name: 'aliasListNUTs' },
      authStrategy: 'NONE',
    });
  });

  after(async () => {
    await session?.clean();
  });

  describe('alias list without results', () => {
    beforeEach(() => {
      unsetAll();
    });

    it('lists no aliases correctly', () => {
      const { result } = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([]);
    });

    it('lists no aliases stdout', () => {
      const res: string = execCmd('alias list').shellOutput;
      expect(res).to.include('No aliases found');
    });
  });

  describe('alias list with singular result', () => {
    beforeEach(() => {
      unsetAll();
      execCmd('alias set DevHub=mydevhuborg@salesforce.com');
    });

    it('lists singular alias correctly', () => {
      const { result } = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([
        {
          alias: 'DevHub',
          value: 'mydevhuborg@salesforce.com',
        },
      ]);
    });

    it('lists singular result correctly stdout', () => {
      const res: string = execCmd('alias list', { ensureExitCode: 0 }).shellOutput;
      expect(res).to.include(`Alias List${os.EOL}=====`); // Table header
      expect(res).to.include('DevHub');
      expect(res).to.include('mydevhuborg@salesforce.com');
    });
  });

  describe('alias list with multiple results', () => {
    beforeEach(() => {
      unsetAll();
      execCmd('alias set DevHub=mydevhuborg@salesforce.com');
      execCmd('alias set Admin=admin@salesforce.com');
      execCmd('alias set user=user@salesforce.com');
    });

    it('lists multiple results correctly JSON', () => {
      const { result } = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([
        {
          alias: 'DevHub',
          value: 'mydevhuborg@salesforce.com',
        },
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

    it('lists multiple results correctly stdout', () => {
      const res: string = execCmd('alias list', { ensureExitCode: 0 }).shellOutput;
      expect(res).to.include(`Alias List${os.EOL}=====`); // Table header
      expect(res).to.include('DevHub');
      expect(res).to.include('mydevhuborg@salesforce.com');
      expect(res).to.include('Admin');
      expect(res).to.include('admin@salesforce.com');
      expect(res).to.include('user');
      expect(res).to.include('user@salesforce.com');
    });
  });
});
