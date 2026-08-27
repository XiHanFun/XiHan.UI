import type { SortableDragEndDetails, SortableDragStartDetails, SortableSchema, SortableSortDetails } from '@xihan-ui/headless'
import type { Direction, IdGenerator } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { SortableAxis } from '@xihan-ui/pointer'
import { connectSortable, sortableAnatomy, sortableMachine, sortableMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
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
 * `<xh-sortable>` —— Light-DOM 行为宿主：作者写 root/item/item-handle/live-region 角色节点，
 * 元素跑 sortable 机器并把 connect 产出打上去。
 *
 * 顺序的唯一真源是 `ids`，DOM 里项的先后必须与它一致——几何按 DOM 量，事件按 `ids` 算。
 * 每个 item 与它的 item-handle 都要用 `item-id` 属性写明自己是哪一项（与 Vue 侧的 `:item-id` 同一份声明）。
 * 单独禁掉某一项写 `item-disabled`。不给 item-handle 时整项可拖。
 *
 * 拖动落点走乐观投影：拖动过程中其余项实时让位，松手即定。让位与跟手的位移由元素每帧
 * 写进内联 transform，作者的样式表不要再碰这条属性。
 *
 * 键盘全在手柄上：空格或回车拾起、方向键挪一格、再按空格放下、Esc 取消。
 * 拖动中的 Tab 会被拦下——焦点一旦移走，这一场就没有出口了。
 *
 * @customElement xh-sortable
 * @attr {string} ids - 顺序真源，逗号分隔的项标识（如 "a,b,c"）
 * @attr {'horizontal'|'vertical'|'both'} orientation - 排序轴，默认 vertical；换行网格用 both
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调水平排布下左右两键的语义，默认 ltr
 * @attr {boolean} disabled - 禁用：手柄退出 Tab 序列，按下也不进拖动
 * @attr {number} activation-distance - 按下之后走多远才算开始拖，默认 5；给 0 表示按下即拖
 * @attr {boolean} auto-scroll - 拖到容器边缘时自动滚动，默认开
 * @fires sort - 顺序变化；detail 为 `{ from, to, id, ids }`，其中 ids 已重排好
 * @fires drag-start - 拾起；detail 为 `{ id, from, mode }`
 * @fires drag-end - 收尾（含取消）；detail 为 `{ id, from, to, mode, canceled }`
 * @csspart root - 承载 data-orientation / data-disabled / data-dragging 的容器
 * @csspart item - 一项；位移由内联 transform 给出，被拖的那项带 data-dragging
 * @csspart item-handle - role=button 的拖拽手柄，指针与键盘交互全在它身上
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
  }

  declare ids?: string[]
  declare orientation?: SortableAxis
  declare direction?: Direction
  declare disabled?: boolean
  declare activationDistance?: number
  declare autoScroll?: boolean

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly sortableScope = createScope(null, this.idGen)

  private readonly notifySort = (details: SortableSortDetails): void => {
    this.dispatchEvent(new CustomEvent('sort', { detail: details, bubbles: true, composed: true }))
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
      onSort: this.notifySort,
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
   * 部件自报的项标识。作者在节点上写 item-id="a"，与 Vue 侧的 `:id` 是同一份声明；
   * 没写就落空串——connect 那边找不到对应项，会当作不可拖的普通节点。
   *
   * 不用 `id`：那是 HTML 全局属性，写上去会留在 DOM 里（Vue 侧的同名 prop 不会），
   * 而且同一项的外壳与手柄同名时会造出两个相同的 DOM id。
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

    for (const el of this.getParts('item-handle'))
      this.spreader.spread(el, api.getItemHandleProps({ id: this.partId(el), disabled: this.partDisabled(el) }) as Record<string, unknown>)

    const live = this.getPart('live-region')
    if (live) {
      this.spreader.spread(live, api.getLiveRegionProps() as Record<string, unknown>)
      // 播报文案由元素写，不经属性铺开：它是文本内容不是属性
      live.textContent = this.ctrl.service.context.get('announcement')
    }
  }
}
