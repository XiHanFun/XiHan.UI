# 加载条 <Badge type="info" text="loading-bar" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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
| 皮肤 | `@xihan-ui/styled/loading-bar.css` |

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
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定进度段用哪族颜色。给了 color 就以 color 为准。 |
| `trickle` | `boolean` |  | 不确定进度时自行往前爬，默认开。关掉即停在起步值等宿主收尾。 |
| `trickleSpeed` | `number` |  | 爬升节拍毫秒，默认 200；&lt;=0 或非有限数等同于关掉爬升。 |
| `minimum` | `number` |  | 起步值，默认 8：开始加载时先跳到这里。 |
| `fadeDuration` | `number` |  | 冲到 100 之后留给淡出的窗口毫秒，默认 200。窗口走完才归零并收起。 |
| `translations` | `Partial<LoadingBarTranslations>` |  |  |
| `onValueChange` | `(details: LoadingBarValueChangeDetails) => void` |  | 进度值变化。不确定进度下每爬一步、冲到 100、归零各通知一次。 |

## 状态机

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
