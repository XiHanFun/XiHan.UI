import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { SliderApi, SliderSchema, SliderThumbState } from './slider.types'
import { focusItem, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { sliderAnatomy } from './slider.anatomy'
import { rangeExtent, thumbBounds, valueToPercent } from './slider.geometry'
import { SLIDER_MAX, SLIDER_MIN, SLIDER_STEP } from './slider.machine'

const parts = sliderAnatomy.build()

// 拇指集合只在事件那一刻查活 DOM，不缓存节点数组，顺序即文档序。
const THUMB_QUERY: ItemQuery = { scope: sliderAnatomy.name, part: 'thumb' }

/** 比例转 CSS 长度，留两位小数。 */
function pct(ratio: number): string {
  return `${Math.round(ratio * 10000) / 100}%`
}

export function connectSlider<T extends PropTypes>(
  service: Service<SliderSchema>,
  normalize: NormalizeProps<T>,
): SliderApi<T> {
  const { context, prop, send, scope, state } = service

  const values = context.get('value')
  const activeIndex = context.get('activeIndex')
  const dragging = state.matches('dragging')

  const min = prop('min') ?? SLIDER_MIN
  const max = prop('max') ?? SLIDER_MAX
  const step = prop('step') ?? SLIDER_STEP
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir') ?? 'ltr'
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const editable = !disabled && !readOnly
  const vertical = orientation === 'vertical'
  // 只有水平轨道才翻转左右键：几何换算里竖直轨道已把 dir 短路，键盘须照同一条规矩
  const flipHorizontal = !vertical && dir === 'rtl'

  const ids = scope.ids('slider', 'label')
  const bounds = { min, max, step, minStepsBetweenThumbs: prop('minStepsBetweenThumbs') }

  const thumbs: SliderThumbState[] = values.map((value, index) => {
    const own = thumbBounds(values, index, bounds)
    return { index, value, percent: valueToPercent(value, min, max), min: own.min, max: own.max }
  })
  const range = rangeExtent(values, { min, max })

  /**
   * 把作者报来的下标收成一个真实存在的位置：下标是作者在部件上的声明，可能越界或是小数，
   * 不收会让 values[index] 变成 undefined 并写出 aria-valuenow="NaN"。
   * value 为空数组时退化到 0。
   */
  const clampIndex = (index: number): number => {
    const whole = Math.trunc(index) || 0
    return values.length === 0 ? 0 : Math.min(Math.max(whole, 0), values.length - 1)
  }

  const thumbAt = (index: number): SliderThumbState =>
    thumbs[clampIndex(index)] ?? { index: 0, value: min, percent: 0, min, max }

  // 五个角色节点共用同一份状态标记，样式层各处一致
  const stateAttrs = (): Record<string, string | undefined> => ({
    'data-orientation': orientation,
    'data-disabled': dataAttr(disabled),
    'data-readonly': dataAttr(readOnly),
    'data-invalid': dataAttr(invalid),
    'data-dragging': dataAttr(dragging),
  })

  const stepBy = (index: number, direction: 1 | -1, large = false): void => {
    send({ type: 'THUMB.STEP', index, direction, large })
  }

  /**
   * 已选区间与拇指的定位走逻辑属性：水平用 inline 轴，竖直用 block 轴且从 block-end 起算。
   * 两条轴的键每帧都写全（用不上的写空串清掉）：WC 侧 Object.assign 到 style 上不会撤掉旧键，
   * 换 orientation 时两轴会同时被钉死。
   */
  const axisStyle = (start: number, size?: number): Record<string, string> => vertical
    ? { insetInlineStart: '', inlineSize: '', insetBlockEnd: pct(start), blockSize: size == null ? '' : pct(size) }
    : { insetBlockEnd: '', blockSize: '', insetInlineStart: pct(start), inlineSize: size == null ? '' : pct(size) }

  return {
    value: values,
    range,
    thumbs,
    dragging,
    disabled,
    readOnly,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setThumbValue: (index, next) => send({ type: 'THUMB.SET', index: clampIndex(index), value: next }),

    // 视觉三轴只落在 root：语气与尺寸都靠自定义属性向下继承，子部件不必各写一份
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...stateAttrs(),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      ...stateAttrs(),
      // 不写 for：拇指是 div、不是可被 label 关联的表单控件，写了浏览器也不认。
      // 名字经拇指上的 aria-labelledby 反向挂过去。
      id: ids.label,
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      ...stateAttrs(),
      // 触摸拖动要接管手势：不关掉浏览器滚动/缩放，指针事件会被系统收走（pointercancel）
      style: { touchAction: 'none' },
      // 按下即跳：点轨道任意位置最近的拇指跟过来，拖动由 trackPointer 效应接手。
      // 挂在 control 而不是 track 上，拇指常浮出轨道、只挂 track 抓不住它。
      onPointerDown: (event: PointerEvent) => {
        // 只认主键：右键会顺带弹出上下文菜单，中键是自动滚动
        if (!editable || event.button !== 0)
          return
        // 挡掉文本选中与默认聚焦，否则焦点落在 control 上、松手后方向键没人接
        event.preventDefault()
        send({ type: 'DRAG.START', point: { clientX: event.clientX, clientY: event.clientY } })
        // 抓住哪个拇指由机器写入 activeIndex，这里现查活 DOM 把焦点转投过去
        const control = event.currentTarget as HTMLElement
        focusItem(queryItems(control, THUMB_QUERY)[context.get('activeIndex')] ?? null)
      },
    }),

    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      ...stateAttrs(),
    }),

    getRangeProps: () => normalize.element({
      ...parts.range.attrs,
      ...stateAttrs(),
      style: axisStyle(range.start, range.end - range.start),
    }),

    getThumbProps: (index) => {
      const thumb = thumbAt(index)
      return normalize.element({
        ...parts.thumb.attrs,
        ...stateAttrs(),
        'role': 'slider',
        // 区间取这个拇指自己能走到的范围：被邻居挡住的那段读屏也走不到
        'aria-valuemin': String(thumb.min),
        'aria-valuemax': String(thumb.max),
        'aria-valuenow': String(thumb.value),
        // 没给格式化函数就不写：缺席时读屏念 aria-valuenow
        'aria-valuetext': prop('getValueText')?.({ value: thumb.value, index: thumb.index }),
        'aria-orientation': orientation,
        'aria-labelledby': ids.label,
        // div 上原生 disabled 不生效，用 aria-disabled 并抽掉 Tab 位；readOnly 不抽 Tab 位
        'aria-disabled': disabled ? 'true' : 'false',
        'tabindex': disabled ? undefined : 0,
        'data-index': String(thumb.index),
        // 只有正被推动的那个拇指算 dragging：多拇指时全打上标记，样式层就分不出手在哪一个上
        'data-dragging': dataAttr(dragging && thumb.index === activeIndex),
        'style': axisStyle(thumb.percent),
        'onFocus': () => send({ type: 'THUMB.FOCUS', index: thumb.index }),
        'onKeyDown': (event: KeyboardEvent) => {
          // 推不动时不吞键，带修饰键的组合一律放行
          if (!editable || event.ctrlKey || event.metaKey || event.altKey)
            return
          const run: Record<string, (() => void) | undefined> = {
            // 上下两键恒是"屏幕向上朝 max"，与 dir 无关
            ArrowUp: () => stepBy(thumb.index, 1),
            ArrowDown: () => stepBy(thumb.index, -1),
            ArrowRight: () => stepBy(thumb.index, flipHorizontal ? -1 : 1),
            ArrowLeft: () => stepBy(thumb.index, flipHorizontal ? 1 : -1),
            PageUp: () => stepBy(thumb.index, 1, true),
            PageDown: () => stepBy(thumb.index, -1, true),
            // 多拇指时端点取的是自己被邻居允许的上下界（机器里由 setThumbValue 夹）
            Home: () => send({ type: 'THUMB.TO_MIN', index: thumb.index }),
            End: () => send({ type: 'THUMB.TO_MAX', index: thumb.index }),
          }
          const handler = run[event.key]
          if (!handler)
            return
          // 认下的键都得拦住，否则方向键滚页面、Home/End 跳到文档两端
          event.preventDefault()
          handler()
        },
      })
    },

    // 表单出口：值靠这份原生输入随表单提交；多拇指时逐个同名 append。
    getHiddenInputProps: (index) => {
      const thumb = thumbAt(index)
      return normalize.input({
        ...parts['hidden-input'].attrs,
        // type 先于 value 写：改 type 会重置输入的值
        'type': 'hidden',
        // name 缺省即不产出该属性，此时这份输入不参与提交
        'name': prop('name'),
        'value': String(thumb.value),
        // 禁用的控件不该提交出值（与原生 input[type=range][disabled] 一致）
        'disabled': disabled || undefined,
        'data-index': String(thumb.index),
      })
    },
  }
}
