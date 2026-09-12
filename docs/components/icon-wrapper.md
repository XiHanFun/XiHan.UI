# IconWrapper 图标块

给图元配一个定直径的底座：圆形或圆角方形，图元恒在正中。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/icon-wrapper" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/icon-wrapper.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/icon-wrapper" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/icon-wrapper" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/icon-wrapper.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

定直径的圆底座，图元在正中；底座换档时里面的图元跟着一起换

<XhDemo src="icon-wrapper/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="icon-wrapper"`：**`root`**

## 示例

### 形态

四种形态只决定底色、描边与前景怎么用，直径与形状一个字不动

<XhDemo src="icon-wrapper/02-variant" />

### 语气

换一族颜色只改 tone，形态那一轴一个字不动

<XhDemo src="icon-wrapper/03-tone" />

### 尺寸

三档同时换底座直径与图元直径；改形状、改直径都留了槽位

<XhDemo src="icon-wrapper/04-size" />

## 设计指引

### 何时使用

- 需要把图标从背景里托出来：功能入口、结果页的状态徽记、列表项的分类标记。
- 一组图标要在视觉上等宽等高，不受各自图形轮廓影响。

### 何时不用

- 只要一枚裸图元：直接用[图标](./icon)。
- 底座里放的是人或组织的形象：用[头像](./avatar)。

### 特性

- 底座直径与里面图元的直径同一个 `size` 档一起换。
- 四种形态只决定底色、描边与前景怎么用，直径与形状一个字不动。

### 组合

- 里面放[图标](./icon)；外面常与[空状态](./empty-state)、[列表](./list)一起用。

### 最佳实践

- 一组图标块保持同一档尺寸与同一种形态，只让语气变化。
- 它本身不可点：要点击就把它放进[按钮](./button)里，别给底座挂事件。

### 反模式

- 用它替代[徽标](./badge)表达计数：底座是容器，不是数值载体。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon-wrapper>` |
| Vue 组件 | `XhIconWrapper` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon-wrapper.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定底座直径与里面图元的直径。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/icon-wrapper.css` 使用 `[data-scope="icon-wrapper"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

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
| `--xh-icon-wrapper-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | icon-wrapper 的 root 部件 background 覆盖槽。 |
| `--xh-icon-wrapper-fg` | `root` | `color` | `default` | `--xh-fg-default` | icon-wrapper 的 root 部件 color 覆盖槽。 |
| `--xh-icon-wrapper-glyph-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | icon-wrapper 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-icon-wrapper-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` | icon-wrapper 的 root 部件 border-radius 覆盖槽。 |
| `--xh-icon-wrapper-shadow` | `root` | `box-shadow` | `variant=solid` | `--xh-_icon-wrapper-highlight` | icon-wrapper 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-icon-wrapper-size` | `root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` | icon-wrapper 的 root 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
