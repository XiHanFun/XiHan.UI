import type { RatingSchema } from './rating.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<RatingSchema>()

export const RATING_COUNT = 5

// 值的算术：纯函数，机器与 connect 共用一份

/** 一档有多大：allowHalf 时半颗星，否则整颗。 */
export function ratingStep(allowHalf?: boolean): number {
  return allowHalf ? 0.5 : 1
}

/** 值域上界，即星星颗数。count 为负或非数时按 0 处理（一颗都不渲染）。 */
export function ratingMax(count?: number): number {
  const n = count ?? RATING_COUNT
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

/**
 * 把任意来路的数值钉到合法档位并夹进 [0, count]。
 * 受控值由宿主直接写进 cell、不经任何 action，因此 connect 读出来的第一件事就得过这里。
 */
export function clampRating(value: number, count?: number, allowHalf?: boolean): number {
  const max = ratingMax(count)
  if (!Number.isFinite(value) || value <= 0)
    return 0
  // 0.5 与 1 都是二进制精确值，除完再乘不会留浮点尾巴
  const step = ratingStep(allowHalf)
  return Math.min(Math.round(value / step) * step, max)
}

/** 键盘走一档，下界为一档而非 0；清空需宿主调 setValue(0)。 */
export function stepRating(value: number, direction: 1 | -1, count?: number, allowHalf?: boolean): number {
  const max = ratingMax(count)
  if (max <= 0)
    return 0
  const step = ratingStep(allowHalf)
  const next = clampRating(value, count, allowHalf) + direction * step
  return Math.min(Math.max(next, Math.min(step, max)), max)
}

export const ratingMachine = createMachine({
  name: 'rating',
  context: ({ prop, cell }) => ({
    // 评分走 cell 原生受控，不需要 CONTROLLED.* 影子事件
    value: cell<number>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? 0,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 悬停预览只影响点亮范围，变化时通知宿主
    hoveredValue: cell<number | null>(() => ({
      defaultValue: null,
      onChange: value => prop('onHoverChange')?.({ value }),
    })),
    // 焦点锚点，不受控、不对外通知
    focusedValue: cell<number | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        // 程序化写入不设守卫
        'VALUE.SET': { actions: ['setValue'] },
        'VALUE.STEP': { guard: 'canInteract', actions: ['stepValue'] },
        'VALUE.TO_MIN': { guard: 'canInteract', actions: ['toMin'] },
        'VALUE.TO_MAX': { guard: 'canInteract', actions: ['toMax'] },
        'ITEM.SELECT': { guard: 'canInteract', actions: ['setValue', 'setFocused'] },
        // 只读时焦点仍会落上去，锚点如实跟随
        'ITEM.FOCUS': { actions: ['setFocused'] },
        'ITEM.HOVER': { guard: 'canInteract', actions: ['setHovered'] },
        // 收起预览不设守卫，悬停途中被禁用也要收得回来
        'HOVER.CLEAR': { actions: ['clearHovered'] },
        'CONTROL.BLUR': { actions: ['clearFocused'] },
      },
    },
  },
  implementations: {
    guards: {
      canInteract: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' && e.type !== 'ITEM.SELECT')
          return
        context.set('value', clampRating(e.value, prop('count'), prop('allowHalf')))
      },
      stepValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.STEP')
          return
        context.set('value', stepRating(context.get('value'), e.direction, prop('count'), prop('allowHalf')))
      },
      toMin: ({ context, prop }) => {
        const max = ratingMax(prop('count'))
        context.set('value', max <= 0 ? 0 : Math.min(ratingStep(prop('allowHalf')), max))
      },
      toMax: ({ context, prop }) => {
        context.set('value', ratingMax(prop('count')))
      },
      setHovered: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.HOVER')
          return
        context.set('hoveredValue', clampRating(e.value, prop('count'), prop('allowHalf')))
      },
      // 先看有没有预览再清：cell 初值是 undefined，无条件写 null 会在"指针只是路过外壳"
      // 这种什么都没发生的时候白发一次 onHoverChange(null)
      clearHovered: ({ context }) => {
        if (context.get('hoveredValue') != null)
          context.set('hoveredValue', null)
      },
      setFocused: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.index)
        // 选中值可能是半档（2.5），而锚点要的是承载它的那颗星（第 3 颗）
        else if (e.type === 'ITEM.SELECT')
          context.set('focusedValue', Math.ceil(e.value))
      },
      clearFocused: ({ context }) => context.set('focusedValue', null),
    },
  },
})
