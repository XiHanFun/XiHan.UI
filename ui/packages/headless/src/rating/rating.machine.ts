import type { RatingSchema } from './rating.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<RatingSchema>()

export const RATING_COUNT = 5

// —— 值的算术。全是纯函数，机器与 connect 共用一份，单独可测。
// 之所以拎出来：评分的坑几乎都在"哪些数是合法档位"上——半颗星、越界的宿主输入、
// 键盘走不到的 0——散在 action 里会被状态转移淹没。

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
 *
 * 受控值是宿主直接写进 cell 的，不经任何 action，所以 connect 读出来的第一件事就是过这里：
 * 少了这一步，value=99 会让每颗星都点亮、aria-checked 落在一个根本不存在的条目上，
 * allowHalf 关掉时传进来的 2.5 也会渲染出一颗不该出现的半星。
 */
export function clampRating(value: number, count?: number, allowHalf?: boolean): number {
  const max = ratingMax(count)
  if (!Number.isFinite(value) || value <= 0)
    return 0
  const step = ratingStep(allowHalf)
  // 0.5 与 1 都是二进制精确值，除完再乘不会留浮点尾巴
  return Math.min(Math.round(value / step) * step, max)
}

/**
 * 键盘走一档。
 *
 * 下界是一档而不是 0：0 表示"还没评"，它没有对应的星，radiogroup 里也没有能承载它的条目，
 * 所以键盘只在 [一档, count] 之间走，清空得由宿主调 setValue(0)。
 * 从 0 出发按减一档同样落到下界——此时用户是在进入这条标尺，不是在往下走。
 */
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
    // 评分是数值，走 cell 原生受控：受控/非受控的收口点就是它，
    // 因此不需要 CONTROLLED.* 影子事件，也不需要成对守卫
    value: cell<number>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? 0,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 悬停预览独立于评分：它只影响点亮范围。通知挂在 cell 上，
    // 作者据此显示"3 星：还不错"这类跟手的说明文字
    hoveredValue: cell<number | null>(() => ({
      defaultValue: null,
      onChange: value => prop('onHoverChange')?.({ value }),
    })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与键盘起点
    focusedValue: cell<number | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        // 程序化写入不设守卫：宿主自己调 setValue 与"用户能不能改"是两回事
        'VALUE.SET': { actions: ['setValue'] },
        'VALUE.STEP': { guard: 'canInteract', actions: ['stepValue'] },
        'VALUE.TO_MIN': { guard: 'canInteract', actions: ['toMin'] },
        'VALUE.TO_MAX': { guard: 'canInteract', actions: ['toMax'] },
        'ITEM.SELECT': { guard: 'canInteract', actions: ['setValue', 'setFocused'] },
        // 焦点是事实不是许可：只读时焦点照样落得上去，锚点就得如实跟着走
        'ITEM.FOCUS': { actions: ['setFocused'] },
        'ITEM.HOVER': { guard: 'canInteract', actions: ['setHovered'] },
        // 收起预览不设守卫：悬停途中被禁用，也得收得回来
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
