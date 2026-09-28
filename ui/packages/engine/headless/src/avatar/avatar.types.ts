/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 avatar 类型契约。

import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 图片加载状态；idle 是来源决议前的过渡态。 */
export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarStatusChangeDetails {
  status: AvatarStatus
}

export interface AvatarSchema extends MachineSchema {
  props: {
    src?: string
    alt?: string
    /** 尺寸：sm / md / lg，默认 md；默认档不输出 data-size */
    size?: Size
    /** 颜色：决定底色与回退字使用哪组状态色；未提供时不输出 data-tone，使用皮肤的中性默认 */
    tone?: Tone
    /**
     * 回退内容延迟多久才露面（毫秒），默认 300。图片在这段时间里载好就直接出图，不先闪一下首字母——
     * 缓存命中与虚拟列表回收行时尤其明显。没有 src 或载入失败时回退内容立即露面，不等。
     */
    fallbackDelay?: number
    /** 状态落定时通知，过渡态 idle 不通知。 */
    onStatusChange?: (details: AvatarStatusChangeDetails) => void
  }
  context: {
    /** 回退内容的等待已过：载入中也可以露面了。一旦过了就一直算过，换 src 重载时回退内容不再先藏起来。 */
    fallbackDue: boolean
    /** 回退节点还留着（没有 hidden）：图片载好后回退内容先淡出、与图片的淡入交叉，播完才为假。 */
    fallbackRendered: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: AvatarStatus
  event:
    // 来源决议：挂载后由效应发一次，之后每次 src 变化由 watch 再发
    | { type: 'SRC.CHANGE' }
    // <img> 的 DOM 事件，由 connect 挂在 image 上回送
    | { type: 'IMAGE.LOAD' }
    | { type: 'IMAGE.ERROR' }
    // 回退内容的等待到点
    | { type: 'FALLBACK.DUE' }
    // 回退节点留着与否（淡出播完才报 false）
    | { type: 'FALLBACK.RENDERED', rendered: boolean }
  tag: never
  guard: 'hasSrc'
  action: 'syncSrc' | 'invokeLoading' | 'invokeLoaded' | 'invokeError' | 'markFallbackDue' | 'setFallbackRendered'
  effect: 'resolveSrc' | 'waitFallbackDelay' | 'trackFallbackPresence'
}

export interface AvatarApi<T extends PropTypes = PropTypes> {
  status: AvatarStatus
  loaded: boolean
  getRootProps: () => T['element']
  getImageProps: () => T['img']
  getFallbackProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface AvatarTranslations {}
