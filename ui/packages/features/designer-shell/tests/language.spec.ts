// @vitest-environment jsdom

// 设计器的语言：外壳自带的语言清单与 UI 组件库的语言包一一对应、用各自的本名；跟随系统时按浏览器的语言偏好挑最接近的，
// 挑不到用 en-US；按语言取 UI 组件库与 designer-shell 的同语言包并成一份配置；设置宿主把选定的语言落到设计器根上。
import type { XhConfig } from '@xihan-ui/web-components'
import type { XhLocale } from '@xihan-ui/web-components/locale'
import type { DesignerSettingsHost } from '../src'
import * as uiLocales from '@xihan-ui/web-components/locale'
import { describe, expect, it } from 'vitest'
import { createDesignerSettingsHost, defineDesignerShell, DESIGNER_LANGUAGES, DESIGNER_SETTING_KEYS, designerLanguageOf, matchDesignerLanguage } from '../src'
import { loadDesignerLocale } from '../src/language'
import * as shellLocales from '../src/locale'

defineDesignerShell()

describe('语言清单', () => {
  it('与 UI 组件库的内建语言包一一对应，designer-shell 每种语言都有语言包；名字是各自的本名', () => {
    const ui = Object.values(uiLocales as Record<string, XhLocale>).map(pack => pack.locale)
    expect(DESIGNER_LANGUAGES.map(language => language.value).sort()).toEqual([...ui].sort())
    expect(Object.keys(shellLocales).filter(name => name.startsWith('designerShell'))).toHaveLength(DESIGNER_LANGUAGES.length)
    expect(DESIGNER_LANGUAGES.map(language => [language.value, language.label])).toEqual([
      ['zh-CN', '简体中文'],
      ['zh-TW', '繁體中文'],
      ['en-US', 'English'],
      ['ja-JP', '日本語'],
      ['ko-KR', '한국어'],
      ['de-DE', 'Deutsch'],
      ['fr-FR', 'Français'],
      ['es-ES', 'Español'],
      ['pt-BR', 'Português (Brasil)'],
      ['ru-RU', 'Русский'],
    ])
  })
})

describe('跟随系统', () => {
  it('matchDesignerLanguage 按偏好先后挑：完全一致优先，其次同一语言；中文按书写系统与地区分简繁；都挑不到时是 undefined', () => {
    expect([
      matchDesignerLanguage(['EN-gb']),
      matchDesignerLanguage(['fr-CA']),
      matchDesignerLanguage(['pt-PT']),
      matchDesignerLanguage(['it-IT', 'de-AT']),
      matchDesignerLanguage(['zh']),
      matchDesignerLanguage(['zh-HK']),
      matchDesignerLanguage(['zh-Hant']),
      matchDesignerLanguage(['zh-Hans-HK']),
      matchDesignerLanguage(['zh-TW', 'zh-CN']),
      matchDesignerLanguage(['it', 'nl']),
      matchDesignerLanguage([]),
    ]).toEqual(['en-US', 'fr-FR', 'pt-BR', 'de-DE', 'zh-CN', 'zh-TW', 'zh-TW', 'zh-CN', 'zh-TW', undefined, undefined])
  })

  it('designerLanguageOf：没写、跟随页面或不认识的值是 undefined；跟随系统按偏好挑，挑不到用 en-US；写了哪种就是哪种', () => {
    const of = (value: string | undefined, preferred: readonly string[] = ['ja']): ReturnType<typeof designerLanguageOf> =>
      designerLanguageOf(value === undefined ? {} : { [DESIGNER_SETTING_KEYS.language]: value }, preferred)
    expect(DESIGNER_SETTING_KEYS.language).toBe('language.locale')
    expect([of(undefined), of('follow'), of('xx-XX'), of('system'), of('system', ['it']), of('ko-KR')]).toEqual([undefined, undefined, undefined, 'ja-JP', 'en-US', 'ko-KR'])
  })
})

describe('loadDesignerLocale', () => {
  it('一种语言的 UI 组件库与 designer-shell 语言包并成一份：locale 是这种语言，UI 的各桶与 xh-designer-* 各桶都在', async () => {
    const config = await loadDesignerLocale('ja-JP')
    expect(config.locale).toBe('ja-JP')
    const translations = config.translations as Record<string, unknown>
    for (const [bucket, value] of Object.entries(uiLocales.jaJP.translations))
      expect(translations[bucket]).toEqual(value)
    for (const [bucket, value] of Object.entries(shellLocales.designerShellJaJP.translations!))
      expect(translations[bucket]).toEqual(value)
  })
})

/** 声明 xhConfig 的设计器根：交出设置宿主此刻的语言配置。 */
class LocaleRoot extends HTMLElement {
  host: DesignerSettingsHost | undefined
  get xhConfig(): XhConfig {
    return this.host?.localeConfig ?? {}
  }
}
customElements.define('test-locale-root', LocaleRoot)

async function flush(element: { updateComplete: Promise<unknown> }): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await new Promise(resolve => setTimeout(resolve, 0))
    await element.updateComplete
  }
}

describe('设置宿主落语言', () => {
  it('选了语言：按 locale 取配置记成 localeConfig，通知根下子树重画，已渲染的设置对话框换成这份文案；跟随页面回到空对象；跟随系统按浏览器的语言偏好挑', async () => {
    const root = document.createElement('test-locale-root') as LocaleRoot
    const loaded: string[] = []
    let changes = 0
    root.host = createDesignerSettingsHost({
      root,
      locale: async (language) => {
        loaded.push(language)
        return { locale: language, translations: { 'xh-designer-settings': { general: `general ${language}` } } }
      },
      onLocaleChange: () => void (changes += 1),
    })
    const dialog = document.createElement('xh-designer-settings')
    root.append(dialog)
    document.body.append(root)
    dialog.open = true
    await flush(dialog)
    const first = (): string | null | undefined => document.querySelector('xh-tabs [data-xh-part="list"] > button')?.textContent
    expect([first(), root.host.localeConfig]).toEqual(['General', {}])
    root.host.apply({ [DESIGNER_SETTING_KEYS.language]: 'ja-JP' })
    await flush(dialog)
    expect([first(), root.host.localeConfig.locale, changes]).toEqual(['general ja-JP', 'ja-JP', 1])
    root.host.apply({ [DESIGNER_SETTING_KEYS.language]: 'ja-JP', [DESIGNER_SETTING_KEYS.theme]: 'dark' })
    await flush(dialog)
    expect([loaded, changes]).toEqual([['ja-JP'], 1])
    root.host.apply({ [DESIGNER_SETTING_KEYS.language]: 'follow' })
    await flush(dialog)
    expect([first(), root.host.localeConfig, changes]).toEqual(['General', {}, 2])
    root.host.apply({ [DESIGNER_SETTING_KEYS.language]: 'system' })
    await flush(dialog)
    expect(root.host.localeConfig.locale).toBe(designerLanguageOf({ [DESIGNER_SETTING_KEYS.language]: 'system' }, navigator.languages))
    root.host.dispose()
    await flush(dialog)
    expect([first(), root.host.localeConfig]).toEqual(['General', {}])
    root.remove()
  })

  it('取语言包期间又换了语言：只落最后要的那一种；没给 locale 时语言那一条不生效', async () => {
    const root = document.createElement('test-locale-root') as LocaleRoot
    const pending = new Map<string, (config: XhConfig) => void>()
    root.host = createDesignerSettingsHost({ root, locale: language => new Promise(resolve => void pending.set(language, resolve)) })
    root.host.apply({ [DESIGNER_SETTING_KEYS.language]: 'ja-JP' })
    root.host.apply({ [DESIGNER_SETTING_KEYS.language]: 'ko-KR' })
    pending.get('ko-KR')!({ locale: 'ko-KR' })
    await new Promise(resolve => setTimeout(resolve, 0))
    pending.get('ja-JP')!({ locale: 'ja-JP' })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(root.host.localeConfig.locale).toBe('ko-KR')
    const plain = createDesignerSettingsHost({ root: document.createElement('div') })
    plain.apply({ [DESIGNER_SETTING_KEYS.language]: 'ja-JP' })
    expect(plain.localeConfig).toEqual({})
  })
})
