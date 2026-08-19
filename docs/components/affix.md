# 固钉 <Badge type="info" text="affix" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-affix-layer`
