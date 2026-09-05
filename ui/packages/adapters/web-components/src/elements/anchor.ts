import type { Direction, Orientation, Service, Size, Tone } from '@xihan-ui/core'
import type { AnchorSchema, AnchorTranslations, AnchorValueChangeDetails } from '@xihan-ui/headless'
import { anchorAnatomy, anchorMachine, anchorMeta, connectAnchor } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined、在场=true、显式写 "false"=false
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-anchor>` —— 锚点导航行为宿主，激活项由机器的滚动观察器结算，
 * 目标区块按 link 上的 value 属性（或 collection 清单）里的 id 现查。
 *
 * 作者须写对标签：root 是 `<nav>`，list 是 `<ul>`，item 是 `<li>`，link 是 `<a>`；
 * href 由元素按 value 派生。
 *
 * @customElement xh-anchor
 * @attr {string} value - 受控激活项；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始激活项
 * @attr {number} offset - 判定线距滚动容器视口顶边的距离（px），默认 0
 * @attr {boolean} smooth - 点链接时平滑滚动到目标，默认关闭
 * @attr {'horizontal'|'vertical'} orientation - 列表轴向，默认 vertical
 * @attr {'ltr'|'rtl'} dir - 文字方向；不给则继承祖先
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 激活项变化；detail 为 `{ value: string | null }`
 * @csspart root - nav 地标，承载 aria-label
 * @csspart list - ul 容器，同时是指示条定位的参照系
 * @csspart item - li 条目
 * @csspart link - a 链接，须自带 value 属性标识目标区块 id；当前那条报 aria-current="location"
 * @csspart indicator - 指示条，须写成 `<li>` 并住在 list 里；对读屏隐藏，
 *   位置由机器量好写成内联样式，无激活项时 hidden
 */
export class XhAnchorElement extends XhElement {
  static override partContract = { anatomy: anchorAnatomy, meta: anchorMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    offset: { converter: NUMBER_CONVERTER },
    smooth: { converter: BOOLEAN_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 清单与文案是对象，只走 property
    collection: { attribute: false },
    translations: { attribute: false },
    // 滚动容器是 DOM 句柄，只走 property；不给即挂在窗口上
    scrollElement: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare offset?: number
  declare smooth?: boolean
  declare orientation?: Orientation
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size
  declare collection?: readonly string[]
  declare translations?: Partial<AnchorTranslations>
  declare scrollElement?: HTMLElement | null

  private readonly notify = (details: AnchorValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<AnchorSchema>(
    this,
    anchorMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<AnchorSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      collection: this.collection,
      offset: this.offset,
      smooth: this.smooth,
      orientation: this.orientation,
      dir: this.direction,
      translations: this.translations,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<AnchorSchema>): void {
    svc.refs.set('getListEl', () => this.getPart('list'))
    svc.refs.set('getScrollEl', () => this.scrollElement ?? null)
  }

  protected wire(): void {
    const api = connectAnchor(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps() as Record<string, unknown>)

    // 逐个打 link，身份取作者写的 value（即目标区块的 id）
    for (const el of this.getParts('link')) {
      const props = api.getLinkProps({ value: el.getAttribute('value') ?? '' })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    const indicator = this.getPart('indicator')
    if (indicator) {
      const props = api.getIndicatorProps() as Record<string, unknown>
      this.spreader.spread(indicator, props)
      // 按本帧产出的 hidden 用内联 display 收起
      this.setPartHidden(indicator, props.hidden === true)
    }
  }
}
