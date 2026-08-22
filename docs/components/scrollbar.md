# 滚动条 <Badge type="info" text="scrollbar" />

自绘的滚动条，挂在**任意一个**滚动容器上：表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行。

## 何时使用

- 原生滚动条在各平台长得不一样，而设计稿要求一致。
- 滚动容器不归组件管（表格、虚拟列表、你自己的布局），但滚动条要跟库里其余部分一个样。

## 何时不用

- 容器与滚动条一起要：用[滚动区域](./scroll-area)，它把视口、内容与两条滚动条打包好了。
- 只是想让原生滚动条细一点：`scrollbar-width: thin` 就够，不必换掉整套交互。

## 特性

- 挂在作者给的滚动容器上，与它是不是本组件的后代无关；挂上后容器带 `data-xh-scrollbar`，原生滚动条的外观自动藏起来。
- 四种露面时机（`auto` / `always` / `scroll` / `hover`），带收起延时；露出与收起都淡变。
- 拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限都在库里。
- `focusable` 打开后滑块进 Tab 序并报 `role="scrollbar"`，方向键与翻页键可用。
- 触屏（粗指针）上默认交给原生滚动，`forceVisible` 打开才画。

## 示例

### 挂在自己的滚动容器上

滚动容器归你，滚动条只要拿到它；把节点交给 scrollable 即可

<XhDemo src="scrollbar/01-basic" />

### 横向 + 键盘可达

focusable 让滑块进 Tab 序并报 role=scrollbar，方向键与翻页键可用

<XhDemo src="scrollbar/02-focusable" />

### 横竖两条

同一个容器挂两条，gutter 让各自在末端让出交叉口，XhScrollbarCorner 把那一格补上

<XhDemo src="scrollbar/03-both-axes" />

### 四种露面时机

auto 溢出就露、always 恒露、scroll 滚动时露、hover 指针进入才露；收起都是淡出

<XhDemo src="scrollbar/04-types" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-scrollbar>` |
| Vue 组件 | `XhScrollbarCorner` `XhScrollbarRoot` `XhScrollbarThumb` `XhScrollbarTrack` |
| 组合式函数 | `useScrollbar` |
| 状态机 | `scrollbarMachine` |
| 皮肤 | `@xihan-ui/styles/scrollbar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="scrollbar"`：**`root`** · **`track`** · **`thumb`** · `corner`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `Orientation` |  | 这条滚动条管哪条轴，默认 vertical。 |
| `type` | `ScrollbarType` |  | 露面的时机，默认 hover。 |
| `hideDelay` | `number` |  | 收起前的等待毫秒（type 为 scroll / hover 时生效），默认 600。 |
| `minThumbSize` | `number` |  | 滑块最短多少像素，默认 20。长文档里的滑块再短也按得住。 |
| `step` | `number` |  | 方向键一步滚多少像素，默认 40。翻页键按视口长度走，不看这个值。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，换的是滚动条厚度。 |
| `disabled` | `boolean` |  | 禁用：不接指针也不接键盘，恒不显形。 |
| `focusable` | `boolean` |  | 滑块进 Tab 序并报 role=scrollbar，默认 false。 缺省不进：滚动容器自己已经能用键盘滚，再给每条滚动条一个 Tab 停靠点， 长页面上会平白多出十几站。要键盘操作滑块本身时才开。 |
| `controls` | `string` |  | 被控滚动容器的 id；focusable 时落到滑块的 aria-controls 上（没给就用容器自己的 id）。 |
| `gutter` | `boolean` |  | 横竖两条同时摆着时，各自在末端让出交叉口那一格：竖条不伸到底、横条不伸到头。 交叉口由其中一条里的 corner 部件补上。 |
| `forceVisible` | `boolean` |  | 触屏设备（粗指针）上也显形，默认 false：触屏没有悬停、拖滑块也不如直接划内容， 缺省交给原生滚动，本组件整条不显形并带 data-native。 |
| `dir` | `Direction` |  | 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻一次。 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。 |
| `translations` | `Partial<ScrollbarTranslations>` |  |  |
| `onScrollStart` | `(details: ScrollbarScrollDetails) => void` |  | 开始滚了（停手 120ms 才算一段结束，中途连滚不重复通知）。 |
| `onScrollEnd` | `(details: ScrollbarScrollDetails) => void` |  | 一段滚动结束。 |
| `onDragStart` | `(details: ScrollbarScrollDetails) => void` |  | 按住滑块。 |
| `onDragEnd` | `(details: ScrollbarScrollDetails) => void` |  | 松开滑块。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `type` | `CustomEvent` |  |
| `scroll-start` | `` | 开始滚了；detail 为 `{ offset: number, max: number }` |
| `scroll-end` | `` | 一段滚动结束（停手 120ms）；detail 同上 |
| `drag-start` | `` | 按住滑块；detail 同上 |
| `drag-end` | `` | 松开滑块；detail 同上 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhScrollbarRoot` | `default` | `ScrollbarRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `corner` | 'visible' \| 'hidden' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`hidden` · `visible` · `hiding` · `dragging`

**事件**：`MEASURE` · `SCROLL` · `SCROLL.IDLE` · `POINTER.ENTER` · `POINTER.LEAVE` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `TRACK.CLICK` · `STEP` · `SCROLL.TO` · `after.hideDelay`

**判据**：`isHoverType` · `isScrollType` · `staysVisible` · `canInteract`

## connect API

`useScrollbar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `orientation` | `Orientation` |  |
| `type` | `ScrollbarType` |  |
| `overflow` | `boolean` | 内容比可视区长。不溢出时 auto 档整条不显形。 |
| `visible` | `boolean` | 这一刻该不该显形（已把 type、disabled 与触屏原生那一路都算进去）。 |
| `native` | `boolean` | 交给了原生滚动：粗指针设备且没开 forceVisible，整条不显形。 |
| `hover` | `boolean` | 指针此刻在滚动容器或滚动条上。 |
| `dragging` | `boolean` | 手正按在滑块上。 |
| `scrolling` | `boolean` | 这一段滚动还在进行中。 |
| `thumbSize` | `number` | 滑块长度占轨道的比例，0-1。 |
| `thumbOffset` | `number` | 滑块起点占轨道的比例，0-1。 |
| `scroll` | `number` | 距逻辑起始缘的滚动量（px）。 |
| `max` | `number` | 还能往前滚多少（px）。 |
| `scrollTo` | `(offset: number) => void` | 滚到某个绝对位置（px），越界自动夹。 |
| `scrollBy` | `(delta: number) => void` | 相对当前位置滚若干像素。 |
| `measure` | `() => void` | 重新量一遍。内容长短变了会自动重量（MutationObserver 盯着容器子树）， 这个出口留给量不到的那些：容器换了、内容在 Shadow DOM 里、或是自定义元素内部改的。 |
| `getRootProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getThumbProps` | `() => T['element']` |  |
| `getCornerProps` | `() => T['element']` | 交叉口补丁，写在其中一条的 root 里；跟着这一条的显隐走。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` / `ArrowLeft` | focus in thumb, focusable, 与本轴同向 | 往回滚一步（step，默认 40px）；交叉轴的那一个不拦，照常交给页面 |
| `ArrowDown` / `ArrowRight` | focus in thumb, focusable, 与本轴同向 | 往前滚一步 |
| `PageUp` | focus in thumb, focusable | 往回滚一屏（按滚动容器的可视长度） |
| `PageDown` | focus in thumb, focusable | 往前滚一屏 |
| `Home` | focus in thumb, focusable | 滚到起点 |
| `End` | focus in thumb, focusable | 滚到终点 |
| `Tab` / `Shift+Tab` | focusable | 滑块是一个 Tab 停靠点；不开 focusable 时整条退出 Tab 序，也对读屏隐藏 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | undefined \| 'true' |
| `thumb` | `aria-controls` | props.controls \| undefined |
| `thumb` | `aria-disabled` | 'true' \| undefined |
| `thumb` | `aria-label` | props.translations.thumb \| undefined |
| `thumb` | `aria-orientation` | props.orientation \| undefined |
| `thumb` | `aria-valuemax` | Math.round(max) \| undefined |
| `thumb` | `aria-valuemin` | 0 \| undefined |
| `thumb` | `aria-valuenow` | Math.round(metrics.scroll) \| undefined |
| `thumb` | `role` | 'scrollbar' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/scrollbar.css` 按部件选择：`[data-scope="scrollbar"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-gutter` | ''（条件成立时才出现） |
| `root` | `data-native` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-scrolling` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `root` | `data-type` | props.type |
| `track` | `data-disabled` | ''（条件成立时才出现） |
| `track` | `data-orientation` | props.orientation |
| `thumb` | `data-disabled` | ''（条件成立时才出现） |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-orientation` | props.orientation |
| `corner` | `data-orientation` | props.orientation |
| `corner` | `data-size` | props.size |
| `corner` | `data-state` | 'visible' \| 'hidden' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-scrollbar-corner-bg` · `--xh-scrollbar-gutter` · `--xh-scrollbar-thickness-lg` · `--xh-scrollbar-thickness-md` · `--xh-scrollbar-thickness-sm` · `--xh-scrollbar-thumb-bg` · `--xh-scrollbar-thumb-bg-active` · `--xh-scrollbar-thumb-bg-disabled` · `--xh-scrollbar-thumb-bg-hover` · `--xh-scrollbar-thumb-radius` · `--xh-scrollbar-track-bg`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- [滚动区域](./scroll-area)就是视口加两条本组件的组装：它的轨道、滑块与交叉口戴的正是本组件的 scope。
- [表格](./table)放进滚动区即可滚；[虚拟滚动](./virtualizer)的视口给个 id，用 `controls` 挂上即可。
- 两条轴各摆一个，都打开 `gutter` 让出交叉口，`corner` 写在其中一条里补上那一格。

## 最佳实践

- 藏原生滚动条只藏外观（`scrollbar-width: none`），别动滚动能力——键盘与滚轮仍要走原生通路。
- 触摸设备保留原生滚动，别给 `hover` 档：手指没有"悬停"。

## 反模式

- 给每条滚动条都开 `focusable`：长页面上会平白多出十几个 Tab 停靠点。
- 用它替代滚轮拦截：这个组件不接管滚轮，嵌套滚动的冲突要在布局上解决。
