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

- 语气 · 尺寸两轴与其余组件同源；角标只有一种形态，没有形态轴。
- `placement` 决定挂在哪个角，四角可选，跟随文字方向。
- `count` 自己出数字，超过 `max`（默认 99）写成「99+」。
- 计数为 0 时整枚收起，要显示 0 就开 `showZero`。
- `dot` 收成一个圆点：只表示「有」，不表示「有几个」。
- `label` 给读屏一整句：光念「3」听不出是什么的 3。

## 示例

### 计数角标

被标记的东西写进默认插槽，角标自己贴到它的角上；计数、上限截断与 0 值收起都归角标算

<XhDemo src="badge/01-basic" />

### 圆点与落点

dot 只表示「有」不表示「有几个」；placement 决定挂在哪个角，rtl 下 end 自动落到左边

<XhDemo src="badge/02-dot" />

### 语气与尺寸

tone 决定用哪族颜色——角标现实里主要是未读红点与在线/离线点；size 换的是圆点直径、两位数时的最小宽度与字号

<XhDemo src="badge/03-tone-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-badge>` |
| Vue 组件 | `XhBadge` `XhBadgeIndicator` `XhBadgeRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/badge.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="badge"`：**`root`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 计数。给了它角标就自己出数字，超过 max 写成「max+」。 与 indicator 的默认插槽二选一：插槽有内容时以插槽为准。 |
| `dot` | `boolean` |  | 只出一个点，不出数字。给了它 count 只用来决定显不显示。 |
| `label` | `string` |  | 读屏怎么念这枚角标。 角标挂在按钮、头像上时，光念数字听不出这是什么，得由宿主给出「3 条未读」这样的整句。 |
| `max` | `number` |  | 计数上限，默认 99：再多也只写 99+，免得角标被撑变形。 |
| `placement` | `BadgePlacement` |  | 挂在哪个角上，默认 top-end（右上角；rtl 下自动落到左上）。 |
| `showZero` | `boolean` |  | 计数为 0 时是否照样显示，默认不显示——没有未读就不该有角标。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。换的是圆点直径、两位数时的最小宽度与字号。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 角标现实里主要用 danger（未读小红点）与 success / neutral（在线 / 离线点）。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBadge` | `default` | — |  |
| `XhBadgeIndicator` | `default` | `{ text: string }` |  |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 此刻该不该渲染：计数为 0 且没开 showZero 时为假。 |
| `text` | `string` | 算好的显示文本：超过 max 的写成「99+」；dot 模式与无 count 时为空串。 |
| `getRootProps` | `() => T['element']` | 锚点：被标记的那个东西（按钮、头像、标签页）放进它里面。 |
| `getIndicatorProps` | `() => T['element']` | 角标本身，绝对定位在 root 的某个角上。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `indicator` | `aria-label` | props.label |
| `indicator` | `role` | 'status' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/badge.css` 按部件选择：`[data-scope="badge"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-placement` | props.placement |
| `indicator` | `data-dot` | ''（条件成立时才出现） |
| `indicator` | `data-placement` | props.placement |
| `indicator` | `data-size` | props.size |
| `indicator` | `data-tone` | props.tone |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-badge-bg` · `--xh-badge-dot-size` · `--xh-badge-fg` · `--xh-badge-font-size` · `--xh-badge-font-weight` · `--xh-badge-min-size` · `--xh-badge-px` · `--xh-badge-radius` · `--xh-badge-ring`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 挂在[头像](./avatar)、[按钮](./button)、[标签页](./tabs)的标签上做角标：
  被标记的那个东西直接写进默认插槽，定位与偏移由组件自己承担，不必外层再套定位上下文。

## 最佳实践

- 角标要给 `label`：读屏念到孤零零一个数字，用户不知道那是未读数还是别的。
- 状态别只用颜色区分：红绿色觉障碍的用户看不出差别，文字必须说清楚。
- 计数会变的地方交给 `count` 算，别自己拼「99+」——上限口径散在各处迟早不一致。

## 反模式

- 拿徽标当分类标签用：它不可交互、摘不掉，用户点了没反应。
- 一屏里到处都是高饱和度的徽标：全都在喊，等于都没喊。
- 用徽标承载长句子。
