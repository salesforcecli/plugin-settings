/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { Messages } from '@salesforce/core';
import { ParserOutput } from '@oclif/core/lib/interfaces';
import validateArgs from '../../../src/shared/validate-args';

Messages.importMessagesDirectory(__dirname);
// Alias messages chosen arbitrarily. Could also pass in config.set messages.
const messages = Messages.load('@salesforce/plugin-settings', 'alias.set', [
  'error.ArgumentsRequired',
  'error.DuplicateArgument',
  'error.InvalidArgumentFormat',
  'error.ValueRequired',
]);

describe('validate-args', () => {
  let parsed: ParserOutput;

  beforeEach(() => {
    parsed = {
      flags: [],
      args: {},
      argv: [],
      raw: [],
      metadata: undefined,
    };
  });

  describe('validating errors', () => {
    it('throws an error if no argument are passed', async () => {
      try {
        validateArgs(parsed, messages);
      } catch (err) {
        expect(err.name).to.equal('ArgumentsRequiredError');
        expect(err.message).to.equal(messages.getMessage('error.ArgumentsRequired'));
      }
    });

    it('throws an error if no value is passed', async () => {
      parsed.argv = ['foo'];

      try {
        validateArgs(parsed, messages);
      } catch (err) {
        expect(err.name).to.equal('InvalidArgumentFormatError');
        expect(err.message).to.equal(messages.getMessage('error.InvalidArgumentFormat', ['foo']));
      }
    });

    it('throws an error for incorrect arg format', async () => {
      parsed.argv = ['foo=bar=baz'];

      try {
        validateArgs(parsed, messages);
      } catch (err) {
        expect(err.name).to.equal('InvalidArgumentFormatError');
        expect(err.message).to.equal(messages.getMessage('error.InvalidArgumentFormat', ['foo=bar=baz']));
      }
    });

    it('throws an error when using "key=" (prevent old way of "unsetting" values)', async () => {
      parsed.argv = ['foo='];

      try {
        validateArgs(parsed, messages);
      } catch (err) {
        expect(err.name).to.equal('ValueRequiredError');
        expect(err.message).to.equal(messages.getMessage('error.ValueRequired', ['foo']));
      }
    });

    it('throws an error for duplicate keys', async () => {
      parsed.argv = ['foo=bar', 'foo=baz'];

      try {
        validateArgs(parsed, messages);
      } catch (err) {
        expect(err.name).to.equal('DuplicateArgumentError');
        expect(err.message).to.equal(messages.getMessage('error.DuplicateArgument', ['foo']));
      }
    });
  });

  describe('validating results', () => {
    it('returns a single key=value', async () => {
      parsed.argv = ['foo=bar'];

      const results = validateArgs(parsed, messages);

      expect(results).to.deep.equal({ foo: 'bar' });
    });

    it('returns a multiple values', async () => {
      parsed.argv = ['foo=bar', 'asdf=zxcv'];

      const results = validateArgs(parsed, messages);

      expect(results).to.deep.equal({ foo: 'bar', asdf: 'zxcv' });
    });

    it('returns a single values without needing an equal sign', async () => {
      parsed.argv = ['foo', 'bar'];

      const results = validateArgs(parsed, messages);

      expect(results).to.deep.equal({ foo: 'bar' });
    });

    it('filters out args from argv', async () => {
      parsed.args = { name: 'singleDeclaredArg' };
      parsed.argv = ['singleDeclaredArg', 'my=alias'];

      const results = validateArgs(parsed, messages);

      // notice that `singleDeclaredArg` was removed
      expect(results).to.deep.equal({ my: 'alias' });
    });
  });
});
