# 徽标 <Badge type="info" text="badge" />

提醒你注意某个东西：它有几条未读、处在什么状态、是不是新的。
徽标说的是「有事情发生了」，不是「这是什么」——后者是[标签](./tag)的活。

## 何时使用

- 计数角标：未读消息、购物车件数、待办条数。
- 小红点：只表示「有新的」，不说有几条。
- 状态提示：在线 / 离线、进行中、新。
- 附着在按钮、头像、标签页、菜单项上，报告那个东西的状态。

## 何时不用

- 表达「这是什么」——分类、技能、筛选条件：用[标签](./tag)，它承载实体身份，还能被摘掉。
- 用户要点它来筛选或删除：徽标不接交互，那是标签的语义。
- 表达进度：用[进度条](./progress)。
- 是一个可开关的选项：用[切换按钮](./toggle)。

## 特性

- 形态 · 语气 · 尺寸三轴与其余组件同源。
- `count` 自己出数字，超过 `max`（默认 99）写成「99+」。
- 计数为 0 时整枚收起，要显示 0 就开 `showZero`。
- `dot` 收成一个圆点：只表示「有」，不表示「有几个」。
- `label` 给读屏一整句：光念「3」听不出是什么的 3。

## 示例

### 变体

badge 没有状态机，connect 直接由 props 算属性

<XhDemo src="badge/01-basic" />

### 用作状态标记

徽标不接收焦点、也不进 Tab 序列，状态语义靠文字本身表达

<XhDemo src="badge/02-status" />

### 形态

variant 决定颜色怎么用：实心填底、淡色填底、只描边

<XhDemo src="badge/03-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 solid 形态只看语气的差别

<XhDemo src="badge/04-tone" />

### 尺寸

size 只改内边距与字号，不写就是缺省档

<XhDemo src="badge/05-size" />

### 带图元的标签

根是 inline-flex 且自带间距，图标或头像直接写进内容里跟文字并排

<XhDemo src="badge/06-with-glyph" />

### 自定义配色

不写 variant 时底色与文字色取自组件令牌；描边这一条直接写 border-color

<XhDemo src="badge/07-custom-color" />

### 挂成角标

外层套一层定位上下文，徽标就落到子元素的角上。计数、上限截断、0 值收起、圆点都归徽标自己算，宿主只管定位

<XhDemo src="badge/08-anchor" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-badge>` |
| Vue 组件 | `XhBadge` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/badge.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="badge"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 计数。给了它徽标就自己出数字，超过 max 写成「max+」。 与默认插槽二选一：插槽有内容时以插槽为准。 |
| `dot` | `boolean` |  | 只出一个点，不出数字。给了它 count 只用来决定显不显示。 |
| `label` | `string` |  | 读屏怎么念这枚徽标。 角标挂在按钮、头像上时，光念数字听不出这是什么，得由宿主给出「3 条未读」这样的整句。 |
| `max` | `number` |  | 计数上限，默认 99：再多也只写 99+，免得徽标被撑变形。 |
| `showZero` | `boolean` |  | 计数为 0 时是否照样显示，默认不显示——没有未读就不该有角标。 |
| `size` | `Size` |  | 尺寸：sm / md / lg |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `variant` | `BadgeVariant` |  |  |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 此刻该不该渲染：计数为 0 且没开 showZero 时为假。 |
| `text` | `string` | 算好的显示文本：超过 max 的写成「99+」；dot 模式与无 count 时为空串。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.label |
| `root` | `role` | 'status' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/badge.css` 按部件选择：`[data-scope="badge"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-dot` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-badge-bg` · `--xh-badge-dot-size` · `--xh-badge-fg` · `--xh-badge-font-size` · `--xh-badge-font-weight`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 挂在[头像](./avatar)、[按钮](./button)、[标签页](./tabs)的标签上做角标：
  外层套一层定位上下文，徽标就落到子元素的角上。

## 最佳实践

- 角标要给 `label`：读屏念到孤零零一个数字，用户不知道那是未读数还是别的。
- 状态别只用颜色区分：红绿色觉障碍的用户看不出差别，文字必须说清楚。
- 计数会变的地方交给 `count` 算，别自己拼「99+」——上限口径散在各处迟早不一致。

## 反模式

- 拿徽标当分类标签用：它不可交互、摘不掉，用户点了没反应。
- 一屏里到处都是高饱和度的徽标：全都在喊，等于都没喊。
- 用徽标承载长句子。
