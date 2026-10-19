/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// designer-shell 内置的命令：开关外框的面板、显示或隐藏所有面板、还原面板显隐、恢复默认布局、打开设置对话框、
// 打开各款文档站的帮助页，以及每块面板一条的开关命令。文案取 xh-designer-commands 那一桶，图标由各款从 @xihan-ui/icons 传入；
// 各款把它们并进自己的内置扩展，排在工具栏末组。

import type { IconRecord } from '@xihan-ui/core'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { XhDesignerFrameElement } from '../frame/frame-element'
import type { DesignerCommandsTranslations } from '../translations'

/** 内置命令的 id。 */
export const DESIGNER_SHELL_COMMANDS = {
  panels: 'panels',
  panelsToggleAll: 'panels-toggle-all',
  panelsRestore: 'panels-restore',
  layoutReset: 'layout-reset',
  settings: 'settings',
  help: 'help',
} as const

/** 一块面板的开关命令的 id：panel:<面板 id>。 */
export function designerPanelCommandId(panel: string): string {
  return `panel:${panel}`
}

/** 内置命令要用到的外框能力。 */
type FrameForCommands = Pick<XhDesignerFrameElement, 'panelEntries' | 'togglePanel' | 'toggleAllPanels' | 'restorePanels' | 'resetLayout'>

/** designerShellCommands 的选项。 */
export interface DesignerShellCommandsOptions<Ctx> {
  /** 命令的文案（xh-designer-commands 那一桶），每次刷新现取，随语言变。 */
  readonly translations: (context: Ctx) => DesignerCommandsTranslations
  /**
   * 设计器的外框；给了才有 panels、panels-toggle-all、panels-restore、layout-reset 四条命令。
   * panels 点开一张菜单，逐块面板一项（勾选的显示），分隔线后是另外三条命令。返回 undefined 时这几条命令不可用。
   */
  readonly frame?: (context: Ctx) => FrameForCommands | undefined
  /** 打开设置对话框；给了才有 settings 命令。 */
  readonly openSettings?: (context: Ctx) => void
  /** 帮助页的地址；给了才有 help 命令，在新窗口打开它。返回 undefined 时这条命令不可用。 */
  readonly helpUrl?: (context: Ctx) => string | undefined
  /** 各命令的图标，键是命令 id。 */
  readonly icons?: Readonly<Partial<Record<keyof typeof DESIGNER_SHELL_COMMANDS, IconRecord>>>
}

/**
 * 建 designer-shell 的内置命令：给了 frame 有 panels、panels-toggle-all（Mod+\）、panels-restore（Mod+Shift+\）、layout-reset，
 * 给了 openSettings 有 settings，给了 helpUrl 有 help。panels、settings、help 缺省放在工具栏上，另外三条在 panels 菜单里与快捷键上。
 */
export function designerShellCommands<Ctx>(options: DesignerShellCommandsOptions<Ctx>): DesignerCommand<Ctx>[] {
  const commands: DesignerCommand<Ctx>[] = []
  const { frame, openSettings, helpUrl, icons } = options
  if (frame) {
    const usable = (context: Ctx): boolean => (frame(context)?.panelEntries().some(entry => !entry.locked) ?? false)
    commands.push(
      {
        id: DESIGNER_SHELL_COMMANDS.panels,
        label: context => options.translations(context).panels,
        ...(icons?.panels ? { icon: icons.panels } : {}),
        placement: ['toolbar'],
        enabled: context => (frame(context)?.panelEntries().length ?? 0) > 0,
        menu: context => [
          ...(frame(context)?.panelEntries().map(entry => ({
            value: entry.name,
            label: entry.label,
            checked: entry.shown,
            ...(entry.icon ? { icon: entry.icon } : {}),
            ...(entry.locked ? { disabled: true } : {}),
          })) ?? []),
          'separator',
          DESIGNER_SHELL_COMMANDS.panelsToggleAll,
          DESIGNER_SHELL_COMMANDS.panelsRestore,
          DESIGNER_SHELL_COMMANDS.layoutReset,
        ],
        select: (value, context) => frame(context)?.togglePanel(value),
      },
      {
        id: DESIGNER_SHELL_COMMANDS.panelsToggleAll,
        label: context => options.translations(context).panelsToggleAll,
        ...(icons?.panelsToggleAll ? { icon: icons.panelsToggleAll } : {}),
        shortcut: ['Mod', '\\'],
        enabled: usable,
        run: context => frame(context)?.toggleAllPanels(),
      },
      {
        id: DESIGNER_SHELL_COMMANDS.panelsRestore,
        label: context => options.translations(context).panelsRestore,
        ...(icons?.panelsRestore ? { icon: icons.panelsRestore } : {}),
        shortcut: ['Mod', 'Shift', '\\'],
        enabled: usable,
        run: context => frame(context)?.restorePanels(),
      },
      {
        id: DESIGNER_SHELL_COMMANDS.layoutReset,
        label: context => options.translations(context).layoutReset,
        ...(icons?.layoutReset ? { icon: icons.layoutReset } : {}),
        enabled: usable,
        run: context => frame(context)?.resetLayout(),
      },
    )
  }
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

/** designerPanelCommands 的选项。 */
export interface DesignerPanelCommandsOptions<Ctx> {
  /** 要生成开关命令的面板 id：设计器登记的面板与画布浮动件，含扩展登记的。 */
  readonly panels: readonly string[]
  /** 设计器的外框；返回 undefined 或面板不在外框里时命令不可用。 */
  readonly frame: (context: Ctx) => Pick<XhDesignerFrameElement, 'panelEntries' | 'togglePanel'> | undefined
}

/**
 * 每块面板一条开关命令 panel:<面板 id>：文字取面板标题，checked 是它此刻看得见，执行即 togglePanel。
 * 不上工具栏、不带快捷键，给 commandLayout、引导与扩展用。宿主锁定的面板不可用。
 */
export function designerPanelCommands<Ctx>(options: DesignerPanelCommandsOptions<Ctx>): DesignerCommand<Ctx>[] {
  const entryOf = (context: Ctx, panel: string): ReturnType<FrameForCommands['panelEntries']>[number] | undefined =>
    options.frame(context)?.panelEntries().find(entry => entry.name === panel)
  return options.panels.map(panel => ({
    id: designerPanelCommandId(panel),
    label: context => entryOf(context, panel)?.label ?? panel,
    enabled: (context) => {
      const entry = entryOf(context, panel)
      return entry !== undefined && !entry.locked
    },
    checked: context => entryOf(context, panel)?.shown ?? false,
    run: context => options.frame(context)?.togglePanel(panel),
  }))
}
