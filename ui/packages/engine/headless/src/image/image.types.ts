import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

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
     * 加载超过这么久（毫秒）才让回退内容露面，默认 0（立刻露面）。
     * Infinity 表示加载期间永不显示回退内容，只有失败才显。
     */
    fallbackDelay?: number
    /** 状态每次真正落位时通知一次；过渡态 idle 不通知。 */
    onStatusChange?: (details: ImageStatusChangeDetails) => void
  }
  context: {
    /** 加载期间回退内容此刻该不该露面。进入 loading 时按 fallbackDelay 重置，到点由计时器翻开。 */
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
    /** 回退延迟到点，让回退内容顶上。 */
    | { type: 'after.fallbackDelay' }
  tag: never
  guard: 'hasSrc'
  action: 'syncSrc' | 'resetFallback' | 'showFallback' | 'invokeLoading' | 'invokeLoaded' | 'invokeError'
  effect: 'resolveSrc' | 'trackFallbackDelay'
}

export interface ImageApi<T extends PropTypes = PropTypes> {
  status: ImageStatus
  loaded: boolean
  /** 回退内容此刻是否该露面：加载失败恒为真，加载途中要看 fallbackDelay 是否已过。 */
  showFallback: boolean
  getRootProps: () => T['element']
  getImageProps: () => T['img']
  getFallbackProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ImageTranslations {}
