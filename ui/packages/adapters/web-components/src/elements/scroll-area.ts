import type { ScrollAreaOrientation, ScrollAreaProps, ScrollAreaScrollbarProps, ScrollbarSchema, ScrollbarType } from '@xihan-ui/headless'
import type { Direction, IdGenerator, Orientation, Size } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectScrollArea, scrollAreaAnatomy, scrollAreaMeta, scrollAreaScrollbarProps, scrollbarAnatomy, scrollbarMachine } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 scrollbar 的机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-scroll-area>` —— Light-DOM 行为宿主：作者写 root/viewport/content 与两条 scrollbar
 * 角色节点，元素按轴各跑一台 scrollbar 机器并把 connect 产出打上去。
 *
 * 滚动区没有自己的机器，它是视口加两条 scrollbar 的组装：scrollbar 角色节点是那条
 * scrollbar 的挂载点、同时充当它的根，里面照 scrollbar 那套写 track / thumb / corner
 * （它们戴 data-scope="scrollbar"），两个组件共用同一份滚动条。
 *
 * 滚动本身一概不接管：viewport 是真正 overflow:auto 的那层，键盘（PageUp/PageDown、方向键、
 * Home/End）与滚轮全部走浏览器原生通路，元素只是把原生滚动条藏起来另画一套。
 * 自绘的滚动条对读屏隐藏——同一件事没必要报两遍。
 *
 * 每条滚动条用 orientation 属性写明自己管哪条轴（不写即 vertical），
 * 轨道与滑块按所在滚动条的轴向取几何，不必另写。这是挂载时的静态声明：运行期要换轴，换节点。
 *
 * @customElement xh-scroll-area
 * @attr {'auto'|'always'|'scroll'|'hover'|'scroll-hover'} type - 滚动条露面的时机，默认 scroll-hover
 * @attr {number} hide-delay - 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600
 * @attr {'horizontal'|'vertical'|'both'} orientation - 哪几条轴归本组件管，默认 both
 * @attr {'sm'|'md'|'lg'} size - 尺寸档，换的是滚动条厚度
 * @attr {'ltr'|'rtl'} dir - 排版方向，只改写横轴的滚动量正负与指针位移方向
 * @attr {boolean} force-visible - 触屏（粗指针）上也画自绘滚动条；缺省交给原生滚动
 * @csspart root - 组件根容器（承载 data-orientation / data-reveal-mode / data-dragging），定位上下文
 * @csspart viewport - 真正 overflow:auto 的那层，带 tabindex=0 让键盘用户落得进来；承载 data-lane-vertical / data-lane-horizontal
 * @csspart content - 内容包裹层，横向溢出靠它撑出宽度
 * @csspart scrollbar - 某条轴的滚动条挂载点，须用 orientation 属性写明轴向；同时是那条 scrollbar 的根，承载 data-state / data-gutter / data-native
 * @csspart track - 轨道（data-scope="scrollbar"），点空白处把滑块中心挪过去
 * @csspart thumb - 滑块（data-scope="scrollbar"），位置与长度由内联逻辑属性给出；按住可拖
 * @csspart corner - 交叉口补丁（data-scope="scrollbar"），写在竖条的挂载点里；只有两条都在场时显形
 */
export class XhScrollAreaElement extends XhElement {
  // 轨道、滑块与交叉口摊在本元素的 Light DOM 里由本元素接线，它们的角色节点归 scrollbar 那套 scope 管
  static override partContract = {
    anatomy: scrollAreaAnatomy,
    meta: scrollAreaMeta,
    delegates: [scrollbarAnatomy],
  }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    type: { converter: STRING_CONVERTER },
    hideDelay: { converter: NUMBER_CONVERTER, attribute: 'hide-delay' },
    orientation: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    forceVisible: { converter: BOOLEAN_CONVERTER, attribute: 'force-visible' },
  }

  declare type?: ScrollbarType
  declare hideDelay?: number
  declare orientation?: ScrollAreaOrientation
  declare size?: Size
  declare direction?: Direction
  declare forceVisible?: boolean

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // 两台机器共用一份 scope
  private readonly areaScope = createScope(null, this.idGen)

  private readonly verticalCtrl = new MachineController<ScrollbarSchema>(
    this,
    scrollbarMachine,
    () => scrollAreaScrollbarProps(this.areaProps(), 'vertical'),
    { scope: this.areaScope, onBuilt: svc => this.injectRefs(svc, 'vertical') },
  )

  private readonly horizontalCtrl = new MachineController<ScrollbarSchema>(
    this,
    scrollbarMachine,
    () => scrollAreaScrollbarProps(this.areaProps(), 'horizontal'),
    { scope: this.areaScope, onBuilt: svc => this.injectRefs(svc, 'horizontal') },
  )

  private areaProps(): ScrollAreaProps {
    return this.configured('scroll-area', {
      type: this.type,
      hideDelay: this.hideDelay,
      orientation: this.orientation,
      size: this.size,
      dir: this.direction,
      forceVisible: this.forceVisible ?? false,
    })
  }

  /**
   * 这条滚动条管哪条轴。作者在节点上写 orientation="horizontal"，与 Vue 侧的同名 prop
   * 是同一份声明；没写或写不出来即竖向（两个适配器同一个缺省）。
   */
  private barOrientation(el: HTMLElement): Orientation {
    return el.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical'
  }

  /** 某条轴的挂载点：按轴现查而不是缓存，作者随时可能增删一条轴的滚动条。 */
  private barEl(axis: Orientation): HTMLElement | null {
    return this.getParts('scrollbar').find(el => this.barOrientation(el) === axis) ?? null
  }

  // 轨道住在挂载点里：getParts 收的是整个元素范围，按子树过滤才归得对轴。
  private partsIn(owner: HTMLElement | null, name: string): HTMLElement[] {
    return owner ? this.getParts(name).filter(el => owner.contains(el)) : []
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 三个 getter 都懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着
  private injectRefs(svc: Service<ScrollbarSchema>, axis: Orientation): void {
    svc.refs.set('getScrollableEl', () => this.getPart('viewport'))
    svc.refs.set('getTrackEl', () => this.partsIn(this.barEl(axis), 'track')[0] ?? null)
    svc.refs.set('getRootEl', () => this.barEl(axis))
  }

  protected wire(): void {
    const api = connectScrollArea(
      { vertical: this.verticalCtrl.service, horizontal: this.horizontalCtrl.service },
      this.areaProps(),
      wcNormalize,
    )

    const put = (el: HTMLElement | null, props: Record<string, unknown>): void => {
      if (el)
        this.spreader.spread(el, props)
    }
    put(this.getPart('root'), api.getRootProps() as Record<string, unknown>)
    put(this.getPart('viewport'), api.getViewportProps() as Record<string, unknown>)
    put(this.getPart('content'), api.getContentProps() as Record<string, unknown>)

    // 滚动条是多实例 part，逐个打：轴向取作者写的 orientation，几何按轴取
    for (const el of this.getParts('scrollbar')) {
      const bar: ScrollAreaScrollbarProps = { orientation: this.barOrientation(el) }
      this.spreader.spread(el, api.getScrollbarProps(bar) as Record<string, unknown>)
      for (const track of this.partsIn(el, 'track'))
        this.spreader.spread(track, api.getTrackProps(bar) as Record<string, unknown>)
      // 滑块的 style 是对象（两条轴的键每帧写全），spreader 见对象 style 会逐条写内联样式
      for (const thumb of this.partsIn(el, 'thumb'))
        this.spreader.spread(thumb, api.getThumbProps(bar) as Record<string, unknown>)
    }
    put(this.getPart('corner'), api.getCornerProps() as Record<string, unknown>)
  }
}
