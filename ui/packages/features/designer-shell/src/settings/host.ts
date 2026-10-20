/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设置落到设计器上：主题与主题色写在设计器根的 data-theme、data-brand 上，只作用于设计器（浮层经视觉桥跟着走）；
// 主题跟随页面又选了主题色时，根上照抄外层的 data-theme；根上写了主题时一并照抄外层的 data-contrast，外层变了跟着改。
// 语言：选了一种语言（或跟随系统）时按 locale 选项取这台设计器的配置，记成 localeConfig 并通知根下的子树重画，设计器根把它
// 作为自己的 xhConfig 交出去，只作用于设计器；跟随系统时系统语言变了跟着换。设置的读写走根所在窗口的 localStorage。状态栏由各款自己接。

import type { JsonValue } from '@xihan-ui/core/json'
import type { EnvSignals, VisualEnvironmentStorageError } from '@xihan-ui/core/visual-environment'
import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerLanguage } from './language'
import type { DesignerSettings, DesignerSettingsSection, DesignerThemeSetting } from './model'
import { isJsonValue } from '@xihan-ui/core/json'
import { createEnvSignals } from '@xihan-ui/core/visual-environment'
import { BRAND_PRESETS, registerBrand } from '@xihan-ui/tokens'
import { notifyXhConfigChange } from '@xihan-ui/web-components/authoring'
import { designerLanguageOf } from './language'
import { DESIGNER_SETTING_KEYS, settingKey } from './model'

interface DesignerSettingsHostBaseOptions {
  /** 设计器根：主题写成它的 data-theme，主题色写成它的 data-brand。 */
  readonly root: HTMLElement
  /**
   * 选了语言（「语言」分区不是跟随页面）时这台设计器用的配置：通常是 @xihan-ui/designer-shell/language 的 loadDesignerLocale
   * 取的 UI 与 designer-shell 同语言包，再并上各款自己的同语言包。取到后记成 localeConfig、通知根下的子树重画；不给时语言那一条不生效。
   */
  readonly locale?: (language: DesignerLanguage) => XhConfig | Promise<XhConfig>
  /** localeConfig 换了时调用（语言换了、跟随系统时系统语言变了、dispose 时回到跟随页面）：设计器据此重画自己。 */
  readonly onLocaleChange?: () => void
}

/** createDesignerSettingsHost 的选项；要存储就得同时给出错出口，读写失败时回调、设置留在内存里。 */
export type DesignerSettingsHostOptions = DesignerSettingsHostBaseOptions & (
  | { readonly storageKey?: undefined, readonly onStorageError?: undefined }
  | { readonly storageKey: string, readonly onStorageError: (detail: VisualEnvironmentStorageError) => void }
)

/** 设置落到设计器上的那一层。 */
export interface DesignerSettingsHost {
  /** 从存储读出设置；没给存储键、没存过或读不出时是空对象。 */
  load: () => DesignerSettings
  /** 存进存储；sections 里 text 编辑方式标了 secret 的条目不存。 */
  save: (settings: DesignerSettings, sections?: readonly DesignerSettingsSection[]) => void
  /** 把主题与主题色写到设计器根上，并按语言那一条换 localeConfig（要取语言包时稍后才换）。 */
  apply: (settings: DesignerSettings) => void
  /**
   * 设计器根此刻的语言配置：跟随页面时是空对象，选了语言时是 locale 选项给的那一份。设计器根声明 xhConfig 返回它，
   * 根下的元素（含搬进浮层根的内容）就按它取 locale 与文案，页面别处不受影响。
   */
  readonly localeConfig: XhConfig
  /**
   * 撤掉跟随系统与外层的监听、注册的主题色，根上的 data-theme、data-brand、data-contrast 还原成接手前的样子，
   * localeConfig 回到空对象。
   */
  dispose: () => void
}

/** 跟随页面时的语言配置。 */
const FOLLOW_PAGE: XhConfig = Object.freeze({})

let customBrands = 0

/** 设置宿主会写到根上的三个属性。 */
const AXES = ['data-theme', 'data-brand', 'data-contrast'] as const
type Axis = (typeof AXES)[number]

/** 建一个设置宿主：读写设置，并把主题与主题色落到设计器根上。 */
export function createDesignerSettingsHost(options: DesignerSettingsHostOptions): DesignerSettingsHost {
  if (options.storageKey !== undefined && !options.onStorageError)
    throw new TypeError('启用 storageKey 必须提供 onStorageError')
  const { root } = options
  const doc = root.ownerDocument
  const win = doc.defaultView ?? undefined
  const initial: Readonly<Record<Axis, string | null>> = {
    'data-theme': root.getAttribute('data-theme'),
    'data-brand': root.getAttribute('data-brand'),
    'data-contrast': root.getAttribute('data-contrast'),
  }
  const brandId = `xh-designer-brand-${++customBrands}`
  let theme: DesignerThemeSetting = 'follow'
  /** 写到根上的品牌 id；不写时是 undefined。 */
  let brand: string | undefined
  let signals: EnvSignals | undefined
  let unsubscribeSystem: (() => void) | undefined
  let observer: MutationObserver | undefined
  let unregisterBrand: (() => void) | undefined
  let registeredColor: string | undefined
  let localeConfig: XhConfig = FOLLOW_PAGE
  /** 此刻要的语言（取语言包期间已经是新的）与已经落定的语言。 */
  let wantedLanguage: DesignerLanguage | undefined
  let appliedLanguage: DesignerLanguage | undefined
  /** 每次换语言加一：取完语言包时已经又换过就丢掉这一份。 */
  let localeRequest = 0
  /** 最近一次 apply 的设置：跟随系统时系统语言变了按它重挑。 */
  let lastSettings: DesignerSettings = {}
  let watchingLanguages = false

  /** 根以外最近的祖先上写的这个属性。 */
  const inherited = (name: Axis): string | null => root.parentElement?.closest(`[${name}]`)?.getAttribute(name) ?? null

  const write = (name: Axis, value: string | null): void => {
    if (root.getAttribute(name) === value)
      return
    if (value === null)
      root.removeAttribute(name)
    else
      root.setAttribute(name, value)
  }

  /**
   * 按此刻的设置与外层写好根上的三个属性：data-brand 要与 data-theme 在同一个元素上才换得动品牌，主题跟随页面又选了
   * 主题色时照抄外层的主题（外层没写就是亮色）；根上新写了主题时，语义令牌在这里重新声明，外层的对比度也要照抄过来。
   */
  const sync = (): void => {
    const ownTheme = theme === 'light' || theme === 'dark'
      ? theme
      : theme === 'system'
        ? signals!.systemMode()
        : brand === undefined ? initial['data-theme'] : initial['data-theme'] ?? inherited('data-theme') ?? 'light'
    write('data-theme', ownTheme)
    write('data-brand', brand ?? initial['data-brand'])
    write('data-contrast', initial['data-contrast'] ?? (ownTheme === initial['data-theme'] ? null : inherited('data-contrast')))
  }

  /** 根上写了外层取来的值时，外层的主题与对比度变了就重写。 */
  const watch = (on: boolean): void => {
    if (!on) {
      observer?.disconnect()
      observer = undefined
      return
    }
    if (observer)
      return
    observer = new MutationObserver((records) => {
      if (records.some(record => !root.contains(record.target)))
        sync()
    })
    observer.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-contrast'], subtree: true })
  }

  const releaseBrand = (): void => {
    unregisterBrand?.()
    unregisterBrand = undefined
    registeredColor = undefined
  }

  /**
   * 主题色设置换成要写到根上的品牌 id：UI 的预设品牌直接用，别的颜色在根所在文档里注册成本设计器的品牌
   * （@xihan-ui/tokens 的 registerBrand）；取不出品牌梯度的值不生效。
   */
  const resolveBrand = (value: JsonValue | undefined): string | undefined => {
    if (typeof value === 'string' && (BRAND_PRESETS as readonly string[]).includes(value)) {
      releaseBrand()
      return value
    }
    if (typeof value === 'string' && value !== '') {
      if (registeredColor === value)
        return brandId
      releaseBrand()
      try {
        unregisterBrand = registerBrand(brandId, value, { doc })
      }
      catch {
        return undefined
      }
      registeredColor = value
      return brandId
    }
    releaseBrand()
    return undefined
  }

  const setLocale = (language: DesignerLanguage | undefined, config: XhConfig): void => {
    appliedLanguage = language
    localeConfig = config
    notifyXhConfigChange(root)
    options.onLocaleChange?.()
  }

  /** 换到这种语言：跟随页面当场换回空配置，选了语言时取完配置再换；取的期间又换了就丢掉旧的那一份。 */
  const switchLanguage = (language: DesignerLanguage | undefined): void => {
    if (language === wantedLanguage)
      return
    wantedLanguage = language
    const request = ++localeRequest
    if (language === undefined) {
      setLocale(undefined, FOLLOW_PAGE)
      return
    }
    void Promise.resolve(options.locale!(language)).then((config) => {
      if (request === localeRequest)
        setLocale(language, config)
    }, (error: unknown) => {
      if (request === localeRequest)
        wantedLanguage = appliedLanguage
      throw error
    })
  }

  const onLanguageChange = (): void => switchLanguage(designerLanguageOf(lastSettings, win?.navigator.languages ?? []))

  /** 跟随系统时盯着浏览器的语言偏好。 */
  const watchLanguages = (on: boolean): void => {
    if (on === watchingLanguages || !win)
      return
    watchingLanguages = on
    if (on)
      win.addEventListener('languagechange', onLanguageChange)
    else
      win.removeEventListener('languagechange', onLanguageChange)
  }

  return {
    get localeConfig() {
      return localeConfig
    },
    load() {
      const key = options.storageKey
      if (key === undefined)
        return {}
      try {
        if (!win)
          throw new Error('当前 realm 没有可用的 localStorage')
        const raw = win.localStorage.getItem(key)
        if (raw === null)
          return {}
        const value: unknown = JSON.parse(raw)
        if (typeof value !== 'object' || value === null || Array.isArray(value) || !isJsonValue(value))
          throw new TypeError('存储里的设置不是一个对象')
        return value as DesignerSettings
      }
      catch (error) {
        options.onStorageError!({ operation: 'read', key, error })
        return {}
      }
    },
    save(settings, sections = []) {
      const key = options.storageKey
      if (key === undefined)
        return
      const secret = new Set(sections.flatMap(section => section.items
        .filter(item => item.control.kind === 'text' && (item.control as { readonly secret?: boolean }).secret === true)
        .map(item => settingKey(section, item))))
      const stored = Object.fromEntries(Object.entries(settings).filter(([name]) => !secret.has(name)))
      try {
        if (!win)
          throw new Error('当前 realm 没有可用的 localStorage')
        win.localStorage.setItem(key, JSON.stringify(stored))
      }
      catch (error) {
        options.onStorageError!({ operation: 'write', key, error })
      }
    },
    apply(settings) {
      const next = settings[DESIGNER_SETTING_KEYS.theme]
      theme = (['system', 'light', 'dark'] as const).includes(next as never) ? next as DesignerThemeSetting : 'follow'
      unsubscribeSystem?.()
      unsubscribeSystem = undefined
      if (theme === 'system') {
        signals ??= createEnvSignals(win)
        unsubscribeSystem = signals.subscribe(sync)
      }
      brand = resolveBrand(settings[DESIGNER_SETTING_KEYS.brand])
      sync()
      watch(theme !== 'follow' || brand !== undefined)
      if (options.locale) {
        lastSettings = settings
        watchLanguages(settings[DESIGNER_SETTING_KEYS.language] === 'system')
        onLanguageChange()
      }
    },
    dispose() {
      unsubscribeSystem?.()
      unsubscribeSystem = undefined
      watch(false)
      releaseBrand()
      theme = 'follow'
      brand = undefined
      for (const name of AXES)
        write(name, initial[name])
      watchLanguages(false)
      switchLanguage(undefined)
    },
  }
}
