import type { AffixChangeDetails, AffixSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { affixAnatomy, affixMachine, affixMeta, connectAffix } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-affix>` —— 吸附行为宿主：滚过判定线就把 content 钉在滚动容器可视区的边上。
 *
 * root 是占位盒，content 吸住时脱离常规流，root 留在原位撑住那块空间，页面不跳。
 * 判定与量测都在机器的效应里做：挂载后推迟一拍量一次，此后跟着 scroll 与 resize 走。
 * 钉住的落位（top / bottom / left / width）由机器量好写进 content 的内联样式，
 * 皮肤只按 data-fixed 给 position 与层级。
 *
 * @customElement xh-affix
 * @attr {number} offset-top - 吸住后距滚动容器可视区上边的距离（px），默认 0
 * @attr {number} offset-bottom - 吸住后距可视区下边的距离（px）；给了它就改贴下边
 * @fires affix-change - 吸附状态变化；detail 为 `{ affixed: boolean }`
 * @csspart root - 占位盒，吸住时带上冻结的高度
 * @csspart content - 真正被钉住的那块内容，吸住时带 data-fixed
 */
export class XhAffixElement extends XhElement {
  static override partContract = { anatomy: affixAnatomy, meta: affixMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // offsetTop / offsetBottom 撞 HTMLElement 的原生只读属性，字段改名，属性名不变
    topOffset: { converter: NUMBER_CONVERTER, attribute: 'offset-top' },
    bottomOffset: { converter: NUMBER_CONVERTER, attribute: 'offset-bottom' },
    // 滚动容器是 DOM 句柄，只走 property；不给即整页滚动
    target: { attribute: false },
  }

  declare topOffset?: number
  declare bottomOffset?: number
  declare target?: HTMLElement | null

  private readonly notify = (details: AffixChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('affix-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<AffixSchema>(
    this,
    affixMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<AffixSchema['props']> {
    return {
      offsetTop: this.topOffset,
      offsetBottom: this.bottomOffset,
      onAffixChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  // 取值口惰性读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<AffixSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getTargetEl', () => this.target ?? null)
  }

  protected wire(): void {
    const api = connectAffix(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
  }
}
