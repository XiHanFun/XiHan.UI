# Clipboard 剪贴板

把一段文本交给系统剪贴板，并把这次写入的结果如实报出来。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/clipboard" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/clipboard.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/clipboard" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/clipboard" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/clipboard.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

展示框是只读不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走

<XhDemo src="clipboard/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="clipboard"`：**`root`** · `label` · `control` · `input` · **`copy-trigger`** · `indicator` · `status`

## 示例

### 只要一颗按钮

必备部件只有 root 与 trigger：文本已经在页面上时，展示框与标题都可以省掉

<XhDemo src="clipboard/02-trigger-only" />

### 状态与失败

写入是异步的也真的会失败：按下先进 copying，写成功才翻成 copied，失败一律退回 idle 并把原因报出来

<XhDemo src="clipboard/03-status" />

### 形态、语气与尺寸

三轴都打在 root 上：变体换复制钮的用色方式，语气换色族，尺寸连输入框一起换档

<XhDemo src="clipboard/04-variant-tone-size" />

## 设计指引

### 何时使用

- 页面上有需要原样带走的字符串：接口密钥、邀请链接、命令行、错误追踪号。

### 何时不用

- 要复制的是富文本或图片：本组件只处理纯文本。
- 内容需要用户先编辑再带走：用[文本输入](./text-field)。

### 特性

- 展示框是只读不是禁用：聚焦即全选，键盘用户照样能自己按 Ctrl / Cmd + C 带走。
- 写入是异步的也真的会失败：按下先进 `copying`，写成功才翻 `copied`，失败一律退回 `idle` 并把原因报出来。
- 必备部件只有 `root` 与 `trigger`：文本已经在页面上时，展示框与标题都可以省掉。
- `timeout` 决定成功指示保持多久，非正数即不自动回落。

### 组合

- 与[代码视图](./code-view)搭配：代码视图负责显示，剪贴板负责带走。
- 成功提示也可以改用[轻提示](./toast)，此时把 `indicator` 省掉。

### 最佳实践

- 复制失败要留可见的兜底路径——展示框就是那条路径，别为了好看把它藏掉。
- 触发器上的文字随状态换（复制 / 已复制），别只换图标颜色。

### 反模式

- 假定复制一定成功：非安全上下文、权限被拒、浏览器策略都会让它失败。
- 用它复制用户看不见的内容：用户无法核对自己带走了什么。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-clipboard>` |
| Vue 组件 | `XhClipboardControl` `XhClipboardCopyTrigger` `XhClipboardIndicator` `XhClipboardInput` `XhClipboardLabel` `XhClipboardRoot` `XhClipboardStatus` |
| 组合式函数 | `useClipboard` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/clipboard.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 要复制的文本；缺省即复制空串。 |
| `timeout` | `number` |  | 复制成功后指示器保持多久（毫秒），默认 3000；&lt;=0 或非有限数表示不自动回落。 |
| `disabled` | `boolean` |  | 禁用：复制按钮点不动，作者调 api.copy() 也不动（守卫在机器层）。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定复制按钮的颜色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<ClipboardTranslations>` |  |  |
| `onStatusChange` | `(details: ClipboardStatusChangeDetails) => void` |  | 状态每次落位时通知一次；挂载那一刻的 idle 是初始态，不通知。 |
| `onCopyError` | `(details: ClipboardCopyErrorDetails) => void` |  | 写入失败时通知；此时状态已经回到 idle。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ClipboardStatusChangeDetails` | 状态变化；detail 为 `{ status: 'copying' \| 'copied' \| 'idle' }` |
| `copy-error` | `ClipboardCopyErrorDetails` | 写入失败；detail 为 `{ error, value }`，此刻状态已经回到 idle |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhClipboardRoot` | `default` | `ClipboardRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `label` | state.get() |
| `control` | state.get() |
| `input` | state.get() |
| `copy-trigger` | state.get() |
| `indicator` | state.get() |
| `status` | state.get() |

以下名称仅用于内部状态机。

**事件**：`COPY.TRIGGER` · `COPY.SUCCESS` · `COPY.ERROR` · `after.timeout`

**判据**：`isDisabled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ClipboardStatus` |  |
| `disabled` | `boolean` |  |
| `announcement` | `string` | 播报区不给内容时念的那一句；没到已复制这一档时是空串。 |
| `copied` | `boolean` | 已经复制成功且还在停留窗口内。指示器与样式的唯一判据。 |
| `value` | `string` | 当前要复制的文本（prop 缺省时是空串）。 |
| `copy` | `() => void` | 走一次复制意图，与点按钮同一条路。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getCopyTriggerProps` | `() => T['button']` |  |
| `getIndicatorProps` | `(props: ClipboardIndicatorProps) => T['element']` |  |
| `getStatusProps` | `() => T['element']` | 复制成功的播报区，视觉隐藏；不给内容时念 announcement。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `copy-trigger` | `aria-label` | translations?.copy |
| `status` | `aria-atomic` | 'true' |
| `status` | `aria-live` | 'polite' |
| `status` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/clipboard.css` 使用 `[data-scope="clipboard"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-copied` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-state` | state.get() |
| `control` | `data-state` | state.get() |
| `input` | `data-state` | state.get() |
| `copy-trigger` | `data-copied` | ''（条件成立时才出现） |
| `copy-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `copy-trigger` | `data-state` | state.get() |
| `indicator` | `data-copied` | ''（条件成立时才出现） |
| `indicator` | `data-state` | state.get() |
| `status` | `data-state` | state.get() |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-clipboard-control-gap` | `control` | `gap` | `default` | `--xh-control-gap-md` | clipboard 的 control 部件 gap 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg` | `copy-trigger` | `background` | `default` | `--xh-_clipboard-copy-trigger-bg` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-active` | `copy-trigger` | `background` | `active` | `--xh-_clipboard-copy-trigger-bg-active` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-disabled` | `copy-trigger` | `background` | `disabled` | `--xh-bg-muted` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-hover` | `copy-trigger` | `background` | `hover` | `--xh-_clipboard-copy-trigger-bg-hover` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border` | `copy-trigger` | `border` | `default` | `--xh-_clipboard-copy-trigger-border` | clipboard 的 copy-trigger 部件 border 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border-copied` | `copy-trigger` | `border-color` | `copied` | `--xh-fg-success` | clipboard 的 copy-trigger 部件 border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border-disabled` | `copy-trigger` | `border-color` | `disabled` | `--xh-border-control` | clipboard 的 copy-trigger 部件 border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border-hover` | `copy-trigger` | `border-color` | `hover` | `--xh-_clipboard-copy-trigger-border-hover` | clipboard 的 copy-trigger 部件 border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-fg` | `copy-trigger`<br>`root` | `--xh-_ring-color`<br>`color` | `copied`<br>`default`<br>`focus-visible`<br>`variant=solid` | `--xh-_clipboard-copy-trigger-fg` | clipboard 的 copy-trigger、root 部件 --xh-_ring-color、color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-fg-copied` | `copy-trigger` | `color` | `copied` | `--xh-fg-success` | clipboard 的 copy-trigger 部件 color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-font-size` | `copy-trigger` | `font-size` | `default` | `--xh-text-body-size` | clipboard 的 copy-trigger 部件 font-size 覆盖槽。 |
| `--xh-clipboard-copy-trigger-gap` | `copy-trigger` | `gap` | `default` | `--xh-control-gap-sm` | clipboard 的 copy-trigger 部件 gap 覆盖槽。 |
| `--xh-clipboard-copy-trigger-h` | `copy-trigger` | `block-size` | `default` | `--xh-_clipboard-h` | clipboard 的 copy-trigger 部件 block-size 覆盖槽。 |
| `--xh-clipboard-copy-trigger-px` | `copy-trigger` | `padding-inline` | `default` | `--xh-_clipboard-px` | clipboard 的 copy-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-clipboard-copy-trigger-radius` | `copy-trigger` | `border-radius` | `default` | `--xh-shape-control` | clipboard 的 copy-trigger 部件 border-radius 覆盖槽。 |
| `--xh-clipboard-copy-trigger-shadow-hover` | `copy-trigger` | `box-shadow` | `hover` | `--xh-elevation-raised` | clipboard 的 copy-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-clipboard-gap` | `root` | `gap` | `default` | `--xh-space-1` | clipboard 的 root 部件 gap 覆盖槽。 |
| `--xh-clipboard-indicator-fg-copied` | `indicator` | `color` | `copied` | `--xh-fg-success` | clipboard 的 indicator 部件 color 覆盖槽。 |
| `--xh-clipboard-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-subtle` | clipboard 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-clipboard-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | clipboard 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-clipboard-input-bg` | `input` | `background` | `default` | `--xh-bg-subtle` | clipboard 的 input 部件 background 覆盖槽。 |
| `--xh-clipboard-input-border` | `input` | `border` | `default` | `--xh-border-control` | clipboard 的 input 部件 border 覆盖槽。 |
| `--xh-clipboard-input-border-focus` | `input` | `border-color` | `focus-visible` | `--xh-_tone` | clipboard 的 input 部件 border-color 覆盖槽。 |
| `--xh-clipboard-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | clipboard 的 input 部件 color 覆盖槽。 |
| `--xh-clipboard-input-font-size` | `input` | `font-size` | `default` | `--xh-text-body-size` | clipboard 的 input 部件 font-size 覆盖槽。 |
| `--xh-clipboard-input-h` | `input` | `block-size` | `default` | `--xh-_clipboard-h` | clipboard 的 input 部件 block-size 覆盖槽。 |
| `--xh-clipboard-input-min-w` | `input` | `inline-size` | `default` | `--xh-control-min-w` | clipboard 的 input 部件 inline-size 覆盖槽。 |
| `--xh-clipboard-input-px` | `input` | `padding-inline` | `default` | `--xh-_clipboard-px` | clipboard 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-clipboard-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-control` | clipboard 的 input 部件 border-radius 覆盖槽。 |
| `--xh-clipboard-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | clipboard 的 label 部件 color 覆盖槽。 |
| `--xh-clipboard-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | clipboard 的 label 部件 font-size 覆盖槽。 |
| `--xh-clipboard-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | clipboard 的 label 部件 font-weight 覆盖槽。 |
| `--xh-clipboard-loading-duration` | `copy-trigger` | `animation` | `state=copying` | `--xh-spin-duration` | clipboard 的 copy-trigger 部件 animation 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-clipboard-rotate` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
