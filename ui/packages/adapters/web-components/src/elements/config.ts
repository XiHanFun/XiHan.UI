import type { Size } from '@xihan-ui/core'
import type { XhTranslationOverrides } from '@xihan-ui/headless'
import type {
  BrandId,
  ColorMode,
  Contrast,
  Density,
  Direction,
  Transparency,
  VisualEnvironmentController,
  VisualEnvironmentPreference,
  VisualMotion,
} from '@xihan-ui/core/visual-environment'
import type { XhConfig, XhConfigScope } from '../config'
import type { PropertyValues } from '../reactive'
import { createVisualEnvironmentController } from '@xihan-ui/core/visual-environment'
import { notifyXhConfigChange } from '../config'
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
 * `translations`、`scrollRoot` 与 `portalContainer` 是对象或函数，只能走 property；七个视觉轴均可走属性或 property。
 * 七轴只投影到当前元素；局部 motion 不会改全局 JS override。
 *
 * @customElement xh-config
 * @attr {string} locale - BCP 47 语言标记，喂给日期时间系组件
 * @attr {'sm'|'md'|'lg'} size - 尺寸档的默认值，落到子树里每个声明了三轴 size 的组件上
 * @attr {'light'|'dark'|'system'} mode - 色彩模式
 * @attr {string} brand - 品牌标识
 * @attr {'comfortable'|'compact'} density - 视觉密度
 * @attr {'ltr'|'rtl'} direction - 文字方向；控制器会把解析结果投影到标准 dir 属性
 * @attr {'default'|'more'|'system'} contrast - 对比度偏好
 * @attr {'default'|'reduce'|'system'} motion - 动效偏好；只作用当前 DOM scope
 * @attr {'default'|'reduce'|'system'} transparency - 透明材质偏好
 * @prop {XhTranslationOverrides} translations - 各组件内建文案的覆盖（对象只走 property）
 * @prop {() => HTMLElement | null} scrollRoot - 真正在滚的那个元素，交给滚动锁（函数只走 property）
 * @prop {() => Element | null} portalContainer - 子树内物理 Portal 的默认目标（函数只走 property）
 */
export class XhConfigElement extends XhReactiveElement implements XhConfigScope {
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    locale: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    mode: { converter: STRING_CONVERTER },
    brand: { converter: STRING_CONVERTER },
    density: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER },
    contrast: { converter: STRING_CONVERTER },
    motion: { converter: STRING_CONVERTER },
    transparency: { converter: STRING_CONVERTER },
    // 对象与函数只走 property
    translations: { attribute: false },
    scrollRoot: { attribute: false },
    portalContainer: { attribute: false },
  }

  declare locale?: string
  declare size?: Size
  declare mode?: ColorMode | 'system'
  declare brand?: BrandId
  declare density?: Density
  declare direction?: Direction
  declare contrast?: Contrast | 'system'
  declare motion?: VisualMotion | 'system'
  declare transparency?: Transparency | 'system'
  declare translations?: XhTranslationOverrides
  declare scrollRoot?: () => HTMLElement | null
  declare portalContainer?: () => Element | null
  private _visualEnvironmentController?: VisualEnvironmentController

  get visualEnvironmentController(): VisualEnvironmentController | undefined {
    return this._visualEnvironmentController
  }

  /** 本层声明的那几项；解析器沿祖先链读它，缺席的键交给外层。 */
  get xhConfig(): XhConfig {
    return {
      locale: this.locale,
      size: this.size,
      translations: this.translations,
      scrollRoot: this.scrollRoot,
      portalContainer: this.portalContainer,
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
    this._visualEnvironmentController = createVisualEnvironmentController({
      root: this,
      parent: this.parentVisualEnvironment(),
      initial: this.visualPreference(),
    })
    // 进出文档改变的是子树里每个元素解析到的那条链，与改属性等价，同样要叫醒它们
    notifyXhConfigChange()
  }

  override disconnectedCallback(): void {
    this._visualEnvironmentController?.dispose()
    this._visualEnvironmentController = undefined
    super.disconnectedCallback()
    notifyXhConfigChange()
  }

  /** 改了任一项都要让子树里已挂载的元素重算一遍。 */
  protected override updated(changed: PropertyValues): void {
    if (['mode', 'brand', 'density', 'direction', 'contrast', 'motion', 'transparency'].some(key => changed.has(key)))
      this._visualEnvironmentController?.setPreference(this.visualPreference())
    notifyXhConfigChange()
  }

  private visualPreference(): VisualEnvironmentPreference {
    return {
      mode: this.mode,
      brand: this.brand,
      density: this.density,
      dir: this.direction,
      contrast: this.contrast,
      motion: this.motion,
      transparency: this.transparency,
    }
  }

  private parentVisualEnvironment(): VisualEnvironmentController | undefined {
    for (let parent = this.parentElement; parent; parent = parent.parentElement) {
      if ('xhConfig' in parent && 'visualEnvironmentController' in parent)
        return (parent as XhConfigScope).visualEnvironmentController
    }
    return undefined
  }
}
