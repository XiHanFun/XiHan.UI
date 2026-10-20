/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器的语言：外壳自带的语言清单（与 UI 组件库的内建语言包一一对应，名字是各自的本名）与内建的「语言」分区，
// 跟随系统时按浏览器的语言偏好挑最接近的一种。按语言加载语言包在子入口 @xihan-ui/designer-shell/language。

import type { DesignerSettingsTranslations } from '../translations'
import type { DesignerSettings, DesignerSettingsSection } from './model'
import { DESIGNER_LANGUAGE_SETTINGS, DESIGNER_SETTING_KEYS } from './model'

/** 设计器能切换到的语言：与 UI 组件库的内建语言包一一对应。 */
export type DesignerLanguage = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR' | 'de-DE' | 'fr-FR' | 'es-ES' | 'pt-BR' | 'ru-RU'

/** 「语言」分区的取值：follow 跟随所在页面（缺省），system 跟随系统，或者一种语言。 */
export type DesignerLanguageSetting = 'follow' | 'system' | DesignerLanguage

/** 外壳自带的语言清单：值是 BCP 47 语言标记，名字是各自的本名，不随界面语言变。 */
export const DESIGNER_LANGUAGES: readonly { readonly value: DesignerLanguage, readonly label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'ko-KR', label: '한국어' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'es-ES', label: 'Español' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'ru-RU', label: 'Русский' },
]

/** 跟随系统挑不到时用的语言。 */
const FALLBACK_LANGUAGE: DesignerLanguage = 'en-US'

function isDesignerLanguage(value: unknown): value is DesignerLanguage {
  return DESIGNER_LANGUAGES.some(language => language.value === value)
}

/** 中文按书写系统定简繁：Hant 是繁体、Hans 是简体；没写书写系统时台湾、香港、澳门是繁体，其余是简体。 */
function chineseOf(subtags: readonly string[]): DesignerLanguage {
  if (subtags.includes('hant'))
    return 'zh-TW'
  if (subtags.includes('hans'))
    return 'zh-CN'
  return subtags.some(subtag => subtag === 'tw' || subtag === 'hk' || subtag === 'mo') ? 'zh-TW' : 'zh-CN'
}

/**
 * 按语言偏好（navigator.languages 的写法，先后即优先级）挑最接近的设计器语言：逐个看，完全一致的优先，
 * 否则取同一语言的那一种（中文按书写系统与地区分简繁）；都挑不到时是 undefined。
 */
export function matchDesignerLanguage(preferred: readonly string[]): DesignerLanguage | undefined {
  for (const tag of preferred) {
    const lower = tag.toLowerCase()
    const exact = DESIGNER_LANGUAGES.find(language => language.value.toLowerCase() === lower)
    if (exact)
      return exact.value
    const [primary, ...subtags] = lower.split('-')
    if (primary === 'zh')
      return chineseOf(subtags)
    const same = DESIGNER_LANGUAGES.find(language => language.value.slice(0, language.value.indexOf('-')).toLowerCase() === primary)
    if (same)
      return same.value
  }
  return undefined
}

/**
 * 设置里的语言此刻落成哪一种：没写、跟随页面或不认识的值是 undefined（设计器不另设语言）；跟随系统按 preferred
 * （缺省取 navigator.languages）挑，挑不到用 en-US；写了一种语言就是它。
 */
export function designerLanguageOf(settings: DesignerSettings | undefined, preferred: readonly string[] = globalThis.navigator?.languages ?? []): DesignerLanguage | undefined {
  const value = settings?.[DESIGNER_SETTING_KEYS.language]
  if (value === 'system')
    return matchDesignerLanguage(preferred) ?? FALLBACK_LANGUAGE
  return isDesignerLanguage(value) ? value : undefined
}

/**
 * 内建的「语言」分区，排在「基础」之后：一条下拉，缺省跟随页面，再是跟随系统与外壳自带的全部语言（名字是本名）。
 * 只作用于设计器：设计器把选定的语言包交给自己的根，不改页面的全局配置。
 */
export function designerLanguageSettings(t: DesignerSettingsTranslations): DesignerSettingsSection {
  return {
    id: DESIGNER_LANGUAGE_SETTINGS,
    label: t.language,
    order: 1,
    items: [{
      path: ['locale'],
      label: t.languageDisplay,
      control: {
        kind: 'select',
        appearance: 'dropdown',
        options: [{ value: 'follow', label: t.languageFollow }, { value: 'system', label: t.languageSystem }, ...DESIGNER_LANGUAGES],
      },
      default: 'follow',
      meta: { description: t.languageHint },
    }],
  }
}
