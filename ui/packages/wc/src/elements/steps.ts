import type { Direction, Orientation } from '@xihan-ui/core'
import type { StepsItemProps, StepsSchema, StepsStepChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectSteps, stepsAnatomy, stepsMachine, stepsMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 数值属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// 空串也当缺席：`step=""` 经 Number() 会变成 0，那是一个真实存在的步序，不该由笔误产生。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：属性缺席 = undefined（用默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器判的是 v !== null，写 ="false" 反而成了真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

const ITEM_SELECTOR = '[data-xh-part="item"]'

/** 角色节点自报的步序；缺失或空串一律给 NaN（与任何一步都不相等，绝不冒充当前步）。 */
function stepIndexOf(el: HTMLElement): number {
  const raw = el.getAttribute('value')
  return raw == null || raw === '' ? Number.NaN : Number(raw)
}

/**
 * `<xh-steps>` —— Light-DOM 行为宿主：作者写
 * root/list/item/trigger/indicator/title/description/separator/content 角色节点，
 * 元素跑 steps 机器并把 connect 产出打上去。
 *
 * 身份写在 item 节点的 `value` 属性上（第几步，0 起），
 * trigger / indicator / title / description / separator 向上找自己的 item，不必各写一遍。
 * content 挂在 list 之外、够不到 item，因此自带 `value` 与 trigger 配对（与 `<xh-tabs>` 同一套写法）。
 *
 * 步序序列由作者渲染，元素不替作者生成节点：生成节点就等于收走模板控制权，
 * 图标、自定义序号、i18n 文案都再塞不进来。
 *
 * @customElement xh-steps
 * @attr {number} step - 受控步序（0 起）；缺省该属性即非受控
 * @attr {number} default-step - 非受控初始步序，默认 0
 * @attr {number} count - 总步数；步序上界取它（等于它即"全部完成"）
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 horizontal
 * @attr {boolean} linear - 线性模式：跳不到还没走到的步（那些 trigger 一律禁用）
 * @attr {boolean} disabled - 整组不可交互，连 Tab 停靠点都不留
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响水平轴上 ArrowLeft/ArrowRight 的前后语义，默认 ltr
 * @fires step-change - 步序变化；detail 为 `{ step: number }`
 * @csspart root - 组件根容器（承载 data-orientation / data-complete / data-empty）
 * @csspart list - role=tablist 容器（方向键与 Tab 序列在此收口）
 * @csspart item - 单个步骤容器；作者在此写 value（身份）与可选 disabled
 * @csspart trigger - role=tab 的步骤按钮（roving tabindex 落在它身上）
 * @csspart indicator - 序号/对勾圆点，对读屏隐藏
 * @csspart title - 步骤标题
 * @csspart description - 步骤说明
 * @csspart separator - 指向下一步的连接线，对读屏隐藏
 * @csspart content - role=tabpanel 的面板，须自带 value 与 trigger 配对；非当前步带 hidden
 */
export class XhStepsElement extends XhElement {
  static override partContract = { anatomy: stepsAnatomy, meta: stepsMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    step: { converter: NUMBER_CONVERTER },
    defaultStep: { converter: NUMBER_CONVERTER, attribute: 'default-step' },
    count: { converter: NUMBER_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    linear: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
  }

  declare step?: number
  declare defaultStep?: number
  declare count?: number
  declare orientation?: Orientation
  declare linear?: boolean
  declare disabled?: boolean
  declare direction?: Direction

  private readonly notify = (details: StepsStepChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('step-change', { detail: details, bubbles: true, composed: true }))
  }

  // steps 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<StepsSchema>(this, stepsMachine, () => this.machineProps())

  private machineProps(): Partial<StepsSchema['props']> {
    return {
      step: this.step,
      defaultStep: this.defaultStep,
      count: this.count,
      orientation: this.orientation,
      // 布尔属性缺席即 undefined，把缺省交回 connect
      linear: this.linear,
      disabled: this.disabled,
      dir: this.direction,
      onStepChange: this.notify,
    }
  }

  /**
   * 取角色节点所属步骤的身份：value 与 disabled 都写在 item 节点上，
   * trigger/indicator/title/description/separator 向上找自己的 item（item 自身 closest 命中的就是它自己）。
   * 没有 item 包裹层时退回读节点自身，扁平结构也能用。
   * 越出本宿主的 item 不算数——嵌套步骤条的内层节点不会认外层条目。
   */
  private itemProps(el: HTMLElement): StepsItemProps {
    const owner = el.closest<HTMLElement>(ITEM_SELECTOR)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { index: stepIndexOf(source), disabled: isItemDisabled(source) }
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的下标上：
   * 容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
   * 整组零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedStep = context.get('focusedStep')
    if (focusedStep == null)
      return
    // data-value 由连接层写在 trigger 与 item 上，面板离场不会误判；
    // 只有持有焦点的那一步走了才报
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === String(focusedStep)))
      send({ type: 'LIST.BLUR' })
  }

  protected wire(): void {
    const api = connectSteps(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    // 集合类 part 逐个 spread：身份由节点自报，不依赖下标，条目增删无需记账。
    // wire 跑在事件之前（element-base 的 updated），因此按键那一刻 data-scope/data-part/data-value
    // 已经在 DOM 上，导航原语查得到本台步骤条的 trigger 集合。
    const putAll = (name: string, get: (item: StepsItemProps) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(this.itemProps(el)) as Record<string, unknown>)
    }
    putAll('item', item => api.getItemProps(item))
    putAll('trigger', item => api.getTriggerProps(item))
    putAll('indicator', item => api.getIndicatorProps(item))
    putAll('title', item => api.getTitleProps(item))
    putAll('description', item => api.getDescriptionProps(item))
    putAll('separator', item => api.getSeparatorProps(item))

    // 面板身份取自己写的 value，不向上找 item：它本来就挂在 list 之外。
    // 收起靠连接层给的 hidden，再用内联 display 兜一道——作者层任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，而宿主不能指望作者装的正是随包那份样式。
    for (const el of this.getParts('content')) {
      const index = stepIndexOf(el)
      this.spreader.spread(el, api.getContentProps({ index }) as Record<string, unknown>)
      this.setPartHidden(el, index !== api.step)
    }
  }
}
