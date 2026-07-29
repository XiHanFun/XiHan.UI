import type { SliderPoint, SliderSchema } from './slider.types'
import { setup } from '@xihan-ui/machine'
import { clamp } from '../shared/number'
import { closestThumb, pointToValue, setThumbValue, snapToStep } from './slider.geometry'

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
}

type AxisBounds = Bounds & Pick<Props, 'orientation' | 'dir'>

/** 区间与步长的缺省收在一处。 */
function bounds(prop: PropReader): Bounds {
  return {
    min: prop('min') ?? SLIDER_MIN,
    max: prop('max') ?? SLIDER_MAX,
    step: prop('step') ?? SLIDER_STEP,
    minStepsBetweenThumbs: prop('minStepsBetweenThumbs'),
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
    const snapped = snapToStep(values[i]!, o.min, o.max, o.step)
    const lower = i > 0 ? out[i - 1]! + gap : o.min
    out.push(clamp(snapped, lower, o.max))
  }
  return out
}

export const sliderMachine = createMachine({
  name: 'slider',
  context: ({ prop, cell }) => ({
    // 值是数组，走 cell 原生受控：单滑块是长度 1 的数组，与多滑块同一条路
    value: cell<number[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [prop('min') ?? SLIDER_MIN],
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
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeValues(e.value, bounds(prop)))
      },
      setActiveIndex: ({ context, event }) => {
        const e = event.current()
        if ('index' in e && typeof e.index === 'number')
          context.set('activeIndex', e.index)
      },
      stepThumb: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.STEP')
          return
        const o = bounds(prop)
        const size = e.large ? (prop('largeStep') ?? o.step * 10) : o.step
        const values = context.get('value')
        const current = values[e.index] ?? o.min
        context.set('value', setThumbValue(values, e.index, current + e.direction * size, o))
      },
      thumbToMin: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.TO_MIN')
          return
        const o = bounds(prop)
        context.set('value', setThumbValue(context.get('value'), e.index, o.min, o))
      },
      thumbToMax: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.TO_MAX')
          return
        const o = bounds(prop)
        context.set('value', setThumbValue(context.get('value'), e.index, o.max, o))
      },
      setThumb: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'THUMB.SET')
          return
        const o = bounds(prop)
        context.set('value', setThumbValue(context.get('value'), e.index, e.value, o))
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
      // 监听器挂在文档上，指针拖出轨道仍要跟手；pointercancel 不收会让状态永远停在 dragging。
      trackPointer: ({ send, refs }) => {
        const track = refs.get('getTrackEl')()
        const doc = track?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
        if (!doc)
          return () => {}
        const onMove = (ev: PointerEvent): void => {
          send({ type: 'DRAG.MOVE', point: { clientX: ev.clientX, clientY: ev.clientY } })
        }
        const onUp = (): void => send({ type: 'DRAG.END' })
        doc.addEventListener('pointermove', onMove)
        doc.addEventListener('pointerup', onUp)
        doc.addEventListener('pointercancel', onUp)
        return () => {
          doc.removeEventListener('pointermove', onMove)
          doc.removeEventListener('pointerup', onUp)
          doc.removeEventListener('pointercancel', onUp)
        }
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
