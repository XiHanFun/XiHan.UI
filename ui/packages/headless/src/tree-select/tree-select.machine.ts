import type { Placement, PositionResult } from '@xihan-ui/core'
import type { TreeVisibleNode } from '../tree'
import type { TreeSelectFocusIntent, TreeSelectSchema } from './tree-select.types'
import { createDismissLayer, createFocusScope, createTypeahead, isItemDisabled, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { flattenTree } from '../tree'
import { treeSelectBranchQuery, treeSelectItemQuery } from './tree-select.anatomy'

const { createMachine } = setup<TreeSelectSchema>()

/** 未指定 placement 时的落位：浮层沿触发器起始缘展开。定位引擎与 connect 共用这一个缺省。 */
export const TREE_SELECT_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 裸串是单选的简写，内部一律按数组处理；undefined 要原样透传，cell 靠它区分受控与否。 */
function toValues(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  return typeof input === 'string' ? [input] : [...input]
}

/** 选中集合的不变量：单选恒为长度 ≤ 1，多选去重。公开 API 与内部写入都经这里收口。 */
function normalizeSelection(next: readonly string[], multiple: boolean): string[] {
  return multiple ? [...new Set(next)] : next.slice(0, 1)
}

/** 去重且保序：展开集合是一个集合，重复元素没有意义。 */
function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

/**
 * 数组按元素比。默认的 Object.is 在这里不成立：受控时 cell 每次读都要把 prop 归一成
 * 新数组，引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「值其实没变」判成变了，回调便会重复发。
 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * 容器里的全部节点元素（叶子与分支），**按可见序**排列。只在事件那一刻读活 DOM。
 *
 * 顺序刻意不取文档序：收起分支的子节点仍留在文档里（内容常挂 + hidden，不卸载作者节点），
 * 按文档序走方向键会一头扎进看不见的子树。摊平序才是用户眼里的行序。
 */
export function treeSelectNodeEls(
  container: HTMLElement | null,
  rows: readonly TreeVisibleNode[],
): HTMLElement[] {
  if (!container)
    return []
  const byValue = new Map<string, HTMLElement>()
  for (const el of [...queryItems(container, treeSelectBranchQuery), ...queryItems(container, treeSelectItemQuery)]) {
    const value = itemValue(el)
    if (value != null && !byValue.has(value))
      byValue.set(value, el)
  }
  return rows
    .map(row => byValue.get(row.value))
    .filter((el): el is HTMLElement => el != null)
}

/** 按值取节点元素，不问可见与否：收起子树里的节点仍在文档中，只是带着 hidden。 */
export function findTreeSelectNodeEl(container: HTMLElement | null, value: string | null): HTMLElement | null {
  if (!container || value == null)
    return null
  for (const q of [treeSelectBranchQuery, treeSelectItemQuery]) {
    const hit = queryItems(container, q).find(el => itemValue(el) === value)
    if (hit)
      return hit
  }
  return null
}

// 选中集合与展开集合都住在 context 的 cell 里（cell 本身就是受控/非受控的收口点：
// 给定 prop 即受控，读直取 prop、写只发回调不落内部值），因此这两路不需要影子事件。
// 开合是布尔态、编进 FSM 状态，走「守卫对 + CONTROLLED.* 影子事件 + watch」那一套。
export const treeSelectMachine = createMachine({
  name: 'tree-select',
  context: ({ prop, cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    expandedValue: cell<string[]>(() => ({
      value: prop('expandedValue'),
      defaultValue: prop('defaultExpandedValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onExpandedChange')?.({ value }),
    })),
    // 焦点锚点不受控、不对外通知：它只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<TreeSelectFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    typeahead: createTypeahead(),
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 开合受控（open prop 给定）时用户事件只发意图、不自改状态；宿主写回 open 后由 watch
  // 派发影子事件 CONTROLLED.* 无条件回写。值与展开集合受控走 cell，不需要这套。
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
  },
  // 这几件事与开合无关，两个状态里都得认：程序化改值、改展开集合、以及记焦点锚点。
  // 展开态另行声明的 NODE.SELECT 会盖过这里那一条（单选选完还要收起）。
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'EXPANDED.SET': { actions: ['setExpanded'] },
    'BRANCH.EXPAND': { actions: ['expandBranch'] },
    'BRANCH.COLLAPSE': { actions: ['collapseBranch'] },
    'BRANCH.TOGGLE': { actions: ['toggleBranch'] },
    'NODE.FOCUS': { actions: ['setFocusedValue'] },
    'NODE.SELECT': { actions: ['selectNode'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知。
        // 落点意图与焦点归还策略两条都先记进 context：受控时状态要等宿主写回 open 才转移，
        // 那一拍走的是 CONTROLLED.OPEN，读不到当初那个按键事件。
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 锚点在进入展开态时就位：节点常挂（收起时只是随 content 一起 hidden），
      // 此刻查到的顺序即最终顺序。锚点定了才有节点认领 tabindex=0，焦点域随后把焦点交给它。
      entry: ['setInitialFocusedValue'],
      // 收起就丢缓冲：否则下次展开第一个字母会被拼进上一轮的查询串
      exit: ['clearFocusedValue', 'clearTypeahead'],
      // 进入 open：定位 → 消解 → 焦点。退出 open 时按同序清理，焦点归还发生在消解层撤销之后。
      effects: ['trackPosition', 'trackLayer'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        // 多选选完接着挑：浮层不收起，焦点也留在树里。
        // 单选选完即收起，走与 CLOSE 相同的收口（焦点随焦点域撤销归还 trigger）
        'NODE.SELECT': [
          { guard: 'isMultiple', actions: ['selectNode'] },
          { guard: 'isOpenControlled', actions: ['selectNode', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['selectNode', 'setReturnFocus', 'invokeOnClose'] },
        ],
        // 持有焦点的节点被移出 DOM：锚点已悬空，就地按当前活节点重挑一个，
        // 否则没有节点认领 tabindex=0、方向键也失去起点
        'NODE.LOST': { actions: ['clearFocusedValue', 'setInitialFocusedValue'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isMultiple: ({ prop }) => !!prop('multiple'),
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'OPEN' || e.type === 'TOGGLE')
          context.set('focusIntent', e.focus ?? 'selected')
      },

      // 每次开合都重算：Tab 关闭要把焦点让给 Tab 序列的下一个元素，其余出口一律归还 trigger。
      // Tab 是要去下一个控件，层外指针交互是用户已经点中了别的东西——这两种情况下抢回焦点，
      // 会把光标从他刚点的输入框里拽走、后续敲的第一个字符直接丢掉。
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      /**
       * 展开那一刻挑焦点锚点。落点只在**可见行**里挑：选中值可能藏在一条收起的分支里，
       * 那个节点仍在 DOM 中但已 hidden、聚不了焦，认领 tabindex=0 等于没有停靠点。
       * 摊平在这里现算而不是复用 connect 的结果：动作跑在事件那一刻，connect 是渲染期求值的。
       */
      setInitialFocusedValue: ({ refs, prop, context, state, flush }) => {
        const pick = (): void => {
          const content = refs.get('getContentEl')()
          // 无 DOM 环境（纯逻辑测试）：锚点留空，状态转移不受影响
          if (!content)
            return
          const rows = flattenTree(prop('collection') ?? [], context.get('expandedValue'))
          const els = treeSelectNodeEls(content, rows)
          const intent = context.get('focusIntent')
          const selected = context.get('value')
          if (intent === 'selected') {
            // 选中节点仍可停留就停在它上面，否则退回首个可停留行
            const current = els.find((el) => {
              const v = itemValue(el)
              return v != null && selected.includes(v) && !isItemDisabled(el)
            })
            context.set('focusedValue', itemValue(current ?? navigateItems(els, null, 'first')))
            return
          }
          // first/last 从边界起步；next/prev 从当前选中值走一步，无选中值时同样落到边界
          const from = intent === 'first' || intent === 'last' ? null : (selected[0] ?? null)
          context.set('focusedValue', itemValue(navigateItems(els, from, intent, { loop: prop('loop') ?? false })))
        }
        pick()
        // 初始即展开时，节点的身份标记要等适配器首次写入才在，这一刻查不到任何节点、
        // 锚点会落空。已经挑到就不再挑；挑的过程中若浮层已收起也不补
        flush(() => {
          if (state.get() === 'open' && context.get('focusedValue') == null)
            pick()
        })
      },

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NODE.FOCUS')
          context.set('focusedValue', e.value)
      },

      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
      clearTypeahead: ({ refs }) => refs.get('typeahead').clear(),

      selectNode: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'NODE.SELECT')
          return
        const current = context.get('value')
        if (prop('multiple')) {
          context.set('value', current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value])
          return
        }
        // 单选没有「取消选中」这回事：选两下就把控件点空了不是任何人期望的
        context.set('value', [e.value])
      },

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, !!prop('multiple')))
      },

      clearValue: ({ context }) => context.set('value', []),

      setExpanded: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'EXPANDED.SET')
          return
        context.set('expandedValue', unique(e.value))
      },

      expandBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.EXPAND')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value))
          return
        context.set('expandedValue', [...current, e.value])
      },

      collapseBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.COLLAPSE')
          return
        context.set('expandedValue', context.get('expandedValue').filter(v => v !== e.value))
      },

      toggleBranch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.TOGGLE')
          return
        const current = context.get('expandedValue')
        context.set(
          'expandedValue',
          current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value],
        )
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身的尺寸——placement=top 会正好错位一个浮层高度
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            { placement: prop('placement') ?? TREE_SELECT_DEFAULT_PLACEMENT, offset: prop('offset') },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // 层的入栈出栈与消解层、焦点域绑在同一个效应里：三者生命周期必须完全一致。
      // 层只在展开期间入栈——消解层只让栈顶响应 Escape，若层在挂载期就注册、与开合无关地
      // 常驻栈里，同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死。
      trackLayer: ({ refs, context, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: reason =>
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => refs.get('getContentEl')(),
          // 树不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定落焦点为锚点节点，不交给 Tab 序列探测：探测走的是
          // focusFirst(removeLinks(...))，节点写成 <a> 时会被整体过滤掉，
          // 落焦就会掉到容器上而不是锚点节点。
          // 这里每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试到 DOM 就位
          initialFocus: () => findTreeSelectNodeEl(refs.get('getContentEl')(), context.get('focusedValue')),
          restoreFocus: () => context.get('returnFocus'),
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
