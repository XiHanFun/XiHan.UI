import type { ScrollbarSchema, ScrollbarType } from '@xihan-ui/headless'
import type { Direction, Orientation, Size } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectScrollbar, scrollbarAnatomy, scrollbarMachine, scrollbarMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-scrollbar>` —— Light-DOM 行为宿主：作者写 root/track/thumb 三个角色节点，
 * 元素跑 scrollbar 机器并把 connect 产出打上去。
 *
 * 滚动容器由作者交出来，且**不必**是本元素的后代：写 `controls="内容区的 id"`，
 * 或者用 JS 把节点赋给 `scrollable` 属性。表格的滚动盒、虚拟滚动的视口、
 * 随手一个 overflow:auto 的 div 都行。
 *
 * 滚动本身一概不接管：键盘（PageUp/PageDown、方向键、Home/End）与滚轮在滚动容器上
 * 走浏览器原生通路，本元素只是另画一套并接上拖拽与点轨道。滑块缺省不进 Tab 序、
 * 也对读屏隐藏——同一件事没必要报两遍；要用键盘操作滑块本身时开 `focusable`。
 *
 * 滑块的位置与长度按可视区/内容/滚动量算出来后写进内联样式：竖向是
 * inset-block-start + block-size，横向是 inset-inline-start + inline-size（逻辑属性，RTL 自动换向）。
 *
 * @customElement xh-scrollbar
 * @attr {string} controls - 滚动容器的 id；没设 scrollable 属性时按它查节点，focusable 时同时落到 aria-controls
 * @attr {'horizontal'|'vertical'} orientation - 这条滚动条管哪条轴，默认 vertical
 * @attr {'auto'|'always'|'scroll'|'hover'} type - 露面的时机，默认 hover
 * @attr {number} hide-delay - 收起前的等待毫秒（type 为 scroll / hover 时生效），默认 600
 * @attr {number} min-thumb-size - 滑块最短多少像素，默认 20
 * @attr {number} step - 方向键一步滚多少像素，默认 40
 * @attr {'sm'|'md'|'lg'} size - 尺寸档，换的是滚动条厚度
 * @attr {boolean} disabled - 不接指针也不接键盘，恒不显形
 * @attr {boolean} focusable - 滑块进 Tab 序并报 role=scrollbar，默认关
 * @attr {'ltr'|'rtl'} dir - 排版方向，只改写横轴的滚动量正负与指针位移方向
 * @prop {HTMLElement} scrollable - 直接给滚动容器节点（对象只走 property），优先于 controls
 * @fires scroll-start - 开始滚了；detail 为 `{ offset: number, max: number }`
 * @fires scroll-end - 一段滚动结束（停手 120ms）；detail 同上
 * @fires drag-start - 按住滑块；detail 同上
 * @fires drag-end - 松开滑块；detail 同上
 * @csspart root - 定位盒与指针热区，承载 data-orientation / data-type / data-state / data-scrolling / data-dragging / data-size；收起时带 hidden
 * @csspart track - 量长度的那条轨，点空白处把滑块中心挪过去
 * @csspart thumb - 滑块，位置与长度由内联逻辑属性给出；按住可拖，focusable 时可聚焦并吃方向键
 */
export class XhScrollbarElement extends XhElement {
  static override partContract = { anatomy: scrollbarAnatomy, meta: scrollbarMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    controls: { converter: STRING_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    type: { converter: STRING_CONVERTER },
    hideDelay: { converter: NUMBER_CONVERTER, attribute: 'hide-delay' },
    minThumbSize: { converter: NUMBER_CONVERTER, attribute: 'min-thumb-size' },
    step: { converter: NUMBER_CONVERTER },
    size: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    focusable: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    // 节点与文案是对象，只能走 property
    scrollable: { attribute: false },
    translations: { attribute: false },
  }

  declare controls?: string
  declare orientation?: Orientation
  declare type?: ScrollbarType
  declare hideDelay?: number
  declare minThumbSize?: number
  declare step?: number
  declare size?: Size
  declare disabled?: boolean
  declare focusable?: boolean
  declare direction?: Direction
  declare scrollable?: HTMLElement | null
  declare translations?: ScrollbarSchema['props']['translations']

  private readonly ctrl = new MachineController<ScrollbarSchema>(
    this,
    scrollbarMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<ScrollbarSchema['props']> {
    return {
      controls: this.controls,
      orientation: this.orientation,
      type: this.type,
      hideDelay: this.hideDelay,
      minThumbSize: this.minThumbSize,
      step: this.step,
      size: this.size,
      disabled: this.disabled ?? false,
      focusable: this.focusable ?? false,
      dir: this.direction,
      translations: this.translations,
      onScrollStart: details => this.emit('scroll-start', details),
      onScrollEnd: details => this.emit('scroll-end', details),
      onDragStart: details => this.emit('drag-start', details),
      onDragEnd: details => this.emit('drag-end', details),
    }
  }

  private emit(type: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
  }

  /**
   * 先认 scrollable 属性给的节点，没有再按 controls 当 id 去查。
   * 每次调用现查：作者的容器可能是后插进来的，缓存住会永远指向第一次那个（或 null）。
   */
  private resolveScrollable(): HTMLElement | null {
    if (this.scrollable)
      return this.scrollable
    if (!this.controls)
      return null
    const found = this.ownerDocument?.getElementById(this.controls)
    return found instanceof HTMLElement ? found : null
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 三个 getter 都懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着
  private injectRefs(svc: Service<ScrollbarSchema>): void {
    svc.refs.set('getScrollableEl', () => this.resolveScrollable())
    svc.refs.set('getTrackEl', () => this.getPart('track'))
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  protected wire(): void {
    const api = connectScrollbar(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('track', api.getTrackProps() as Record<string, unknown>)
    // 滑块的 style 是对象（两条轴的键每帧写全），spreader 见对象 style 会逐条写内联样式
    put('thumb', api.getThumbProps() as Record<string, unknown>)

    // Light DOM 常驻，WC 自管可见性：作者层若给这个 part 声明了 display，
    // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来。
    // 本包的样式自带 [hidden]{display:none} 压得住，但宿主不能指望作者装了这份样式
    this.setPartHidden(this.getPart('root'), !api.visible)
  }
}
