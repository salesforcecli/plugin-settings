/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

function unsetAll() {
  // putting these in a single `execCmd` speeds up NUTs
  execCmd('alias unset DevHub Admin user');
}

describe('alias list NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: { name: 'aliasListNUTs' },
      devhubAuthStrategy: 'NONE',
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
      const result = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput?.result;
      expect(result).to.deep.equal([]);
    });

    it('lists no aliases stdout', () => {
      const res = execCmd('alias list').shellOutput;
      expect(res).to.include('No results');
    });
  });

  describe('alias list with singular result', () => {
    beforeEach(() => {
      unsetAll();
      execCmd('alias set DevHub=mydevhuborg@salesforce.com');
    });

    it('lists singular alias correctly', () => {
      const result = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput?.result;
      expect(result).to.deep.equal([
        {
          alias: 'DevHub',
          value: 'mydevhuborg@salesforce.com',
        },
      ]);
    });

    it('lists singular result correctly stdout', () => {
      const res = execCmd('alias list', {
        ensureExitCode: 0,
        env: { ...process.env, SF_NO_TABLE_STYLE: 'true' },
      }).shellOutput;
      expect(res).to.include('Alias List'); // Table header
      expect(res).to.include('alias   value');
      expect(res).to.include('DevHub  mydevhuborg@salesforce.com');
    });
  });

  describe('alias list with multiple results', () => {
    beforeEach(() => {
      unsetAll();
      // putting these in a single `execCmd` speeds up NUTs
      execCmd('alias set DevHub=mydevhuborg@salesforce.com Admin=admin@salesforce.com user=user@salesforce.com');
    });

    it('lists multiple results correctly JSON', () => {
      const result = execCmd('alias list --json', { ensureExitCode: 0 }).jsonOutput?.result;
      expect(result).lengthOf(3);
      [
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
      ].map((expected) => expect(result).to.deep.include(expected));
    });

    it('lists multiple results correctly stdout', () => {
      const res = execCmd('alias list', {
        ensureExitCode: 0,
        env: { ...process.env, SF_NO_TABLE_STYLE: 'true' },
      }).shellOutput;

      expect(res).to.include('Alias List'); // Table header
      expect(res).to.include('alias   value');
      expect(res).to.include('DevHub  mydevhuborg@salesforce.com');
      expect(res).to.include('Admin   admin@salesforce.com');
      expect(res).to.include('user    user@salesforce.com');
    });
  });
});
