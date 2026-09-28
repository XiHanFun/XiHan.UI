# Icon 图标

用于显示矢量图标。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/icon" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/icon.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/icon" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/icon" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/icon.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示一个图标

<XhDemo src="icon/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="icon"`：**`root`** · `glyph`

## 示例

### 尺寸与描边

设置图标大小和描边粗细

<XhDemo src="icon/02-size-weight" />

### 可访问名称

为独立图标提供名称

<XhDemo src="icon/03-label" />

### 自定义图形

直接提供 SVG 图形

<XhDemo src="icon/04-custom-glyph" />

### 颜色

使用语义颜色

<XhDemo src="icon/05-tone" />

### 旋转与翻转

改变图标方向

<XhDemo src="icon/06-rotate-flip" />

### 底框

用 frame 给图标套一层圆形底框

<XhDemo src="icon/07-frame" />

### 底框颜色

tone 同时决定底框与图标的配色

<XhDemo src="icon/08-frame-tone" />

### 底框尺寸

sm、md、lg 三档底框与头像同档

<XhDemo src="icon/09-frame-size" />

## 设计指引

### 何时使用

- 为操作、状态或条目提供图形标识。
- 作为独立信息使用时提供可访问名称。
- 需要突出功能入口、状态或分类时，用 `frame` 给图标套一层底框。

### 何时不用

- 显示人物或组织形象时，使用[头像](./avatar)。
- 照片或插画使用[图片](./image)。

### 特性

- 直接接收可摇树优化的图标记录。
- `label` 区分信息图标与装饰图标。
- 支持八档尺寸和三档描边粗细。
- 支持旋转与水平、垂直翻转。
- 不加框时颜色只作用于图标前景。
- `frame` 提供实心、淡底、描边和无壳四种圆形底框，`tone` 同时决定框的配色；sm、md、lg 三档底框与[头像](./avatar)同档。
- 底框只是外观，可及名与装饰态不因它改变。

### 组合

- 放入[按钮](./button)时保持装饰态，名字写在按钮上。
- 加框的图标常用于[列表](./list)的媒体位和[空状态](./empty-state)。

### 最佳实践

- 图标旁已有同义文字时保持装饰状态。
- 同一操作区域使用一致的描边粗细。
- 同组加框图标使用一致的尺寸和底框。
- 加框的图标不承载交互；可点击操作使用[按钮](./button)。

### 反模式

- 不要为装饰图标重复提供名称。
- 不要只用图标表达不明确的状态。
- 不要用加框的图标替代[徽标](./badge)显示计数。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon>` |
| Vue 组件 | `XhIcon` |
| 组合式函数 | `useIcon` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `flip` | `IconFlip` |  | 翻转轴：horizontal / vertical / both，不翻转时不写。旋转与翻转同时提供时两者叠加。 |
| `frame` | `ActionVariant` |  | 底框：solid / subtle / outline / ghost，不写即无框。 加框后图标是一个定直径的圆底座，sm / md / lg 三档与头像同档，图元仍按 size 取字形直径； 框只是外观，可及名与装饰态不因它改变。 |
| `icon` | `IconRecord` |  | 要绘制的图标。传入的是记录本身而不是名字： 名字需要运行期查表，查表就必须把全表静态引入，摇树完全失效。 |
| `label` | `string` |  | 可及名。 提供非空白文本 = 该图标是页面上唯一表达该信息的元素，输出 role="img" + aria-label； 缺席或全空白 = 装饰，输出 aria-hidden="true"。没有第三种形态。 |
| `rotate` | `IconRotate \| string` |  | 旋转档位：90 / 180 / 270，不旋转时不写。 接受字符串是因为 WC 侧的档位来自 DOM 属性；不是这三档的值一律不写出。 |
| `size` | `IconSize` |  | 直径档位，默认 md；默认档不输出 data-size。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info；加了底框时同时决定框的配色。 |
| `weight` | `IconWeight` |  | 描边粗细档位，默认 regular；默认档不输出 data-weight。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string \| undefined` | 解析后的可及名；装饰态为 undefined。 |
| `decorative` | `boolean` | 是否装饰态（label 未提供或全空白）。 |
| `nodes` | `readonly IconNode[]` | 要铺进 glyph 的图元树；未传 icon 时为空数组。 |
| `content` | `IconRecord \| undefined` | 当前铺设内容的身份。即 icon 本身：记录是模块级常量，引用相等即内容相等。 不用字符串签名：签名要遍历整棵树再拼串，每次 wire 都要付出一次。 |
| `getRootProps` | `() => T['element']` |  |
| `getGlyphProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | props.label \| undefined |
| `root` | `role` | undefined \| 'img' |

## 样式参考

### 皮肤

`@xihan-ui/styles/icon.css` 使用 `[data-scope="icon"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-flip` | props.flip |
| `root` | `data-frame` | props.frame |
| `root` | `data-icon` | icon?.name |
| `root` | `data-rotate` | rotateAttr(props.rotate) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-weight` | props.weight |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-icon-fg` | `root` | `color` | `default`<br>`frame=ghost`<br>`frame=outline`<br>`frame=solid`<br>`frame=subtle`<br>`tone` | `--xh-_tone-fg`<br>`--xh-_tone-on`<br>`--xh-fg-default`<br>`--xh-fg-on-brand`<br>`currentColor` | icon 的 root 部件 color 覆盖槽。 |
| `--xh-icon-frame-bg` | `root` | `background` | `frame=solid`<br>`frame=subtle`<br>`tone` | `--xh-_tone`<br>`--xh-_tone-subtle`<br>`--xh-bg-brand`<br>`--xh-bg-subtle` | icon 的 root 部件 background 覆盖槽。 |
| `--xh-icon-frame-border` | `root` | `border-color` | `frame=outline`<br>`tone` | `--xh-_tone-border`<br>`--xh-border-default` | icon 的 root 部件 border-color 覆盖槽。 |
| `--xh-icon-frame-glyph-size` | `root` | `padding` | `frame`<br>`size=lg`<br>`size=sm` | `--xh-_icon-glyph-step`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-sm` | icon 的 root 部件 padding 覆盖槽。 |
| `--xh-icon-frame-radius` | `root` | `border-radius` | `frame` | `--xh-shape-circle` | icon 的 root 部件 border-radius 覆盖槽。 |
| `--xh-icon-frame-shadow` | `root` | `box-shadow` | `frame=solid`<br>`tone` | `--xh-_highlight-brand`<br>`--xh-_highlight-tone` | icon 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-icon-frame-size` | `root` | `block-size`<br>`inline-size`<br>`padding` | `frame`<br>`size=lg`<br>`size=sm` | `--xh-_icon-frame-step`<br>`--xh-control-h-lg`<br>`--xh-control-h-sm` | icon 的 root 部件 block-size、inline-size、padding 覆盖槽。 |
| `--xh-icon-shift` | `root` | `vertical-align` | `default` | `--xh-glyph-baseline-shift` | icon 的 root 部件 vertical-align 覆盖槽。 |
| `--xh-icon-size` | `autoplay-trigger`<br>`branch-error`<br>`branch-indicator`<br>`branch-loading`<br>`branch-trigger`<br>`cancel-trigger`<br>`caps-lock-indicator`<br>`clear-trigger`<br>`close-trigger`<br>`comment-trigger`<br>`control`<br>`decrement-trigger`<br>`dismiss-trigger`<br>`edit-trigger`<br>`ellipsis-trigger`<br>`expand-trigger`<br>`first-trigger`<br>`flip-horizontal-trigger`<br>`flip-vertical-trigger`<br>`increment-trigger`<br>`indicator`<br>`item`<br>`item-close-trigger`<br>`item-delete-trigger`<br>`item-indicator`<br>`last-trigger`<br>`line-content`<br>`line-fold-trigger`<br>`loading`<br>`move-down-trigger`<br>`move-up-trigger`<br>`next-trigger`<br>`next-year-trigger`<br>`overflow-trigger`<br>`path`<br>`path-item`<br>`prev-trigger`<br>`prev-year-trigger`<br>`root`<br>`rotate-left-trigger`<br>`rotate-right-trigger`<br>`scroll-to-end-trigger`<br>`separator`<br>`sort-trigger`<br>`submit-trigger`<br>`to-source-trigger`<br>`to-target-trigger`<br>`trend`<br>`trigger`<br>`trigger-indicator`<br>`truncation`<br>`viewport`<br>`visibility-trigger`<br>`window-state-trigger`<br>`zoom-in-trigger`<br>`zoom-out-trigger` | `block-size`<br>`column-gap`<br>`inline-size` | `@media (min-width: 640px)`<br>`default`<br>`direction`<br>`empty`<br>`error`<br>`folded`<br>`has(> [data-part='unread-count']:only-child)`<br>`is([data-part='edit-trigger'], [data-part='submit-trigger'], [data-part='cancel-trigger'])`<br>`mode=send`<br>`mode=stop`<br>`not([data-variant='dot'])`<br>`preset=toast`<br>`size=2xl`<br>`size=3xl`<br>`size=4xl`<br>`size=lg`<br>`size=md`<br>`size=sm`<br>`size=text`<br>`size=xl`<br>`sort=asc`<br>`sort=desc`<br>`state=completed`<br>`state=paused`<br>`state=running`<br>`state=visible`<br>`variant=dot` | `--xh-_color-swatch-picker-mark`<br>`--xh-glyph-size-2xl`<br>`--xh-glyph-size-3xl`<br>`--xh-glyph-size-4xl`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm`<br>`--xh-glyph-size-text`<br>`--xh-glyph-size-xl` | icon 的 autoplay-trigger、branch-error、branch-indicator、branch-loading、branch-trigger、cancel-trigger、caps-lock-indicator、clear-trigger、close-trigger、comment-trigger、control、decrement-trigger、dismiss-trigger、edit-trigger、ellipsis-trigger、expand-trigger、first-trigger、flip-horizontal-trigger、flip-vertical-trigger、increment-trigger、indicator、item、item-close-trigger、item-delete-trigger、item-indicator、last-trigger、line-content、line-fold-trigger、loading、move-down-trigger、move-up-trigger、next-trigger、next-year-trigger、overflow-trigger、path、path-item、prev-trigger、prev-year-trigger、root、rotate-left-trigger、rotate-right-trigger、scroll-to-end-trigger、separator、sort-trigger、submit-trigger、to-source-trigger、to-target-trigger、trend、trigger、trigger-indicator、truncation、viewport、visibility-trigger、window-state-trigger、zoom-in-trigger、zoom-out-trigger 部件 block-size、column-gap、inline-size 覆盖槽。 |
| `--xh-icon-stroke` | `root` | `stroke-width` | `default`<br>`weight=bold`<br>`weight=light` | `--xh-glyph-stroke-bold`<br>`--xh-glyph-stroke-light`<br>`--xh-glyph-stroke-regular` | icon 的 root 部件 stroke-width 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
