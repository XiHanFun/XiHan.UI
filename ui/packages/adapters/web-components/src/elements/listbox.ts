/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 listbox 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { CollectionVirtualizer, FormControlState, ListboxItemProps, ListboxNode, ListboxSchema, ListboxSelectionMode, ListboxValueChangeDetails } from '@xihan-ui/headless'
import { ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectListbox, listboxAnatomy, listboxMachine, listboxMeta, resolveFormControlState } from '@xihan-ui/headless'
import { createDisabledDeclarations } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
// （value 尤其：落成 null 就分不出"非受控"与"受控且当前无选中"）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕、连打检索）只有三态才关得掉——
// Lit 默认的 Boolean 转换器是 v !== null，写 loop="false" 照样是真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-listbox>`：Light-DOM 行为宿主：作者写 root / label / content 与若干 item 角色节点，
 * 元素运行 listbox 状态机并把 connect 产出接上。条目身份取自条目节点上的 value 属性，
 * 禁用由条目声明 aria-disabled（集合条目一律如此，原生 disabled 不可聚焦、也不派发 click）。
 * 分组同样用 value 属性声明身份，分组标题的 id 由它派生。
 *
 * 导航与选中在事件发生时按 data-scope + data-part 查询 DOM，依赖 connect 回写的 data-value，
 * 因此 wire 必须先于交互运行（基类 updated 已保证）。
 *
 * 选中值是集合：单选可以直接写 value="apple" 属性，多选只能通过 property 设置（`el.value = ['a','b']`），
 * 属性无法表达数组。
 *
 * 条目的禁用也可以交给数据：`el.collection = [{ value, label, disabled }]`，此时条目部件只需声明 value。
 *
 * @customElement xh-listbox
 * @attr {string} value - 受控选中值（单选简写）；未提供该属性即非受控，多选通过 property 设置
 * @attr {string} default-value - 非受控初始选中值
 * @attr {'single'|'multiple'|'extended'} selection-mode - 选择模式，默认 single
 * @attr {boolean} disabled - 整列禁用：条目全部为 aria-disabled，键盘与点击都不能修改选中值
 * @attr {boolean} read-only - 只读：条目照常浏览与聚焦，但选中值不可修改
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} loading - 条目加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} loop - 方向键到达末尾回绕，默认 true；写 loop="false" 关闭
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义，默认 ltr
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 vertical
 * @attr {boolean} typeahead - 连打检索，默认开启；写 typeahead="false" 关闭
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 组件根容器（承载 data-orientation / data-disabled）
 * @csspart label - 列表标题（aria-labelledby 目标）
 * @csspart content - role=listbox 容器，键盘在此收口，也是 roving tabindex 的兜底位
 * @csspart item - role=option 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索的取字来源）
 * @csspart item-prefix - 条目行首的作者内容（图标、色块、头像），对读屏隐藏
 * @csspart item-description - 条目的第 2 行副文本
 * @csspart item-suffix - 条目行尾的作者内容（计数、徽标）
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 * @csspart empty - 空态占位，须放在 root 中作为 content 的兄弟；提供 collection 时由元素按条数收放，条目手写时由作者负责
 * @csspart loading - 在途占位，与空态占位同一位置，加载期间显示
 * @csspart load-more-trigger - 取下一页的按钮，点击后的行为由作者决定；取数在途与整列禁用两档自动停用
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标）
 */
export class XhListboxElement extends XhElement {
  static override partContract = { anatomy: listboxAnatomy, meta: listboxMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的禁用即以数据为准
    collection: { attribute: false },
    virtualizer: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    loading: { converter: BOOLEAN_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    orientation: { converter: STRING_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
  }

  declare collection?: ListboxNode[]
  declare virtualizer?: CollectionVirtualizer
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare selectionMode?: ListboxSelectionMode
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare loading?: boolean
  declare tone?: Tone
  declare size?: Size
  declare loop?: boolean
  declare direction?: Direction
  declare orientation?: Orientation
  declare typeahead?: boolean

  /** 条目的禁用声明：connect 每帧把 aria-disabled 写回条目，回读时跳过这些写回值，只认作者写的。 */
  private readonly declaredDisabled = createDisabledDeclarations()
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field/Form 只交状态；Listbox 仅消费公开的禁用、只读、错误三轴。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private controlState(): FormControlState {
    return resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
  }

  private readonly notify = (details: ListboxValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // listbox 机器无副作用（连打缓冲住在 refs 里、由机器自己建），
  // 不需要 config/layer/定位引擎，故 controller 只带 props。
  private readonly ctrl = new MachineController<ListboxSchema>(this, listboxMachine, () => this.machineProps())

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.virtualizer?.getRenderedItemRoots() ?? []
  }

  /**
   * 定高小列表的自绘条：条子是 content 的兄弟、挂在 root 这个定位盒上，贴在 content 自己的盒子上
   * （root 里还有标题与占位，贴壳边会盖到它们）；两条轴都摆——皮肤给的是两轴 overflow: auto。
   * 页内宿主走 6px 缺省档；横条的正负按排版方向算，把机器里那份 dir 交过去
   */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('root'),
    scrollable: () => this.getPart('content'),
    axes: ['vertical', 'horizontal'],
    anchor: 'layer',
    props: () => ({ dir: this.direction }),
  })

  private machineProps(): Partial<ListboxSchema['props']> {
    const control = this.controlState()
    return {
      // 作者写没写 label 角色节点决定可聚焦部件的 aria-labelledby 指不指过去
      labelled: this.getPart('label') != null,
      collection: this.collection,
      virtualizer: this.virtualizer,
      value: this.value,
      defaultValue: this.defaultValue,
      selectionMode: this.selectionMode,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      loading: this.loading,
      tone: this.tone,
      size: this.size,
      loop: this.loop,
      dir: this.direction,
      orientation: this.orientation,
      typeahead: this.typeahead,
      onValueChange: this.notify,
    }
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在列表内"退出 Tab 序列，又没有条目认领得了这个锚点，
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
    if (this.virtualizer && this.collection?.some(node => node.value === focusedValue))
      return
    // data-value 只写在 item 上，条目内的文本与标记离场不会误判；
    // 只有走的正是持有锚点的那个条目才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'LIST.BLUR' })
  }

  private itemProps(el: HTMLElement): ListboxItemProps {
    const value = el.getAttribute('value') ?? ''
    // 给了 collection 时，作者没写的禁用为 undefined，交给数据定夺
    const declared = this.declaredDisabled.read(el)
    return { value, disabled: this.collection ? declared : declared ?? false }
  }

  // 条目/分组内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectListbox(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    put('loading', api.getLoadingProps() as Record<string, unknown>)
    put('load-more-trigger', api.getLoadMoreTriggerProps() as Record<string, unknown>)

    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取作者在条目上的声明
    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      this.declaredDisabled.commit(el)
      // 条目内的文本与选中标记跟着同一份声明走，样式层各处状态一致
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const description of this.partsIn(el, 'item-description'))
        this.spreader.spread(description, api.getItemDescriptionProps(item) as Record<string, unknown>)
      for (const prefix of this.partsIn(el, 'item-prefix'))
        this.spreader.spread(prefix, api.getItemPrefixProps(item) as Record<string, unknown>)
      for (const suffix of this.partsIn(el, 'item-suffix'))
        this.spreader.spread(suffix, api.getItemSuffixProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    this.bars.wire()
  }
}
