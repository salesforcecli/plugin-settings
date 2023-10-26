/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { Hook, Interfaces } from '@oclif/core';
import { Config, ConfigPropertyMeta, Logger } from '@salesforce/core';
import { isObject, get } from '@salesforce/ts-types';
import { tsPath } from '@oclif/core/lib/config/index.js';

const log = Logger.childFromRoot('plugin-settings:load_config_meta');
const OCLIF_META_PJSON_KEY = 'configMeta';

async function loadConfigMeta(plugin: Interfaces.Plugin): Promise<ConfigPropertyMeta | undefined> {
  let configMetaRequireLocation: string | undefined;

  try {
    const configMetaPath = get(plugin, `pjson.oclif.${OCLIF_META_PJSON_KEY}`, null);

    if (typeof configMetaPath !== 'string') {
      return;
    }

    const relativePath = tsPath(plugin.root, configMetaPath);

    // use relative path if it exists, require string as is
    configMetaRequireLocation = relativePath ?? configMetaPath;
  } catch {
    return;
  }

  if (!configMetaRequireLocation) {
    return;
  }

  configMetaRequireLocation += configMetaRequireLocation.endsWith('.js') ? '' : '.js';

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const configMetaPathModule = await import(configMetaRequireLocation);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return configMetaPathModule?.default ?? configMetaPathModule;
  } catch {
    log.error(`Error trying to load config meta from ${configMetaRequireLocation}`);
    return;
  }
}

const hook: Hook<'init'> = async ({ config }): Promise<void> => {
  const flattenedConfigMetas = (config.getPluginsList() || [])
    .flatMap(async (plugin) => {
      const configMeta = await loadConfigMeta(plugin);
      if (!configMeta) {
        log.info(`No config meta found for ${plugin.name}`);
      }

      return configMeta;
    })
    .filter<Promise<ConfigPropertyMeta>>(isObject);

  if (flattenedConfigMetas.length) {
    Config.addAllowedProperties(await Promise.all(flattenedConfigMetas));
  }
  return Promise.resolve();
};

export default hook;
