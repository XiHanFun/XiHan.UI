/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设置落到设计器上：主题与主题色写在设计器根的 data-theme、data-brand 上，只作用于设计器（浮层经视觉桥跟着走）；
// 设置的读写走根所在窗口的 localStorage。状态栏与语言由各款自己接。

import type { JsonValue } from '@xihan-ui/core/json'
import type { VisualEnvironmentStorageError } from '@xihan-ui/core/visual-environment'
import type { PropertySwatchOption } from '@xihan-ui/designer-kit/properties'
import type { DesignerSettings, DesignerSettingsSection, DesignerThemeSetting } from './model'
import { isJsonValue } from '@xihan-ui/core/json'
import { createEnvSignals } from '@xihan-ui/core/visual-environment'
import { DESIGNER_SETTING_KEYS, settingKey } from './model'

interface DesignerSettingsHostBaseOptions {
  /** 设计器根：主题写成它的 data-theme，主题色写成它的 data-brand。 */
  readonly root: HTMLElement
  /** 预设的主题色，与「基础」分区给的同一份：值是其中一项的 value 时直接写成 data-brand。 */
  readonly brands?: readonly PropertySwatchOption[]
  /**
   * 注册自定义主题色：入参是品牌 id 与颜色，返回撤销函数。designer-shell 不依赖令牌包，各款传 @xihan-ui/tokens 的
   * registerBrand；不给时不是预设的主题色不生效。
   */
  readonly registerBrand?: (id: string, color: string) => () => void
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
  /** 把主题与主题色写到设计器根上。 */
  apply: (settings: DesignerSettings) => void
  /** 撤掉跟随系统的监听与注册的主题色，根上的两个属性还原成接手前的样子。 */
  dispose: () => void
}

let customBrands = 0

/** 建一个设置宿主：读写设置，并把主题与主题色落到设计器根上。 */
export function createDesignerSettingsHost(options: DesignerSettingsHostOptions): DesignerSettingsHost {
  if (options.storageKey !== undefined && !options.onStorageError)
    throw new TypeError('启用 storageKey 必须提供 onStorageError')
  const { root } = options
  const win = root.ownerDocument.defaultView ?? undefined
  const initial = { theme: root.getAttribute('data-theme'), brand: root.getAttribute('data-brand') }
  const brandId = `xh-designer-brand-${++customBrands}`
  let unsubscribeSystem: (() => void) | undefined
  let unregisterBrand: (() => void) | undefined
  let registeredColor: string | undefined

  const restore = (name: 'data-theme' | 'data-brand', value: string | null): void => {
    if (value === null)
      root.removeAttribute(name)
    else
      root.setAttribute(name, value)
  }

  const applyTheme = (theme: JsonValue | undefined): void => {
    unsubscribeSystem?.()
    unsubscribeSystem = undefined
    const value = (['system', 'light', 'dark'] as const).includes(theme as never) ? theme as Exclude<DesignerThemeSetting, 'follow'> : 'follow'
    if (value === 'follow') {
      restore('data-theme', initial.theme)
      return
    }
    if (value !== 'system') {
      root.setAttribute('data-theme', value)
      return
    }
    const signals = createEnvSignals(win)
    const sync = (): void => root.setAttribute('data-theme', signals.systemMode())
    sync()
    unsubscribeSystem = signals.subscribe(sync)
  }

  const releaseBrand = (): void => {
    unregisterBrand?.()
    unregisterBrand = undefined
    registeredColor = undefined
  }

  const applyBrand = (brand: JsonValue | undefined): void => {
    if (typeof brand !== 'string' || brand === '') {
      releaseBrand()
      restore('data-brand', initial.brand)
      return
    }
    if (options.brands?.some(option => option.value === brand)) {
      releaseBrand()
      root.setAttribute('data-brand', brand)
      return
    }
    if (!options.registerBrand) {
      releaseBrand()
      restore('data-brand', initial.brand)
      return
    }
    if (registeredColor !== brand) {
      releaseBrand()
      unregisterBrand = options.registerBrand(brandId, brand)
      registeredColor = brand
    }
    root.setAttribute('data-brand', brandId)
  }

  return {
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
      applyTheme(settings[DESIGNER_SETTING_KEYS.theme])
      applyBrand(settings[DESIGNER_SETTING_KEYS.brand])
    },
    dispose() {
      unsubscribeSystem?.()
      unsubscribeSystem = undefined
      releaseBrand()
      restore('data-theme', initial.theme)
      restore('data-brand', initial.brand)
    },
  }
}
