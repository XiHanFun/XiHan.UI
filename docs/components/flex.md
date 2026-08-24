# 弹性布局 <Badge type="info" text="flex" />

一维排布容器：子项沿一条轴排开，间距走档位。容器自己不给子项加任何样式。

## 何时使用

- 一行按钮、一行图标加文字、一列表单项这类沿单轴排开的结构。
- 需要控制主轴分布与交叉轴对齐。

## 何时不用

- 要排成二维网格、需要跨列：用[栅格](./grid)。
- 只是想在两个元素之间留点空：直接写间距，别为此多套一层容器。

## 特性

- `gap` 收的是档位名不是像素：`xs` / `sm` / `md` / `lg` / `xl` 逐档指向一个间距令牌。
- `justify` 管主轴怎么分、`align` 管交叉轴怎么对，两条轴互不相干。
- `inline` 让容器缩到内容宽度，能跟文字排一行。

## 示例

### 基础用法

一维排布容器：子项横着排，间距走档位，容器自己不给子项加任何样式

<XhDemo src="flex/01-basic" />

### 方向

direction 换主轴：row 横排（缺省），column 竖排

<XhDemo src="flex/02-direction" />

### 对齐与分布

justify 管主轴怎么分，align 管交叉轴怎么对；两条轴互不相干

<XhDemo src="flex/03-align-justify" />

### 间距档位

gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌

<XhDemo src="flex/04-gap" />

### 折行与行内

wrap 让放不下的子项换行、行与行之间同样吃 gap；inline 让容器缩到内容宽度、能跟文字排一行

<XhDemo src="flex/05-wrap-inline" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-flex>` |
| Vue 组件 | `XhFlex` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/flex.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="flex"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `FlexAlign` |  | 交叉轴对齐：start / center / end / stretch / baseline，不写则由皮肤的缺省对齐决定。 |
| `direction` | `FlexDirection` |  | 主轴方向的旧写法。 @deprecated 用 `orientation`（horizontal / vertical）。两个都写时以 orientation 为准。 |
| `gap` | `FlexGap` |  | 子项间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `inline` | `boolean` |  | 容器按行内盒排版，宽度收到内容。 |
| `justify` | `FlexJustify` |  | 主轴分布：start / center / end / between / around / evenly，不写则子项从主轴起点排起。 |
| `orientation` | `Orientation` |  | 主轴方向：horizontal 横排、vertical 竖排，缺省 horizontal。 |
| `wrap` | `boolean` |  | 一行放不下时折行。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/flex.css` 按部件选择：`[data-scope="flex"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-direction` | 'column' \| 'row' |
| `root` | `data-gap` | props.gap |
| `root` | `data-inline` | ''（条件成立时才出现） |
| `root` | `data-justify` | props.justify |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-wrap` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-flex-gap`

## 组合

- 与[分隔线](./separator)配合切分一行里的几组控件。

## 最佳实践

- 间距一律走档位，别写具体像素：换主题时间距节奏才跟着一起变。
- 一行里的按钮用它排，别用外边距凑——外边距在折行时会留出多余的空白。

## 反模式

- 用嵌套的弹性容器模拟网格：列宽对不齐，且改一处要动很多层。
- 为了对齐给子项写负外边距。
