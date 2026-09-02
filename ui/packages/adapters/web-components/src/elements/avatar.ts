import type { AvatarSchema, AvatarStatus, AvatarStatusChangeDetails } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import { avatarAnatomy, avatarMachine, avatarMeta, connectAvatar } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-avatar>` —— 头像行为宿主，src/alt 写进 image 节点，加载成败回送机器，image 与 fallback 互斥显隐。
 *
 * @customElement xh-avatar
 * @attr {string} src - 图片地址；缺省即直接落回退态
 * @attr {string} alt - 图片替代文本，原样写到 image 节点上
 * @attr {'sm'|'md'|'lg'} size - 尺寸档位，缺省 md
 * @fires status-change - 加载状态变化；detail 为 `{ status: 'loading' | 'loaded' | 'error' }`
 * @csspart root - 头像根容器，承载 data-state/data-size
 * @csspart image - 图片节点，必须是原生 img；src/alt 由宿主写入，未就绪时带 hidden
 * @csspart fallback - 图片之外的回退内容，图片就绪后带 hidden
 */
export class XhAvatarElement extends XhElement {
  static override partContract = { anatomy: avatarAnatomy, meta: avatarMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    src: { converter: STRING_CONVERTER },
    alt: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare src?: string
  declare alt?: string
  declare size?: Size

  private readonly notify = (details: AvatarStatusChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('status-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<AvatarSchema>(this, avatarMachine, () => this.machineProps())

  private machineProps(): Partial<AvatarSchema['props']> {
    return {
      src: this.src,
      alt: this.alt,
      size: this.size,
      onStatusChange: this.notify,
    }
  }

  /** 图片在监听器挂上之前就已就绪时补报一次 IMAGE.LOAD。 */
  private syncSettledImage(status: AvatarStatus): void {
    // 只在 loading 补报：idle 期间补会被随后落地的来源决议踢回 loading
    if (status !== 'loading')
      return
    const { getStatus, send } = this.ctrl.service
    // 机器已停机则跳过
    if (getStatus() !== 'Started')
      return
    const image = this.getPart('image') as HTMLImageElement | null
    // 三个条件缺一不可：complete 排除还在路上的请求，naturalWidth 排除加载失败，
    // currentSrc === src 排除换图那一瞬（此刻旧图仍是 complete 的）
    if (image?.complete && image.naturalWidth > 0 && image.currentSrc === image.src)
      send({ type: 'IMAGE.LOAD' })
  }

  protected wire(): void {
    const api = connectAvatar(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('image', api.getImageProps() as Record<string, unknown>)
    put('fallback', api.getFallbackProps() as Record<string, unknown>)

    // 用内联 display 互斥显隐
    this.setPartHidden(this.getPart('image'), !api.loaded)
    this.setPartHidden(this.getPart('fallback'), api.loaded)

    // 属性与监听器落到 image 之后，再判断它是否早已加载完
    this.syncSettledImage(api.status)
  }
}
