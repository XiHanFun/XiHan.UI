import type { PositionResult } from '@xihan-ui/kernel'
import type { CascaderFocusIntent, CascaderNodeMeta, CascaderSchema, CascaderValue } from './cascader.types'
import { cascadeToggle, collapseChecked, createDismissLayer, createFocusScope, itemValue, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { closeReasonOf } from '../shared/close-reason'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { cascaderAnatomy, cascaderItemQuery } from './cascader.anatomy'
import {
  cascaderBuildColumns,
  cascaderIndexNodes,
  cascaderNodeAt,
  cascaderPathKey,
  cascaderSamePath,
  cascaderStepColumn,
  cascaderTruncatePath,
} from './cascader.columns'

const { createMachine } = setup<CascaderSchema>()

/** 未指定 placement 时的落位，定位引擎与 connect 共用。 */
export const CASCADER_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

/** 未指定 separator 时的路径连接符。 */
export const CASCADER_DEFAULT_SEPARATOR = ' / '

/**
 * 单条路径归一成路径集合；undefined 原样透传，cell 靠它区分受控与否。
 * 靠首元素是不是数组分辨两种写法：`['a','b']` 是一条路径，`[['a','b']]` 是路径集合。
 */
function toPaths(input: CascaderValue | undefined): string[][] | undefined {
  if (input === undefined)
    return undefined
  if (input.length === 0)
    return []
  if (Array.isArray(input[0]))
    return (input as readonly (readonly string[])[]).map(path => [...path])
  return [[...(input as readonly string[])]]
}

/** 归一选中集合：单选截到长度 ≤ 1，多选按路径内容去重。 */
function normalizeSelection(next: readonly (readonly string[])[], multiple: boolean): string[][] {
  if (!multiple)
    return next.slice(0, 1).map(path => [...path])
  const seen = new Set<string>()
  const out: string[][] = []
  for (const path of next) {
    const key = cascaderPathKey(path)
    if (seen.has(key))
      continue
    seen.add(key)
    out.push([...path])
  }
  return out
}

/** 路径集合按内容比：受控时每次读都归一成新数组，引用比会误判成变更。 */
function samePathList(a: string[][], b: string[][] | undefined): boolean {
  return !!b && a.length === b.length && a.every((path, i) => cascaderSamePath(path, b[i]))
}

/** 展开路径按内容比，理由同上。 */
function samePathCell(a: string[], b: string[] | undefined): boolean {
  return !!b && cascaderSamePath(a, b)
}

/** 按值取条目元素，不问它此刻可不可见；只在事件那一刻读活 DOM。 */
export function findCascaderItemEl(container: HTMLElement | null, value: string | null): HTMLElement | null {
  if (!container || value == null)
    return null
  return queryItems(container, cascaderItemQuery).find(el => itemValue(el) === value) ?? null
}

// 选中集合住在 context 的 cell 里，受控与否由 cell 收口，不需要影子事件；
// 开合编进 FSM 状态，走守卫对 + CONTROLLED.* 影子事件 + watch。
// activePath 与 focusedPath 不对外受控。
export const cascaderMachine = createMachine({
  name: 'cascader',
  context: ({ prop, cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[][]>(() => ({
      value: toPaths(prop('value')),
      defaultValue: toPaths(prop('defaultValue')) ?? [],
      isEqual: samePathList,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    activePath: cell<string[]>(() => ({ defaultValue: [], isEqual: samePathCell })),
    focusedPath: cell<string[] | null>(() => ({
      defaultValue: null,
      // 同一次交互里锚点会被写两遍（条目 onFocus 与连接层各一遍），按内容比避免多排一轮重渲
      isEqual: (a, b) => b !== undefined && cascaderSamePath(a, b),
    })),
    focusIntent: cell<CascaderFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
    inputValue: cell<string>(() => ({ defaultValue: '' })),
    searchIndex: cell<number>(() => ({ defaultValue: 0 })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 开合受控时用户事件只发意图，宿主写回 open 后由 watch 派发 CONTROLLED.* 回写
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
  },
  // 与开合无关、两个状态都认的事件；展开态另行声明的 ITEM.SELECT 会盖过这里那一条
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'PATH.SET': { actions: ['setActivePath'] },
    'ITEM.FOCUS': { actions: ['setFocusedPath'] },
    'ITEM.EXPAND': { actions: ['expandPath'] },
    'ITEM.SELECT': { actions: ['selectPath'] },
  },
  states: {
    closed: {
      on: {
        // 受控只发意图，非受控落 target 并一并通知。
        // 落点意图与焦点归还策略先记进 context，受控转移那一拍走 CONTROLLED.OPEN 读不到原事件
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
      // 展开那一刻把列一路铺到选中路径上并挑好焦点锚点，全程纯计算
      entry: ['setInitialFocusedPath'],
      exit: ['clearFocusedPath', 'clearInput'],
      // 定位 → 消解 → 焦点；退出时逆序清理
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
        // 多选与分支选完都不收起，焦点留在列里；只有叶子走与 CLOSE 相同的收口。
        // 停留在展开态的选中要把搜索词清掉，候选视图随之让位回列视图
        'ITEM.SELECT': [
          { guard: 'isMultiple', actions: ['selectPath', 'clearInput'] },
          { guard: 'staysOpenOnSelect', actions: ['selectPath', 'clearInput'] },
          { guard: 'isOpenControlled', actions: ['selectPath', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['selectPath', 'setReturnFocus', 'invokeOnClose'] },
        ],
        'INPUT.CHANGE': { actions: ['setInputValue'] },
        'SEARCH.HIGHLIGHT': { actions: ['setSearchIndex'] },
        // 持有焦点的条目被移出 DOM，锚点悬空，就地按当前数据重挑一个
        'ITEM.LOST': { actions: ['setInitialFocusedPath'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isMultiple: ({ prop }) => !!prop('multiple'),
      // 选中的是分支：不收起
      staysOpenOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return false
        return !!cascaderNodeAt(prop('collection') ?? [], e.path)?.branch
      },
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current()) }),

      setInputValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'INPUT.CHANGE')
          return
        context.set('inputValue', e.value)
        // 候选随词换，高亮回到第 0 条
        context.set('searchIndex', 0)
      },
      setSearchIndex: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'SEARCH.HIGHLIGHT')
          context.set('searchIndex', Math.max(0, e.index))
      },
      clearInput: ({ context }) => {
        if (context.get('inputValue') !== '')
          context.set('inputValue', '')
        context.set('searchIndex', 0)
      },

      // 只在 open 为布尔时回写；变回 undefined 即转非受控，不强制关闭
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

      // Tab 与层外交互关闭时焦点已交给别处，不归还；其余出口归还 trigger
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      /**
       * 展开那一刻把列铺开、把焦点锚点挑好，顺序与禁用都取 collection，无 DOM 环境也算得出。
       *
       * 有选中路径就一路展到它所在的那一列，焦点落在它自己身上；它已禁用或路径过期时
       * 退回本列首个可停留条目。first/last 两个意图从根列进，不理会选中值。
       */
      setInitialFocusedPath: ({ prop, context, event }) => {
        const collection = prop('collection') ?? []
        const intent = context.get('focusIntent')
        const selected = context.get('value')[0] ?? []
        // 锚点条目离场后的重挑：只在此前真有过锚点时补，判据取自机器自己的状态而不是事件类型——
        // 适配器误报时凭空补一个，会点亮一个本轮不该高亮的条目并把 Tab 位从容器上摘走
        const repick = event.current().type === 'ITEM.LOST'
        if (repick && context.get('focusedPath') == null)
          return
        // 指针打开且没有选中值：不落锚点也不铺列，焦点由焦点域兜底歇在 content 上，
        // 打开这一刻不能有条目看着像被选中；键盘入口要预落锚点得自带 first/next 意图
        if (intent === 'selected' && selected.length === 0 && !repick) {
          context.set('activePath', [])
          context.set('focusedPath', null)
          return
        }
        const fromRoot = intent === 'first' || intent === 'last'
        const anchorPath = fromRoot ? [] : [...selected]
        const columns = cascaderBuildColumns(collection, anchorPath)
        // 锚点条目所在的那一列；选中路径过期、走不通时退回最后一列
        const level = Math.min(Math.max(0, anchorPath.length - 1), columns.length - 1)
        const column = columns[level]
        // 一列条目都没有：锚点留空，由容器兜底进 Tab 序列
        if (!column || column.items.length === 0) {
          context.set('activePath', [])
          context.set('focusedPath', null)
          return
        }

        const loop = prop('loop') ?? true
        const from = anchorPath.length ? anchorPath[anchorPath.length - 1]! : null
        let picked: CascaderNodeMeta | null
        if (intent === 'selected') {
          // 选中条目仍可停留就停在它上面，否则退回本列首个可停留条目
          picked = column.items.find(item => item.value === from && !item.disabled)
            ?? cascaderStepColumn(column.items, null, 'first', { loop })
        }
        else if (fromRoot) {
          picked = cascaderStepColumn(column.items, null, intent, { loop })
        }
        else {
          // next/prev 从选中条目走一步；无选中值时 from 为空，落到本列边界
          picked = cascaderStepColumn(column.items, from, intent, { loop })
        }
        // 有选中值才把列铺到落点上；键盘意图（first/last/next/prev）在无选中值时
        // 只落锚点不铺列
        context.set('activePath', picked && selected.length ? [...picked.path] : [])
        context.set('focusedPath', picked ? [...picked.path] : null)
      },

      /**
       * 焦点落到第 level 列的某个条目上：展开路径就地截到第 level 段并换成它，
       * 它右边原有的列一律砍掉，它自己的子列随之顶上。
       * 焦点与展开必须同一拍完成：慢一拍的话右方向键要落进的那一列还带着 hidden，焦点会掉回 body。
       * 焦点回落到既有锚点（打开落焦、focusMeta 的补写）不动展开路径，
       * 打开落点才能停在「锚点在、列不展开」上；点选与右方向键的展开各自显式发 ITEM.EXPAND。
       */
      setFocusedPath: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.FOCUS')
          return
        const path = cascaderTruncatePath(context.get('activePath'), e.level, e.value)
        const anchored = context.get('focusedPath')
        // 锚点间的真实移动才拖动展开路径；落地（此前无锚点）与回落到既有锚点都只记锚点，
        // 打开后的首次落焦不带出子列——展开由导航移动、点选与右方向键各自声明
        if (anchored && !cascaderSamePath(path, anchored))
          context.set('activePath', path)
        context.set('focusedPath', path)
      },

      // 只展开不移焦点
      expandPath: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.EXPAND')
          context.set('activePath', cascaderTruncatePath(context.get('activePath'), e.level, e.value))
      },

      setActivePath: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PATH.SET')
          context.set('activePath', [...e.path])
      },

      // 收起只清焦点锚点，展开路径留着：它是本次浏览的痕迹，下次展开由 entry 按选中值重算
      clearFocusedPath: ({ context }) => context.set('focusedPath', null),

      selectPath: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT' || e.path.length === 0)
          return
        const meta = cascaderNodeAt(prop('collection') ?? [], e.path)
        // 分支只有在 changeOnSelect 或级联勾选打开时才落值；否则点分支纯粹是展开子列
        if (meta?.branch && !prop('changeOnSelect') && !(prop('multiple') && prop('cascade')))
          return
        const path = [...e.path]
        const current = context.get('value')
        if (prop('multiple')) {
          // 级联：按尾值走级联原语，再把收敛后的值映射回各自的完整路径
          if (prop('cascade')) {
            const roots = prop('collection') ?? []
            const state = cascadeToggle(roots, current.map(p => p[p.length - 1]!), path[path.length - 1]!)
            const collapsed = collapseChecked(roots, state.checked, prop('checkedStrategy') ?? 'child')
            const index = cascaderIndexNodes(roots)
            context.set('value', collapsed.flatMap((v) => {
              const meta2 = index.get(v)
              return meta2 ? [[...meta2.path]] : []
            }))
            return
          }
          const key = cascaderPathKey(path)
          const hit = current.some(item => cascaderPathKey(item) === key)
          context.set('value', hit ? current.filter(item => cascaderPathKey(item) !== key) : [...current, path])
          return
        }
        // 单选没有「取消选中」这回事：选两下就把控件点空了不是任何人期望的
        context.set('value', [path])
      },

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, !!prop('multiple')))
      },

      clearValue: ({ context }) => context.set('value', []),
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        context.set('position', null)
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
            {
              placement: prop('placement') ?? CASCADER_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? OVERLAY_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
            },
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
          onDismiss: (reason) => {
            // Escape 分两拍：搜索词还在就先清词回列视图，词已空才收浮层
            if (reason === 'escape-key' && context.get('inputValue') !== '') {
              send({ type: 'INPUT.CHANGE', value: '' })
              return
            }
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' })
          },
        })

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => refs.get('getContentEl')(),
          // 各列不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定落焦点，两种落点都不交给 Tab 序列探测：探测走的是
          // focusFirst(removeLinks(...))，条目写成 <a> 时会被整体过滤掉，
          // 且容器自身从来不是候选——只靠它焦点要等到最后一帧才落位。
          // 这里每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试到 DOM 就位
          initialFocus: () => {
            const content = refs.get('getContentEl')()
            if (!content)
              return null
            const path = context.get('focusedPath')
            const anchor = path?.[path.length - 1] ?? null
            if (anchor != null)
              return findCascaderItemEl(content, anchor)
            // 本轮该有锚点却还没挑出来：返回 null 让焦点域重试，别滑到列上定死
            if (!(context.get('focusIntent') === 'selected' && context.get('value').length === 0))
              return null
            // 确实不该有锚点（指针打开且无选中值）：焦点落到根列，它是 role=listbox 且认领着 Tab 位
            return content.querySelector<HTMLElement>(`${cascaderAnatomy.build().column.selector}[data-level='0']`)
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
