# 输入组 <Badge type="info" text="input-group" />

把输入框与它的前后缀、动作按钮拼成一个盒：相邻两段共用一条边，圆角只留在两端。

## 何时使用

- 一个输入框需要固定的前后缀说明它填什么（`https://` 打头、`.com` 收尾、单位、币种）。
- 输入框后面紧跟一个作用在它身上的动作（搜索、复制、提交）。
- 几个控件填的是同一件事的不同部分（区号 + 号码），想让它们看起来是一个控件。

## 何时不用

- 组内几段是并列的动作、彼此不围绕同一个输入：那是[按钮组](./button-group)。
- 前后缀要跟着输入内容变、或者本身可点：把它做成组里的一枚[按钮](./button)或[选择器](./select)，
  别塞进 `item`——`item` 是不可交互的固定文本。
- 只是想让两个控件挨着：留间距摆开就行，拼成一体会让人以为它们必须一起填。

## 特性

- 两个部件：`root` 是组容器，`item` 是前后缀块；组内的控件是作者自己的节点。
- 中缝合并：后一段回挪一个描边宽度，两条边叠成一条，组里看不到双线。
- 圆角只留在首尾两端，中间各段收平；用逻辑角属性写，rtl 下自动换边。
- 悬停或拿到焦点的那一段抬到最上层，聚焦环不会被邻座的底色和描边切掉一半。
- 档位跟着组内控件走：组里有 `sm` 的控件，`item` 就是 `sm`；也可以在组上写 `size` 直接指定。

## 示例

### 基础用法

前后缀与输入框拼成一个盒：中缝合成一条，圆角只留在两端

<XhDemo src="input-group/01-basic" />

### 搭动作钮

按钮作用在紧挨着它的那个输入框上，两段共用中缝那条边

<XhDemo src="input-group/02-action" />

### 尺寸档

前后缀块跟着组内控件自己的档走，组上不必把同一档再写一遍

<XhDemo src="input-group/03-size" />

### 区间输入

组里放两个输入框，中间夹一个前后缀块当连接词：三段共用两条中缝，圆角只留在最外两端；两头各自带 aria-label，读屏分得清哪个是起点

<XhDemo src="input-group/04-range" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-input-group>` |
| Vue 组件 | `XhInputGroupItem` `XhInputGroupRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/input-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="input-group"`：**`root`** · `item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上供皮肤写进 item 的高度、内衬与字号槽位。 不写时档位由组内控件自己的 data-size 决定，组里没有带档的控件就走 md。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/input-group.css` 按部件选择：`[data-scope="input-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-input-group-item-bg` · `--xh-input-group-item-border` · `--xh-input-group-item-fg` · `--xh-input-group-item-font-size` · `--xh-input-group-item-h` · `--xh-input-group-item-px` · `--xh-input-group-radius`

## 动效

`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 组里放[输入框](./text-field)、[数字输入框](./number-field)、[选择器](./select)、[按钮](./button)。
- 要带标签与校验提示时，把整个组放进[表单域](./field)，标签与提示由它给。

## 最佳实践

- 一组以三到四段为宜：段越多，哪一段是可填的就越难一眼看出来。
- 前后缀写成静态文本，别放会变的值——它长在框上，看起来像是已经填好的内容。
- 组里各控件写同一个尺寸档，或者干脆都不写：混档会让中缝对不齐。

## 反模式

- 用 `item` 装可点的东西：它不出角色也不接键盘，读屏用户不知道那里能点。
- 靠负外边距在业务代码里自己拼中缝：改一次描边宽度就得把每一处拼法翻一遍。
