import type { RatingHoverChangeDetails, RatingItemProps, RatingSchema, RatingValueChangeDetails } from '@xihan-ui/headless'
import type { Direction } from '@xihan-ui/kernel'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectRating, ratingAnatomy, ratingMachine, ratingMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：属性缺席 = undefined（用默认值）、="false" = false、其余 = true。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-rating>` —— Light-DOM 行为宿主：作者写 root/label/control 与若干 item 角色节点
 * （可选再写一个 hidden-input 参与表单提交），元素跑 rating 机器并把 connect 产出打上去。
 *
 * 每颗星用 value 属性自报自己是第几颗（1 起），导航与选中都以它认人；
 * 键盘挂在 control 上（它才是那条 role=radiogroup 的星星带），指针预览挂在每颗星上。
 *
 * @customElement xh-rating
 * @attr {number} value - 受控评分；缺省该属性即非受控
 * @attr {number} default-value - 非受控初值，缺省 0（还没评）
 * @attr {number} count - 星星颗数，默认 5
 * @attr {boolean} allow-half - 允许半颗星：档位从 1 变成 0.5
 * @attr {boolean} disabled - 整个不可交互：整条带子退出 Tab 序列，指针与键盘都不认
 * @attr {boolean} read-only - 只读：仍可聚焦与朗读，但改不动，也没有悬停预览
 * @attr {boolean} required - 必填标注；表单影子据此参与原生校验
 * @attr {string} name - 表单字段名；给了表单影子才带 name 并参与提交
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键与"指针落在哪半边"的语义，默认 ltr
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 评分变化；detail 为 `{ value: number }`
 * @fires hover-change - 悬停预览变化；detail 为 `{ value: number | null }`，指针离开时带 null
 * @csspart root - 承载 data-disabled / data-readonly / data-empty 的外壳
 * @csspart label - 评分带标题（aria-labelledby 目标）
 * @csspart control - role=radiogroup 的星星带，键盘交互全在它身上
 * @csspart item - role=radio 的一颗星，作者用 value 属性声明它是第几颗；
 *   点亮看 data-highlighted，半亮看 data-half
 * @csspart hidden-input - 表单影子输入（必须是原生 input）
 */
export class XhRatingElement extends XhElement {
  static override partContract = { anatomy: ratingAnatomy, meta: ratingMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  static override properties = {
    value: { converter: NUMBER_CONVERTER },
    defaultValue: { converter: NUMBER_CONVERTER, attribute: 'default-value' },
    count: { converter: NUMBER_CONVERTER },
    allowHalf: { converter: BOOLEAN_CONVERTER, attribute: 'allow-half' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare value?: number
  declare defaultValue?: number
  declare count?: number
  declare allowHalf?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare name?: string
  declare direction?: Direction
  declare tone?: string
  declare size?: string

  private readonly notifyValue = (details: RatingValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyHover = (details: RatingHoverChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('hover-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<RatingSchema>(this, ratingMachine, () => this.machineProps())

  private machineProps(): Partial<RatingSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      count: this.count,
      allowHalf: this.allowHalf ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      required: this.required ?? false,
      name: this.name,
      dir: this.direction,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notifyValue,
      onHoverChange: this.notifyHover,
    }
  }

  /**
   * 承载焦点的星被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一颗已消失的星上：
   * 容器判自己"焦点在带内"退出 Tab 序列，又没有条目认领得了这个锚点，
   * 整条评分带零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，标题与表单影子离场不会误判；
    // 只有走的正是持有焦点的那颗星才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === String(focusedValue)))
      send({ type: 'CONTROL.BLUR' })
  }

  /** 条目身份取自作者写的 value 属性；没写就不是一颗合法的星，交给 connect 按非法值处理。 */
  private itemProps(el: HTMLElement): RatingItemProps {
    return { value: Number(el.getAttribute('value')) }
  }

  protected wire(): void {
    const api = connectRating(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps(this.itemProps(el)) as Record<string, unknown>)
  }
}
