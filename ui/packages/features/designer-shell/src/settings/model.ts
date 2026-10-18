/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器的设置：用户偏好（每人每机一份，由宿主保存），不是模板数据。分区里的条目就是属性描述，path 只写一段条目 id，
// 值的键是「分区 id.条目 id」。designer-shell 内建「基础」分区，各款与扩展登记自己的分区，宿主能隐藏或锁定条目。

import type { JsonValue } from '@xihan-ui/core/json'
import type { PropertyControl, PropertyDescriptor, PropertySwatchOption } from '@xihan-ui/designer-kit/properties'
import type { CommandToolbarDisplay } from '../extensions/commands'
import type { DesignerSettingsTranslations } from '../translations'
import { formatJsonPath } from '@xihan-ui/core/json'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'

/** 设置条目：一个属性描述，path 只写一段条目 id，说明写在 meta.description。 */
export type DesignerSettingItem = PropertyDescriptor<PropertyControl | { readonly kind: string }>

/** 一个设置分区：设置对话框左边的一页。 */
export interface DesignerSettingsSection {
  /** 分区 id：值的键以它开头；四款与各扩展之间不能重名，general 留给内建的「基础」。 */
  readonly id: string
  /** 左边导航里的名字。 */
  readonly label: string
  /** 排序：内建的「基础」是 0，各款从 100 起，扩展从 200 起；同值按登记顺序。 */
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

/** 「基础」分区里主题的取值：follow 跟随所在页面，system 跟随系统，light、dark 固定。 */
export type DesignerThemeSetting = 'follow' | 'system' | 'light' | 'dark'

/** 「基础」分区各条目的键。 */
export const DESIGNER_SETTING_KEYS = {
  theme: 'general.theme',
  brand: 'general.brand',
  toolbarDisplay: 'general.toolbarDisplay',
  statusBar: 'general.statusBar',
  language: 'general.language',
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
 * 合起各来源的分区，按 order 排（同值按登记顺序）。分区 id 重名（含 general）抛 DesignerExtensionError，
 * 名字空间是 settings-section。
 */
export function collectSettingsSections(sources: readonly DesignerSettingsSource[]): DesignerSettingsSection[] {
  const owners = new Map<string, string>([[DESIGNER_GENERAL_SETTINGS, '@xihan-ui/designer-shell']])
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

/** designerGeneralSettings 的选项：主题色与语言两项要宿主给了才有。 */
export interface DesignerGeneralSettingsOptions {
  /** 预设主题色：value 是品牌 id（写到设计器根的 data-brand），color 是格子画的颜色。不给且不许自定义时没有主题色这一项。 */
  readonly brands?: readonly PropertySwatchOption[]
  /** 主题色许自定义（宿主给了品牌注册函数时）。 */
  readonly customBrand?: boolean
  /** 可选的语言：给了才有语言这一项，不选即跟随所在页面。 */
  readonly languages?: readonly { readonly value: string, readonly label: string }[]
}

/** 内建的「基础」分区：主题、主题色、工具栏显示方式、状态栏与语言；主题色与语言按选项决定有没有。 */
export function designerGeneralSettings(t: DesignerSettingsTranslations, options: DesignerGeneralSettingsOptions = {}): DesignerSettingsSection {
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
  if ((options.brands?.length ?? 0) > 0 || options.customBrand)
    items.push({ path: ['brand'], label: t.brand, control: { kind: 'swatch', options: options.brands ?? [], custom: options.customBrand === true }, meta: { description: t.brandHint } })
  items.push({
    path: ['toolbarDisplay'],
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
  })
  items.push({ path: ['statusBar'], label: t.statusBar, control: { kind: 'boolean' }, default: true, meta: { description: t.statusBarHint } })
  if ((options.languages?.length ?? 0) > 0)
    items.push({ path: ['language'], label: t.language, control: { kind: 'select', appearance: 'dropdown', options: options.languages! }, meta: { description: t.languageHint } })
  return { id: DESIGNER_GENERAL_SETTINGS, label: t.general, order: 0, items }
}

/** 设置里的工具栏显示方式（general.toolbarDisplay），没写或写的不是 icon、text、both 时是缺省的 icon；交给命令工具栏的 display。 */
export function toolbarDisplayOf(settings: DesignerSettings | undefined): CommandToolbarDisplay {
  const value = settings?.[DESIGNER_SETTING_KEYS.toolbarDisplay]
  return value === 'text' || value === 'both' ? value : 'icon'
}

/** 条目在宿主管控下的状态：所在分区或条目本身被隐藏、锁定。 */
export function settingPolicy(policy: DesignerSettingsPolicy | undefined, section: Pick<DesignerSettingsSection, 'id'>, item: Pick<DesignerSettingItem, 'path'>): 'hidden' | 'locked' | undefined {
  if (policy === undefined)
    return undefined
  return policy[settingKey(section, item)] ?? policy[section.id]
}
