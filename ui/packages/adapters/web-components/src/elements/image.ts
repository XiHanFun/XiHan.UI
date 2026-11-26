/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { ImageApi, ImageSchema, ImageStatus, ImageStatusChangeDetails } from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectImage, imageAnatomy, imageMachine, imageMeta } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER, NUMBER_CONVERTER, STRING_CONVERTER } from '../dom/converters'
import { emitEvent } from '../dom/emit-event'
import { createAuthoredElement } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { placeAfterRoot } from '../dom/structure'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'
import { XhImageViewerElement } from './image-viewer'

/** 预览层工具条上的按钮，顺序与 Vue / React 的预览层一致。 */
const PREVIEW_TOOLS = [
  'zoom-out-trigger',
  'zoom-in-trigger',
  'rotate-left-trigger',
  'rotate-right-trigger',
  'flip-horizontal-trigger',
  'flip-vertical-trigger',
  'reset-trigger',
] as const

/**
 * 预览层的部件节点，写成作者会写的样子：遮罩、定位层，content 里依次是视口与大图、工具条、关闭钮。
 * 与 Vue / React 预览层渲出的是同一棵树（那两端的 content 自己装配遮罩与定位层）。
 */
function previewParts(doc: Document): HTMLElement[] {
  const part = (tag: 'div' | 'img' | 'button', name: string, children: readonly Node[] = []): HTMLElement =>
    createAuthoredElement(doc, tag, { 'data-xh-part': name }, children)
  return [
    part('div', 'backdrop'),
    part('div', 'positioner', [
      part('div', 'content', [
        part('div', 'viewport', [part('img', 'image')]),
        part('div', 'toolbar', PREVIEW_TOOLS.map(name => part('button', name))),
        part('button', 'close-trigger'),
      ]),
    ]),
  ]
}

/**
 * `<xh-image>`：Light-DOM 行为宿主：作者写 root / image / fallback 角色节点，
 * 元素运行 image 状态机并把 connect 产出接上。图片来源由宿主的 src / alt 写入 image 节点，
 * 加载成败经 image 自身的 load / error 回送给状态机；两个节点都常驻，依靠 hidden 互斥显隐。
 *
 * 与头像不同的是回退内容有一个延迟门槛：`fallback-delay` 之内不显示回退内容，
 * 缓存命中的图片直接从空位切换到图片，不会闪现占位。
 *
 * 开了 `preview`，root 成为打开大图预览的按钮，元素在 root 之后生成一台 `<xh-image-viewer>`（遮罩、大图、
 * 工具条与关闭钮都由元素生成，作者不写），开合跟着图片走；它的 open-change 不冒出本元素。
 *
 * @customElement xh-image
 * @attr {string} src - 图片地址；未提供该属性即没有来源，直接落到回退态
 * @attr {string} alt - 图片替代文本，原样写到 image 节点上
 * @attr {'cover'|'contain'|'fill'|'none'|'scale-down'} fit - 图片在盒子里的铺法，与 CSS object-fit 同名；未提供时由 --xh-image-fit 决定，缺省 cover
 * @attr {boolean} lazy - 进入视口附近才去取图（原生 loading="lazy"），默认 false
 * @attr {boolean} preview - 点击或 Enter / Space 打开大图预览，默认 false；要给预览层另一张图时经 property 赋 `{ src }`
 * @attr {number} fallback-delay - 加载超过该毫秒数才显示回退内容，默认 0（立即显示）
 * @fires status-change - 加载状态变化；detail 为 `{ status: 'loading' | 'loaded' | 'error' }`
 * @csspart root - 图片根容器（承载 data-state）；开了预览时是一颗按钮（role=button、可聚焦）
 * @csspart image - 图片节点，必须是原生 img；src / alt 由宿主写入（作者不应自行编写，会被覆盖或清除），未就绪时带 hidden（懒加载等着取图时不带）
 * @csspart placeholder - 加载期间铺在图位上的占位层；图片落定或失败后带 hidden
 * @csspart fallback - 回退内容（占位图、骨架屏、图标）；加载失败恒显示，加载途中取决于延迟门槛
 */
export class XhImageElement extends XhElement {
  static override partContract = { anatomy: imageAnatomy, meta: imageMeta }

  // 预览层是一台图片预览：按需注册本元素时连带注册它
  static override dependencies = { 'xh-image-viewer': XhImageViewerElement }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    src: { converter: STRING_CONVERTER },
    alt: { converter: STRING_CONVERTER },
    fit: { converter: STRING_CONVERTER },
    lazy: { converter: BOOLEAN_CONVERTER },
    // 写 attribute 是开关；要给预览层另一张图时经 property 赋对象
    preview: { converter: BOOLEAN_CONVERTER },
    fallbackDelay: { converter: NUMBER_CONVERTER, attribute: 'fallback-delay' },
  }

  declare src?: string
  declare alt?: string
  declare fit?: ImageSchema['props']['fit']
  declare lazy?: boolean
  declare preview?: ImageSchema['props']['preview']
  declare fallbackDelay?: number

  /** 预览层（root 之后的那台图片预览）按 key 复用。 */
  private readonly afterRootKeys: KeyedChildren = new WeakMap()
  /** 已经铺好部件节点的那台图片预览：撤掉再开时生成的是新的一台，要重新铺。 */
  private readonly previewViewers = new WeakSet<Element>()

  private readonly notify = (details: ImageStatusChangeDetails): void => {
    emitEvent(this, 'status-change', details)
  }

  // image 机器不碰 DOM、不用定位与消解层：不需要 config/layer/refs/scope，controller 只带 props。
  private readonly ctrl = new MachineController<ImageSchema>(this, imageMachine, () => this.machineProps())

  private machineProps(): Partial<ImageSchema['props']> {
    return {
      src: this.src,
      alt: this.alt,
      fit: this.fit,
      lazy: this.lazy,
      preview: this.preview,
      fallbackDelay: this.fallbackDelay,
      onStatusChange: this.notify,
    }
  }

  /**
   * 预览层：开了预览就在 root 之后放一台图片预览，开合受图片的 previewOpen 控制，它请求关闭时写回；
   * 不能预览了就撤掉。部件节点只在新建时铺一次，此后归那台元素自己接线。
   */
  private syncPreview(api: ImageApi): void {
    const item = api.previewItem
    placeAfterRoot(this, this.getPart('root'), item
      ? [{
          key: 'preview',
          instance: 'image-viewer',
          props: {
            collection: [item],
            open: api.previewOpen,
            onOpenChange: (details: { open: boolean }) => api.setPreviewOpen(details.open),
          },
        }]
      : [], this.afterRootKeys)
    if (!item)
      return
    // 按「铺过没有」认，不按里面有没有部件认：打开期间遮罩与定位层搬去了浮层落点，元素里是空的
    const viewer = this.querySelector<HTMLElement>(':scope > xh-image-viewer')
    if (viewer && !this.previewViewers.has(viewer)) {
      this.previewViewers.add(viewer)
      viewer.append(...previewParts(this.ownerDocument))
    }
  }

  /**
   * 图片在监听器挂载之前就已就绪时补一次上报：load 已经派发完毕，状态机无法再收到，
   * 状态会永远停在 loading：图片已就绪，前台却一直显示回退内容。两种情况会触发：
   * 作者把同一个 src 也写进了 img 标记（升级前浏览器就已加载完成），
   * 以及元素在 DOM 中被移动导致状态机重建（状态从头开始，而 src 未变的 img 不会重新加载）。
   *
   * 三个条件缺一不可：complete 排除仍在加载的请求；naturalWidth 排除加载失败：失败与
   * 未发起请求在这里无法区分，不做推测，停留在 loading 上照样只显示回退内容；
   * currentSrc 与 src 相等排除换图的瞬间，此时旧图仍是 complete 的，误报会把旧图当作新图显示。
   *
   * 只在 loading 补报：idle 期间补报会被随后落地的来源决议重新置回 loading。
   * 报告后即进入 loaded，下一帧不再命中，不会形成循环。
   */
  private syncSettledImage(status: ImageStatus): void {
    if (status !== 'loading')
      return
    const { getStatus, send } = this.ctrl.service
    // 宿主断开后仍可能跑完一次挂起的更新，此刻机器已停机（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    // 角色节点不是原生 img 时 complete / naturalWidth 都取不到，条件自然不成立
    const image = this.getPart('image') as HTMLImageElement | null
    if (image?.complete && image.naturalWidth > 0 && image.currentSrc === image.src)
      send({ type: 'IMAGE.LOAD' })
  }

  protected wire(): void {
    const api = connectImage(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps())
    // src 写在 onLoad/onError 之前也不漏事件：图片的 load/error 一律异步派发，
    // 而这两个监听器在同一段同步代码里就挂上了。
    const imageProps = api.getImageProps()
    const fallbackProps = api.getFallbackProps()
    put('image', imageProps)
    put('placeholder', api.getPlaceholderProps())
    put('fallback', fallbackProps)

    // 两个节点都常挂、互斥显隐，WC 自管可见性。connect 已置 hidden，但宿主不能指望作者装了
    // styles 那份样式：任何一句 `img { display: block }`、`[data-part=fallback] { display: flex }`
    // 都是 author 层，优先级高于 UA 的 [hidden]{display:none}，hidden 压不住；内联样式才压得住。
    // 显隐照连接层给的 hidden：回退内容撤下时先淡出、与图片交叉，播完 hidden 才落下
    this.setPartHidden(this.getPart('image'), imageProps.hidden === true)
    this.setPartHidden(this.getPart('fallback'), fallbackProps.hidden === true)

    this.syncPreview(api)

    // 属性与监听器都已落到 image 上，此刻才问得出"它是不是早就加载完了"
    this.syncSettledImage(api.status)
  }
}
