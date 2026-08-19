# 滚动区域 <Badge type="info" text="scroll-area" />

给一块溢出的内容配一条外观受控的滚动条。滚动本身走的是浏览器原生通路，组件只画滚动条。

## 何时使用

- 滚动条的外观要跟站点一致（各平台的原生滚动条长得很不一样）。
- 需要控制滚动条什么时候露面。

## 何时不用

- 整页滚动：交给浏览器，别套。
- 内容是长列表且条数很多：用[虚拟滚动](./virtualizer)，只画滚动条解决不了渲染量。
- 滚到底要继续加载：用[无限滚动](./infinite-scroll)。

## 特性

- `root` 要有确定高度，视口才量得出溢出。
- `type` 决定滚动条什么时候露面：`hover` 指针进来才露，`always` 恒露，`scroll` 滚动时露、停手后收起。
- `orientation` 关掉的那条轴滚动条恒不显形，视口那一向也不再滚，不留滚不回来的暗格。
- `dir` 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。

## 示例

### 基础用法

root 要有确定高度，视口才量得出溢出；滚动走的是浏览器原生通路，组件只画滚动条

<XhDemo src="scroll-area/01-basic" />

### 显隐时机

type 决定滚动条什么时候露面：hover 指针进来才露，always 恒露，scroll 滚动时露、停手后收起

<XhDemo src="scroll-area/02-type" />

### 双轴与拐角

两条轴各写一条滚动条，corner 补上右下角那块空白；内容要比视口宽，横轴才量得出溢出

<XhDemo src="scroll-area/03-both-axes" />

### 只管一条轴

orientation 关掉的那条轴滚动条恒不显形，视口那一向也不再滚，不留滚不回来的暗格

<XhDemo src="scroll-area/04-orientation" />

### 收起的等待

type 为 scroll 时滚动条停手后不立刻收起，scrollHideDelay 决定还留多少毫秒

<XhDemo src="scroll-area/05-hide-delay" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-scroll-area>` |
| Vue 组件 | `XhScrollAreaContent` `XhScrollAreaCorner` `XhScrollAreaRoot` `XhScrollAreaScrollbar` `XhScrollAreaThumb` `XhScrollAreaViewport` |
| 组合式函数 | `useScrollArea` |
| 状态机 | `scrollAreaMachine` |
| 皮肤 | `@xihan-ui/styles/scroll-area.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="scroll-area"`：**`root`** · **`viewport`** · **`content`** · `scrollbar` · `thumb` · `corner`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `ScrollAreaType` |  | 滚动条露面的时机，默认 hover。 |
| `scrollHideDelay` | `number` |  | 收起前的等待毫秒（type 为 scroll / hover 时生效），默认 600。 |
| `orientation` | `ScrollAreaOrientation` |  | 哪几条轴归本组件管，默认 both。 |
| `dir` | `Direction` |  | 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻一次。 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhScrollAreaRoot` | `default` | `ScrollAreaRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `scrollbar` | 'visible' \| 'hidden' |
| `thumb` | 'visible' \| 'hidden' |
| `corner` | 'visible' \| 'hidden' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`hidden` · `visible` · `hiding` · `dragging`

**事件**：`MEASURE` · `SCROLL` · `POINTER.ENTER` · `POINTER.LEAVE` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `TRACK.CLICK` · `after.scrollHideDelay`

**判据**：`isHoverType` · `isScrollType` · `staysVisible`

## connect API

`useScrollArea` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `ScrollAreaType` |  |
| `orientation` | `ScrollAreaOrientation` |  |
| `vertical` | `ScrollAreaAxisState` |  |
| `horizontal` | `ScrollAreaAxisState` |  |
| `draggingAxis` | `Orientation \| null` | 正被拖动的那条轴；没在拖为 null。 |
| `cornerVisible` | `boolean` | 右下角补丁该不该显形：两条滚动条同时在场才有它的位置。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getScrollbarProps` | `(props: ScrollAreaScrollbarProps) => T['element']` |  |
| `getThumbProps` | `(props: ScrollAreaScrollbarProps) => T['element']` |  |
| `getCornerProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 焦点走到滚动区 | 视口带 tabindex=0，键盘用户能停在滚动区上；组件只在这一处动过 Tab 序列 |
| `PageUp` / `PageDown` | focus in viewport | 按视口高度翻页滚动；组件不监听、不拦截 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus in viewport | 逐行/逐列滚动；组件不监听、不拦截 |
| `Home` / `End` | focus in viewport | 滚到内容两端；组件不监听、不拦截 |
| `Space` / `Shift+Space` | focus in viewport | 整屏翻页；组件不监听、不拦截 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `scrollbar` | `aria-hidden` | 'true' |
| `corner` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/scroll-area.css` 按部件选择：`[data-scope="scroll-area"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-type` | props.type |
| `viewport` | `data-orientation` | props.orientation |
| `content` | `data-orientation` | props.orientation |
| `scrollbar` | `data-dragging` | ''（条件成立时才出现） |
| `scrollbar` | `data-gutter` | ''（条件成立时才出现） |
| `scrollbar` | `data-orientation` | bar.orientation |
| `scrollbar` | `data-state` | 'visible' \| 'hidden' |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-orientation` | bar.orientation |
| `thumb` | `data-state` | 'visible' \| 'hidden' |
| `corner` | `data-state` | 'visible' \| 'hidden' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-scroll-area-bar-bg` · `--xh-scroll-area-bar-padding` · `--xh-scroll-area-bar-size` · `--xh-scroll-area-corner-bg` · `--xh-scroll-area-thumb-bg` · `--xh-scroll-area-thumb-bg-dragging` · `--xh-scroll-area-thumb-bg-hover` · `--xh-scroll-area-thumb-radius`

## 动效

关键帧 `xh-scroll-area-bar-in` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[分栏](./splitter)的面板、[对话框](./dialog)的内容区、[菜单](./menu)的长条目列表。

## 最佳实践

- 触摸设备上不要用 `hover`：那里没有悬停，滚动条会一直不出现。
- 内容可滚时给出可见提示（渐隐边缘或恒显滚动条），否则用户不知道下面还有东西。

## 反模式

- 把 `root` 的高度留给内容撑：量不出溢出，滚动条永远不出现。
- 用它包住整页，再在里面嵌套多层滚动区域：滚轮落在哪一层不可预期。
