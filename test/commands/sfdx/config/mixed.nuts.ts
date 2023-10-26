/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { assert, expect, config as chaiConfig } from 'chai';
import { SfdxPropertyKeys } from '@salesforce/core';
import { ConfigResponses } from '../../../../src/config.js';
let testSession: TestSession;
chaiConfig.truncateThreshold = 0;

describe('e2e scenario tests', async () => {
  before(async () => {
    testSession = await TestSession.create({
      project: { name: 'mixedScenarios' },
      devhubAuthStrategy: 'NONE',
    });
  });

  after(async () => {
    await testSession?.clean();
  });

  describe('set a mix of old and new stuff and verify via get/list', () => {
    describe('set via new name', () => {
      it('should set a new config value', () => {
        execCmd('config:set org-max-query-limit=500', { ensureExitCode: 0 });
        const getResult = execCmd<ConfigResponses>('config:get org-max-query-limit --json', { ensureExitCode: 0 });
        assert(getResult.jsonOutput?.result[0]);
        expect(getResult.jsonOutput.result[0].value).to.equal('500');
        expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
      });

      it('has correct value for old name, but only responds with new name', () => {
        const getResult = execCmd<ConfigResponses>(`config:get ${SfdxPropertyKeys.MAX_QUERY_LIMIT} --json`, {
          ensureExitCode: 0,
        });
        assert(getResult.jsonOutput?.result[0]);
        expect(getResult.jsonOutput.result[0].value).to.equal('500');
        expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
      });

      it('has one correct entry for org-max-query-limit', () => {
        const listResult = execCmd<ConfigResponses>('config:list --json', { ensureExitCode: 0 });
        expect(
          listResult.jsonOutput?.result.some((r) => r.name === 'org-max-query-limit' && r.value === '500')
        ).to.equal(true);
        expect(listResult.jsonOutput?.result.filter((r) => r.name === 'org-max-query-limit')).to.have.length(1);
        expect(listResult.jsonOutput?.result.filter((r) => r.name === SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.have.length(
          0
        );
      });
    });

    describe('update via old name', () => {
      it('should change the config using its old name', () => {
        execCmd(`config:set ${SfdxPropertyKeys.MAX_QUERY_LIMIT}=499`, { ensureExitCode: 0 });
        const getResult = execCmd<ConfigResponses>(`config:get ${SfdxPropertyKeys.MAX_QUERY_LIMIT} --json`, {
          ensureExitCode: 0,
        });
        assert(getResult.jsonOutput?.result[0]);
        expect(getResult.jsonOutput.result[0].value).to.equal('499');
        expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
      });

      it('has correct value for old name, but responds with new name', () => {
        const getResult = execCmd<ConfigResponses>(`config:get ${SfdxPropertyKeys.MAX_QUERY_LIMIT} --json`, {
          ensureExitCode: 0,
        });
        assert(getResult.jsonOutput?.result[0]);
        expect(getResult.jsonOutput.result[0].value).to.equal('499');
        expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
      });

      it('has one correct entry for org-max-query-limit', () => {
        const listResult = execCmd<ConfigResponses>('config:list --json', { ensureExitCode: 0 });
        expect(
          listResult.jsonOutput?.result.some((r) => r.name === 'org-max-query-limit' && r.value === '499')
        ).to.equal(true);
        expect(listResult.jsonOutput?.result.filter((r) => r.name === 'org-max-query-limit')).to.have.length(1);
        expect(listResult.jsonOutput?.result.filter((r) => r.name === SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.have.length(
          0
        );
      });
    });

    describe('update via new name', () => {
      it('should change the config using its old name', () => {
        execCmd(`config:set ${SfdxPropertyKeys.MAX_QUERY_LIMIT}=501`, { ensureExitCode: 0 });
        const getResult = execCmd<ConfigResponses>(`config:get ${SfdxPropertyKeys.MAX_QUERY_LIMIT} --json`, {
          ensureExitCode: 0,
        });
        assert(getResult.jsonOutput?.result[0]);
        expect(getResult.jsonOutput.result[0].value).to.equal('501');
        expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
      });

      it('has correct value for old name, but responds with new name', () => {
        const getResult = execCmd<ConfigResponses>(`config:get ${SfdxPropertyKeys.MAX_QUERY_LIMIT} --json`, {
          ensureExitCode: 0,
        });
        assert(getResult.jsonOutput?.result[0]);
        expect(getResult.jsonOutput.result[0].value).to.equal('501');
        expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
      });

      it('has one correct entry for org-max-query-limit', () => {
        const listResult = execCmd<ConfigResponses>('config:list --json', { ensureExitCode: 0 });
        expect(
          listResult.jsonOutput?.result.some((r) => r.name === 'org-max-query-limit' && r.value === '501')
        ).to.equal(true);
        expect(listResult.jsonOutput?.result.filter((r) => r.name === 'org-max-query-limit')).to.have.length(1);
        expect(listResult.jsonOutput?.result.filter((r) => r.name === SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.have.length(
          0
        );
      });
    });
  });
  describe('unset', () => {
    it('should unset the config using its new name', () => {
      execCmd('config:unset org-max-query-limit', { ensureExitCode: 0 });
      const getResult = execCmd<ConfigResponses>('config:get org-max-query-limit --json', { ensureExitCode: 0 });
      assert(getResult.jsonOutput?.result[0]);
      expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
      expect(getResult.jsonOutput.result[0].value).to.be.undefined;
    });

    it('config is not in list under either name', () => {
      const listResult = execCmd<ConfigResponses>('config:list --json', { ensureExitCode: 0 });

      expect(listResult.jsonOutput?.result.filter((r) => r.name === 'org-max-query-limit')).to.have.length(0);
      expect(listResult.jsonOutput?.result.filter((r) => r.name === SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.have.length(
        0
      );
    });

    it('set the config back using its new name', () => {
      execCmd('config:set org-max-query-limit=498', { ensureExitCode: 0 });
    });

    it('config is in list only under new name', () => {
      const listResult = execCmd<ConfigResponses>('config:list --json', { ensureExitCode: 0 });

      expect(listResult.jsonOutput?.result.filter((r) => r.name === 'org-max-query-limit')).to.have.length(1);
      expect(listResult.jsonOutput?.result.filter((r) => r.name === SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.have.length(
        0
      );
    });

    it('should unset the config using its old name', () => {
      execCmd(`config:unset ${SfdxPropertyKeys.MAX_QUERY_LIMIT}`, { ensureExitCode: 0 });
      const getResult = execCmd<ConfigResponses>(`config:get ${SfdxPropertyKeys.MAX_QUERY_LIMIT} --json`, {
        ensureExitCode: 0,
      });
      assert(getResult.jsonOutput?.result[0]);
      expect(getResult.jsonOutput.result[0].value).to.be.undefined;
      expect(getResult.jsonOutput.result[0].name).to.equal('org-max-query-limit');
    });

    it('config is not in list under either name', () => {
      const listResult = execCmd<ConfigResponses>('config:list --json', { ensureExitCode: 0 });

      expect(listResult.jsonOutput?.result.filter((r) => r.name === 'org-max-query-limit')).to.have.length(0);
      expect(listResult.jsonOutput?.result.filter((r) => r.name === SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.have.length(
        0
      );
    });
  });
});
