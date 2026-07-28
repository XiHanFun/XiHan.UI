import type { Scope } from '@xihan-ui/core'
import type { AnchorIndicatorRect, AnchorSchema, AnchorTargetOffset } from './anchor.types'
import { itemValue, queryItems } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { anchorItemQuery } from './anchor.anatomy'

const { createMachine } = setup<AnchorSchema>()

/** 判定线默认贴着滚动容器视口的顶边。 */
export const ANCHOR_DEFAULT_OFFSET = 0

/**
 * 压线判定的容差（px）。布局尺寸是小数：平滑滚动停稳时目标顶边常落在 offset + 0.34
 * 这种位置上，严格比较会判成"还没到"，高亮就卡在上一节不动。
 */
const EDGE_TOLERANCE = 1

/**
 * 平滑滚动期间不采信观察器结果的兜底时长（ms）。
 * 正常情况下滚到目标那一刻观察器自己报出目标 id，锁当场解开；
 * 这个计时器只兜住"永远滚不到"的那几种（目标被删、容器已经到底、用户中途反向滚）。
 */
const SCROLL_LOCK_MS = 1000

/**
 * 判定哪一节算"当前"。纯函数：调用方把量好的位置递进来，这里不碰 DOM，
 * 因此可以被逐条断言（观察器那一层只负责取数）。
 *
 * @param targets 按文档序排好的目标区块；顺序错了结果就错，取的是"最后一个越过判定线的"
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
  // 已经滚到底：末尾那几节可能都很短，谁也越不过判定线。
  // 不特判的话末条永远高亮不了——用户明明正看着它。
  if (atEnd)
    return targets[targets.length - 1]!.value
  let active: string | null = null
  for (const target of targets) {
    if (target.top - offset <= EDGE_TOLERANCE)
      active = target.value
  }
  // 一节都没越过 = 还停在首节上方的内容里（大图、简介）。
  // 此时硬把首条点亮就是让"当前位置"说谎，宁可谁都不亮。
  return active
}

/** 两次量测是否一样。不给 isEqual 的话每次量测都换一个新对象，版本号会一直空转自增。 */
function sameRect(a: AnchorIndicatorRect | null, b: AnchorIndicatorRect | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.blockStart === b.blockStart && a.blockSize === b.blockSize
    && a.inlineStart === b.inlineStart && a.inlineSize === b.inlineSize
}

/**
 * 按 id 取目标区块。走 getRootNode().getElementById 而不是 scope.getById：
 * 后者拿 CSS.escape 拼属性选择器，而 CSS 这个全局在无头 DOM 环境里常常缺席（缺了当场抛）。
 * 这条路同样经 Scope 拿 root（shadow 里照样找得到），还省掉一次转义。
 */
function findTargetEl(scope: Scope, id: string): HTMLElement | null {
  return scope.getRootNode().getElementById(id)
}

/** 目标 id 清单：作者给了就用作者的，没给就按渲染出来的链接现查（不缓存节点数组）。 */
function collectTargetIds(targets: readonly string[] | undefined, list: HTMLElement | null): string[] {
  if (targets && targets.length > 0)
    return [...targets]
  return queryItems(list, anchorItemQuery)
    .map(el => itemValue(el))
    .filter((v): v is string => v != null)
}

/**
 * 滚动容器是否已经到底。
 * 先问"能不能滚"：内容撑不满容器时 scrollHeight 与 clientHeight 相等，
 * 不先挡一道的话空页面会恒判为"到底了"，末条锚点便一直亮着。
 */
function isScrolledToEnd(container: HTMLElement | null, win: Window): boolean {
  if (container) {
    if (container.scrollHeight <= container.clientHeight)
      return false
    return container.scrollTop + container.clientHeight >= container.scrollHeight - EDGE_TOLERANCE
  }
  const doc = win.document.documentElement
  if (doc.scrollHeight <= win.innerHeight)
    return false
  return win.scrollY + win.innerHeight >= doc.scrollHeight - EDGE_TOLERANCE
}

// 激活值住在 context 的 cell 里、不编进状态：cell 本身就是受控/非受控的收口点
// （value prop 给定即受控，读直取 prop，写只发 onValueChange 不落内部值），
// 因此这一路不需要影子事件与受控守卫。
// 状态只管一件事：平滑滚动途中要不要采信观察器。
export const anchorMachine = createMachine({
  name: 'anchor',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 量测结果不受控、不对外通知：它只服务指示条的内联样式
    indicator: cell<AnchorIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameRect })),
  }),
  refs: () => ({
    getScrollEl: () => null,
    getListEl: () => null,
  }),
  initialState: () => 'idle',
  // 挂载即量一次：defaultValue 给了初始激活项时，指示条首帧就该在位
  entry: ['measureIndicator'],
  // 观察器与组件同生共死：它不随激活值开合，收起态无从谈起
  effects: ['trackScroll'],
  watch: ({ track, context, action }) => {
    // 内部结算与宿主受控回写都要重量一次：指示条钉在"当前那条"上，值一变它就得跟着搬
    track([context.dep('value')], () => action(['measureIndicator']))
  },
  states: {
    idle: {
      on: {
        'SPY.RESOLVE': { actions: ['setValue'] },
        // 点了就当场切过去，不等观察器：平滑滚动要几百毫秒才到位，
        // 那段时间里高亮若还留在原处，看上去就像"点了没反应"
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
        // 滚到目标了才解锁；途中扫过的那些节说的不是用户的意图
        'SPY.RESOLVE': { guard: 'isTargetReached', target: 'idle' },
        // 锁着的时候又点了别处：换目标重新滚，计时器跟着重开（reenter 才会重挂效应）
        'LINK.CLICK': [
          { guard: 'isSmooth', target: 'scrolling', reenter: true, actions: ['setValue', 'scrollToTarget'] },
          { target: 'idle', actions: ['setValue'] },
        ],
        'after.scrollLock': { target: 'idle' },
        // 程序化改写是明确的意图，比这把锁优先
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
        // 不归一的话"观察器报 null、当前也没有激活项"这一路永远判不成立，锁只能等兜底计时器
        return e.type === 'SPY.RESOLVE' && e.value === (context.get('value') ?? null)
      },
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'SPY.RESOLVE' || e.type === 'LINK.CLICK' || e.type === 'VALUE.SET')
          context.set('value', e.value)
      },

      /**
       * 滚到目标区块。跑在点击那一刻——此时布局已经稳定，两个适配器看到的是同一份活 DOM，
       * 所以这里的量测不必推迟（推迟反而会错过"用户点的是当时那个位置"）。
       *
       * 不走 scrollIntoView：它没法把吸顶栏的高度让出来，目标会正好被栏压住。
       */
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
       * 量指示条。量两遍：同步那遍照顾"链接早就在 DOM 里"的常规情形，
       * 推迟那遍照顾首帧（WC 侧的身份标记要等首次 wire 才写上，这一刻一条链接都查不到）。
       * cell 带 isEqual，两遍量到同一个结果不会多推一次更新。
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
            // 起始缘按逻辑方向算：RTL 下"起始"在右边，用左边缘量的话指示条会跑到列的另一侧
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

      /**
       * 滚动观察器。"哪一条算当前"是 DOM 事实，只有这里量得到——
       * 连接层是 (state, context, prop, 部件声明) 的纯函数，读不了滚动位置。
       *
       * 用滚动监听而不是 IntersectionObserver：判定线是一条线，要的是
       * "最后一个越过它的区块"这个全局结论，而交叉观察器只在穿越那一刻给出单个区块的进出，
       * 想还原成全局结论仍得把所有区块的位置摆在一起算——那就绕回来了。
       * 现代浏览器本就把 scroll 事件合并到每帧一次，每帧读几个 rect 的代价可以接受。
       */
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
            // 目标还没渲染出来就跳过：清单里多写一个 id 不该让整条判定失效
            if (el)
              offsets.push({ value: id, top: el.getBoundingClientRect().top - originTop })
          }
          // 一个目标都没找到 = 区块还没渲染出来（异步内容、路由刚切过来）。
          // 这时报 null 会把作者给的初值当场抹掉，宁可什么都不说
          if (offsets.length === 0)
            return
          send({
            type: 'SPY.RESOLVE',
            value: resolveActiveAnchor(offsets, prop('offset') ?? ANCHOR_DEFAULT_OFFSET, isScrolledToEnd(container, win)),
          })
        }

        // 推迟一拍再挂：这一刻链接与目标区块都还没进 DOM（WC 侧要等首次 wire），
        // 滚动容器的 ref 也可能还没回填，现在挂就会永远挂在窗口上。
        flush(() => {
          if (disposed)
            return
          const source: EventTarget = refs.get('getScrollEl')() ?? win
          const onScroll = (): void => resolve()
          // 窗口尺寸变了两件事都得重来：区块重排会改判定线两侧的归属，
          // 目录自己换行也会让指示条量到的那个盒子失效——只重算归属的话，
          // 激活项没变就没人去重量，指示条会一直停在旧位置上
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
