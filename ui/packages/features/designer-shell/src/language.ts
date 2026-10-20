/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-shell/language：按语言取 UI 组件库与 designer-shell 的同语言包并成一份配置，两份语言包按需加载。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerLanguage } from './settings/language'
import { mergeXhConfig } from '@xihan-ui/web-components'

/** 语言标记换成语言包的导出名后缀：zh-CN → ZhCN。 */
function packSuffix(language: DesignerLanguage): string {
  const [primary, region] = language.split('-') as [string, string]
  return `${primary[0]!.toUpperCase()}${primary.slice(1)}${region}`
}

/**
 * 一种语言的 UI 组件库与 designer-shell 语言包并成的一份配置（locale 与各桶文案）。两份语言包按需加载，第一次用到时才取。
 * 各款再并上自己这一款的同语言包，交给设计器根作为它那棵子树的配置。
 */
export async function loadDesignerLocale(language: DesignerLanguage): Promise<XhConfig> {
  const [ui, shell] = await Promise.all([import('@xihan-ui/web-components/locale'), import('./locale')])
  const suffix = packSuffix(language)
  const uiPack = (ui as unknown as Readonly<Record<string, XhConfig>>)[`${suffix[0]!.toLowerCase()}${suffix.slice(1)}`]
  const shellPack = (shell as unknown as Readonly<Record<string, XhConfig>>)[`designerShell${suffix}`]
  return mergeXhConfig(uiPack, shellPack)
}
