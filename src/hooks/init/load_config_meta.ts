/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { Hook, Interfaces } from '@oclif/core';
import { Config, ConfigPropertyMeta } from '@salesforce/core';
import { isObject, get } from '@salesforce/ts-types';
import { ModuleLoader } from '@oclif/core';

const OCLIF_META_PJSON_KEY = 'configMeta';

async function loadConfigMeta(plugin: Interfaces.Plugin): Promise<ConfigPropertyMeta | undefined> {
  try {
    const configMetaPath = get(plugin, `pjson.oclif.${OCLIF_META_PJSON_KEY}`, null);

    if (typeof configMetaPath !== 'string') {
      return;
    }

    const module = await ModuleLoader.load<{ default?: ConfigPropertyMeta }>(plugin, configMetaPath);
    return module.default;
  } catch (err) {
    return;
  }
}

const hook: Hook<'init'> = async ({ config, context }): Promise<void> => {
  const flattenedConfigMetas = (
    await Promise.all(
      (config.getPluginsList() || []).flatMap(async (plugin) => {
        const configMeta = await loadConfigMeta(plugin);
        if (!configMeta) {
          context.debug(`No config meta found for ${plugin.name}`);
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
