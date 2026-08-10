# 剪贴板 <Badge type="info" text="clipboard" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

展示框是只读不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走

<XhDemo src="clipboard/01-basic" />

### 只要一颗按钮

必备部件只有 root 与 trigger：文本已经在页面上时，展示框与标题都可以省掉

<XhDemo src="clipboard/02-trigger-only" />

### 状态与失败

写入是异步的也真的会失败：按下先进 copying，写成功才翻成 copied，失败一律退回 idle 并把原因报出来

<XhDemo src="clipboard/03-status" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-clipboard>` |
| Vue 组件 | `XhClipboardControl` `XhClipboardIndicator` `XhClipboardInput` `XhClipboardLabel` `XhClipboardRoot` `XhClipboardTrigger` |
| 组合式函数 | `useClipboard` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/clipboard.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="clipboard"`：**`root`** · `label` · `control` · `input` · **`trigger`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 要复制的文本；缺省即复制空串。 |
| `timeout` | `number` |  | 复制成功后指示器保持多久（毫秒），默认 3000；&lt;=0 或非有限数表示不自动回落。 |
| `onStatusChange` | `(details: ClipboardStatusChangeDetails) => void` |  | 状态每次落位时通知一次；挂载那一刻的 idle 是初始态，不通知。 |
| `onCopyError` | `(details: ClipboardCopyErrorDetails) => void` |  | 写入失败时通知；此时状态已经回到 idle。 |

## 状态机

**事件**：`COPY.TRIGGER` · `COPY.SUCCESS` · `COPY.ERROR` · `after.timeout`

## connect API

`useClipboard` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ClipboardStatus` |  |
| `copied` | `boolean` | 已经复制成功且还在停留窗口内。指示器与样式的唯一判据。 |
| `value` | `string` | 当前要复制的文本（prop 缺省时是空串）。 |
| `copy` | `() => void` | 走一次复制意图，与点按钮同一条路。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getIndicatorProps` | `(props: ClipboardIndicatorProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
