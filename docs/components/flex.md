# 弹性布局 <Badge type="info" text="flex" />

一维排布容器：子项沿一条轴排开，间距走档位，还能在每两项之间放一份分隔符。容器自己不给子项加任何样式。

## 何时使用

- 一行按钮、一行图标加文字、一列表单项这类沿单轴排开的结构。
- 需要控制主轴分布与交叉轴对齐。
- 需要在相邻两项之间统一放一条竖线、一个点号这类分隔符。

## 何时不用

- 要排成二维网格、需要跨列：用[栅格](./grid)。
- 只是想切分页面上的两块区域：用[分隔线](./separator)，那是一条有语义的横线，不是排布容器。
- 只是想在两个元素之间留点空：直接写间距，别为此多套一层容器。

## 特性

- `gap` 收的是档位名不是像素：`xs` / `sm` / `md` / `lg` / `xl` 逐档指向一个间距令牌；不写不留间距。
- `justify` 管主轴怎么分、`align` 管交叉轴怎么对，两条轴互不相干。
- 缺省的交叉轴对齐随方向走：横排按中线对齐，竖排拉伸占满。写了 `align` 即以它为准。
- `inline` 让容器缩到内容宽度，能跟文字排一行。
- 档位不够用时给 `--xh-flex-gap` 写一个值，它排在所有档位之前。**它是自定义属性，会顺着继承流进嵌套在里面的每一层排布容器，把那些层的档位一并压掉**；只想改一层就写在那一层上。

## 示例

### 基础用法

一维排布容器：子项横着排，间距走档位，容器自己不给子项加任何样式

<XhDemo src="flex/01-basic" />

### 方向

orientation 换主轴：horizontal 横排（缺省），vertical 竖排

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

### 分隔符

每两个子项之间放一份分隔符：Vue 交给 split 插槽自动铺，WC 由作者逐个写在 root 里

<XhDemo src="flex/06-split" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-flex>` |
| Vue 组件 | `XhFlex` `XhFlexSplit` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/flex.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="flex"`：**`root`** · `split`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `FlexAlign` |  | 交叉轴对齐：start / center / end / stretch / baseline，不写则横排按中线对齐、竖排拉伸。 |
| `gap` | `FlexGap` |  | 子项间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `inline` | `boolean` |  | 容器按行内盒排版，宽度收到内容。 |
| `justify` | `FlexJustify` |  | 主轴分布：start / center / end / between / around / evenly，不写则子项从主轴起点排起。 |
| `orientation` | `Orientation` |  | 主轴方向：horizontal 横排、vertical 竖排，缺省 horizontal。 |
| `wrap` | `boolean` |  | 一行放不下时折行。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFlex` | `default` | — | 子项，按写进来的顺序排开。 |
| `XhFlex` | `split` | — | 分隔符的内容：写了它，组件在每两个子项之间各铺一个分隔符部件，逐缝重新求值一次。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getSplitProps` | `() => T['element']` | 分隔符节点。它是装饰件，恒带 aria-hidden：一排里夹着的竖线被逐条念出来只会打断内容。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `split` | `aria-hidden` | 'true' |

- 分隔符自带 `aria-hidden="true"`，不必自己写：读屏逐项念过来时，中间夹一堆竖线只会打断内容。
- 容器根上不写 `role`：里面装的是列表还是一组按钮，由作者自己声明。

## 样式

默认皮肤 `@xihan-ui/styles/flex.css` 按部件选择：`[data-scope="flex"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-gap` | props.gap |
| `root` | `data-inline` | ''（条件成立时才出现） |
| `root` | `data-justify` | props.justify |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-wrap` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-flex-gap`

## RTL

- 排布走的是逻辑方向：`dir="rtl"` 下横排自动从右往左，皮肤里没有物理左右。

## 组合

- 分隔符是一个正经部件：两端铺出来的 DOM 形状一致（`root` 底下按 `子项、分隔符、子项…` 相间排列），皮肤按 `split` 给它样式，样子由放进去的内容决定。
  - Vue：写 `split` 具名插槽，组件在每两个子项之间各铺一个分隔符部件，插槽逐缝重新求值；也可以不写插槽、自己在子项之间手写分隔符部件，两种写法铺出来的结构相同。
  - Web Components：元素不生成任何结构，分隔符由作者自己写在 `root` 里、夹在两个子项中间。
- 与[分隔线](./separator)配合：把一条竖向分隔线放进分隔符里，一排操作就被切成几组。

## 最佳实践

- 间距一律走档位，别写具体像素：换主题时间距节奏才跟着一起变。
- 一行里的按钮用它排，别用外边距凑——外边距在折行时会留出多余的空白。
- 一排东西会被动态摘掉时（关掉一个标签、删掉一条操作），焦点交接要自己接：被摘的那一项若正持有焦点，焦点会掉回页面根上，键盘与读屏用户每摘一次就丢一次位置。本组件只管排布，不接管焦点。

## 反模式

- 用嵌套的弹性容器模拟网格：列宽对不齐，且改一处要动很多层。
- 为了对齐给子项写负外边距。
- 把分隔符当内容用：它在每一道缝里各有一份，写进去的文字会重复很多遍，而且整个部件对读屏是隐藏的。
