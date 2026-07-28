import type { Placement, PositionResult } from '@xihan-ui/core'
import type { CascaderFocusIntent, CascaderNodeMeta, CascaderSchema, CascaderValue } from './cascader.types'
import { createDismissLayer, createFocusScope, itemValue, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { cascaderItemQuery } from './cascader.anatomy'
import {
  cascaderBuildColumns,
  cascaderNodeAt,
  cascaderPathKey,
  cascaderSamePath,
  cascaderStepColumn,
  cascaderTruncatePath,
} from './cascader.columns'

const { createMachine } = setup<CascaderSchema>()

/** 未指定 placement 时的落位：浮层沿触发器起始缘展开。定位引擎与 connect 共用这一个缺省。 */
export const CASCADER_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 未指定 separator 时的路径连接符。connect 单点使用，机器不碰显示文本。 */
export const CASCADER_DEFAULT_SEPARATOR = ' / '

/**
 * 单条路径是简写，内部一律按路径集合处理；undefined 要原样透传，cell 靠它区分受控与否。
 *
 * 靠首元素是不是数组分辨两种写法：`['a','b']` 是一条路径，`[['a','b']]` 是路径集合。
 * 空数组两种读法都是「无选中」，不冲突。
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

/** 选中集合的不变量：单选恒为长度 ≤ 1，多选按路径内容去重。公开 API 与内部写入都经这里收口。 */
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

/**
 * 路径集合按内容比。默认的 Object.is 在这里不成立：受控时 cell 每次读都要把 prop 归一成
 * 新数组，引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「值其实没变」判成变了，onValueChange 便会重复发。
 */
function samePathList(a: string[][], b: string[][] | undefined): boolean {
  return !!b && a.length === b.length && a.every((path, i) => cascaderSamePath(path, b[i]))
}

/** 展开路径按内容比，理由同上。 */
function samePathCell(a: string[], b: string[] | undefined): boolean {
  return !!b && cascaderSamePath(a, b)
}

/**
 * 按值取条目元素，不问它此刻可不可见：条目在标记里是常挂的，收起的列只是带着 hidden。
 * 只在事件那一刻读活 DOM——两个适配器此时看到的是同一份文档。
 */
export function findCascaderItemEl(container: HTMLElement | null, value: string | null): HTMLElement | null {
  if (!container || value == null)
    return null
  return queryItems(container, cascaderItemQuery).find(el => itemValue(el) === value) ?? null
}

// 选中集合住在 context 的 cell 里（cell 本身就是受控/非受控的收口点：给定 prop 即受控，
// 读直取 prop、写只发回调不落内部值），因此这一路不需要影子事件。
// 开合是布尔态、编进 FSM 状态，走「守卫对 + CONTROLLED.* 影子事件 + watch」那一套。
// 展开路径（activePath）与焦点锚点（focusedPath）都不对外受控：前者是浏览过程，
// 后者只服务 roving tabindex 与方向键起点。
export const cascaderMachine = createMachine({
  name: 'cascader',
  context: ({ prop, cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
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
      // 同一次交互里锚点会被写两遍（条目自己的 onFocus 一遍、连接层显式一遍），
      // 两遍是内容相同的两个新数组：按引用比会白白多排一轮重渲
      isEqual: (a, b) => b !== undefined && cascaderSamePath(a, b),
    })),
    focusIntent: cell<CascaderFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
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
  // 开合受控（open prop 给定）时用户事件只发意图、不自改状态；宿主写回 open 后由 watch
  // 派发影子事件 CONTROLLED.* 无条件回写。选中值受控走 cell，不需要这套。
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
  },
  // 这几件事与开合无关，两个状态里都得认：程序化改值、改展开路径、以及记焦点锚点。
  // 展开态另行声明的 ITEM.SELECT 会盖过这里那一条（叶子选完还要收起）。
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
      // 展开那一刻把列一路铺到选中路径上，并挑好焦点锚点。全程纯计算（顺序与禁用都取
      // collection），因此无 DOM 环境下也算得出，不必等适配器把条目挂上来。
      entry: ['setInitialFocusedPath'],
      exit: ['clearFocusedPath'],
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
        // 多选选完接着挑：浮层不收起，焦点也留在列里。
        // 分支同样不收起——changeOnSelect 打开时它落值，关掉时那一下只是展开子列，
        // 两种情形下用户都还要接着往右挑。只有叶子才是「挑完了」，走与 CLOSE 相同的收口。
        'ITEM.SELECT': [
          { guard: 'isMultiple', actions: ['selectPath'] },
          { guard: 'staysOpenOnSelect', actions: ['selectPath'] },
          { guard: 'isOpenControlled', actions: ['selectPath', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['selectPath', 'setReturnFocus', 'invokeOnClose'] },
        ],
        // 持有焦点的条目被移出 DOM：锚点已悬空，就地按当前数据重挑一个，
        // 否则没有条目认领 tabindex=0、方向键也失去起点
        'ITEM.LOST': { actions: ['clearFocusedPath', 'setInitialFocusedPath'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isMultiple: ({ prop }) => !!prop('multiple'),
      // 分支选完不收起：changeOnSelect 打开时它落了值，关掉时它只展开了子列，
      // 无论哪种用户都还要接着往右挑
      staysOpenOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return false
        return !!cascaderNodeAt(prop('collection') ?? [], e.path)?.branch
      },
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
       * 展开那一刻把列铺开、把焦点锚点挑好。全程纯计算：顺序与禁用都取 collection，
       * 因此无 DOM 环境（纯逻辑测试、SSR）下也算得出，不必等适配器把条目挂上来。
       *
       * 有选中路径就一路展到它所在的那一列，焦点落在它自己身上；它已禁用或路径过期时
       * 退回本列首个可停留条目。first/last 两个意图从根列进，不理会选中值。
       */
      setInitialFocusedPath: ({ prop, context }) => {
        const collection = prop('collection') ?? []
        const intent = context.get('focusIntent')
        const selected = context.get('value')[0] ?? []
        const fromRoot = intent === 'first' || intent === 'last'
        const anchorPath = fromRoot ? [] : [...selected]
        const columns = cascaderBuildColumns(collection, anchorPath)
        // 锚点条目所在的那一列；选中路径过期、走不通时退回最后一列
        const level = Math.min(Math.max(0, anchorPath.length - 1), columns.length - 1)
        const column = columns[level]
        // 空集合：一列条目都没有，锚点留空，容器兜底进 Tab 序列
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
        // 展开路径跟着落点走，不跟着选中值走：选中条目被禁用而落点退回了首项时，
        // 右边那一列要露的是首项的子节点，不是那个停不住的选中项的
        context.set('activePath', picked ? [...picked.path] : [])
        context.set('focusedPath', picked ? [...picked.path] : null)
      },

      /**
       * 焦点落到第 level 列的某个条目上：展开路径就地截到第 level 段并换成它，
       * 它右边原有的列一律砍掉，它自己的子列随之顶上。
       *
       * 焦点与展开绑死，键盘的每一个落点就都是「这一帧已经露着面」的条目——
       * 右方向键要进的那一列，在按下之前就已经因为焦点停在它父条目上而开着了。
       */
      setFocusedPath: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.FOCUS')
          return
        const path = cascaderTruncatePath(context.get('activePath'), e.level, e.value)
        context.set('activePath', path)
        context.set('focusedPath', path)
      },

      // 只展开不移焦点：指针划过时鼠标不该把键盘焦点抢走
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
        // 分支只有在 changeOnSelect 打开时才落值；关掉时点分支纯粹是展开子列
        if (meta?.branch && !prop('changeOnSelect'))
          return
        const path = [...e.path]
        const current = context.get('value')
        if (prop('multiple')) {
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
            { placement: prop('placement') ?? CASCADER_DEFAULT_PLACEMENT, offset: prop('offset') },
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
          // 各列不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定落焦点为锚点条目，不交给 Tab 序列探测：探测走的是
          // focusFirst(removeLinks(...))，条目写成 <a> 时会被整体过滤掉，
          // 落焦就会掉到容器上而不是锚点条目。
          // 这里每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试到 DOM 就位
          initialFocus: () => {
            const path = context.get('focusedPath')
            return findCascaderItemEl(refs.get('getContentEl')(), path?.[path.length - 1] ?? null)
          },
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
