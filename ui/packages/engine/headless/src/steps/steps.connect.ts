import type { ItemQuery, NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { StepsApi, StepsItemProps, StepsItemState, StepsSchema } from './steps.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { stepsAnatomy } from './steps.anatomy'
import { clampStep, normalizeStepCount } from './steps.machine'

const parts = stepsAnatomy.build()

// 集合容器是 list 不是 root，按归属过滤嵌套 Steps 才互不吞并；content 在 list 之外，不入导航。
const ITEM_QUERY: ItemQuery = { scope: stepsAnatomy.name, part: 'trigger' }

export function connectSteps<T extends PropTypes>(
  service: Service<StepsSchema>,
  normalize: NormalizeProps<T>,
): StepsApi<T> {
  const { context, prop, send, scope } = service

  const count = normalizeStepCount(prop('count'))
  // 显示用的步序一律夹过：count 改小后内部值会停在一个已不存在的步上
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
      // 三条独立判据：整组禁用、作者标禁用、linear 下 index > step 未解锁
      disabled: disabled || !!item.disabled || (linear && item.index > step),
    }
  }

  /**
   * 方向键落点：条目集合只在事件那一刻读活 DOM，顺序即文档序；起点用锚点，不回绕。
   * linear 下未解锁的 trigger 自报 aria-disabled，导航原语会跳过它们。
   * 锚点的推进交给落点条目自己的 onFocus，聚焦失败时锚点不会跟着说谎。
   */
  const navigate = (list: HTMLElement, intent: NavIntent): void => {
    focusItem(navigateItems(queryItems(list, ITEM_QUERY), String(anchor), intent, { loop: false }))
  }

  /**
   * 焦点从组外落到容器时转投给条目：优先回到锚点那一步，
   * 锚点没有对应节点时退回首个可停留条目。
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

    // 视觉轴只写在 root 上，子部件靠继承私有槽消费
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-complete': dataAttr(complete),
      // 一步都没声明时步序被夹死在 0，打个标记供作者排查
      'data-empty': dataAttr(count === 0),
    }),

    // 键盘全在 list 上收口，条目只管声明自己。
    // 角色用 tablist/tab/tabpanel；第几步另由 trigger 上的 aria-current=step 与 posinset/setsize 说明。
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'role': 'tablist',
      'aria-orientation': orientation,
      'data-orientation': orientation,
      // 显式 true/false：省略是"没说"，显式 false 是"明确说了不是"
      'aria-disabled': disabled ? 'true' : 'false',
      // 焦点在组外时容器兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedStep 而非 anchor：anchor 可能指向没有对应条目的步序，那时无人认领 tabindex=0。
      // 整组禁用时不给兜底。
      'tabindex': disabled ? undefined : (focusedStep == null ? 0 : -1),
      'onKeydown': (event: KeyboardEvent) => {
        if (disabled)
          return
        // 轴跟随 orientation；不归导航管的键绝不 preventDefault。dir 只作用于水平轴
        const intent = navIntentFromKey(event, { axis: orientation, dir })
        if (intent) {
          event.preventDefault()
          navigate(event.currentTarget as HTMLElement, intent)
          return
        }
        // 方向键只搬焦点、不改步序，切步要靠确认键
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
        // 禁用标记打在最外层，后代选择器才够得着 indicator / title / description
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
        // aria-current 取值是词不是布尔，省略即不是当前项；与 aria-selected 并存，读屏两句都念
        'aria-current': s.current ? 'step' : undefined,
        'aria-controls': contentId(item.index),
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
        'aria-disabled': s.disabled ? 'true' : 'false',
        // 第 k 步共 n 步；count 为 0 时两个都不写，aria-setsize="0" 等于声明集合是空的
        'aria-posinset': count > 0 ? item.index + 1 : undefined,
        'aria-setsize': count > 0 ? count : undefined,
        // roving tabindex：整组只有锚点条目留在 Tab 序列内。
        // 整组禁用时全给 -1 而不是不写，原生 button 不写 tabindex 照样可聚焦
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

    // 序号圆点是纯视觉的，第 k 步共 n 步已由 posinset/setsize 说明，不参与名字计算
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-state': getItemState(item).status,
    }),

    // title / description 不产出 id、不做 trigger 的 aria-labelledby：作者未必都渲染，
    // 指向不存在的 id 会让 trigger 没有名字；它们是 trigger 的后代文本，已计入名字。
    getTitleProps: item => normalize.element({
      ...parts.title.attrs,
      'data-state': getItemState(item).status,
    }),

    getDescriptionProps: item => normalize.element({
      ...parts.description.attrs,
      'data-state': getItemState(item).status,
    }),

    // 连接线属于它前面那一步，走过了就点亮整条
    getSeparatorProps: item => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': true,
      'data-orientation': orientation,
      'data-state': getItemState(item).status,
    }),

    // 全部面板常挂靠 hidden 显隐，不做懒挂载，面板内的滚动位置与表单态才留得住。
    // 走到完成位时所有步骤面板收起，index 等于 count 的面板即完成页。
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
