import type { Direction, Orientation } from '@xihan-ui/core'
import type { CarouselPageChangeDetails, CarouselSchema, CarouselTranslations } from '@xihan-ui/headless'
import { carouselMachine, connectCarousel } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined：缺省值的唯一事实源留在 connect。
// Lit 自带的转换器会把缺席落成 null，那样 page 就再也表达不了"非受控"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：`page=""` 经 Number() 会变成 0，那是一个货真价实的页码，不是"没写"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 缺省为真的开关得能被 ="false" 关掉；三态：缺席 = undefined（用默认值），="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * autoplay 是布尔或毫秒两用：
 * 缺席 = undefined（不自动播放），`autoplay` / `autoplay="true"` = 用默认间隔，
 * `autoplay="false"` = 关，`autoplay="3000"` = 3 秒一张。
 * 写了个念不成数的串（`autoplay="yes"`）按"属性在即开着"处理，用默认间隔。
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

/** 作者写在部件上的下标。缺席或写坏了就退回文档序——把节点按顺序排下来本身就是声明。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-carousel>` —— Light-DOM 行为宿主：作者写 root/viewport/item-group/item/
 * prev-trigger/next-trigger/indicator-group/indicator 角色节点，
 * 元素跑 carousel 机器并把 connect 产出打上去。
 *
 * 条目总数由 `slide-count` 声明，不从 DOM 数：数 DOM 就得让机器在每次增删后重新结算，
 * 两个适配器的结算时机不同，首帧会分叉。指示点一页一个，页数由 `slide-count` 与
 * `slides-per-page` / `slides-per-move` 算出，作者照着渲染节点，元素不替作者生成节点——
 * 生成节点就等于收走模板控制权，图标、外层 `<li>` 壳、i18n 文案都再塞不进来。
 *
 * 轨道位移写在 item-group 的内联 transform 上（样式层不得再碰那条轴）。
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
 * @attr {boolean} allow-mouse-drag - 允许指针拖拽切页，默认关闭
 * @attr {string} spacing - 张与张之间的间距（任意 CSS 长度）
 * @fires page-change - 页码变化；detail 为 `{ page: number }`
 * @csspart root - region 地标，承载 aria-roledescription="carousel" 与名字
 * @csspart viewport - 裁切窗口，兼作读屏活区（自动播放跑着时闭麦）
 * @csspart item-group - 被位移的轨道；transform 由元素写死，样式层别碰
 * @csspart item - 一张幻灯片，可自带 index 属性声明下标，缺省按文档序
 * @csspart prev-trigger - 上一张；首页且不回绕时转原生 disabled
 * @csspart next-trigger - 下一张；末页且不回绕时转原生 disabled
 * @csspart indicator-group - 指示点容器（role=group）
 * @csspart indicator - 一页一个的指示点，可自带 index 属性；当前页带 aria-current="true"
 */
export class XhCarouselElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
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
    allowMouseDrag: { converter: BOOLEAN_CONVERTER, attribute: 'allow-mouse-drag' },
    spacing: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
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
  declare allowMouseDrag?: boolean
  declare spacing?: string
  declare translations?: Partial<CarouselTranslations>

  private readonly notify = (details: CarouselPageChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('page-change', { detail: details, bubbles: true, composed: true }))
  }

  // carousel 机器的副作用只有一个计时器（自身自足）：不需要 config/layer/refs，controller 只带 props。
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
      // 布尔属性只有在/不在两态：不在即 undefined，把缺省交回 connect
      loop: this.loop,
      autoplay: this.autoplay,
      allowMouseDrag: this.allowMouseDrag,
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

    // 条目与指示点都是多实例 part，逐个打：身份取作者写的 index，缺省按文档序。
    // Vue 侧漏写 index 是 NaN（prop 必填，漏了直接报警），WC 侧按文档序兜住——
    // 手写 HTML 时把节点顺序排好本身就是最自然的声明
    this.getParts('item').forEach((el, position) => {
      this.spreader.spread(el, api.getItemProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })

    this.getParts('indicator').forEach((el, position) => {
      this.spreader.spread(el, api.getIndicatorProps({ index: declaredIndex(el, position) }) as Record<string, unknown>)
    })
  }
}
