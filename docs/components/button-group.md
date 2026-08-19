# 按钮组 <Badge type="info" text="button-group" />

把一组语义相关的按钮连成一条：相邻两段共用一条边，圆角只留在两端，视觉上是一个控件。

## 何时使用

- 几个动作属于同一件事，且并列关系明确（保存 / 另存为 / 导出）。
- 想让整组按钮的档位、形态与语气写一次就够。

## 何时不用

- 组内各段是互斥选项、要选中其中一个：那是[切换按钮组](./toggle-group)——它有选中语义与方向键导航，按钮组两样都没有。
- 各按钮之间没有语义关联：单独摆开，用间距区分，别硬连成一条。

## 特性

- 只有 `root` 一个部件：组内每一段是作者自己的按钮，不是本组件的角色节点。
- 尺寸、形态、语气写在容器上，沿自定义属性流给组内每一段。
- 横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴。

## 示例

### 基础用法

一组相关按钮连成一条：相邻两段共用一条边，圆角只留在两端

<XhDemo src="button-group/01-basic" />

### 排布

横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴

<XhDemo src="button-group/02-orientation" />

### 尺寸

高度、内边距与字号在组上写一次，沿自定义属性流给组内每一段

<XhDemo src="button-group/03-size" />

### 形态与语气

形态决定颜色怎么用、语气决定用哪族颜色，两者都写在组上，段自己不重复标注

<XhDemo src="button-group/04-variant-tone" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button-group>` |
| Vue 组件 | `XhButtonGroup` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/button-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="button-group"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` |  | 排布：horizontal / vertical，决定相邻两段在哪个轴上合边。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上供皮肤写进组内按钮的高度、内边距与字号槽位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，落到根上沿继承流给组内每一段。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，落到根上供皮肤写进组内按钮的颜色槽位。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/button-group.css` 按部件选择：`[data-scope="button-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-button-group-radius`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 组内放[按钮](./button)；最后一段放一个带菜单的按钮即得"主动作 + 更多"的分裂按钮。

## 最佳实践

- 一组以三到五段为宜，再多就该收进[菜单](./menu)。
- 档位只写在组上，别再逐段重复——两处写法不一致时段与段会错位。

## 反模式

- 用按钮组表达选中态：它不出 `aria-pressed`，读屏用户听不出哪一段是当前项。
- 组内混进不可点的说明文字，破坏"每一段都是动作"的预期。
