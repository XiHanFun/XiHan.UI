import type { Direction, Orientation } from '@xihan-ui/core'
import type { CarouselPageChangeDetails, CarouselSchema, CarouselTranslations } from '@xihan-ui/headless'
import { carouselAnatomy, carouselMachine, carouselMeta, connectCarousel } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席，避免 Number('') 落成页码 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席 = undefined，="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * autoplay 布尔或毫秒两用：缺席 = undefined，`autoplay` / `autoplay="true"` = 默认间隔，
 * `autoplay="false"` = 关，`autoplay="3000"` = 3 秒一张，念不成数的串按开着处理。
 */
const AUTOPLAY_CONVERTER = {
  fromAttribute: (v: string | null): boolean | number | undefined => {
    if (v == null)
      return undefined
    if (v === '' || v === 'true')
      return true
    if (v === 'false')
      return false
    const ms = Number(v)
    return Number.isFinite(ms) ? ms : true
  },
}

/** 读作者写在部件上的下标，缺席或写坏了退回文档序。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-carousel>` —— 走马灯行为宿主。
 *
 * 条目总数由 `slide-count` 声明，不从 DOM 数。指示点一页一个，页数由 `slide-count` 与
 * `slides-per-page` / `slides-per-move` 算出，由作者照着渲染节点，元素不生成节点。
 * 轨道位移写在 item-group 的内联 transform 上，样式层不得再碰那条轴。
 *
 * @customElement xh-carousel
 * @attr {number} page - 受控页码，0 基；缺省该属性即非受控
 * @attr {number} default-page - 非受控初始页，默认 0
 * @attr {number} slide-count - 条目总数
 * @attr {number} slides-per-page - 一屏放几张，默认 1
 * @attr {number} slides-per-move - 一次翻几张，默认跟随 slides-per-page
 * @attr {'horizontal'|'vertical'} orientation - 轨道方向，默认 horizontal
 * @attr {'ltr'|'rtl'} dir - 文字方向；水平轴上同时决定位移方向
 * @attr {boolean} loop - 走到尽头回绕，默认关闭
 * @attr {boolean|number} autoplay - 自动播放：属性在即开，写数值即间隔毫秒
 * @attr {boolean} allow-pointer-drag - 允许指针拖拽切页，默认关闭
 * @attr {string} spacing - 张与张之间的间距（任意 CSS 长度）
 * @fires page-change - 页码变化；detail 为 `{ page: number }`
 * @csspart root - region 地标，承载 aria-roledescription="carousel" 与名字
 * @csspart viewport - 裁切窗口，兼作读屏活区
 * @csspart item-group - 被位移的轨道；transform 由元素写入，样式层别碰
 * @csspart item - 一张幻灯片，可自带 index 属性声明下标，缺省按文档序
 * @csspart prev-trigger - 上一张；首页且不回绕时转原生 disabled
 * @csspart next-trigger - 下一张；末页且不回绕时转原生 disabled
 * @csspart indicator-group - 指示点容器（role=group）
 * @csspart indicator - 一页一个的指示点，可自带 index 属性；当前页带 aria-current="true"
 */
export class XhCarouselElement extends XhElement {
  static override partContract = { anatomy: carouselAnatomy, meta: carouselMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    page: { converter: NUMBER_CONVERTER },
    defaultPage: { converter: NUMBER_CONVERTER, attribute: 'default-page' },
    slideCount: { converter: NUMBER_CONVERTER, attribute: 'slide-count' },
    slidesPerPage: { converter: NUMBER_CONVERTER, attribute: 'slides-per-page' },
    slidesPerMove: { converter: NUMBER_CONVERTER, attribute: 'slides-per-move' },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    loop: { converter: BOOLEAN_CONVERTER },
    autoplay: { converter: AUTOPLAY_CONVERTER },
    allowPointerDrag: { converter: BOOLEAN_CONVERTER, attribute: 'allow-pointer-drag' },
    spacing: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare page?: number
  declare defaultPage?: number
  declare slideCount?: number
  declare slidesPerPage?: number
  declare slidesPerMove?: number
  declare orientation?: Orientation
  declare direction?: Direction
  declare loop?: boolean
  declare autoplay?: boolean | number
  declare allowPointerDrag?: boolean
  declare spacing?: string
  declare translations?: Partial<CarouselTranslations>

  private readonly notify = (details: CarouselPageChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('page-change', { detail: details, bubbles: true, composed: true }))
  }

  // 机器只有计时器一个副作用，controller 只带 props。
  private readonly ctrl = new MachineController<CarouselSchema>(this, carouselMachine, () => this.machineProps())

  private machineProps(): Partial<CarouselSchema['props']> {
    return {
      page: this.page,
      defaultPage: this.defaultPage,
      slideCount: this.slideCount,
      slidesPerPage: this.slidesPerPage,
      slidesPerMove: this.slidesPerMove,
      orientation: this.orientation,
      dir: this.direction,
      // 布尔缺席即 undefined，缺省交回 connect
      loop: this.loop,
      autoplay: this.autoplay,
      allowPointerDrag: this.allowPointerDrag,
      spacing: this.spacing,
      translations: this.translations,
      onPageChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectCarousel(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('item-group', api.getItemGroupProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)
    put('indicator-group', api.getIndicatorGroupProps() as Record<string, unknown>)

    // 条目与指示点是多实例 part，逐个打：身份取作者写的 index，缺省按文档序。
    this.getParts('item').forEach((el, position) => {
      this.spreader.spread(el, api.getItemProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })

    this.getParts('indicator').forEach((el, position) => {
      this.spreader.spread(el, api.getIndicatorProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })
  }
}
