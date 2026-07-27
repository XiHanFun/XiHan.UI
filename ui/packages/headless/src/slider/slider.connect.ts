import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { SliderApi, SliderSchema, SliderThumbState } from './slider.types'
import { focusItem, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { sliderAnatomy } from './slider.anatomy'
import { rangeExtent, thumbBounds, valueToPercent } from './slider.geometry'
import { SLIDER_MAX, SLIDER_MIN, SLIDER_STEP } from './slider.machine'

const parts = sliderAnatomy.build()

// 拇指集合只在事件那一刻查活 DOM（按下轨道后要把焦点转投过去），不缓存节点数组：
// 那一刻两个适配器看到的是同一份文档，顺序即文档序。
const THUMB_QUERY: ItemQuery = { scope: sliderAnatomy.name, part: 'thumb' }

/**
 * 比例转 CSS 长度。留两位小数：step 是小数时 0.1 累加会拖出 30.000000000000004 这种尾巴，
 * 直接拼进 style 既难看，也让两个适配器的内联样式串对不上。
 */
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
  // 左右两键的屏幕方向与值方向相反只发生在水平轨道上：竖直轨道的几何换算
  // （geometry 的 isInverted）本就把 dir 短路掉了，键盘这边也得照同一条规矩，
  // 否则 rtl 的竖直滑块会出现"按上变大、按右也变大、按左却也变大"这种自相矛盾。
  const flipHorizontal = !vertical && dir === 'rtl'

  const ids = scope.ids('slider', 'label')
  const bounds = { min, max, step, minStepsBetweenThumbs: prop('minStepsBetweenThumbs') }

  const thumbs: SliderThumbState[] = values.map((value, index) => {
    const own = thumbBounds(values, index, bounds)
    return { index, value, percent: valueToPercent(value, min, max), min: own.min, max: own.max }
  })
  const range = rangeExtent(values, { min, max })

  /**
   * 把作者报来的下标收成一个真实存在的位置。下标是作者写在部件上的声明
   * （Vue 的 :index、WC 的 index 属性），拇指数量与 value 长度对不上、写成小数或压根写错
   * 都是可能的；不收的话 values[index] 是 undefined，会一路变成 aria-valuenow="NaN"，
   * 写回时还会在值数组里凿出空洞。value 为空数组时退化到 0，第一次推动即补出一个值。
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
   * 已选区间与拇指的定位一律走逻辑属性：水平轨道用 inline 轴，竖直轨道用 block 轴，
   * 且竖直方向从 block-end（视觉下沿）起算——值向上增大，与几何换算同向。
   *
   * 两条轴的键每帧都写全（用不上的那条写空串清掉）：WC 侧是 Object.assign 到 style 上，
   * 只写新键不会撤掉上一帧的旧键，切换 orientation 时会同时留着 inlineSize 与 blockSize，
   * 拇指就此卡在一个两轴都被钉死的位置。Vue 侧会自动清，两边写法必须一致。
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

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...stateAttrs(),
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
      // 触摸拖动要自己接管手势：不关掉浏览器的滚动/缩放手势，手指一动页面就跟着滚，
      // 指针事件随即被系统收走（pointercancel），拖到一半的滑块停在原地。
      style: { touchAction: 'none' },
      // 按下即跳：点轨道任意位置，最近的拇指当场跟过来（拖动由机器的 trackPointer 效应接手）。
      // 挂在 control 而不是 track 上，是因为拇指常常浮出轨道，只挂 track 会抓不住拇指本身。
      onPointerDown: (event: PointerEvent) => {
        // 只认主键：右键会顺带弹出上下文菜单，中键是自动滚动
        if (!editable || event.button !== 0)
          return
        // 挡掉文本选中与默认聚焦：拖动时选中页面文字会让轨道"粘"住，
        // 焦点落在 control 上则松手后按方向键没人接
        event.preventDefault()
        send({ type: 'DRAG.START', point: { clientX: event.clientX, clientY: event.clientY } })
        // 抓住的是哪个拇指由上一句里的机器定下（grabNearestThumb 写了 activeIndex），
        // 这里现查活 DOM 把焦点转投过去，松手就能接着用方向键微调
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
        // 区间取这个拇指自己能走到的范围，不是整条轨道的：多拇指时被邻居挡住的那段
        // 读屏也走不到，报整条区间等于报了个到不了的数
        'aria-valuemin': String(thumb.min),
        'aria-valuemax': String(thumb.max),
        'aria-valuenow': String(thumb.value),
        // 没给格式化函数就不写：aria-valuetext 缺席时读屏念 aria-valuenow，
        // 硬塞一个与 valuenow 逐字相同的串只是噪音
        'aria-valuetext': prop('getValueText')?.({ value: thumb.value, index: thumb.index }),
        'aria-orientation': orientation,
        'aria-labelledby': ids.label,
        // 单体控件的禁用语义：div 上原生 disabled 不生效，只能用 aria-disabled 显式说明，
        // 并抽掉 Tab 位（与原生 input[type=range] 一致：禁用即不可聚焦）。
        // readOnly 不抽 Tab 位——只读控件仍要能聚焦、被读屏念出来
        'aria-disabled': disabled ? 'true' : 'false',
        'tabindex': disabled ? undefined : 0,
        'data-index': String(thumb.index),
        // 只有正被推动的那个拇指算 dragging：多拇指时全打上标记，样式层就分不出手在哪一个上
        'data-dragging': dataAttr(dragging && thumb.index === activeIndex),
        'style': axisStyle(thumb.percent),
        'onFocus': () => send({ type: 'THUMB.FOCUS', index: thumb.index }),
        'onKeyDown': (event: KeyboardEvent) => {
          // 推不动的时候不吞键：禁用/只读的滑块上按 PageDown 该翻页、按方向键该滚页面。
          // 带修饰键的组合一律放行（Ctrl+Home 是"跳到文档顶部"这类浏览器/读屏快捷键）
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
          // 方向键滚页面、PageUp/PageDown 翻页、Home/End 跳到文档两端——认下的键都得拦住
          event.preventDefault()
          handler()
        },
      })
    },

    // 表单出口：值靠这份原生输入随表单提交。它对键盘与读屏都不存在（type=hidden 天生如此），
    // 交互全部由拇指承担，两者不会各说各话。多拇指时逐个同名 append，服务端按数组收。
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
