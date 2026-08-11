# 浮动按钮 <Badge type="info" text="float-button" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

点触发器展开一组动作，再点一下收起；收起时那组按钮退出 Tab 序列

<XhDemo src="float-button/01-basic" />

### 四角

placement 决定钉在哪一角，start / end 跟着书写方向走；那一组恒往页面中间长

<XhDemo src="float-button/02-placement" />

### 展开方式

hover 指针进出整个壳就开合，click 点触发器；点这条恒在，触摸与键盘都靠它

<XhDemo src="float-button/03-expand-trigger" />

### 外形与贴边

shape 换圆角档，offset 决定距那两条边多远；translations 换掉读屏念出的名字

<XhDemo src="float-button/04-shape-offset" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-float-button>` |
| Vue 组件 | `XhFloatButtonList` `XhFloatButtonRoot` `XhFloatButtonTrigger` |
| 组合式函数 | `useFloatButton` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/float-button.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="float-button"`：**`root`** · **`trigger`** · **`list`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `expandTrigger` | `FloatButtonExpandTrigger` |  | 展开方式，默认 click。 |
| `offset` | `number` |  | 距那两条边的距离（px），默认 24。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `FloatButtonPlacement` |  | 钉在哪一角，默认 bottom-end。 |
| `shape` | `FloatButtonShape` |  | 触发器外形，默认 circle。 |
| `translations` | `Partial<FloatButtonTranslations>` |  |  |

## connect API

`useFloatButton` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 展开的那一组此刻露不露面。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getListProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, not disabled | 展开 / 收起 list；悬停展开时这条路照样在，触摸与键盘都靠它 |
| `Escape` | open，焦点在整组之内 | 收起 list；悬停展开时指针一走就收，键盘上就只剩这一条路 |
| `Tab` / `Shift+Tab` | open | 走进展开的那一组；收起时 list 带 hidden，里面的按钮一并退出 Tab 序列 |
