import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ColorPickerChannel, ColorPickerInputChannel } from './color-picker.color'
import type {
  ColorPickerApi,
  ColorPickerChannelProps,
  ColorPickerChannelState,
  ColorPickerInputProps,
  ColorPickerSchema,
  ColorPickerSwatchItemProps,
  ColorPickerTranslations,
} from './color-picker.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { overlayPositioned } from '../shared/overlay'
import { colorPickerAnatomy } from './color-picker.anatomy'
import {
  colorPickerApplyInput,
  colorPickerChannelRange,
  colorPickerChannelValue,
  colorPickerCss,
  colorPickerHsvaToRgba,
  colorPickerHueCss,
  colorPickerInputText,
  colorPickerResolveHsva,
  colorPickerSameColor,
  colorPickerToRgba,
} from './color-picker.color'
import { colorPickerPercent } from './color-picker.geometry'
import { COLOR_PICKER_DEFAULT_PLACEMENT } from './color-picker.machine'

const parts = colorPickerAnatomy.build()

/** 通道对外的单位：色相是角度，透明度是百分数。播报文本缺省就靠它们拼。 */
const CHANNEL_UNIT: Record<ColorPickerChannel, string> = { hue: '°', alpha: '%' }
const CHANNEL_NAME: Record<ColorPickerChannel, string> = { hue: 'Hue', alpha: 'Alpha' }
const INPUT_NAME: Record<ColorPickerInputChannel, string> = {
  hex: 'Hex',
  r: 'Red',
  g: 'Green',
  b: 'Blue',
  a: 'Alpha',
}

function resolveTranslations(input: Partial<ColorPickerTranslations> | undefined): ColorPickerTranslations {
  return {
    area: input?.area ?? 'Saturation and brightness',
    areaValueText: input?.areaValueText
      ?? ((saturation, brightness) => `Saturation ${saturation}%, brightness ${brightness}%`),
    channel: input?.channel ?? (channel => CHANNEL_NAME[channel]),
    channelValueText: input?.channelValueText ?? ((channel, value) => `${value}${CHANNEL_UNIT[channel]}`),
    input: input?.input ?? (channel => INPUT_NAME[channel]),
    swatch: input?.swatch ?? (value => `Color ${value}`),
    swatchGroup: input?.swatchGroup ?? 'Color swatches',
    eyeDropperTrigger: input?.eyeDropperTrigger ?? 'Pick a color from the screen',
  }
}

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_color-picker-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectColorPicker<T extends PropTypes>(
  service: Service<ColorPickerSchema>,
  normalize: NormalizeProps<T>,
): ColorPickerApi<T> {
  const { state, prop, send, context, scope } = service

  // 展开态是复合状态，state.get() 拿到的是叶子路径（open.idle 之类），一律用 matches 判
  const open = state.matches('open')
  const dragging = state.matches('open.dragging')
  const picking = state.matches('open.picking')

  const ids = scope.ids('color-picker', 'label', 'trigger', 'content', 'value-text')

  const value = context.get('value')
  const draft = context.get('draft')
  const dragTarget = context.get('dragTarget')
  const eyeDropperSupported = context.get('eyeDropperSupported')

  const format = prop('format') ?? 'hex'
  const alpha = prop('alpha') ?? false
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const dir = prop('dir') ?? 'ltr'
  const swatches = prop('swatches') ?? []
  const label = resolveTranslations(prop('translations'))
  // 只读与禁用都不改值；区别在于浮层还开不开得了、控件还聚不聚得上焦
  const interactive = !disabled && !readOnly
  // 横轴（取色区的饱和度、通道滑杆）跟着 dir 掉头；上下两键恒是屏幕向上变大，与 dir 无关
  const flipHorizontal = dir === 'rtl'

  // 工作色由值串加锚结算，锚保住灰度处的色相
  const hsva = colorPickerResolveHsva(value, context.get('anchor'))
  const rgba = colorPickerHsvaToRgba(hsva)

  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? COLOR_PICKER_DEFAULT_PLACEMENT

  /** 六个角色节点共用同一份状态标记，样式层各处一致。 */
  const stateAttrs = (): Record<string, string | undefined> => ({
    'data-state': stateAttr,
    'data-disabled': dataAttr(disabled),
    'data-readonly': dataAttr(readOnly),
  })

  /**
   * 透明度关掉时，那条滑杆与透明度输入框整条不可用。
   *
   * 只读只是改不动（仍可聚焦）；禁用与通道没开才是不可用（抽 Tab 位、报 aria-disabled）。
   */
  const channelInert = (channel: ColorPickerChannel): boolean => disabled || (channel === 'alpha' && !alpha)
  const channelEditable = (channel: ColorPickerChannel): boolean => interactive && !channelInert(channel)
  const inputInert = (channel: ColorPickerInputChannel): boolean => disabled || (channel === 'a' && !alpha)

  const channelState = (channel: ColorPickerChannel): ColorPickerChannelState => {
    const range = colorPickerChannelRange(channel)
    const raw = colorPickerChannelValue(hsva, channel)
    return {
      channel,
      value: Math.round(raw),
      min: range.min,
      max: range.max,
      percent: range.max === range.min ? 0 : (raw - range.min) / (range.max - range.min),
    }
  }

  const inputText = (channel: ColorPickerInputChannel): string =>
    draft?.channel === channel ? draft.text : colorPickerInputText(hsva, channel, alpha)

  /** 草稿收不下来时给输入框打上 aria-invalid。 */
  const inputInvalid = (channel: ColorPickerInputChannel): boolean =>
    draft?.channel === channel && colorPickerApplyInput(hsva, channel, draft.text, alpha) == null

  /**
   * 按下之后把焦点转投到对应的拇指上。
   * 只在事件那一刻现查 DOM，渲染期不得查：那里 Vue 读到上一帧、WC 读到本帧。
   */
  const focusThumb = (host: HTMLElement, selector: string): void => {
    host.querySelector<HTMLElement>(selector)?.focus()
  }

  /** 认下的键都要拦住：方向键滚页面、Home/End 跳到文档两端。 */
  const runKey = (event: KeyboardEvent, table: Record<string, (() => void) | undefined>): void => {
    // 带修饰键的组合一律放行；Shift 是本组件自己的大步进，不算修饰组合
    if (event.ctrlKey || event.metaKey || event.altKey)
      return
    const handler = table[event.key]
    if (!handler)
      return
    event.preventDefault()
    handler()
  }

  return {
    open,
    value,
    rgba,
    hsva,
    format,
    alpha,
    disabled,
    readOnly,
    dragging,
    picking,
    eyeDropperSupported,
    swatches,
    isSwatchSelected: swatch => colorPickerSameColor(swatch, value),
    channelState,
    inputText,
    setOpen: (next) => {
      if (next !== open)
        send({ type: next ? 'OPEN' : 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...stateAttrs(),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      ...stateAttrs(),
      // 不写 for：触发器是按钮，名字经 trigger 的 aria-labelledby 挂过去
      id: ids.label,
    }),

    /** 触发按钮的收纳容器，也是描边、底色与聚焦环所在的那一层。 */
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      ...stateAttrs(),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      ...stateAttrs(),
      'id': ids.trigger,
      'type': 'button',
      // 浮层是一整组控件，语义上是对话框
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      // 名字由标题加当前值合成
      'aria-labelledby': `${ids.label} ${ids['value-text']}`,
      // 单体控件走原生 disabled。只读不禁用：浮层照开，进去只是改不动
      'disabled': disabled || undefined,
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),

    getValueTextProps: () => normalize.element({
      ...parts['value-text'].attrs,
      ...stateAttrs(),
      id: ids['value-text'],
    }),

    getSwatchProps: () => normalize.element({
      ...parts.swatch.attrs,
      ...stateAttrs(),
      // 纯装饰：颜色已由 value-text 念出
      'aria-hidden': true,
      'data-value': value,
      'style': { background: colorPickerCss(rgba) },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        ...availableHeightVar(position?.availableHeight),
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      ...stateAttrs(),
      'id': ids.content,
      'role': 'dialog',
      // 非模态：Tab 走得出去，走出去即由消解层判定是否收起
      'aria-modal': 'false',
      'aria-labelledby': ids.label,
      // tabindex 写 -1 不能省：焦点域在无可聚焦子控件时会退回聚焦容器本身
      'tabindex': -1,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
    }),

    getAreaProps: () => normalize.element({
      ...parts.area.attrs,
      ...stateAttrs(),
      'data-dragging': dataAttr(dragging && dragTarget === 'area'),
      // 底色是当前色相的纯色，两层渐变（饱和度、明度）由皮肤盖在上面
      'style': { backgroundColor: colorPickerHueCss(hsva.h), touchAction: 'none' },
      // 按下即跳，随后的拖动由机器的 trackPointer 接手；挂在区域而不是拇指上
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键弹上下文菜单、中键是自动滚动
        if (!interactive || event.button !== 0)
          return
        // 挡掉文本选中与默认聚焦
        event.preventDefault()
        send({ type: 'DRAG.START', target: 'area', point: { clientX: event.clientX, clientY: event.clientY } })
        focusThumb(event.currentTarget as HTMLElement, parts['area-thumb'].selector)
      },
    }),

    getAreaThumbProps: () => normalize.element({
      ...parts['area-thumb'].attrs,
      ...stateAttrs(),
      'role': 'slider',
      // 二维控件只报得出一个 aria-valuenow，取横轴饱和度；另一条轴写进 aria-valuetext
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': String(Math.round(hsva.s)),
      'aria-valuetext': label.areaValueText(Math.round(hsva.s), Math.round(hsva.v)),
      'aria-label': label.area,
      // div 上原生 disabled 不生效，禁用须显式写 aria-disabled 并抽掉 Tab 位；readOnly 不抽
      'aria-disabled': disabled ? 'true' : 'false',
      'tabindex': disabled ? undefined : 0,
      'data-dragging': dataAttr(dragging && dragTarget === 'area'),
      // 横轴是饱和度，纵轴是明度（向下变暗，取补数）
      'style': {
        insetInlineStart: colorPickerPercent(hsva.s / 100),
        insetBlockStart: colorPickerPercent(1 - hsva.v / 100),
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 推不动时不吞键，放行给页面滚动
        if (!interactive)
          return
        const large = event.shiftKey
        const stepX = (direction: 1 | -1): void => send({ type: 'AREA.STEP', axis: 'x', direction, large })
        const stepY = (direction: 1 | -1): void => send({ type: 'AREA.STEP', axis: 'y', direction, large })
        runKey(event, {
          ArrowRight: () => stepX(flipHorizontal ? -1 : 1),
          ArrowLeft: () => stepX(flipHorizontal ? 1 : -1),
          ArrowUp: () => stepY(1),
          ArrowDown: () => stepY(-1),
          // 端点取横轴，与 aria-valuenow 报的是同一条轴
          Home: () => send({ type: 'AREA.TO_EDGE', axis: 'x', edge: 'min' }),
          End: () => send({ type: 'AREA.TO_EDGE', axis: 'x', edge: 'max' }),
        })
      },
    }),

    getChannelSliderProps: ({ channel }: ColorPickerChannelProps) => normalize.element({
      ...parts['channel-slider'].attrs,
      ...stateAttrs(),
      'data-channel': channel,
      'data-disabled': dataAttr(channelInert(channel)),
      'data-dragging': dataAttr(dragging && dragTarget === channel),
      // 不关掉默认手势，指针会被 pointercancel 收走
      'style': { touchAction: 'none' },
      // 按下挂在整条滑杆而不是轨道上，拇指常常浮出轨道
      'onPointerDown': (event: PointerEvent) => {
        if (!channelEditable(channel) || event.button !== 0)
          return
        event.preventDefault()
        send({ type: 'DRAG.START', target: channel, point: { clientX: event.clientX, clientY: event.clientY } })
        focusThumb(event.currentTarget as HTMLElement, parts['channel-slider-thumb'].selector)
      },
    }),

    getChannelSliderTrackProps: ({ channel }: ColorPickerChannelProps) => normalize.element({
      ...parts['channel-slider-track'].attrs,
      ...stateAttrs(),
      'data-channel': channel,
      'data-disabled': dataAttr(channelInert(channel)),
      // 透明度轨道的渐变由连接层写成内联；渐变方向没有逻辑关键字可用，只能按 dir 分流。
      // 色相那条写空串清掉内联声明而不是不写键：WC 侧 Object.assign 不会撤掉上一帧旧键
      'style': {
        backgroundImage: channel === 'alpha'
          ? `linear-gradient(to ${flipHorizontal ? 'left' : 'right'}, transparent, ${colorPickerCss({ ...rgba, a: 1 })})`
          : '',
      },
    }),

    getChannelSliderThumbProps: ({ channel }: ColorPickerChannelProps) => {
      const info = channelState(channel)
      const inert = channelInert(channel)
      return normalize.element({
        ...parts['channel-slider-thumb'].attrs,
        ...stateAttrs(),
        'role': 'slider',
        'aria-valuemin': String(info.min),
        'aria-valuemax': String(info.max),
        'aria-valuenow': String(info.value),
        // 单位必须补上，光念数字分不清角度与百分数
        'aria-valuetext': label.channelValueText(channel, info.value),
        'aria-label': label.channel(channel),
        'aria-orientation': 'horizontal',
        'aria-disabled': inert ? 'true' : 'false',
        // 只读仍可聚焦；禁用与透明度整条关掉才抽 Tab 位
        'tabindex': inert ? undefined : 0,
        'data-channel': channel,
        'data-disabled': dataAttr(inert),
        'data-dragging': dataAttr(dragging && dragTarget === channel),
        'style': { insetInlineStart: colorPickerPercent(info.percent) },
        'onKeyDown': (event: KeyboardEvent) => {
          if (!channelEditable(channel))
            return
          const large = event.shiftKey
          const step = (direction: 1 | -1): void => send({ type: 'CHANNEL.STEP', channel, direction, large })
          runKey(event, {
            ArrowRight: () => step(flipHorizontal ? -1 : 1),
            ArrowLeft: () => step(flipHorizontal ? 1 : -1),
            // 上下两键恒是"屏幕向上朝 max"，与 dir 无关
            ArrowUp: () => step(1),
            ArrowDown: () => step(-1),
            Home: () => send({ type: 'CHANNEL.TO_EDGE', channel, edge: 'min' }),
            End: () => send({ type: 'CHANNEL.TO_EDGE', channel, edge: 'max' }),
          })
        },
      })
    },

    getChannelInputProps: ({ channel }: ColorPickerInputProps) => {
      const inert = inputInert(channel)
      return normalize.input({
        ...parts['channel-input'].attrs,
        ...stateAttrs(),
        'type': 'text',
        // 十六进制要打字母，数字键盘反而挡路；三个分量与透明度是纯数字
        'inputmode': channel === 'hex' ? undefined : 'numeric',
        'autocomplete': 'off',
        'autocapitalize': 'none',
        // 布尔要写成字符串：WC 侧 spread 见到 false 会把属性整个摘掉，与 Vue 侧对不上
        'spellcheck': 'false',
        'value': inputText(channel),
        'aria-label': label.input(channel),
        'aria-invalid': inputInvalid(channel) ? 'true' : 'false',
        // 单体表单控件走原生 disabled / readonly：只读仍可聚焦、可复制，只是改不动
        'disabled': inert || undefined,
        'readonly': readOnly || undefined,
        'data-channel': channel,
        'data-invalid': dataAttr(inputInvalid(channel)),
        'onInput': (event: Event) => {
          send({ type: 'INPUT.CHANGE', channel, value: (event.target as HTMLInputElement).value })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          // 回车即收下。不 preventDefault 的话，取色器落在表单里会顺手把表单提交掉
          // 组合期间的按键属于输入法候选框，组件一律不接
          if (isComposingEvent(event))
            return
          if (event.key !== 'Enter' || event.ctrlKey || event.metaKey || event.altKey)
            return
          event.preventDefault()
          send({ type: 'INPUT.COMMIT', channel })
        },
        // 失焦同样收下，否则框里的半截字与实际值长期对不上
        'onBlur': () => send({ type: 'INPUT.COMMIT', channel }),
      })
    },

    getEyeDropperTriggerProps: () => normalize.button({
      ...parts['eye-dropper-trigger'].attrs,
      ...stateAttrs(),
      'type': 'button',
      'aria-label': label.eyeDropperTrigger,
      // 环境没有这个接口时按钮禁用
      'disabled': !interactive || !eyeDropperSupported || undefined,
      'data-disabled': dataAttr(!interactive || !eyeDropperSupported),
      'data-state': picking ? 'picking' : stateAttr,
      'onClick': () => {
        if (interactive && eyeDropperSupported)
          send({ type: 'EYE_DROPPER.OPEN' })
      },
    }),

    getSwatchGroupProps: () => normalize.element({
      ...parts['swatch-group'].attrs,
      ...stateAttrs(),
      'role': 'group',
      'aria-label': label.swatchGroup,
    }),

    getSwatchItemProps: ({ value: swatch }: ColorPickerSwatchItemProps) => {
      const selected = colorPickerSameColor(swatch, value)
      return normalize.button({
        ...parts['swatch-item'].attrs,
        // 身份写在 data-value 上：测试与样式都靠它认这一格是哪个颜色
        [ITEM_VALUE_ATTR]: swatch,
        'type': 'button',
        // 每格各占一个 Tab 位，色板没有方向键导航，不做 roving
        'aria-label': label.swatch(swatch),
        // 未选中也显式写 'false'，不省略
        'aria-pressed': selected ? 'true' : 'false',
        'disabled': !interactive || undefined,
        'data-state': selected ? 'checked' : 'unchecked',
        'data-disabled': dataAttr(!interactive),
        'style': { background: colorPickerCss(colorPickerToRgba(swatch)) },
        'onClick': () => {
          if (interactive)
            send({ type: 'VALUE.SET', value: swatch })
        },
      })
    },

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      value,
      // 禁用的控件不该提交出值。只读照常提交
      disabled: disabled || undefined,
    }),
  }
}
