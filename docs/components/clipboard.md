# Clipboard 剪贴板

用于复制纯文本并反馈复制状态。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/clipboard" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/clipboard.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/clipboard" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/clipboard" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/clipboard.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

复制安装命令

<XhDemo src="clipboard/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="clipboard"`：**`root`** · `label` · `control` · `input` · **`copy-trigger`** · `indicator` · `status`

## 示例

### 独立按钮

内容已在页面中展示时，只保留复制按钮

<XhDemo src="clipboard/02-trigger-only" />

### 变体

设置复制按钮的外观

<XhDemo src="clipboard/03-variant" />

### 尺寸

使用小、中、大三档尺寸

<XhDemo src="clipboard/04-size" />

## 设计指引

### 何时使用

- 复制命令、链接、密钥或标识符。
- 需要在复制前让用户核对内容。

### 何时不用

- 复制富文本或图片。
- 内容需要先编辑时，使用[文本字段](./text-field)。

### 特性

- 只读输入框在聚焦时自动选中文本。
- 复制状态依次为 `idle`、`copying` 与 `copied`。
- `timeout` 控制成功状态的停留时间。
- 输入框、标签与状态提示均可按场景省略。
- 复制按钮缺省是中性淡底 `subtle`，只有 `solid` 才是品牌实心；按下有统一的缩放与换底反馈。

### 组合

- 与[代码视图](./code-view)组合复制代码。
- 使用 `indicator` 切换复制前后的图标或文字。

### 最佳实践

- 保留可见文本，让用户可以核对并手动复制。
- 复制按钮使用明确的可访问名称。
- 默认使用中性工具面；只有复制是页面主操作时才使用 `solid`。
- 成功反馈只替换图标与文字，不改变控件尺寸或轮廓。

### 反模式

- 不要将复制成功作为同步结果处理。
- 不要复制用户无法核对的隐藏内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-clipboard>` |
| Vue 组件 | `XhClipboardControl` `XhClipboardCopyTrigger` `XhClipboardIndicator` `XhClipboardInput` `XhClipboardLabel` `XhClipboardRoot` `XhClipboardStatus` |
| 组合式函数 | `useClipboard` |
| 状态机 | `clipboardMachine` |
| 皮肤 | `@xihan-ui/styles/clipboard.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 要复制的文本；未提供时复制空串。 |
| `timeout` | `number` |  | 复制成功后指示器保持多久（毫秒），默认 3000；&lt;=0 或非有限数表示不自动回落。 |
| `disabled` | `boolean` |  | 禁用：复制按钮不可点击，作者调用 api.copy() 也无效（守卫在状态机层）。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost，默认 subtle（缺省中性淡底，solid 才品牌实心）。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<ClipboardTranslations>` |  |  |
| `onStatusChange` | `(details: ClipboardStatusChangeDetails) => void` |  | 状态每次落定时通知一次；挂载时的 idle 是初始态，不通知。 |
| `onCopyError` | `(details: ClipboardCopyErrorDetails) => void` |  | 写入失败时通知；此时状态已回到 idle。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ClipboardStatusChangeDetails` | 状态变化；detail 为 `{ status: 'copying' \| 'copied' \| 'idle' }` |
| `copy-error` | `ClipboardCopyErrorDetails` | 写入失败；detail 为 `{ error, value }`，此时状态已回到 idle |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhClipboardRoot` | `default` | `ClipboardRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhClipboardIndicator` | `copied` | `boolean` |  | 该标记属于哪一侧：true = 复制成功后的对勾，false（默认）= 平时的复制图标。 |
| `XhClipboardRoot` | `children` | `SlotChildren<ClipboardRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'copying' \| 'copied' |
| `label` | 'idle' \| 'copying' \| 'copied' |
| `control` | 'idle' \| 'copying' \| 'copied' |
| `input` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | 'idle' \| 'copying' \| 'copied' |
| `indicator` | 'idle' \| 'copying' \| 'copied' |
| `status` | 'idle' \| 'copying' \| 'copied' |

以下名称仅用于内部状态机。

**状态**：`idle` · `copying` · `copied`

**事件**：`COPY.TRIGGER` · `COPY.SUCCESS` · `COPY.ERROR` · `after.timeout` · `PRESS.START` · `PRESS.END`

**判据**：`isDisabled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ClipboardStatus` |  |
| `disabled` | `boolean` |  |
| `announcement` | `string` | 播报区未提供内容时朗读的语句；未达到已复制档时为空串。 |
| `copied` | `boolean` | 已复制成功且仍在停留窗口内。指示器与样式的唯一判据。 |
| `value` | `string` | 当前要复制的文本（prop 未提供时为空串）。 |
| `copy` | `() => void` | 发起一次复制意图，与点击按钮走同一路径。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getCopyTriggerProps` | `() => T['button']` |  |
| `getIndicatorProps` | `(props: ClipboardIndicatorProps) => T['element']` |  |
| `getStatusProps` | `() => T['element']` | 复制成功的播报区，视觉隐藏；未提供内容时朗读 announcement。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held in copy-trigger, not disabled, not copying | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `copy-trigger` | `aria-busy` | 'true' \| undefined |
| `copy-trigger` | `aria-disabled` | 'true' \| undefined |
| `copy-trigger` | `aria-label` | translations?.copy |
| `indicator` | `aria-hidden` | indicator.copied !== copied \|\| undefined |
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
| `root` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `control` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `input` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | `data-copied` | ''（条件成立时才出现） |
| `copy-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `copy-trigger` | `data-loading` | ''（条件成立时才出现） |
| `copy-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `copy-trigger` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | `data-xh-action-control` | '' |
| `copy-trigger` | `data-xh-action-display` | 'always' |
| `copy-trigger` | `data-xh-action-profile` | 'text' |
| `copy-trigger` | `data-xh-action-size` | props.size |
| `copy-trigger` | `data-xh-action-variant` | props.variant |
| `indicator` | `data-copied` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `status` | `data-state` | 'idle' \| 'copying' \| 'copied' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-clipboard-control-active-layer` | `control`<br>`copy-trigger`<br>`input` | `z-index` | `focus-visible`<br>`hover` | `1` | clipboard 的 control、copy-trigger、input 部件 z-index 覆盖槽。 |
| `--xh-clipboard-control-gap` | `control` | `gap` | `default` | `0` | clipboard 的 control 部件 gap 覆盖槽。 |
| `--xh-clipboard-control-min-w` | `root` | `min-inline-size` | `has([data-scope='clipboard'][data-part='control'])` | `--xh-control-min-w` | clipboard 的 root 部件 min-inline-size 覆盖槽。 |
| `--xh-clipboard-control-w` | `root` | `inline-size`<br>`min-inline-size` | `has([data-scope='clipboard'][data-part='control'])` | `--xh-control-w` | clipboard 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-clipboard-copy-trigger-attached-radius` | `control`<br>`copy-trigger` | `border-end-end-radius`<br>`border-start-end-radius` | `not(:first-child)` | `--xh-clipboard-input-radius` | clipboard 的 control、copy-trigger 部件 border-end-end-radius、border-start-end-radius 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg` | `copy-trigger` | `background-color` | `default`<br>`focus-visible`<br>`loading` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` | clipboard 的 copy-trigger 部件 background-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-active` | `copy-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | clipboard 的 copy-trigger 部件 background-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-disabled` | `copy-trigger` | `background-color` | `disabled` | `--xh-_action-variant-bg-disabled` | clipboard 的 copy-trigger 部件 background-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-hover` | `copy-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | clipboard 的 copy-trigger 部件 background-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border` | `control`<br>`copy-trigger` | `border`<br>`border-color` | `default`<br>`focus-visible`<br>`not(:first-child)` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest`<br>`--xh-border-control` | clipboard 的 control、copy-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border-disabled` | `copy-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` | clipboard 的 copy-trigger 部件 border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border-hover` | `control`<br>`copy-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:first-child)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-border-control-hover` | clipboard 的 control、copy-trigger 部件 border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-fg` | `copy-trigger` | `color` | `copied`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`xh-action-variant=solid` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | clipboard 的 copy-trigger 部件 color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-fg-copied` | `copy-trigger` | `color` | `copied`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-success` | clipboard 的 copy-trigger 部件 color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-font-size` | `copy-trigger` | `font-size` | `default` | `--xh-_clipboard-font-size` | clipboard 的 copy-trigger 部件 font-size 覆盖槽。 |
| `--xh-clipboard-copy-trigger-font-weight` | `copy-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | clipboard 的 copy-trigger 部件 font-weight 覆盖槽。 |
| `--xh-clipboard-copy-trigger-gap` | `copy-trigger`<br>`indicator` | `gap` | `default` | `--xh-control-gap-sm` | clipboard 的 copy-trigger、indicator 部件 gap 覆盖槽。 |
| `--xh-clipboard-copy-trigger-h` | `copy-trigger` | `block-size` | `default` | `--xh-_clipboard-h` | clipboard 的 copy-trigger 部件 block-size 覆盖槽。 |
| `--xh-clipboard-copy-trigger-px` | `copy-trigger` | `padding-inline` | `default` | `--xh-_clipboard-px` | clipboard 的 copy-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-clipboard-copy-trigger-radius` | `copy-trigger` | `border-radius` | `default` | `--xh-shape-control` | clipboard 的 copy-trigger 部件 border-radius 覆盖槽。 |
| `--xh-clipboard-copy-trigger-shadow-hover` | `copy-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | clipboard 的 copy-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-clipboard-gap` | `root` | `gap` | `default` | `--xh-space-1` | clipboard 的 root 部件 gap 覆盖槽。 |
| `--xh-clipboard-indicator-fg-copied` | `indicator` | `color` | `copied` | `--xh-fg-success` | clipboard 的 indicator 部件 color 覆盖槽。 |
| `--xh-clipboard-indicator-gap` | `indicator` | `gap` | `default` | `--xh-clipboard-copy-trigger-gap` | clipboard 的 indicator 部件 gap 覆盖槽。 |
| `--xh-clipboard-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-subtle` | clipboard 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-clipboard-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | clipboard 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-clipboard-input-bg` | `input` | `background` | `default` | `--xh-bg-subtle` | clipboard 的 input 部件 background 覆盖槽。 |
| `--xh-clipboard-input-border` | `input` | `border` | `default` | `--xh-border-control` | clipboard 的 input 部件 border 覆盖槽。 |
| `--xh-clipboard-input-border-focus` | `input` | `border-color` | `focus-visible` | `--xh-border-control-focus` | clipboard 的 input 部件 border-color 覆盖槽。 |
| `--xh-clipboard-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | clipboard 的 input 部件 color 覆盖槽。 |
| `--xh-clipboard-input-font-size` | `input` | `font-size` | `default` | `--xh-text-body-size` | clipboard 的 input 部件 font-size 覆盖槽。 |
| `--xh-clipboard-input-h` | `input` | `block-size` | `default` | `--xh-_clipboard-h` | clipboard 的 input 部件 block-size 覆盖槽。 |
| `--xh-clipboard-input-px` | `input` | `padding-inline` | `default` | `--xh-_clipboard-px` | clipboard 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-clipboard-input-radius` | `control`<br>`copy-trigger`<br>`input` | `border-end-end-radius`<br>`border-radius`<br>`border-start-end-radius` | `default`<br>`not(:first-child)` | `--xh-shape-control` | clipboard 的 control、copy-trigger、input 部件 border-end-end-radius、border-radius、border-start-end-radius 覆盖槽。 |
| `--xh-clipboard-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | clipboard 的 label 部件 color 覆盖槽。 |
| `--xh-clipboard-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | clipboard 的 label 部件 font-size 覆盖槽。 |
| `--xh-clipboard-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | clipboard 的 label 部件 font-weight 覆盖槽。 |
| `--xh-clipboard-loading-duration` | `copy-trigger` | `animation` | `default` | `--xh-spin-duration` | clipboard 的 copy-trigger 部件 animation 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-clipboard-loading-hide` · `xh-clipboard-loading-reveal` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-spin` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
