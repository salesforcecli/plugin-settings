/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { Hook } from '@oclif/core';
import type { ConfigPropertyMeta } from '@salesforce/core';
import { ModuleLoader } from '@oclif/core';

const OCLIF_META_PJSON_KEY = 'configMeta';

const hook: Hook<'init'> = async ({ config, context }): Promise<void> => {
  const flattenedConfigMetas = (
    await Promise.all(
      (config.getPluginsList() || []).flatMap(async (plugin) => {
        const oclif = (plugin.pjson.oclif ?? {}) as { [OCLIF_META_PJSON_KEY]?: string };
        const configMetaPath = oclif[OCLIF_META_PJSON_KEY];
        if (!configMetaPath) return;

        const module = await ModuleLoader.load<{ default?: ConfigPropertyMeta[] }>(plugin, configMetaPath);
        const configMeta = module.default;

        if (!configMeta) {
          context.debug(`No config meta found for ${plugin.name}`);
        }
        return configMeta;
      })
    )
  )
    .flatMap((d) => d)
    .filter((d): d is ConfigPropertyMeta => !!d);

  if (flattenedConfigMetas.length) {
    const { Config } = await import('@salesforce/core/lib/config/config.js');
    Config.addAllowedProperties(flattenedConfigMetas);
  }
  return Promise.resolve();
};

export default hook;
