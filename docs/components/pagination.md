# 分页 <Badge type="info" text="pagination" />

把一份很长的结果切成一页一页，并给出当前位置与去处。

## 何时使用

- 结果集很大且用户需要跳到确定的位置、或需要可分享的页码地址。
- 需要知道一共有多少条。

## 何时不用

- 内容是时间流、用户只关心"再来一些"：用[无限滚动](./infinite-scroll)。
- 结果条数很少：一次全给。

## 特性

- `count` 给的是总条数不是总页数。
- 页码序列由 `root` 的插槽交出来，作者照着渲染条目与省略号；不渲染序列也行，只留上一页 / 下一页。
- `siblingCount` 决定当前页两侧各留几页，序列长度恒定，切页时省略号左右挪、按钮不抖。
- `dir` 只作用于排版："上一页"永远是 `page - 1`，不随书写方向翻转。
- 换 `pageSize` 后总页数重算，越界的当前页被夹回末页。

## 示例

### 基础用法

count 给的是总条数不是总页数；页码序列由 root 的插槽交出来，作者照着渲染 item 与省略号

<XhDemo src="pagination/01-basic" />

### 受控与切片

传了 page 就由宿主说了算；当前页决定从整份数据里切出哪一段

<XhDemo src="pagination/02-controlled" />

### 两侧页数

sibling-count 决定当前页两侧各留几页，序列长度恒定，切页时省略号左右挪、按钮不抖

<XhDemo src="pagination/03-sibling-count" />

### 读屏文案

translations 换掉 nav 地标名与各按钮的 aria-label，默认是英文

<XhDemo src="pagination/04-translations" />

### 语气

tone 换的是当前页选中态的底色与文字色，这里预置第 3 页为当前页

<XhDemo src="pagination/05-tone" />

### 尺寸

size 一档换掉页码格子的高度、内边距与字号，上一页 / 下一页与省略号一并跟着变

<XhDemo src="pagination/06-size" />

### 极简排布

页码序列不渲染也行，只留上一页 / 下一页与一行位置回显；先后顺序归作者

<XhDemo src="pagination/07-simple" />

### 快速跳页

输入框按 Enter 调插槽给的 setPage；越界页码由它夹回合法区间

<XhDemo src="pagination/08-jumper" />

### 每页条数

控制器由库自带：档位从 page-size-options 来，换档时页码跟着换算，改档前第一条仍留在页内

<XhDemo src="pagination/09-page-size" />

### 整组禁用

分页自己没有禁用开关：裹一层 disabled 的 fieldset，里面的按钮统一失效并脱出 Tab 序

<XhDemo src="pagination/10-disabled" />

### 摊开省略号

折进去的那几页悬停即摊开，点一下也摊开——纯悬停会把键盘用户挡在外面，而这几页除了这里没有别的入口；Escape 或点外面收起

<XhDemo src="pagination/11-ellipsis-expand" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pagination>` |
| Vue 组件 | `XhPaginationContent` `XhPaginationEllipsisTrigger` `XhPaginationItem` `XhPaginationNextTrigger` `XhPaginationPageSizeSelect` `XhPaginationPositioner` `XhPaginationPrevTrigger` `XhPaginationRoot` |
| 组合式函数 | `usePagination` |
| 状态机 | `paginationMachine` |
| 皮肤 | `@xihan-ui/styles/pagination.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="pagination"`：**`root`** · `prev-trigger` · `next-trigger` · **`item`** · `ellipsis-trigger` · `page-size-select` · `positioner` · `content`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 总条数（不是总页数）。总页数由它与 pageSize 算出。 |
| `pageSize` | `number` |  | 每页条数，默认 10；小于 1 的值一律按 1 处理。给定即受控，语义同 page。 |
| `defaultPageSize` | `number` |  | 非受控初始每页条数，默认 10。 |
| `pageSizeOptions` | `number[]` |  | 可选的每页条数档位，默认 [10, 20, 50, 100]。只做取值来源，不决定长相。 |
| `page` | `number` |  | 当前页。给定即受控：内部不再自改，只发 onPageChange。 |
| `defaultPage` | `number` |  | 非受控初始页，默认 1。 |
| `siblingCount` | `number` |  | 当前页两侧各显示几页，默认 1。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；上一页/下一页的语义不随之翻转，"上一页"永远是 page - 1。 |
| `translations` | `Partial<PaginationTranslations>` |  |  |
| `placement` | `Placement` |  | 省略位展开后的落点，默认 bottom-start（列表类浮层）。 |
| `offset` | `number` |  | 浮层与省略位之间的间距（px），默认 8。 |
| `openDelay` | `number` |  | 指针停在省略位多久才展开（ms），默认 200。 |
| `closeDelay` | `number` |  | 指针离开后多久收起（ms），默认 300：留出斜着划进浮层的时间。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onPageChange` | `(details: PaginationPageChangeDetails) => void` |  | 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onPageSizeChange` | `(details: PaginationPageSizeChangeDetails) => void` |  | 每页条数变化意图回调，语义同上；一并给出换算后的页码。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `page-change` | `PaginationPageChangeDetails` | 页码变化；detail 为 `{ page: number, pageSize: number }` |
| `page-size-change` | `` | 每页条数变化；detail 为 `{ pageSize: number, page: number }`，页码是换算后的 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPaginationContent` | `default` | `{ pages: number[] }` |  |
| `XhPaginationPageSizeSelect` | `default` | `{ options: number[], label: (size: number) => string }` |  |
| `XhPaginationRoot` | `default` | `PaginationRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `ellipsis-trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`PAGE.SET` · `PAGE_SIZE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `ELLIPSIS.ENTER` · `ELLIPSIS.LEAVE` · `ELLIPSIS.TOGGLE` · `ELLIPSIS.CLOSE` · `after.openDelay` · `after.closeDelay`

**判据**：`isSameEllipsis`

## connect API

`usePagination` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 当前页，恒在 [1, max(totalPages, 1)] 内。 |
| `pageSize` | `number` |  |
| `pageSizeOptions` | `number[]` | 可选的每页条数档位，缺省 [10, 20, 50, 100]；已按升序去重并夹到至少 1。 |
| `count` | `number` |  |
| `totalPages` | `number` |  |
| `pages` | `PaginationPage[]` | 页码序列，作者照着渲染 item 与 ellipsis-trigger。 |
| `pageItems` | `PaginationPageItem[]` | 同一串序列，但省略位带着被折叠的那几页——摊开省略号要靠它。 |
| `openEllipsis` | `PaginationEllipsisSide \| null` | 此刻摊开的是哪一侧的省略位；没摊开为 null。 |
| `pageRange` | `PaginationEntryRange` | 当前页对应的条目区间，1 基闭区间；无数据时是 { start: 0, end: 0 }。 |
| `previousPage` | `number \| null` | 上一页页码；已在首页（或无数据）时为 null。 |
| `nextPage` | `number \| null` |  |
| `setPage` | `(page: number) => void` | 页码会被夹进合法区间，越界入参不会写出越界的页。 |
| `goToPrevPage` | `() => void` |  |
| `goToNextPage` | `() => void` |  |
| `setPageSize` | `(pageSize: number) => void` | 换每页条数：页码跟着换算，让改档前第一条仍留在页内。 |
| `slice` | `<V>(data: readonly V[]) => V[]` | 按当前页从整份数据里切出这一页。 |
| `getRootProps` | `() => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getItemProps` | `(props: PaginationItemProps) => T['button']` |  |
| `getEllipsisTriggerProps` | `(props: PaginationEllipsisTriggerProps) => T['button']` | 省略位：可展开的按钮，摊开后列出被折叠的页码。 |
| `getPageSizeSelectProps` | `() => T['select']` | 每页条数控制器：绑到一个原生 select 上，档位由作者按 pageSizeOptions 渲染成 option。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `closeEllipsis` | `() => void` | 收起摊开的省略位。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in item | 跳到该页码（原生按钮激活，平台把按键翻成 click） |
| `Enter` / `Space` | focus in prev-trigger, 非首页 | 回上一页；首页时按钮是原生 disabled，焦点根本落不上去 |
| `Enter` / `Space` | focus in next-trigger, 非末页 | 进下一页；末页时按钮是原生 disabled |
| `Enter` / `Space` | focus in ellipsis-trigger | 摊开被折叠的那几页；再按一次收起。纯悬停会把键盘用户挡在外面，而那几页除了这里没有别的入口 |
| `Escape` | ellipsis-trigger 已摊开 | 收起摊开的页码面板（走消解层，点面板外面同样收起） |
| `Tab` / `Shift+Tab` | focus in root | 逐个走过每个可用按钮——分页不做 roving tabindex，用户要能 Tab 到某一页再确认；禁用的首尾按钮自动脱序 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | label.root |
| `prev-trigger` | `aria-label` | label.prevTrigger |
| `next-trigger` | `aria-label` | label.nextTrigger |
| `item` | `aria-current` | 'page' \| undefined |
| `item` | `aria-label` | label.item(item.page) |
| `ellipsis-trigger` | `aria-controls` | `content` 部件的 id \| undefined |
| `ellipsis-trigger` | `aria-expanded` | 'true' \| 'false' |
| `ellipsis-trigger` | `aria-haspopup` | 'true' |
| `ellipsis-trigger` | `aria-label` | label.ellipsis( (items.find(item =&gt; item.type === 'el… |
| `page-size-select` | `aria-label` | label.pageSizeSelect |
| `content` | `aria-label` | label.ellipsis(folded.length) |
| `content` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/pagination.css` 按部件选择：`[data-scope="pagination"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-current` | ''（条件成立时才出现） |
| `ellipsis-trigger` | `data-side` | props.side |
| `ellipsis-trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-pagination-content-bg` · `--xh-pagination-content-border` · `--xh-pagination-content-max-h` · `--xh-pagination-content-max-w` · `--xh-pagination-content-p` · `--xh-pagination-content-radius` · `--xh-pagination-content-shadow` · `--xh-pagination-ellipsis-trigger-fg` · `--xh-pagination-font-size` · `--xh-pagination-gap` · `--xh-pagination-icon-size` · `--xh-pagination-item-bg` · `--xh-pagination-item-bg-active` · `--xh-pagination-item-bg-hover` · `--xh-pagination-item-bg-selected` · `--xh-pagination-item-bg-selected-active` · `--xh-pagination-item-bg-selected-hover` · `--xh-pagination-item-border-selected` · `--xh-pagination-item-border-selected-active` · `--xh-pagination-item-border-selected-hover` · `--xh-pagination-item-fg` · `--xh-pagination-item-fg-selected` · `--xh-pagination-item-font-weight` · `--xh-pagination-item-h` · `--xh-pagination-item-min-size` · `--xh-pagination-item-px` · `--xh-pagination-item-radius` · `--xh-pagination-item-shadow` · `--xh-pagination-layer` · `--xh-pagination-page-size-bg` · `--xh-pagination-page-size-bg-hover` · `--xh-pagination-page-size-border` · `--xh-pagination-page-size-border-hover`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 与[表格](./table)、[列表](./list)配合；整组禁用时裹一层 `disabled` 的 `fieldset`。

## 最佳实践

- 把当前页写进地址，用户刷新或分享才回得到原处。
- 数据在途时不要把分页整个卸载，否则每次翻页布局都跳一下。

## 反模式

- 已知总数却不显示，用户无法判断还要翻多久。
- 把 `count` 当成总页数传进来：序列会短一大截。
