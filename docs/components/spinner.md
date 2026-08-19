# 加载指示器 <Badge type="info" text="spinner" />

一个不确定时长的等待标记。

## 何时使用

- 时长未知且没有版面可占位。
- 局部区域在取数据，或按钮上的在途标记。

## 何时不用

- 版面可预测：用[骨架屏](./skeleton)，它让用户提前看到结构。
- 进度确定：用[进度条](./progress)。
- 整页导航：用[加载条](./loading-bar)。

## 特性

- 可以配可见文案，也可以只靠 `translations` 给读屏用。
- 可以盖住等待中的内容（遮罩形态）。
- 转圈图形可换。

## 示例

### 基础用法

root 是 role=status 的活区，转圈图形由皮肤画在伪元素上；label 给出这一处在等什么

<XhDemo src="spinner/01-basic" />

### 尺寸

size 只换直径，缺省档 md 不输出 data-size

<XhDemo src="spinner/02-size" />

### 可见文案

label 部件不写内容时显示解析后的 label，屏幕上看到的与读屏念的因此是同一段字

<XhDemo src="spinner/03-label" />

### 语气

tone 只换圆环起始边那一段颜色，轨道留在中性描边上，转到哪儿才看得出来

<XhDemo src="spinner/04-tone" />

### 盖住等待中的内容

转圈浮在内容上方，容器同时报 aria-busy，看得见的与念得出的是同一件事

<XhDemo src="spinner/05-overlay" />

### 换掉转圈图形

内置圆环画在伪元素上，把直径与描边归零它就不占位；自绘的图形写进 root 里

<XhDemo src="spinner/06-custom-graphic" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-spinner>` |
| Vue 组件 | `XhSpinner` `XhSpinnerLabel` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/spinner.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="spinner"`：**`root`** · `label`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` |  | 这一处的可及名字，写在 root 上。 label 部件显示的应当是同一段文案：aria-label 会盖过节点里的文字，两者不一致时 读屏念的与屏幕上看到的就对不上了。 |
| `size` | `Size` |  | 直径档位，缺省 md；缺省档不输出 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `translations` | `Partial<SpinnerTranslations>` |  |  |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 解析后的文案：label → translations.label → 内置默认值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | resolveLabel(props) |
| `root` | `aria-live` | 'polite' |
| `root` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/spinner.css` 按部件选择：`[data-scope="spinner"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-spinner-duration` · `--xh-spinner-fg` · `--xh-spinner-gap` · `--xh-spinner-label-fg` · `--xh-spinner-label-size` · `--xh-spinner-radius` · `--xh-spinner-size` · `--xh-spinner-thickness` · `--xh-spinner-track`

## 动效

关键帧 `xh-spinner-rotate` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 组合

- 放进[按钮](./button)的 `indicator` 部件；盖住[卡片](./card)或[表格](./table)。

## 最佳实践

- 等待超过几秒就配上文字说明在做什么。
- 遮罩形态下要挡住交互，否则用户会重复点击。

## 反模式

- 一个页面里同时转好几个圈。
- 用它代替可预测版面的骨架屏。
