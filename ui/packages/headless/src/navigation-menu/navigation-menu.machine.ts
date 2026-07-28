import type { Transition } from '@xihan-ui/machine'
import type { NavigationMenuIndicatorRect, NavigationMenuSchema } from './navigation-menu.types'
import { itemValue, queryItems } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { navigationMenuTriggerQuery } from './navigation-menu.anatomy'

const { createMachine } = setup<NavigationMenuSchema>()

/** 悬停/聚焦到展开的默认等待毫秒。 */
export const NAVIGATION_MENU_DELAY = 200

/** 收起之后的默认静默毫秒：窗口内再碰任意 trigger 直接展开。 */
export const NAVIGATION_MENU_SKIP_DELAY = 300

/** 两次量测是否一样。不给 isEqual 的话每次量测都换一个新对象，版本号会一直空转自增。 */
function sameRect(a: NavigationMenuIndicatorRect | null, b: NavigationMenuIndicatorRect | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.blockStart === b.blockStart && a.blockSize === b.blockSize
    && a.inlineStart === b.inlineStart && a.inlineSize === b.inlineSize
}

/**
 * 悬停或聚焦到某个 trigger（此刻没有计时器在跑）：
 * 已经有面板展开着就当场换一项——用户已经在这套导航里了，再让他等一遍延时是折磨；
 * 一片空白时才进等待态，防指针横穿整条导航栏一路闪出四五个面板。
 */
const ENTER_FROM_IDLE: Array<Transition<NavigationMenuSchema>> = [
  { guard: 'hasValue', actions: ['setValue'] },
  { target: 'opening', actions: ['setPendingValue'] },
]

/**
 * 显式激活（点击 / Enter / Space）：
 * - 自动弹出来的那一项被激活 → 留着，只把"自动"的记录摘掉。
 *   否则"悬停弹出 → 顺手点一下"会当场把面板关掉，键盘上"Tab 聚焦弹出 → Enter"同理；
 *   受控时还会把同一个意图对外连发两遍（第二遍被当成又一次换项）。
 * - 已经展开的那一项被再次激活 → 收起，并进静默窗口。
 * - 其余 → 立即展开，不走延时。
 */
const TOGGLE_FROM_IDLE: Array<Transition<NavigationMenuSchema>> = [
  { guard: 'shouldKeepOpen', actions: ['clearAutoValue'] },
  { guard: 'isCurrent', target: 'skipping', actions: ['clearValue'] },
  { actions: ['setValue'] },
]

// 展开项住在 context 的 cell 里、不编进状态：cell 本身就是受控/非受控的收口点
// （value prop 给定即受控，读直取 prop，写只发 onValueChange 不落内部值），
// 因此这一路不需要影子事件与受控守卫。
// 三个状态只管计时，"哪一项展开着"一律看 context.value——两套说法不并存。
export const navigationMenuMachine = createMachine({
  name: 'navigation-menu',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    pendingValue: cell<string | null>(() => ({ defaultValue: null })),
    // 刻意不受控：受控的 value 在宿主写回之前是旧的，认不出刚自动展开的是哪一项
    autoValue: cell<string | null>(() => ({ defaultValue: null })),
    // 量测结果不受控、不对外通知：它只服务指示条的内联样式
    indicator: cell<NavigationMenuIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameRect })),
  }),
  refs: () => ({
    getListEl: () => null,
  }),
  initialState: () => 'idle',
  // 挂载即量一次：defaultValue 给了初始展开项时，指示条首帧就该在位
  entry: ['measureIndicator'],
  // 指示条钉在某个 trigger 上，而那个 trigger 会随窗口宽度换位置（导航栏换行、字体加载完重排）。
  // 只在展开项变化时重量的话，尺寸一变指示条就永远停在旧坐标上
  effects: ['trackResize'],
  watch: ({ track, context, action }) => {
    // 内部切换与宿主受控回写都要重量一次：指示条钉在"当前那一项"上，值一变它就得跟着搬
    track([context.dep('value')], () => action(['measureIndicator']))
  },
  // 程序化改写是明确的意图，三个状态里都认，且一律把计时器收掉
  on: {
    'VALUE.SET': { target: 'idle', actions: ['setValue', 'clearPendingValue'] },
  },
  states: {
    idle: {
      on: {
        'TRIGGER.POINTER': ENTER_FROM_IDLE,
        'TRIGGER.FOCUS': ENTER_FROM_IDLE,
        'TRIGGER.TOGGLE': TOGGLE_FROM_IDLE,
        // 一片空白时收起是空操作，别白跑一趟静默窗口
        'DISMISS': { guard: 'hasValue', target: 'skipping', actions: ['clearValue'] },
      },
    },
    opening: {
      effects: ['waitForOpenDelay'],
      on: {
        // 都是内部转移（没有 target）：状态不重入，计时器原地不动。
        // 指针从这个 trigger 划到隔壁时**不重新计时**——横穿导航栏本来就是一次连续的动作，
        // 每换一个就把秒表归零的话，慢慢划过去会一个面板都等不出来。
        'TRIGGER.POINTER': { actions: ['setPendingValue'] },
        'TRIGGER.FOCUS': { actions: ['setPendingValue'] },
        'after.delayDuration': { target: 'idle', actions: ['commitPendingValue'] },
        // 等不及了就直接点：立即展开，别再让他等完剩下的延时
        'TRIGGER.TOGGLE': { target: 'idle', actions: ['setValue', 'clearPendingValue'] },
        // 等待期内离开：对外从未展开过，不通知、也不进静默窗口
        'DISMISS': { target: 'idle', actions: ['clearPendingValue'] },
      },
    },
    skipping: {
      effects: ['waitForSkipDelay'],
      on: {
        // 静默窗口的全部意义：这一下不再等延时
        'TRIGGER.POINTER': { target: 'idle', actions: ['setValue'] },
        'TRIGGER.TOGGLE': { target: 'idle', actions: ['setValue'] },
        // 聚焦刻意不认：Escape 收起时焦点正要还给 trigger（面板一 hidden，
        // 焦点会连带掉回文档根部，必须还），认这一下就会把刚关掉的面板当场重新弹出来
        'after.skipDelayDuration': { target: 'idle' },
        // 已经收起了，再收一次是空操作
      },
    },
  },
  implementations: {
    guards: {
      // value 与 defaultValue 皆缺省时 cell 初值是 undefined，先归一再判
      hasValue: ({ context }) => (context.get('value') ?? null) != null,
      isCurrent: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.TOGGLE' && e.value === (context.get('value') ?? null)
      },
      // 只认 autoValue，绝不拿 value 做判据：受控时 value 直读宿主 prop，
      // 上一拍刚发出去的换项意图这会儿还没写回来，用它比对必然认错，
      // 「聚焦弹出 → 紧接着点一下」会被当成两次换项，同一个意图连发两遍
      shouldKeepOpen: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.TOGGLE' && e.value === context.get('autoValue')
      },
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TRIGGER.POINTER' && e.type !== 'TRIGGER.FOCUS' && e.type !== 'TRIGGER.TOGGLE' && e.type !== 'VALUE.SET')
          return
        context.set('value', e.value)
        // 悬停/聚焦弹出来的那一项记下来；显式激活与程序化改写都不算自动
        const auto = e.type === 'TRIGGER.POINTER' || e.type === 'TRIGGER.FOCUS'
        context.set('autoValue', auto ? e.value : null)
      },
      clearValue: ({ context }) => {
        context.set('value', null)
        context.set('autoValue', null)
      },
      clearAutoValue: ({ context }) => context.set('autoValue', null),
      setPendingValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.POINTER' || e.type === 'TRIGGER.FOCUS')
          context.set('pendingValue', e.value)
      },
      commitPendingValue: ({ context }) => {
        const pending = context.get('pendingValue')
        if (pending == null)
          return
        context.set('value', pending)
        context.set('autoValue', pending)
        context.set('pendingValue', null)
      },
      clearPendingValue: ({ context }) => context.set('pendingValue', null),

      /**
       * 量指示条。量两遍：同步那遍照顾"trigger 早就在 DOM 里"的常规情形，
       * 推迟那遍照顾首帧（WC 侧的身份标记要等首次 wire 才写上，这一刻一个 trigger 都查不到）。
       * cell 带 isEqual，两遍量到同一个结果不会多推一次更新。
       */
      measureIndicator: ({ refs, prop, context, flush }) => {
        const run = (): void => {
          const list = refs.get('getListEl')()
          const value = context.get('value') ?? null
          if (!list || value == null) {
            context.set('indicator', null)
            return
          }
          const trigger = queryItems(list, navigationMenuTriggerQuery).find(el => itemValue(el) === value)
          if (!trigger) {
            context.set('indicator', null)
            return
          }
          const listRect = list.getBoundingClientRect()
          const rect = trigger.getBoundingClientRect()
          context.set('indicator', {
            blockStart: rect.top - listRect.top,
            blockSize: rect.height,
            // 起始缘按逻辑方向算：RTL 下"起始"在右边，用左边缘量的话指示条会跑到另一头
            inlineStart: (prop('dir') ?? 'ltr') === 'rtl'
              ? listRect.right - rect.right
              : rect.left - listRect.left,
            inlineSize: rect.width,
          })
        }
        run()
        flush(run)
      },
    },
    effects: {
      // 只挂一个监听器，不在挂载那一刻读 DOM，因此不必推迟到 flush；
      // disposed 标记仍要留：监听器与 cleanup 之间总有一帧可能被触发
      trackResize: ({ scope, action }) => {
        let disposed = false
        const win = scope.getWin()
        const onResize = (): void => {
          if (!disposed)
            action(['measureIndicator'])
        }
        win.addEventListener('resize', onResize)
        return () => {
          disposed = true
          win.removeEventListener('resize', onResize)
        }
      },
      waitForOpenDelay: ({ prop, send }) =>
        setTimeoutEffect(() => send({ type: 'after.delayDuration' }), prop('delayDuration') ?? NAVIGATION_MENU_DELAY),
      waitForSkipDelay: ({ prop, send }) =>
        setTimeoutEffect(() => send({ type: 'after.skipDelayDuration' }), prop('skipDelayDuration') ?? NAVIGATION_MENU_SKIP_DELAY),
    },
  },
})
