# 复选框 <Badge type="info" text="checkbox" />

一个可以选中、不选中、也可以处于半选的独立开关。

## 何时使用

- 表单里的单项同意、单项开关，且要随表单提交。
- 需要表达"部分选中"（全选框对应下面几项只勾了一部分）。

## 何时不用

- 开关立即生效、且是一项设置：用[开关](./switch)。
- 几个互斥项里选一个：用[单选组](./radio-group)。
- 一组多选项：用[复选框组](./checkbox-group)，它管值的汇总。

## 特性

- 三态：选中、未选中、半选（`indeterminate`）。
- `hidden-input` 承担表单参与，`name` / `value` 照常提交。
- `readOnly` 与 `disabled` 不同：只读仍能聚焦、仍被提交。

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

checked 只认布尔，在中间换一道，进出两头拿到的都是业务值

<XhDemo src="checkbox/06-value-mapping" />

### 命令式聚焦

节点由作者自己写，DOM 引用因此拿得到：聚焦、失焦与翻转都走命令式

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
| `readOnly` | `boolean` |  | 只读：勾不动，但仍可聚焦、仍参与提交，对比度不降。 |
| `invalid` | `boolean` |  | 校验失败：只改呈现，不挡交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 |
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name 并参与提交。 |
| `value` | `string` |  | 提交出去的值，缺省 'on'，与原生复选框一致。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框边长与勾的字号档位。 |
| `onCheckedChange` | `(details: CheckboxCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `checked-change` | `CheckboxCheckedChangeDetails` | checked 状态变化；detail 为 `{ checked: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCheckbox` | `default` | — | 方框旁的文字；不写就只有一个方框。 |
| `XhCheckbox` | `indicator` | — | 方框里的图形；不写由皮肤画勾。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `indicator` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `label` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | 'indeterminate' \| 'checked' \| 'unchecked' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-checked` | 'mixed' \| 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/checkbox.css` 按部件选择：`[data-scope="checkbox"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `root` | `data-tone` | props.tone |
| `indicator` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-invalid` | ''（条件成立时才出现） |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-size` | props.size |
| `label` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | `data-disabled` | ''（条件成立时才出现） |
| `text` | `data-invalid` | ''（条件成立时才出现） |
| `text` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-checkbox-bg` · `--xh-checkbox-bg-checked` · `--xh-checkbox-border` · `--xh-checkbox-border-checked` · `--xh-checkbox-border-invalid` · `--xh-checkbox-fg` · `--xh-checkbox-fg-invalid` · `--xh-checkbox-icon-size` · `--xh-checkbox-indicator-fg` · `--xh-checkbox-label-fg` · `--xh-checkbox-label-fg-disabled` · `--xh-checkbox-label-font-size` · `--xh-checkbox-label-gap`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 外面套[表单字段](./field)；成组时用[复选框组](./checkbox-group)；在[表格](./table)里做行选择。

## 最佳实践

- 标签点得动——把文字放进 `label` 部件，别只让方框可点。
- 半选只用来表达"下级部分选中"，不要拿它当第三种业务状态。

## 反模式

- 用单个复选框表达二选一（是 / 否）：用[单选组](./radio-group)，两个选项都要能被读出来。
- 勾上就立刻发请求却不给反馈。
