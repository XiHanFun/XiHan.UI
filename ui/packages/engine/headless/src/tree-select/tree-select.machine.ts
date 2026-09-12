import type { ActionFn, PositionResult } from '@xihan-ui/core'
import type { TreeVisibleNode } from '../tree'
import type { TreeSelectBranchLoadSnapshot, TreeSelectFocusIntent, TreeSelectNode, TreeSelectSchema } from './tree-select.types'
import { cascadeToggle, collapseChecked, createTypeahead, isItemDisabled, itemValue, navigateItems, queryItems, resetDeclaredValue, setup } from '@xihan-ui/core'
import { sameArray as sameValues, toArray as toValues, uniqueArray as unique } from '../shared/array'
import { closeReasonOf } from '../shared/close-reason'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { overlayCloseOnDismiss, trackOverlayLayer, trackOverlayPosition, trackPresenceResources } from '../shared/overlay-shell'
import { flattenTree } from '../tree'
import { treeSelectAnatomy, treeSelectBranchQuery, treeSelectItemQuery } from './tree-select.anatomy'

const { createMachine } = setup<TreeSelectSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const TREE_SELECT_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

/** 选中集合的不变量：单选恒为长度 ≤ 1，多选去重。公开 API 与内部写入都经这里收口。 */
function normalizeSelection(next: readonly string[], multiple: boolean): string[] {
  return multiple ? [...new Set(next)] : next.slice(0, 1)
}

/** 节点是懒分支的唯一判据：明确有孩子但孩子尚未在 collection 里。 */
export function isTreeSelectLazyBranch(node: TreeSelectNode): boolean {
  return node.hasChildren === true && node.children === undefined
}

export function findTreeSelectNode(
  nodes: readonly TreeSelectNode[],
  value: string,
  loadedChildren: Readonly<Record<string, TreeSelectNode[]>> = {},
): TreeSelectNode | null {
  for (const node of nodes) {
    if (node.value === value)
      return node
    const children = node.children ?? loadedChildren[node.value]
    if (children) {
      const found = findTreeSelectNode(children, value, loadedChildren)
      if (found)
        return found
    }
  }
  return null
}

/**
 * 给 connect 与动作共用的有效树。只在懒分支上补 children=[]，所以空目录与叶子不会混淆；
 * 取回的数据留在 context，宿主无需为了单个分支结果重建 collection。
 */
export function resolveTreeSelectCollection(
  collection: readonly TreeSelectNode[],
  loadedChildren: Readonly<Record<string, TreeSelectNode[]>>,
): TreeSelectNode[] {
  return collection.map((node) => {
    if (node.children === undefined && !isTreeSelectLazyBranch(node))
      return node
    const source = node.children ?? loadedChildren[node.value] ?? []
    const children = resolveTreeSelectCollection(source, loadedChildren)
    if (node.children && children.length === node.children.length && children.every((child, index) => child === node.children![index]))
      return node
    return { ...node, children }
  })
}

type TreeSelectActionParams = Parameters<ActionFn<TreeSelectSchema>>[0]

function setBranchLoad(
  context: TreeSelectActionParams['context'],
  value: string,
  snapshot: TreeSelectBranchLoadSnapshot,
): void {
  context.set('branchLoads', { ...context.get('branchLoads'), [value]: snapshot })
}

function beginBranchLoad(params: TreeSelectActionParams, value: string, force: boolean): void {
  const { context, prop, refs, scope } = params
  const loadChildren = prop('loadChildren')
  const node = findTreeSelectNode(prop('collection') ?? [], value, context.get('loadedChildren'))
  if (!node || !isTreeSelectLazyBranch(node))
    return
  if (value in context.get('loadedChildren'))
    return
  if (!force && context.get('branchLoads')[value]?.status === 'error')
    return
  if (!loadChildren) {
    const error = new Error(`TreeSelect lazy branch "${value}" requires loadChildren`)
    refs.get('branchLoadOwners').set(value, node)
    setBranchLoad(context, value, { status: 'error', error })
    prop('onBranchLoadError')?.({ value, node, error })
    return
  }

  const controllers = refs.get('branchLoadControllers')
  const previous = controllers.get(value)
  if (previous && !force)
    return
  previous?.controller.abort()

  const token = ++refs.get('branchLoadSequence').n
  const controller = new (scope.getWin().AbortController)()
  controllers.set(value, { controller, token, node })
  refs.get('branchLoadOwners').set(value, node)
  setBranchLoad(context, value, { status: 'loading' })
  prop('onBranchLoadStart')?.({ value, node, reason: force ? 'retry' : 'expand' })

  const current = (): boolean => {
    const entry = controllers.get(value)
    return entry?.controller === controller
      && entry.token === token
      && findTreeSelectNode(prop('collection') ?? [], value, context.get('loadedChildren')) === node
      && isTreeSelectLazyBranch(node)
  }

  Promise.resolve()
    .then(() => loadChildren({ node, signal: controller.signal }))
    .then((children) => {
      if (!current() || controller.signal.aborted)
        return
      const resolved = children ? [...children] : []
      controllers.delete(value)
      context.set('loadedChildren', { ...context.get('loadedChildren'), [value]: resolved })
      setBranchLoad(context, value, { status: 'loaded', empty: resolved.length === 0 })
      prop('onBranchLoad')?.({ value, node, children: resolved })
    }, (error: unknown) => {
      if (!current() || controller.signal.aborted)
        return
      controllers.delete(value)
      setBranchLoad(context, value, { status: 'error', error })
      prop('onBranchLoadError')?.({ value, node, error })
    })
}

function lazyBranches(
  nodes: readonly TreeSelectNode[],
  loadedChildren: Readonly<Record<string, TreeSelectNode[]>>,
  values = new Map<string, TreeSelectNode>(),
): Map<string, TreeSelectNode> {
  for (const node of nodes) {
    if (isTreeSelectLazyBranch(node))
      values.set(node.value, node)
    const children = node.children ?? loadedChildren[node.value]
    if (children)
      lazyBranches(children, loadedChildren, values)
  }
  return values
}

function cancelBranchLoad(params: TreeSelectActionParams, value: string): void {
  const entry = params.refs.get('branchLoadControllers').get(value)
  if (!entry)
    return
  entry.controller.abort()
  params.refs.get('branchLoadControllers').delete(value)
  setBranchLoad(params.context, value, { status: 'idle' })
}

function cancelBranchLoads(params: TreeSelectActionParams, except: ReadonlySet<string> = new Set()): void {
  for (const value of [...params.refs.get('branchLoadControllers').keys()]) {
    if (!except.has(value))
      cancelBranchLoad(params, value)
  }
}

/**
 * 容器里的全部节点元素（叶子与分支），按可见序排列，只在事件那一刻读活 DOM。
 * 顺序不取文档序：收起分支的子节点仍留在文档里，按文档序走会走进看不见的子树。
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

// 选中集合与展开集合都住在 context 的 cell 里，受控/非受控在 cell 收口，这两路不需要影子事件。
// 开合编进 FSM 状态，走守卫对加 CONTROLLED.* 影子事件加 watch 那一套。
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
      onChange: value => prop('onExpandedValueChange')?.({ value }),
    })),
    // 焦点锚点不受控、不对外通知：它只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<TreeSelectFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
    branchLoads: cell(() => ({ defaultValue: {} })),
    loadedChildren: cell(() => ({ defaultValue: {} })),
    renderedNodeCount: cell<number>(() => ({ defaultValue: 0 })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    typeahead: createTypeahead(),
    branchLoadControllers: new Map(),
    branchLoadSequence: { n: 0 },
    branchLoadOwners: new Map(),
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 开合受控时用户事件只发意图，宿主写回 open 后由 watch 派发 CONTROLLED.* 无条件回写；
  // 值与展开集合受控走 cell。
  watch: ({ track, prop, context, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    // 外部删掉或补齐分支时，运输中的旧请求必须失效，不能把结果写回已不存在的数据树。
    track([() => prop('collection')], () => action(['syncBranchLoads']))
    // 受控 expandedValue、初始 defaultExpandedValue 与 API 改写共用这一个入口。
    track([context.dep('expandedValue')], () => action(['loadExpandedBranches']))
  },
  // 请求控制器随服务存活，但浮层或分支收起会主动中止；Layer、消解与焦点资源延迟到 Presence 完成。
  effects: ['trackBranchLoads', 'trackLayer'],
  // 这几件事与开合无关，两个状态里都得认；展开态另行声明的 NODE.SELECT 会盖过这里那一条。
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'EXPANDED.SET': { actions: ['setExpanded'] },
    'BRANCH.EXPAND': { actions: ['loadExpandedBranch', 'expandBranch'] },
    'BRANCH.COLLAPSE': { actions: ['collapseBranch'] },
    'BRANCH.TOGGLE': { actions: ['loadExpandedBranch', 'toggleBranch'] },
    'BRANCH.RETRY': { actions: ['retryBranch'] },
    'NODE.MOUNT': { actions: ['syncRenderedNodes'] },
    'NODE.UNMOUNT': { actions: ['syncRenderedNodes'] },
    'NODES.SYNC': { actions: ['syncRenderedNodes'] },
    'NODE.FOCUS': { actions: ['setFocusedValue'] },
    'NODE.SELECT': { actions: ['selectNode'] },
  },
  states: {
    closed: {
      on: {
        // 受控只发意图，非受控落 target 并通知。
        // 落点意图与焦点归还先记进 context：受控那一拍走 CONTROLLED.OPEN，读不到原按键事件。
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen', 'resumeBranchLoads'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen', 'resumeBranchLoads'] },
        ],
        'CONTROLLED.OPEN': { target: 'open', actions: ['resumeBranchLoads'] },
      },
    },
    open: {
      // 锚点在进入展开态时就位；节点常挂，此刻查到的顺序即最终顺序。
      entry: ['setInitialFocusedValue'],
      // 收起就丢缓冲，否则下次展开首字母会拼进上一轮查询串
      exit: ['clearFocusedValue', 'clearTypeahead'],
      // 定位只服务逻辑展开；Layer、消解与焦点资源由顶层 effect 延后到真实退场释放。
      effects: ['trackPosition'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['cancelBranchLoads', 'setReturnFocus', 'invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['cancelBranchLoads', 'setReturnFocus', 'invokeOnClose'] },
        ],
        // 多选选完接着挑，浮层不收起、焦点留在树里；单选选完即收起，走与 CLOSE 相同的收口
        'NODE.SELECT': [
          { guard: 'isMultiple', actions: ['selectNode'] },
          { guard: 'isOpenControlled', actions: ['selectNode', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['selectNode', 'cancelBranchLoads', 'setReturnFocus', 'invokeOnClose'] },
        ],
        // 持有焦点的节点被移出 DOM，锚点悬空，就地重挑一个，否则没有节点认领 tabindex=0
        'NODE.LOST': { actions: ['setInitialFocusedValue'] },
        'CONTROLLED.CLOSE': { target: 'closed', actions: ['cancelBranchLoads'] },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isMultiple: ({ prop }) => !!prop('multiple'),
    },
    actions: {
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      syncBranchLoads: (params) => {
        const { context, prop, refs } = params
        const source = prop('collection') ?? []
        const owners = refs.get('branchLoadOwners')
        const currentChildren = context.get('loadedChildren')
        const initialLive = lazyBranches(source, currentChildren)
        const children = Object.fromEntries(
          Object.entries(currentChildren).filter(([value]) => initialLive.get(value) === owners.get(value)),
        )
        const live = lazyBranches(source, children)
        const controllers = refs.get('branchLoadControllers')
        for (const [value, entry] of [...controllers]) {
          if (live.get(value) !== entry.node) {
            entry.controller.abort()
            controllers.delete(value)
          }
        }
        const keep = (value: string): boolean => live.get(value) === owners.get(value)
        const loads = Object.fromEntries(Object.entries(context.get('branchLoads')).filter(([value]) => keep(value)))
        if (Object.keys(loads).length !== Object.keys(context.get('branchLoads')).length)
          context.set('branchLoads', loads)
        if (Object.keys(children).length !== Object.keys(currentChildren).length)
          context.set('loadedChildren', children)
        for (const [value] of [...owners]) {
          if (!keep(value))
            owners.delete(value)
        }
        if (params.state.get() === 'open') {
          for (const value of context.get('expandedValue'))
            beginBranchLoad(params, value, false)
        }
      },

      syncRenderedNodes: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NODES.SYNC') {
          if (context.get('renderedNodeCount') !== e.values.length)
            context.set('renderedNodeCount', e.values.length)
          return
        }
        if (e.type !== 'NODE.MOUNT' && e.type !== 'NODE.UNMOUNT')
          return
        const current = context.get('renderedNodeCount')
        context.set('renderedNodeCount', e.type === 'NODE.MOUNT' ? current + 1 : Math.max(0, current - 1))
      },

      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current()) }),

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

      // Tab 与层外交互关闭时把焦点让出，其余出口一律归还 trigger
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      /**
       * 展开那一刻挑焦点锚点，落点只在可见行里挑：
       * 藏在收起分支里的节点虽在 DOM 中但 hidden、聚不了焦。
       * 摊平在这里现算而不复用 connect 的结果：动作跑在事件那一刻，connect 是渲染期求值的。
       */
      setInitialFocusedValue: ({ refs, prop, context, state, event, flush }) => {
        // 锚点节点离场后的重挑：只在此前真有过锚点时补，判据取自机器自己的状态而不是事件类型——
        // 适配器误报时凭空补一个，会点亮一个本轮不该高亮的节点并把 Tab 位从容器上摘走
        const repick = event.current().type === 'NODE.LOST'
        if (repick) {
          if (context.get('focusedValue') == null)
            return
          context.set('focusedValue', null)
        }
        const pick = (): void => {
          const content = refs.get('getContentEl')()
          // 无 DOM 环境：锚点留空，状态转移不受影响
          if (!content)
            return
          const rows = flattenTree(
            resolveTreeSelectCollection(prop('collection') ?? [], context.get('loadedChildren')),
            context.get('expandedValue'),
          )
          const els = treeSelectNodeEls(content, rows)
          const intent = context.get('focusIntent')
          const selected = context.get('value')
          if (intent === 'selected') {
            // 没有选中值就不落锚点：焦点由焦点域兜底歇在 content 上，
            // 打开这一刻不能有节点看着像被选中；键盘入口要预落锚点得自带 first/next 意图
            if (selected.length === 0 && !repick)
              return
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
        // 初始即展开时节点身份标记可能尚未写入，推迟一拍补挑；已挑到或已收起则不补
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
          // 级联：整枝传导后按收敛策略落对外值；朴素切换只动被点的那一个
          if (prop('cascade')) {
            const roots = resolveTreeSelectCollection(prop('collection') ?? [], context.get('loadedChildren'))
            const state = cascadeToggle(roots, current, e.value)
            context.set('value', collapseChecked(roots, state.checked, prop('checkedStrategy') ?? 'child'))
            return
          }
          context.set('value', current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value])
          return
        }
        // 单选没有取消选中这回事，选两下不会把控件点空
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

      // 在真正写入 expandedValue 前看旧值：重复 expand 与收起动作都不会悄悄再发请求。
      loadExpandedBranch: (params) => {
        const e = params.event.current()
        if (e.type !== 'BRANCH.EXPAND' && e.type !== 'BRANCH.TOGGLE')
          return
        if (!params.context.get('expandedValue').includes(e.value))
          beginBranchLoad(params, e.value, false)
      },

      retryBranch: (params) => {
        const e = params.event.current()
        if (e.type === 'BRANCH.RETRY')
          beginBranchLoad(params, e.value, true)
      },

      loadExpandedBranches: (params) => {
        if (params.state.get() !== 'open')
          return
        const expanded = new Set(params.context.get('expandedValue'))
        cancelBranchLoads(params, expanded)
        for (const value of expanded)
          beginBranchLoad(params, value, false)
      },

      resumeBranchLoads: (params) => {
        params.flush(() => params.scope.getWin().queueMicrotask(() => {
          if (params.state.get() !== 'open')
            return
          for (const value of params.context.get('expandedValue'))
            beginBranchLoad(params, value, false)
        }))
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

      collapseBranch: (params) => {
        const { context } = params
        const e = params.event.current()
        if (e.type !== 'BRANCH.COLLAPSE')
          return
        cancelBranchLoad(params, e.value)
        context.set('expandedValue', context.get('expandedValue').filter(v => v !== e.value))
      },

      toggleBranch: (params) => {
        const { context } = params
        const e = params.event.current()
        if (e.type !== 'BRANCH.TOGGLE')
          return
        const current = context.get('expandedValue')
        if (current.includes(e.value))
          cancelBranchLoad(params, e.value)
        context.set(
          'expandedValue',
          current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value],
        )
      },

      cancelBranchLoads,

    },
    effects: {
      // 组件卸载时中止所有请求；分支/浮层收起由动作同步取消。
      trackBranchLoads: (params) => {
        params.flush(() => params.scope.getWin().queueMicrotask(() => {
          if (params.state.get() !== 'open')
            return
          for (const value of params.context.get('expandedValue'))
            beginBranchLoad(params, value, false)
        }))
        return () => {
          for (const { controller } of params.refs.get('branchLoadControllers').values())
            controller.abort()
          params.refs.get('branchLoadControllers').clear()
        }
      },

      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => trackOverlayPosition({
        // 无引擎时不定位，其余照常
        engine: refs.get('position'),
        flush,
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        clear: () => context.set('position', null),
        getAnchor: () => refs.get('getAnchorEl')(),
        getFloating: () => refs.get('getFloatingEl')(),
        options: () => ({
          placement: prop('placement') ?? TREE_SELECT_DEFAULT_PLACEMENT,
          offset: prop('offset') ?? OVERLAY_OFFSET,
          // positioner 渲染成 fixed，坐标系必须跟着走视口系
          strategy: 'fixed',
          // start / end 是逻辑对齐，RTL 下行内轴要翻过来
          dir: prop('dir'),
          // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
          size: true,
        }),
        onResult: result => context.set('position', result),
      }),

      // Layer、DismissableLayer 与 FocusScope 共用 Presence 生命周期；退场中仍占栈顶但不再响应关闭。
      trackLayer: ({ refs, context, send, flush, scope, state, track }) => {
        let reactivateFocus: (() => void) | null = null
        return trackPresenceResources({
          presence: () => refs.get('presence'),
          open: () => state.get() === 'open',
          track,
          acquire: () => trackOverlayLayer({
            // 无 DOM 环境：状态机照常转移，不挂副作用
            config: refs.get('config'),
            registerLayer: refs.get('registerLayer'),
            flush,
            active: () => state.get() === 'open',
            onDismiss: overlayCloseOnDismiss(send),
            focusScope: {
              // 每次读最新 ref，容器晚一拍就位也能命中
              container: () => refs.get('getContentEl')(),
              // 显式指定落焦点为锚点节点：Tab 序列探测会过滤掉写成 <a> 的节点。
              // 每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试。
              // 无锚点（指针打开且无选中值）时落到 tree 部件自己身上，它此刻正认领着 Tab 位。
              // 不能留给焦点域的 Tab 序列探测：那条路按文档序取 content 的全部可 tab 后代，
              // 作者放在树前面的搜索框会把焦点抢走，而键盘处理器挂在树上，方向键就此失灵
              initialFocus: () => {
                const content = refs.get('getContentEl')()
                if (!content)
                  return null
                const anchor = context.get('focusedValue')
                if (anchor != null)
                  return findTreeSelectNodeEl(content, anchor)
                // 本轮该有锚点却还没挑出来（节点身份标记晚一拍写上）：返回 null 让焦点域重试，
                // 别滑到容器上定死——落焦一旦成功就不再重试
                if (!(context.get('focusIntent') === 'selected' && context.get('value').length === 0))
                  return null
                return content.querySelector<HTMLElement>(treeSelectAnatomy.build().tree.selector)
              },
              restoreFocus: () => context.get('returnFocus'),
              // 归还落点显式给 trigger：指针打开那一刻焦点未必真在它身上（Safari 点按不给按钮焦点），
              // 靠焦点域的创建前快照会把 Escape 之后的 Tab 起点丢到 body 上
              restoreTarget: () => refs.get('getAnchorEl')(),
              onReactivate: reactivate => reactivateFocus = reactivate,
            },
          }),
          onReopen: () => {
            const activate = reactivateFocus
            flush(() => scope.getWin().requestAnimationFrame(() => {
              if (state.get() === 'open' && reactivateFocus === activate)
                activate?.()
            }))
          },
        })
      },
    },
  },
})
