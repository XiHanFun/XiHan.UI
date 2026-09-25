# LoadingBar 加载条

页面顶部的细进度线，表示正在导航或正在获取数据。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/loading-bar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/loading-bar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/loading-bar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/loading-bar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/loading-bar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

进度条贴在视口顶边（见页面最上方）；不提供 value 即为不确定进度，宽度自行向前爬升，loading 切换为 false 后才到达终点并淡出

<XhDemo src="loading-bar/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="loading-bar"`：**`root`** · `track` · **`range`** · `peg`

## 示例

### 确定进度

传入 value 后由宿主决定，宽度按它显示，内部爬升不再介入；loading 仍然负责显示与收起

<XhDemo src="loading-bar/02-determinate" />

### 厚度

height 数字按像素、字符串按任意 CSS 长度；进度段的颜色经语气或皮肤槽，不使用内联

<XhDemo src="loading-bar/03-appearance" />

### 关闭爬升

trickle 为 false 时进度条停在起步值 minimum 不动，向前推进全部由宿主收尾

<XhDemo src="loading-bar/04-trickle" />

### 颜色

tone 只更换进度段的底色（取柔和档）；进度条本身是 fixed，这里改写为 absolute 并配一个相对定位的容器，六条才留在示例中而不是叠到页面顶边

<XhDemo src="loading-bar/05-tone" />

### 挂在局部

进度条默认贴视口顶边，改写为 absolute 再套一个相对定位的容器，它就只贴该卡片的上沿

<XhDemo src="loading-bar/06-container" />

## 设计指引

### 何时使用

- 路由切换、整页数据刷新等用户不需要具体百分比的过程。

### 何时不用

- 进度确定且用户关心具体数值时，使用[进度条](./progress)。
- 局部区域加载时，使用[骨架屏](./skeleton)或[加载指示器](./spinner)。

### 特性

- 未提供确定进度时自动爬升（`trickle`）：先快后慢，不到 100%，收到完成信号后补满。
- `minimum` 是起始位置，让用户立即看到反应。
- 可以挂在局部容器上，不限于页面顶部。

### 组合

- 与路由守卫配合：进入时启动，完成或失败时收起。

### 最佳实践

- 失败时也要收起，停留在页面上的半截进度条比没有更差。
- 极快的请求可以延迟显示，避免闪烁。

### 反模式

- 爬升到 100% 却尚未加载完成，用户会以为卡住。
- 同时挂多条。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-loading-bar>` |
| Vue 组件 | `XhLoadingBarPeg` `XhLoadingBarRange` `XhLoadingBarRoot` `XhLoadingBarTrack` |
| 组合式函数 | `useLoadingBar` |
| 状态机 | `loadingBarMachine` |
| 皮肤 | `@xihan-ui/styles/loading-bar.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 受控进度值（0-100）。提供后即为确定进度：宽度按它显示，内部爬升停止。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `loading` | `boolean` |  | 加载开关：true 开始，false 结束（到达 100 后淡出归零）。只由宿主写入，无配套回调。 |
| `height` | `string \| number` |  | 进度条厚度：数字按像素，字符串按任意 CSS 长度。默认 2px。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定进度段使用哪族颜色。需要其他颜色时修改皮肤槽 --xh-loading-bar-range。 |
| `trickle` | `boolean` |  | 不确定进度时自行向前爬升，默认开启。关闭则停在起步值等待宿主收尾。 |
| `trickleSpeed` | `number` |  | 爬升节拍毫秒，默认 200；&lt;=0 或非有限数等同于关闭爬升。 |
| `minimum` | `number` |  | 起步值，默认 8：开始加载时先跳到该值。 |
| `fadeDuration` | `number` |  | 到达 100 之后留给淡出的窗口毫秒，默认 200。窗口结束才归零并收起。 |
| `translations` | `Partial<LoadingBarTranslations>` |  |  |
| `onValueChange` | `(details: LoadingBarValueChangeDetails) => void` |  | 进度值变化。不确定进度下每爬升一步、到达 100、归零各通知一次。 |

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

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhLoadingBarRoot` | `children` | `SlotChildren<LoadingBarRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'loading' \| 'finishing' |
| `track` | 'idle' \| 'loading' \| 'finishing' |
| `range` | 'idle' \| 'loading' \| 'finishing' |
| `peg` | 'idle' \| 'loading' \| 'finishing' |

以下名称仅用于内部状态机。

**状态**：`idle` · `loading` · `finishing`

**事件**：`LOADING.START` · `LOADING.END` · `TRICKLE.SYNC` · `after.trickleSpeed` · `after.fadeDuration`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `LoadingBarPhase` |  |
| `value` | `number` | 当前显示的进度值（0-100，已夹取），也是 range 的宽度百分比。 |
| `visible` | `boolean` | 进度条是否显示：idle 之外都显示。 |
| `indeterminate` | `boolean` | 不确定进度：未提供 value，宽度自行爬升，不输出 aria-valuenow。 |
| `getRootProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getPegProps` | `() => T['element']` | 进度段末端的亮边。纯装饰，作者不渲染它时进度条照常成立。 |

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
| `root` | `data-state` | 'idle' \| 'loading' \| 'finishing' |
| `root` | `data-tone` | props.tone |
| `track` | `data-state` | 'idle' \| 'loading' \| 'finishing' |
| `range` | `data-state` | 'idle' \| 'loading' \| 'finishing' |
| `peg` | `data-state` | 'idle' \| 'loading' \| 'finishing' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-loading-bar-fade` | `root` | `transition` | `default` | `--xh-motion-duration-exit` | loading-bar 的 root 部件 transition 覆盖槽。 |
| `--xh-loading-bar-layer` | `root` | `z-index` | `default` | `--xh-layer-sticky` | loading-bar 的 root 部件 z-index 覆盖槽。 |
| `--xh-loading-bar-peg-fg` | `peg` | `background` | `default` | `--xh-loading-bar-range` | loading-bar 的 peg 部件 background 覆盖槽。 |
| `--xh-loading-bar-peg-w` | `peg` | `inline-size` | `default` | `--xh-space-8` | loading-bar 的 peg 部件 inline-size 覆盖槽。 |
| `--xh-loading-bar-range` | `peg`<br>`range` | `background` | `default` | `--xh-_tone-soft` | loading-bar 的 peg、range 部件 background 覆盖槽。 |
| `--xh-loading-bar-speed` | `range` | `transition` | `default` | `--xh-motion-duration-move` | loading-bar 的 range 部件 transition 覆盖槽。 |
| `--xh-loading-bar-track` | `track` | `background` | `default` | `transparent` | loading-bar 的 track 部件 background 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`inline-size` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
