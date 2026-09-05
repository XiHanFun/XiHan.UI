import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { TabsActivationMode, TabsNode, TabsSchema, TabsTranslations, TabsValueChangeDetails, TabsVariant } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectTabs, tabsAnatomy, tabsMachine, tabsMeta } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 换位事件的 detail：从机器 props 上的回调取，不在适配器里另抄一份类型。 */
type TabsMoveDetails = Parameters<NonNullable<TabsSchema['props']['onTabMove']>>[0]

/** 标签一系的归属容器：标签内的把手向上找最近的那个 trigger。 */
const TRIGGER_SELECTOR = '[data-xh-part="trigger"]'

/**
 * `<xh-tabs>` —— Light-DOM 行为宿主，跑 tabs 机器并把 connect 产出打到 root/list/trigger/content
 * 角色节点上。条目身份取作者写在 trigger/content 上的 value 属性，trigger 的禁用由部件自报。
 *
 * 读屏文案 `translations` 是对象，属性表达不了，只能走 property（`el.translations = {...}`）。
 *
 * 打开 reorderable 后标签可以拖着换位：整个标签都是拖动源。拖动中被拖的标签原地不动，
 * 只落 data-dragging；落点画在参照标签上，data-drop 为 before/after 即插在这个标签前后。触屏那一路走 tab-drag-trigger 把手。
 * 键盘走 Alt + 主轴方向键（横排是左右、竖排是上下，横排 rtl 下左右对调），一按就是一次完整提交。
 * 顺序不由元素保管：换位只发 tab-move，标签序由使用方写回自己的数据源。
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
 * @attr {boolean} reorderable - 标签可以拖着换位，默认关
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @fires tab-move - 标签换了位；detail 为 `{ value, from, to, values }`，values 是重排好的整份标签序
 * @csspart root - 组件根容器（承载 data-orientation）
 * @csspart list - role=tablist 容器（方向键与 Tab 序列在此收口）
 * @csspart live-region - 视觉隐藏的播报区，拖动过程的读屏文案写在这里；写在 root 里、与 list 部件平级（root 自己不带角色，它落不进 role=tablist 的子节点集合）
 * @csspart trigger - role=tab 的标签按钮，须自带 value 属性标识身份
 * @csspart content - role=tabpanel 的面板，须自带 value 属性与 trigger 配对；未选中时 hidden
 * @csspart tab-drag-trigger - 标签拖拽把手，触屏那一路的入口（自带 touch-action: none，按下即拖）；对读屏隐藏且不占 Tab 位，键盘那一路由标签带上的 Alt + 方向键承担
 */
export class XhTabsElement extends XhElement {
  static override partContract = { anatomy: tabsAnatomy, meta: tabsMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    activationMode: { converter: STRING_CONVERTER, attribute: 'activation-mode' },
    loop: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 缺席即关，没有第二种来路，用 Lit 自带的 Boolean 转换器就够；
    // 三态转换器只留给缺省为真的开关（如 loop），那种开关摘属性会落回默认值、写 "false" 才关得掉
    reorderable: { type: Boolean },
    // 对象走不了属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare collection?: TabsNode[]
  declare value?: string
  declare defaultValue?: string
  declare orientation?: Orientation
  declare direction?: Direction
  declare activationMode?: TabsActivationMode
  declare loop?: boolean
  declare variant?: TabsVariant
  declare tone?: Tone
  declare size?: Size
  declare reorderable?: boolean
  declare translations?: Partial<TabsTranslations>

  private readonly notify = (details: TabsValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyTabMove = (details: TabsMoveDetails): void => {
    this.dispatchEvent(new CustomEvent('tab-move', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TabsSchema>(this, tabsMachine, () => this.machineProps())

  /** 作者声明的条目禁用，只认首见那一份；给了 collection 时用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()

  private machineProps(): Partial<TabsSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      orientation: this.orientation,
      dir: this.direction,
      activationMode: this.activationMode,
      loop: this.loop,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      reorderable: this.reorderable ?? false,
      translations: this.translations,
      onValueChange: this.notify,
      onTabMove: this.notifyTabMove,
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

  /**
   * 取把手所属标签的身份：向上找本宿主内最近的 trigger，没有包裹层时退回读节点自身。
   * 越出本宿主的 trigger 不算数——嵌套 xh-tabs 的内层把手不会认外层的标签。
   */
  /** 把手所属的那个 trigger 节点；把手自己就写在 trigger 上时即它本身。 */
  private triggerElOf(el: HTMLElement): HTMLElement {
    const owner = el.closest<HTMLElement>(TRIGGER_SELECTOR)
    return owner && owner !== this && this.contains(owner) ? owner : el
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

    // 播报区收作者写的那个节点：root 自己不带角色，作者把它放在 root 里、与 list 部件平级即可，
    // 不必由元素代建。没写就是不要读屏播报，跳过。
    const live = this.getPart('live-region')
    if (live) {
      this.spreader.spread(live, api.getLiveRegionProps() as Record<string, unknown>)
      // 播报文案由元素写，不经属性铺开：它是文本内容不是属性
      live.textContent = this.ctrl.service.context.get('announcement')
    }

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled
    for (const el of this.getParts('trigger')) {
      const props = api.getTriggerProps({
        value: el.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled(el) : isItemDisabled(el),
      })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    // 把手长在标签里，身份跟着所在的那个 trigger 走
    for (const el of this.getParts('tab-drag-trigger')) {
      // 禁用与 trigger 走同一条来路：没给 collection 时禁用写在标记上，
      // 只传 value 的话标签禁着而把手仍判可拖
      const trigger = this.triggerElOf(el)
      const props = api.getTabDragTriggerProps({
        value: trigger.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled(trigger) : isItemDisabled(trigger),
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
