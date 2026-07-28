import type { LoadingBarSchema } from './loading-bar.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import {
  clampLoadingBarValue,
  isLoadingBarDeterminate,
  LOADING_BAR_MAX,
  nextLoadingBarValue,
  resolveLoadingBarMinimum,
} from './loading-bar.trickle'

const { createMachine } = setup<LoadingBarSchema>()

/** 爬升节拍缺省毫秒。 */
export const LOADING_BAR_TRICKLE_SPEED = 200
/** 冲到 100 之后留给淡出的窗口缺省毫秒。 */
export const LOADING_BAR_FADE_DURATION = 200
/** 条子厚度缺省。连接层把它写进内联样式，皮肤不再声明这条轴。 */
export const LOADING_BAR_HEIGHT = '2px'

/**
 * 节拍归一。返回 0 表示"不起计时器"：
 * <=0 与非有限数一并按"不自行爬升"处理（写 0 就是关掉它的方式，和 trickle=false 同效）。
 */
export function resolveLoadingBarTrickleSpeed(speed: number | undefined): number {
  const ms = speed ?? LOADING_BAR_TRICKLE_SPEED
  return Number.isFinite(ms) && ms > 0 ? ms : 0
}

/**
 * 淡出窗口归一：夹到非负，非有限数退回缺省。
 * 不放行 Infinity——它送进 setTimeoutEffect 会抛，而且"永远停在淡出态"意味着
 * 条子再也回不到 idle，下一次加载连起点都没有。
 */
export function resolveLoadingBarFadeDuration(ms: number | undefined): number {
  const value = ms ?? LOADING_BAR_FADE_DURATION
  return Number.isFinite(value) ? Math.max(0, value) : LOADING_BAR_FADE_DURATION
}

/**
 * 顶部加载条机器。
 *
 * 三段状态：idle（收起）→ loading（走着）→ finishing（冲到 100 正在淡出）→ idle。
 * 爬升的每一拍都重入 loading：重入会把计时器拆掉重挂，改节拍、关掉爬升、
 * 从确定进度切回不确定，都在下一拍当场生效，不必另起一套重挂机制。
 *
 * 进度值走 cell 原生受控（value / defaultValue / onValueChange）：数值不像布尔那样
 * 表达不了 undefined，因此不需要影子事件与成对守卫。
 * loading 是纯输入（只有宿主能改，组件不会自己翻回去），照 watch → 同步动作那条路走即可。
 */
export const loadingBarMachine = createMachine({
  name: 'loading-bar',
  context: ({ prop, cell }) => ({
    value: cell<number>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? 0,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
  }),
  initialState: ({ prop }) => (prop('loading') ? 'loading' : 'idle'),
  watch: ({ track, prop, action }) => {
    track([() => prop('loading')], () => action(['syncLoading']))
    // 爬升参数被改写要重挂计时器：换节拍当场生效、关掉即当场停，
    // 从确定进度切回不确定时也要把爬升重新支起来（否则条子就此冻住）
    track(
      [() => prop('trickle'), () => prop('trickleSpeed'), () => prop('value')],
      () => action(['syncTrickle']),
    )
  },
  states: {
    // 收起态。刻意不在这里归零：归零只发生在淡出走完那一步，
    // 挂载时若作者给了 defaultValue，这条位置的值得原样留着
    idle: {
      on: {
        'LOADING.START': { target: 'loading' },
      },
    },
    loading: {
      entry: ['primeValue'],
      effects: ['trackTrickle'],
      on: {
        'LOADING.END': { target: 'finishing' },
        // 到点爬一格并重起计时：reenter 把 trackTrickle 拆掉再挂
        'after.trickleSpeed': { target: 'loading', reenter: true, actions: ['advanceValue'] },
        // 爬升参数改了：同样靠一次重入把计时器按新参数重挂
        'TRICKLE.SYNC': { target: 'loading', reenter: true },
      },
    },
    finishing: {
      entry: ['completeValue'],
      effects: ['waitForFade'],
      on: {
        // 淡出走完才归零：早一步归零，用户会看见条子在淡出途中先缩回左边再消失
        'after.fadeDuration': { target: 'idle', actions: ['resetValue'] },
        // 淡出途中又开始加载：整条重来（primeValue 会把冲到头的值拉回起步值）
        'LOADING.START': { target: 'loading' },
      },
    },
  },
  implementations: {
    actions: {
      syncLoading: ({ prop, send }) => {
        send(prop('loading') ? { type: 'LOADING.START' } : { type: 'LOADING.END' })
      },
      syncTrickle: ({ send }) => send({ type: 'TRICKLE.SYNC' }),

      /**
       * 保底：值不低于起步值。开始加载那一下它把条子顶到 minimum，让人立刻看见有东西在动。
       *
       * 它挂在 loading 的进入动作上，而爬升的每一拍都重入 loading（重入会整条退出再进入），
       * 因此这个动作每拍都会跑一次——这是有意的，所以它写成幂等的：取 max，值只升不降，
       * 爬到哪儿就留在哪儿。唯一会被拉回起步值的是"上一轮冲到过 100"那种情形，
       * 新一轮不该从满格起步。
       */
      primeValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        const current = clampLoadingBarValue(context.get('value'))
        const alive = current > 0 && current < LOADING_BAR_MAX ? current : 0
        context.set('value', Math.max(alive, resolveLoadingBarMinimum(prop('minimum'))))
      },
      advanceValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        context.set('value', nextLoadingBarValue(context.get('value')))
      },
      completeValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        context.set('value', LOADING_BAR_MAX)
      },
      resetValue: ({ context, prop }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return
        context.set('value', 0)
      },
    },
    effects: {
      /**
       * 爬升计时器：只在 loading 存在，每次进入都从整个节拍重新计。
       * 三种情况一律不起计时器——起了也只是往一个没人收的地方写值：
       * · 确定进度：宽度归宿主的 value，不该有第二个人往里写；
       * · trickle 关掉：作者明说了不要假进度；
       * · 节拍 <=0：同上，写 0 就是关掉它的方式。
       */
      trackTrickle: ({ prop, send }) => {
        if (isLoadingBarDeterminate(prop('value')))
          return undefined
        if (!(prop('trickle') ?? true))
          return undefined
        const speed = resolveLoadingBarTrickleSpeed(prop('trickleSpeed'))
        if (speed <= 0)
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.trickleSpeed' }), speed)
      },
      waitForFade: ({ prop, send }) =>
        setTimeoutEffect(
          () => send({ type: 'after.fadeDuration' }),
          resolveLoadingBarFadeDuration(prop('fadeDuration')),
        ),
    },
  },
})
