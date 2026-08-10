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

/** 两次量测是否一样。作 cell 的 isEqual 用：不给的话每次量测都是新对象，版本号会一直空转自增。 */
function sameRect(a: NavigationMenuIndicatorRect | null, b: NavigationMenuIndicatorRect | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.blockStart === b.blockStart && a.blockSize === b.blockSize
    && a.inlineStart === b.inlineStart && a.inlineSize === b.inlineSize
}

/** 悬停或聚焦某个 trigger：已有面板展开则当场换项，否则进等待态走延时。 */
const ENTER_FROM_IDLE: Array<Transition<NavigationMenuSchema>> = [
  { guard: 'hasValue', actions: ['setValue'] },
  { target: 'opening', actions: ['setPendingValue'] },
]

/**
 * 显式激活（点击 / Enter / Space）：
 * - 自动弹出的那一项 → 保持展开，只清掉自动记录；
 * - 已展开的那一项 → 收起并进静默窗口；
 * - 其余 → 立即展开。
 */
const TOGGLE_FROM_IDLE: Array<Transition<NavigationMenuSchema>> = [
  { guard: 'shouldKeepOpen', actions: ['clearAutoValue'] },
  { guard: 'isCurrent', target: 'skipping', actions: ['clearValue'] },
  { actions: ['setValue'] },
]

// 展开项存在 context.value，三个状态只管计时。
export const navigationMenuMachine = createMachine({
  name: 'navigation-menu',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    pendingValue: cell<string | null>(() => ({ defaultValue: null })),
    // 记录刚自动展开的那一项；受控下 value 在宿主写回前是旧值，认不出来
    autoValue: cell<string | null>(() => ({ defaultValue: null })),
    // 量测结果只服务指示条的内联样式
    indicator: cell<NavigationMenuIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameRect })),
  }),
  refs: () => ({
    getListEl: () => null,
  }),
  initialState: () => 'idle',
  // 挂载即量一次，让指示条首帧就在位
  entry: ['measureIndicator'],
  // 窗口尺寸变化时重量指示条
  effects: ['trackResize'],
  watch: ({ track, context, action }) => {
    // 展开项一变就重量一次
    track([context.dep('value')], () => action(['measureIndicator']))
  },
  // 程序化改写在三个状态里都认，并收掉计时器
  on: {
    'VALUE.SET': { target: 'idle', actions: ['setValue', 'clearPendingValue'] },
  },
  states: {
    idle: {
      on: {
        'TRIGGER.POINTER': ENTER_FROM_IDLE,
        'TRIGGER.FOCUS': ENTER_FROM_IDLE,
        'TRIGGER.TOGGLE': TOGGLE_FROM_IDLE,
        // 一个都没展开时收起是空操作，不进静默窗口
        'DISMISS': { guard: 'hasValue', target: 'skipping', actions: ['clearValue'] },
      },
    },
    opening: {
      effects: ['waitForOpenDelay'],
      on: {
        // 内部转移：状态不重入，换项时计时器不重新计时
        'TRIGGER.POINTER': { actions: ['setPendingValue'] },
        'TRIGGER.FOCUS': { actions: ['setPendingValue'] },
        'after.delayDuration': { target: 'idle', actions: ['commitPendingValue'] },
        // 等待期内点击立即展开
        'TRIGGER.TOGGLE': { target: 'idle', actions: ['setValue', 'clearPendingValue'] },
        // 等待期内离开：不通知也不进静默窗口
        'DISMISS': { target: 'idle', actions: ['clearPendingValue'] },
      },
    },
    skipping: {
      effects: ['waitForSkipDelay'],
      on: {
        // 静默窗口内这一下不再等延时
        'TRIGGER.POINTER': { target: 'idle', actions: ['setValue'] },
        'TRIGGER.TOGGLE': { target: 'idle', actions: ['setValue'] },
        // 静默窗口内不认聚焦，避免 Escape 归还焦点时重新弹出面板
        'after.skipDelayDuration': { target: 'idle' },
      },
    },
  },
  implementations: {
    guards: {
      // cell 初值可能是 undefined，先归一再判
      hasValue: ({ context }) => (context.get('value') ?? null) != null,
      isCurrent: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.TOGGLE' && e.value === (context.get('value') ?? null)
      },
      // 只认 autoValue，受控下 value 在宿主写回前仍是旧值
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
        // 记下悬停/聚焦弹出的那一项；显式激活与程序化改写都不算自动
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

      /** 量指示条；同步与推迟各量一遍，后者补上 WC 侧首帧才写入的身份标记。 */
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
            // 起始缘按逻辑方向算，RTL 从右边缘量起
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
      // 挂 resize 监听器重量指示条；disposed 标记挡掉 cleanup 后仍被触发的那一次
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
