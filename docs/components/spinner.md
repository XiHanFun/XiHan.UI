# Spinner 加载指示器

一个不确定时长的等待标记。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/spinner" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/spinner.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/spinner" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/spinner" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/spinner.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root 是 role=status 的活区，转圈图形由皮肤画在伪元素上；label 给出这一处在等什么

<XhDemo src="spinner/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="spinner"`：**`root`** · `label`

## 示例

### 尺寸

size 只换直径，缺省档 md 不输出 data-size

<XhDemo src="spinner/02-size" />

### 可见文案

label 部件不写内容时显示解析后的 label，屏幕上看到的与读屏念的因此是同一段字

<XhDemo src="spinner/03-label" />

### 颜色

tone 只换圆环起始边那一段颜色，轨道留在中性描边上，转到哪儿才看得出来

<XhDemo src="spinner/04-tone" />

### 盖住等待中的内容

转圈浮在内容上方，容器同时报 aria-busy，看得见的与念得出的是同一件事

<XhDemo src="spinner/05-overlay" />

### 换掉转圈图形

内置圆环画在伪元素上，把直径与描边归零它就不占位；自绘的图形写进 root 里

<XhDemo src="spinner/06-custom-graphic" />

### 变体

ring 整圈、arc 一段弧、dots 三点；缺省档 ring 不输出 data-variant

<XhDemo src="spinner/07-variant" />

## 设计指引

### 何时使用

- 时长未知且没有版面可占位。
- 局部区域在取数据，或按钮上的在途标记。

### 何时不用

- 版面可预测：用[骨架屏](./skeleton)，它让用户提前看到结构。
- 进度确定：用[进度条](./progress)。
- 整页导航：用[加载条](./loading-bar)。

### 特性

- 可以配可见文案，也可以只靠 `translations` 给读屏用。
- 可以盖住等待中的内容（遮罩形态）。
- 转圈图形可换。

### 组合

- 放进[按钮](./button)的 `indicator` 部件；盖住[卡片](./card)或[表格](./table)。

### 最佳实践

- 等待超过几秒就配上文字说明在做什么。
- 遮罩形态下要挡住交互，否则用户会重复点击。

### 反模式

- 一个页面里同时转好几个圈。
- 用它代替可预测版面的骨架屏。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-spinner>` |
| Vue 组件 | `XhSpinner` `XhSpinnerLabel` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/spinner.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` |  | 这一处的可及名字，写在 root 上。 label 部件显示的应当是同一段文案：aria-label 会盖过节点里的文字，两者不一致时 读屏念的与屏幕上看到的就对不上了。 |
| `size` | `Size` |  | 直径档位，缺省 md；缺省档不输出 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `translations` | `Partial<SpinnerTranslations>` |  |  |
| `variant` | `SpinnerVariant` |  | 形态，缺省 ring；缺省档不输出 data-variant。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 解析后的文案：label → translations.label → 内置默认值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | resolveLabel(props) |
| `root` | `aria-live` | 'polite' |
| `root` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/spinner.css` 使用 `[data-scope="spinner"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-spinner-duration` | `root` | `animation` | `default`<br>`variant=dots` | `--xh-spin-duration` | spinner 的 root 部件 animation 覆盖槽。 |
| `--xh-spinner-fg` | `root` | `background`<br>`border-block-start-color`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`motion=reduce`<br>`tone`<br>`variant=arc`<br>`variant=dots`<br>`where([data-motion='reduce'])` | `--xh-_tone`<br>`--xh-bg-brand` | spinner 的 root 部件 background、border-block-start-color、border-color 覆盖槽。 |
| `--xh-spinner-gap` | `root` | `gap` | `default` | `--xh-control-gap-md` | spinner 的 root 部件 gap 覆盖槽。 |
| `--xh-spinner-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | spinner 的 label 部件 color 覆盖槽。 |
| `--xh-spinner-label-size` | `label` | `font-size` | `default` | `--xh-text-secondary-size` | spinner 的 label 部件 font-size 覆盖槽。 |
| `--xh-spinner-radius` | `root` | `border-radius` | `@media (forced-colors: active)`<br>`default`<br>`variant=arc`<br>`variant=dots` | `--xh-shape-pill` | spinner 的 root 部件 border-radius 覆盖槽。 |
| `--xh-spinner-size` | `root` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | spinner 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-spinner-thickness` | `root` | `-webkit-mask`<br>`border`<br>`mask` | `@media (forced-colors: active)`<br>`default`<br>`variant=arc`<br>`variant=dots` | `--xh-stroke-thick` | spinner 的 root 部件 -webkit-mask、border、mask 覆盖槽。 |
| `--xh-spinner-track` | `root` | `border` | `default` | `--xh-border-default` | spinner 的 root 部件 border 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-spinner-dots` · `xh-spinner-rotate` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。
