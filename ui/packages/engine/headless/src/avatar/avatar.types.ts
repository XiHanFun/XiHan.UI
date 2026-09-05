import type { MachineSchema, PropTypes, Size } from '@xihan-ui/core'

/** 图片加载状态；idle 是来源决议前的过渡态。 */
export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarStatusChangeDetails {
  status: AvatarStatus
}

export interface AvatarSchema extends MachineSchema {
  props: {
    src?: string
    alt?: string
    /** 尺寸：sm / md / lg，缺省 md；缺省档不输出 data-size */
    size?: Size
    /** 状态落位时通知，过渡态 idle 不通知。 */
    onStatusChange?: (details: AvatarStatusChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: AvatarStatus
  event:
    // 来源决议：挂载后由效应发一次，之后每次 src 变化由 watch 再发
    | { type: 'SRC.CHANGE' }
    // <img> 的 DOM 事件，由 connect 挂在 image 上回送
    | { type: 'IMAGE.LOAD' }
    | { type: 'IMAGE.ERROR' }
  tag: never
  guard: 'hasSrc'
  action: 'syncSrc' | 'invokeLoading' | 'invokeLoaded' | 'invokeError'
  effect: 'resolveSrc'
}

export interface AvatarApi<T extends PropTypes = PropTypes> {
  status: AvatarStatus
  loaded: boolean
  getRootProps: () => T['element']
  getImageProps: () => T['img']
  getFallbackProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface AvatarTranslations {}
