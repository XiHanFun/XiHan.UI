import type { EllipsisExpandedChangeDetails, EllipsisOverflowChangeDetails, EllipsisSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { connectEllipsis, ellipsisAnatomy, ellipsisMachine, ellipsisMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态：属性缺席 = 非受控，写了才是受控的那个布尔。
const TRISTATE_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-ellipsis>` —— 省略行为宿主：把一段文字夹在给定行数内，并如实报出它有没有被裁掉。
 *
 * 量测在机器的效应里跑：挂载后推迟一拍量一次，此后跟着盒子尺寸与盒内文字的变化重量。
 * 结论落成 root 上的 data-overflowing，浮层不在这里做——要不要套一层提示由作者按这个属性决定。
 * 开了 tooltip 则另给一条不用浮层的路：真被裁了才把整段文字写进 root 的 title，交给平台的原生提示。
 *
 * 行数写在 root 的内联 style 里（自定义属性只有这一条路能同时落到两个适配器上），
 * 于是 root 的内联 style 归本元素管，作者自己的内联样式写在外层元素上。
 *
 * @customElement xh-ellipsis
 * @attr {number} lines - 夹几行，1 为单行，默认 1
 * @attr {boolean} expandable - 点一下铺开全文
 * @attr {boolean} expanded - 受控展开；缺省该属性即非受控
 * @attr {boolean} default-expanded - 非受控初始为铺开
 * @attr {boolean} tooltip - 真被裁了才把整段文字交给平台的原生提示
 * @fires expanded-change - 展开状态变化；detail 为 `{ expanded: boolean }`
 * @fires overflow-change - 溢出结论翻面；detail 为 `{ overflowing: boolean }`
 * @csspart root - 夹字的盒子，承载 data-lines / data-multiline / data-expandable / data-expanded / data-overflowing
 */
export class XhEllipsisElement extends XhElement {
  static override partContract = { anatomy: ellipsisAnatomy, meta: ellipsisMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    lines: { converter: NUMBER_CONVERTER },
    expandable: { type: Boolean },
    expanded: { converter: TRISTATE_CONVERTER },
    defaultExpanded: { type: Boolean, attribute: 'default-expanded' },
    tooltip: { type: Boolean },
  }

  declare lines?: number
  declare expandable?: boolean
  declare expanded?: boolean
  declare defaultExpanded?: boolean
  declare tooltip?: boolean

  private readonly notifyExpanded = (details: EllipsisExpandedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOverflow = (details: EllipsisOverflowChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('overflow-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<EllipsisSchema>(
    this,
    ellipsisMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<EllipsisSchema['props']> {
    return {
      lines: this.lines,
      expandable: this.expandable ?? false,
      expanded: this.expanded,
      defaultExpanded: this.defaultExpanded ?? false,
      tooltip: this.tooltip ?? false,
      onExpandedChange: this.notifyExpanded,
      onOverflowChange: this.notifyOverflow,
    }
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  // 取值口惰性读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<EllipsisSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  protected wire(): void {
    const api = connectEllipsis(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
