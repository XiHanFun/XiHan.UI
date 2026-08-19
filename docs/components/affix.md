# 固钉 <Badge type="info" text="affix" />

滚过判定线就把内容钉在滚动容器可视区的边上；占位盒留在原位，页面不跳。

## 何时使用

- 表格的操作栏、表单的提交条、文章的目录，需要滚动时一直可达。

## 何时不用

- 元素从一开始就该钉住：直接写 `position: sticky`，不需要判定线。
- 要钉的是整块页面骨架（头、侧栏）：用[布局](./layout)的吸顶开关。
- 需要滚到顶部的按钮：那是[回到顶部](./back-top)。

## 特性

- 占位盒留在原位：吸住的那一刻页面不会突然少一段高度。
- `offsetTop` 把判定线往下挪，钉住后也在同一位置留出这段高度；给了 `offsetBottom` 就改贴下边。
- 吸附状态会回调，默认插槽也把它透出来。

## 示例

### 基础用法

滚过判定线就把内容钉在滚动容器可视区的上边；占位盒留在原位，页面不跳

<XhDemo src="affix/01-basic" />

### 让出吸顶栏

offset-top 把判定线往下挪，钉住后也在同一位置留出这段高度

<XhDemo src="affix/02-offset-top" />

### 贴下边

给了 offset-bottom 就改贴可视区的下边，判定线也换到下边

<XhDemo src="affix/03-offset-bottom" />

### 监听吸附状态

affix-change 报吸住与松开；默认插槽也把 affixed 透出来

<XhDemo src="affix/04-affix-change" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-affix>` |
| Vue 组件 | `XhAffixContent` `XhAffixRoot` |
| 组合式函数 | `useAffix` |
| 状态机 | `affixMachine` |
| 皮肤 | `@xihan-ui/styles/affix.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="affix"`：**`root`** · **`content`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `offsetTop` | `number` |  | 吸住后距滚动容器可视区上边的距离（px）。 |
| `offsetBottom` | `number` |  | 吸住后距滚动容器可视区下边的距离（px）；给了它就改贴下边。 |
| `onAffixChange` | `(details: AffixChangeDetails) => void` |  | 吸附状态变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `affix-change` | `AffixChangeDetails` | 吸附状态变化；detail 为 `{ affixed: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhAffixRoot` | `default` | `AffixRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`released` · `affixed`

**事件**：`SCROLL.RESOLVE`

**判据**：`shouldAffix` · `shouldRelease`

## connect API

`useAffix` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `affixed` | `boolean` | 此刻是不是吸住了。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/affix.css` 按部件选择：`[data-scope="affix"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `data-affixed` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-affix-layer`

## 组合

- 与[锚点](./anchor)配合做吸顶目录；与[工具栏](./toolbar)配合做吸顶操作条。

## 最佳实践

- 页面已有吸顶栏时把栏高填进 `offsetTop`，否则会两层叠在一起。
- 钉住后给一点视觉变化（阴影或描边），让用户知道它已经脱离了原位。

## 反模式

- 一屏里钉住多个条：可视高度被吃光，正文只剩一条缝。
- 在移动端钉住高条：小屏上这块面积很贵。
