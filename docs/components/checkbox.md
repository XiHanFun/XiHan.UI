# 复选框 <Badge type="info" text="checkbox" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

不传 checked 即为非受控

<XhDemo src="checkbox/01-basic" />

### 三态

checked 传 "indeterminate" 表示部分选中，它不是第三个稳定态：点一下就落到 true

<XhDemo src="checkbox/02-indeterminate" />

### 语气

tone 决定选中态的底与描边用哪族颜色，所以这里都置为选中

<XhDemo src="checkbox/03-tone" />

### 尺寸

size 同时缩放方框与勾选标记，不写就是缺省档

<XhDemo src="checkbox/04-size" />

### 事件

checked-change 带一份 { checked }，非受控时内部翻转也照发一次

<XhDemo src="checkbox/05-event" />

### 业务取值

checked 只认布尔，用一个可写 computed 在中间换一次，绑上去的就是业务值

<XhDemo src="checkbox/06-value-mapping" />

### 自渲外壳与命令式聚焦

组合式函数只给属性，节点由作者自己写，DOM 引用因此拿得到

<XhDemo src="checkbox/07-focus" />

### 随表单提交

给了 name 才生出表单影子：勾上才提交，半选按未勾处理，与原生复选框一致

<XhDemo src="checkbox/08-form" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox>` |
| Vue 组件 | `XhCheckbox` |
| 组合式函数 | `useCheckbox` |
| 状态机 | `checkboxMachine` |
| 皮肤 | `@xihan-ui/styles/checkbox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="checkbox"`：**`root`** · `indicator` · `hidden-input` · `label` · `text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |  |
| `defaultChecked` | `CheckboxCheckedState` |  |  |
| `disabled` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name 并参与提交。 |
| `value` | `string` |  | 提交出去的值，缺省 'on'，与原生复选框一致。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框边长与勾的字号档位。 |
| `onCheckedChange` | `(details: CheckboxCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`off` · `on` · `indeterminate`

**事件**：`TOGGLE` · `CHECK` · `UNCHECK` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `CONTROLLED.INDETERMINATE` · `FORM.RESET`

**判据**：`isCheckedControlled` · `defaultsToChecked` · `defaultsToIndeterminate`

## connect API

`useCheckbox` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |
| `setChecked` | `(next: boolean) => void` | 半选只能由 checked prop 给出，这里只接受全选 / 全不选。 |
| `getRootProps` | `() => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：勾上才提交，半选按未勾处理。给了 name 才带 name。 |
| `getLabelProps` | `() => T['label']` | 包住方框与文字的 &lt;label&gt;：点文字即切换，方框的可及名从文字来。只在带文字时渲染。 |
| `getTextProps` | `() => T['element']` | 方框旁的文字。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |
