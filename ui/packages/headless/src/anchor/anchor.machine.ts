import type { Scope } from '@xihan-ui/core'
import type { AnchorIndicatorRect, AnchorSchema, AnchorTargetOffset } from './anchor.types'
import { itemValue, queryItems } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { anchorItemQuery } from './anchor.anatomy'

const { createMachine } = setup<AnchorSchema>()

/** 判定线默认贴着滚动容器视口的顶边。 */
export const ANCHOR_DEFAULT_OFFSET = 0

/** 压线判定的容差（px）。布局尺寸带小数，平滑滚动停稳时目标顶边常落在 offset+0.34 这类位置，严格比较会判成还没到。 */
const EDGE_TOLERANCE = 1

/** 平滑滚动期间不采信观察器结果的兜底时长（ms）。 */
const SCROLL_LOCK_MS = 1000

/**
 * 判定哪一节算"当前"。
 *
 * @param targets 按文档序排好的目标区块，取最后一个越过判定线的
 * @param offset 判定线距容器视口顶边的距离
 * @param atEnd 滚动容器是否已经到底
 */
export function resolveActiveAnchor(
  targets: readonly AnchorTargetOffset[],
  offset: number,
  atEnd: boolean,
): string | null {
  if (targets.length === 0)
    return null
  // 已滚到底：末尾几节可能都很短，谁也越不过判定线，不特判则末条永远高亮不了
  if (atEnd)
    return targets[targets.length - 1]!.value
  let active: string | null = null
  for (const target of targets) {
    if (target.top - offset <= EDGE_TOLERANCE)
      active = target.value
  }
  // 一节都没越过 = 还停在首节上方（大图、简介），此时宁可谁都不亮
  return active
}

/** 两次量测是否一样。作 cell 的 isEqual 用：不给的话每次量测都是新对象，版本号会一直空转自增。 */
function sameRect(a: AnchorIndicatorRect | null, b: AnchorIndicatorRect | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.blockStart === b.blockStart && a.blockSize === b.blockSize
    && a.inlineStart === b.inlineStart && a.inlineSize === b.inlineSize
}

/** 按 id 取目标区块。 */
function findTargetEl(scope: Scope, id: string): HTMLElement | null {
  return scope.getRootNode().getElementById(id)
}

/** 目标 id 清单：优先用作者给的，否则按渲染出来的链接现查。 */
function collectTargetIds(targets: readonly string[] | undefined, list: HTMLElement | null): string[] {
  if (targets && targets.length > 0)
    return [...targets]
  return queryItems(list, anchorItemQuery)
    .map(el => itemValue(el))
    .filter((v): v is string => v != null)
}

/** 滚动容器是否已经到底；内容撑不满容器时（scrollHeight == clientHeight）视为未到底，否则空页面会恒判到底。 */
function isScrolledToEnd(container: HTMLElement | null, win: Window): boolean {
  if (container) {
    if (container.scrollHeight <= container.clientHeight)
      return false
    return container.scrollTop + container.clientHeight >= container.scrollHeight - EDGE_TOLERANCE
  }
  // 视口高度取 documentElement.clientHeight 而非 win.innerHeight：后者把横向滚动条那条也算进高度，
  // 而 scrollHeight 不含它，口径一混、页面一出横向滚动条就会提前十几像素判成到底
  const doc = win.document.documentElement
  const viewport = doc.clientHeight
  if (doc.scrollHeight <= viewport)
    return false
  return win.scrollY + viewport >= doc.scrollHeight - EDGE_TOLERANCE
}

export const anchorMachine = createMachine({
  name: 'anchor',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 量测结果不受控、不对外通知
    indicator: cell<AnchorIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameRect })),
  }),
  refs: () => ({
    getScrollEl: () => null,
    getListEl: () => null,
  }),
  initialState: () => 'idle',
  // 挂载即量一次指示条
  entry: ['measureIndicator'],
  effects: ['trackScroll'],
  watch: ({ track, context, action }) => {
    // 激活值一变就重量指示条
    track([context.dep('value')], () => action(['measureIndicator']))
  },
  states: {
    idle: {
      on: {
        'SPY.RESOLVE': { actions: ['setValue'] },
        // 点击当场切换激活值，不等观察器
        'LINK.CLICK': [
          { guard: 'isSmooth', target: 'scrolling', actions: ['setValue', 'scrollToTarget'] },
          { actions: ['setValue'] },
        ],
        'VALUE.SET': { actions: ['setValue'] },
      },
    },
    scrolling: {
      effects: ['waitForScrollLock'],
      on: {
        // 滚到目标才解锁，途中扫过的区块不采信
        'SPY.RESOLVE': { guard: 'isTargetReached', target: 'idle' },
        // 锁定期间再点别处：换目标重新滚，reenter 重挂计时器
        'LINK.CLICK': [
          { guard: 'isSmooth', target: 'scrolling', reenter: true, actions: ['setValue', 'scrollToTarget'] },
          { target: 'idle', actions: ['setValue'] },
        ],
        'after.scrollLock': { target: 'idle' },
        // 程序化改写优先于滚动锁
        'VALUE.SET': { target: 'idle', actions: ['setValue'] },
      },
    },
  },
  implementations: {
    guards: {
      isSmooth: ({ prop }) => !!prop('smooth'),
      isTargetReached: ({ context, event }) => {
        const e = event.current()
        // value 与 defaultValue 皆缺省时 cell 初值是 undefined，先归一成 null 再比：
        // 不归一则"观察器报 null、当前也没有激活项"这一路永远判不成立，锁只能等兜底计时器
        return e.type === 'SPY.RESOLVE' && e.value === (context.get('value') ?? null)
      },
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'SPY.RESOLVE' || e.type === 'LINK.CLICK' || e.type === 'VALUE.SET')
          context.set('value', e.value)
      },

      /** 滚到目标区块，按 offset 让出吸顶高度。不走 scrollIntoView：它没法让出吸顶栏，目标会正好被栏压住。 */
      scrollToTarget: ({ refs, prop, scope, event }) => {
        const e = event.current()
        if (e.type !== 'LINK.CLICK')
          return
        const target = findTargetEl(scope, e.value)
        if (!target)
          return
        const offset = prop('offset') ?? ANCHOR_DEFAULT_OFFSET
        const top = target.getBoundingClientRect().top
        const container = refs.get('getScrollEl')()
        if (container) {
          const delta = top - container.getBoundingClientRect().top - offset
          container.scrollTo?.({ top: container.scrollTop + delta, behavior: 'smooth' })
          return
        }
        const win = scope.getWin()
        win.scrollTo?.({ top: win.scrollY + top - offset, behavior: 'smooth' })
      },

      /**
       * 量指示条。必须量两遍：同步那遍照顾"链接早就在 DOM 里"的常规情形，推迟那遍照顾首帧
       * （WC 侧的身份标记要等首次 wire 才写上，这一刻一条链接都查不到）。cell 带 isEqual，量到同一结果不会多推更新。
       */
      measureIndicator: ({ refs, prop, context, flush }) => {
        const run = (): void => {
          const list = refs.get('getListEl')()
          const value = context.get('value')
          if (!list || value == null) {
            context.set('indicator', null)
            return
          }
          const link = queryItems(list, anchorItemQuery).find(el => itemValue(el) === value)
          if (!link) {
            context.set('indicator', null)
            return
          }
          const listRect = list.getBoundingClientRect()
          const rect = link.getBoundingClientRect()
          context.set('indicator', {
            blockStart: rect.top - listRect.top,
            blockSize: rect.height,
            // 起始缘按逻辑方向算，RTL 下从右边缘量起
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
      waitForScrollLock: ({ send }) => setTimeoutEffect(() => send({ type: 'after.scrollLock' }), SCROLL_LOCK_MS),

      /** 滚动观察器：每次滚动重量各区块顶边，结算出当前是哪一节。 */
      trackScroll: ({ refs, prop, scope, send, action, flush }) => {
        let disposed = false
        let detach: (() => void) | undefined
        const win = scope.getWin()

        const resolve = (): void => {
          if (disposed)
            return
          const ids = collectTargetIds(prop('targets'), refs.get('getListEl')())
          if (ids.length === 0)
            return
          const container = refs.get('getScrollEl')()
          // 判定原点：整页滚动时是视口顶边，容器滚动时是容器自己的顶边
          const originTop = container ? container.getBoundingClientRect().top : 0
          const offsets: AnchorTargetOffset[] = []
          for (const id of ids) {
            const el = findTargetEl(scope, id)
            if (el)
              offsets.push({ value: id, top: el.getBoundingClientRect().top - originTop })
          }
          // 一个目标都没找到 = 区块还没渲染出来，此时报 null 会把作者给的初值抹掉
          if (offsets.length === 0)
            return
          send({
            type: 'SPY.RESOLVE',
            value: resolveActiveAnchor(offsets, prop('offset') ?? ANCHOR_DEFAULT_OFFSET, isScrolledToEnd(container, win)),
          })
        }

        // 推迟一拍再挂，等链接、目标区块与滚动容器 ref 就位
        flush(() => {
          if (disposed)
            return
          const source: EventTarget = refs.get('getScrollEl')() ?? win
          const onScroll = (): void => resolve()
          // 窗口尺寸变化后归属与指示条位置都要重算
          const onResize = (): void => {
            if (disposed)
              return
            resolve()
            action(['measureIndicator'])
          }
          source.addEventListener('scroll', onScroll, { passive: true })
          win.addEventListener('resize', onResize)
          detach = (): void => {
            source.removeEventListener('scroll', onScroll)
            win.removeEventListener('resize', onResize)
          }
          resolve()
        })

        return () => {
          disposed = true
          detach?.()
        }
      },
    },
  },
})
