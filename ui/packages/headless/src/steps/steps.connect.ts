import type { ItemQuery, NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { StepsApi, StepsItemProps, StepsItemState, StepsSchema } from './steps.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { stepsAnatomy } from './steps.anatomy'
import { clampStep, normalizeStepCount } from './steps.machine'

const parts = stepsAnatomy.build()

// 集合容器是 list 不是 root：trigger 归属于 list，按归属过滤才切得干净（嵌套 Steps 互不吞并）。
// content 挂在 list 之外，因此永远不会被当成导航条目。
const ITEM_QUERY: ItemQuery = { scope: stepsAnatomy.name, part: 'trigger' }

export function connectSteps<T extends PropTypes>(
  service: Service<StepsSchema>,
  normalize: NormalizeProps<T>,
): StepsApi<T> {
  const { context, prop, send, scope } = service

  const count = normalizeStepCount(prop('count'))
  // 显示用的步序一律夹过：宿主把 count 改小之后内部值会停在一个已不存在的步上，
  // 不夹的话没有任何一步是 current，面板也会全部收起
  const step = clampStep(context.get('step'), count)
  const focusedStep = context.get('focusedStep') ?? null
  // roving tabindex 的唯一锚点：焦点在组内时跟着焦点光标走，否则落在当前步
  const anchor = focusedStep ?? step
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const linear = !!prop('linear')
  const disabled = !!prop('disabled')
  const complete = count > 0 && step >= count

  const triggerId = (index: number): string => scope.partId(stepsAnatomy.name, `trigger:${index}`)
  const contentId = (index: number): string => scope.partId(stepsAnatomy.name, `content:${index}`)

  const getItemState = (item: StepsItemProps): StepsItemState => {
    const completed = item.index < step
    const current = item.index === step
    return {
      index: item.index,
      status: completed ? 'completed' : current ? 'current' : 'incomplete',
      completed,
      current,
      // 三条路各自独立：整组禁用、作者给这一步标了禁用、linear 下这一步还没解锁。
      // 未解锁的判据是 index > step——已走过的与当前这一步都点得动，回头看是允许的。
      disabled: disabled || !!item.disabled || (linear && item.index > step),
    }
  }

  /**
   * 方向键落点：条目集合只在事件那一刻读，两个适配器此时看到的是同一份活 DOM，
   * 顺序即文档序。起点用锚点（作者声明的步序），终点用活 DOM 算。
   *
   * 不回绕：步骤是一条有始有终的路径，从末步绕回首步不是任何人的预期。
   * linear 下未解锁的 trigger 自报 aria-disabled，导航原语会跳过它们——
   * 于是"往前走"自然停在当前步上，不需要在这里再判一次。
   *
   * 锚点的推进交给落点条目自己的 onFocus：焦点是 DOM 的事实，
   * 让它只有一个来源，聚焦失败（节点已被移走）时锚点也就不会跟着说谎。
   */
  const navigate = (list: HTMLElement, intent: NavIntent): void => {
    focusItem(navigateItems(queryItems(list, ITEM_QUERY), String(anchor), intent, { loop: false }))
  }

  /**
   * 焦点从组外落到容器时转投给条目：优先回到锚点那一步（用户上次停的位置），
   * 锚点没有对应节点时（count 与实际渲染的条目对不上、或已走到完成位）退回首个可停留条目。
   */
  const focusAnchor = (list: HTMLElement): void => {
    const items = queryItems(list, ITEM_QUERY)
    const found = items.find(el => itemValue(el) === String(anchor))
    focusItem(found ?? navigateItems(items, null, 'first', { loop: false }))
  }

  /** 确认键：认焦点当下所在的 trigger，自报禁用的（含 linear 未解锁）不认。 */
  const activate = (event: KeyboardEvent): void => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>(parts.trigger.selector)
    const next = itemValue(trigger)
    if (!trigger || next == null || isItemDisabled(trigger))
      return
    event.preventDefault()
    send({ type: 'STEP.SET', step: Number(next) })
  }

  return {
    step,
    count,
    complete,
    focusedStep,
    getItemState,
    setStep: next => send({ type: 'STEP.SET', step: next }),
    goToNextStep: () => send({ type: 'STEP.NEXT' }),
    goToPrevStep: () => send({ type: 'STEP.PREV' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-disabled': dataAttr(disabled),
      'data-complete': dataAttr(complete),
      // 一步都没声明（作者漏了 count）：步序被夹死在 0，界面上没有任何一步会被点亮。
      // 打个标记出来，比让作者对着一排全是 incomplete 的圆圈猜半天强
      'data-empty': dataAttr(count === 0),
    }),

    // 键盘全在 list 上收口：条目只管声明自己，一次冒泡一个处理器。
    // 用 tab 那一套角色（tablist/tab/tabpanel）而不是自造：步骤条的交互形态就是
    // "一排触发器切一组面板"，读屏对这套角色的支持是现成的；
    // "这是第几步"另由 trigger 上的 aria-current=step 与 posinset/setsize 说清楚。
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'role': 'tablist',
      'aria-orientation': orientation,
      'data-orientation': orientation,
      // 显式 true/false：省略是"没说"，显式 false 是"明确说了不是"
      'aria-disabled': disabled ? 'true' : 'false',
      // 焦点在组外时容器一律兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedStep 而非 anchor：anchor 可能指向一个没有对应条目的步序
      // （count 与渲染出的条目对不上、或已走到完成位），那时没有任何条目会认领 tabindex=0，
      // 若容器也退出 Tab 序列，整组对键盘用户永久不可达。
      // 整组禁用时连兜底都不给：这正是原生禁用控件该有的表现（整块脱出 Tab 序列）。
      'tabindex': disabled ? undefined : (focusedStep == null ? 0 : -1),
      'onKeydown': (event: KeyboardEvent) => {
        if (disabled)
          return
        // 轴跟随 orientation：横排步骤条里的上下键返回 null，
        // 不归导航管就绝不 preventDefault，放行给页面滚动与读屏。
        // dir 只作用于水平轴：rtl 下 ArrowRight 走上一个，纵向不受影响
        const intent = navIntentFromKey(event, { axis: orientation, dir })
        if (intent) {
          event.preventDefault()
          navigate(event.currentTarget as HTMLElement, intent)
          return
        }
        // 方向键只搬焦点、不改步序：一步走过去往往要跑校验、要发请求，
        // 让它跟着焦点自动发生，用户扫一眼步骤条就把流程推进了
        if (event.key === 'Enter' || event.key === ' ')
          activate(event)
      },
      'onFocus': (event: FocusEvent) => {
        if (disabled)
          return
        const list = event.currentTarget as HTMLElement
        // 只有从组外进入才转投；组内往外退（Shift+Tab）时转投会把人困在组里
        if (contains(list, event.relatedTarget as Node | null))
          return
        focusAnchor(list)
      },
      'onFocusout': (event: FocusEvent) => {
        const list = event.currentTarget as HTMLElement
        if (contains(list, event.relatedTarget as Node | null))
          return
        send({ type: 'LIST.BLUR' })
      },
    }),

    getItemProps: (item) => {
      const s = getItemState(item)
      return normalize.element({
        ...parts.item.attrs,
        'data-orientation': orientation,
        'data-state': s.status,
        // 禁用标记打在最外层：indicator / title / description 藏在哪一层由作者决定，
        // 从 item 往下的后代选择器一定够得着它们
        'data-disabled': dataAttr(s.disabled),
      })
    },

    getTriggerProps: (item) => {
      const s = getItemState(item)
      return normalize.button({
        ...parts.trigger.attrs,
        [ITEM_VALUE_ATTR]: String(item.index),
        'id': triggerId(item.index),
        'type': 'button',
        'role': 'tab',
        'aria-selected': s.current ? 'true' : 'false',
        // aria-current 不是布尔属性（取值是 page/step/date… 这类词），省略即"不是当前项"。
        // 与 aria-selected 并存不冗余：selected 说的是"这一格被选中了"，
        // current=step 说的是"用户此刻正处在这一步"，读屏两句都会念
        'aria-current': s.current ? 'step' : undefined,
        'aria-controls': contentId(item.index),
        // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
        // 也不派发 click，禁用策略与样式会就此分裂，方向键也再拿它当不了起点。
        'aria-disabled': s.disabled ? 'true' : 'false',
        // "第 k 步，共 n 步"。count 缺省（0）时两个都不写：写 aria-setsize="0" 是在
        // 声明"这个集合是空的"，而屏幕上明明有条目，等于对读屏说谎
        'aria-posinset': count > 0 ? item.index + 1 : undefined,
        'aria-setsize': count > 0 ? count : undefined,
        // roving tabindex：整组只有锚点条目留在 Tab 序列内。
        // 整组禁用时全给 -1 而不是不写——trigger 是原生 button，不写 tabindex 它照样可聚焦，
        // 禁用的步骤条会因此留下一整排 Tab 停靠点
        'tabindex': disabled ? -1 : (anchor === item.index ? 0 : -1),
        'data-state': s.status,
        'data-disabled': dataAttr(s.disabled),
        'onClick': () => {
          if (!s.disabled)
            send({ type: 'STEP.SET', step: item.index })
        },
        'onFocus': () => send({ type: 'TRIGGER.FOCUS', step: item.index }),
      })
    },

    // 序号圆点是纯视觉的：读屏那边"第 k 步，共 n 步"已由 trigger 上的 posinset/setsize 说了，
    // 再把圆圈里的 "2" 念一遍只是重复。它也因此不参与 trigger 的名字计算
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-state': getItemState(item).status,
    }),

    // title / description 刻意不产出 id，也不去做 trigger 的 aria-labelledby：
    // 作者未必两个都渲染，指向一个不存在的 id 会让 trigger 彻底没有名字（比没接线更糟）。
    // 它们是 trigger 的后代文本，名字计算本来就会把它们算进去。
    getTitleProps: item => normalize.element({
      ...parts.title.attrs,
      'data-state': getItemState(item).status,
    }),

    getDescriptionProps: item => normalize.element({
      ...parts.description.attrs,
      'data-state': getItemState(item).status,
    }),

    // 连接线属于它前面那一步：走过了就点亮整条，这样"进度走到哪儿"是连续的一条线，
    // 而不是一串各自为政的圆点
    getSeparatorProps: item => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': 'true',
      'data-orientation': orientation,
      'data-state': getItemState(item).status,
    }),

    // 全部面板常挂，靠 hidden 显隐：不做懒挂载，面板内的滚动位置与表单态才留得住。
    // 走到完成位（step === count）时所有步骤面板都收起，作者可以再写一个 index 等于 count
    // 的面板当完成页——它照样按同一条规则显出来
    getContentProps: item => normalize.element({
      ...parts.content.attrs,
      'id': contentId(item.index),
      'role': 'tabpanel',
      'aria-labelledby': triggerId(item.index),
      'tabindex': 0,
      'hidden': item.index !== step || undefined,
      'data-state': getItemState(item).status,
    }),
  }
}
