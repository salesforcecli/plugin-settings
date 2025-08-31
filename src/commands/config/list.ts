/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConfigAggregator, Messages } from '@salesforce/core';
import { loglevel, SfCommand, Ux } from '@salesforce/sf-plugins-core';
import { ConfigResponses, buildSuccessMsg, output } from '../../config.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'config.list');

export default class List extends SfCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:config:list'];
  public static readonly deprecateAliases = true;
  public static readonly flags = { loglevel };

  public async run(): Promise<ConfigResponses> {
    const aggregator = await ConfigAggregator.create();

    const responses = aggregator.getConfigInfo().map((c) => buildSuccessMsg(c));

    output(new Ux({ jsonEnabled: this.jsonEnabled() }), responses, 'list', true);

    return responses;
  }
}
