/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sortable 相关实现。

import type { Direction, IdGenerator, Service } from '@xihan-ui/core'
import type { SortableDragEndDetails, SortableDragStartDetails, SortableSchema, SortableSortDetails, SortableTransferDetails } from '@xihan-ui/headless'
import type { SortableAxis } from '@xihan-ui/pointer'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectSortable, sortableAnatomy, sortableMachine, sortableMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关（autoScroll）会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
/** 顺序写成逗号分隔的标识串（ids="a,b,c"）。空串当没写。 */
const ID_LIST_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v == null || v.trim() === '')
      return undefined
    const out = v.split(',').map(s => s.trim()).filter(Boolean)
    return out.length ? out : undefined
  },
}

/**
 * `<xh-sortable>`：Light-DOM 行为宿主：作者写 root / item / item-drag-trigger / live-region 角色节点，
 * 元素运行 sortable 状态机并把 connect 产出接上。
 *
 * 顺序的唯一真源是 `ids`，DOM 中项的先后必须与它一致：几何按 DOM 测量，事件按 `ids` 计算。
 * 每个 item 与它的 item-drag-trigger 都要用 `item-id` 属性写明所属的项（与 Vue 侧的 `:item-id` 同一份声明）。
 * 单独禁用某一项写 `item-disabled`。未提供 item-drag-trigger 时整项可拖动。
 *
 * 拖动落点采用乐观投影：拖动过程中其余项实时让位，松手即确定。让位与跟手的位移由元素每帧
 * 写入内联 translate，作者的样式表不应再修改该属性。
 *
 * 键盘全部在手柄上：空格或回车拾起、方向键移动一格、再按空格放下、Esc 取消。
 * 拖动中的 Tab 会被拦截：焦点一旦移走，本场拖动就没有出口。
 *
 * 写了同一个 group 的几个 `<xh-sortable>` 组成一组，项可以拖进组里别的列表；键盘拖动中另一条轴上的方向键
 * 在相邻列表间移动。落进别的列表时源列表发 transfer：作者在回调里把项节点挪进目标列表的 root、
 * 按 detail 写回两边的 ids；不挪不写时那一项收回原位。
 *
 * @customElement xh-sortable
 * @attr {string} ids - 顺序真源，逗号分隔的项标识（如 "a,b,c"）
 * @attr {'horizontal'|'vertical'|'both'} orientation - 排序轴，默认 vertical；换行网格使用 both
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调水平排布下左右两键的语义，默认 ltr
 * @attr {boolean} disabled - 禁用：手柄退出 Tab 序列，按下也不进入拖动
 * @attr {number} activation-distance - 按下之后移动多远才视为开始拖动，默认 5；提供 0 表示按下即拖动
 * @attr {boolean} auto-scroll - 拖到容器边缘时自动滚动，默认开启
 * @attr {string} group - 所在的组：同一文档里 group 相同的列表可以互相拖入拖出；入组的列表只能单轴排布
 * @attr {string} list-id - 这个列表在组里的标识，写了 group 就必须写，组内不重复
 * @fires sort - 顺序变化；detail 为 `{ from, to, id, ids }`，其中 ids 已重排
 * @fires transfer - 一项落进了同组另一个列表，由源列表发一次；detail 为 `{ id, fromList, toList, from, to, fromIds, toIds }`，节点挪不挪、ids 写不写回归作者
 * @fires drag-start - 拾起；detail 为 `{ id, from, mode }`
 * @fires drag-end - 收尾（含取消）；detail 为 `{ id, from, to, mode, canceled }`，入了组时另带 fromList / toList
 * @csspart root - 承载 data-orientation / data-disabled / data-dragging 的容器；同组别的列表的一项悬在这里时带 data-drop="inside"
 * @csspart item - 一项；位移由内联 translate 给出，被拖动的项带 data-dragging
 * @csspart item-drag-trigger - role=button 的拖拽手柄，指针与键盘交互全部在它身上
 * @csspart drop-indicator - 落点线；拖动中绘制在松手后该项将插入的缝隙上，位置由内联样式给出，节点排在末项之后
 * @csspart live-region - 视觉隐藏的播报区，拖动过程的读屏文案写在这里
 */
export class XhSortableElement extends XhElement {
  static override partContract = { anatomy: sortableAnatomy, meta: sortableMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    ids: { converter: ID_LIST_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    disabled: { converter: BOOLEAN_CONVERTER },
    activationDistance: { converter: NUMBER_CONVERTER, attribute: 'activation-distance' },
    autoScroll: { converter: BOOLEAN_CONVERTER, attribute: 'auto-scroll' },
    group: { converter: STRING_CONVERTER },
    listId: { converter: STRING_CONVERTER, attribute: 'list-id' },
    // 对象进不了属性，只作为 property 暴露
    translations: { attribute: false },
    // 跨嵌套 Light DOM 组合时，由作者把显式 data-xh-part-owner="sortable" 的角色根交进来。
    partRoots: { attribute: false },
  }

  declare ids?: string[]
  declare orientation?: SortableAxis
  declare direction?: Direction
  declare disabled?: boolean
  declare activationDistance?: number
  declare autoScroll?: boolean
  declare group?: string
  declare listId?: string
  /** 区域名、项名、拖拽把手名，以及拾起 / 移动 / 放下 / 取消四句键盘拖拽播报。 */
  declare translations?: SortableSchema['props']['translations']
  declare partRoots?: HTMLElement[]

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.partRoots ?? []
  }

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly sortableScope = createScope(null, this.idGen)

  private readonly notifySort = (details: SortableSortDetails): void => {
    this.dispatchEvent(new CustomEvent('sort', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyTransfer = (details: SortableTransferDetails): void => {
    this.dispatchEvent(new CustomEvent('transfer', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyDragStart = (details: SortableDragStartDetails): void => {
    this.dispatchEvent(new CustomEvent('drag-start', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyDragEnd = (details: SortableDragEndDetails): void => {
    this.dispatchEvent(new CustomEvent('drag-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SortableSchema>(
    this,
    sortableMachine,
    () => this.machineProps(),
    { scope: this.sortableScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SortableSchema['props']> {
    return {
      ids: this.ids ?? [],
      orientation: this.orientation,
      dir: this.direction,
      disabled: this.disabled ?? false,
      activationDistance: this.activationDistance,
      autoScroll: this.autoScroll,
      translations: this.translations,
      group: this.group,
      listId: this.listId,
      onSort: this.notifySort,
      onTransfer: this.notifyTransfer,
      onDragStart: this.notifyDragStart,
      onDragEnd: this.notifyDragEnd,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 容器懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<SortableSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  /**
   * 部件声明的项标识。作者在节点上写 item-id="a"，与 Vue 侧的 `:id` 是同一份声明；
   * 未写时为空串：connect 找不到对应项，会当作不可拖动的普通节点。
   *
   * 不使用 `id`：那是 HTML 全局属性，写上后会留在 DOM 中（Vue 侧的同名 prop 不会），
   * 而且同一项的外壳与手柄同名时会产生两个相同的 DOM id。
   */
  private partId(el: HTMLElement): string {
    return el.getAttribute('item-id') ?? ''
  }

  /** 项级禁用。写 item-disabled 即禁掉这一项，与列表级的 disabled 各管各的。 */
  private partDisabled(el: HTMLElement): boolean {
    const raw = el.getAttribute('item-disabled')
    return raw != null && raw !== 'false'
  }

  protected wire(): void {
    const api = connectSortable(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps({ id: this.partId(el), disabled: this.partDisabled(el) }) as Record<string, unknown>)

    for (const el of this.getParts('item-drag-trigger'))
      this.spreader.spread(el, api.getItemDragTriggerProps({ id: this.partId(el), disabled: this.partDisabled(el) }) as Record<string, unknown>)

    const indicator = this.getPart('drop-indicator')
    if (indicator)
      this.spreader.spread(indicator, api.getDropIndicatorProps() as Record<string, unknown>)

    const live = this.getPart('live-region')
    if (live) {
      this.spreader.spread(live, api.getLiveRegionProps() as Record<string, unknown>)
      // 播报文案由元素写，不经属性铺开：它是文本内容不是属性
      live.textContent = this.ctrl.service.context.get('announcement')
    }
  }
}
