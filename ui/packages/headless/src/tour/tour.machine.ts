import type { Placement, PositionResult, Scope } from '@xihan-ui/core'
import type { PropFn } from '@xihan-ui/machine'
import type { TourSchema, TourSpotlightRect, TourStep } from './tour.types'
import { canTakeFocus, createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { sameTourSpotlight, tourSpotlightBox } from './tour.spotlight'

const { createMachine } = setup<TourSchema>()

/** 未指定 placement 时的落位：气泡挂在目标下方。 */
export const TOUR_DEFAULT_PLACEMENT: Placement = 'bottom'

/** 气泡与目标之间的缺省间距（px），要给高亮框的留白让出位置。 */
export const TOUR_DEFAULT_OFFSET = 12

/** 总步数。作者给什么都得先落成非负整数。 */
export function tourStepCount(steps: readonly TourStep[] | undefined): number {
  return Array.isArray(steps) ? steps.length : 0
}

/**
 * 把任意来路的步序夹进 [0, count - 1]。
 * 上界取 count - 1：末步再往前一步就是完成，而完成即关闭，没有多出来的那一格。
 */
export function clampTourStep(step: number | undefined, count: number): number {
  if (count <= 0)
    return 0
  if (step == null || !Number.isFinite(step))
    return 0
  return Math.min(Math.max(Math.trunc(step), 0), count - 1)
}

/** 停在末步了吗。空清单也算末步：一步都没声明时下一步直接完成。 */
export function isTourLastStep(step: number, count: number): boolean {
  return count <= 0 || step >= count - 1
}

/** 取当前步的声明；越界与空清单一律 null。 */
export function currentTourStep(steps: readonly TourStep[] | undefined, step: number): TourStep | null {
  if (!Array.isArray(steps))
    return null
  return steps[step] ?? null
}

function stepOf(prop: PropFn<TourSchema>, raw: number): number {
  return clampTourStep(raw, tourStepCount(prop('steps')))
}

/**
 * 按选择器找目标节点。经 scope 查而不是全局 document：组件可能活在 shadow root 里。
 */
function resolveTourTarget(scope: Scope, step: TourStep | null): HTMLElement | null {
  const selector = step?.target
  if (!selector)
    return null
  try {
    return scope.getRootNode().querySelector<HTMLElement>(selector)
  }
  catch {
    // 作者手写的选择器可能非法；查不到就是不锚定，不让它抛出去
    return null
  }
}

// 步序住在 context 的 cell 里，受控/非受控在 cell 收口，这一路不需要影子事件。
// 开合编进 FSM 状态，走守卫对加 CONTROLLED.* 影子事件加 watch 那一套。
export const tourMachine = createMachine({
  name: 'tour',
  context: ({ prop, cell }) => ({
    step: cell<number>(() => ({
      value: prop('step'),
      defaultValue: prop('defaultStep') ?? 0,
      onChange: step => prop('onStepChange')?.({ step }),
    })),
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 高亮框由 measureSpotlight 量出来写进来；带 isEqual，量到同一个结果不多推一轮重渲
    spotlight: cell<TourSpotlightRect | null>(() => ({ defaultValue: null, isEqual: sameTourSpotlight })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    reanchor: null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  watch: ({ track, prop, context, action }) => {
    // 受控时用户事件只发意图回调、不自改状态；宿主写回 open 后由这里派发 CONTROLLED.* 无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 步序变了要换锚点、重量高亮框；挂在 watch 上，受控时步序是宿主写进来的，不经过走步动作
    track([context.dep('step')], () => action(['reanchorPosition', 'measureSpotlight']))
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 进入 open：定位 → 高亮 → 消解与焦点。退出 open 时按同序清理。
      effects: ['trackPosition', 'trackSpotlight', 'trackLayer'],
      // 几何随展开态一起来一起走，留着上一轮坐标会让下次展开先按旧位置闪一帧
      exit: ['clearGeometry'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'STEP.SET': { actions: ['setStep'] },
        'STEP.PREV': { actions: ['goPrev'] },
        // 末步再走一步即完成：先发 onComplete 再按受控与否关闭
        'STEP.NEXT': [
          { guard: 'isLastStepOpenControlled', actions: ['invokeOnComplete', 'invokeOnClose'] },
          { guard: 'isLastStep', target: 'closed', actions: ['invokeOnComplete', 'invokeOnClose'] },
          { actions: ['goNext'] },
        ],
        'SKIP': [
          { guard: 'isOpenControlled', actions: ['invokeOnSkip', 'invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnSkip', 'invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isLastStep: ({ prop, context }) => {
        const count = tourStepCount(prop('steps'))
        return isTourLastStep(clampTourStep(context.get('step'), count), count)
      },
      // 末步与受控要一起判：守卫是且的关系，而转移数组按顺序取第一条命中的
      isLastStepOpenControlled: ({ prop, context }) => {
        if (prop('open') === undefined)
          return false
        const count = tourStepCount(prop('steps'))
        return isTourLastStep(clampTourStep(context.get('step'), count), count)
      },
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      invokeOnComplete: ({ prop, context }) =>
        prop('onComplete')?.({ step: stepOf(prop, context.get('step')) }),
      invokeOnSkip: ({ prop, context }) =>
        prop('onSkip')?.({ step: stepOf(prop, context.get('step')) }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      // 越界步序在写入口就夹掉，受控宿主拿到的回调值永远可用
      setStep: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'STEP.SET')
          context.set('step', stepOf(prop, e.step))
      },
      // 先把当前值夹回合法区间再加减：清单变短后内部值可能停在已不存在的步上，
      // 而界面显示的是夹过的那一步
      goPrev: ({ context, prop }) => context.set('step', stepOf(prop, stepOf(prop, context.get('step')) - 1)),
      goNext: ({ context, prop }) => context.set('step', stepOf(prop, stepOf(prop, context.get('step')) + 1)),
      clearGeometry: ({ context }) => {
        context.set('position', null)
        context.set('spotlight', null)
      },
      reanchorPosition: ({ refs }) => refs.get('reanchor')?.(),
      /**
       * 量高亮框，量两遍：同步那遍照顾展开态里换步，推迟那遍照顾首帧、目标节点刚挂上来、
       * 以及从收起转到展开的那一拍（效应在状态位落定之前挂载，同步那遍读到的还是旧状态）。
       * cell 带 isEqual，两遍量到同一个结果不多推一轮重渲。
       */
      measureSpotlight: ({ prop, context, scope, state, flush }) => {
        const run = (): void => {
          // 收起态不留高亮框：退出 open 的那一拍 flush 回调可能还没跑
          if (state.get() !== 'open') {
            context.set('spotlight', null)
            return
          }
          const step = currentTourStep(prop('steps'), stepOf(prop, context.get('step')))
          const target = resolveTourTarget(scope, step)
          if (!target) {
            context.set('spotlight', null)
            return
          }
          context.set('spotlight', tourSpotlightBox(target.getBoundingClientRect(), prop('spotlightPadding')))
        }
        run()
        flush(run)
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
      trackPosition: ({ refs, prop, context, scope, flush }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let queued = false
        let disposed = false

        const attach = (): void => {
          queued = false
          if (disposed)
            return
          // 换锚点先撤旧订阅：引擎的 autoUpdate 会一直跟着旧目标算
          stop?.()
          stop = undefined
          const floating = refs.get('getFloatingEl')()
          const step = currentTourStep(prop('steps'), stepOf(prop, context.get('step')))
          const target = resolveTourTarget(scope, step)
          // 居中步没有锚点，位置结果一并清掉，否则会留着上一步的坐标
          if (!floating || !target) {
            context.set('position', null)
            return
          }
          stop = engine.attach(
            target,
            floating,
            {
              placement: step?.placement ?? prop('placement') ?? TOUR_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? TOUR_DEFAULT_OFFSET,
              // positioner 渲染成 fixed（见 connect），坐标系必须跟着走视口系，
              // 否则页面一滚气泡就整体偏掉一个 scrollY
              strategy: 'fixed',
            },
            result => context.set('position', result),
          )
        }

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带 hidden、高度为 0，算出的坐标会错位。
        // 同一拍里的多次请求合并成一次。
        const schedule = (): void => {
          if (queued || disposed)
            return
          queued = true
          flush(attach)
        }

        refs.set('reanchor', schedule)
        schedule()

        return () => {
          disposed = true
          refs.set('reanchor', null)
          stop?.()
        }
      },
      /**
       * 高亮框跟随窗口尺寸变化。读 DOM 由 measureSpotlight 自己推迟，这里不必再包一层 flush；
       * disposed 标记仍要留，监听器与 cleanup 之间总有一帧可能被触发。
       */
      trackSpotlight: ({ scope, action }) => {
        let disposed = false
        const win = scope.getWin()
        const onResize = (): void => {
          if (!disposed)
            action(['measureSpotlight'])
        }
        action(['measureSpotlight'])
        win.addEventListener('resize', onResize)
        return () => {
          disposed = true
          win.removeEventListener('resize', onResize)
        }
      },
      // 层与消解层、焦点域绑在同一个效应里，三者生命周期必须一致；
      // 层只在展开期间入栈，常驻会占死栈顶把下面各层的 Escape 堵死。
      trackLayer: ({ refs, prop, scope, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()
        const getContentEl = refs.get('getContentEl')

        const dismiss = createDismissLayer({
          config,
          layer,
          // 两个开关都现读 prop，引导中途改也立刻生效
          onDismiss: (reason) => {
            if (reason === 'escape-key') {
              if (prop('closeOnEscape') ?? true)
                // Escape 走放弃这条路而不是单纯关闭，onSkip 要发出去
                send({ type: 'SKIP' })
              return
            }
            // 指针落在层外、焦点跑到层外都归这一条；closeOnInteractOutside 缺省 false
            if (prop('closeOnInteractOutside') ?? false)
              send({ type: 'CLOSE', src: 'interact-outside' })
          },
        })

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => getContentEl(),
          // 与 aria-modal 一致，焦点陷在浮层里，否则 Tab 一下就到了遮罩背后的页面
          trapped: () => true,
          loop: true,
          // 焦点落在 content 容器本身而不是第一个按钮：读屏念完整段文案，Enter/Space 归下一步管。
          // 容器还没显形时回 null，回非空会被当成焦点已安排好
          initialFocus: () => {
            const el = getContentEl()
            return canTakeFocus(el, scope) ? el : null
          },
          restoreFocus: () => true,
        })

        // 逆序拆：先撤依赖层的两个订阅，最后才把层本身移出栈
        return () => {
          focus.dispose()
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
