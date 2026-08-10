import type { NavigationMenuNode, NavigationMenuSchema, NavigationMenuTranslations, NavigationMenuValueChangeDetails } from '@xihan-ui/headless'
import type { Direction, IdGenerator, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { isItemDisabled } from '@xihan-ui/behavior'
import { connectNavigationMenu, navigationMenuAnatomy, navigationMenuMachine, navigationMenuMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * 作者写在角色节点上的布尔声明，三态读法：属性缺席 = false，="false" = false，其余 = true。
 */
function authorFlag(el: HTMLElement, name: string): boolean {
  const raw = el.getAttribute(name)
  return raw != null && raw !== 'false'
}

/**
 * 读条目的禁用声明，顺手把作者写的原生 disabled 摘掉。
 *
 * 集合条目的禁用一律由 aria-disabled 表达：原生禁用的按钮不可聚焦、也收不到 click，
 * 「禁用项仍是方向键起点、仍挡得住点击」这两条在原生 disabled 下根本无从成立
 * （连点击都到不了处理器，挡住的是浏览器不是组件）。
 * 摘掉之后禁用态由 connect 产出的 aria-disabled 承接，下一轮接线照样读得到。
 */
function authorDisabled(el: HTMLElement): boolean {
  const disabled = isItemDisabled(el)
  if (el.hasAttribute('disabled'))
    el.removeAttribute('disabled')
  return disabled
}

/**
 * `<xh-navigation-menu>` —— Light-DOM 行为宿主：作者写
 * root/list/item/trigger/content/link/indicator/viewport 角色节点，
 * 元素跑 navigation-menu 机器并把 connect 产出打上去。
 *
 * 与 `<xh-menu>` 的分野：这里的条目是链接不是命令，因此不做 roving tabindex——
 * 每个 trigger 都留在 Tab 序列里，面板紧跟在 trigger 之后，Tab 才走得进去。
 *
 * 标签由作者写，且必须写对：root 是 `<nav>`（地标语义只有标签给得了），list 是 `<ul>`，
 * item 与 indicator 都是 `<li>`（`<ul>` 里只放得下 `<li>`），trigger 是 `<button>`，
 * link 是 `<a>`。面板（content）写在同一个 item 里、紧跟 trigger 之后。
 *
 * @customElement xh-navigation-menu
 * @attr {string} value - 受控展开项；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始展开项
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 horizontal
 * @attr {number} delay-duration - 悬停/聚焦到展开的等待毫秒，默认 200
 * @attr {number} skip-delay-duration - 收起之后的静默毫秒，默认 300；窗口内再碰 trigger 直接展开
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响水平轴上 ArrowLeft/ArrowRight 的前后语义
 * @attr {boolean} loop - 方向键走到尽头回绕，默认开启；写 loop="false" 关掉
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 展开项变化；detail 为 `{ value: string | null }`
 * @csspart root - nav 地标，承载 aria-label；指针离开/焦点离场/Escape 三条收起出口都在这儿
 * @csspart list - ul 容器，同时是指示条定位的参照系
 * @csspart item - li 条目，一项一个
 * @csspart trigger - 展开面板的按钮，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart content - 面板，须自带 value 属性与 trigger 配对；收起时 hidden
 * @csspart link - 面板里的链接；指向当前页面的那条写 current 属性，得到 aria-current="page"
 * @csspart indicator - 指示条，须写成 `<li>` 并住在 list 里；对读屏隐藏，位置由机器量好写成内联样式
 * @csspart viewport - 可选的共享面板外壳，放在 root 里；都收起时 hidden
 */
export class XhNavigationMenuElement extends XhElement {
  static override partContract = { anatomy: navigationMenuAnatomy, meta: navigationMenuMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它入口的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    orientation: { converter: STRING_CONVERTER },
    delayDuration: { converter: NUMBER_CONVERTER, attribute: 'delay-duration' },
    skipDelayDuration: { converter: NUMBER_CONVERTER, attribute: 'skip-delay-duration' },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    loop: { converter: BOOLEAN_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare collection?: NavigationMenuNode[]
  declare value?: string
  declare defaultValue?: string
  declare orientation?: Orientation
  declare delayDuration?: number
  declare skipDelayDuration?: number
  declare direction?: Direction
  declare loop?: boolean
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<NavigationMenuTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // trigger 与 content 要按 value 逐对互指（aria-controls / aria-labelledby），
  // 那些 id 由 scope 派生，因此这里必须自己建一个
  private readonly menuScope = createScope(null, this.idGen)

  private readonly notify = (details: NavigationMenuValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<NavigationMenuSchema>(
    this,
    navigationMenuMachine,
    () => this.machineProps(),
    { scope: this.menuScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<NavigationMenuSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      orientation: this.orientation,
      delayDuration: this.delayDuration,
      skipDelayDuration: this.skipDelayDuration,
      dir: this.direction,
      // 布尔属性缺席即 undefined，把缺省交回 connect（回绕默认开）
      loop: this.loop,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 惰性 getter：量测推迟到 DOM 就位之后才调它。
  private injectRefs(svc: Service<NavigationMenuSchema>): void {
    svc.refs.set('getListEl', () => this.getPart('list'))
  }

  protected wire(): void {
    const api = connectNavigationMenu(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用经 authorDisabled 归一到 aria-disabled。
    // 打上去的 data-scope/data-part/data-value 正是方向键在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('trigger')) {
      const props = api.getTriggerProps({
        value: el.getAttribute('value') ?? '',
        disabled: authorDisabled(el),
      })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    // 面板常挂，未展开的由 connect 输出 hidden；styled 给 content 设了 display，
    // 那条声明会盖过 UA 的 [hidden]{display:none}，得用内联 style.display 压住。
    // 判据直接取 connect 这一帧的产出，不另起一套：两边各判一次迟早会说岔。
    for (const el of this.getParts('content')) {
      const props = api.getContentProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>
      this.spreader.spread(el, props)
      this.setPartHidden(el, props.hidden === true)
    }

    for (const el of this.getParts('link'))
      this.spreader.spread(el, api.getLinkProps({ current: authorFlag(el, 'current') }) as Record<string, unknown>)

    const indicator = this.getPart('indicator')
    if (indicator) {
      const props = api.getIndicatorProps() as Record<string, unknown>
      this.spreader.spread(indicator, props)
      this.setPartHidden(indicator, props.hidden === true)
    }

    const viewport = this.getPart('viewport')
    if (viewport) {
      const props = api.getViewportProps() as Record<string, unknown>
      this.spreader.spread(viewport, props)
      this.setPartHidden(viewport, props.hidden === true)
    }
  }
}
