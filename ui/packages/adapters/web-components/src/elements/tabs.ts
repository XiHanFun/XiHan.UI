/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabs 相关实现。

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

/** 换位事件的 detail：从状态机 props 上的回调取，不在适配器中另抄一份类型。 */
type TabsMoveDetails = Parameters<NonNullable<TabsSchema['props']['onTabMove']>>[0]
type TabsCloseDetails = Parameters<NonNullable<TabsSchema['props']['onTabClose']>>[0]

/** 标签一系的归属容器：标签内的把手向上找最近的那个 trigger。 */
const TRIGGER_SELECTOR = '[data-xh-part="trigger"]'

/**
 * `<xh-tabs>`：Light-DOM 行为宿主，运行 tabs 状态机并把 connect 产出接到 root / list / trigger / content
 * 角色节点上。条目身份取作者写在 trigger / content 上的 value 属性，trigger 的禁用由部件声明。
 *
 * 读屏文案 `translations` 是对象，属性无法表达，只能通过 property 设置（`el.translations = {...}`）。
 *
 * 开启 reorderable 后标签可以拖动换位：整个标签都是拖动源。拖动中被拖的标签原地不动，
 * 只写 data-dragging；落点绘制在参照标签上，data-drop 为 before / after 即插在该标签前后。触屏路径经 tab-drag-trigger 把手。
 * 键盘使用 Alt + 主轴方向键（横向是左右、纵向是上下，横向 rtl 下左右对调），按一次即一次完整提交。
 * 顺序不由元素保管：换位只发出 tab-move，标签序由使用方写回自己的数据源。
 *
 * @customElement xh-tabs
 * @attr {string} value - 受控选中值；未提供该属性即非受控
 * @attr {string} default-value - 非受控的初始选中值
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 horizontal
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响水平轴上 ArrowLeft / ArrowRight 的前后语义，默认 ltr
 * @attr {'automatic'|'manual'} activation-mode - 方向键移动焦点是否同时切换选中，默认 automatic
 * @attr {boolean} loop - 方向键到达末尾回绕，默认开启
 * @attr {'line'|'card'|'segment'} variant - 视觉变体，默认 line
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} reorderable - 标签可以拖动换位，默认关闭
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @fires tab-move - 标签换位；detail 为 `{ value, from, to, values }`，values 是重排后的整份标签序
 * @fires tab-close - 标签被关闭；detail 为 `{ value, values }`，values 是关闭该标签之后剩余的标签序
 * @csspart root - 组件根容器（承载 data-orientation）
 * @csspart list - role=tablist 容器（方向键与 Tab 序列在此收口）
 * @csspart live-region - 视觉隐藏的播报区，拖动过程的读屏文案写在这里；写在 root 中、与 list 部件平级（root 自身不带角色，无法进入 role=tablist 的子节点集合）
 * @csspart indicator - 选中标签下的滑条，须位于 list 中；对读屏隐藏，位置由状态机测量后写为内联样式
 * @csspart separator - 标签之间的细分隔线，对读屏隐藏
 * @csspart prev-trigger - 标签带放不下时的往前翻页钮，须位于 list 中；对读屏隐藏、不占 Tab 位，放得下时 hidden
 * @csspart next-trigger - 标签带放不下时的往后翻页钮，与 prev-trigger 成对
 * @csspart trigger - role=tab 的标签按钮，须自带 value 属性标识身份
 * @csspart content - role=tabpanel 的面板，须自带 value 属性与 trigger 配对；未选中时 hidden
 * @csspart tab-drag-trigger - 标签拖拽把手，触屏路径的入口（自带 touch-action: none，按下即拖动）；对读屏隐藏且不占 Tab 位，键盘路径由标签带上的 Alt + 方向键承担
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
    closable: { type: Boolean },
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
  declare closable?: boolean
  declare translations?: Partial<TabsTranslations>

  private readonly notify = (details: TabsValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyTabMove = (details: TabsMoveDetails): void => {
    this.dispatchEvent(new CustomEvent('tab-move', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyTabClose = (details: TabsCloseDetails): void => {
    this.dispatchEvent(new CustomEvent('tab-close', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TabsSchema>(
    this,
    tabsMachine,
    () => this.machineProps(),
    // 指示条量测在机器的 action 里跑，DOM 侧的取值口经 refs 交进去
    { onBuilt: svc => svc.refs.set('getListEl', () => this.getPart('list')) },
  )

  /** 作者声明的条目禁用，只认首次见到的值；提供 collection 时使用它，否则现读 */
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
      closable: this.closable ?? false,
      translations: this.translations,
      onValueChange: this.notify,
      onTabMove: this.notifyTabMove,
      onTabClose: this.notifyTabClose,
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
   * 取把手所属标签的身份：向上查找本宿主内最近的 trigger，没有包裹层时退回读取节点自身。
   * 越出本宿主的 trigger 不计：嵌套 xh-tabs 的内层把手不会识别外层的标签。
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

    // 指示条的 style 是对象（主轴的落点与长度），spreader 会逐条写成内联样式
    const indicator = this.getPart('indicator')
    if (indicator) {
      const props = api.getIndicatorProps() as Record<string, unknown>
      this.spreader.spread(indicator, props)
      // 按本帧产出的 hidden 用内联 display 收起
      this.setPartHidden(indicator, props.hidden === true)
    }

    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    // 翻页钮：放得下时 hidden，按本帧产出的 hidden 用内联 display 收起（与 indicator 同一路）
    const prevProps = api.getPrevTriggerProps() as Record<string, unknown>
    for (const prev of this.getParts('prev-trigger')) {
      this.spreader.spread(prev, prevProps)
      this.setPartHidden(prev, prevProps.hidden === true)
    }
    const nextProps = api.getNextTriggerProps() as Record<string, unknown>
    for (const next of this.getParts('next-trigger')) {
      this.spreader.spread(next, nextProps)
      this.setPartHidden(next, nextProps.hidden === true)
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
