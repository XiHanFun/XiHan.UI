/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image viewer 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { ImageViewerApi, ImageViewerPressedPart, ImageViewerSchema, ImageViewerTransform } from './image-viewer.types'
import { createPressTracker, dataAttr } from '@xihan-ui/core'
import { imageViewerAnatomy } from './image-viewer.anatomy'
import {
  clampImageViewerIndex,
  IMAGE_VIEWER_MAX_SCALE,
  IMAGE_VIEWER_MIN_SCALE,
  imageViewerCount,
} from './image-viewer.machine'

const parts = imageViewerAnatomy.build()

/**
 * 图的平移、旋转与翻转缩放，写成浏览器序列化后的样子：纵向位移为 0 时只给横向一支，
 * 两轴缩放相同时只写一个数。jsdom 与浏览器读回同一个串。
 */
function imageStyle(transform: ImageViewerTransform): Record<string, string> {
  const sx = transform.flipX ? -transform.scale : transform.scale
  const sy = transform.flipY ? -transform.scale : transform.scale
  return {
    translate: transform.y === 0 ? `${transform.x}px` : `${transform.x}px ${transform.y}px`,
    rotate: `${transform.rotate}deg`,
    scale: sx === sy ? String(sx) : `${sx} ${sy}`,
  }
}

export function connectImageViewer<T extends PropTypes>(
  service: Service<ImageViewerSchema>,
  normalize: NormalizeProps<T>,
): ImageViewerApi<T> {
  const { state, context, prop, send, scope } = service
  const open = state.get() === 'open'
  const collection = prop('collection') ?? []
  const count = imageViewerCount(collection)
  const index = clampImageViewerIndex(context.get('index'), count)
  const currentItem = collection[index] ?? null
  const transform = context.get('transform')
  const panning = context.get('panning')
  const imageStatus = context.get('imageStatus')
  const loop = prop('loop') ?? true
  const minScale = prop('minScale') ?? IMAGE_VIEWER_MIN_SCALE
  const maxScale = prop('maxScale') ?? IMAGE_VIEWER_MAX_SCALE
  const canPrev = count > 1 && (loop || index > 0)
  const canNext = count > 1 && (loop || index < count - 1)
  const stateAttr = open ? 'open' : 'closed'
  const ids = scope.ids('image-viewer', 'trigger', 'content')

  const translations = prop('translations')
  const label = {
    content: translations?.content ?? 'Image preview',
    toolbar: translations?.toolbar ?? 'Image tools',
    close: translations?.close ?? 'Close',
    zoomIn: translations?.zoomIn ?? 'Zoom in',
    zoomOut: translations?.zoomOut ?? 'Zoom out',
    rotateLeft: translations?.rotateLeft ?? 'Rotate left',
    rotateRight: translations?.rotateRight ?? 'Rotate right',
    flipHorizontal: translations?.flipHorizontal ?? 'Flip horizontal',
    flipVertical: translations?.flipVertical ?? 'Flip vertical',
    reset: translations?.reset ?? 'Reset',
    prev: translations?.prev ?? 'Previous image',
    next: translations?.next ?? 'Next image',
    counter: translations?.counter ?? ((i: number, n: number) => `${i} / ${n}`),
  }

  // 按压通道：十颗按钮共用一台机器，真源是机器 context 里「正被按住的那颗」，各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，家族配方两者同一档。
  // 贴住端点的缩放钮与到边界的翻页钮是原生 disabled（不派 keydown / pointerdown），那份事实仍随 PRESS.START 带给守卫
  const pressed = context.get('pressed')
  const press = (part: ImageViewerPressedPart, disabled = false): PressHandlers & { 'data-pressed': '' | undefined } => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressed') === part,
      onChange: down => send(down ? { type: 'PRESS.START', part, disabled } : { type: 'PRESS.END', part }),
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

  /**
   * 工具条按钮共用的骨架：type / 禁用与关闭态一次给齐。
   * Action Control 的档位（data-xh-action-*）与按压通道的展开由各 getter 自己写：门禁按 getter 切片认家族归属与投影。
   */
  const toolButton = (part: keyof typeof parts, aria: string, onClick: () => void, disabled: boolean, action: Record<string, unknown>): T['button'] =>
    normalize.button({
      ...parts[part].attrs,
      'id': scope.partId('image-viewer', part),
      'type': 'button',
      'aria-label': aria,
      'data-state': stateAttr,
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      ...action,
      onClick,
    })

  return {
    open,
    index,
    count,
    currentItem,
    transform,
    panning,
    imageStatus,
    canPrev,
    canNext,
    setOpen: next => send({ type: next ? 'OPEN' : 'CLOSE' }),
    setIndex: next => send({ type: 'INDEX.SET', index: next }),
    next: () => send({ type: 'INDEX.NEXT' }),
    prev: () => send({ type: 'INDEX.PREV' }),
    zoomIn: () => send({ type: 'ZOOM.BY', delta: 1 }),
    zoomOut: () => send({ type: 'ZOOM.BY', delta: -1 }),
    setScale: scale => send({ type: 'ZOOM.SET', scale }),
    rotateLeft: () => send({ type: 'ROTATE.BY', delta: -90 }),
    rotateRight: () => send({ type: 'ROTATE.BY', delta: 90 }),
    flipHorizontal: () => send({ type: 'FLIP', axis: 'x' }),
    flipVertical: () => send({ type: 'FLIP', axis: 'y' }),
    reset: () => send({ type: 'TRANSFORM.RESET' }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'OPEN' }),
    }),

    // 收起态不打 hidden：淡出动画就挂在这一层，而皮肤给遮罩没声明 display，
    // UA 的 [hidden]{display:none} 会直接压下来，淡出一帧都播不出来。
    // 真正的收起由宿主兜住：Vue 与 React 卸载整棵，WC 写内联 display
    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'aria-hidden': true,
      'data-state': stateAttr,
      // 形态轴落在 backdrop 上：三档换的都是这一层自己的底色与模糊
      'data-variant': prop('variant'),
    }),

    // 收起态不打 hidden：整棵内容都在定位层底下，皮肤对它的 [hidden] 兜底是 display: none，
    // 一收起内容就不生成盒子、退场动画根本不启动，退场探测读得到 animationName 却等不到
    // animationend，浮层要卡到兜底票过期才收。收起同样由宿主兜住
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 由皮肤的 inset 直接摆，不问引擎要坐标，没有「还没量完」的窗口：恒已落位
      'data-positioned': '',
      // 液态档的控制层要知道身后是什么：遮罩被模态设成 inert、命中不到，由铺满视口的定位层替它声明
      // 「身后是深色遮罩」；透明遮罩那一档身后就是页面，不声明，交给液态面自己判
      'data-xh-backdrop': prop('variant') === 'transparent' ? undefined : 'dark',
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'aria-modal': 'true',
      // 当前图的 alt 就是最贴切的名字，没有再退到通用文案
      'aria-label': currentItem?.alt ?? label.content,
      // 逻辑关闭先让内容退出交互与可访问树；Presence 仅负责延后视觉树和模态资源的释放。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      'data-state': stateAttr,
      // 看片层压在深色遮罩上，两种主题下都是深底：整层是白墨域，控件、焦点环与作者放进来的动作
      // 都按深色档取值。这一层自己的面取原语，不受域改写
      'data-xh-ink': 'light',
      'hidden': !open || undefined,
      'tabindex': -1,
      // 翻页是看片模式的高频动作，方向键直达；输入焦点在按钮上时也生效
      'onKeydown': (event: KeyboardEvent) => {
        if (event.defaultPrevented)
          return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          send({ type: 'INDEX.PREV' })
        }
        else if (event.key === 'ArrowRight') {
          event.preventDefault()
          send({ type: 'INDEX.NEXT' })
        }
        // 两端直达，与同为序列翻页的 carousel 一致；不受 loop 影响
        else if (event.key === 'Home') {
          event.preventDefault()
          send({ type: 'INDEX.SET', index: 0 })
        }
        else if (event.key === 'End') {
          event.preventDefault()
          send({ type: 'INDEX.SET', index: count - 1 })
        }
        // 缩放三键照看片惯例：+ / = 放大、- 缩小、0 把变换整体复位。
        // 带 Ctrl / Meta 的同样按键归浏览器的页面缩放，这里不接
        else if (!event.ctrlKey && !event.metaKey) {
          if (event.key === '+' || event.key === '=') {
            event.preventDefault()
            send({ type: 'ZOOM.BY', delta: 1 })
          }
          else if (event.key === '-') {
            event.preventDefault()
            send({ type: 'ZOOM.BY', delta: -1 })
          }
          else if (event.key === '0') {
            event.preventDefault()
            send({ type: 'TRANSFORM.RESET' })
          }
        }
      },
    }),

    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-state': stateAttr,
      'data-dragging': dataAttr(panning),
      // 视口这块在等原图落位，读屏据此不去念一块还没内容的区域
      'aria-busy': imageStatus === 'loading' || undefined,
      'data-loading': dataAttr(imageStatus === 'loading'),
      // 滚轮就是缩放：向上放大、向下缩小。preventDefault 拦掉页面滚动，
      // 适配器须以 passive:false 绑定这个监听
      'onWheel': (event: WheelEvent) => {
        event.preventDefault()
        send({ type: 'ZOOM.BY', delta: event.deltaY < 0 ? 1 : -1 })
      },
      /**
       * 手指落在图上。这里只报落点，跟手与收尾都归多指会话——
       * 它挂在文档上，手划出图片、划出窗口都跟得住，也不必再逐个捕获指针。
       * 一根是平移，两根是缩放，点数怎么变由机器判。
       */
      'onPointerdown': (event: PointerEvent) => {
        // 只认主键，右键留给系统菜单
        if (event.button !== 0)
          return
        send({ type: 'POINTERS.DOWN', pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY })
      },
    }),

    getImageProps: () => normalize.img({
      ...parts.image.attrs,
      'src': currentItem?.src,
      'alt': currentItem?.alt ?? '',
      // 原生拖图会跟平移打架
      'draggable': false,
      'data-state': stateAttr,
      'data-dragging': dataAttr(panning),
      // 松手后平移由弹簧逐帧写（惯性滑行或越界回弹），样式层据此让开过渡
      'data-animating': dataAttr(context.get('settling') && !panning),
      'data-loading': dataAttr(imageStatus === 'loading'),
      // 原图动辄几 MB，取图相位由这张图自己回送
      'onLoad': () => send({ type: 'IMAGE.LOAD' }),
      'onError': () => send({ type: 'IMAGE.ERROR' }),
      // 三个独立属性的作用顺序固定是先位移、再旋转、再缩放，与看片要的顺序一致
      'style': imageStyle(transform),
    }),

    // 不给 role=toolbar：那个角色承诺的是整条只占一个 Tab 位、条内靠方向键走。
    // 这条带走不了那套——左右方向键与 Home/End 在这台上是翻页，条内走位一接管，
    // 看片的主交互就从条里每颗钮上消失了。装什么进来也归作者，条里多一颗自带
    // Tab 位的钮，「只占一位」当场不成立。
    // 报 group：一组有名字的控件，名字无条件发，否则读屏念到的只是散落的钮。
    // 真要那套走位就往里放一个 Toolbar，与 table 的控件带同一条路子
    getToolbarProps: () => normalize.element({
      ...parts.toolbar.attrs,
      'id': scope.partId('image-viewer', 'toolbar'),
      'role': 'group',
      'aria-label': label.toolbar,
      'data-state': stateAttr,
      // 浮在图上的导航层部件：data-material="liquid" 下换成液态面，standard 档下这个标记没人读
      'data-xh-liquid': '',
    }),

    getZoomInTriggerProps: () => toolButton('zoom-in-trigger', label.zoomIn, () => send({ type: 'ZOOM.BY', delta: 1 }), transform.scale >= maxScale, {
      // 工具条里的图标钮：接 Action Control icon 档 xs（24px 视觉盒），面由工具条给、按压与命中区由配方给
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press('zoom-in-trigger', transform.scale >= maxScale),
    }),
    getZoomOutTriggerProps: () => toolButton('zoom-out-trigger', label.zoomOut, () => send({ type: 'ZOOM.BY', delta: -1 }), transform.scale <= minScale, {
      // 工具条里的图标钮：接 Action Control icon 档 xs（24px 视觉盒），面由工具条给、按压与命中区由配方给
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press('zoom-out-trigger', transform.scale <= minScale),
    }),
    getRotateLeftTriggerProps: () => toolButton('rotate-left-trigger', label.rotateLeft, () => send({ type: 'ROTATE.BY', delta: -90 }), false, {
      // 工具条里的图标钮：接 Action Control icon 档 xs（24px 视觉盒），面由工具条给、按压与命中区由配方给
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press('rotate-left-trigger'),
    }),
    getRotateRightTriggerProps: () => toolButton('rotate-right-trigger', label.rotateRight, () => send({ type: 'ROTATE.BY', delta: 90 }), false, {
      // 工具条里的图标钮：接 Action Control icon 档 xs（24px 视觉盒），面由工具条给、按压与命中区由配方给
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press('rotate-right-trigger'),
    }),
    getFlipHorizontalTriggerProps: () => toolButton('flip-horizontal-trigger', label.flipHorizontal, () => send({ type: 'FLIP', axis: 'x' }), false, {
      // 工具条里的图标钮：接 Action Control icon 档 xs（24px 视觉盒），面由工具条给、按压与命中区由配方给
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press('flip-horizontal-trigger'),
    }),
    getFlipVerticalTriggerProps: () => toolButton('flip-vertical-trigger', label.flipVertical, () => send({ type: 'FLIP', axis: 'y' }), false, {
      // 工具条里的图标钮：接 Action Control icon 档 xs（24px 视觉盒），面由工具条给、按压与命中区由配方给
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press('flip-vertical-trigger'),
    }),
    getResetTriggerProps: () => toolButton('reset-trigger', label.reset, () => send({ type: 'TRANSFORM.RESET' }), false, {
      // 工具条里的图标钮：接 Action Control icon 档 xs（24px 视觉盒），面由工具条给、按压与命中区由配方给
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      ...press('reset-trigger'),
    }),
    getPrevTriggerProps: () => toolButton('prev-trigger', label.prev, () => send({ type: 'INDEX.PREV' }), !canPrev, {
      // 浮在图上的翻页圆钮：接 Action Control floating 档 md（48px 圆形），面由皮肤桥接到自家深色 chrome
      'data-xh-action-control': '',
      'data-xh-action-profile': 'floating',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'data-xh-liquid': '',
      ...press('prev-trigger', !canPrev),
    }),
    getNextTriggerProps: () => toolButton('next-trigger', label.next, () => send({ type: 'INDEX.NEXT' }), !canNext, {
      // 浮在图上的翻页圆钮：接 Action Control floating 档 md（48px 圆形），面由皮肤桥接到自家深色 chrome
      'data-xh-action-control': '',
      'data-xh-action-profile': 'floating',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'data-xh-liquid': '',
      ...press('next-trigger', !canNext),
    }),

    getCounterProps: () => normalize.element({
      ...parts.counter.attrs,
      'id': scope.partId('image-viewer', 'counter'),
      'data-state': stateAttr,
      // 翻页时读屏跟着报「第几张」
      'aria-live': 'polite',
      'data-index': String(index + 1),
      'data-count': String(count),
      'data-xh-liquid': '',
    }),

    getCloseTriggerProps: () => toolButton('close-trigger', label.close, () => send({ type: 'CLOSE', src: 'close-trigger' }), false, {
      // 右上角的叉：接 Action Control icon 档 lg（40px，触控靶走 lg），面由皮肤桥接到自家深色 chrome
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'lg',
      'data-xh-liquid': '',
      ...press('close-trigger'),
    }),
  }
}

/** counter 部件的缺省文本；作者没写内容时由适配器填。 */
export function imageViewerCounterText(
  translations: ImageViewerSchema['props']['translations'],
  index: number,
  count: number,
): string {
  const fn = translations?.counter ?? ((i: number, n: number) => `${i} / ${n}`)
  return fn(index + 1, count)
}
