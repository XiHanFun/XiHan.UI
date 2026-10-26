/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 rating 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { FormControlState, RatingHoverChangeDetails, RatingItemProps, RatingSchema, RatingTranslations, RatingValueChangeDetails } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectRating, hasNamingContent, ratingAnatomy, ratingMachine, ratingMeta, ratingStructure, resolveFormControlState } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-rating>`：Light-DOM 行为宿主：作者写 root / label / control 与若干 item 角色节点
 * （可选再写一个 hidden-input 参与表单提交），元素运行 rating 状态机并把 connect 产出接上。
 *
 * 每颗星用 value 属性声明自身是第几颗（1 起），导航与选中都以它识别；
 * 键盘挂在 control 上（它才是 role=radiogroup 的星星带），指针预览挂在每颗星上。
 *
 * 不写部件（或只写 root）时元素按标准结构生成：标题（label）、星星带里每档一颗星、表单影子（给了 name 才有）；
 * 标题可以由宿主直接子节点 `slot="label"` 接管。星星带旁的分值文本要用时手写部件。
 *
 * @customElement xh-rating
 * @attr {string} label - 标题文字：生成结构时铺带这段文字的 label 部件；手写部件时不使用它
 * @attr {number} value - 受控评分；未提供该属性即非受控
 * @attr {number} default-value - 非受控初值，默认 0（尚未评分）
 * @attr {number} count - 星星颗数，默认 5
 * @attr {boolean} allow-half - 允许半颗星：档位从 1 变为 0.5
 * @attr {boolean} allow-clear - 再次点击当前档位清零，键盘最低档再向下也清零；默认开启，写 "false" 关闭
 * @attr {boolean} disabled - 完全不可交互：整条评分带退出 Tab 序列，指针与键盘都不响应
 * @attr {boolean} read-only - 只读：仍可聚焦与朗读，但不可修改，也没有悬停预览
 * @attr {boolean} required - 必填标注；表单影子据此参与原生校验
 * @attr {boolean} invalid - 校验失败标注：星星带写 aria-invalid，各部件写 data-invalid
 * @attr {string} name - 表单字段名；提供后表单影子才带 name 并参与提交
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键与指针落在哪半边的语义，默认 ltr
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 评分变化；detail 为 `{ value: number }`
 * @fires hover-change - 悬停预览变化；detail 为 `{ value: number | null }`，指针离开时带 null
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty 的外壳
 * @csspart label - 评分带标题（aria-labelledby 目标）
 * @csspart control - role=radiogroup 的星星带，键盘交互全部在它身上
 * @csspart item - role=radio 的一颗星，作者用 value 属性声明它是第几颗；
 *   点亮看 data-highlighted，半亮看 data-half
 * @csspart value-text - 分值文本（aria-hidden），须放在 root 中作为 control 的兄弟；留空即由元素填入当前分值，作者写了内容则由作者负责
 * @csspart hidden-input - 表单影子输入（必须是原生 input）
 */
export class XhRatingElement extends XhElement {
  static override partContract = { anatomy: ratingAnatomy, meta: ratingMeta }

  static override fieldTarget = { parts: ['control'], kind: 'group' } as const

  static override structure: ElementStructure<XhRatingElement> = {
    build: host => host.ctrl.service
      ? ratingStructure(connectRating(host.ctrl.service, wcNormalize), { label: host.label, hiddenInput: host.name !== undefined, slotted: (name, key) => host.slotted(name, key) })
      : undefined,
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  static override properties = {
    label: { converter: STRING_CONVERTER },
    value: { converter: NUMBER_CONVERTER },
    defaultValue: { converter: NUMBER_CONVERTER, attribute: 'default-value' },
    count: { converter: NUMBER_CONVERTER },
    allowHalf: { converter: BOOLEAN_CONVERTER, attribute: 'allow-half' },
    allowClear: { converter: BOOLEAN_CONVERTER, attribute: 'allow-clear' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare label?: string
  declare value?: number
  declare defaultValue?: number
  declare count?: number
  declare allowHalf?: boolean
  declare allowClear?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<RatingTranslations>

  private readonly notifyValue = (details: RatingValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyHover = (details: RatingHoverChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('hover-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<RatingSchema>(this, ratingMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；Rating 消费公开的禁用、只读、必填与无效四轴。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<RatingSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      // 作者写没写 label 角色节点决定可聚焦部件的 aria-labelledby 指不指过去
      labelled: this.getPart('label') != null,
      ariaLabel: this.hostAriaLabel(),
      value: this.value,
      defaultValue: this.defaultValue,
      count: this.count,
      allowHalf: this.allowHalf ?? false,
      allowClear: this.allowClear,
      disabled: control.disabled,
      readOnly: control.readOnly,
      required: control.required,
      invalid: control.invalid,
      name: this.name,
      dir: this.direction,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
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

  /** 分值文本是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()

  /** 填入分值文本；首次见到该节点时若已有内容则归作者，之后不再改写。 */
  private fillValueText(el: HTMLElement, text: string): void {
    let owned = this.ownsValueText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsValueText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  /** 每颗星首次同步时，作者是否已在星节点自己身上写了 aria-label / aria-labelledby。 */
  private readonly namedItems = new WeakMap<Element, boolean>()

  /**
   * 条目身份取自作者写的 value 属性；没写就不是一颗合法的星，交给 connect 按非法值处理。
   * 作者在星里放了自己的内容（文字或带名字的节点），或在星节点上写了自己的名字时，这颗星以作者的为名，connect 不写缺省名。
   */
  private itemProps(el: HTMLElement): RatingItemProps {
    return { value: Number(el.getAttribute('value')), authored: this.itemNamedByAuthor(el) || hasNamingContent(el) }
  }

  /** 首次同步时连接层还没往星节点上写过名字，此刻读到的 aria-label / aria-labelledby 是作者的；按节点只读这一次。 */
  private itemNamedByAuthor(el: HTMLElement): boolean {
    let named = this.namedItems.get(el)
    if (named === undefined) {
      named = ['aria-label', 'aria-labelledby'].some(attr => (el.getAttribute(attr) ?? '').trim() !== '')
      this.namedItems.set(el, named)
    }
    return named
  }

  protected wire(): void {
    const api = connectRating(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps())
    put('label', api.getLabelProps())
    put('control', api.getControlProps())
    put('hidden-input', api.getHiddenInputProps())

    // 属性先落，再填显示文字；作者自己写了内容就归作者，元素不再改写
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps())
      this.fillValueText(valueText, api.valueText)
    }

    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps(this.itemProps(el)))
  }
}
