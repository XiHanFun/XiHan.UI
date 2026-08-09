# 消息编辑器 <Badge type="info" text="composer" />

AI 对话组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

root / input / submit-trigger 三件缺一不可；Enter 提交、Shift+Enter 换行，清空发生在 submit 派发之后

<XhDemo src="composer/01-basic" />

### 流式与停止

run-status 翻成 streaming 后，发送按钮原位变停止：同一个节点、同一个位置，只换 data-mode 与可访问名

<XhDemo src="composer/02-streaming" />

### Enter 只换行

submit-on-enter 关掉后 Enter 交回浏览器插入换行，发送只剩按钮一条路

<XhDemo src="composer/03-enter" />

### 禁用与空值

disabled 罩住整框并走原生 disabled；输入为空或只有空白时发送按钮转灰，但位置留着不收起

<XhDemo src="composer/04-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-composer>` |
| Vue 组件 | `XhComposerInput` `XhComposerRoot` `XhComposerSubmitTrigger` |
| 组合式函数 | `useComposer` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/composer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="composer"`：**`root`** · **`input`** · **`submit-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，给了就由宿主写回。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `disabled` | `boolean` |  |  |
| `runStatus` | `ComposerRunStatus` |  | 宿主传入的运行态。 |
| `submitOnEnter` | `boolean` |  | Enter 直接提交、Shift+Enter 换行，默认 true。 |
| `translations` | `Partial<ComposerTranslations>` |  |  |
| `onValueChange` | `(details: ComposerValueChangeDetails) => void` |  |  |
| `onSubmit` | `(details: ComposerSubmitDetails) => void` |  |  |
| `onStop` | `() => void` |  |  |

## 状态机

**事件**：`VALUE.SET` · `KEY.ENTER` · `COMPOSITION.START` · `COMPOSITION.END` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `CONTROLLED.VALUE.FILLED`

**判据**：`canSubmit` · `isStreaming` · `isValueEmpty` · `isNextValueEmpty`

## connect API

`useComposer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `isComposing` | `boolean` | 是否正在用输入法组合文字。 |
| `canSubmit` | `boolean` | 当前提交是否会真正发出，在机器守卫之外还额外要求非 disabled。 |
| `streaming` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setValue` | `(value: string) => void` |  |
| `submit` | `() => void` |  |
| `stop` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['textarea']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | 焦点在输入框、未处于 IME 组合态、submitOnEnter 为真且可提交 | 提交当前输入并清空 |
| `Shift+Enter` | 焦点在输入框 | 不归组件管：原样放行，浏览器插入换行 |
| `Enter` | 处于 IME 组合态（isComposing 为真） | 不提交：交给输入法确认候选词 |
| `Space` / `Enter` | 焦点在发送/停止按钮上 | 按 data-mode 触发提交或停止 |
