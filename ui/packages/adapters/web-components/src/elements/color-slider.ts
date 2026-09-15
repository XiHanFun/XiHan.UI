/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import type { Direction, IdGenerator, Orientation, Size } from '@xihan-ui/core'
import type { ColorChannel, ColorFormat, ColorSliderSchema, ColorSliderServices, ColorSliderTranslations, ColorSliderValueChangeDetails, FormControlState, SliderSchema } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { colorSliderAnatomy, colorSliderMachine, colorSliderMeta, colorSliderSliderProps, connectColorSlider, resolveFormControlState, sliderMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/** 属性缺席转换为 undefined，默认值由状态机决定。 */
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
/** 布尔属性：出现即 true，写 "false" 才是 false；缺席不覆盖状态机默认值。 */
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-color-slider>`：Light-DOM 行为宿主，运行 color-slider 状态机并内嵌一台 slider 状态机，
 * 把 connect 产出接到 root / label / control / track / thumb / value-text / hidden-input 等角色节点。
 *
 * 一条滑杆只推动颜色的一个通道（色相 / 饱和度 / 明度 / 透明度 / 红 / 绿 / 蓝），值是整个颜色串；
 * 轨道的渐变按当前颜色计算并写为内联样式，作者只绘制轨道的形状。
 *
 * @customElement xh-color-slider
 * @attr {string} value - 受控的颜色值串；未提供该属性即非受控
 * @attr {string} default-value - 非受控初值，默认 #000000
 * @attr {'hue'|'saturation'|'brightness'|'alpha'|'red'|'green'|'blue'} channel - 推动的通道，默认 hue
 * @attr {'hex'|'rgba'|'hsla'} format - 值串的写法，默认 hex
 * @attr {boolean} alpha - 值串是否带透明度；未提供时推动透明度通道带、其余不带
 * @attr {'horizontal'|'vertical'} orientation - 排布方向
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写水平轨道上左右两键与指针的语义
 * @attr {boolean} disabled - 禁用
 * @attr {boolean} read-only - 只读：拇指仍可聚焦，不可推动
 * @attr {boolean} invalid - 校验失败
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} name - 表单字段名；提供后表单影子才带 name 并参与提交
 * @prop {Partial<ColorSliderTranslations>} translations - 读屏文案（只能通过 property 设置）
 * @fires value-change - 颜色变化；detail 为 `{ value: string }`，拖动过程中连续发出
 * @fires value-change-end - 一次推动结束；detail 为 `{ value: string }`
 * @csspart root - 根节点，承载 data-channel / data-orientation / data-size
 * @csspart label - 标签，名字经拇指上的 aria-labelledby 关联
 * @csspart control - 可按下的整条区域：按下即跳转，拖动跟随
 * @csspart track - 轨道；渐变由元素写为内联 background-image
 * @csspart thumb - role=slider 的拇指，位置由元素写为内联样式
 * @csspart value-text - 值气泡；为空时由元素填入本通道的当前数值
 * @csspart hidden-input - 表单影子
 */
export class XhColorSliderElement extends XhElement {
  static override partContract = { anatomy: colorSliderAnatomy, meta: colorSliderMeta }

  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    channel: { converter: STRING_CONVERTER },
    format: { converter: STRING_CONVERTER },
    alpha: { converter: BOOLEAN_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    size: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare channel?: ColorChannel
  declare format?: ColorFormat
  declare alpha?: boolean
  declare orientation?: Orientation
  declare direction?: Direction
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare size?: Size
  declare name?: string
  declare translations?: Partial<ColorSliderTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly sliderScope = createScope(null, this.idGen)

  private readonly notifyValue = (details: ColorSliderValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyValueEnd = (details: ColorSliderValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ColorSliderSchema>(
    this,
    colorSliderMachine,
    () => this.machineProps(),
    { scope: this.sliderScope },
  )

  // 内嵌一台滑杆：区间与当下的值从颜色滑块现读，推动经 CHANNEL.SET 送回去。
  // 两台共用一份 scope，part id 里带组件名区分，不会撞。
  // onBuilt 在构造期就跑，轨道懒读：角色节点要等首次 updated 才发现得到
  private readonly innerCtrl = new MachineController<SliderSchema>(
    this,
    sliderMachine,
    () => colorSliderSliderProps(this.ctrl.service),
    { scope: this.sliderScope, onBuilt: svc => svc.refs.set('getTrackEl', () => this.getPart('track')) },
  )

  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；本组件仅消费公开的三条轴。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<ColorSliderSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      channel: this.channel,
      format: this.format,
      alpha: this.alpha,
      orientation: this.orientation,
      dir: this.direction,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      size: this.size,
      name: this.name,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onValueChangeEnd: this.notifyValueEnd,
    }
  }

  /** 连接层要的整份服务表。 */
  private services(): ColorSliderServices {
    return { root: this.ctrl.service, slider: this.innerCtrl.service }
  }

  /** 值气泡的文字是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()

  /** 填入值气泡的文本；首次见到该节点时若已有内容则归作者，之后不再改写。 */
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

  protected wire(): void {
    const api = connectColorSlider(this.services(), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('track', api.getTrackProps() as Record<string, unknown>)
    put('thumb', api.getThumbProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 属性先落，再填显示文字；作者自己写了内容就归作者，元素不再改写
    const bubble = this.getPart('value-text')
    if (bubble) {
      this.spreader.spread(bubble, api.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(bubble, String(api.channelValue))
    }
  }
}
