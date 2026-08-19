# 加载条 <Badge type="info" text="loading-bar" />

页面顶部那条细进度线：表示"正在去往别处"或"正在取数据"。

## 何时使用

- 路由切换、整页数据刷新这类用户无需等待具体百分比的过程。

## 何时不用

- 进度是确定的且用户关心具体数值：用[进度条](./progress)。
- 局部区域在加载：用[骨架屏](./skeleton)或[加载指示器](./spinner)。

## 特性

- 不给确定进度时自动爬升（`trickle`）：先快后慢，永远不到 100%，收到完成信号才补满。
- `minimum` 是起跳位置，让用户立刻看到反应。
- 可以挂在局部容器上而不只是页面顶部。

## 示例

### 基础用法

条子贴在视口顶边（往页面最上方看）；不给 value 就是不确定进度，宽度自行往前爬，loading 翻 false 才冲到头并淡出

<XhDemo src="loading-bar/01-basic" />

### 确定进度

传了 value 就由宿主说了算，宽度照它显示，内部爬升不再插手；loading 仍然负责露面与收起

<XhDemo src="loading-bar/02-determinate" />

### 厚度与颜色

height 数字按像素、字符串按任意 CSS 长度；color 只改进度段的底色

<XhDemo src="loading-bar/03-appearance" />

### 关掉爬升

trickle 为 false 时条子停在起步值 minimum 不动，往前走全靠宿主收尾

<XhDemo src="loading-bar/04-trickle" />

### 语气

tone 只换进度段的底色（取柔和档）；条子本身是 fixed，这里给它写死 absolute 并配一个相对定位的框子，六条才留在示例里而不是叠到页面顶边

<XhDemo src="loading-bar/05-tone" />

### 挂在局部

条子默认贴视口顶边，改写成 absolute 再套一个相对定位的框子，它就只贴这块卡片的上沿

<XhDemo src="loading-bar/06-container" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-loading-bar>` |
| Vue 组件 | `XhLoadingBarRange` `XhLoadingBarRoot` `XhLoadingBarTrack` |
| 组合式函数 | `useLoadingBar` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/loading-bar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="loading-bar"`：**`root`** · `track` · **`range`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 受控进度值（0-100）。给了它就是确定进度：宽度照它显示，内部爬升停止。 |
| `defaultValue` | `number` |  | 非受控初值，缺省 0。 |
| `loading` | `boolean` |  | 加载开关：true 开始，false 结束（冲到 100 再淡出归零）。只由宿主写入，无配套回调。 |
| `height` | `string \| number` |  | 条子厚度：数字按像素，字符串按任意 CSS 长度。缺省 2px。 |
| `color` | `string` |  | 进度段颜色（任意 CSS 颜色）。不给就用皮肤的品牌色。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定进度段用哪族颜色。给了 color 就以 color 为准。 |
| `trickle` | `boolean` |  | 不确定进度时自行往前爬，默认开。关掉即停在起步值等宿主收尾。 |
| `trickleSpeed` | `number` |  | 爬升节拍毫秒，默认 200；&lt;=0 或非有限数等同于关掉爬升。 |
| `minimum` | `number` |  | 起步值，默认 8：开始加载时先跳到这里。 |
| `fadeDuration` | `number` |  | 冲到 100 之后留给淡出的窗口毫秒，默认 200。窗口走完才归零并收起。 |
| `translations` | `Partial<LoadingBarTranslations>` |  |  |
| `onValueChange` | `(details: LoadingBarValueChangeDetails) => void` |  | 进度值变化。不确定进度下每爬一步、冲到 100、归零各通知一次。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `LoadingBarValueChangeDetails` | 进度值变化；detail 为 `{ value: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLoadingBarRoot` | `default` | `LoadingBarRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `track` | state.get() |
| `range` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`LOADING.START` · `LOADING.END` · `TRICKLE.SYNC` · `after.trickleSpeed` · `after.fadeDuration`

## connect API

`useLoadingBar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `LoadingBarPhase` |  |
| `value` | `number` | 当前显示的进度值（0-100，已夹取），也是 range 的宽度百分比。 |
| `visible` | `boolean` | 条子是否露面：idle 之外都露面。 |
| `indeterminate` | `boolean` | 不确定进度：没给 value，宽度自行爬升，不输出 aria-valuenow。 |
| `getRootProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#progressbar)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `root` | `aria-valuemax` | String(LOADING_BAR_MAX) |
| `root` | `aria-valuemin` | '0' |
| `root` | `aria-valuenow` | String(value) \| undefined |
| `root` | `role` | 'progressbar' |

## 样式

默认皮肤 `@xihan-ui/styles/loading-bar.css` 按部件选择：`[data-scope="loading-bar"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-indeterminate` | ''（条件成立时才出现） |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `track` | `data-state` | state.get() |
| `range` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-loading-bar-fade` · `--xh-loading-bar-layer` · `--xh-loading-bar-range` · `--xh-loading-bar-speed` · `--xh-loading-bar-track`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与路由守卫配合：进入时启动，完成或失败时收掉。

## 最佳实践

- 失败也要收掉：留在页面上的半截进度条比什么都没有更糟。
- 极快的请求可以延迟一点再显示，否则只会闪一下。

## 反模式

- 爬升到 100% 却还没加载完：用户以为卡死了。
- 同时挂好几条。
