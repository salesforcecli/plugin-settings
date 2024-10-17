/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Ux } from '@salesforce/sf-plugins-core';
import { ConfigInfo, SfError, Config } from '@salesforce/core';
import { toHelpSection } from '@salesforce/sf-plugins-core';
import Levenshtein from 'fast-levenshtein';
import { HelpSection } from '@oclif/core';

export type Msg = {
  name: string;
  value?: string | boolean | number | null;
  success: boolean;
  location?: string;
  path?: string;
  message?: string;
  error?: Error;
  // added to support plugin-config in sfdx
  successes?: Array<{ message?: string; name: string }>;
  failures?: Array<{ message?: string; name: string }>;
  key?: string;
  deprecated?: boolean;
};
export type ConfigResponses = Msg[];

export const CONFIG_HELP_SECTION: HelpSection = toHelpSection(
  'CONFIGURATION VARIABLES',
  ...new Set(Config.getAllowedProperties().map((k) => k.newKey ?? k.key))
);

export const calculateSuggestion = (userEnteredConfig: string): string => {
  // we'll use this array to keep track of which key is the closest to the users entered value.
  // keys closer to the index 0 will be a closer guess than keys indexed further from 0
  // an entry at 0 would be a direct match, an entry at 1 would be a single character off, etc.
  const index: string[] = [];
  Config.getAllowedProperties()
    .map((k) => k.newKey ?? k.key)
    .map((k) => (index[Levenshtein.get(userEnteredConfig, k)] = k));
  return index.find((item) => item !== undefined) ?? '';
};

export const buildFailureMsg = (name: string, err: unknown, value?: string): Msg => {
  const error = SfError.wrap(typeof err !== 'string' && !(err instanceof Error) ? 'Unknown error' : err);
  return {
    name,
    success: false,
    value,
    error,
    message: error.message.replace(/\.\.$/, '.'),
  };
};

export const buildSuccessMsg = (configInfo: ConfigInfo): Msg => {
  if (Array.isArray(configInfo.value)) {
    throw new SfError(`Config ${configInfo.key} is an Array.  It should be a primitive.`);
  }
  if (typeof configInfo.value === 'object') {
    throw new SfError(`Config ${configInfo.key} is an Object.  It should be a primitive.`);
  }
  return {
    name: configInfo.key,
    key: configInfo.key,
    value: configInfo.value,
    path: configInfo.path,
    success: true,
    location: configInfo.location,
  };
};

export const output = (ux: Ux, responses: Msg[], command: 'set' | 'unset' | 'list' | 'get', verbose = false): void => {
  if (!ux.outputEnabled) {
    return;
  }
  if (responses.length === 0) {
    ux.log('No results found');
    return;
  }

  const data = responses.map((response) => ({
    name: response.name,
    ...(verbose ? { location: response.location ?? '' } : {}),
    ...(command === 'unset' ? {} : { value: response.value }),
    ...(command === 'list' ? {} : { success: response.success }),
    ...(responses.some((msg) => msg.error)
      ? {
          message: response.error?.message ?? '',
        }
      : {}),
  }));

  ux.table({
    data,
    title: commandToTitleMapping[command],
  });
};

const commandToTitleMapping = {
  set: 'Set Config',
  unset: 'Unset Config',
  list: 'List Config',
  get: 'Get Config',
} as const;
