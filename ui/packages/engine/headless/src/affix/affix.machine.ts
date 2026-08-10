import type { ScrollTrackerHandle } from '@xihan-ui/behavior'
import type { AffixPin, AffixSchema, AffixSide, AffixSize } from './affix.types'
import { createScrollTracker, readViewportRect } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<AffixSchema>()

/** 两条边都没给时的缺省：贴上边、不留空隙。 */
export const AFFIX_DEFAULT_OFFSET = 0

/** 压线判定的容差（px）。布局尺寸带小数，严格比较会让判定在临界点上来回抖。 */
const EDGE_TOLERANCE = 0.5

/** 判定线的输入：占位盒相对可视区上边的两条边，与可视区自身的块轴尺寸。 */
export interface AffixGeometry {
  /** 贴哪条边。 */
  side: AffixSide
  /** 距那条边的距离（px）。 */
  offset: number
  /** 占位盒上边相对可视区上边的距离（px），可以为负。 */
  start: number
  /** 占位盒下边相对可视区上边的距离（px）。 */
  end: number
  /** 可视区的块轴尺寸（px）。 */
  viewport: number
}

/** 占位盒是不是已经越过判定线，该把 content 钉住了。 */
export function isAffixed(g: AffixGeometry): boolean {
  return g.side === 'top'
    ? g.start <= g.offset + EDGE_TOLERANCE
    : g.end >= g.viewport - g.offset - EDGE_TOLERANCE
}

/** 两次落位是否一样。作 cell 的 isEqual 用：每次结算都产出新对象。 */
function samePin(a: AffixPin | null, b: AffixPin | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.side === b.side && a.offset === b.offset && a.left === b.left && a.width === b.width
}

function sameSize(a: AffixSize | null, b: AffixSize | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.width === b.width && a.height === b.height
}

/**
 * 吸附机器。
 *
 * 判定与量测全在效应里做：DOM 才知道占位盒此刻在哪、可视区有多大。
 * 效应把结算好的一帧（吸不吸、钉在哪、占位多大）整个送进来，机器只负责落状态与回调。
 */
export const affixMachine = createMachine({
  name: 'affix',
  context: ({ cell }) => ({
    // 量测结果不受控、不对外通知
    pin: cell<AffixPin | null>(() => ({ defaultValue: null, isEqual: samePin })),
    placeholder: cell<AffixSize | null>(() => ({ defaultValue: null, isEqual: sameSize })),
  }),
  refs: () => ({
    getRootEl: () => null,
    getTargetEl: () => null,
  }),
  initialState: () => 'released',
  effects: ['trackScroll'],
  states: {
    released: {
      on: {
        'SCROLL.RESOLVE': [
          { guard: 'shouldAffix', target: 'affixed', actions: ['applyGeometry', 'invokeOnChange'] },
          { actions: ['applyGeometry'] },
        ],
      },
    },
    affixed: {
      on: {
        'SCROLL.RESOLVE': [
          { guard: 'shouldRelease', target: 'released', actions: ['applyGeometry', 'invokeOnChange'] },
          { actions: ['applyGeometry'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      shouldAffix: ({ event }) => {
        const e = event.current()
        return e.type === 'SCROLL.RESOLVE' && e.affixed
      },
      shouldRelease: ({ event }) => {
        const e = event.current()
        return e.type === 'SCROLL.RESOLVE' && !e.affixed
      },
    },
    actions: {
      applyGeometry: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SCROLL.RESOLVE')
          return
        context.set('pin', e.pin)
        context.set('placeholder', e.placeholder)
      },
      invokeOnChange: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'SCROLL.RESOLVE')
          return
        prop('onAffixChange')?.({ affixed: e.affixed })
      },
    },
    effects: {
      /**
       * 滚动观察器：每次滚动重量占位盒与可视区，结算出这一帧该不该吸住。
       *
       * 推迟一拍再挂：挂载这一刻角色节点未必就位，量到的全是零。
       * 挂上之后立刻结算一次，不等第一次滚动——页面一进来就已经滚在半路的情形也要接住。
       */
      trackScroll: ({ refs, prop, scope, send, flush }) => {
        let disposed = false
        let tracker: ScrollTrackerHandle | undefined

        const resolve = (): void => {
          if (disposed)
            return
          const root = refs.get('getRootEl')()
          if (!root)
            return
          const container = refs.get('getTargetEl')()
          const view = readViewportRect(container, scope)
          const rect = root.getBoundingClientRect()
          // 给了 offsetBottom 就改贴下边，两条都没给按贴上边 0 处理
          const bottom = prop('offsetBottom')
          const side: AffixSide = bottom == null ? 'top' : 'bottom'
          const offset = (side === 'top' ? prop('offsetTop') : bottom) ?? AFFIX_DEFAULT_OFFSET
          const affixed = isAffixed({
            side,
            offset,
            start: rect.top - view.top,
            end: rect.bottom - view.top,
            viewport: view.height,
          })
          // 钉住的距离按窗口视口算：content 用 fixed 定位，参照系是视口而不是滚动容器
          const page = readViewportRect(null, scope)
          send({
            type: 'SCROLL.RESOLVE',
            affixed,
            pin: affixed
              ? {
                  side,
                  offset: side === 'top'
                    ? view.top + offset
                    : page.height - (view.top + view.height) + offset,
                  left: rect.left,
                  width: rect.width,
                }
              : null,
            // 占位盒吸住时带着写死的高度，量到的仍是脱流前那一份，不会塌下去
            placeholder: { width: rect.width, height: rect.height },
          })
        }

        flush(() => {
          if (disposed)
            return
          tracker = createScrollTracker({
            scope,
            container: () => refs.get('getTargetEl')(),
            onChange: resolve,
          })
          resolve()
        })

        return () => {
          disposed = true
          tracker?.dispose()
        }
      },
    },
  },
})
