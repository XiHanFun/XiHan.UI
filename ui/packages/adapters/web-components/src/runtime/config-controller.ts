/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 配置控制器：元素连上文档后订阅所在子树的配置（setXhConfig 与祖先 <xh-config>），配置变化即请求宿主更新；
// 读取时沿祖先链现解析，给出 locale 与按组件分桶的文案。

import type { XhConfig } from '../config'
import type { ReactiveController, ReactiveControllerHost } from '../reactive'
import { onXhConfigChange, resolveXhConfig } from '../config'

/** 能挂配置控制器的宿主：响应式元素本身。 */
export type XhConfigControllerHost = ReactiveControllerHost & Element

export class XhConfigController implements ReactiveController {
  readonly #host: XhConfigControllerHost
  #unsubscribe: (() => void) | undefined

  constructor(host: XhConfigControllerHost) {
    this.#host = host
    host.addController(this)
  }

  hostConnected(): void {
    this.#unsubscribe?.()
    this.#unsubscribe = onXhConfigChange(() => this.#host.requestUpdate(), this.#host)
  }

  hostDisconnected(): void {
    this.#unsubscribe?.()
    this.#unsubscribe = undefined
  }

  /** 宿主此刻看到的配置：全局配置并上祖先链上的 <xh-config>。 */
  get config(): XhConfig {
    return resolveXhConfig(this.#host)
  }

  /** 宿主此刻看到的 BCP 47 语言标记。 */
  get locale(): string | undefined {
    return this.config.locale
  }

  /**
   * 某个组件的文案：defaults 垫底，配置里 translations[component] 那一桶压上去，元素自己的 own 再压上去；
   * 值为 undefined 的键视为没给。
   */
  translations<T extends object>(component: string, defaults: T, own?: Partial<T>): T {
    const bucket = (this.config.translations as Readonly<Record<string, Partial<T> | undefined>> | undefined)?.[component]
    const out = { ...defaults } as Record<string, unknown>
    for (const layer of [bucket, own]) {
      if (!layer)
        continue
      for (const [key, value] of Object.entries(layer)) {
        if (value !== undefined)
          out[key] = value
      }
    }
    return out as T
  }
}
