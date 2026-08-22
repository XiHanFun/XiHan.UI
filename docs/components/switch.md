# 开关 <Badge type="info" text="switch" />

一项设置的开与关，翻过去立即生效。

## 何时使用

- 设置页里立即生效的开关（通知、深色模式、自动保存）。

## 何时不用

- 值要随表单一起提交：用[复选框](./checkbox)，它是表单控件的原生语义。
- 是工具栏上的格式按钮：用[切换按钮](./toggle)。

## 特性

- `loading` 表达在途：受控时宿主不写回就不翻，请求失败界面自然停在原状态。
- 轨道内可以写文案、滑块上可以放标记。
- `readOnly` 与 `disabled` 分开：只读仍可聚焦。

## 示例

### 基础用法

不传 checked 即为非受控，开关自己维护状态

<XhDemo src="switch/01-basic" />

### 受控

传了 checked 就由宿主说了算，组件自己不再改状态；变化意图从 checked-change 出来，写回才落位

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

轨道的子节点全由作者决定，data-state 同时打在轨道与滑块上

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
| `readOnly` | `boolean` |  | 只读：拨不动，但仍可聚焦、仍参与提交，对比度不降。 |
| `invalid` | `boolean` |  | 校验失败：只改呈现，不挡交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 |
| `loading` | `boolean` |  | 提交中：交互挂起、滑块转圈，但不呈现为禁用（仍可聚焦、对比度不降）。 |
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name 并参与提交。 |
| `value` | `string` |  | 提交出去的值，缺省 'on'，与原生复选框一致。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态轨道用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定轨道与滑块的几何档位。 |
| `onCheckedChange` | `(details: SwitchCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `checked-change` | `SwitchCheckedChangeDetails` | checked 状态变化；detail 为 `{ checked: boolean }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'checked' \| 'unchecked' |
| `thumb` | 'checked' \| 'unchecked' |
| `label` | 'checked' \| 'unchecked' |
| `text` | 'checked' \| 'unchecked' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-checked` | 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'switch' |

## 样式

默认皮肤 `@xihan-ui/styles/switch.css` 按部件选择：`[data-scope="switch"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'checked' \| 'unchecked' |
| `root` | `data-tone` | props.tone |
| `thumb` | `data-disabled` | ''（条件成立时才出现） |
| `thumb` | `data-loading` | ''（条件成立时才出现） |
| `thumb` | `data-state` | 'checked' \| 'unchecked' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-size` | props.size |
| `label` | `data-state` | 'checked' \| 'unchecked' |
| `text` | `data-disabled` | ''（条件成立时才出现） |
| `text` | `data-state` | 'checked' \| 'unchecked' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-switch-bg` · `--xh-switch-bg-checked` · `--xh-switch-border-invalid` · `--xh-switch-label-fg` · `--xh-switch-label-fg-disabled` · `--xh-switch-label-font-size` · `--xh-switch-label-gap` · `--xh-switch-loading-duration` · `--xh-switch-loading-fg` · `--xh-switch-thumb` · `--xh-switch-track-h-lg` · `--xh-switch-track-h-md` · `--xh-switch-track-h-sm`

## 动效

关键帧 `xh-switch-rotate` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 组合

- 与[表单字段](./field)配合；成排时放进[列表](./list)。

## 最佳实践

- 标签写这项设置本身（"邮件通知"），不写动作（"开启邮件通知"）——开关的状态已经说明了开还是关。
- 异步提交时用 `loading` 并保持受控，别先翻再回滚。

## 反模式

- 开关翻过去还要按"保存"：那说明它应该是复选框。
- 用开关表达两个并列选项（列表 / 网格）。
