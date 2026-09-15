/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 image 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 图片加载状态。idle 是来源决议前的过渡态，其余三态对外稳定。 */
export type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface ImageStatusChangeDetails {
  status: ImageStatus
}

export interface ImageSchema extends MachineSchema {
  props: {
    src?: string
    alt?: string
    /**
     * 加载超过该时长（毫秒）才显示回退内容，默认 0（立即显示）。
     * Infinity 表示加载期间永不显示回退内容，只有失败才显示。
     */
    fallbackDelay?: number
    /** 状态每次实际落定时通知一次；过渡态 idle 不通知。 */
    onStatusChange?: (details: ImageStatusChangeDetails) => void
  }
  context: {
    /** 加载期间回退内容当前是否应显示。进入 loading 时按 fallbackDelay 重置，到期由计时器置真。 */
    fallbackVisible: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: ImageStatus
  event:
    // 来源决议：挂载后由效应发一次，之后每次 src 变化由 watch 再发
    | { type: 'SRC.CHANGE' }
    // <img> 自己派发的 DOM 事件，由 connect 挂在 image 上回送
    | { type: 'IMAGE.LOAD' }
    | { type: 'IMAGE.ERROR' }
    /** 回退延迟到期，显示回退内容。 */
    | { type: 'after.fallbackDelay' }
  tag: never
  guard: 'hasSrc'
  action: 'syncSrc' | 'resetFallback' | 'showFallback' | 'invokeLoading' | 'invokeLoaded' | 'invokeError'
  effect: 'resolveSrc' | 'trackFallbackDelay'
}

export interface ImageApi<T extends PropTypes = PropTypes> {
  status: ImageStatus
  loaded: boolean
  /** 回退内容当前是否应显示：加载失败恒为真，加载途中取决于 fallbackDelay 是否已过。 */
  showFallback: boolean
  /** 占位层当前是否应显示：来源决议中与加载中为真，落定或失败后为假。 */
  showPlaceholder: boolean
  getRootProps: () => T['element']
  getImageProps: () => T['img']
  /** 加载期间铺在图位上的占位层，纯装饰。 */
  getPlaceholderProps: () => T['element']
  getFallbackProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ImageTranslations {}
