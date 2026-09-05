import type { Params } from '@xihan-ui/machine'
import type { TruncateMetrics, TruncateSchema } from './truncate.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<TruncateSchema>()

/** 不给行数时夹一行。 */
export const TRUNCATE_DEFAULT_LINES = 1

/** 压线判定的容差（px）。滚动尺寸与可视尺寸各自取整，恰好放得下的一行会差出 1 来。 */
const EDGE_TOLERANCE = 1

/** 行数归一：向下取整、至少 1；给不出有限数就退回缺省。 */
export function resolveTruncateLines(lines: number | undefined): number {
  if (lines == null || !Number.isFinite(lines))
    return TRUNCATE_DEFAULT_LINES
  return Math.max(1, Math.floor(lines))
}

/** 夹住的这一版有没有被裁掉内容：单行比行内轴，多行比块轴。 */
export function isTruncateOverflowing(metrics: TruncateMetrics, multiline: boolean): boolean {
  return multiline
    ? metrics.scrollHeight > metrics.clientHeight + EDGE_TOLERANCE
    : metrics.scrollWidth > metrics.clientWidth + EDGE_TOLERANCE
}

/** 盒子里的文字，连续空白压成一个空格——原生提示照 HTML 的排版规则念，不带模板里的缩进与换行。 */
function readText(el: HTMLElement): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** 量测用得上的那几件。 */
type MeasureParams = Pick<Params<TruncateSchema>, 'refs' | 'prop' | 'context' | 'state'>

/** 量一次，结论有变才写回并通知。 */
function runMeasure(p: MeasureParams): void {
  // 铺开态量不出东西：裁剪已经撤掉，两个尺寸恒相等。「会不会被裁」问的是夹住的那一版，
  // 所以这里原地留住上一次的结论，等收回去再量
  if (p.state.matches('open'))
    return
  const el = p.refs.get('getRootEl')()
  // 无布局环境量不到尺寸：结论留在初值
  if (!el)
    return
  p.context.set('text', readText(el))
  const next = isTruncateOverflowing(el, resolveTruncateLines(p.prop('lines')) > 1)
  if (next === p.context.get('overflowing'))
    return
  p.context.set('overflowing', next)
  p.prop('onOverflowChange')?.({ overflowing: next })
}

/**
 * 省略机器。
 *
 * 量测全在效应里做：只有 DOM 知道这段字此刻被夹掉了没有。机器持有量出来的结论与展开态，
 * connect 只读结果。受控（open 给定）时用户事件只发意图、不自改状态，
 * 由 watch 派发 CONTROLLED.* 回写。
 */
export const truncateMachine = createMachine({
  name: 'truncate',
  context: ({ cell }) => ({
    // 量测结果不受控，翻面时经 onOverflowChange 通知
    overflowing: cell<boolean>(() => ({ defaultValue: false })),
    text: cell<string>(() => ({ defaultValue: '' })),
  }),
  refs: () => ({
    getRootEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  effects: ['trackOverflow'],
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    // 换行数就是换了一把尺，上一次的结论作不得数
    track([() => prop('lines')], () => action(['measureSoon']))
  },
  on: {
    MEASURE: { actions: ['measure'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      on: {
        // 收回去要重量：夹住的那一版才是判据，而它这会儿才刚刚回来
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose', 'measureSoon'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed', actions: ['measureSoon'] },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
    },
    actions: {
      measure: params => runMeasure(params),

      /** 推迟一拍再量：状态刚改，这一帧的裁剪还没提交到 DOM。 */
      measureSoon: params => params.flush(() => runMeasure(params)),

      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 只在受控（open 为布尔）时回写；变回 undefined = 转非受控，不强制收回
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      /**
       * 溢出观察器：容器尺寸与盒内文字任一变化都重量一次。
       *
       * 推迟一拍再挂：挂载这一刻角色节点未必就位，量到的全是零。挂上之后立刻量一次，
       * 不等第一次变化——一进来就已经被裁掉的情形也要接住。
       */
      trackOverflow: ({ refs, scope, send, flush }) => {
        let disposed = false
        let stop: VoidFunction | undefined

        flush(() => {
          if (disposed)
            return
          const el = refs.get('getRootEl')()
          if (!el)
            return
          const win = scope.getWin()
          // 盒子变宽变窄会改一行装得下多少字。无布局环境没有 ResizeObserver，退回只靠内容变化触发
          const resize = typeof win.ResizeObserver === 'function'
            ? new win.ResizeObserver(() => send({ type: 'MEASURE' }))
            : null
          resize?.observe(el)
          // 文字换了而盒子尺寸没变时 ResizeObserver 不响：夹住的盒子宽高是定死的，变的只有内容
          const mutate = typeof win.MutationObserver === 'function'
            ? new win.MutationObserver(() => send({ type: 'MEASURE' }))
            : null
          // 只盯内容不盯属性：属性是本机器自己写上去的，盯了就成了自己触发自己
          mutate?.observe(el, { characterData: true, childList: true, subtree: true })
          send({ type: 'MEASURE' })

          stop = () => {
            resize?.disconnect()
            mutate?.disconnect()
          }
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
    },
  },
})
