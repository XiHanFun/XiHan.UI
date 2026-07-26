import type { Direction, Orientation } from '@xihan-ui/core'
import type { AccordionItemProps, AccordionSchema, AccordionValueChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled } from '@xihan-ui/behavior'
import { accordionMachine, connectAccordion } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

const ITEM_SELECTOR = '[data-xh-part="item"]'

/**
 * `<xh-accordion>` —— Light-DOM 行为宿主：用户写 root/item/header/trigger/content/indicator 角色节点，
 * 元素跑 accordion 机器并把 connect 产出逐个打上去。条目身份写在 item 节点的 value 属性上。
 *
 * @customElement xh-accordion
 * @attr {'ltr'|'rtl'} dir - 文字方向；只改水平轴上左右键的语义，不写进角色节点
 * @attr {boolean} multiple - 允许多项同时展开；缺省时展开一项即收起其余
 * @attr {boolean} collapsible - 允许把最后一个展开项收起；缺省时面板恒有内容
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 vertical
 * @fires value-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 手风琴根容器（承载 data-orientation）
 * @csspart item - 单个条目容器；作者在此写 value（身份）与可选 disabled
 * @csspart header - 条目标题（role=heading + aria-level）
 * @csspart trigger - 展开/收起按钮（aria-expanded/aria-controls 所在，无 roving tabindex）
 * @csspart content - 条目面板（role=region，收起时带 hidden）
 * @csspart indicator - 展开方向指示符（aria-hidden）
 */
export class XhAccordionElement extends XhElement {
  static override properties = {
    // 展开集合是字符串数组，没有等价的属性写法：只走 property，缺省即非受控
    value: { attribute: false },
    defaultValue: { attribute: false },
    multiple: { type: Boolean },
    collapsible: { type: Boolean },
    orientation: {},
    // 属性名是 dir，property 另起名字：HTMLElement 自带 dir 存取器，同名声明会盖掉原生反射。
    // 这里只把 dir 属性镜像成响应式 property（改 dir 要重跑 wire 换掉按键处理器）。
    textDir: { attribute: 'dir' },
  }

  declare value?: string[]
  declare defaultValue?: string[]
  declare multiple?: boolean
  declare collapsible?: boolean
  declare orientation?: Orientation
  declare textDir?: Direction

  private readonly notify = (details: AccordionValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // accordion 机器无副作用：不需要 config/layer/refs/scope，故 controller 只带 props。
  private readonly ctrl = new MachineController<AccordionSchema>(
    this,
    accordionMachine,
    () => this.machineProps(),
  )

  private machineProps(): Partial<AccordionSchema['props']> {
    return {
      value: this.value,
      // 机器自己兜 undefined，这里不补 []：props 每次读都新建数组会造成无谓的引用变动
      defaultValue: this.defaultValue,
      multiple: this.multiple ?? false,
      collapsible: this.collapsible ?? false,
      orientation: this.orientation,
      dir: this.textDir,
      onValueChange: this.notify,
    }
  }

  /**
   * 取角色节点所属条目的身份：value 与 disabled 都写在 item 节点上，
   * header/trigger/content/indicator 向上找自己的 item（item 自身 closest 命中的就是它自己）。
   * 没有 item 包裹层时退回读节点自身，扁平结构也能用。
   * 越出本宿主的 item 不算数——嵌套手风琴的内层节点不会认外层条目。
   */
  private itemProps(el: HTMLElement): AccordionItemProps {
    const owner = el.closest<HTMLElement>(ITEM_SELECTOR)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { value: source.getAttribute('value') ?? '', disabled: isItemDisabled(source) }
  }

  protected wire(): void {
    const api = connectAccordion(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 集合类 part 逐个 spread：身份由节点自报，不依赖下标，条目增删无需记账。
    // wire 跑在事件之前（element-base 的 updated），因此按键那一刻 data-scope/data-part
    // 已经在 DOM 上，导航原语查得到本台手风琴的 trigger 集合。
    const putAll = (name: string, get: (item: AccordionItemProps) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(this.itemProps(el)) as Record<string, unknown>)
    }
    putAll('item', item => api.getItemProps(item))
    putAll('header', item => api.getHeaderProps(item))
    putAll('trigger', item => api.getTriggerProps(item))
    // content 收起靠 connect 给的 hidden 即可：styled 没给 [data-part=content] 设 display，
    // UA 的 [hidden]{display:none} 压得住，不像 dialog/collapsible 需要内联 style 兜底。
    putAll('content', item => api.getContentProps(item))
    putAll('indicator', item => api.getIndicatorProps(item))
  }
}
