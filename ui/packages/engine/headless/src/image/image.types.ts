/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 image 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { ImageViewerItem } from '../image-viewer/image-viewer.types'

/** 图片加载状态。idle 是来源决议前的过渡态，其余三态对外稳定。 */
export type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

/** 图片在盒子里的铺法，取值与 CSS object-fit 同名。 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'

/** 预览的配置：写成对象时用它，写 true 等于全部取缺省。 */
export interface ImagePreviewOptions {
  /** 预览层里看的那张图，缺省就是 src：缩略图给小图、预览给原图时写它。 */
  src?: string
}

export interface ImageStatusChangeDetails {
  status: ImageStatus
}

export interface ImageSchema extends MachineSchema {
  props: {
    src?: string
    alt?: string
    /**
     * 图片在盒子里的铺法，与 CSS object-fit 同名。没写时由皮肤的 `--xh-image-fit` 决定，缺省 cover；
     * 写了就按它铺，压过那个变量。
     */
    fit?: ImageFit
    /**
     * 进入视口附近才去取图，交给浏览器原生的 `loading="lazy"`，默认 false。
     * 等着取图期间图片元素不收起（收起的图片浏览器永远不会去取），由皮肤把它叠在图位上、保持透明。
     */
    lazy?: boolean
    /**
     * 点击图片打开大图预览，默认 false。开了以后整张图是一颗按钮：可以聚焦，Enter / Space 也能打开；
     * 预览层关上后焦点回到图片。没有可看的图（src 与 preview.src 都没给）时不生效。
     */
    preview?: boolean | ImagePreviewOptions
    /**
     * 加载超过该时长（毫秒）才显示回退内容，默认 0（立即显示）。
     * Infinity 表示加载期间永不显示回退内容，只有失败才显示。
     */
    fallbackDelay?: number
    /** 状态每次实际落定时通知一次；过渡态 idle 不通知。 */
    onStatusChange?: (details: ImageStatusChangeDetails) => void
  }
  context: {
    /** 大图预览开着。点击或 Enter / Space 打开，预览层请求关闭时收起；预览不再可用时一并收起。 */
    previewOpen: boolean
    /** 上一回载好的 src：换图时旧图的替身取它，新图载好前盖在原处。载入失败即清空。 */
    shownSrc: string | null
    /** 加载期间回退内容当前是否应显示。进入 loading 时按 fallbackDelay 重置，到期由计时器置真。 */
    fallbackVisible: boolean
    /** 占位层还留着（没有 hidden）：图片载好或失败后先淡出，播完才为假。 */
    placeholderRendered: boolean
    /** 回退节点还留着：图片载好后先淡出、与图片交叉，播完才为假。 */
    fallbackRendered: boolean
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
    /** 占位层 / 回退节点留着与否（淡出播完才报 false）。 */
    | { type: 'PART.RENDERED', part: 'placeholder' | 'fallback', rendered: boolean }
    /** 打开大图预览：点击图片、Enter / Space，或 setPreviewOpen(true)。预览不可用时被守卫拦下。 */
    | { type: 'PREVIEW.OPEN' }
    /** 收起大图预览：预览层请求关闭（Esc、点遮罩、关闭钮），或 setPreviewOpen(false)。 */
    | { type: 'PREVIEW.CLOSE' }
  tag: never
  guard: 'hasSrc' | 'canPreview'
  action: 'syncSrc' | 'resetFallback' | 'showFallback' | 'invokeLoading' | 'invokeLoaded' | 'invokeError' | 'setPartRendered' | 'beginSwap' | 'rememberSrc' | 'endSwap' | 'openPreview' | 'closePreview' | 'syncPreview'
  effect: 'resolveSrc' | 'trackFallbackDelay' | 'trackPlaceholderPresence' | 'trackFallbackPresence' | 'releaseSwap'
}

export interface ImageApi<T extends PropTypes = PropTypes> {
  status: ImageStatus
  loaded: boolean
  /** 回退内容当前是否应显示：加载失败恒为真，加载途中取决于 fallbackDelay 是否已过。 */
  showFallback: boolean
  /** 占位层当前是否应显示：来源决议中与加载中为真，落定或失败后为假。 */
  showPlaceholder: boolean
  /** 开了预览、也有可看的图：root 此时是一颗打开预览的按钮。 */
  previewable: boolean
  /** 大图预览当前开着。 */
  previewOpen: boolean
  /** 预览层里看的那张图（地址取 preview.src，缺省取 src；替代文本取 alt）；不可预览时为 null。 */
  previewItem: ImageViewerItem | null
  /** 打开或收起大图预览；不可预览时打开无效。适配器把它接在预览层的 open 变化上。 */
  setPreviewOpen: (open: boolean) => void
  getRootProps: () => T['element']
  getImageProps: () => T['img']
  /** 加载期间铺在图位上的占位层，纯装饰。 */
  getPlaceholderProps: () => T['element']
  getFallbackProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ImageTranslations {}
