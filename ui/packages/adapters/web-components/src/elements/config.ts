import type { XhTranslationOverrides } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { MotionPreference } from '@xihan-ui/motion'
import type { XhConfig, XhConfigScope } from '../config'
import type { PropertyValues } from '../reactive'
import { applyMotionOverride, notifyXhConfigChange } from '../config'
import { XhReactiveElement } from '../reactive'

// 属性缺席翻成 undefined：这一层「没说」，取值回落外层而不是清空。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-config>` —— 配置作用域。包住一棵子树，里面的元素解析 locale / size / translations
 * 时先看最近的这一层，再往外层与全局那份回落。
 *
 * 它不渲染任何东西、不接线任何角色节点：作者写的子节点原样留在 Light DOM 里，
 * 这个元素只是 DOM 树上的一个记号。皮肤里没有它的规则，布局上它是 display: contents。
 *
 * 与 Vue 适配器的 `provideXhConfig` 是同一件事的两种写法：那边沿组件树找，这边沿 DOM 祖先链找。
 * 逐键合并，本层只覆盖自己写了的那几项——只想改文案的子树不会把外层的 locale 一并抹掉。
 *
 * `translations` 与 `scrollRoot` 是对象与函数，只能走 property；`locale` / `size` / `motion` 属性与 property 都行。
 * `motion` 写了就调 setMotionOverride（应用级、不分子树）；CSS 侧的 data-motion 钩子由作者自己打。
 *
 * @customElement xh-config
 * @attr {string} locale - BCP 47 语言标记，喂给日期时间系组件
 * @attr {'sm'|'md'|'lg'} size - 尺寸档的默认值，落到子树里每个声明了三轴 size 的组件上
 * @attr {'reduce'|'no-preference'} motion - 应用级动效偏好，写了就覆盖系统的 prefers-reduced-motion
 * @prop {XhTranslationOverrides} translations - 各组件内建文案的覆盖（对象只走 property）
 * @prop {() => HTMLElement | null} scrollRoot - 真正在滚的那个元素，交给滚动锁（函数只走 property）
 */
export class XhConfigElement extends XhReactiveElement implements XhConfigScope {
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    locale: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    motion: { converter: STRING_CONVERTER },
    // 对象与函数只走 property
    translations: { attribute: false },
    scrollRoot: { attribute: false },
  }

  declare locale?: string
  declare size?: Size
  declare motion?: MotionPreference
  declare translations?: XhTranslationOverrides
  declare scrollRoot?: () => HTMLElement | null

  /** 本层声明的那几项；解析器沿祖先链读它，缺席的键交给外层。 */
  get xhConfig(): XhConfig {
    return {
      locale: this.locale,
      size: this.size,
      motion: this.motion,
      translations: this.translations,
      scrollRoot: this.scrollRoot,
    }
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this // Light DOM，不建 shadowRoot
  }

  override connectedCallback(): void {
    super.connectedCallback()
    // 布局上让开：作者的子节点该由外层容器直接排布，不该被这一层挡出一个块
    if (!this.style.display)
      this.style.display = 'contents'
    // 进出文档改变的是子树里每个元素解析到的那条链，与改属性等价，同样要叫醒它们
    notifyXhConfigChange()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    notifyXhConfigChange()
  }

  /** 改了任一项都要让子树里已挂载的元素重算一遍。 */
  protected override updated(changed: PropertyValues): void {
    if (changed.has('motion'))
      applyMotionOverride(this.xhConfig)
    notifyXhConfigChange()
  }
}
