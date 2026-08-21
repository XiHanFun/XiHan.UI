import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type {
  FloatingPanelApi,
  FloatingPanelResizeEdge,
  FloatingPanelSchema,
  FloatingPanelSize,
  FloatingPanelStage,
} from './floating-panel.types'
import { focusSafely } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { floatingPanelAnatomy } from './floating-panel.anatomy'
import {
  FLOATING_PANEL_DEFAULT_POSITION,
  FLOATING_PANEL_LARGE_STEP,
  FLOATING_PANEL_MIN_SIZE,
  FLOATING_PANEL_STEP,
  floatingPanelRectStyle,
} from './floating-panel.geometry'

const parts = floatingPanelAnatomy.build()

/** 内建的改尺把手方位说法，读屏用；作者要中文就传 translations。 */
const EDGE_LABEL: Record<FloatingPanelResizeEdge, string> = {
  e: 'right edge',
  n: 'top edge',
  ne: 'top right corner',
  nw: 'top left corner',
  s: 'bottom edge',
  se: 'bottom right corner',
  sw: 'bottom left corner',
  w: 'left edge',
}

/** 内建的形态按钮说法：按钮上通常只有一个图标。 */
const STAGE_LABEL: Record<FloatingPanelStage, string> = {
  default: 'Restore panel',
  maximized: 'Maximize panel',
  minimized: 'Minimize panel',
}

/** 四个方向键对应的屏幕位移方向；不在表里的键不归本组件管。 */
const ARROW_DELTA: Record<string, { dx: number, dy: number } | undefined> = {
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
}

/** 带 Ctrl / Meta / Alt 的组合归浏览器与读屏，Shift 是大步长开关要放行。 */
function hasForeignModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey
}

export function connectFloatingPanel<T extends PropTypes>(
  service: Service<FloatingPanelSchema>,
  normalize: NormalizeProps<T>,
): FloatingPanelApi<T> {
  const { context, prop, send, scope, state } = service

  const open = state.matches('open')
  const dragging = state.matches('open.dragging')
  const resizing = state.matches('open.resizing')
  const stage = context.get('stage')
  const position = context.get('position')
  const size = context.get('size')

  const disabled = !!prop('disabled')
  // 与机器里那两条守卫同一份判据：按钮的可用状态必须与事件到底认不认一致
  const canDrag = !disabled && (prop('draggable') ?? true) && stage !== 'maximized'
  const canResize = !disabled && (prop('resizable') ?? true) && stage === 'default'

  const ids = scope.ids('floating-panel', 'content', 'title')
  const stateAttr = open ? 'open' : 'closed'

  const translations = prop('translations')
  const label = {
    dragTrigger: translations?.dragTrigger ?? 'Move panel',
    resizeTrigger: translations?.resizeTrigger ?? ((edge: FloatingPanelResizeEdge) => `Resize ${EDGE_LABEL[edge]}`),
    resizeValueText: translations?.resizeValueText
      ?? ((rect: FloatingPanelSize) => `Width ${Math.round(rect.width)}, height ${Math.round(rect.height)}`),
    stageTrigger: translations?.stageTrigger ?? ((next: FloatingPanelStage) => STAGE_LABEL[next]),
    close: translations?.close ?? 'Close',
  }

  // 改尺把手报值用的上下限，与机器夹取用的是同一份缺省
  const minSize = prop('minSize') ?? FLOATING_PANEL_MIN_SIZE
  const maxSize = prop('maxSize')
  // Enter / Space 把面板送回这个落点
  const homePosition = prop('defaultPosition') ?? FLOATING_PANEL_DEFAULT_POSITION

  // 整块面板的状态标记，几个角色节点共用一份，样式层各处一致
  const panelAttrs = (): Record<string, string | undefined> => ({
    'data-state': stateAttr,
    'data-stage': stage,
    'data-disabled': dataAttr(disabled),
    'data-dragging': dataAttr(dragging),
    'data-resizing': dataAttr(resizing),
  })

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    stage,
    position,
    size,
    dragging,
    resizing,
    disabled,
    canDrag,
    canResize,
    setOpen,
    setPosition: next => send({ type: 'POSITION.SET', position: next }),
    setSize: next => send({ type: 'SIZE.SET', size: next }),
    setStage: next => send({ type: 'STAGE.SET', stage: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...panelAttrs(),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'TOGGLE' }),
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-stage': stage,
      // 坐标由自己的拖拽状态每帧写死，不问引擎、没有「还没量完」的窗口：恒已落位
      'data-positioned': '',
      // 落位与尺寸每帧写死，皮肤不要再碰这四个属性
      'style': floatingPanelRectStyle(stage, position, size),
      // 收起态自带 hidden：面板整棵子树都在 positioner 底下，收住它就够
      'hidden': !open || undefined,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      ...panelAttrs(),
      'id': ids.content,
      'role': 'dialog',
      // 显式写 false 而非省略：浮动面板不挡住页面，读屏对未声明与声明为非模态处理不同
      'aria-modal': 'false',
      'aria-labelledby': ids.title,
      'tabindex': -1,
      // Esc 只在焦点落在面板里时管用：面板不是模态的，页面别处的 Esc 不归它
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || hasForeignModifier(event))
          return
        event.preventDefault()
        send({ type: 'CLOSE', src: 'esc' })
      },
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      'data-stage': stage,
      'data-dragging': dataAttr(dragging),
    }),

    getTitleProps: () => normalize.element({
      ...parts.title.attrs,
      id: ids.title,
    }),

    getDragTriggerProps: () => normalize.button({
      ...parts['drag-trigger'].attrs,
      'type': 'button',
      'aria-label': label.dragTrigger,
      // 用 aria-disabled 表达"现在推不动"（激活键仍归它，见下面的 onKeyDown）：
      // 原生 disabled 会把它整个逐出 Tab 序列，键盘用户连"这里能搬"都读不到
      'aria-disabled': canDrag ? 'false' : 'true',
      'data-disabled': dataAttr(!canDrag),
      'data-dragging': dataAttr(dragging),
      // 触摸拖动要接管手势：不关掉浏览器滚动/缩放，指针事件会被系统收走（pointercancel）
      'style': { touchAction: 'none' },
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键会顺带弹出上下文菜单，中键是自动滚动
        if (!canDrag || event.button !== 0)
          return
        // 挡掉文本选中与默认聚焦
        event.preventDefault()
        send({ type: 'DRAG.START', point: { clientX: event.clientX, clientY: event.clientY } })
        // 上一句挡掉了浏览器自带的聚焦，这里补回来：手拖完之后方向键要接着能推
        focusSafely(event.currentTarget as HTMLElement)
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (!canDrag || hasForeignModifier(event))
          return
        // 按钮的激活键：把面板送回初始落点。面板被拖出视口后这是不靠鼠标的那条回收路，
        // 也让这个按钮对 Enter / Space 有回应
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'POSITION.SET', position: { ...homePosition } })
          return
        }
        const delta = ARROW_DELTA[event.key]
        // 不在表里的键既不搬面板也不 preventDefault，原样放行
        if (!delta)
          return
        event.preventDefault()
        const step = event.shiftKey ? FLOATING_PANEL_LARGE_STEP : FLOATING_PANEL_STEP
        send({ type: 'POSITION.NUDGE', dx: delta.dx * step, dy: delta.dy * step })
      },
    }),

    getResizeTriggerProps: (item) => {
      const horizontal = item.edge.includes('e') || item.edge.includes('w')
      const vertical = item.edge.includes('n') || item.edge.includes('s')
      // 报的那根轴与 aria-orientation 对应：竖着的分隔条推的是宽度（horizontal 为真的那一批），
      // 横着的推高度。角上的把手两根轴都推，报宽度这一根，另一根由 aria-valuetext 一并念出来
      const valueMax = horizontal ? maxSize?.width : maxSize?.height
      return normalize.element({
        ...parts['resize-trigger'].attrs,
        // 把手是一条能被方向键推来推去的分隔条，不是按钮：按钮的激活键在这里没有语义
        'role': 'separator',
        'aria-orientation': horizontal ? 'vertical' : 'horizontal',
        'aria-label': label.resizeTrigger(item.edge),
        'aria-valuenow': String(Math.round(horizontal ? size.width : size.height)),
        'aria-valuemin': String(Math.round(horizontal ? minSize.width : minSize.height)),
        // 不给 maxSize 即不封顶，这一条随之缺席
        'aria-valuemax': valueMax != null && Number.isFinite(valueMax) ? String(Math.round(valueMax)) : undefined,
        // 上限缺席时读屏会拿 0–100 去归一一个像素数，这条人话把播报接管过来
        'aria-valuetext': label.resizeValueText(size),
        'aria-controls': ids.content,
        'aria-disabled': canResize ? 'false' : 'true',
        // 推不动时仍留在 Tab 序列里：抽掉 Tab 位，键盘用户连"这里本来能改尺寸"都读不到
        'tabindex': 0,
        // 守的是哪条边：皮肤按它把八个把手摆到八个方位
        'data-edge': item.edge,
        'data-disabled': dataAttr(!canResize),
        'data-resizing': dataAttr(resizing),
        'style': { touchAction: 'none' },
        'onPointerDown': (event: PointerEvent) => {
          if (!canResize || event.button !== 0)
            return
          // 挡掉文本选中与默认聚焦
          event.preventDefault()
          send({
            type: 'RESIZE.START',
            edge: item.edge,
            point: { clientX: event.clientX, clientY: event.clientY },
          })
          // 上一句挡掉了浏览器自带的聚焦，这里补回来
          focusSafely(event.currentTarget as HTMLElement)
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (!canResize || hasForeignModifier(event))
            return
          const delta = ARROW_DELTA[event.key]
          if (!delta)
            return
          // 这条边推不动的那根轴上不拦键：上下把手吃掉左右键，页面就再也滚不动了
          if ((delta.dx !== 0 && !horizontal) || (delta.dy !== 0 && !vertical))
            return
          event.preventDefault()
          const step = event.shiftKey ? FLOATING_PANEL_LARGE_STEP : FLOATING_PANEL_STEP
          send({ type: 'SIZE.NUDGE', edge: item.edge, dx: delta.dx * step, dy: delta.dy * step })
        },
      })
    },

    getStageTriggerProps: (item) => {
      const active = stage === item.stage
      return normalize.button({
        ...parts['stage-trigger'].attrs,
        'type': 'button',
        'aria-label': label.stageTrigger(item.stage),
        // 按下即处于该形态，读屏据此念"已按下"
        'aria-pressed': active ? 'true' : 'false',
        'aria-disabled': disabled ? 'true' : 'false',
        // 按下它切到哪个形态。与面板身上那个 data-stage 是两回事，故另取一个名字：
        // 同名的话皮肤写 [data-stage='minimized'] 会把"收拢按钮"与"已收拢的面板"一起选中
        'data-target-stage': item.stage,
        'data-state': active ? 'on' : 'off',
        'data-disabled': dataAttr(disabled),
        'onClick': () => {
          if (disabled)
            return
          // 再按一次回到常规形态：收拢着的面板按"收拢"应当展开，不然那一下没有出口
          send({ type: 'STAGE.SET', stage: active ? 'default' : item.stage })
        },
      })
    },

    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': label.close,
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),

    getBodyProps: () => normalize.element({
      ...parts.body.attrs,
      'data-stage': stage,
      // 收拢时正文连同它的可聚焦元素一起退出：只把高度压到 0 的话读屏与 Tab 照样进得去
      'hidden': stage === 'minimized' || undefined,
    }),
  }
}
