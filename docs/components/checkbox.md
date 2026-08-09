# 复选框 <Badge type="info" text="checkbox" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

不传 checked 即为非受控

<XhDemo src="checkbox/01-basic" />

### 三态

checked 传 "indeterminate" 表示部分选中，它不是第三个稳定态：点一下就落到 true

<XhDemo src="checkbox/02-indeterminate" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox>` |
| Vue 组件 | `XhCheckbox` |
| 组合式函数 | `useCheckbox` |
| 状态机 | `checkboxMachine` |
| 皮肤 | `@xihan-ui/styled/checkbox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="checkbox"`：**`root`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |  |
| `defaultChecked` | `CheckboxCheckedState` |  |  |
| `disabled` | `boolean` |  |  |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg，决定方框边长与勾的字号档位。 |
| `onCheckedChange` | `(details: CheckboxCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`off` · `on` · `indeterminate`

**事件**：`TOGGLE` · `CHECK` · `UNCHECK` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `CONTROLLED.INDETERMINATE`

**判据**：`isCheckedControlled`

## connect API

`useCheckbox` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |
| `setChecked` | `(next: boolean) => void` | 半选只能由 checked prop 给出，这里只接受全选 / 全不选。 |
| `getRootProps` | `() => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |
