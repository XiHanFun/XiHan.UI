import type { ImageSchema, ImageStatus, ImageStatusChangeDetails } from '@xihan-ui/headless'
import { connectImage, imageMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-image>` —— Light-DOM 行为宿主：作者写 root/image/fallback 角色节点，
 * 元素跑 image 机器并把 connect 产出打上去。图片来源由宿主的 src/alt 写进 image 节点，
 * 加载成败经 image 自己的 load/error 回送给机器；两个节点都常挂，靠 hidden 互斥显隐。
 *
 * 与头像不同的是回退内容有个延迟门槛：`fallback-delay` 之内不显示回退内容，
 * 走缓存的快图直接从空位切到图片，不会闪一下占位。
 *
 * @customElement xh-image
 * @attr {string} src - 图片地址；缺省该属性即没有来源，直接落回退态
 * @attr {string} alt - 图片替代文本，原样写到 image 节点上
 * @attr {number} fallback-delay - 加载超过这么多毫秒才让回退内容露面，默认 0（立刻露面）
 * @fires status-change - 加载状态变化；detail 为 `{ status: 'loading' | 'loaded' | 'error' }`
 * @csspart root - 图片根容器（承载 data-status）
 * @csspart image - 图片节点，必须是原生 img；src/alt 由宿主写入（作者别自己写，会被覆盖或清掉），未就绪时带 hidden
 * @csspart fallback - 回退内容（占位图、骨架屏、图标）；加载失败恒显，加载途中要看延迟门槛
 */
export class XhImageElement extends XhElement {
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    src: { converter: STRING_CONVERTER },
    alt: { converter: STRING_CONVERTER },
    fallbackDelay: { converter: NUMBER_CONVERTER, attribute: 'fallback-delay' },
  }

  declare src?: string
  declare alt?: string
  declare fallbackDelay?: number

  private readonly notify = (details: ImageStatusChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('status-change', { detail: details, bubbles: true, composed: true }))
  }

  // image 机器不碰 DOM、不用定位与消解层：不需要 config/layer/refs/scope，controller 只带 props。
  private readonly ctrl = new MachineController<ImageSchema>(this, imageMachine, () => this.machineProps())

  private machineProps(): Partial<ImageSchema['props']> {
    return {
      src: this.src,
      alt: this.alt,
      fallbackDelay: this.fallbackDelay,
      onStatusChange: this.notify,
    }
  }

  /**
   * 图片早在监听器挂上之前就已就绪时补一次上报：load 已经派发完，机器再也等不到，
   * 状态会永远停在 loading——图片明明在手边，台前却一直是回退内容。两处会撞上：
   * 作者把同一个 src 也写进了 img 标记（升级前浏览器就加载完了），
   * 以及元素在 DOM 中被移动导致机器重建（状态从头走一遍，而 src 没变的 img 不会重新加载）。
   *
   * 三个条件缺一不可：complete 排除还在路上的请求；naturalWidth 排除加载失败——失败与
   * "压根没发起请求"在这里分不开，不去猜，留在 loading 上照样只显示回退内容；
   * currentSrc 与 src 相等排除换图那一瞬，此刻旧图仍是 complete 的，误报会把旧图当新图显出来。
   *
   * 只在 loading 补报：idle 期间补会被随后落地的来源决议一脚踢回 loading。
   * 报完即进 loaded，下一帧不再命中，不会闭成回路。
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
    put('root', api.getRootProps() as Record<string, unknown>)
    // src 写在 onLoad/onError 之前也不漏事件：图片的 load/error 一律异步派发，
    // 而这两个监听器在同一段同步代码里就挂上了。
    put('image', api.getImageProps() as Record<string, unknown>)
    put('fallback', api.getFallbackProps() as Record<string, unknown>)

    // 两个节点都常挂、互斥显隐，WC 自管可见性。connect 已置 hidden，但宿主不能指望作者装了
    // styled 那份样式：任何一句 `img { display: block }`、`[data-part=fallback] { display: flex }`
    // 都是 author 层，优先级高于 UA 的 [hidden]{display:none}，hidden 压不住；内联样式才压得住。
    this.setPartHidden(this.getPart('image'), !api.loaded)
    this.setPartHidden(this.getPart('fallback'), !api.showFallback)

    // 属性与监听器都已落到 image 上，此刻才问得出"它是不是早就加载完了"
    this.syncSettledImage(api.status)
  }
}
