import type { Placement, PositionResult } from '@xihan-ui/core'
import type { MenubarFocusIntent, MenubarSchema } from './menubar.types'
import {
  createDismissLayer,
  createFocusScope,
  createTypeahead,
  focusItem,
  itemValue,
  navigateItems,
  queryItems,
} from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { menubarItemQuery, menubarTriggerQuery } from './menubar.anatomy'

const { createMachine } = setup<MenubarSchema>()

/** 未指定 placement 时的落位：菜单沿 trigger 起始缘向下展开。定位引擎与 connect 共用这一个缺省。 */
export const MENUBAR_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/**
 * 菜单栏 = 一排 trigger + 同时只展开一张的浮层菜单。
 *
 * "哪一项展开着"住在 context 的 cell 里、不编进状态：cell 本身就是受控/非受控的收口点
 * （value prop 给定即受控，读直取 prop，写只发 onValueChange 不落内部值）。
 * 而层与定位这两样副作用必须严格跟着"有没有菜单展开"起落，那需要一个状态。
 * 两者用单向派生黏起来：用户事件只改 value，watch 追到变化后派影子事件 SYNC.* 转移状态。
 * 受控时 value 要等宿主写回才变，状态也就跟着晚一拍——两条路上不会出现"状态说开着、值说没开"。
 */
export const menubarMachine = createMachine({
  name: 'menubar',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 两个焦点锚点都不受控、不对外通知：一个服务菜单栏那排 trigger 的 roving tabindex，
    // 一个服务展开菜单内的条目导航
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    focusedItem: cell<string | null>(() => ({ defaultValue: null })),
    // 挂载即展开（defaultValue）不该抢焦点，故缺省是 none 而不是 first
    focusIntent: cell<MenubarFocusIntent>(() => ({ defaultValue: 'none' })),
    // 最近一次「不是用户显式点出来的」展开是哪一项：掠过与聚焦换项都记在这儿。
    // 刻意是不受控的自有 cell——受控时 value 直读宿主 prop，宿主写回之前一直是旧的，
    // 拿它当判据会落空（见下面 shouldAbsorbToggle 的说明）
    autoValue: cell<string | null>(() => ({ defaultValue: null })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    getRootEl: () => null,
    typeahead: createTypeahead(),
    reanchor: null,
  }),
  // 与 cell 同一套受控判据：显式给了 value（哪怕是 null）就以它为准，没给才看 defaultValue
  initialState: ({ prop }) => {
    const value = prop('value') !== undefined ? prop('value') : prop('defaultValue')
    return value != null ? 'open' : 'idle'
  },
  // 展开项一变就重算：状态该不该跳、定位该不该重挂、条目锚点该落哪儿，全在这一个出口收口
  watch: ({ track, context, action }) => {
    track([context.dep('value')], () => action(['syncOpenState']))
  },
  on: {
    // 三条"收起"的公共出口。已经收起时 clearValue 是空操作（cell 值没变即不通知），
    // 因此消解层与 focusout 各报一次也不会把同一个意图发两遍。
    'CLOSE': { actions: ['setReturnFocus', 'clearValue'] },
    'MENUBAR.BLUR': { actions: ['setReturnFocus', 'clearFocusedValue', 'clearValue'] },
    'VALUE.SET': { actions: ['setValueFromEvent'] },
  },
  states: {
    idle: {
      on: {
        'TRIGGER.TOGGLE': { actions: ['openFromEvent'] },
        'TRIGGER.OPEN': { actions: ['openFromEvent'] },
        // 一片空白时掠过不展开：不匹配守卫就没有转移，指针横穿整条菜单栏什么也不会弹出来
        'TRIGGER.POINTER': { guard: 'hasValue', actions: ['setFocusedValue', 'switchValue'] },
        'TRIGGER.FOCUS': { actions: ['setFocusedValue'] },
        'SYNC.OPEN': { target: 'open' },
      },
    },
    open: {
      // 键盘入口的条目锚点在进入展开态时就位：条目常挂（收起时只是 hidden），此刻查到的顺序即最终顺序。
      // 锚点定了才有条目认领 tabindex=0，焦点域随后把焦点交给它。
      entry: ['setInitialFocusedItem'],
      // 焦点先归还再清锚点：归还的目标正是 focusedValue 指的那个 trigger
      exit: ['restoreTriggerFocus', 'clearFocusedItem', 'clearTypeahead'],
      effects: ['trackPosition', 'trackLayer'],
      on: {
        // 一次点击到达这里是两拍：浏览器（与夹具）先给 trigger 焦点、再派 click，
        // 上面那条 TRIGGER.FOCUS 已经把展开项换过去了。这一拍若不先吸收掉，
        // isCurrent 会把它当成"再点一次"，展开完当场又收起。
        // 吸收后清掉 autoValue：紧接着真的再点一次，就会落到 isCurrent 那条上正常收起。
        'TRIGGER.TOGGLE': [
          { guard: 'shouldAbsorbToggle', actions: ['clearAutoValue'] },
          { guard: 'isCurrent', actions: ['setReturnFocus', 'clearValue'] },
          { actions: ['openFromEvent'] },
        ],
        'TRIGGER.OPEN': { actions: ['openFromEvent'] },
        // 打开态传染：已经有菜单展开着，掠过别的 trigger 就直接切换过去，不用点也不等延时
        'TRIGGER.POINTER': { actions: ['setFocusedValue', 'switchValue'] },
        // 方向键在 trigger 之间走时焦点会落到相邻 trigger 上，展开项跟着搬家
        'TRIGGER.FOCUS': [
          { guard: 'shouldSwitch', actions: ['setFocusedValue', 'switchValue'] },
          { actions: ['setFocusedValue'] },
        ],
        // 选中即收起：先发选中详情（此刻 value 还在，认得出是哪张菜单），再走与 CLOSE 相同的收口
        'ITEM.SELECT': { actions: ['invokeOnSelect', 'setReturnFocus', 'clearValue'] },
        'ITEM.FOCUS': { actions: ['setFocusedItem'] },
        // 焦点条目被移出 DOM：锚点已悬空，就地按当前活条目重挑一个，
        // 否则没有条目认领 tabindex=0、方向键也失去起点
        'ITEM.LOST': { actions: ['clearFocusedItem', 'setInitialFocusedItem'] },
        'SYNC.CLOSE': { target: 'idle' },
      },
    },
  },
  implementations: {
    guards: {
      // value 与 defaultValue 皆缺省时 cell 初值是 undefined，先归一再判
      hasValue: ({ context }) => (context.get('value') ?? null) != null,
      // 只认 autoValue，绝不拿 value 做判据：受控时 value 直读宿主 prop，
      // 宿主写回之前一直是旧的，判据落空就会把同一个意图发两遍。
      shouldAbsorbToggle: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.TOGGLE' && e.value === context.get('autoValue')
      },
      isCurrent: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.TOGGLE' && e.value === (context.get('value') ?? null)
      },
      // 焦点落到别的 trigger 上才算换项。禁用项不认：它仍可聚焦、仍是方向键起点，
      // 但绝不该把菜单展开到一个被禁用的项上
      shouldSwitch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TRIGGER.FOCUS' || e.disabled)
          return false
        const value = context.get('value') ?? null
        return value != null && e.value !== value
      },
    },
    actions: {
      /**
       * 状态跟着展开项走的唯一出口。
       * 换项时状态不重入——层与消解层原地不动（它们读的是"当前展开项"的活 getter），
       * 只把定位挪过去、条目锚点按新菜单重挑。
       */
      syncOpenState: ({ context, state, send, action }) => {
        const value = context.get('value') ?? null
        const open = state.get() === 'open'
        if (value == null) {
          if (open)
            send({ type: 'SYNC.CLOSE' })
          return
        }
        if (!open) {
          send({ type: 'SYNC.OPEN' })
          return
        }
        action(['reanchor', 'clearFocusedItem', 'setInitialFocusedItem'])
      },

      openFromEvent: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TRIGGER.OPEN' && e.type !== 'TRIGGER.TOGGLE')
          return
        // 点击与 Enter 都是 none：焦点本就在 trigger 上，展开那一刻不该有条目带着高亮，
        // 更不该把焦点从菜单栏抢进浮层
        context.set('focusIntent', e.type === 'TRIGGER.OPEN' ? (e.focus ?? 'first') : 'none')
        context.set('focusedValue', e.value)
        context.set('value', e.value)
        // 显式激活出来的展开不算"自动"：紧接着再点一次就该收起
        context.set('autoValue', null)
      },
      // 掠过/聚焦换项：焦点归 trigger，不预先高亮任何条目
      switchValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TRIGGER.POINTER' && e.type !== 'TRIGGER.FOCUS')
          return
        context.set('focusIntent', 'none')
        context.set('value', e.value)
        // 记下这一项是掠过/聚焦自动弹出来的：随后紧跟的那一拍 click 要被吸收掉
        context.set('autoValue', e.value)
      },
      // 程序化改写不动 roving 锚点：焦点并没有跟着搬过去，
      // 让 root 继续兜着 Tab 位，键盘进来时再由它转投给展开项的 trigger
      setValueFromEvent: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('focusIntent', 'none')
        context.set('value', e.value)
        context.set('autoValue', null)
      },
      clearValue: ({ context }) => {
        context.set('value', null)
        context.set('autoValue', null)
      },
      clearAutoValue: ({ context }) => context.set('autoValue', null),

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.POINTER' || e.type === 'TRIGGER.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场即清锚点：root 据此重新认领 Tab 位，下次 Tab 才进得来
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),

      setFocusedItem: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedItem', e.value)
      },
      clearFocusedItem: ({ context }) => context.set('focusedItem', null),
      setInitialFocusedItem: ({ refs, context, state, flush }) => {
        const pick = (): void => {
          // 指针与点击入口不预先落焦：焦点留在 trigger 上，第一下方向键再从空锚点起步，
          // 正好落到首/末个可用条目
          if (context.get('focusIntent') === 'none')
            return
          const content = refs.get('getContentEl')()
          // 无 DOM 环境（纯逻辑测试）：锚点留空，状态转移不受影响
          if (!content)
            return
          const items = queryItems(content, menubarItemQuery)
          // first/last 都从边界起步找第一个可停留条目，禁用项自动跳过，与 loop 无关
          context.set('focusedItem', itemValue(navigateItems(items, null, context.get('focusIntent') === 'last' ? 'last' : 'first')))
        }
        pick()
        // 初始即展开时，WC 侧条目的身份标记要等首次 wire() 才写上，这一刻查不到任何条目、
        // 锚点会落空（Vue 侧首帧就带这些属性，不补这一手两个适配器就分叉）。
        // 已经挑到就不再挑；挑的过程中若菜单已收起也不补。
        flush(() => {
          if (state.get() === 'open' && context.get('focusedItem') == null)
            pick()
        })
      },

      // 每次收起都重算：Tab 与层外交互是"人已经去别处了"，此时抢回焦点会把光标从他刚点的
      // 输入框里拽走、后续敲的第一个字符直接丢掉；Escape、选中条目、再点 trigger 则一律归还。
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'MENUBAR.BLUR'
          || (e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside'))
        context.set('returnFocus', !handedOff)
      },
      /**
       * 收起时把焦点还给当前那一项的 trigger。
       *
       * 不交给焦点域的 restoreFocus：它还的是"焦点域挂载那一刻的元素"，
       * 而菜单栏在展开期间会换项（掠过隔壁 trigger 即切换），还回去的会是最初那一项。
       * 归还目标只能是 roving 锚点当下指着的那个 trigger。
       */
      restoreTriggerFocus: ({ refs, context }) => {
        if (!context.get('returnFocus'))
          return
        const root = refs.get('getRootEl')()
        const value = context.get('focusedValue')
        if (!root || value == null)
          return
        focusItem(queryItems(root, menubarTriggerQuery).find(el => itemValue(el) === value) ?? null)
      },

      invokeOnSelect: ({ prop, context, event }) => {
        const e = event.current()
        const menu = context.get('value') ?? null
        if (e.type === 'ITEM.SELECT' && menu != null)
          prop('onSelect')?.({ menu, value: e.value })
      },
      // 菜单收起也得丢缓冲：否则下次打开第一个字母会被拼进上一轮的查询串
      clearTypeahead: ({ refs }) => refs.get('typeahead').clear(),
      reanchor: ({ refs }) => refs.get('reanchor')?.(),
    },
    effects: {
      /**
       * 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
       * 换项时锚点与浮层都换了元素，靠 reanchor 重挂——旧订阅必须先撤，
       * 引擎的 autoUpdate 会一直跟着旧锚点算，留着就是两套位置轮流写。
       */
      trackPosition: ({ refs, prop, context, flush }) => {
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
          stop?.()
          stop = undefined
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            { placement: prop('placement') ?? MENUBAR_DEFAULT_PLACEMENT, offset: prop('offset') },
            result => context.set('position', result),
          )
        }

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身的尺寸——placement=top 会正好错位一个浮层高度。
        // 同一拍里的多次请求合并成一次：换项时值与状态是一起变的，否则要白挂两回。
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
       * 层的入栈出栈与消解层、焦点域绑在同一个效应里：三者生命周期必须完全一致。
       * 层只在有菜单展开期间入栈——消解层只让栈顶响应 Escape，若层在挂载期就注册、
       * 与开合无关地常驻栈里，同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死。
       */
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

        /**
         * 焦点域只为一件事而建：把焦点送进刚展开的菜单。
         * 因此只有键盘入口（focusIntent 不是 none）才建它——指针与点击展开时焦点本就该
         * 留在 trigger 上（掠过一排 trigger 换菜单是菜单栏的日常），挂载即展开（defaultValue）
         * 更不该在页面刚加载时把焦点抢进浮层。
         * 内容此刻可能还带着 hidden（查不到可聚焦元素），焦点域自带逐帧重试，等得到 DOM 就位。
         */
        const focus = context.get('focusIntent') === 'none'
          ? null
          : createFocusScope({
              config,
              layer,
              // 每次读最新 ref，容器晚一拍就位、或中途换了菜单都能命中
              container: () => refs.get('getContentEl')(),
              // 菜单不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否收起
              trapped: () => false,
              loop: false,
              // 显式指定落焦点为锚点条目，不交给 Tab 序列探测：探测走的是
              // focusFirst(removeLinks(...))，条目写成 <a> 时会被整体过滤掉，
              // 落焦就会掉到 content 容器上而不是首个条目。
              initialFocus: () => {
                const content = refs.get('getContentEl')()
                const anchor = context.get('focusedItem')
                if (!content || anchor == null)
                  return null
                return queryItems(content, menubarItemQuery).find(el => itemValue(el) === anchor) ?? null
              },
              // 焦点归还由 restoreTriggerFocus 收口：菜单栏会换项，焦点域还的是最初那一项
              restoreFocus: () => false,
            })

        // 逆序拆：先撤依赖层的两个订阅，最后才把层本身移出栈
        return () => {
          focus?.dispose()
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
