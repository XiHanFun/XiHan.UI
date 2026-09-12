# LoadingBar <Badge type="info" text="加载条" />

页面顶部那条细进度线：表示"正在去往别处"或"正在取数据"。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/loading-bar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/loading-bar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/loading-bar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/loading-bar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/loading-bar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

条子贴在视口顶边（往页面最上方看）；不给 value 就是不确定进度，宽度自行往前爬，loading 翻 false 才冲到头并淡出

<XhDemo src="loading-bar/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="loading-bar"`：**`root`** · `track` · **`range`** · `peg`

## 示例

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

## 设计指引

### 何时使用

- 路由切换、整页数据刷新这类用户无需等待具体百分比的过程。

### 何时不用

- 进度是确定的且用户关心具体数值：用[进度条](./progress)。
- 局部区域在加载：用[骨架屏](./skeleton)或[加载指示器](./spinner)。

### 特性

- 不给确定进度时自动爬升（`trickle`）：先快后慢，永远不到 100%，收到完成信号才补满。
- `minimum` 是起跳位置，让用户立刻看到反应。
- 可以挂在局部容器上而不只是页面顶部。

### 组合

- 与路由守卫配合：进入时启动，完成或失败时收掉。

### 最佳实践

- 失败也要收掉：留在页面上的半截进度条比什么都没有更糟。
- 极快的请求可以延迟一点再显示，否则只会闪一下。

### 反模式

- 爬升到 100% 却还没加载完：用户以为卡死了。
- 同时挂好几条。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-loading-bar>` |
| Vue 组件 | `XhLoadingBarPeg` `XhLoadingBarRange` `XhLoadingBarRoot` `XhLoadingBarTrack` |
| 组合式函数 | `useLoadingBar` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/loading-bar.css` |

### Props

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

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `LoadingBarValueChangeDetails` | 进度值变化；detail 为 `{ value: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLoadingBarRoot` | `default` | `LoadingBarRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `track` | state.get() |
| `range` | state.get() |
| `peg` | state.get() |

以下名称仅用于内部状态机。

**事件**：`LOADING.START` · `LOADING.END` · `TRICKLE.SYNC` · `after.trickleSpeed` · `after.fadeDuration`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `LoadingBarPhase` |  |
| `value` | `number` | 当前显示的进度值（0-100，已夹取），也是 range 的宽度百分比。 |
| `visible` | `boolean` | 条子是否露面：idle 之外都露面。 |
| `indeterminate` | `boolean` | 不确定进度：没给 value，宽度自行爬升，不输出 aria-valuenow。 |
| `getRootProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getPegProps` | `() => T['element']` | 进度段末端那道亮边。纯装饰，作者不渲染它时条子照旧成立。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#progressbar)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `root` | `aria-valuemax` | String(LOADING_BAR_MAX) |
| `root` | `aria-valuemin` | '0' |
| `root` | `aria-valuenow` | String(value) \| undefined |
| `root` | `role` | 'progressbar' |
| `peg` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/loading-bar.css` 使用 `[data-scope="loading-bar"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-indeterminate` | ''（条件成立时才出现） |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `track` | `data-state` | state.get() |
| `range` | `data-state` | state.get() |
| `peg` | `data-state` | state.get() |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-loading-bar-fade` | `root` | `transition` | `default` | `--xh-motion-duration-exit` | loading-bar 的 root 部件 transition 覆盖槽。 |
| `--xh-loading-bar-layer` | `root` | `z-index` | `default` | `--xh-layer-sticky` | loading-bar 的 root 部件 z-index 覆盖槽。 |
| `--xh-loading-bar-peg-fg` | `peg` | `background` | `default` | `--xh-loading-bar-range` | loading-bar 的 peg 部件 background 覆盖槽。 |
| `--xh-loading-bar-peg-w` | `peg` | `inline-size` | `default` | `--xh-space-8` | loading-bar 的 peg 部件 inline-size 覆盖槽。 |
| `--xh-loading-bar-range` | `peg`<br>`range` | `background` | `default` | `--xh-_tone-soft` | loading-bar 的 peg、range 部件 background 覆盖槽。 |
| `--xh-loading-bar-speed` | `range` | `transition` | `default` | `--xh-motion-duration-enter` | loading-bar 的 range 部件 transition 覆盖槽。 |
| `--xh-loading-bar-track` | `track` | `background` | `default` | `transparent` | loading-bar 的 track 部件 background 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`inline-size` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
