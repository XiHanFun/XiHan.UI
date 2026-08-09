# 分页 <Badge type="info" text="pagination" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pagination>` |
| Vue 组件 | `XhPaginationEllipsis` `XhPaginationItem` `XhPaginationNextTrigger` `XhPaginationPrevTrigger` `XhPaginationRoot` |
| 组合式函数 | `usePagination` |
| 状态机 | `paginationMachine` |
| 皮肤 | `@xihan-ui/styled/pagination.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="pagination"`：**`root`** · `prev-trigger` · `next-trigger` · **`item`** · `ellipsis`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 总条数（不是总页数）。总页数由它与 pageSize 算出。 |
| `pageSize` | `number` |  | 每页条数，默认 10；小于 1 的值一律按 1 处理。 |
| `page` | `number` |  | 当前页。给定即受控：内部不再自改，只发 onPageChange。 |
| `defaultPage` | `number` |  | 非受控初始页，默认 1。 |
| `siblingCount` | `number` |  | 当前页两侧各显示几页，默认 1。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；上一页/下一页的语义不随之翻转，"上一页"永远是 page - 1。 |
| `translations` | `Partial<PaginationTranslations>` |  |  |
| `onPageChange` | `(details: PaginationPageChangeDetails) => void` |  | 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 状态机

**状态**：`idle`

**事件**：`PAGE.SET` · `PAGE.PREV` · `PAGE.NEXT`

## connect API

`usePagination` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 当前页，恒在 [1, max(totalPages, 1)] 内。 |
| `pageSize` | `number` |  |
| `count` | `number` |  |
| `totalPages` | `number` |  |
| `pages` | `PaginationPage[]` | 页码序列，作者照着渲染 item 与 ellipsis。 |
| `pageRange` | `PaginationEntryRange` | 当前页对应的条目区间，1 基闭区间；无数据时是 { start: 0, end: 0 }。 |
| `previousPage` | `number | null` | 上一页页码；已在首页（或无数据）时为 null。 |
| `nextPage` | `number | null` |  |
| `setPage` | `(page: number) => void` | 页码会被夹进合法区间，越界入参不会写出越界的页。 |
| `goToPrevPage` | `() => void` |  |
| `goToNextPage` | `() => void` |  |
| `slice` | `<V>(data: readonly V[]) => V[]` | 按当前页从整份数据里切出这一页。 |
| `getRootProps` | `() => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getItemProps` | `(props: PaginationItemProps) => T['button']` |  |
| `getEllipsisProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in item | 跳到该页码（原生按钮激活，平台把按键翻成 click） |
| `Enter` / `Space` | focus in prev-trigger, 非首页 | 回上一页；首页时按钮是原生 disabled，焦点根本落不上去 |
| `Enter` / `Space` | focus in next-trigger, 非末页 | 进下一页；末页时按钮是原生 disabled |
| `Tab` / `Shift+Tab` | focus in root | 逐个走过每个可用按钮——分页不做 roving tabindex，用户要能 Tab 到某一页再确认；禁用的首尾按钮自动脱序 |
