import type { Direction, Orientation } from '@xihan-ui/core'
import type { TabsActivationMode, TabsSchema, TabsValueChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectTabs, tabsMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样 value 就再也表达不了"非受控"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 缺省为真的开关得能被 ="false" 关掉；三态：缺席 = undefined（用默认值），="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-tabs>` —— Light-DOM 行为宿主：用户写 root/list/trigger/content 角色节点，
 * 元素跑 tabs 机器并把 connect 产出打上去。条目身份取用户写在 trigger/content 上的 value 属性，
 * trigger 的禁用由部件自报（aria-disabled）。
 *
 * @customElement xh-tabs
 * @attr {string} value - 受控选中值；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始选中值
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 horizontal
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响水平轴上 ArrowLeft/ArrowRight 的前后语义，默认 ltr
 * @attr {'automatic'|'manual'} activation-mode - 方向键移动焦点是否顺带切换选中，默认 automatic
 * @attr {boolean} loop - 方向键走到尽头回绕，默认开启
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @csspart root - 组件根容器（承载 data-orientation）
 * @csspart list - role=tablist 容器（方向键与 Tab 序列在此收口）
 * @csspart trigger - role=tab 的标签按钮，须自带 value 属性标识身份
 * @csspart content - role=tabpanel 的面板，须自带 value 属性与 trigger 配对；未选中时 hidden
 */
export class XhTabsElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    activationMode: { converter: STRING_CONVERTER, attribute: 'activation-mode' },
    loop: { converter: BOOLEAN_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare orientation?: Orientation
  declare direction?: Direction
  declare activationMode?: TabsActivationMode
  declare loop?: boolean

  private readonly notify = (details: TabsValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // tabs 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<TabsSchema>(this, tabsMachine, () => this.machineProps())

  private machineProps(): Partial<TabsSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      orientation: this.orientation,
      dir: this.direction,
      activationMode: this.activationMode,
      // 布尔属性只有在/不在两态：不在即 undefined，把缺省交回 connect（回绕默认开）
      loop: this.loop,
      onValueChange: this.notify,
    }
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
   * 整组零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 trigger 上，面板离场不会误判；只有持有焦点的那个条目走了才报
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'LIST.BLUR' })
  }

  protected wire(): void {
    const api = connectTabs(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // 打上去的 data-scope/data-part/data-value 正是键盘导航在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('trigger')) {
      const props = api.getTriggerProps({
        value: el.getAttribute('value') ?? '',
        disabled: isItemDisabled(el),
      })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    // 面板常挂，未选中的由 connect 输出 hidden。这里不做内联 display 兜底：
    // styled 的 [data-part=content] 只设 padding/color，没有 display 声明，
    // UA 的 [hidden]{display:none} 压得住（collapsible/dialog 那两处 author 层给了
    // display，才必须用内联样式盖过）。
    for (const el of this.getParts('content')) {
      const props = api.getContentProps({ value: el.getAttribute('value') ?? '' })
      this.spreader.spread(el, props as Record<string, unknown>)
    }
  }
}
