/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ColorChannel } from '../shared/color'
import type { ColorSliderApi, ColorSliderServices, ColorSliderTranslations } from './color-slider.types'
import { dataAttr, normalizeProps } from '@xihan-ui/core'
import { colorChannelRange, colorChannelValue, colorCss, colorHsvaToRgba, colorResolveHsva, colorToChannel } from '../shared/color'
import { connectSlider } from '../slider'
import { colorSliderAnatomy } from './color-slider.anatomy'
import { colorSliderAlpha, colorSliderTrackGradient } from './color-slider.machine'

const parts = colorSliderAnatomy.build()

const CHANNEL_NAME: Record<ColorChannel, string> = {
  hue: 'Hue',
  saturation: 'Saturation',
  brightness: 'Brightness',
  alpha: 'Alpha',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
}

/** 播报单位：色相是角度，百分数那几路是 %，红绿蓝念裸数。 */
const CHANNEL_UNIT: Record<ColorChannel, string> = {
  hue: '°',
  saturation: '%',
  brightness: '%',
  alpha: '%',
  red: '',
  green: '',
  blue: '',
}

function resolveTranslations(input: Partial<ColorSliderTranslations> | undefined): ColorSliderTranslations {
  return {
    label: input?.label ?? (channel => CHANNEL_NAME[channel]),
    valueText: input?.valueText ?? ((channel, value) => `${value}${CHANNEL_UNIT[channel]}`),
  }
}

type Dict = Record<string, unknown>

function pct(ratio: number): string {
  return `${Math.round(ratio * 10000) / 100}%`
}

export function connectColorSlider<T extends PropTypes>(
  services: ColorSliderServices,
  normalize: NormalizeProps<T>,
): ColorSliderApi<T> {
  const { prop, send, context, scope } = services.root

  /**
   * 内嵌那台滑杆：拖动、键盘、聚焦记账与几何都取它的产出。
   * 用恒等归一化连一次拿到原始属性字典：传调用方的归一化器会把 onKeyDown 之类
   * 改成各框架的事件键名，再覆盖就成了两个键、两个处理器。
   */
  const slider = connectSlider(services.slider, normalizeProps)

  const ids = scope.ids('color-slider', 'label')
  const value = context.get('value')
  const channel = colorToChannel(prop('channel'))
  const range = colorChannelRange(channel)
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir') ?? 'ltr'
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const editable = !disabled && !readOnly
  const vertical = orientation === 'vertical'
  const label = resolveTranslations(prop('translations'))
  // 拇指里填的颜色：推透明度时按当前透明度画，其余通道画实色
  const alpha = colorSliderAlpha({ alpha: prop('alpha'), channel })

  // 工作色由值串加锚结算，锚保住灰度处的色相
  const hsva = prop('hsva') ?? colorResolveHsva(value, context.get('anchor'))
  const rgba = colorHsvaToRgba(hsva)
  // 位置按未取整的工作色算，比滑杆按整格算的那一份更贴当前颜色
  const exact = colorChannelValue(hsva, channel)
  const channelValue = Math.round(exact)
  const percent = range.max === range.min ? 0 : (exact - range.min) / (range.max - range.min)
  const dragging = slider.dragging

  /** 六个角色节点共用同一份状态标记，样式层各处一致。 */
  const stateAttrs = (): Record<string, string | undefined> => ({
    'data-channel': channel,
    'data-orientation': orientation,
    'data-disabled': dataAttr(disabled),
    'data-readonly': dataAttr(readOnly),
    'data-invalid': dataAttr(invalid),
    'data-dragging': dataAttr(dragging),
  })

  /**
   * 拇指的定位走逻辑属性：水平用 inline 轴，竖直用 block 轴且从 block-end 起算。
   * 两条轴的键每帧都写全（用不上的写空串清掉）：WC 侧 Object.assign 到 style 上不会撤掉旧键。
   */
  const thumbStyle = (): Record<string, string> => vertical
    ? { insetInlineStart: '', insetBlockEnd: pct(percent) }
    : { insetBlockEnd: '', insetInlineStart: pct(percent) }

  // 渐变方向没有逻辑关键字可用：水平按文字方向分流，竖直恒是自下而上
  const gradientDirection = vertical ? 'top' : dir === 'rtl' ? 'left' : 'right'

  return {
    value,
    channel,
    channelValue,
    percent,
    min: range.min,
    max: range.max,
    hsva,
    rgba,
    disabled,
    readOnly,
    dragging,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setChannelValue: next => send({ type: 'CHANNEL.SET', value: next }),

    // 视觉轴只落在 root：尺寸靠自定义属性向下继承，子部件不必各写一份
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...stateAttrs(),
      'data-size': prop('size'),
      'data-value': value,
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      ...stateAttrs(),
      // 不写 for：拇指是 div、不是可被 label 关联的表单控件。名字经拇指上的 aria-labelledby 反向挂过去
      id: ids.label,
    }),

    // 按下挂在整条控件而不是轨道上（拇指常常浮出轨道），这一层就是内嵌滑杆的 control：
    // 按下即跳与随后的跟手都由那台滑杆接手，轨道矩形从它自己的 getTrackEl 现量
    getControlProps: () => {
      const controlDown = (slider.getControlProps() as Dict).onPointerDown as ((event: PointerEvent) => void) | undefined
      return normalize.element({
        ...parts.control.attrs,
        ...stateAttrs(),
        // 不关掉默认手势，指针会被 pointercancel 收走
        style: { touchAction: 'none' },
        onPointerDown: (event: PointerEvent) => {
          if (!editable || event.button !== 0)
            return
          controlDown?.(event)
          // 焦点转投由这里补：滑杆按自己那份解剖找拇指，而这里的拇指挂着颜色滑块的部件名
          ;(event.currentTarget as HTMLElement).querySelector<HTMLElement>(parts.thumb.selector)?.focus()
        },
      })
    },

    // 轨道的渐变按当前颜色现算：其余分量不动，只让本通道从 min 走到 max。
    // 皮肤只画轨道的形状（透明度那一路另垫棋盘格），颜色归这里
    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      ...stateAttrs(),
      style: { backgroundImage: colorSliderTrackGradient(hsva, channel, gradientDirection) },
    }),

    /**
     * 键盘与聚焦记账取内嵌滑杆的产出：方向键 / PageUp / PageDown / Home / End 与 RTL 掉头都在它那一份处理器里。
     * 读屏那几条仍在本组件明写：它们是颜色滑块自己对外的契约，部件名、名字与带单位的播报文本三样滑杆都给不出。
     */
    getThumbProps: () => {
      const sliderThumb = slider.getThumbProps(0) as Dict
      return normalize.element({
        ...parts.thumb.attrs,
        ...stateAttrs(),
        'role': 'slider',
        'aria-valuemin': String(range.min),
        'aria-valuemax': String(range.max),
        'aria-valuenow': String(channelValue),
        // 单位必须补上，光念数字分不清角度与百分数
        'aria-valuetext': label.valueText(channel, channelValue),
        'aria-labelledby': ids.label,
        // 作者没放 label 部件时名字从文案取，两者同时在时以 label 部件为准
        'aria-label': label.label(channel),
        'aria-orientation': orientation,
        // div 上原生 disabled 不生效，用 aria-disabled 并抽掉 Tab 位；readOnly 不抽 Tab 位
        'aria-disabled': disabled ? 'true' : 'false',
        'tabindex': disabled ? undefined : 0,
        // 拇指压在自己那一档的颜色上：皮肤据此把拇指填成当前色
        'style': { ...thumbStyle(), '--xh-_color-slider-thumb-color': colorCss(alpha ? rgba : { ...rgba, a: 1 }) },
        'onFocus': sliderThumb.onFocus,
        'onKeyDown': sliderThumb.onKeyDown,
      })
    },

    // 值气泡：显示本通道的当前数值。aria-hidden：拇指已用 aria-valuetext 报过，念第二遍是重复
    getValueTextProps: () => normalize.element({
      ...parts['value-text'].attrs,
      ...stateAttrs(),
      'aria-hidden': true,
    }),

    // 表单出口：颜色串靠这份原生输入随表单提交
    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      value,
      // 禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}
