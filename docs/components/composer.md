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

### 框里的附加按钮

root 里除输入与发送外还能放自己的节点；插槽给出的 value 与 setValue 让清空这类操作就在框内完成

<XhDemo src="composer/05-clear" />

### 字数与上限

原生属性直接落到输入框上（maxlength 定上限），字数由插槽里的 value 现算

<XhDemo src="composer/06-count" />

### 随内容长高

输入框的高度跟着内容走，rows 定的是起始行数；不手动拖拽，也不写死高度

<XhDemo src="composer/07-autosize" />

### 过滤输入

写回这一步由宿主说了算：把不要的字符滤掉再落回去，框里留下的始终是滤过的那一份

<XhDemo src="composer/08-filter" />

### 聚焦与选中

输入部件渲染出来就是一个 textarea，拿到它的节点就能聚焦、全选、失焦；发完一条把焦点送回去，接着敲下一条

<XhDemo src="composer/09-focus" />

### 发送失败的错误态

判定谁算出错是宿主的事：属性直接落到真元素上，整框换色靠覆盖公开变量，原因由活区播报

<XhDemo src="composer/10-status" />

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
