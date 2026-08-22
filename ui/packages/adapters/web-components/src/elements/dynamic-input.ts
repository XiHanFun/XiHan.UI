import type { DynamicInputItemProps, DynamicInputSchema, DynamicInputTranslations, DynamicInputValueChangeDetails } from '@xihan-ui/headless'
import { connectDynamicInput, dynamicInputAnatomy, dynamicInputMachine, dynamicInputMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 作者写在行上的下标。缺席或写坏了就退回文档序——把行按顺序排下来本身就是声明。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-dynamic-input>` —— Light-DOM 行为宿主：作者写 root/item/item-content/item-action 与
 * add-trigger、item-delete-trigger、move-up-trigger、move-down-trigger 角色节点，
 * 元素跑 dynamic-input 机器并把 connect 产出打上去。
 *
 * 值是宿主自己的数据数组，元素只管增删与换序这套动作，行里放什么控件由作者写进 item-content。
 * 行节点由作者按当前值渲染（一行一个 item，身份取节点上的 index 属性，缺省按文档序），
 * 值变了要由作者那一侧增删行节点，改完 MutationObserver 会自动重新接线。
 *
 * 数据数组、造行工厂与读屏文案都表达不成属性，三者只作为 property 暴露。
 *
 * @customElement xh-dynamic-input
 * @attr {number} min - 最少几行；到了就按不动删除把手
 * @attr {number} max - 最多几行；到了就按不动新增把手
 * @attr {boolean} movable - 出不出换序把手；关时两个换序把手一律收起
 * @attr {boolean} disabled - 禁用：新增、删除、换序三路都按不动
 * @fires value-change - 数据数组变化；detail 为 `{ value: unknown[] }`
 * @csspart root - 整份列表的容器，承载 data-disabled / data-empty / data-at-min / data-at-max / data-movable
 * @csspart item - 一行一个，可自带 index 属性声明下标，缺省按文档序
 * @csspart item-content - 一行里放作者自己控件的位置
 * @csspart item-action - 一行里放把手的位置
 * @csspart add-trigger - 新增把手，须是原生 `<button>`；到上限转 aria-disabled 但仍可聚焦；名字取自身内容
 * @csspart item-delete-trigger - 删除把手，须是原生 `<button>`；到下限转 aria-disabled；自带 aria-label
 * @csspart move-up-trigger - 上移把手，须是原生 `<button>`；首行转 aria-disabled；自带 aria-label
 * @csspart move-down-trigger - 下移把手，须是原生 `<button>`；末行转 aria-disabled；自带 aria-label
 */
export class XhDynamicInputElement extends XhElement {
  static override partContract = { anatomy: dynamicInputAnatomy, meta: dynamicInputMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 宿主的行数据是任意值，属性表达不了，只走 property
    value: { attribute: false },
    defaultValue: { attribute: false },
    min: { converter: NUMBER_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    createItem: { attribute: false },
    movable: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: unknown[]
  declare defaultValue?: unknown[]
  declare min?: number
  declare max?: number
  declare createItem?: () => unknown
  declare movable?: boolean
  declare disabled?: boolean
  declare translations?: Partial<DynamicInputTranslations>

  private readonly notifyValue = (details: DynamicInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // 机器只有一个还焦点的收尾动作（自己经 scope 取节点），不需要 config/layer/定位引擎，
  // 故 controller 只带 props。
  private readonly ctrl = new MachineController<DynamicInputSchema>(this, dynamicInputMachine, () => this.machineProps())

  private machineProps(): Partial<DynamicInputSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      createItem: this.createItem,
      movable: this.movable ?? false,
      disabled: this.disabled ?? false,
      translations: this.translations,
      onValueChange: this.notifyValue,
    }
  }

  // 行内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectDynamicInput(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('add-trigger', api.getAddTriggerProps() as Record<string, unknown>)

    // 行是多实例 part，逐个打：身份取作者写在节点上的 index，缺省按文档序
    this.getParts('item').forEach((el, position) => {
      const item: DynamicInputItemProps = { index: declaredIndex(el, position) }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const content of this.partsIn(el, 'item-content'))
        this.spreader.spread(content, api.getItemContentProps(item) as Record<string, unknown>)
      for (const action of this.partsIn(el, 'item-action'))
        this.spreader.spread(action, api.getItemActionProps(item) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'item-delete-trigger'))
        this.spreader.spread(trigger, api.getItemDeleteTriggerProps(item) as Record<string, unknown>)
      // 不换序时把这对把手收起。只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条
      // display 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
      for (const trigger of this.partsIn(el, 'move-up-trigger')) {
        this.spreader.spread(trigger, api.getMoveUpTriggerProps(item) as Record<string, unknown>)
        this.setPartHidden(trigger, !api.movable)
      }
      for (const trigger of this.partsIn(el, 'move-down-trigger')) {
        this.spreader.spread(trigger, api.getMoveDownTriggerProps(item) as Record<string, unknown>)
        this.setPartHidden(trigger, !api.movable)
      }
    })
  }
}
