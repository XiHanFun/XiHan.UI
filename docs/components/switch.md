# 开关 <Badge type="info" text="switch" />

一项设置的开与关，翻过去立即生效。

## 何时使用

- 设置页里立即生效的开关（通知、深色模式、自动保存）。

## 何时不用

- 值要随表单一起提交：用[复选框](./checkbox)，它是表单控件的原生语义。
- 是工具栏上的格式按钮：用[切换按钮](./toggle)。

## 特性

- `loading` 表达在途并锁住用户再次切换：按钮保持可聚焦，以 `aria-busy` 和滑块内指示器报告状态；
  受控宿主仍可写回 `checked` 完成事务，失败时保持原值。它不会把 loading 假装成 disabled。
- `readOnly` 与 `disabled` 分开：只读仍可聚焦。
- 轨道保持实体表单控件：未选中用中性底和明确内边界，选中用实心语气色，只读选中回到中性底；
  不使用 backdrop 或透明玻璃。
- 滑块使用 M1 实体底、细边、顶光和接触影；指针悬停轻抬，按住时沿行进方向拉长并在释放时回圆。
  loading、只读与禁用不产生可操作的悬停/按压假反馈。
- 键盘聚焦环在明暗主题和开关两态都与轨道达到 3:1；RTL 会反转滑块行程，三尺寸与密度轴保持同一比例。
- 减弱动效会取消按压拉伸并让 loading 圆环停转，以静止点线继续表达在途。

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

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

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

`--xh-switch-bg` · `--xh-switch-bg-checked` · `--xh-switch-bg-checked-readonly` · `--xh-switch-border` · `--xh-switch-border-checked` · `--xh-switch-border-checked-readonly` · `--xh-switch-border-invalid` · `--xh-switch-fg` · `--xh-switch-fg-checked` · `--xh-switch-fg-checked-readonly` · `--xh-switch-label-fg` · `--xh-switch-label-fg-disabled` · `--xh-switch-label-font-size` · `--xh-switch-label-gap` · `--xh-switch-loading-duration` · `--xh-switch-loading-fg` · `--xh-switch-radius` · `--xh-switch-thumb` · `--xh-switch-thumb-border` · `--xh-switch-thumb-fg` · `--xh-switch-thumb-highlight` · `--xh-switch-thumb-press-stretch` · `--xh-switch-thumb-radius` · `--xh-switch-thumb-shadow` · `--xh-switch-thumb-shadow-disabled` · `--xh-switch-thumb-shadow-hover` · `--xh-switch-thumb-shadow-pressed` · `--xh-switch-thumb-shadow-readonly` · `--xh-switch-track-h-lg` · `--xh-switch-track-h-md` · `--xh-switch-track-h-sm`

## 动效

关键帧 `xh-switch-rotate` 随皮肤自带，不引用别处文件里的名字；`background` · `box-shadow` · `inline-size` · `scale` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 与[表单字段](./field)配合；成排时放进[列表](./list)。

## 最佳实践

- 标签写这项设置本身（"邮件通知"），不写动作（"开启邮件通知"）——开关的状态已经说明了开还是关。
- 异步提交时用 `loading` 并保持受控，别先翻再回滚。
- 自定义轨道与滑块颜色时同时验证未选中边界、选中底和聚焦环；只换一支底色可能让暗色主题失去边界。

### 当前边界

- `label` 目前只直接拿到 disabled 状态，loading / readonly 光标需由皮肤读取内部 root；后续应由连接层把两轴
  同步到 label，去掉关系选择器并让所有硬底线浏览器得到同一反馈。
- React / Vue 的紧凑 `XhSwitch` 把默认插槽固定为轨道外标签，没有暴露轨道内容或 thumb 插槽；只有 Web Components
  的 Light DOM 能给 thumb 写作者内容。若要三端支持开关内文案或自定义标记，应以独立部件 API 一起补齐。

## 反模式

- 开关翻过去还要按"保存"：那说明它应该是复选框。
- 用开关表达两个并列选项（列表 / 网格）。
