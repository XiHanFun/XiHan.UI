# Watermark 水印

在内容区域上重复显示文字或图片水印。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/watermark" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/watermark.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/watermark" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/watermark" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/watermark.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

为内容添加文字水印

<XhDemo src="watermark/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="watermark"`：**`root`** · `content`

## 示例

### 多行水印

显示归属和时间信息

<XhDemo src="watermark/02-multi-line" />

### 外观

设置角度、间距、字号和透明度

<XhDemo src="watermark/03-appearance" />

### 自定义颜色

设置水印前景色

<XhDemo src="watermark/04-custom-color" />

## 设计指引

### 何时使用

- 标记内部数据、预览稿或样例内容。
- 在导出或截图内容中保留归属信息。

### 何时不用

- 水印不能替代访问控制或数据脱敏。
- 装饰纹理应使用背景样式。

### 特性

- 支持单行、多行文字和图片水印。
- 支持角度、间距、字号、透明度和字体配置。
- 水印不拦截指针事件，也不影响文本选择。
- 深浅主题下自动使用对应的前景色。

### 组合

- 可包裹[表格](./table)、[卡片](./card)或页面内容区。

### 最佳实践

- 保持水印可见，但不要干扰正文阅读。
- 需要追溯时包含用户、时间或文档编号。
- 图片水印优先使用轮廓清晰的单色图形。

### 反模式

- 不要把水印当作安全边界。
- 不要使用过高的不透明度。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-watermark>` |
| Vue 组件 | `XhWatermarkContent` `XhWatermarkRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/watermark.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fontFamily` | `string` |  | 印文字用的字体，缺省 `sans-serif`。 图样是一张当遮罩用的 SVG，取不到页面里的字体，所以要在这里把字体名写全 （例如 `'PingFang SC, sans-serif'`）；写的字体在运行环境里不存在时由平台自己回退。 |
| `fontSize` | `number` |  | 字号，单位像素，缺省 14。 |
| `gap` | `number` |  | 两块图样之间留的空白，单位像素，缺省 24。 |
| `image` | `string` |  | 印在文字上方的图片，只收 `data:image/` 开头的内联图片。 图样是当遮罩用的，遮罩只取图样的透明度：印出来是这张图的剪影，颜色仍由 `--xh-watermark-fg` 给。外部地址一律不收——SVG 当图片用时取不到外部资源， 收了也印不出东西。 |
| `imageSize` | `WatermarkImageSize` |  | 图片的像素尺寸，缺省 64 × 64。 |
| `opacity` | `number` |  | 印子的深浅，0 到 1，缺省 0.15。 |
| `rotate` | `number` |  | 倾斜角度，单位度，缺省 -22。 |
| `text` | `string \| string[]` |  | 水印文字。给数组就是多行，单个字符串里的换行同样断行； 去掉空白行——它只让图样长高，印不出任何东西。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lines` | `readonly string[]` | 归一化后的文字行；没有可印的文字时是空数组。 |
| `tile` | `WatermarkTile` | 图样尺寸，即平铺步距；没有图样时宽高都是 0。 |
| `image` | `string` | 图样的 data URI；没有图样时是空串。 |
| `state` | `WatermarkState` |  |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/watermark.css` 使用 `[data-scope="watermark"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-watermark-fg` | `root` | `background-color` | `state=ready` | `--xh-fg-muted` | watermark 的 root 部件 background-color 覆盖槽。 |
| `--xh-watermark-image` | `root` | `-webkit-mask-image`<br>`mask-image` | `state=ready` | `none` | watermark 的 root 部件 -webkit-mask-image、mask-image 覆盖槽。 |
| `--xh-watermark-tile` | `root` | `-webkit-mask-size`<br>`mask-size` | `state=ready` | `auto` | watermark 的 root 部件 -webkit-mask-size、mask-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
