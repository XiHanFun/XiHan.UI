import type { Direction, Orientation } from '@xihan-ui/core'
import type { AccordionItemProps, AccordionSchema, AccordionValueChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled } from '@xihan-ui/behavior'
import { accordionAnatomy, accordionMachine, accordionMeta, connectAccordion } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

const ITEM_SELECTOR = '[data-xh-part="item"]'

/**
 * `<xh-accordion>` —— 手风琴行为宿主，条目身份写在 item 节点的 value 属性上。
 *
 * @customElement xh-accordion
 * @attr {'ltr'|'rtl'} dir - 文字方向，影响水平轴左右键语义
 * @attr {boolean} multiple - 允许多项同时展开
 * @attr {boolean} collapsible - 允许把最后一个展开项收起
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 vertical
 * @fires value-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 手风琴根容器
 * @csspart item - 单个条目容器，作者在此写 value 与可选 disabled
 * @csspart header - 条目标题
 * @csspart trigger - 展开/收起按钮
 * @csspart content - 条目面板，收起时带 hidden
 * @csspart indicator - 展开方向指示符
 */
export class XhAccordionElement extends XhElement {
  static override partContract = { anatomy: accordionAnatomy, meta: accordionMeta }

  static override properties = {
    // 展开集合是字符串数组，只走 property
    value: { attribute: false },
    defaultValue: { attribute: false },
    multiple: { type: Boolean },
    collapsible: { type: Boolean },
    orientation: {},
    // property 另起名字，避开 HTMLElement 自带的 dir 存取器
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

  private readonly ctrl = new MachineController<AccordionSchema>(
    this,
    accordionMachine,
    () => this.machineProps(),
  )

  private machineProps(): Partial<AccordionSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      multiple: this.multiple ?? false,
      collapsible: this.collapsible ?? false,
      orientation: this.orientation,
      dir: this.textDir,
      onValueChange: this.notify,
    }
  }

  /** 取角色节点所属条目的 value 与 disabled，向上找本宿主内的 item，没有则读节点自身。 */
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

    // 集合类 part 逐个 spread，身份由节点自报，不依赖下标。
    const putAll = (name: string, get: (item: AccordionItemProps) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(this.itemProps(el)) as Record<string, unknown>)
    }
    putAll('item', item => api.getItemProps(item))
    putAll('header', item => api.getHeaderProps(item))
    putAll('trigger', item => api.getTriggerProps(item))
    // content 收起靠 connect 给的 hidden 属性
    putAll('content', item => api.getContentProps(item))
    putAll('indicator', item => api.getIndicatorProps(item))
  }
}
