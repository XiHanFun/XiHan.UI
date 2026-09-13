来源：https://ui.docs.xihanfun.com/components/clipboard

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

```vue
<script setup lang="ts">
import { CheckIcon, ClipboardIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhIcon,
} from "@xihan-ui/vue";

const command = "pnpm add @xihan-ui/vue @xihan-ui/styles";
</script>

<template>
  <XhClipboardRoot :value="command">
    <XhClipboardLabel>安装命令</XhClipboardLabel>
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardCopyTrigger>
        <XhClipboardIndicator><XhIcon :icon="ClipboardIcon" /> 复制</XhClipboardIndicator>
        <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>
</template>
```

```html
<xh-clipboard value="pnpm add @xihan-ui/web-components @xihan-ui/styles">
  <div data-xh-part="root">
    <label data-xh-part="label">安装命令</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="copy-trigger">
        <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h1.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H8"/></svg> 复制</span>
        <span data-xh-part="indicator" copied><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg> 已复制</span>
      </button>
    </div>
  </div>
</xh-clipboard>
```

## 组件结构

加粗的是必需部件。

`data-scope="clipboard"`：**`root`** · `label` · `control` · `input` · **`copy-trigger`** · `indicator` · `status`

## 示例

### 独立按钮

内容已在页面中展示时，只保留复制按钮

```vue
<script setup lang="ts">
import { CheckIcon, ClipboardIcon } from "@xihan-ui/icons";
import { XhClipboardCopyTrigger, XhClipboardIndicator, XhClipboardRoot, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhClipboardRoot value="https://xihan.dev">
    <XhClipboardCopyTrigger>
      <XhClipboardIndicator><XhIcon :icon="ClipboardIcon" /> 复制链接</XhClipboardIndicator>
      <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
    </XhClipboardCopyTrigger>
  </XhClipboardRoot>
</template>
```

```html
<xh-clipboard value="https://xihan.dev">
  <div data-xh-part="root">
    <button data-xh-part="copy-trigger">
      <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h1.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H8"/></svg> 复制链接</span>
      <span data-xh-part="indicator" copied><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg> 已复制</span>
    </button>
  </div>
</xh-clipboard>
```

### 变体

设置复制按钮的外观

```vue
<script setup lang="ts">
import { XhClipboardCopyTrigger, XhClipboardIndicator, XhClipboardRoot } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const labels = { solid: "实心", subtle: "浅色", outline: "线框", ghost: "幽灵" };
</script>

<template>
  <XhClipboardRoot v-for="variant in variants" :key="variant" value="XiHan.UI" :variant="variant">
    <XhClipboardCopyTrigger>
      <XhClipboardIndicator>{{ labels[variant] }}</XhClipboardIndicator>
      <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
    </XhClipboardCopyTrigger>
  </XhClipboardRoot>
</template>
```

```html
<xh-clipboard value="XiHan.UI" variant="solid"><div data-xh-part="root"><button data-xh-part="copy-trigger"><span data-xh-part="indicator">实心</span><span data-xh-part="indicator" copied>已复制</span></button></div></xh-clipboard>
<xh-clipboard value="XiHan.UI" variant="subtle"><div data-xh-part="root"><button data-xh-part="copy-trigger"><span data-xh-part="indicator">浅色</span><span data-xh-part="indicator" copied>已复制</span></button></div></xh-clipboard>
<xh-clipboard value="XiHan.UI" variant="outline"><div data-xh-part="root"><button data-xh-part="copy-trigger"><span data-xh-part="indicator">线框</span><span data-xh-part="indicator" copied>已复制</span></button></div></xh-clipboard>
<xh-clipboard value="XiHan.UI" variant="ghost"><div data-xh-part="root"><button data-xh-part="copy-trigger"><span data-xh-part="indicator">幽灵</span><span data-xh-part="indicator" copied>已复制</span></button></div></xh-clipboard>
```

### 尺寸

使用小、中、大三档尺寸

```vue
<script setup lang="ts">
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
    <XhClipboardRoot v-for="size in sizes" :key="size" value="pnpm add @xihan-ui/vue" :size="size">
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>复制</XhClipboardIndicator>
          <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardControl>
    </XhClipboardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
  <xh-clipboard value="pnpm add @xihan-ui/web-components" size="sm"><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"/><button data-xh-part="copy-trigger"><span data-xh-part="indicator">复制</span><span data-xh-part="indicator" copied>已复制</span></button></div></div></xh-clipboard>
  <xh-clipboard value="pnpm add @xihan-ui/web-components" size="md"><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"/><button data-xh-part="copy-trigger"><span data-xh-part="indicator">复制</span><span data-xh-part="indicator" copied>已复制</span></button></div></div></xh-clipboard>
  <xh-clipboard value="pnpm add @xihan-ui/web-components" size="lg"><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"/><button data-xh-part="copy-trigger"><span data-xh-part="indicator">复制</span><span data-xh-part="indicator" copied>已复制</span></button></div></div></xh-clipboard>
</div>
```

## 设计指引

### 何时使用

- 复制命令、链接、密钥或标识符。
- 需要在复制前让用户核对内容。

### 何时不用

- 复制富文本或图片。
- 内容需要先编辑时，使用[文本输入](./text-field)。

### 特性

- 只读输入框在聚焦时自动选中文本。
- 复制状态依次为 `idle`、`copying` 与 `copied`。
- `timeout` 控制成功状态的停留时间。
- 输入框、标签与状态提示均可按场景省略。

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
| `value` | `string` |  | 要复制的文本；缺省即复制空串。 |
| `timeout` | `number` |  | 复制成功后指示器保持多久（毫秒），默认 3000；&lt;=0 或非有限数表示不自动回落。 |
| `disabled` | `boolean` |  | 禁用：复制按钮点不动，作者调 api.copy() 也不动（守卫在机器层）。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
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
| `root` | 'idle' \| 'copying' \| 'copied' |
| `label` | 'idle' \| 'copying' \| 'copied' |
| `control` | 'idle' \| 'copying' \| 'copied' |
| `input` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | 'idle' \| 'copying' \| 'copied' |
| `indicator` | 'idle' \| 'copying' \| 'copied' |
| `status` | 'idle' \| 'copying' \| 'copied' |

以下名称仅用于内部状态机。

**状态**：`idle` · `copying` · `copied`

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
| `copy-trigger` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | `data-xh-action-control` | '' |
| `copy-trigger` | `data-xh-action-display` | 'always' |
| `copy-trigger` | `data-xh-action-profile` | 'text' |
| `copy-trigger` | `data-xh-action-size` | props.size |
| `indicator` | `data-copied` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `status` | `data-state` | 'idle' \| 'copying' \| 'copied' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-clipboard-control-active-layer` | `control`<br>`copy-trigger`<br>`input` | `z-index` | `focus-visible`<br>`hover` | `1` | clipboard 的 control、copy-trigger、input 部件 z-index 覆盖槽。 |
| `--xh-clipboard-control-gap` | `control` | `gap` | `default` | `0` | clipboard 的 control 部件 gap 覆盖槽。 |
| `--xh-clipboard-copy-trigger-attached-radius` | `control`<br>`copy-trigger` | `border-end-end-radius`<br>`border-start-end-radius` | `not(:first-child)` | `--xh-clipboard-input-radius` | clipboard 的 control、copy-trigger 部件 border-end-end-radius、border-start-end-radius 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg` | `copy-trigger` | `background` | `default` | `--xh-_clipboard-copy-trigger-bg` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-active` | `copy-trigger` | `background` | `active`<br>`loading`<br>`not([data-loading])` | `--xh-_clipboard-copy-trigger-bg-active` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-disabled` | `copy-trigger` | `background` | `disabled` | `--xh-bg-muted` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-bg-hover` | `copy-trigger` | `background` | `hover`<br>`loading`<br>`not([data-loading])` | `--xh-_clipboard-copy-trigger-bg-hover` | clipboard 的 copy-trigger 部件 background 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border` | `copy-trigger` | `border` | `default` | `--xh-_clipboard-copy-trigger-border` | clipboard 的 copy-trigger 部件 border 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border-disabled` | `copy-trigger` | `border-color` | `disabled` | `--xh-_clipboard-copy-trigger-border` | clipboard 的 copy-trigger 部件 border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-border-hover` | `copy-trigger` | `border-color` | `hover`<br>`loading`<br>`not([data-loading])` | `--xh-_clipboard-copy-trigger-border-hover` | clipboard 的 copy-trigger 部件 border-color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-fg` | `copy-trigger`<br>`root` | `--xh-_ring-color`<br>`color` | `copied`<br>`default`<br>`focus-visible`<br>`variant=solid` | `--xh-_clipboard-copy-trigger-fg` | clipboard 的 copy-trigger、root 部件 --xh-_ring-color、color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-fg-copied` | `copy-trigger` | `color` | `copied` | `--xh-fg-success` | clipboard 的 copy-trigger 部件 color 覆盖槽。 |
| `--xh-clipboard-copy-trigger-font-size` | `copy-trigger` | `font-size` | `default` | `--xh-_clipboard-font-size` | clipboard 的 copy-trigger 部件 font-size 覆盖槽。 |
| `--xh-clipboard-copy-trigger-font-weight` | `copy-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | clipboard 的 copy-trigger 部件 font-weight 覆盖槽。 |
| `--xh-clipboard-copy-trigger-gap` | `copy-trigger`<br>`indicator` | `gap` | `default` | `--xh-control-gap-sm` | clipboard 的 copy-trigger、indicator 部件 gap 覆盖槽。 |
| `--xh-clipboard-copy-trigger-h` | `copy-trigger` | `block-size` | `default` | `--xh-_clipboard-h` | clipboard 的 copy-trigger 部件 block-size 覆盖槽。 |
| `--xh-clipboard-copy-trigger-px` | `copy-trigger` | `padding-inline` | `default` | `--xh-_clipboard-px` | clipboard 的 copy-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-clipboard-copy-trigger-radius` | `copy-trigger` | `border-radius` | `default` | `--xh-shape-pill` | clipboard 的 copy-trigger 部件 border-radius 覆盖槽。 |
| `--xh-clipboard-copy-trigger-shadow-hover` | `copy-trigger` | `box-shadow` | `hover`<br>`loading`<br>`not([data-loading])` | `--xh-_clipboard-copy-trigger-shadow-hover` | clipboard 的 copy-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-clipboard-gap` | `root` | `gap` | `default` | `--xh-space-1` | clipboard 的 root 部件 gap 覆盖槽。 |
| `--xh-clipboard-indicator-fg-copied` | `indicator` | `color` | `copied` | `--xh-fg-success` | clipboard 的 indicator 部件 color 覆盖槽。 |
| `--xh-clipboard-indicator-gap` | `indicator` | `gap` | `default` | `--xh-clipboard-copy-trigger-gap` | clipboard 的 indicator 部件 gap 覆盖槽。 |
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
| `--xh-clipboard-input-radius` | `control`<br>`copy-trigger`<br>`input` | `border-end-end-radius`<br>`border-radius`<br>`border-start-end-radius` | `default`<br>`not(:first-child)` | `--xh-shape-control` | clipboard 的 control、copy-trigger、input 部件 border-end-end-radius、border-radius、border-start-end-radius 覆盖槽。 |
| `--xh-clipboard-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | clipboard 的 label 部件 color 覆盖槽。 |
| `--xh-clipboard-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | clipboard 的 label 部件 font-size 覆盖槽。 |
| `--xh-clipboard-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | clipboard 的 label 部件 font-weight 覆盖槽。 |
| `--xh-clipboard-loading-duration` | `copy-trigger` | `animation` | `default` | `--xh-spin-duration` | clipboard 的 copy-trigger 部件 animation 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-clipboard-loading-hide` · `xh-clipboard-loading-reveal` · `xh-clipboard-rotate` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `box-shadow` · `opacity` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
