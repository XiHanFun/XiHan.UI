import type { SliderPoint, SliderSchema } from './slider.types'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { clamp, clampIndex } from '../shared/number'
import { closestThumb, normalizeMarkValues, pointToValue, setThumbValue, snapToMarkValues, snapToStep, stepMarkValue } from './slider.geometry'

const { createMachine } = setup<SliderSchema>()

export const SLIDER_MIN = 0
export const SLIDER_MAX = 100
export const SLIDER_STEP = 1

type Props = SliderSchema['props']
type PropReader = <K extends keyof Props>(key: K) => Props[K]

interface Bounds {
  min: number
  max: number
  step: number
  minStepsBetweenThumbs?: number
  /** 只认刻度落点时的刻度值表；未开 snapToMarks 时缺席。 */
  markValues?: number[]
}

type AxisBounds = Bounds & Pick<Props, 'orientation' | 'dir'>

/** 区间与步长的缺省收在一处。 */
function bounds(prop: PropReader): Bounds {
  const min = prop('min') ?? SLIDER_MIN
  const max = prop('max') ?? SLIDER_MAX
  return {
    min,
    max,
    step: prop('step') ?? SLIDER_STEP,
    minStepsBetweenThumbs: prop('minStepsBetweenThumbs'),
    markValues: prop('snapToMarks') ? normalizeMarkValues(prop('marks') ?? [], min, max) : undefined,
  }
}

/** 换算坐标还要知道朝向：竖直轨道与 RTL 下屏幕坐标与值是反着走的。 */
function axis(prop: PropReader): AxisBounds {
  return { ...bounds(prop), orientation: prop('orientation'), dir: prop('dir') }
}

/**
 * 整组赋值前先归位：逐个吸到 step 网格并夹进区间，再从左往右按 minStepsBetweenThumbs 顶开。
 * 值一旦交叉，thumbBounds 会给出上下颠倒的区间，那两个滑块从此推不动。
 */
function normalizeValues(values: readonly number[], o: Bounds): number[] {
  const gap = (o.minStepsBetweenThumbs ?? 0) * o.step
  const out: number[] = []
  for (let i = 0; i < values.length; i++) {
    const stepped = snapToStep(values[i]!, o.min, o.max, o.step)
    const snapped = o.markValues?.length ? snapToMarkValues(stepped, o.markValues) : stepped
    const lower = i > 0 ? out[i - 1]! + gap : o.min
    out.push(clamp(snapped, lower, o.max))
  }
  return out
}

export const sliderMachine = createMachine({
  name: 'slider',
  context: ({ prop, cell }) => ({
    // 值是数组，走 cell 原生受控：单滑块是长度 1 的数组，与多滑块同一条路。
    // 受控读与初值都过归一化：吸 step/刻度、按邻居顺序归位，与 VALUE.SET 同一套口径
    value: cell<number[]>(() => ({
      value: prop('value') ? normalizeValues(prop('value')!, bounds(prop)) : undefined,
      defaultValue: normalizeValues(prop('defaultValue') ?? [prop('min') ?? SLIDER_MIN], bounds(prop)),
      // 数组每帧都是新引用，默认的 Object.is 会把"没变"也判成变了
      isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]),
      // 通知必须挂在 cell 上：受控时 set 不写内部值，只有这条回调能把用户意图送出去
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    activeIndex: cell<number>(() => ({ defaultValue: 0 })),
  }),
  refs: () => ({
    getTrackEl: () => null,
  }),
  initialState: () => 'idle',
  // 键盘推动从哪个状态发出都一样（拖动期间也可能有键盘事件），因此挂根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    // 命令式赋值与用户推动共用同一道守卫，禁用/只读期间值不变
    'VALUE.SET': { guard: 'canDrag', actions: ['setValue'] },
    'THUMB.STEP': { guard: 'canDrag', actions: ['setActiveIndex', 'stepThumb'] },
    'THUMB.TO_MIN': { guard: 'canDrag', actions: ['setActiveIndex', 'thumbToMin'] },
    'THUMB.TO_MAX': { guard: 'canDrag', actions: ['setActiveIndex', 'thumbToMax'] },
    'THUMB.SET': { guard: 'canDrag', actions: ['setActiveIndex', 'setThumb'] },
    'THUMB.FOCUS': { actions: ['setActiveIndex'] },
  },
  states: {
    idle: {
      on: {
        // 按下就先跳过去：点轨道任意位置，最近的滑块应当当场跟过来，而不是等拖动
        'DRAG.START': { guard: 'canDrag', target: 'dragging', actions: ['grabNearestThumb'] },
      },
    },
    dragging: {
      effects: ['trackPointer'],
      on: {
        'DRAG.MOVE': { actions: ['dragThumb'] },
        // 收尾通知只在这里发一次，拖动途中 onValueChange 已连发多次
        'DRAG.END': { target: 'idle', actions: ['invokeChangeEnd'] },
      },
    },
  },
  implementations: {
    guards: {
      canDrag: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeValues(e.value, bounds(prop)))
      },
      // 带下标的事件一律先过这里，后面几个动作直接读 activeIndex，不再碰事件上的原值
      setActiveIndex: ({ context, event }) => {
        const e = event.current()
        if ('index' in e && typeof e.index === 'number')
          context.set('activeIndex', clampIndex(e.index, context.get('value').length))
      },
      stepThumb: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.STEP')
          return
        const o = bounds(prop)
        const size = e.large ? (prop('largeStep') ?? o.step * 10) : o.step
        const values = context.get('value')
        const index = context.get('activeIndex')
        const current = values[index] ?? o.min
        // 只认刻度落点时键盘走「下一档刻度」，否则加完一步吸附会弹回原地
        const target = o.markValues?.length
          ? stepMarkValue(current, e.direction, o.markValues)
          : current + e.direction * size
        context.set('value', setThumbValue(values, index, target, o))
      },
      thumbToMin: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.TO_MIN')
          return
        const o = bounds(prop)
        context.set('value', setThumbValue(context.get('value'), context.get('activeIndex'), o.min, o))
      },
      thumbToMax: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.TO_MAX')
          return
        const o = bounds(prop)
        context.set('value', setThumbValue(context.get('value'), context.get('activeIndex'), o.max, o))
      },
      setThumb: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.SET')
          return
        const o = bounds(prop)
        context.set('value', setThumbValue(context.get('value'), context.get('activeIndex'), e.value, o))
      },
      // 轨道矩形在事件发生的那一刻现量：connect 不许读 DOM，量尺子这件事只能落在这里
      grabNearestThumb: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        const target = valueAtPoint(e.point, refs.get('getTrackEl')(), axis(prop))
        if (target == null)
          return
        const values = context.get('value')
        const index = closestThumb(values, target)
        context.set('activeIndex', index)
        context.set('value', setThumbValue(values, index, target, bounds(prop)))
      },
      dragThumb: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.MOVE')
          return
        const target = valueAtPoint(e.point, refs.get('getTrackEl')(), axis(prop))
        if (target == null)
          return
        const index = context.get('activeIndex')
        context.set('value', setThumbValue(context.get('value'), index, target, bounds(prop)))
      },
      invokeChangeEnd: ({ context, prop }) => {
        prop('onValueChangeEnd')?.({
          value: [...context.get('value')],
          index: context.get('activeIndex'),
        })
      },
    },
    effects: {
      // 跟手交给指针会话：监听挂在文档上，指针拖出轨道仍要跟手，系统收走指针也会收尾。
      trackPointer: ({ send, refs }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getTrackEl')()),
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', point }),
          onEnd: () => send({ type: 'DRAG.END' }),
        })
        return () => session.dispose()
      },
    },
  },
})

/** 轨道还没就位（无 DOM 的纯逻辑测试、或首帧还没布局）时返回 null，让调用方原地不动。 */
function valueAtPoint(point: SliderPoint, track: HTMLElement | null, o: AxisBounds): number | null {
  if (!track)
    return null
  return pointToValue(point, track.getBoundingClientRect(), o)
}
