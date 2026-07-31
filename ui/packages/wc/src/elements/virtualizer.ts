import type { IdGenerator } from '@xihan-ui/core'
import type {
  VirtualizerAlign,
  VirtualizerChangeDetails,
  VirtualizerItemState,
  VirtualizerSchema,
} from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectVirtualizer, virtualizerMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态：缺席 = undefined（用默认值），="false" = false，其余（含空串）= true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的开关用它会永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 条目自报的下标；缺失或空串一律给 NaN（见 wire 里的说明）。 */
function itemIndex(el: HTMLElement): number {
  const raw = el.getAttribute('value')
  return raw == null || raw === '' ? Number.NaN : Number(raw)
}

/** 这个条目要不要把真实尺寸回喂给内核。三态语义与 horizontal 属性一致。 */
function wantsMeasure(el: HTMLElement): boolean {
  const raw = el.getAttribute('measure')
  return raw !== null && raw !== 'false'
}

/**
 * `<xh-virtualizer>` —— Light-DOM 行为宿主：作者写 root/viewport/content/item 角色节点，
 * 元素跑 virtualizer 机器并把 connect 产出打上去。
 *
 * 区间与尺寸的计算走 headless 的虚拟滚动内核：它在机器的效应里建起来，挂着视口的
 * ResizeObserver 与 scroll 监听，算出"此刻该渲哪些下标、各自落在哪儿"。
 * 滚动本身一概不接管：viewport 是原生的 overflow 容器，滚轮、方向键、PageUp/PageDown、
 * Home/End 全部走浏览器原生通路。
 *
 * 条目节点不替作者生成：生成节点就等于收走模板控制权，外层结构、图标、业务内容都再塞不进来。
 * 作者监听 `change` 事件，按 `virtualItems` 渲出该渲的那几条，每条用 `value` 属性写明自己是第几条；
 * 元素据此把位移写进它的内联样式，并把不在窗口里的条目收起来。
 *
 * @customElement xh-virtualizer
 * @attr {number} count - 总条数，默认 0
 * @attr {number} estimate-size - 每条的估算主轴尺寸（px）；不等高的列表改用 estimateSize property 传函数
 * @attr {number} overscan - 可视区前后各多渲几条，默认 5
 * @attr {boolean} horizontal - 横向列表（主轴是行内轴），默认 false
 * @attr {number} gap - 相邻两条之间的主轴间距（px），默认 0
 * @attr {number} scroll-margin - 列表起点距滚动容器起点的距离（px），默认 0
 * @attr {number} padding-start - 列表前内边距（px），默认 0
 * @attr {number} padding-end - 列表后内边距（px），默认 0
 * @attr {number} lanes - 多列网格的列数，默认 1
 * @fires change - 该渲什么变了；detail 为 `{ virtualItems, totalSize, startIndex, endIndex }`
 * @csspart root - 组件根容器，承载 data-orientation 与 data-scrolling
 * @csspart viewport - 真正 overflow:auto 的那层，带 tabindex=0 让键盘用户落得进来
 * @csspart content - 撑出总长的那层（内联样式给主轴长度），条目的定位上下文
 * @csspart item - 条目，须自带 value 属性写明下标；位移由内联逻辑属性给出，不在窗口里时带 hidden
 */
export class XhVirtualizerElement extends XhElement {
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    count: { converter: NUMBER_CONVERTER },
    estimateSize: { converter: NUMBER_CONVERTER, attribute: 'estimate-size' },
    overscan: { converter: NUMBER_CONVERTER },
    horizontal: { converter: BOOLEAN_CONVERTER },
    gap: { converter: NUMBER_CONVERTER },
    scrollMargin: { converter: NUMBER_CONVERTER, attribute: 'scroll-margin' },
    paddingStart: { converter: NUMBER_CONVERTER, attribute: 'padding-start' },
    paddingEnd: { converter: NUMBER_CONVERTER, attribute: 'padding-end' },
    lanes: { converter: NUMBER_CONVERTER },
    // 函数走不了属性；只作为 property 暴露，与 Vue 侧的同名 prop 对齐
    getItemKey: { attribute: false },
  }

  declare count?: number
  declare estimateSize?: number | ((index: number) => number)
  declare overscan?: number
  declare horizontal?: boolean
  declare gap?: number
  declare scrollMargin?: number
  declare paddingStart?: number
  declare paddingEnd?: number
  declare lanes?: number
  declare getItemKey?: (index: number) => string | number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly virtualizerScope = createScope(null, this.idGen)

  private readonly notify = (details: VirtualizerChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<VirtualizerSchema>(
    this,
    virtualizerMachine,
    () => this.machineProps(),
    { scope: this.virtualizerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<VirtualizerSchema['props']> {
    return {
      count: this.count,
      estimateSize: this.estimateSize,
      overscan: this.overscan,
      horizontal: this.horizontal,
      gap: this.gap,
      scrollMargin: this.scrollMargin,
      paddingStart: this.paddingStart,
      paddingEnd: this.paddingEnd,
      lanes: this.lanes,
      getItemKey: this.getItemKey,
      onChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 两个 getter 都懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着
  private injectRefs(svc: Service<VirtualizerSchema>): void {
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 机器要等 hostConnected 才建（此刻属性已反射到 property）。
   * 下面几个方法是公开面，作者拿到元素就可能调——还没进 DOM 时如实给空，别炸。
   */
  private api(): ReturnType<typeof connectVirtualizer> | null {
    const service = this.ctrl.service as Service<VirtualizerSchema> | undefined
    return service ? connectVirtualizer(service, wcNormalize) : null
  }

  /** 此刻该渲染哪些下标，以及它们的位移与尺寸。作者据此渲条目节点。 */
  get virtualItems(): readonly VirtualizerItemState[] {
    return this.api()?.virtualItems ?? []
  }

  /** 整份列表的主轴总长（px）。 */
  get totalSize(): number {
    return this.api()?.totalSize ?? 0
  }

  /** 滚到第几条。越界下标由内核夹住。 */
  scrollToIndex(index: number, options?: { align?: VirtualizerAlign }): void {
    this.api()?.scrollToIndex(index, options)
  }

  /** 把条目节点的真实尺寸回喂给内核（动态高度用）。 */
  measureElement(element: HTMLElement | null): void {
    this.api()?.measureElement(element)
  }

  /** 重新量视口、丢掉实测尺寸整份重排。方法名避开 Lit 的生命周期钩子。 */
  measure(): void {
    this.api()?.measure()
  }

  protected wire(): void {
    const api = this.api()
    if (!api)
      return

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打：身份取作者写的 value。
    // 漏写时给 NaN 而不是 Number(null) 的 0：NaN 与任何下标都不相等，条目会被当成
    // "不在窗口里"收起来，但绝不会冒充第 0 条；Vue 侧漏写 value 拿到的同样是 NaN，两侧一致
    for (const el of this.getParts('item')) {
      const index = itemIndex(el)
      this.spreader.spread(el, api.getItemProps({ index }) as Record<string, unknown>)
      // Light DOM 常驻，WC 自管可见性：作者层若给这个 part 声明了 display，
      // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来。
      // 本包的样式自带 [hidden]{display:none} 压得住，但宿主不能指望作者装了这份样式
      this.setPartHidden(el, !api.virtualItems.some(item => item.index === index))
      // 量尺寸放在这里而不是连接期：wire 跑在 updated 之后，此刻节点的布局才是这一帧的。
      // 收起来的条目要不要量由 connect 判（两侧同一份规则）；
      // 尺寸没变时内核不会再通知，这条回路会自己停下来，不会来回震荡
      if (wantsMeasure(el))
        api.measureElement(el)
    }
  }
}
