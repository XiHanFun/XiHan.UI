/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 drawer 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { DialogPressedPart } from '../dialog'
import type { DrawerApi, DrawerSchema, DrawerSide } from './drawer.types'
import { createPressTracker, dataAttr } from '@xihan-ui/core'
import { DRAWER_EN_US } from '../locale/en-US'
import { RESIZABLE_LARGE_STEP, RESIZABLE_STEP } from '../resizable'
import { disclosureContentMounted } from '../shared/disclosure-mount'
import { resolveTranslations } from '../shared/translations'
import { drawerAnatomy } from './drawer.anatomy'
import { DRAWER_MIN_PANEL_SIZE } from './drawer.machine'

const parts = drawerAnatomy.build()

/** side 缺省时的落点。 */
export const DRAWER_DEFAULT_SIDE: DrawerSide = 'right'

/** 方向键对应的屏幕方向：物理键位，RTL 下不翻；推向哪条边变厚由机器按贴边的一侧与书写方向定。 */
const ARROW_DELTA: Readonly<Record<string, { dx: number, dy: number } | undefined>> = {
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
}

export function connectDrawer<T extends PropTypes>(
  service: Service<DrawerSchema>,
  normalize: NormalizeProps<T>,
): DrawerApi<T> {
  const { state, prop, send, context, scope } = service
  const translations = resolveTranslations(DRAWER_EN_US, prop('translations'))
  const open = state.get() === 'open'
  const modal = prop('modal') ?? true
  const role = prop('role') ?? 'dialog'
  const side = prop('side') ?? DRAWER_DEFAULT_SIDE
  const contained = !!prop('contained')
  const resizable = !!prop('resizable')
  const panelSize = context.get('panelSize') ?? null
  const resizing = context.get('gesture') === 'resize'
  const ids = scope.ids('drawer', 'trigger', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  // 首帧标记：挂载时就开着、还没收起过（与对话框共用的机器记下）
  const instant = dataAttr(context.get('openedAtMount'))

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  // 按压通道：两颗按钮各自合成一份跟踪器，真源是（与对话框共用的）机器 context 里「正被按住的那颗」；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档
  const pressed = context.get('pressed')
  const press = (part: DialogPressedPart): PressHandlers & { 'data-pressed': '' | undefined } => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressed') === part,
      onChange: down => send({ type: down ? 'PRESS.START' : 'PRESS.END', part }),
    })
    return {
      'data-pressed': dataAttr(pressed === part),
      'onKeyDown': handlers.onKeyDown,
      'onKeyUp': handlers.onKeyUp,
      'onBlur': handlers.onBlur,
      'onPointerDown': handlers.onPointerDown,
      'onPointerUp': handlers.onPointerUp,
      'onPointerCancel': handlers.onPointerCancel,
    }
  }

  return {
    open,
    side,
    panelSize,
    resizing,
    setOpen,
    // 浮层恒为懒挂载：第一次打开才有内容；收起之后卸不卸由 unmountOnExit 定，缺省卸
    isContentMounted: present => disclosureContentMounted({
      lazyMount: true,
      unmountOnExit: prop('unmountOnExit') ?? true,
      opened: context.get('opened'),
      present,
    }),
    // root 留在页面原地（content 会被 portal 走），收起态也带 data-state / data-side
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-side': side,
      'data-size': prop('size'),
      'data-contained': dataAttr(contained),
    }),
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      // 页面上的独立文字按钮：盒型、四态面、0.97 按压与粗指针命中区由家族配方按 text 档给出；
      // 缺省 outline 描边（只有 Button 缺省品牌实心）。作者以 asChild 换成自己的按钮时，
      // 这几条家族标记不落到它身上（适配器合并时跳过 data-xh-*）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'data-xh-action-variant': 'outline',
      ...press('trigger'),
      'onClick': () => send({ type: 'TOGGLE' }),
    }),
    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'data-state': stateAttr,
      // 挂载时就开着的这一段直接呈现，不播进场
      'data-instant': instant,
      // 局部容器里遮罩改画在容器上，铺满视口的那份 fixed 由皮肤据此让位
      'data-contained': dataAttr(contained),
      // 形态轴落在 backdrop 上：三档换的都是这一层自己的底色与模糊
      'data-variant': prop('variant'),
      // 非模态不激活遮罩；Vue/React 据此不创建节点，WC 隐藏作者节点。
      'hidden': !modal || undefined,
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 由皮肤的 inset 直接摆，不问引擎要坐标，没有「还没量完」的窗口：恒已落位
      'data-positioned': '',
      'data-contained': dataAttr(contained),
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': role,
      'tabindex': -1,
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      // 非模态时显式写 "false"，不能省略：读屏对"未声明"与"声明为非模态"处理不同
      'aria-modal': modal ? 'true' : 'false',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      'data-instant': instant,
      // content 被 portal 到 body 后 root 上的选择器够不着它，故自身也带 data-side / data-size
      'data-side': side,
      'data-size': prop('size'),
      'data-contained': dataAttr(contained),
      // 调过厚度就写进私有槽，压过 size 档；没调过写空串，撤掉上一轮留在节点上的值
      'data-resizing': dataAttr(resizing),
      'style': { '--xh-_drawer-panel-size': panelSize != null ? `${panelSize}px` : '' },
      // positioner 非必需部件，content 收起态必须自带 hidden，否则最小结构（root + content）
      // 下抽屉关不掉（WC 侧 content 常驻，尤为明显）
      'hidden': !open || undefined,
    }),
    // 面板三段：头与尾定在原处，正文自己滚
    getHeaderProps: () => normalize.element({ ...parts.header.attrs }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getBodyProps: () => normalize.element({ ...parts.body.attrs }),
    getFooterProps: () => normalize.element({ ...parts.footer.attrs }),
    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': translations.close,
      // 面板角落的叉：icon 档 sm、ghost 面，白面上走画布承载阶梯（hover 100 → pressed 200）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'data-xh-action-variant': 'ghost',
      ...press('close-trigger'),
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),
    // 把手是一条能被方向键推来推去的分隔条，不是按钮：激活键在这里没有语义
    getResizeTriggerProps: () => {
      const horizontal = side === 'left' || side === 'right'
      const min = prop('minPanelSize') ?? DRAWER_MIN_PANEL_SIZE
      const max = prop('maxPanelSize')
      const now = panelSize ?? context.get('measuredPanelSize')
      return normalize.element({
        ...parts['resize-trigger'].attrs,
        'role': 'separator',
        // 竖着的分隔条推的是宽度：左右放置的抽屉把手是竖线
        'aria-orientation': horizontal ? 'vertical' : 'horizontal',
        'aria-label': translations.resizeTrigger,
        'aria-controls': ids.content,
        // 没调过、也还没量过时不报当前值：把手得焦那一刻会量一次
        'aria-valuenow': now != null ? String(now) : undefined,
        'aria-valuemin': String(min),
        // 不给上限即只受视口限制，这一条随之缺席
        'aria-valuemax': max != null && Number.isFinite(max) ? String(max) : undefined,
        'tabindex': resizable ? 0 : undefined,
        'data-side': side,
        'data-resizing': dataAttr(resizing),
        // 没开改尺时整条收起：留一个推不动的把手只会误导
        'hidden': !resizable || undefined,
        // 触摸拖动要接管手势：不关掉浏览器滚动与缩放，指针事件会被系统收走
        'style': { touchAction: 'none' },
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键会顺带弹出上下文菜单，中键是自动滚动
          if (!resizable || event.button !== 0)
            return
          // 挡掉文本选中与默认聚焦
          event.preventDefault()
          send({ type: 'RESIZE.START', point: { clientX: event.clientX, clientY: event.clientY }, pointerId: event.pointerId })
        },
        'onFocus': () => {
          if (resizable)
            send({ type: 'RESIZE.MEASURE' })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (!resizable || event.ctrlKey || event.metaKey || event.altKey)
            return
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            send({ type: 'RESIZE.TO_BOUND', bound: event.key === 'Home' ? 'min' : 'max' })
            return
          }
          const delta = ARROW_DELTA[event.key]
          // 不在表里的键原样放行
          if (!delta)
            return
          event.preventDefault()
          const step = event.shiftKey ? RESIZABLE_LARGE_STEP : RESIZABLE_STEP
          send({ type: 'RESIZE.NUDGE', dx: delta.dx * step, dy: delta.dy * step })
        },
      })
    },
  }
}
