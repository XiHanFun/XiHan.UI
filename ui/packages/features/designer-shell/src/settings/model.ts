/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器的设置：用户偏好（每人每机一份，由宿主保存），不是模板数据。分区里的条目就是属性描述，path 只写一段条目 id，
// 值的键是「分区 id.条目 id」。designer-shell 内建「基础」分区，各款与扩展登记自己的分区，宿主能隐藏或锁定条目。

import type { JsonValue } from '@xihan-ui/core/json'
import type { PropertyControl, PropertyDescriptor } from '@xihan-ui/designer-kit/properties'
import type { BrandPreset } from '@xihan-ui/tokens'
import type { CommandToolbarDisplay } from '../extensions/commands'
import type { DesignerSettingsTranslations } from '../translations'
import type { DesignerCommonKey, DesignerCommonKeyId, DesignerDisplayControl, DesignerShortcutsSource } from './display-model'
import { formatJsonPath } from '@xihan-ui/core/json'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { BRAND_PRESET_COLORS, BRAND_PRESETS } from '@xihan-ui/tokens'
import { DESIGNER_SHELL_VERSION } from '../version'
import { DESIGNER_COMMON_KEYS } from './display-model'

/** 设置条目：一个属性描述，path 只写一段条目 id，说明写在 meta.description；也可以是只显示、不存值的几种条目。 */
export type DesignerSettingItem = PropertyDescriptor<PropertyControl | DesignerDisplayControl | { readonly kind: string }>

/** 一个设置分区：设置对话框左边的一页。 */
export interface DesignerSettingsSection {
  /** 分区 id：值的键以它开头；四款与各扩展之间不能重名，general、language、layout、toolbar、help、shortcuts、about 留给内建的几页。 */
  readonly id: string
  /** 左边导航里的名字。 */
  readonly label: string
  /** 排序：内建的「基础」是 0、「语言」是 1、「布局」是 2、「工具栏」是 3，各款从 100 起，扩展从 200 起，900 以后留给内建的帮助、快捷键与关于；同值按登记顺序。 */
  readonly order?: number
  /** 这一页的条目，按先后排列。 */
  readonly items: readonly DesignerSettingItem[]
}

/** 设置的值：扁平的键值，键是「分区 id.条目 id」；没写的键取条目的缺省值。 */
export type DesignerSettings = Readonly<Record<string, JsonValue>>

/** 宿主对条目的管控：hidden 不显示，locked 只读、说明换成「由所在系统管理」；键是条目键或分区 id。 */
export type DesignerSettingsPolicy = Readonly<Record<string, 'hidden' | 'locked'>>

/** 内建「基础」分区的 id。 */
export const DESIGNER_GENERAL_SETTINGS = 'general'

/** 内建「语言」分区的 id。 */
export const DESIGNER_LANGUAGE_SETTINGS = 'language'

/** 内建「工具栏」分区的 id。 */
export const DESIGNER_TOOLBAR_SETTINGS = 'toolbar'

/** 「工具栏」分区里按钮表的编辑方式，设置对话框内建，不进属性面板。 */
export const TOOLBAR_LAYOUT_CONTROL = 'toolbarLayout'

/** 内建「帮助」「快捷键」「关于」分区的 id，排在最后（900、910、920）。 */
export const DESIGNER_HELP_SETTINGS = 'help'
export const DESIGNER_SHORTCUT_SETTINGS = 'shortcuts'
export const DESIGNER_ABOUT_SETTINGS = 'about'

/** 内建「布局」分区的 id：只有一条 panels，值就是外框的布局（layout.panels）。 */
export const DESIGNER_LAYOUT_SETTINGS = 'layout'

/** 「布局」分区里面板表的编辑方式，设置对话框内建，不进属性面板。 */
export const PANEL_LAYOUT_CONTROL = 'panelLayout'

/** 「基础」分区里主题的取值：follow 跟随所在页面，system 跟随系统，light、dark 固定。 */
export type DesignerThemeSetting = 'follow' | 'system' | 'light' | 'dark'

/** 内建「基础」「语言」「工具栏」分区各条目的键，以及外框存布局的键。 */
export const DESIGNER_SETTING_KEYS = {
  theme: 'general.theme',
  brand: 'general.brand',
  statusBar: 'general.statusBar',
  /** 自动保存：把未保存的修改存成这台浏览器里的草稿，缺省 false。 */
  autoSave: 'general.autoSave',
  /** 开发者模式：调试总开关，缺省 false；关着时 JSON 与 Blob 一类调试查看入口都不出现。 */
  developer: 'general.developer',
  /** 分页调试日志：开发者模式开着时才生效，缺省 false。 */
  debugPagination: 'general.debugPagination',
  /** 渲染调试日志：开发者模式开着时才生效，缺省 false。 */
  debugRender: 'general.debugRender',
  /** 设计器的语言：follow（缺省）、system 或一种语言，见 DesignerLanguageSetting。 */
  language: 'language.locale',
  /** 工具栏按钮的显示方式：icon、text、both。 */
  toolbarDisplay: 'toolbar.display',
  /** 显示顶部工具栏，缺省 true。 */
  toolbarVisible: 'toolbar.visible',
  /** 用户改过的工具栏（DesignerToolbarCustomization）；宿主用 settingsPolicy 的 toolbar.layout 锁定或藏掉这张表。 */
  toolbarLayout: 'toolbar.layout',
  /** 面板布局，值是 DesignerLayout；宿主用 settingsPolicy 的 layout.panels 锁整份、layout.panels.<面板 id> 管一块面板。 */
  layout: 'layout.panels',
} as const

/** 设置条目的键：分区 id 加条目的 path。 */
export function settingKey(section: Pick<DesignerSettingsSection, 'id'>, item: Pick<DesignerSettingItem, 'path'>): string {
  return `${section.id}.${formatJsonPath(item.path)}`
}

/** 条目此刻的值：settings 里写了就用它，没写取条目的缺省值。 */
export function settingValue(settings: DesignerSettings | undefined, section: Pick<DesignerSettingsSection, 'id'>, item: DesignerSettingItem): JsonValue | undefined {
  const key = settingKey(section, item)
  return settings !== undefined && Object.hasOwn(settings, key) ? settings[key] : item.default
}

/**
 * 此刻生效的设置：settings 里写了的键原样保留（分区里没有的键也保留），各分区里没写的条目取缺省值，没有缺省值的不写。
 * 交给命令、面板与扩展的上下文用这一份。sections 通常是 collectSettingsSections 合出的分区；基础分区只有写了的键，
 * 要它的缺省值时把 designerGeneralSettings 的分区也传进来。
 */
export function resolveSettings(sections: readonly DesignerSettingsSection[], settings: DesignerSettings | undefined): DesignerSettings {
  const resolved: Record<string, JsonValue> = { ...settings }
  for (const section of sections) {
    for (const item of section.items) {
      const value = settingValue(settings, section, item)
      if (value !== undefined)
        resolved[settingKey(section, item)] = value
    }
  }
  return resolved
}

/** 带设置分区的一个来源：扩展 id 与它登记的分区。 */
export interface DesignerSettingsSource {
  readonly id: string
  readonly settings?: readonly DesignerSettingsSection[]
}

/**
 * 合起各来源的分区，按 order 排（同值按登记顺序）。分区 id 重名（含留给内建的 general、language、layout、toolbar、help、shortcuts、about）抛 DesignerExtensionError，
 * 名字空间是 settings-section。
 */
export function collectSettingsSections(sources: readonly DesignerSettingsSource[]): DesignerSettingsSection[] {
  const owners = new Map<string, string>([DESIGNER_GENERAL_SETTINGS, DESIGNER_LANGUAGE_SETTINGS, DESIGNER_LAYOUT_SETTINGS, DESIGNER_TOOLBAR_SETTINGS, DESIGNER_HELP_SETTINGS, DESIGNER_SHORTCUT_SETTINGS, DESIGNER_ABOUT_SETTINGS].map(id => [id, '@xihan-ui/designer-shell']))
  const sections: DesignerSettingsSection[] = []
  for (const source of sources) {
    for (const section of source.settings ?? []) {
      const owner = owners.get(section.id)
      if (owner !== undefined)
        throw new DesignerExtensionError('settings-section', section.id, [owner, source.id])
      owners.set(section.id, source.id)
      sections.push(section)
    }
  }
  return sections
}

/** 把分区按 order 排好；同值按传入顺序。 */
export function sortSettingsSections(sections: readonly DesignerSettingsSection[]): DesignerSettingsSection[] {
  return sections.map((section, index) => ({ section, index }))
    .sort((a, b) => (a.section.order ?? 0) - (b.section.order ?? 0) || a.index - b.index)
    .map(({ section }) => section)
}

/** UI 预设品牌在设置文案里的名字。 */
const BRAND_NAMES: Readonly<Record<BrandPreset, keyof DesignerSettingsTranslations>> = {
  blue: 'brandBlue',
  cyan: 'brandCyan',
  teal: 'brandTeal',
  green: 'brandGreen',
  orange: 'brandOrange',
  red: 'brandRed',
  pink: 'brandPink',
  purple: 'brandPurple',
}

/**
 * 内建的「基础」分区：主题、主题色、状态栏、自动保存、开发者模式与两条调试日志（开发者模式开着才能改）。主题色内置：跟随页面（缺省，不写值）、UI 的预设品牌（@xihan-ui/tokens 的
 * BRAND_PRESETS，格子画 BRAND_PRESET_COLORS）与自定义颜色。语言在单独的「语言」分区（designerLanguageSettings）。
 */
export function designerGeneralSettings(t: DesignerSettingsTranslations): DesignerSettingsSection {
  const items: DesignerSettingItem[] = [
    {
      path: ['theme'],
      label: t.theme,
      control: {
        kind: 'select',
        appearance: 'toggle',
        options: [
          { value: 'follow', label: t.themeFollow },
          { value: 'system', label: t.themeSystem },
          { value: 'light', label: t.themeLight },
          { value: 'dark', label: t.themeDark },
        ],
      },
      default: 'follow',
      meta: { description: t.themeHint },
    },
  ]
  items.push({
    path: ['brand'],
    label: t.brand,
    control: {
      kind: 'swatch',
      options: BRAND_PRESETS.map(id => ({ value: id, color: BRAND_PRESET_COLORS[id], label: t[BRAND_NAMES[id]] as string })),
      custom: true,
      none: t.brandFollow,
    },
    meta: { description: t.brandHint },
  })
  items.push({ path: ['statusBar'], label: t.statusBar, control: { kind: 'boolean' }, default: true, meta: { description: t.statusBarHint } })
  items.push({ path: ['autoSave'], label: t.autoSave, control: { kind: 'boolean' }, default: false, meta: { description: t.autoSaveHint } })
  items.push({ path: ['developer'], label: t.developer, control: { kind: 'boolean' }, default: false, meta: { description: t.developerHint } })
  // 两条调试日志：开发者模式开着才能改
  const needsDeveloper = { path: [DESIGNER_SETTING_KEYS.developer], equals: true }
  items.push({ path: ['debugPagination'], label: t.debugPagination, control: { kind: 'boolean' }, default: false, enabledWhen: needsDeveloper, meta: { description: t.debugPaginationHint } })
  items.push({ path: ['debugRender'], label: t.debugRender, control: { kind: 'boolean' }, default: false, enabledWhen: needsDeveloper, meta: { description: t.debugRenderHint } })
  return { id: DESIGNER_GENERAL_SETTINGS, label: t.general, order: 0, items }
}

/** 内建的「布局」分区：一张面板表，改的是外框的布局；设置对话框给了 frame 才有这一页。 */
export function designerLayoutSettings(t: DesignerSettingsTranslations): DesignerSettingsSection {
  return {
    id: DESIGNER_LAYOUT_SETTINGS,
    label: t.layout,
    order: 2,
    items: [{ path: ['panels'], label: t.layoutPanels, control: { kind: PANEL_LAYOUT_CONTROL }, meta: { description: t.layoutPanelsHint } }],
  }
}

/** designerToolbarSettings 的选项。 */
export interface DesignerToolbarSettingsOptions {
  /** 有「按钮」这张表（设置对话框给了 toolbar 的命令表时）。 */
  readonly layout?: boolean
}

/** 内建的「工具栏」分区：按钮的显示方式、显示工具栏，以及给了命令表时的「按钮」表。 */
export function designerToolbarSettings(t: DesignerSettingsTranslations, options: DesignerToolbarSettingsOptions = {}): DesignerSettingsSection {
  const items: DesignerSettingItem[] = [
    {
      path: ['display'],
      label: t.toolbarDisplay,
      control: {
        kind: 'select',
        appearance: 'toggle',
        options: [
          { value: 'icon', label: t.toolbarDisplayIcon },
          { value: 'text', label: t.toolbarDisplayText },
          { value: 'both', label: t.toolbarDisplayBoth },
        ],
      },
      default: 'icon',
      meta: { description: t.toolbarDisplayHint },
    },
    { path: ['visible'], label: t.toolbarVisible, control: { kind: 'boolean' }, default: true, meta: { description: t.toolbarVisibleHint } },
  ]
  if (options.layout)
    items.push({ path: ['layout'], label: t.toolbarLayout, control: { kind: TOOLBAR_LAYOUT_CONTROL }, meta: { description: t.toolbarLayoutHint } })
  return { id: DESIGNER_TOOLBAR_SETTINGS, label: t.toolbar, order: 3, items }
}

/** 设置对话框「帮助」页：几段操作说明与几颗跑命令的钮（如开始引导、打开文档），文字已按语言取好。 */
export interface DesignerHelpSettings {
  readonly notes?: readonly string[]
  readonly actions?: readonly { readonly command: string, readonly label: string }[]
}

/** 设置对话框「关于」页：产品名、版本与许可证，加上扩展给的几行（附加包的版本与授权）。 */
export interface DesignerAboutSettings {
  readonly product: string
  readonly version: string
  readonly license?: string
  readonly rows?: readonly { readonly label: string, readonly value: string }[]
}

/** 内建的「帮助」分区：一条几段说明，几颗跑命令的钮；都没有时没有条目。 */
export function designerHelpSettings(t: DesignerSettingsTranslations, help: DesignerHelpSettings): DesignerSettingsSection {
  const items: DesignerSettingItem[] = []
  if ((help.notes?.length ?? 0) > 0)
    items.push({ path: ['guide'], label: t.helpGuide, control: { kind: 'note', paragraphs: help.notes! } })
  // 条目 id 取命令 id 的驼峰写法（start-tour → startTour），键是 help.startTour
  for (const action of help.actions ?? [])
    items.push({ path: [action.command.replace(/[^a-z0-9]+([a-z0-9])?/gi, (_, next: string | undefined) => next?.toUpperCase() ?? '')], control: { kind: 'action', command: action.command, text: action.label } })
  return { id: DESIGNER_HELP_SETTINGS, label: t.help, order: 900, items }
}

/** 内建的「快捷键」分区：一张快捷键表，「通用」那一组补上四款都有的按键（DESIGNER_COMMON_KEYS，各款经 commonKeys 换掉的按它）。 */
export function designerShortcutSettings(t: DesignerSettingsTranslations, source: DesignerShortcutsSource): DesignerSettingsSection {
  const names = { common: t.shortcutsCommon, edit: t.shortcutsEdit, designer: t.shortcutsDesigner, extensions: t.shortcutsExtensions }
  const keyNames: Readonly<Record<DesignerCommonKeyId, string>> = { nudge: t.keyNudge, nudgeLarge: t.keyNudgeLarge, pan: t.keyPan, menubar: t.keyMenubar, selectionToolbar: t.keySelectionToolbar, cancel: t.keyCancel }
  const keys: readonly DesignerCommonKey[] = source.commonKeys ?? DESIGNER_COMMON_KEYS
  // 不写名字的行只能是内建的几种（类型与 shortcutSettingsSource 都拦着）
  const common = keys.map(key => ({ label: key.label ?? keyNames[key.id as DesignerCommonKeyId], keys: key.keys }))
  const groups = source.groups.some(group => group.id === 'common') ? source.groups : [{ id: 'common' as const, rows: [] }, ...source.groups]
  return {
    id: DESIGNER_SHORTCUT_SETTINGS,
    label: t.shortcuts,
    order: 910,
    items: [{
      path: ['table'],
      control: { kind: 'shortcutTable', groups: groups.map(group => ({ label: names[group.id], rows: group.id === 'common' ? [...group.rows, ...common] : group.rows })) },
    }],
  }
}

/** 内建的「关于」分区：产品、版本、界面库（XiHan.UI）的版本与许可证，后面接扩展给的几行。 */
export function designerAboutSettings(t: DesignerSettingsTranslations, about: DesignerAboutSettings): DesignerSettingsSection {
  const rows = [
    { label: t.aboutProduct, value: about.product },
    { label: t.aboutVersion, value: about.version },
    { label: t.aboutUi, value: DESIGNER_SHELL_VERSION },
    ...(about.license === undefined ? [] : [{ label: t.aboutLicense, value: about.license }]),
    ...about.rows ?? [],
  ]
  return { id: DESIGNER_ABOUT_SETTINGS, label: t.about, order: 920, items: [{ path: ['rows'], control: { kind: 'info', rows } }] }
}

/** 设置里的工具栏显示方式（toolbar.display），没写或写的不是 icon、text、both 时是缺省的 icon；交给命令工具栏的 display。 */
export function toolbarDisplayOf(settings: DesignerSettings | undefined): CommandToolbarDisplay {
  const value = settings?.[DESIGNER_SETTING_KEYS.toolbarDisplay]
  return value === 'text' || value === 'both' ? value : 'icon'
}

/** 设置里的自动保存（general.autoSave），只有写了 true 才开着。 */
export function autoSaveOf(settings: DesignerSettings | undefined): boolean {
  return settings?.[DESIGNER_SETTING_KEYS.autoSave] === true
}

/** 设置里的开发者模式（general.developer），只有写了 true 才开着；各款的调试查看入口按它决定有没有。 */
export function developerModeOf(settings: DesignerSettings | undefined): boolean {
  return settings?.[DESIGNER_SETTING_KEYS.developer] === true
}

/** 设置里的显示工具栏（toolbar.visible），只有写了 false 才不显示。 */
export function toolbarVisibleOf(settings: DesignerSettings | undefined): boolean {
  return settings?.[DESIGNER_SETTING_KEYS.toolbarVisible] !== false
}

/** 条目在宿主管控下的状态：所在分区或条目本身被隐藏、锁定。 */
export function settingPolicy(policy: DesignerSettingsPolicy | undefined, section: Pick<DesignerSettingsSection, 'id'>, item: Pick<DesignerSettingItem, 'path'>): 'hidden' | 'locked' | undefined {
  if (policy === undefined)
    return undefined
  return policy[settingKey(section, item)] ?? policy[section.id]
}
