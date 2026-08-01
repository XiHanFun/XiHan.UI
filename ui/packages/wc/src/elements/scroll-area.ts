import type { Direction, IdGenerator, Orientation } from '@xihan-ui/core'
import type { ScrollAreaOrientation, ScrollAreaSchema, ScrollAreaScrollbarProps, ScrollAreaType } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectScrollArea, scrollAreaAnatomy, scrollAreaMachine, scrollAreaMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-scroll-area>` —— Light-DOM 行为宿主：作者写 root/viewport/content/scrollbar/thumb/corner
 * 角色节点，元素跑 scroll-area 机器并把 connect 产出打上去。
 *
 * 滚动本身一概不接管：viewport 是真正 overflow:auto 的那层，键盘（PageUp/PageDown、方向键、
 * Home/End）与滚轮全部走浏览器原生通路，元素只是把原生滚动条藏起来另画一套。
 * 自绘的 scrollbar/thumb 对读屏隐藏——同一件事没必要报两遍。
 *
 * 滑块的位置与长度按视口/内容/滚动量算出来后写进内联样式：竖向是 inset-block-start + block-size，
 * 横向是 inset-inline-start + inline-size（逻辑属性，RTL 下自动换向）。
 * 尺寸在机器的效应里量：挂载后推迟一拍量一次，此后跟着 scroll 事件与 ResizeObserver 走。
 *
 * 每条滚动条用 orientation 属性写明自己管哪条轴（不写即 vertical），
 * 滑块按所在滚动条的轴向取几何，不必另写。
 *
 * @customElement xh-scroll-area
 * @attr {'auto'|'always'|'scroll'|'hover'} type - 滚动条露面的时机，默认 hover
 * @attr {number} scroll-hide-delay - 收起前的等待毫秒（type 为 scroll / hover 时生效），默认 600
 * @attr {'horizontal'|'vertical'|'both'} orientation - 哪几条轴归本组件管，默认 both
 * @attr {'ltr'|'rtl'} dir - 排版方向，只改写横轴的滚动量正负与指针位移方向
 * @csspart root - 组件根容器（承载 data-orientation / data-type / data-dragging），指针进出的判据挂在它身上
 * @csspart viewport - 真正 overflow:auto 的那层，带 tabindex=0 让键盘用户落得进来
 * @csspart content - 内容包裹层，横向溢出靠它撑出宽度，尺寸变化也观察它
 * @csspart scrollbar - 自绘滚动条轨道，须用 orientation 属性写明轴向；收起时带 hidden
 * @csspart thumb - 滑块，位置与长度由内联逻辑属性给出；按住可拖
 * @csspart corner - 两条滚动条同时在场时右下角那块补丁；只有一条时带 hidden
 */
export class XhScrollAreaElement extends XhElement {
  static override partContract = { anatomy: scrollAreaAnatomy, meta: scrollAreaMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    type: { converter: STRING_CONVERTER },
    scrollHideDelay: { converter: NUMBER_CONVERTER, attribute: 'scroll-hide-delay' },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
  }

  declare type?: ScrollAreaType
  declare scrollHideDelay?: number
  declare orientation?: ScrollAreaOrientation
  declare direction?: Direction

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly scrollAreaScope = createScope(null, this.idGen)

  private readonly ctrl = new MachineController<ScrollAreaSchema>(
    this,
    scrollAreaMachine,
    () => this.machineProps(),
    { scope: this.scrollAreaScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<ScrollAreaSchema['props']> {
    return {
      type: this.type,
      scrollHideDelay: this.scrollHideDelay,
      orientation: this.orientation,
      dir: this.direction,
    }
  }

  /**
   * 这条滚动条管哪条轴。作者在节点上写 orientation="horizontal"，与 Vue 侧的同名 prop
   * 是同一份声明；没写或写不出来即竖向（两个适配器同一个缺省）。
   */
  private barOrientation(el: HTMLElement): Orientation {
    return el.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical'
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 三个 getter 都懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  // 滚动条按轴现查而不是缓存：作者随时可能增删一条轴的滚动条
  private injectRefs(svc: Service<ScrollAreaSchema>): void {
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getScrollbarEl', (axis: Orientation) =>
      this.getParts('scrollbar').find(el => this.barOrientation(el) === axis) ?? null)
  }

  // 滑块住在滚动条里：getParts 收的是整个元素范围，按子树过滤才归得对轴。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectScrollArea(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('corner', api.getCornerProps() as Record<string, unknown>)

    // 滚动条是多实例 part，逐个打：轴向取作者写的 orientation，几何按轴取
    for (const el of this.getParts('scrollbar')) {
      const bar: ScrollAreaScrollbarProps = { orientation: this.barOrientation(el) }
      this.spreader.spread(el, api.getScrollbarProps(bar) as Record<string, unknown>)
      // 滑块的 style 是对象（两条轴的键每帧写全），spreader 见对象 style 会逐条写内联样式
      for (const thumb of this.partsIn(el, 'thumb'))
        this.spreader.spread(thumb, api.getThumbProps(bar) as Record<string, unknown>)
      // Light DOM 常驻，WC 自管可见性：作者层若给这个 part 声明了 display，
      // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来。
      // 本包的样式自带 [hidden]{display:none} 压得住，但宿主不能指望作者装了这份样式
      this.setPartHidden(el, !(bar.orientation === 'vertical' ? api.vertical : api.horizontal).visible)
    }

    this.setPartHidden(this.getPart('corner'), !api.cornerVisible)
  }
}
