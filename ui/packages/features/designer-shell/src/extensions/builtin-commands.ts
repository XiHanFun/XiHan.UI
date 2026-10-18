/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// designer-shell 内置的命令：打开设置对话框、打开各款文档站的帮助页。文案取 xh-designer-commands 那一桶，
// 图标由各款从 @xihan-ui/icons 传入；各款把它们并进自己的内置扩展，排在工具栏末组。

import type { IconRecord } from '@xihan-ui/core'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { DesignerCommandsTranslations } from '../translations'

/** 内置命令的 id。 */
export const DESIGNER_SHELL_COMMANDS = {
  settings: 'settings',
  help: 'help',
} as const

/** designerShellCommands 的选项。 */
export interface DesignerShellCommandsOptions<Ctx> {
  /** 命令的文案（xh-designer-commands 那一桶），每次刷新现取，随语言变。 */
  readonly translations: (context: Ctx) => DesignerCommandsTranslations
  /** 打开设置对话框；给了才有 settings 命令。 */
  readonly openSettings?: (context: Ctx) => void
  /** 帮助页的地址；给了才有 help 命令，在新窗口打开它。返回 undefined 时这条命令不可用。 */
  readonly helpUrl?: (context: Ctx) => string | undefined
  /** 各命令的图标，键是命令 id。 */
  readonly icons?: Readonly<Partial<Record<keyof typeof DESIGNER_SHELL_COMMANDS, IconRecord>>>
}

/** 建 designer-shell 的内置命令：给了 openSettings 有 settings，给了 helpUrl 有 help，缺省都放在工具栏上。 */
export function designerShellCommands<Ctx>(options: DesignerShellCommandsOptions<Ctx>): DesignerCommand<Ctx>[] {
  const commands: DesignerCommand<Ctx>[] = []
  const { openSettings, helpUrl, icons } = options
  if (openSettings) {
    commands.push({
      id: DESIGNER_SHELL_COMMANDS.settings,
      label: context => options.translations(context).settings,
      ...(icons?.settings ? { icon: icons.settings } : {}),
      placement: ['toolbar'],
      run: openSettings,
    })
  }
  if (helpUrl) {
    commands.push({
      id: DESIGNER_SHELL_COMMANDS.help,
      label: context => options.translations(context).help,
      ...(icons?.help ? { icon: icons.help } : {}),
      placement: ['toolbar'],
      enabled: context => helpUrl(context) !== undefined,
      run: (context) => {
        const url = helpUrl(context)
        if (url !== undefined)
          globalThis.open(url, '_blank', 'noopener,noreferrer')
      },
    })
  }
  return commands
}
