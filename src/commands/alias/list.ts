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

import { StateAggregator, Messages } from '@salesforce/core';
import { loglevel } from '@salesforce/sf-plugins-core';
import { AliasCommand, AliasResults } from '../../alias.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-settings', 'alias.list');
export default class AliasList extends AliasCommand<AliasResults> {
  public static summary = messages.getMessage('summary');
  public static description = messages.getMessage('description');
  public static examples = messages.getMessages('examples');
  public static readonly aliases = ['force:alias:list'];
  public static readonly deprecateAliases = true;
  public static readonly flags = { loglevel };
  public async run(): Promise<AliasResults> {
    await this.parse(AliasList);
    const stateAggregator = await StateAggregator.getInstance();
    const aliases = stateAggregator.aliases.getAll();

    const results = Object.entries(aliases).map(([alias, value]) => ({ alias, value }));

    this.output('Alias List', results);

    return results;
  }
}
