# 开关 <Badge type="info" text="switch" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

不传 checked 即为非受控，开关自己维护状态

<XhDemo src="switch/01-basic" />

### 受控

传了 checked 就由宿主说了算，组件自己不再改状态；v-model:checked 是它的语法糖

<XhDemo src="switch/02-controlled" />

### 禁用

disabled 同时挡住指针与键盘，状态机收不到 TOGGLE

<XhDemo src="switch/03-disabled" />

### 语气

tone 决定选中态轨道用哪族颜色，所以这里都置为开

<XhDemo src="switch/04-tone" />

### 尺寸

size 同时缩放轨道与滑块，不写就是缺省档

<XhDemo src="switch/05-size" />

### 事件

checked-change 带一份 { checked }，非受控时内部转移也照发一次

<XhDemo src="switch/06-event" />

### 自定义颜色

开态轨道、关态轨道与滑块各是一个组件令牌，语气档之外的配色写在行内

<XhDemo src="switch/07-color" />

### 轨道内文案与滑块标记

自渲外壳时子节点全由作者决定，data-state 同时打在轨道与滑块上

<XhDemo src="switch/08-content" />

### 异步提交

受控开关在回执到达前不落位；loading 让提交期呈现为「处理中」而非禁用——交互挂起、滑块转圈、仍可聚焦

<XhDemo src="switch/09-async" />

### 形状

轨道与滑块共用同一个形状令牌，在实例上覆盖一次两者一起变方

<XhDemo src="switch/10-shape" />

### 随表单提交

给了 name 才生出表单影子：开着才提交，值缺省是 on，与原生复选框一致

<XhDemo src="switch/11-form" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-switch>` |
| Vue 组件 | `XhSwitch` |
| 组合式函数 | `useSwitch` |
| 状态机 | `switchMachine` |
| 皮肤 | `@xihan-ui/styles/switch.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="switch"`：**`root`** · `thumb` · `hidden-input` · `label` · `text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` |  |  |
| `defaultChecked` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `loading` | `boolean` |  | 提交中：交互挂起、滑块转圈，但不呈现为禁用（仍可聚焦、对比度不降）。 |
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name 并参与提交。 |
| `value` | `string` |  | 提交出去的值，缺省 'on'，与原生复选框一致。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态轨道用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定轨道与滑块的几何档位。 |
| `onCheckedChange` | `(details: SwitchCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`off` · `on`

**事件**：`TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `FORM.RESET`

**判据**：`isCheckedControlled` · `defaultsToChecked`

## connect API

`useSwitch` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `checked` | `boolean` |  |
| `loading` | `boolean` | 提交中。 |
| `setChecked` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['button']` |  |
| `getThumbProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：勾上才提交。给了 name 才带 name，不给就不参与提交。 |
| `getLabelProps` | `() => T['label']` | 包住轨道与文字的 &lt;label&gt;：点文字即切换，轨道的可及名从文字来。只在带文字时渲染。 |
| `getTextProps` | `() => T['element']` | 轨道旁的文字。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/switch/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |
