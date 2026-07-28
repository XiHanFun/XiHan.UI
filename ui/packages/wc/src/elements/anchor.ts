import type { Direction, Orientation } from '@xihan-ui/core'
import type { AnchorSchema, AnchorTranslations, AnchorValueChangeDetails } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { anchorMachine, connectAnchor } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在机器与 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样 value 就再也表达不了"非受控"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-anchor>` —— Light-DOM 行为宿主：作者写 root/list/item/link/indicator 角色节点，
 * 元素跑 anchor 机器并把 connect 产出打上去。
 *
 * "哪一节算当前"是滚动位置这件 DOM 事实，由机器的观察器 effect 结算后写进 context，
 * 连接层只读结论。目标区块按 link 上的 value 属性（或 targets 清单）里的 id 现查。
 *
 * 标签由作者写，且必须写对：root 是 `<nav>`（地标语义只有标签给得了），list 是 `<ul>`，
 * item 是 `<li>`（`<ul>` 里只放得下 `<li>`），link 是 `<a>`——Enter 跟随链接这件事
 * 一行代码都没写，全靠平台。href 反过来由元素按 value 派生，作者不必写。
 *
 * @customElement xh-anchor
 * @attr {string} value - 受控激活项；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始激活项
 * @attr {number} offset - 判定线距滚动容器视口顶边的距离（px），默认 0；页面有吸顶栏时设成栏高
 * @attr {boolean} smooth - 点链接时平滑滚动到目标，默认关闭（走原生的瞬时跳转）
 * @attr {'horizontal'|'vertical'} orientation - 列表轴向，默认 vertical
 * @attr {'ltr'|'rtl'} dir - 文字方向；不给则继承祖先
 * @fires value-change - 激活项变化；detail 为 `{ value: string | null }`
 * @csspart root - nav 地标，承载 aria-label
 * @csspart list - ul 容器，同时是指示条定位的参照系
 * @csspart item - li 条目
 * @csspart link - a 链接，须自带 value 属性标识目标区块 id；当前那条报 aria-current="location"
 * @csspart indicator - 指示条，须写成 `<li>` 并住在 list 里（定位参照系是 list，而 ul 里只放得下 li）；
 *   对读屏隐藏，位置由机器量好写成内联样式，无激活项时 hidden
 */
export class XhAnchorElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    offset: { converter: NUMBER_CONVERTER },
    smooth: { converter: BOOLEAN_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    // 清单与文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧同名 prop 对齐
    targets: { attribute: false },
    translations: { attribute: false },
    // 滚动容器是 DOM 句柄，同样只能是 property；不给即挂在窗口上
    scrollElement: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare offset?: number
  declare smooth?: boolean
  declare orientation?: Orientation
  declare direction?: Direction
  declare targets?: readonly string[]
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
      targets: this.targets,
      offset: this.offset,
      smooth: this.smooth,
      orientation: this.orientation,
      dir: this.direction,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 两个取值口都是惰性 getter：观察器与量测都推迟到 DOM 就位之后才调它们。
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

    // 条目是多实例 part，逐个打：身份取作者写的 value（即目标区块的 id）
    for (const el of this.getParts('link')) {
      const props = api.getLinkProps({ value: el.getAttribute('value') ?? '' })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    const indicator = this.getPart('indicator')
    if (indicator) {
      const props = api.getIndicatorProps() as Record<string, unknown>
      this.spreader.spread(indicator, props)
      // connect 已置 hidden，但 styled 给 indicator 设了 display（它得是个绝对定位的块），
      // 那条声明会盖过 UA 的 [hidden]{display:none}；内联 style.display 优先级更高，压得住。
      // 判据直接取 connect 这一帧的产出，不另起一套：两边各判一次迟早会说岔。
      this.setPartHidden(indicator, props.hidden === true)
    }
  }
}
