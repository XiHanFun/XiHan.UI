# 折叠区域 <Badge type="info" text="collapsible" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

不传 open 即为非受控，defaultOpen 只给初始值，之后由组件自己维护开合

<XhDemo src="collapsible/01-basic" />

### 受控

传了 open 就由宿主说了算，组件自己不再改状态，只发 open-change 报告意图

<XhDemo src="collapsible/02-controlled" />

### 禁用

disabled 把触发器整个关停，点击与键盘都不再改开合，已展开的内容维持原样

<XhDemo src="collapsible/03-disabled" />

### 尺寸

size 换的是触发按钮的高度、内边距与字号，三档并排对照

<XhDemo src="collapsible/04-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-collapsible>` |
| Vue 组件 | `XhCollapsibleContent` `XhCollapsibleRoot` `XhCollapsibleTrigger` |
| 组合式函数 | `useCollapsible` |
| 状态机 | `collapsibleMachine` |
| 皮肤 | `@xihan-ui/styled/collapsible.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="collapsible"`：`root` · `trigger` · **`content`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useCollapsible` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起 content |
