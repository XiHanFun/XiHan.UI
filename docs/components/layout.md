# 布局 <Badge type="info" text="layout" />

布局组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

头与脚各横贯一行，侧栏与内容并排占中间那一行；少写一段就少一行或少一列

<XhDemo src="layout/01-basic" />

### 折叠侧栏

不传 sider-collapsed 即为非受控，把手按下去只改宽度，侧栏节点一直在

<XhDemo src="layout/02-sider-collapse" />

### 受控

传了 sider-collapsed 就由宿主说了算，组件不再自改，只发 sider-collapsed-change

<XhDemo src="layout/03-controlled" />

### 侧栏位置

sider-placement 决定侧栏挂在行首还是行尾，分隔线也跟着换到挨内容的那一边

<XhDemo src="layout/04-sider-placement" />

### 侧栏宽度

展开与折叠各一档宽度，两档都接受任意 CSS 长度，切换时按皮肤里的过渡走

<XhDemo src="layout/05-sider-width" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-layout>` |
| Vue 组件 | `XhLayoutContent` `XhLayoutFooter` `XhLayoutHeader` `XhLayoutRoot` `XhLayoutSider` `XhLayoutSiderTrigger` |
| 组合式函数 | `useLayout` |
| 状态机 | `layoutMachine` |
| 皮肤 | `@xihan-ui/styled/layout.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="layout"`：**`root`** · `header` · `sider` · `content` · `footer` · `sider-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `siderCollapsed` | `boolean` |  | 受控折叠态：给了值就由宿主说了算。 |
| `defaultSiderCollapsed` | `boolean` |  | 非受控初始折叠态。 |
| `siderWidth` | `string` |  | 展开时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderCollapsedWidth` | `string` |  | 折叠时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderPlacement` | `LayoutSiderPlacement` |  | 侧栏挂在行首还是行尾，缺省 start。 |
| `bordered` | `boolean` |  | 在头、侧栏、脚与内容之间画分隔线。 |
| `onSiderCollapsedChange` | `(details: LayoutSiderCollapsedChangeDetails) => void` |  | 折叠态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`expanded` · `collapsed`

**事件**：`SIDER.COLLAPSE` · `SIDER.EXPAND` · `SIDER.TOGGLE` · `CONTROLLED.COLLAPSE` · `CONTROLLED.EXPAND`

**判据**：`isSiderCollapsedControlled`

## connect API

`useLayout` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `siderCollapsed` | `boolean` | 侧栏当前是否折叠。 |
| `setSiderCollapsed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getSiderProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getSiderTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in sider-trigger | 折叠/展开 sider |
