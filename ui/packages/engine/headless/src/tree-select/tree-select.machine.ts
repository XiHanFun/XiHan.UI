import type { PositionResult } from '@xihan-ui/kernel'
import type { TreeVisibleNode } from '../tree'
import type { TreeSelectFocusIntent, TreeSelectSchema } from './tree-select.types'
import { cascadeToggle, collapseChecked, createDismissLayer, createFocusScope, createTypeahead, isItemDisabled, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'
import { closeReasonOf } from '../shared/close-reason'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { flattenTree } from '../tree'
import { treeSelectAnatomy, treeSelectBranchQuery, treeSelectItemQuery } from './tree-select.anatomy'

const { createMachine } = setup<TreeSelectSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const TREE_SELECT_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

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

/** 数组按元素比：受控时 cell 每次读都产出新数组，默认的 Object.is 恒不相等。 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
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
  // 开合受控时用户事件只发意图，宿主写回 open 后由 watch 派发 CONTROLLED.* 无条件回写；
  // 值与展开集合受控走 cell。
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
  },
  // 这几件事与开合无关，两个状态里都得认；展开态另行声明的 NODE.SELECT 会盖过这里那一条。
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
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
        // 受控只发意图，非受控落 target 并通知。
        // 落点意图与焦点归还先记进 context：受控那一拍走 CONTROLLED.OPEN，读不到原按键事件。
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
      // 锚点在进入展开态时就位；节点常挂，此刻查到的顺序即最终顺序。
      entry: ['setInitialFocusedValue'],
      // 收起就丢缓冲，否则下次展开首字母会拼进上一轮查询串
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
        // 多选选完接着挑，浮层不收起、焦点留在树里；单选选完即收起，走与 CLOSE 相同的收口
        'NODE.SELECT': [
          { guard: 'isMultiple', actions: ['selectNode'] },
          { guard: 'isOpenControlled', actions: ['selectNode', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['selectNode', 'setReturnFocus', 'invokeOnClose'] },
        ],
        // 持有焦点的节点被移出 DOM，锚点悬空，就地重挑一个，否则没有节点认领 tabindex=0
        'NODE.LOST': { actions: ['setInitialFocusedValue'] },
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
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

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
          const rows = flattenTree(prop('collection') ?? [], context.get('expandedValue'))
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
            const roots = prop('collection') ?? []
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
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        context.set('position', null)
        const engine = refs.get('position')
        // 无引擎时不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带 hidden、高度为 0，算出的坐标会错位
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
            {
              placement: prop('placement') ?? TREE_SELECT_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? OVERLAY_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // 层与消解层、焦点域绑在同一个效应里，三者生命周期必须一致；
      // 层只在展开期间入栈，常驻会占死栈顶把下面各层的 Escape 堵死。
      trackLayer: ({ refs, context, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境：状态机照常转移，不挂副作用
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
