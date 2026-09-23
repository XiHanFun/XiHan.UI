/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pagination 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes } from '@xihan-ui/core'
import type { SelectApi } from '../select'
import type { PaginationApi, PaginationPressedKey, PaginationServices } from './pagination.types'
import { createPressTracker, dataAttr, isComposingEvent, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectSelect } from '../select'
import { OVERLAY_PLACEMENT_LIST, overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { paginationAnatomy } from './pagination.anatomy'
import { PAGINATION_PAGE_SIZE_OPTIONS, PAGINATION_SIBLING_COUNT, paginationLabels } from './pagination.machine'
import { buildPageItems, buildPageSequence, clampPage, normalizeCount, normalizePageSize, pageRangeOf, pageSizeOptionsOf, totalPagesOf } from './pagination.range'

const parts = paginationAnatomy.build()

export function connectPagination<T extends PropTypes>(
  services: PaginationServices,
  normalize: NormalizeProps<T>,
): PaginationApi<T> {
  const { context, prop, send, state, scope } = services.root
  const ids = scope.ids('pagination', 'content')

  const count = normalizeCount(prop('count'))
  const pageSize = normalizePageSize(context.get('pageSize'))
  const totalPages = totalPagesOf(count, pageSize)
  // 显示用的页码一律夹过：count 变小后内部值可能停在已不存在的页上
  const page = clampPage(context.get('page'), totalPages)
  const siblingCount = prop('siblingCount') ?? PAGINATION_SIBLING_COUNT

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  const label = paginationLabels(prop)

  const pageRange = pageRangeOf(page, pageSize, count)

  const setPage = (next: number): void => {
    send({ type: 'PAGE.SET', page: next })
  }

  // 按压通道：真源是机器 context 里「正被按住的那一个」，四类格子各自合成一份跟踪器；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档。
  // 到边界的翻页钮是原生 disabled（不派 keydown / pointerdown），那份事实仍随 PRESS.START 带给机器的守卫
  const pressed = context.get('pressed')
  const press = (key: PaginationPressedKey, disabled = false): PressHandlers & { 'data-pressed': '' | undefined } => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressed') === key,
      onChange: down => send(down ? { type: 'PRESS.START', key, disabled } : { type: 'PRESS.END', key }),
    })
    return {
      'data-pressed': dataAttr(pressed === key),
      'onKeyDown': handlers.onKeyDown,
      'onKeyUp': handlers.onKeyUp,
      'onBlur': handlers.onBlur,
      'onPointerDown': handlers.onPointerDown,
      'onPointerUp': handlers.onPointerUp,
      'onPointerCancel': handlers.onPointerCancel,
    }
  }

  // 展开态是复合状态，state.get() 拿到的是叶子路径，一律用 matches 判
  const open = state.matches('visible')
  const openEllipsis = open ? context.get('openEllipsis') : null
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? OVERLAY_PLACEMENT_LIST
  const stateAttr = open ? 'open' : 'closed'
  const items = buildPageItems(page, totalPages, siblingCount)
  /** 摊开的那一侧折了哪几页；没摊开时是空的。 */
  const foldedPages = items.find(
    item => item.type === 'ellipsis' && item.side === openEllipsis,
  )
  const folded = foldedPages?.type === 'ellipsis' ? foldedPages.pages : []

  // 档位表只做取值来源，不决定长相：升序去重、每档至少 1
  const pageSizeOptions = pageSizeOptionsOf(prop('pageSizeOptions') ?? PAGINATION_PAGE_SIZE_OPTIONS)

  // 每页条数那个下拉就是库里的 select，整份 api 转发出去，作者照它渲染角色节点。
  // 两处名字改由 aria-label 直给：select 自己把名字指向「标签 + 当前值」两个节点，
  // 而分页行里不摆可见标签，只剩当前值那一段——那是值不是名字，读屏会把「10 / 页」念成控件名
  const select = connectSelect(services.pageSizeSelect, normalize)
  /** 摘掉下拉指过去的名字链，换成这里直给的一句。 */
  const named = (props: Record<string, unknown>): Record<string, unknown> => {
    const { 'aria-labelledby': _chain, ...rest } = props
    return { ...rest, 'aria-label': label.pageSizeSelect }
  }
  const pageSizeSelect: SelectApi<T> = {
    ...select,
    getTriggerProps: () => named(select.getTriggerProps() as Record<string, unknown>) as T['button'],
    getListProps: () => named(select.getListProps() as Record<string, unknown>) as T['element'],
  }

  return {
    pageSizeSelect,
    page,
    pageSize,
    pageSizeOptions,
    count,
    totalPages,
    pages: buildPageSequence(page, totalPages, siblingCount),
    pageItems: items,
    openEllipsis,
    pageRange,
    summaryText: label.summary(pageRange.start, pageRange.end, count),
    previousPage: canGoPrev ? page - 1 : null,
    nextPage: canGoNext ? page + 1 : null,
    setPage,
    goToPrevPage: () => send({ type: 'PAGE.PREV' }),
    goToNextPage: () => send({ type: 'PAGE.NEXT' }),
    setPageSize: next => send({ type: 'PAGE_SIZE.SET', pageSize: next }),
    closeEllipsis: () => send({ type: 'ELLIPSIS.CLOSE' }),
    slice: data => data.slice((page - 1) * pageSize, page * pageSize),

    // 根节点是 nav 地标，aria-label 用于区分同页的多个分页器
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label.root,
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-empty': dataAttr(totalPages === 0),
    }),

    // 信息区只承载文本，语义由文本本身给；不发 aria-live，翻页不该抢读屏的话头
    getSummaryProps: () => normalize.element({
      ...parts.summary.attrs,
      'data-empty': dataAttr(totalPages === 0),
    }),

    // 跳页输入框：敲页码按回车即跳，越界值由 setPage 夹回合法区间
    getJumperProps: () => normalize.input({
      ...parts.jumper.attrs,
      'type': 'number',
      'inputmode': 'numeric',
      'min': 1,
      'max': Math.max(totalPages, 1),
      'aria-label': label.jumper,
      'disabled': totalPages === 0 || undefined,
      'data-empty': dataAttr(totalPages === 0),
      'onKeydown': (event: KeyboardEvent) => {
        // 输入法组合中的 Enter 是在选字，不是在跳页
        if (event.key !== 'Enter' || isComposingEvent(event))
          return
        const raw = (event.currentTarget as HTMLInputElement).value.trim()
        if (raw === '')
          return
        const next = Number(raw)
        if (!Number.isFinite(next))
          return
        event.preventDefault()
        setPage(Math.trunc(next))
      },
    }),

    // 首尾两端的按钮是单体控件，用原生 disabled（不可聚焦、脱出 Tab 序列）
    // 四类格子都是 Action Control 的 text 档（分页按钮），缺省中性的 ghost 形态：
    // 悬停 / 按下 / 禁用面、按压缩放与几何由家族配方给，皮肤只映射使用者槽
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'aria-label': label.prevTrigger,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'disabled': !canGoPrev || undefined,
      'data-disabled': dataAttr(!canGoPrev),
      ...press('prev', !canGoPrev),
      // 不再判一次 canGoPrev：边界由机器的夹取守住，值没变 cell 也不会通知宿主
      'onClick': () => send({ type: 'PAGE.PREV' }),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'aria-label': label.nextTrigger,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'disabled': !canGoNext || undefined,
      'data-disabled': dataAttr(!canGoNext),
      ...press('next', !canGoNext),
      'onClick': () => send({ type: 'PAGE.NEXT' }),
    }),

    getItemProps: (item) => {
      // 总页数为 0 时谁都不是当前页，此时的页码 1 只是兜底读数
      const current = totalPages > 0 && item.page === page
      return normalize.button({
        ...parts.item.attrs,
        [ITEM_VALUE_ATTR]: item.page,
        'type': 'button',
        'aria-label': label.item(item.page),
        'data-xh-action-control': '',
        'data-xh-action-profile': 'text',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': prop('size') ?? 'md',
        // aria-current 不是布尔属性，规范里默认值就是 "false"，省略即"不是当前项"
        'aria-current': current ? 'page' : undefined,
        'data-current': dataAttr(current),
        // 行里与摊开面板里的页码同用 item:页号，同一页不会同时出现在两处
        ...press(`item:${item.page}`),
        // 不写 tabindex：分页是一组各自独立的按钮，每个页码都是一个 Tab 停靠点
        'onClick': () => setPage(item.page),
      })
    },

    /**
     * 省略位不是死占位而是可展开的按钮：折进去的那几页得有路走到。
     *
     * 悬停摊开，点一下也摊开——纯 hover 会把键盘用户挡在外面，而这几页
     * 除了它没有别的入口（跳页输入框要求先知道页号）。
     */
    getEllipsisTriggerProps: props => normalize.button({
      ...parts['ellipsis-trigger'].attrs,
      'type': 'button',
      'data-side': props.side,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'aria-label': label.ellipsis(
        (items.find(item => item.type === 'ellipsis' && item.side === props.side) as
        | { pages: number[] }
        | undefined)?.pages.length ?? 0,
      ),
      'aria-expanded': openEllipsis === props.side ? 'true' : 'false',
      'aria-haspopup': 'true',
      'aria-controls': openEllipsis === props.side ? ids.content : undefined,
      'data-state': openEllipsis === props.side ? 'open' : 'closed',
      ...press(`ellipsis:${props.side}`),
      'onPointerenter': () => send({ type: 'ELLIPSIS.ENTER', side: props.side }),
      'onPointerleave': () => send({ type: 'ELLIPSIS.LEAVE' }),
      'onClick': () => send({ type: 'ELLIPSIS.TOGGLE', side: props.side }),
    }),

    /**
     * 每页条数控制器的挂载点：一个只管排布的格子，里头装的是库里的 select，
     * 角色节点从 api.pageSizeSelect 取（那份 api 上的部件带的是 data-scope="select"）。
     */
    getPageSizeSelectProps: () => normalize.element({
      ...parts['page-size-select'].attrs,
      'data-empty': dataAttr(totalPages === 0),
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向与三视觉轴，这里各打一遍
      'dir': prop('dir'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时引擎置位，样式据此收起
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        ...overlayFixedStyle(position),
        ...overlayAvailableSpaceVars('pagination', position, 80),
      },
    }),

    /** 面板里就是一串页码按钮，作者照 folded 渲染 item。 */
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 一组各自独立的按钮，不是 listbox：Tab 自然走得过去，不必再造一套 roving
      'role': 'group',
      'aria-label': label.ellipsis(folded.length),
      'data-state': stateAttr,
      'data-placement': placement,
      'data-size': prop('size'),
      // 视觉节点由 Presence 延留；逻辑关闭后立即退出交互与可访问树。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      'hidden': !open || undefined,
      // 指针落到面板上即撤销收起等待，斜着划过去不会半路关掉
      'onPointerenter': () => send({ type: 'ELLIPSIS.ENTER' }),
      'onPointerleave': () => send({ type: 'ELLIPSIS.LEAVE' }),
    }),
  }
}
