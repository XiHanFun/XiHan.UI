# Icon 图标

画一枚矢量图元，并把"它是装饰还是信息"这件事说清楚。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/icon" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/icon.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/icon" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/icon" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/icon.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

传的是图标记录本身而不是名字：名字要运行期查表，查表就得把整张表静态引进来，摇树全废

<XhDemo src="icon/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="icon"`：**`root`** · `glyph`

## 示例

### 尺寸与描边

size 八档改直径（text 跟着相邻文字的字号走）、weight 三档改 stroke-width；缺省档 md 不落 data-* 属性，皮肤的基础规则就是缺省档

<XhDemo src="icon/02-size-weight" />

### 可及名字

命名只有两态：给了非空白 label 就是 role="img" + aria-label，没给就是 aria-hidden="true" 的装饰件

<XhDemo src="icon/03-label" />

### 自定义图元

默认插槽给出内容时改由插槽填充根 svg，元素不再生成 glyph 空壳；坐标系此时由自己写的 viewBox 定

<XhDemo src="icon/04-custom-glyph" />

### 颜色

图标没有底色，语气只落在前景上，取普通背景上表达该语气的那档文字色

<XhDemo src="icon/05-tone" />

### 前景分级

图标没有底色，前景是一个组件令牌；跟正文取同一族文字色，图标就跟着排出主次

<XhDemo src="icon/06-depth" />

### 旋转与翻转

rotate 只收 90 / 180 / 270 三档，flip 沿横轴或纵轴取反；两者是独立属性，同写即叠加

<XhDemo src="icon/07-rotate-flip" />

## 设计指引

### 何时使用

- 给动作、状态或条目配一枚图形标记。
- 图形本身就是唯一的信息载体（比如只有图标的按钮里那枚图元）——这时给 `label`。

### 何时不用

- 需要一个带底色的圆形底座：用[图标块](./icon-wrapper)。
- 图形是照片或插画：用[图片](./image)。

### 特性

- 传的是图标记录本身而不是名字：按名字查表就得把整张表静态引进来，摇树全废。
- 命名只有两态：给了非空白 `label` 就是 `role="img"` 加 `aria-label`；没给就是 `aria-hidden="true"` 的装饰件。没有第三种。
- `size` 八档改直径（`text` 跟着相邻文字的字号走，其余七档是固定直径）、`weight` 三档改描边粗细；缺省档 `md` 不落 `data-*`，皮肤的基础规则就是缺省档。
- `rotate` 只收 90 / 180 / 270 三档，`flip` 沿横轴或纵轴取反；两者同写时叠加，都是静态几何，不带过渡。
- 图标没有底色，语气只落在前景上。

### 组合

- 放进[按钮](./button)的 `prefix` / `suffix`，或[图标块](./icon-wrapper)的底座里。

### 最佳实践

- 旁边已经有文字说明同一件事时，别给 `label`——重复的名字会被读屏念两遍。
- 同一屏里的图标保持同一档 `weight`，粗细混用比尺寸混用更显乱。

### 反模式

- 给装饰性图标写 `label`，或给唯一承载语义的图标漏写 `label`：两者都会让读屏用户听到错的东西。
- 用图标单独表达状态而不配文字或提示：图形的含义没有共识。

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
| `flip` | `IconFlip` |  | 翻转轴：horizontal / vertical / both，不翻就不写。旋转与翻转同写时两者叠加。 |
| `icon` | `IconRecord` |  | 要画的图标。传的是记录本身而不是名字： 名字要走运行期查表，查表就必须把全表静态引进来，摇树全废。 |
| `label` | `string` |  | 可及名字。 给了非空白文本 = 这个图标是页面上唯一说出这件事的东西，输出 role="img" + aria-label； 缺席或全空白 = 装饰，输出 aria-hidden="true"。没有第三种形态。 |
| `rotate` | `IconRotate \| string` |  | 旋转档位：90 / 180 / 270，不转就不写。 收字符串是因为 WC 那侧的档位来自 DOM 属性；不是这三档的值一律不写出。 |
| `size` | `IconSize` |  | 直径档位，缺省 md；缺省档不输出 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `weight` | `IconWeight` |  | 描边粗细档位，缺省 regular；缺省档不输出 data-weight。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string \| undefined` | 解析后的可及名字；装饰态为 undefined。 |
| `decorative` | `boolean` | 是否装饰态（label 没给或全空白）。 |
| `nodes` | `readonly IconNode[]` | 要铺进 glyph 的图元树；没传 icon 时是空数组。 |
| `content` | `IconRecord \| undefined` | 当前铺设内容的身份。就是 icon 本身：记录是模块级常量，引用相等即内容相等。 不用字符串签名——签名要遍历整棵树再拼串，每次 wire 都付一遍。 |
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
| `root` | `data-icon` | icon?.name |
| `root` | `data-rotate` | rotateAttr(props.rotate) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-weight` | props.weight |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-icon-fg` | `root` | `color` | `default`<br>`tone` | `--xh-_tone-fg`<br>`currentColor` | icon 的 root 部件 color 覆盖槽。 |
| `--xh-icon-shift` | `root` | `vertical-align` | `default` | `--xh-glyph-baseline-shift` | icon 的 root 部件 vertical-align 覆盖槽。 |
| `--xh-icon-size` | `autoplay-trigger`<br>`branch-checkbox`<br>`branch-indicator`<br>`branch-trigger`<br>`caps-lock-indicator`<br>`clear-trigger`<br>`close-trigger`<br>`column-visibility-trigger`<br>`decrement-trigger`<br>`ellipsis-trigger`<br>`expand-trigger`<br>`flip-horizontal-trigger`<br>`flip-vertical-trigger`<br>`increment-trigger`<br>`indicator`<br>`item`<br>`item-checkbox`<br>`item-close-trigger`<br>`item-delete-trigger`<br>`item-indicator`<br>`move-down-trigger`<br>`move-up-trigger`<br>`next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger`<br>`root`<br>`rotate-left-trigger`<br>`rotate-right-trigger`<br>`row-select-trigger`<br>`scroll-to-end-trigger`<br>`select-all-trigger`<br>`separator`<br>`sort-trigger`<br>`submit-trigger`<br>`to-source-trigger`<br>`to-target-trigger`<br>`trend`<br>`trigger`<br>`trigger-indicator`<br>`truncation`<br>`visibility-trigger`<br>`window-state-trigger`<br>`zoom-in-trigger`<br>`zoom-out-trigger` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `@media (min-width: 640px)`<br>`branch`<br>`default`<br>`direction`<br>`empty`<br>`indeterminate`<br>`mode=send`<br>`mode=stop`<br>`not([data-selected])`<br>`not([data-state='preparing'])`<br>`selected`<br>`size=2xl`<br>`size=3xl`<br>`size=4xl`<br>`size=lg`<br>`size=md`<br>`size=sm`<br>`size=text`<br>`size=xl`<br>`sort=asc`<br>`sort=desc`<br>`state=checked`<br>`state=completed`<br>`state=done`<br>`state=error`<br>`state=indeterminate`<br>`state=paused`<br>`state=preparing`<br>`state=running`<br>`state=visible` | `--xh-glyph-size-2xl`<br>`--xh-glyph-size-3xl`<br>`--xh-glyph-size-4xl`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm`<br>`--xh-glyph-size-text`<br>`--xh-glyph-size-xl` | icon 的 autoplay-trigger、branch-checkbox、branch-indicator、branch-trigger、caps-lock-indicator、clear-trigger、close-trigger、column-visibility-trigger、decrement-trigger、ellipsis-trigger、expand-trigger、flip-horizontal-trigger、flip-vertical-trigger、increment-trigger、indicator、item、item-checkbox、item-close-trigger、item-delete-trigger、item-indicator、move-down-trigger、move-up-trigger、next-trigger、next-year-trigger、prev-trigger、prev-year-trigger、root、rotate-left-trigger、rotate-right-trigger、row-select-trigger、scroll-to-end-trigger、select-all-trigger、separator、sort-trigger、submit-trigger、to-source-trigger、to-target-trigger、trend、trigger、trigger-indicator、truncation、visibility-trigger、window-state-trigger、zoom-in-trigger、zoom-out-trigger 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-icon-stroke` | `root` | `stroke-width` | `default`<br>`weight=bold`<br>`weight=light` | `--xh-glyph-stroke-bold`<br>`--xh-glyph-stroke-light`<br>`--xh-glyph-stroke-regular` | icon 的 root 部件 stroke-width 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
