/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { Hook, Interfaces } from '@oclif/core';
import { Config, ConfigPropertyMeta, Logger } from '@salesforce/core';
import { isObject, get } from '@salesforce/ts-types';
import { load } from '@oclif/core/lib/module-loader.js';

const log = Logger.childFromRoot('plugin-settings:load_config_meta');
const OCLIF_META_PJSON_KEY = 'configMeta';

async function loadConfigMeta(plugin: Interfaces.Plugin): Promise<ConfigPropertyMeta | undefined> {
  try {
    const configMetaPath = get(plugin, `pjson.oclif.${OCLIF_META_PJSON_KEY}`, null);

    if (typeof configMetaPath !== 'string') {
      return;
    }

    const x = (await load(plugin, configMetaPath)) as { default: ConfigPropertyMeta };

    log.info(x);

    return x.default ?? x;
  } catch {
    return;
  }
}

const hook: Hook<'init'> = async ({ config }): Promise<void> => {
  const flattenedConfigMetas = (
    await Promise.all(
      (config.getPluginsList() || []).flatMap(async (plugin) => {
        const configMeta = await loadConfigMeta(plugin);
        if (!configMeta) {
          log.info(`No config meta found for ${plugin.name}`);
        }

        return configMeta;
      })
    )
  ).filter<ConfigPropertyMeta>(isObject);

  if (flattenedConfigMetas.length) {
    Config.addAllowedProperties(flattenedConfigMetas);
  }
  return Promise.resolve();
};

export default hook;
