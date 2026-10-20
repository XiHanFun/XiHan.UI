/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// designer-shell 内置的命令：保存、开关外框的面板、显示或隐藏所有面板、还原面板显隐、恢复默认布局、拖动工具、
// 打开设置对话框（及它的快捷键页、关于页）、打开各款文档站的帮助页、打开导入字段对话框、打开 JSON 编辑框、开始新手引导、
// 显示或隐藏工具栏、状态栏与菜单栏，以及每块面板一条的开关命令。文案取 xh-designer-commands 那一桶，图标由各款从 @xihan-ui/icons 传入；
// 各款把它们并进自己的内置扩展，缺省落在菜单栏的各张菜单里，面板与拖动也上工具栏。

import type { IconRecord } from '@xihan-ui/core'
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { XhDesignerFrameElement } from '../frame/frame-element'
import type { DesignerSettings, DesignerSettingsPolicy } from '../settings/model'
import type { DesignerCommandsTranslations } from '../translations'
import { DESIGNER_ABOUT_SETTINGS, DESIGNER_SETTING_KEYS, DESIGNER_SHORTCUT_SETTINGS } from '../settings/model'

/** 内置命令的 id。 */
export const DESIGNER_SHELL_COMMANDS = {
  save: 'save',
  panels: 'panels',
  panelsToggleAll: 'panels-toggle-all',
  panelsRestore: 'panels-restore',
  layoutReset: 'layout-reset',
  settings: 'settings',
  help: 'help',
  importFields: 'import-fields',
  editJson: 'edit-json',
  startTour: 'start-tour',
  panTool: 'pan-tool',
  shortcuts: 'shortcuts',
  about: 'about',
  showToolbar: 'show-toolbar',
  showStatusBar: 'show-status-bar',
  showMenubar: 'show-menubar',
} as const

/** 一块面板的开关命令的 id：panel:<面板 id>。 */
export function designerPanelCommandId(panel: string): string {
  return `panel:${panel}`
}

/** 内置命令要用到的外框能力。 */
type FrameForCommands = Pick<XhDesignerFrameElement, 'panelEntries' | 'togglePanel' | 'toggleAllPanels' | 'restorePanels' | 'resetLayout' | 'canvasTool'>

/** designerShellCommands 的选项。 */
export interface DesignerShellCommandsOptions<Ctx> {
  /** 命令的文案（xh-designer-commands 那一桶），每次刷新现取，随语言变。 */
  readonly translations: (context: Ctx) => DesignerCommandsTranslations
  /**
   * 设计器的外框；给了才有 panels、panels-toggle-all、panels-restore、layout-reset 与 pan-tool 五条命令。
   * panels 点开一张菜单，逐块面板一项（勾选的显示），分隔线后是另外三条命令。返回 undefined 时这几条命令不可用。
   */
  readonly frame?: (context: Ctx) => FrameForCommands | undefined
  /** 保存：给了才有 save 命令（Mod+S），通常派发各款的 save 事件。 */
  readonly save?: (context: Ctx) => void
  /**
   * 打开设置对话框，section 是要翻到的分区 id（不给是上次那页）；给了才有 settings（Mod+,）与翻到快捷键页的 shortcuts、
   * 翻到关于页的 about 三条命令。
   */
  readonly openSettings?: (context: Ctx, section?: string) => void
  /** 帮助页的地址；给了才有 help 命令，在新窗口打开它。返回 undefined 时这条命令不可用。 */
  readonly helpUrl?: (context: Ctx) => string | undefined
  /** 打开导入字段对话框；给了才有 import-fields 命令。 */
  readonly openFieldImport?: (context: Ctx) => void
  /** 此刻不许导入字段（只读、预览，或宿主管着字段）时返回 true，import-fields 不可用。 */
  readonly fieldImportDisabled?: (context: Ctx) => boolean
  /** 打开 JSON 编辑框；给了才有 edit-json 命令（Mod+Shift+J），不上工具栏。只读时也能打开，编辑框里只能看与复制。 */
  readonly openJsonEditor?: (context: Ctx) => void
  /** 开始新手引导；给了才有 start-tour 命令，落在帮助菜单，不上工具栏。返回 false 表示这次没有能走的步骤。 */
  readonly startTour?: (context: Ctx) => unknown
  /**
   * 设置的读写；给了才有 show-toolbar、show-status-bar、show-menubar 三条开关命令，改的是 toolbar.visible、general.statusBar
   * 与 toolbar.menubar。policy 里把某一条（或它所在的分区）藏起或锁定时，那条命令不可用。
   */
  readonly settings?: {
    readonly read: (context: Ctx) => DesignerSettings | undefined
    readonly change: (context: Ctx, key: string, value: JsonValue) => void
    readonly policy?: (context: Ctx) => DesignerSettingsPolicy | undefined
  }
  /** 各命令的图标，键是命令 id。 */
  readonly icons?: Readonly<Partial<Record<keyof typeof DESIGNER_SHELL_COMMANDS, IconRecord>>>
}

/**
 * 建 designer-shell 的内置命令：给了 save 有 save（Mod+S）；给了 frame 有 panels、panels-toggle-all（Mod+\）、panels-restore（Mod+Shift+\）、
 * layout-reset、pan-tool（H，开关式：切换外框的 canvasTool）；给了 openSettings 有 settings（Mod+,）、shortcuts、about；
 * 给了 helpUrl 有 help；给了 openFieldImport 有 import-fields；给了 openJsonEditor 有 edit-json（Mod+Shift+J）；
 * 给了 startTour 有 start-tour；给了 settings 有 show-toolbar、show-status-bar、show-menubar（开关式）。
 * 落点：save、settings 在文件菜单，edit-json 在编辑菜单，panels、pan-tool 与三条显示开关在视图菜单（panels、pan-tool 也上工具栏），
 * start-tour、help、shortcuts、about 在帮助菜单；panels-toggle-all、panels-restore、layout-reset 在 panels 菜单里与快捷键上；
 * import-fields 不排位置，各款放进面板头或菜单。
 */
export function designerShellCommands<Ctx>(options: DesignerShellCommandsOptions<Ctx>): DesignerCommand<Ctx>[] {
  const commands: DesignerCommand<Ctx>[] = []
  const { save, frame, openSettings, helpUrl, openFieldImport, openJsonEditor, startTour, settings, icons } = options
  if (save) {
    commands.push({
      id: DESIGNER_SHELL_COMMANDS.save,
      label: context => options.translations(context).save,
      ...(icons?.save ? { icon: icons.save } : {}),
      shortcut: ['Mod', 'S'],
      placement: ['menubar:file'],
      run: save,
    })
  }
  if (frame) {
    const usable = (context: Ctx): boolean => (frame(context)?.panelEntries().some(entry => !entry.locked) ?? false)
    commands.push(
      {
        id: DESIGNER_SHELL_COMMANDS.panels,
        label: context => options.translations(context).panels,
        ...(icons?.panels ? { icon: icons.panels } : {}),
        placement: ['toolbar', 'menubar:view'],
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
      {
        id: DESIGNER_SHELL_COMMANDS.panTool,
        label: context => options.translations(context).panTool,
        ...(icons?.panTool ? { icon: icons.panTool } : {}),
        shortcut: ['H'],
        placement: ['toolbar', 'menubar:view'],
        enabled: context => frame(context) !== undefined,
        checked: context => frame(context)?.canvasTool === 'pan',
        run: (context) => {
          const target = frame(context)
          if (target)
            target.canvasTool = target.canvasTool === 'pan' ? 'select' : 'pan'
        },
      },
    )
  }
  if (openSettings) {
    commands.push(
      {
        id: DESIGNER_SHELL_COMMANDS.settings,
        label: context => options.translations(context).settings,
        ...(icons?.settings ? { icon: icons.settings } : {}),
        shortcut: ['Mod', ','],
        placement: ['menubar:file'],
        run: context => openSettings(context),
      },
      {
        id: DESIGNER_SHELL_COMMANDS.shortcuts,
        label: context => options.translations(context).shortcuts,
        ...(icons?.shortcuts ? { icon: icons.shortcuts } : {}),
        placement: ['menubar:help'],
        run: context => openSettings(context, DESIGNER_SHORTCUT_SETTINGS),
      },
      {
        id: DESIGNER_SHELL_COMMANDS.about,
        label: context => options.translations(context).about,
        ...(icons?.about ? { icon: icons.about } : {}),
        placement: ['menubar:help'],
        run: context => openSettings(context, DESIGNER_ABOUT_SETTINGS),
      },
    )
  }
  if (openFieldImport) {
    commands.push({
      id: DESIGNER_SHELL_COMMANDS.importFields,
      label: context => options.translations(context).importFields,
      ...(icons?.importFields ? { icon: icons.importFields } : {}),
      enabled: context => !(options.fieldImportDisabled?.(context) ?? false),
      run: openFieldImport,
    })
  }
  if (openJsonEditor) {
    commands.push({
      id: DESIGNER_SHELL_COMMANDS.editJson,
      label: context => options.translations(context).editJson,
      ...(icons?.editJson ? { icon: icons.editJson } : {}),
      shortcut: ['Mod', 'Shift', 'J'],
      placement: ['menubar:edit'],
      run: openJsonEditor,
    })
  }
  if (helpUrl) {
    commands.push({
      id: DESIGNER_SHELL_COMMANDS.help,
      label: context => options.translations(context).help,
      ...(icons?.help ? { icon: icons.help } : {}),
      placement: ['menubar:help'],
      enabled: context => helpUrl(context) !== undefined,
      run: (context) => {
        const url = helpUrl(context)
        if (url !== undefined)
          globalThis.open(url, '_blank', 'noopener,noreferrer')
      },
    })
  }
  if (startTour) {
    commands.push({
      id: DESIGNER_SHELL_COMMANDS.startTour,
      label: context => options.translations(context).startTour,
      ...(icons?.startTour ? { icon: icons.startTour } : {}),
      placement: ['menubar:help'],
      run: context => void startTour(context),
    })
  }
  if (settings) {
    const toggles = [
      { id: DESIGNER_SHELL_COMMANDS.showToolbar, key: DESIGNER_SETTING_KEYS.toolbarVisible, section: 'toolbar', text: 'showToolbar' },
      { id: DESIGNER_SHELL_COMMANDS.showStatusBar, key: DESIGNER_SETTING_KEYS.statusBar, section: 'general', text: 'showStatusBar' },
      { id: DESIGNER_SHELL_COMMANDS.showMenubar, key: DESIGNER_SETTING_KEYS.toolbarMenubar, section: 'toolbar', text: 'showMenubar' },
    ] as const
    for (const toggle of toggles) {
      const shown = (context: Ctx): boolean => settings.read(context)?.[toggle.key] !== false
      commands.push({
        id: toggle.id,
        label: context => options.translations(context)[toggle.text],
        ...(icons?.[toggle.text] ? { icon: icons[toggle.text] } : {}),
        placement: ['menubar:view'],
        enabled: (context) => {
          const policy = settings.policy?.(context)
          return (policy?.[toggle.key] ?? policy?.[toggle.section]) === undefined
        },
        checked: shown,
        run: context => settings.change(context, toggle.key, !shown(context)),
      })
    }
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
