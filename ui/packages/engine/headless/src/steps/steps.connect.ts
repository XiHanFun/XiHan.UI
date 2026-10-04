/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 steps 相关实现。

import type { ItemQuery, NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { StepNodeMeta, StepsApi, StepsItemProps, StepsItemState, StepsSchema, StepsVariant } from './steps.types'
import { contains, createPressTracker, dataAttr, DIAGNOSTIC_CODES, focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems, reportDiagnostic } from '@xihan-ui/core'
import { STEPS_EN_US } from '../locale/en-US'
import { resolveTranslations } from '../shared/translations'
import { stepsAnatomy } from './steps.anatomy'
import { clampStep, normalizeStepCount } from './steps.machine'

const parts = stepsAnatomy.build()

// 集合容器是 list 不是 root，按归属过滤嵌套 Steps 才互不吞并；content 在 list 之外，不入导航。
const ITEM_QUERY: ItemQuery = { scope: stepsAnatomy.name, part: 'trigger' }

/**
 * 当前步的完成比例：夹进 [0, 100]。进度环只画在序号圆点上，点状形态的圆点不盛内容、画不下它；
 * 这两种写错与非有限数都报 steps.option-ignored，并按没给处理。
 */
function resolvePercent(percent: number | undefined, variant: StepsVariant): number | null {
  if (percent == null)
    return null
  const issue = !Number.isFinite(percent)
    ? `percent 取 0–100 的有限数，收到 ${String(percent)}，这次按没给处理`
    : variant === 'dot'
      ? 'percent 只画在序号圆点上：点状形态的圆点不盛内容、画不下进度环，这次按没给处理'
      : null
  if (issue) {
    reportDiagnostic({ code: DIAGNOSTIC_CODES.stepsOptionIgnored, level: 'error', scope: stepsAnatomy.name, message: issue, detail: { percent, variant } })
    return null
  }
  return Math.min(100, Math.max(0, percent))
}

export function connectSteps<T extends PropTypes>(
  service: Service<StepsSchema>,
  normalize: NormalizeProps<T>,
): StepsApi<T> {
  const { context, prop, send, scope } = service

  // collection 推出的步骤元信息：标题、说明、状态与禁用都在这里定案，条目部件只报下标
  const collection: StepNodeMeta[] = (prop('collection') ?? []).map((node, index) => ({
    index,
    title: node.title ?? '',
    description: node.description,
    status: node.status,
    tone: node.tone,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.index, meta]))
  const statuses = prop('statuses')
  const tones = prop('tones')

  // 步数缺省取 collection 的长度：只交数据时不必再报一遍总步数
  const count = normalizeStepCount(prop('count') ?? (collection.length || undefined))
  // 显示用的步序一律夹过：count 改小后内部值会停在一个已不存在的步上
  const value = clampStep(context.get('value'), count)
  const focusedStep = context.get('focusedStep') ?? null
  // roving tabindex 的唯一锚点：焦点在组内时跟着焦点光标走，否则落在当前步
  const anchor = focusedStep ?? value
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const linear = !!prop('linear')
  const disabled = !!prop('disabled')
  // 只读展示：换成有序列表语义，trigger 只排版，不聚焦、不接事件、不置灰
  const readOnly = !!prop('readOnly')
  const loop = !!prop('loop')
  // 标记形态不写时显式落 number：root 与圆点上始终带 data-variant，嵌套的步骤条各认各的形态
  const variant = prop('variant') ?? 'number'
  const translations = resolveTranslations(STEPS_EN_US, prop('translations'))
  const listLabel = translations.list
  const percent = resolvePercent(prop('percent'), variant)
  const progressLabel = translations.progressLabel
  const progressValueText = translations.progressValueText
  const complete = count > 0 && value >= count

  const triggerId = (index: number): string => scope.partId(stepsAnatomy.name, `trigger:${index}`)
  const contentId = (index: number): string => scope.partId(stepsAnatomy.name, `content:${index}`)
  const indicatorId = (index: number): string => scope.partId(stepsAnatomy.name, `indicator:${index}`)

  const getItemState = (item: StepsItemProps): StepsItemState => {
    const completed = item.index < value
    const current = item.index === value
    const meta = metaOf.get(item.index)
    // 显式指定的状态优先，其次 collection，最后按步序算
    const status = statuses?.[item.index] ?? meta?.status
      ?? (completed ? 'completed' : current ? 'current' : 'incomplete')
    return {
      index: item.index,
      status,
      // 单步语气与状态互不相干：被打回的那一步照样可以是 current 或 completed
      tone: tones?.[item.index] ?? meta?.tone,
      completed,
      current,
      // 四条独立判据：整组禁用、作者标禁用、collection 里标的禁用、linear 下 index > value 未解锁
      disabled: disabled || !!item.disabled || !!meta?.disabled || (linear && item.index > value),
    }
  }

  /**
   * 完成比例只属于正停着的那一步，且那一步显示的仍是 current（statuses 把它改成别的状态时不画）；
   * 走到完成位时没有这一步。
   */
  const carriesProgress = (s: StepsItemState): boolean => percent != null && s.current && s.status === 'current'

  /**
   * 方向键落点：条目集合只在事件那一刻读活 DOM，顺序即文档序；起点用锚点，不回绕。
   * linear 下未解锁的 trigger 自报 aria-disabled，导航原语会跳过它们。
   * 锚点的推进交给落点条目自己的 onFocus，聚焦失败时锚点不会跟着说谎。
   */
  const navigate = (list: HTMLElement, intent: NavIntent): void => {
    focusItem(navigateItems(queryItems(list, ITEM_QUERY), String(anchor), intent, { loop }))
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

  // 按压通道：真源是机器 context 里「正被按住的那一步」（按下标记），每个 trigger 各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档（行换面、圆点随行读
  // 宿主 host 槽换底）。trigger 是原生按钮，Space 与 Enter 都是激活键，两键都进按压通道；该步自身的禁用
  // （含 linear 未解锁）只有 connect 知道，随 PRESS.START 带给机器的守卫
  const pressedStep = context.get('pressedStep')
  const press = (item: StepsItemProps, itemDisabled: boolean): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedStep') === item.index,
    onChange: down => send(down
      ? { type: 'PRESS.START', step: item.index, disabled: itemDisabled }
      : { type: 'PRESS.END', step: item.index }),
  })

  /** 确认键：认焦点当下所在的 trigger，自报禁用的（含 linear 未解锁）不认。 */
  const activate = (event: KeyboardEvent): void => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>(parts.trigger.selector)
    const next = itemValue(trigger)
    if (!trigger || next == null || isItemDisabled(trigger))
      return
    event.preventDefault()
    send({ type: 'VALUE.SET', value: Number(next) })
  }

  return {
    value,
    count,
    collection,
    complete,
    focusedStep,
    readOnly,
    getItemState,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    goToNextStep: () => send({ type: 'STEP.NEXT' }),
    goToPrevStep: () => send({ type: 'STEP.PREV' }),

    // 视觉轴只写在 root 上，子部件靠继承私有槽消费
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-complete': dataAttr(complete),
      // 一步都没声明时步序被夹死在 0，打个标记供作者排查
      'data-empty': dataAttr(count === 0),
    }),

    // 键盘全在 list 上收口，条目只管声明自己。
    // 角色用 tablist/tab/tabpanel；第几步另由 trigger 上的 aria-current=step 与 posinset/setsize 说明。
    // 只读展示没有可操作的条目：换成有序列表，不进 Tab 序列、不接键盘
    getListProps: () => readOnly
      ? normalize.element({
          ...parts.list.attrs,
          'role': 'list',
          'aria-label': listLabel,
          'data-orientation': orientation,
        })
      : normalize.element({
          ...parts.list.attrs,
          'role': 'tablist',
          // 作者给了名字才写：省略时读屏只报角色，指向不存在的名字更糟
          'aria-label': listLabel,
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
        // 只读展示下一步就是有序列表里的一项，当前步由它自己说
        'role': readOnly ? 'listitem' : undefined,
        'aria-current': readOnly && s.current ? 'step' : undefined,
        'data-orientation': orientation,
        'data-state': s.status,
        // 单步语气打在最外层：语气层在这一级重算颜色，indicator / title / separator 靠继承拿到
        'data-tone': s.tone,
        // 禁用标记打在最外层，后代选择器才够得着 indicator / title / description；只读展示不置灰
        'data-disabled': dataAttr(s.disabled && !readOnly),
      })
    },

    getTriggerProps: (item) => {
      const s = getItemState(item)
      // 只读展示：trigger 只是「序号 + 标题 + 说明」的排版容器，不投影 Action Control、不进 Tab 序列、不接事件
      if (readOnly) {
        return normalize.button({
          ...parts.trigger.attrs,
          'data-state': s.status,
          'data-readonly': '',
        })
      }
      const handlers = press(item, s.disabled)
      return normalize.button({
        ...parts.trigger.attrs,
        [ITEM_VALUE_ATTR]: String(item.index),
        'id': triggerId(item.index),
        'type': 'button',
        'role': 'tab',
        // 序号 + 标题 + 说明的整块内容行归行级：接 Action Control row 档、ghost 形态，按下只换面不缩放；
        // 圆点是行内 aria-hidden 的格状当前标记，不投影配方，随触发器读宿主的 host 槽换面
        'data-xh-action-control': '',
        'data-xh-action-profile': 'row',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': prop('size') ?? 'md',
        'aria-selected': s.current ? 'true' : 'false',
        // aria-current 取值是词不是布尔，省略即不是当前项；与 aria-selected 并存，读屏两句都念
        'aria-current': s.current ? 'step' : undefined,
        'aria-controls': contentId(item.index),
        // tab 的子节点对读屏是纯展示的，圆点里放不了一个 progressbar：当前步的完成比例改作触发器的描述，
        // 由圆点的名字供给（圆点本身仍对读屏隐藏，直接引用的隐藏节点照样参与描述计算）
        'aria-describedby': carriesProgress(s) ? indicatorId(item.index) : undefined,
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
        // Space / Enter 与触屏按住投影 data-pressed，皮肤的按下面同时认它与指针 :active；与步序互相独立
        'data-pressed': dataAttr(pressedStep === item.index),
        'onClick': () => {
          if (!s.disabled)
            send({ type: 'VALUE.SET', value: item.index })
        },
        'onFocus': () => send({ type: 'TRIGGER.FOCUS', step: item.index }),
        // 确认键的切步在 list 的 keydown 里收口；这里只把同一个 keydown 先交给跟踪器
        'onKeyDown': handlers.onKeyDown,
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },

    // 序号圆点是纯视觉的，第 k 步共 n 步已由 posinset/setsize 说明，不参与名字计算。
    // 形态写在圆点自己身上：点状的规则落在它身上，嵌在面板里的另一台步骤条不被外层的形态波及
    getIndicatorProps: (item) => {
      const s = getItemState(item)
      const base = {
        ...parts.indicator.attrs,
        'data-variant': variant,
        'data-state': s.status,
        // 首帧就走过、此后没被回退到的步：对号直接呈现；此后才走过的步对号淡入
        'data-instant': dataAttr(item.index < context.get('untouchedBelow')),
        // 不带进度的圆点显式撤掉比例：Web Components 按键写内联样式，换步后上一步的比例不能留在节点上
        'style': { '--xh-_steps-progress': undefined },
      }
      if (percent == null || !carriesProgress(s))
        return normalize.element({ ...base, 'aria-hidden': true })
      const valueText = progressValueText(Math.round(percent))
      // 当前步外画一圈进度环：比例（0–1）写进内联样式，皮肤按它画弧
      const progress = { ...base, 'id': indicatorId(item.index), 'data-progress': dataAttr(true), 'style': { '--xh-_steps-progress': String(percent / 100) } }
      // 只读展示是有序列表，列表项的子节点照常可达：圆点本身就是一个进度条（APG progressbar）
      if (readOnly) {
        return normalize.element({
          ...progress,
          'role': 'progressbar',
          'aria-label': progressLabel,
          'aria-valuemin': '0',
          'aria-valuemax': '100',
          'aria-valuenow': String(percent),
          'aria-valuetext': valueText,
        })
      }
      // 可操作时圆点在 tab 里，只作触发器描述的来源：对读屏隐藏，名字就是那句比例
      return normalize.element({ ...progress, 'role': 'img', 'aria-label': valueText, 'aria-hidden': true })
    },

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
    // 只读展示没有 tab 可指：面板只随步序显隐，不带 tabpanel 语义
    getContentProps: item => normalize.element({
      ...parts.content.attrs,
      'id': contentId(item.index),
      'role': readOnly ? undefined : 'tabpanel',
      'aria-labelledby': readOnly ? undefined : triggerId(item.index),
      'tabindex': readOnly ? undefined : 0,
      'hidden': item.index !== value || undefined,
      'data-state': getItemState(item).status,
    }),
  }
}
