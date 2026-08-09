import type { Direction, Orientation } from '@xihan-ui/core'
import type { TabsActivationMode, TabsSchema, TabsValueChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectTabs, tabsAnatomy, tabsMachine, tabsMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-tabs>` —— Light-DOM 行为宿主，跑 tabs 机器并把 connect 产出打到 root/list/trigger/content
 * 角色节点上。条目身份取作者写在 trigger/content 上的 value 属性，trigger 的禁用由部件自报。
 *
 * @customElement xh-tabs
 * @attr {string} value - 受控选中值；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始选中值
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 horizontal
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响水平轴上 ArrowLeft/ArrowRight 的前后语义，默认 ltr
 * @attr {'automatic'|'manual'} activation-mode - 方向键移动焦点是否顺带切换选中，默认 automatic
 * @attr {boolean} loop - 方向键走到尽头回绕，默认开启
 * @attr {'line'|'card'|'segment'} variant - 形态，默认 line
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @csspart root - 组件根容器（承载 data-orientation）
 * @csspart list - role=tablist 容器（方向键与 Tab 序列在此收口）
 * @csspart trigger - role=tab 的标签按钮，须自带 value 属性标识身份
 * @csspart content - role=tabpanel 的面板，须自带 value 属性与 trigger 配对；未选中时 hidden
 */
export class XhTabsElement extends XhElement {
  static override partContract = { anatomy: tabsAnatomy, meta: tabsMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    activationMode: { converter: STRING_CONVERTER, attribute: 'activation-mode' },
    loop: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare orientation?: Orientation
  declare direction?: Direction
  declare activationMode?: TabsActivationMode
  declare loop?: boolean
  declare variant?: string
  declare tone?: string
  declare size?: string

  private readonly notify = (details: TabsValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TabsSchema>(this, tabsMachine, () => this.machineProps())

  private machineProps(): Partial<TabsSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      orientation: this.orientation,
      dir: this.direction,
      activationMode: this.activationMode,
      loop: this.loop,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notify,
    }
  }

  /** 承载焦点的条目被移出 DOM 时浏览器不派 focusout，这里替 DOM 上报焦点离场。 */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 机器已停机则跳过
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // 只在持有焦点的那个条目离场时上报
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

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled
    for (const el of this.getParts('trigger')) {
      const props = api.getTriggerProps({
        value: el.getAttribute('value') ?? '',
        disabled: isItemDisabled(el),
      })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    // 面板常挂，未选中的由 connect 输出的 hidden 收起
    for (const el of this.getParts('content')) {
      const props = api.getContentProps({ value: el.getAttribute('value') ?? '' })
      this.spreader.spread(el, props as Record<string, unknown>)
    }
  }
}
