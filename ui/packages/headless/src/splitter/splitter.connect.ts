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
   * 把作者报来的下标收成一个真实存在的位置。下标是作者写在部件上的声明
   * （Vue 的 :index、WC 的 index 属性），面板节点数量与 size 长度对不上、写成小数或干脆写错
   * 都是可能的；不收的话 sizes[index] 是 undefined，会一路变成 aria-valuenow="NaN"。
   */
  const clampPanel = (index: number): number => clamp(Math.trunc(index) || 0, 0, lastPanel)
  // 分隔条比面板少一条：第 i 条坐在第 i 与第 i+1 块之间，因此上界再退一格
  const clampBoundary = (index: number): number => clamp(Math.trunc(index) || 0, 0, Math.max(0, lastPanel - 1))

  const panelKey = (index: number): string => specs?.[index]?.id ?? String(index)
  // 经 scope 派生而不是直接用作者的名字：同一页上两组分栏用同一份 panels 声明是常事，
  // 直接拿去当 DOM id 会撞车，分隔条的 aria-controls 就指到别人身上了
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

  // 屏幕方向 → 语义方向。上下两键恒是"屏幕向下把前一块撑大"，与 dir 无关；
  // 左右两键在 rtl 下对调，语义恒是"把分隔条前面那块撑大 / 压小"
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
         * 排布轴上的尺寸由这里每帧写死，皮肤一条都不许碰（内联优先级更高，写了也是死声明）。
         *
         * 用 flex-basis 的百分比而不是 inline-size：分隔条自身也占位置，
         * 各块按 100% 硬分会正好超出容器一个分隔条的宽度。留着 flex-shrink: 1，
         * 超出的那几像素按 basis 比例摊回各块，面板之间的比例分毫不差。
         * flex-grow 显式写 0：作者若在自己的样式里给面板加过 flex: 1，
         * 少写这一条就会被它盖掉，比例随即失效。
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
         * 分隔条自身的朝向与面板的排布轴垂直：并排的两块之间竖着一条，堆叠的两块之间横着一条。
         * 与 root 上那条 aria-orientation 不同值是对的——那条说的是"这组面板怎么排"，
         * 这条说的是"这根条子本身是横是竖"，读屏念的是后者。
         */
        'aria-orientation': vertical ? 'horizontal' : 'vertical',
        'aria-valuenow': String(panel.size),
        // 区间取这块面板眼下真能走到的范围：后面的面板已经顶到 min 时，
        // 报它纸面上的 min/max 等于报了个到不了的数
        'aria-valuemin': String(panel.min),
        'aria-valuemax': String(panel.max),
        'aria-controls': panelId(panel.index),
        // 分隔条是 div，原生 disabled 在它身上不生效，只能显式说明并抽掉 Tab 位
        // （禁用即不可聚焦）。它不是"集合里的一条"，没有 roving tabindex 那套，
        // 每条都各自留在 Tab 序列里
        'aria-disabled': disabled ? 'true' : 'false',
        'tabindex': disabled ? undefined : 0,
        'data-index': String(boundary),
        // 只有正被拖的那条算 dragging：多条分隔条时全打上标记，样式层就分不出手在哪一条上
        'data-dragging': dataAttr(dragging && boundary === activeIndex),
        // 触摸拖动要自己接管手势：不关掉浏览器的滚动/缩放手势，手指一动页面就跟着滚，
        // 指针事件随即被系统收走（pointercancel），拖到一半的分隔条停在原地
        'style': { touchAction: 'none' },
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键会顺带弹出上下文菜单，中键是自动滚动
          if (disabled || event.button !== 0)
            return
          // 挡掉文本选中与默认聚焦：拖动时选中页面文字会让分隔条"粘"住
          event.preventDefault()
          send({ type: 'DRAG.START', index: boundary, point: { clientX: event.clientX, clientY: event.clientY } })
          // 上一句挡掉了浏览器自带的聚焦，这里补回来：松手就能接着用方向键微调
          focusSafely(event.currentTarget as HTMLElement)
        },
        'onFocus': () => send({ type: 'BOUNDARY.FOCUS', index: boundary }),
        'onKeyDown': (event: KeyboardEvent) => {
          // 推不动的时候不吞键：禁用的分栏上按方向键该滚页面。
          // Shift 要放行（它就是大步长的开关），带其余修饰键的组合一律不接
          // （Ctrl+Home 是"跳到文档顶部"这类浏览器/读屏快捷键）
          if (disabled || event.ctrlKey || event.metaKey || event.altKey)
            return
          const run: Record<string, (() => void) | undefined> = {
            [growKey]: () => stepBy(1, event.shiftKey),
            [shrinkKey]: () => stepBy(-1, event.shiftKey),
            Home: () => send({ type: 'BOUNDARY.TO_MIN', index: boundary }),
            End: () => send({ type: 'BOUNDARY.TO_MAX', index: boundary }),
            // 面板不可折叠时这一条不接：Enter 该留给作者自己挂在分隔条上的东西
            Enter: panel.collapsible ? () => togglePanel(panel.index) : undefined,
          }
          const handler = run[event.key]
          // 另一条轴上的方向键根本不在表里，因此既不动布局也不 preventDefault，
          // 原样放行给页面滚动与读屏
          if (!handler)
            return
          event.preventDefault()
          handler()
        },
      })
    },
  }
}
