# 图标 <Badge type="info" text="icon" />

画一枚矢量图元，并把"它是装饰还是信息"这件事说清楚。

## 何时使用

- 给动作、状态或条目配一枚图形标记。
- 图形本身就是唯一的信息载体（比如只有图标的按钮里那枚图元）——这时给 `label`。

## 何时不用

- 需要一个带底色的圆形底座：用[图标块](./icon-wrapper)。
- 图形是照片或插画：用[图片](./image)。

## 特性

- 传的是图标记录本身而不是名字：按名字查表就得把整张表静态引进来，摇树全废。
- 命名只有两态：给了非空白 `label` 就是 `role="img"` 加 `aria-label`；没给就是 `aria-hidden="true"` 的装饰件。没有第三种。
- `size` 三档改直径、`weight` 三档改描边粗细；缺省档不落 `data-*`，皮肤的基础规则就是缺省档。
- 图标没有底色，语气只落在前景上。

## 示例

### 基础用法

传的是图标记录本身而不是名字：名字要运行期查表，查表就得把整张表静态引进来，摇树全废

<XhDemo src="icon/01-basic" />

### 尺寸与描边

size 三档改直径、weight 三档改 stroke-width；缺省档不落 data-* 属性，皮肤的基础规则就是缺省档

<XhDemo src="icon/02-size-weight" />

### 可及名字

命名只有两态：给了非空白 label 就是 role="img" + aria-label，没给就是 aria-hidden="true" 的装饰件

<XhDemo src="icon/03-label" />

### 自定义图元

默认插槽给出内容时改由插槽填充根 svg，元素不再生成 glyph 空壳；坐标系此时由自己写的 viewBox 定

<XhDemo src="icon/04-custom-glyph" />

### 语气

图标没有底色，语气只落在前景上，取普通背景上表达该语气的那档文字色

<XhDemo src="icon/05-tone" />

### 前景分级

图标没有底色，前景是一个组件令牌；跟正文取同一族文字色，图标就跟着排出主次

<XhDemo src="icon/06-depth" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon>` |
| Vue 组件 | `XhIcon` |
| 组合式函数 | `useIcon` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="icon"`：**`root`** · `glyph`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `icon` | `IconRecord` |  | 要画的图标。传的是记录本身而不是名字： 名字要走运行期查表，查表就必须把全表静态引进来，摇树全废。 |
| `label` | `string` |  | 可及名字。 给了非空白文本 = 这个图标是页面上唯一说出这件事的东西，输出 role="img" + aria-label； 缺席或全空白 = 装饰，输出 aria-hidden="true"。没有第三种形态。 |
| `size` | `Size` |  | 直径档位，缺省 md；缺省档不输出 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `weight` | `IconWeight` |  | 描边粗细档位，缺省 regular；缺省档不输出 data-weight。 |

## connect API

`useIcon` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string \| undefined` | 解析后的可及名字；装饰态为 undefined。 |
| `decorative` | `boolean` | 是否装饰态（label 没给或全空白）。 |
| `nodes` | `readonly IconNode[]` | 要铺进 glyph 的图元树；没传 icon 时是空数组。 |
| `content` | `IconRecord \| undefined` | 当前铺设内容的身份。就是 icon 本身：记录是模块级常量，引用相等即内容相等。 不用字符串签名——签名要遍历整棵树再拼串，每次 wire 都付一遍。 |
| `getRootProps` | `() => T['element']` |  |
| `getGlyphProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | props.label \| undefined |
| `root` | `role` | undefined \| 'img' |

## 样式

默认皮肤 `@xihan-ui/styles/icon.css` 按部件选择：`[data-scope="icon"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-icon` | icon?.name |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-weight` | props.weight |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-icon-fg` · `--xh-icon-shift` · `--xh-icon-size` · `--xh-icon-stroke`

## 组合

- 放进[按钮](./button)的 `prefix` / `suffix`，或[图标块](./icon-wrapper)的底座里。

## 最佳实践

- 旁边已经有文字说明同一件事时，别给 `label`——重复的名字会被读屏念两遍。
- 同一屏里的图标保持同一档 `weight`，粗细混用比尺寸混用更显乱。

## 反模式

- 给装饰性图标写 `label`，或给唯一承载语义的图标漏写 `label`：两者都会让读屏用户听到错的东西。
- 用图标单独表达状态而不配文字或提示：图形的含义没有共识。
