import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { SplitterApi, SplitterPanelState, SplitterSchema } from './splitter.types'
import { focusSafely } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { clamp } from '../shared/number'
import { splitterAnatomy } from './splitter.anatomy'
import { splitterConstraints } from './splitter.machine'
import { isCollapsed, panelRange } from './splitter.sizing'

const parts = splitterAnatomy.build()

export function connectSplitter<T extends PropTypes>(
  service: Service<SplitterSchema>,
  normalize: NormalizeProps<T>,
): SplitterApi<T> {
  const { context, prop, send, scope, state } = service

  const sizes = context.get('size')
  const constraints = splitterConstraints(prop)
  const activeIndex = context.get('activeIndex')
  const dragging = state.matches('dragging')

  const specs = prop('panels')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir') ?? 'ltr'
  const disabled = !!prop('disabled')
  const vertical = orientation === 'vertical'
  // 只有水平排布才看 dir：竖直排布上下不随文字方向换向，几何换算那边也是这条规矩
  const flipHorizontal = !vertical && dir === 'rtl'

  const lastPanel = Math.max(0, sizes.length - 1)

  /**
   * 把作者报来的下标收成一个真实存在的位置：下标是作者在部件上的声明，可能越界或是小数，
   * 不收会让 sizes[index] 变成 undefined 并写出 aria-valuenow="NaN"。
   */
  const clampPanel = (index: number): number => clamp(Math.trunc(index) || 0, 0, lastPanel)
  // 分隔条比面板少一条：第 i 条坐在第 i 与第 i+1 块之间，因此上界再退一格
  const clampBoundary = (index: number): number => clamp(Math.trunc(index) || 0, 0, Math.max(0, lastPanel - 1))

  const panelKey = (index: number): string => specs?.[index]?.id ?? String(index)
  // 经 scope 派生而不是直接用作者的名字：同页两组分栏共用一份 panels 时 DOM id 会撞车
  const panelId = (index: number): string => scope.partId(splitterAnatomy.name, `panel:${panelKey(index)}`)

  const panels: SplitterPanelState[] = sizes.map((size, index) => {
    const c = constraints[index]!
    const range = panelRange(sizes, index, constraints)
    return {
      index,
      id: panelKey(index),
      size,
      min: range.min,
      max: range.max,
      collapsible: c.collapsible,
      collapsed: isCollapsed(size, c),
    }
  })

  const fallbackPanel: SplitterPanelState = {
    index: 0,
    id: '0',
    size: 0,
    min: 0,
    max: 0,
    collapsible: false,
    collapsed: false,
  }
  const panelAt = (index: number): SplitterPanelState => panels[clampPanel(index)] ?? fallbackPanel

  // 三个角色节点共用同一份状态标记，样式层各处一致
  const stateAttrs = (): Record<string, string | undefined> => ({
    'data-orientation': orientation,
    'data-disabled': dataAttr(disabled),
    'data-dragging': dataAttr(dragging),
  })

  const togglePanel = (index: number): void => {
    const panel = panelAt(index)
    if (!panel.collapsible)
      return
    send({ type: panel.collapsed ? 'PANEL.EXPAND' : 'PANEL.COLLAPSE', index: panel.index })
  }

  // 屏幕方向转语义方向：上下两键与 dir 无关，左右两键在 rtl 下对调
  const growKey = vertical ? 'ArrowDown' : (flipHorizontal ? 'ArrowLeft' : 'ArrowRight')
  const shrinkKey = vertical ? 'ArrowUp' : (flipHorizontal ? 'ArrowRight' : 'ArrowLeft')

  return {
    size: sizes,
    panels,
    dragging,
    disabled,
    setSize: next => send({ type: 'SIZE.SET', size: next }),
    setPanelSize: (index, next) => send({ type: 'BOUNDARY.SET', index: clampBoundary(index), size: next }),
    collapsePanel: index => send({ type: 'PANEL.COLLAPSE', index: clampPanel(index) }),
    expandPanel: index => send({ type: 'PANEL.EXPAND', index: clampPanel(index) }),
    togglePanel,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...stateAttrs(),
      // 一组彼此关联的面板与分隔条，读屏据此知道它们是一伙的
      'role': 'group',
      'aria-orientation': orientation,
    }),

    getPanelProps: (index) => {
      const panel = panelAt(index)
      return normalize.element({
        ...parts.panel.attrs,
        ...stateAttrs(),
        // 分隔条的 aria-controls 指过来，这个 id 必须在
        'id': panelId(panel.index),
        'data-index': String(panel.index),
        'data-collapsed': dataAttr(panel.collapsed),
        /**
         * 排布轴上的尺寸由这里每帧写死，皮肤不要再写。
         * 用 flex-basis 百分比而非 inline-size：分隔条自身也占位置，配合 flex-shrink: 1
         * 把超出的几像素按比例摊回各块；flex-grow 显式写 0，否则会被作者的 flex: 1 盖掉。
         */
        'style': { flexBasis: `${panel.size}%`, flexGrow: '0', flexShrink: '1' },
      })
    },

    getResizeTriggerProps: (index) => {
      const boundary = clampBoundary(index)
      const panel = panelAt(boundary)
      const stepBy = (direction: 1 | -1, large: boolean): void => {
        send({ type: 'BOUNDARY.STEP', index: boundary, direction, large })
      }
      return normalize.element({
        ...parts['resize-trigger'].attrs,
        ...stateAttrs(),
        'role': 'separator',
        /**
         * 分隔条自身的朝向与面板的排布轴垂直，与 root 上的 aria-orientation 取值不同是对的：
         * 那条说的是面板怎么排，这条说的是条子本身是横是竖。
         */
        'aria-orientation': vertical ? 'horizontal' : 'vertical',
        'aria-valuenow': String(panel.size),
        // 区间取这块面板眼下真能走到的范围，纸面上的 min/max 可能走不到
        'aria-valuemin': String(panel.min),
        'aria-valuemax': String(panel.max),
        'aria-controls': panelId(panel.index),
        // 分隔条是 div，原生 disabled 不生效，用 aria-disabled 并抽掉 Tab 位；
        // 没有 roving tabindex，每条都各自留在 Tab 序列里
        'aria-disabled': disabled ? 'true' : 'false',
        'tabindex': disabled ? undefined : 0,
        'data-index': String(boundary),
        // 只有正被拖的那条算 dragging：多条分隔条时全打上标记，样式层就分不出手在哪一条上
        'data-dragging': dataAttr(dragging && boundary === activeIndex),
        // 触摸拖动要接管手势：不关掉浏览器滚动/缩放，指针事件会被系统收走（pointercancel）
        'style': { touchAction: 'none' },
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键会顺带弹出上下文菜单，中键是自动滚动
          if (disabled || event.button !== 0)
            return
          // 挡掉文本选中与默认聚焦
          event.preventDefault()
          send({ type: 'DRAG.START', index: boundary, point: { clientX: event.clientX, clientY: event.clientY } })
          // 上一句挡掉了浏览器自带的聚焦，这里补回来
          focusSafely(event.currentTarget as HTMLElement)
        },
        'onFocus': () => send({ type: 'BOUNDARY.FOCUS', index: boundary }),
        'onKeyDown': (event: KeyboardEvent) => {
          // 推不动时不吞键；Shift 是大步长开关要放行，带其余修饰键的组合一律不接
          if (disabled || event.ctrlKey || event.metaKey || event.altKey)
            return
          const run: Record<string, (() => void) | undefined> = {
            [growKey]: () => stepBy(1, event.shiftKey),
            [shrinkKey]: () => stepBy(-1, event.shiftKey),
            Home: () => send({ type: 'BOUNDARY.TO_MIN', index: boundary }),
            End: () => send({ type: 'BOUNDARY.TO_MAX', index: boundary }),
            // 面板不可折叠时不接 Enter，留给作者自己挂的处理器
            Enter: panel.collapsible ? () => togglePanel(panel.index) : undefined,
          }
          const handler = run[event.key]
          // 不在表里的键既不动布局也不 preventDefault，原样放行
          if (!handler)
            return
          event.preventDefault()
          handler()
        },
      })
    },
  }
}
