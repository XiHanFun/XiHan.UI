# AspectRatio 宽高比

按固定的宽高比留出一块区域，里面的内容铺满它。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/aspect-ratio" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/aspect-ratio.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/aspect-ratio" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/aspect-ratio" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/aspect-ratio.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

ratio 写宽 ÷ 高：盒宽随容器，高由比例算出，里面的内容铺满整个盒子

<XhDemo src="aspect-ratio/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="aspect-ratio"`：**`root`**

## 示例

### 常用比例

同样的列宽下，1 : 1、4 : 3、16 : 9 各按自己的比例定高，并排时也不被拉成同一个高

<XhDemo src="aspect-ratio/02-ratios" />

### 放图片

直接放进去的图片铺满盒子并按 cover 裁切：同一张图放进不同比例，都不变形、不留边

<XhDemo src="aspect-ratio/03-image" />

## 设计指引

### 何时使用

- 图片、视频、地图、嵌入页等媒体要按固定比例占位，加载前后版面不跳动。
- 一组缩略图或卡片封面要统一成同一个比例。

### 何时不用

- 显示一张需要处理加载与失败状态的图片时，使用[图片](./image)，它自带比例槽。
- 区域高度由内容决定时，直接排版，不套比例盒。
- 只限制最大宽度、让内容居中时，使用[容器](./container)。

### 特性

- `ratio` 是宽 ÷ 高，如 `16 / 9`；缺省 1。不是大于 0 的有限数（0、负数、`NaN`、无穷）时按 1 处理。
- 盒宽随容器，块向尺寸由比例算出；内容不撑高盒子，超出的部分被裁掉。
- 直接子元素铺满整个盒子；图片与视频按 `cover` 裁切填满，要整幅露出时在图片上写 `object-fit: contain`。
- 放进弹性行时贴交叉轴起始缘，不被拉伸成同一个高。
- 根上不写 `role`，不可聚焦：语义由放进去的内容自己给。
- Web Components 的 `ratio` 特性写法同 CSS 的 `<ratio>`：`ratio="16/9"`、`ratio="16 / 9"` 或 `ratio="1.5"`。

### 组合

- 放进[卡片](./card)做封面，或放进[栅格](./grid)排一组同比例的缩略图。
- 盒子里放[骨架屏](./skeleton)，作为媒体加载前的占位。

### 最佳实践

- 一个盒子只放一个直接子元素；要叠加标题或角标时，放进这个子元素内部自行排布。
- 图片写有意义的 `alt`，纯装饰图写空 `alt`；视频提供字幕与可见的播放控制。
- 盒子不带壳，要圆角时改 `--xh-aspect-ratio-radius`，裁切随之生效。

### 反模式

- 往盒子里放会随内容长高的正文：多出来的文字被裁掉，读者看不到。
- 给直接子元素另写宽高或定位：它会盖过铺满规则，内容不再贴合盒子。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-aspect-ratio>` |
| Vue 组件 | `XhAspectRatio` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/aspect-ratio.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ratio` | `number` |  | 宽高比：宽 ÷ 高，如 `16 / 9`；缺省 1。不是大于 0 的有限数时按缺省处理。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `ratio` | `number` | 归一后的宽高比。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/aspect-ratio.css` 按 `[data-scope="aspect-ratio"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-aspect-ratio` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-aspect-ratio-radius` | `root` | `border-radius` | `default` | `0` | aspect-ratio 的 root 部件 border-radius 覆盖槽。 |
| `--xh-aspect-ratio-w` | `root` | `inline-size` | `default` | `100%` | aspect-ratio 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
