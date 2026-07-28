import type { Placement, PositionResult, Scope } from '@xihan-ui/core'
import type { PropFn } from '@xihan-ui/machine'
import type { TourSchema, TourSpotlightRect, TourStep } from './tour.types'
import { createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { sameTourSpotlight, tourSpotlightBox } from './tour.spotlight'

const { createMachine } = setup<TourSchema>()

/** 未指定 placement 时的落位：气泡挂在目标下方。 */
export const TOUR_DEFAULT_PLACEMENT: Placement = 'bottom'

/** 气泡与目标之间的缺省间距（px）：比浮层类稍大，得给高亮框的留白让出位置。 */
export const TOUR_DEFAULT_OFFSET = 12

/** 总步数。作者给什么都得先落成非负整数。 */
export function tourStepCount(steps: readonly TourStep[] | undefined): number {
  return Array.isArray(steps) ? steps.length : 0
}

/**
 * 把任意来路的步序夹进 [0, count - 1]。
 *
 * 上界取 count - 1 而不是 count：引导没有"全部走完还停在这儿"的位置——
 * 末步再往前一步就是完成，而完成即关闭。多留一格的话会出现一个没有任何步骤声明、
 * 却仍然显示着的引导浮层。
 */
export function clampTourStep(step: number | undefined, count: number): number {
  if (count <= 0)
    return 0
  if (step == null || !Number.isFinite(step))
    return 0
  return Math.min(Math.max(Math.trunc(step), 0), count - 1)
}

/**
 * 停在末步了吗。空清单也算末步：一步都没声明时"下一步"该直接完成，
 * 否则那个按钮按下去什么都不会发生。
 */
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
 * 按选择器找目标节点。经 scope 查而不是全局 document：组件可能活在 shadow root 里，
 * 那时 document.querySelector 一个也找不到。
 */
function resolveTourTarget(scope: Scope, step: TourStep | null): HTMLElement | null {
  const selector = step?.target
  if (!selector)
    return null
  try {
    return scope.getRootNode().querySelector<HTMLElement>(selector)
  }
  catch {
    // 作者手写的选择器可能是非法的（拼错、忘了转义）。查不到就是不锚定，
    // 不该让一个字符串写错把整条引导炸掉
    return null
  }
}

/**
 * 这个节点此刻真的接得住焦点吗。
 *
 * 焦点域的 initialFocus 一旦返回非空就当场认定"焦点已安排好"，不再重试——
 * 而进入展开态的这一刻 content 未必就绪：可能还带着收起态的 hidden / display:none，
 * 也可能连 tabindex 都还没写上（适配器要等这一帧提交完才接线）。
 * 这两种情况下 focus() 都是空操作，必须回 null 把机会留给下一帧。
 *
 * tabindex 既是"能不能聚焦"的硬条件（div 没有它一律不可聚焦），
 * 也正好是"适配器接过线没有"的信号——它是连接层写上去的。
 */
function canTakeFocus(el: HTMLElement | null, scope: Scope): boolean {
  if (!el || !el.hasAttribute('tabindex'))
    return false
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.hidden)
      return false
    if (scope.getComputedStyle(node).display === 'none')
      return false
  }
  return true
}

// 步序住在 context 的 cell 里（cell 本身就是受控/非受控的收口点：step prop 给定即受控，
// 读直取 prop、写只发 onStepChange 不落内部值），因此这一路不需要影子事件。
// 开合是布尔态、编进 FSM 状态，走「守卫对 + CONTROLLED.* 影子事件 + watch」那一套。
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
    // 受控（open prop 给定）时，用户事件只发意图回调、不自改状态；宿主写回 open 后
    // 由此 watch 追踪 open 变化，派发影子事件 CONTROLLED.* 无条件回写状态。
    track([() => prop('open')], () => action(['syncOpen']))
    // 步序变了要换锚点、重量高亮框。挂在 watch 而不是各个走步动作上：
    // 受控时步序是宿主从外面写进来的，根本不经过那几个动作。
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
      // 几何随展开态一起来一起走：留着上一轮的坐标，下次展开会先按旧位置闪一帧
      exit: ['clearGeometry'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'STEP.SET': { actions: ['setStep'] },
        'STEP.PREV': { actions: ['goPrev'] },
        // 末步再走一步 = 完成：先发 onComplete 再按受控与否关闭。
        // 受控那一路只发意图，状态等宿主写回 open 再转
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
      // 两条边界得一起判：末步 + 受控 = 只发意图不转移。拆成两条转移写不出来，
      // 因为守卫是"且"的关系，而转移数组是按顺序取第一条命中的
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
      // 越界步序在写入口就夹掉：受控宿主拿到的回调值永远是可用的步
      setStep: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'STEP.SET')
          context.set('step', stepOf(prop, e.step))
      },
      // 先把当前值夹回合法区间再加减：清单变短之后内部值可能停在一个已不存在的步上，
      // 而界面显示的是夹过的那一步（connect 同样夹），不夹的话用户得连点好几下才看得到反应
      goPrev: ({ context, prop }) => context.set('step', stepOf(prop, stepOf(prop, context.get('step')) - 1)),
      goNext: ({ context, prop }) => context.set('step', stepOf(prop, stepOf(prop, context.get('step')) + 1)),
      clearGeometry: ({ context }) => {
        context.set('position', null)
        context.set('spotlight', null)
      },
      reanchorPosition: ({ refs }) => refs.get('reanchor')?.(),
      /**
       * 量高亮框。量两遍：同步那遍照顾"已经在展开态里换步"的常规情形，
       * 推迟那遍照顾三件事——首帧（Vue 侧此刻还没提交渲染、WC 侧的角色节点要等首次 wire 才认得出）、
       * 换步之后目标节点刚被作者挂上来、以及从收起转到展开的那一拍：
       * 效应是在状态位落定之前挂载的，同步那遍读到的还是旧状态，会被下面的收起态判据挡回去。
       * cell 带 isEqual，两遍量到同一个结果不多推一轮重渲。
       */
      measureSpotlight: ({ prop, context, scope, state, flush }) => {
        const run = (): void => {
          // 收起态不该留着高亮框：退出 open 的那一拍 flush 回调可能还没跑
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
          // 换锚点先撤旧订阅：引擎的 autoUpdate 会一直跟着旧目标算，留着就是两套位置轮流写
          stop?.()
          stop = undefined
          const floating = refs.get('getFloatingEl')()
          const step = currentTourStep(prop('steps'), stepOf(prop, context.get('step')))
          const target = resolveTourTarget(scope, step)
          // 居中步没有锚点：位置结果一并清掉，否则会留着上一步的坐标与放置位
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
            },
            result => context.set('position', result),
          )
        }

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身的尺寸——placement=top 会正好错位一个浮层高度。
        // 同一拍里的多次请求合并成一次：展开那一下坐标与状态是一起变的，否则要白挂两回。
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
       * 高亮框跟随窗口尺寸变化。只挂一个监听器、不在挂载那一刻读 DOM
       * （读 DOM 由 measureSpotlight 自己推迟），因此这里不必再包一层 flush；
       * disposed 标记仍要留：监听器与 cleanup 之间总有一帧可能被触发。
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
      // 层的入栈出栈与消解层、焦点域绑在同一个效应里：三者生命周期必须完全一致。
      // 层只在展开期间入栈——消解层只让栈顶响应 Escape，若层在挂载期就注册、与开合无关地
      // 常驻栈里，同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死。
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
          // 关不关在这里判定：两个开关都现读 prop，引导中途改也立刻生效
          onDismiss: (reason) => {
            if (reason === 'escape-key') {
              if (prop('closeOnEscape') ?? true)
                // Escape 走的是"放弃"这条路而不是单纯关闭：用户按下它就是不想看了，
                // onSkip 该发出去，作者才有机会记下"这个人没走完"
                send({ type: 'SKIP' })
              return
            }
            // 指针落在层外、焦点跑到层外都归这一条；引导默认不认（closeOnInteractOutside 缺省 false）
            if (prop('closeOnInteractOutside') ?? false)
              send({ type: 'CLOSE', src: 'interact-outside' })
          },
        })

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => getContentEl(),
          // aria-modal 说了"引导期间页面其余部分不该被误触"，焦点就得陷在浮层里，
          // 否则 Tab 一下人就到了背后那张被遮罩盖住的页面上
          trapped: () => true,
          loop: true,
          // 焦点落在 content 容器本身而不是里面第一个按钮：读屏会念完整段引导文案，
          // 且 Enter/Space 此刻归"下一步"管（落在按钮上就成了按那个按钮）。
          // 容器还没显形时回 null，把机会留给下一帧——回非空会被当成焦点已安排好
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
