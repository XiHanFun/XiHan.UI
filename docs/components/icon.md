# 图标 <Badge type="info" text="icon" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon>` |
| Vue 组件 | `XhIcon` |
| 组合式函数 | `useIcon` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/icon.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="icon"`：**`root`** · `glyph`

## connect API

`useIcon` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string | undefined` | 解析后的可及名字；装饰态为 undefined。 |
| `decorative` | `boolean` | 是否装饰态（label 没给或全空白）。 |
| `nodes` | `readonly IconNode[]` | 要铺进 glyph 的图元树；没传 icon 时是空数组。 |
| `content` | `IconRecord | undefined` | 当前铺设内容的身份。就是 icon 本身：记录是模块级常量，引用相等即内容相等。 不用字符串签名——签名要遍历整棵树再拼串，每次 wire 都付一遍。 |
| `getRootProps` | `() => T['element']` |  |
| `getGlyphProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
