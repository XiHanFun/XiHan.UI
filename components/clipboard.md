来源：https://ui.docs.xihanfun.com/components/clipboard

# 剪贴板 `clipboard`

把一段文本交给系统剪贴板，并把这次写入的结果如实报出来。

## 何时使用

- 页面上有需要原样带走的字符串：接口密钥、邀请链接、命令行、错误追踪号。

## 何时不用

- 要复制的是富文本或图片：本组件只处理纯文本。
- 内容需要用户先编辑再带走：用[文本输入](./text-field)。

## 特性

- 展示框是只读不是禁用：聚焦即全选，键盘用户照样能自己按 Ctrl / Cmd + C 带走。
- 写入是异步的也真的会失败：按下先进 `copying`，写成功才翻 `copied`，失败一律退回 `idle` 并把原因报出来。
- 必备部件只有 `root` 与 `trigger`：文本已经在页面上时，展示框与标题都可以省掉。
- `timeout` 决定成功指示保持多久，非正数即不自动回落。

## 示例

### 基础用法

展示框是只读不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走

```vue
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhIcon,
} from "@xihan-ui/vue";

const apiToken = "xh_live_9f2c7a41b6d84e05";
</script>

<template>
  <XhClipboardRoot :value="apiToken">
    <XhClipboardLabel>接口密钥</XhClipboardLabel>
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardCopyTrigger>
        <!-- 两个指示器都常挂 DOM、靠 hidden 互斥显隐，来回切按钮不抖宽 -->
        <XhClipboardIndicator>复制</XhClipboardIndicator>
        <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>
</template>
```

```html
<xh-clipboard value="xh_live_9f2c7a41b6d84e05">
  <div data-xh-part="root">
    <label data-xh-part="label">接口密钥</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="copy-trigger">
        <!-- 两个指示器都常挂 DOM、靠 hidden 互斥显隐，来回切按钮不抖宽 -->
        <span data-xh-part="indicator">复制</span>
        <span data-xh-part="indicator" copied><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg> 已复制</span>
      </button>
    </div>
  </div>
</xh-clipboard>
```

### 只要一颗按钮

必备部件只有 root 与 trigger：文本已经在页面上时，展示框与标题都可以省掉

```vue
<script setup lang="ts">
import { XhClipboardCopyTrigger, XhClipboardIndicator, XhClipboardRoot } from "@xihan-ui/vue";

const install = "pnpm add @xihan-ui/vue @xihan-ui/styles";
</script>

<template>
  <code style="font-size: 13px;">{{ install }}</code>
  <XhClipboardRoot :value="install" :timeout="1500">
    <XhClipboardCopyTrigger>
      <XhClipboardIndicator>复制安装命令</XhClipboardIndicator>
      <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
    </XhClipboardCopyTrigger>
  </XhClipboardRoot>
</template>
```

```html
<code style="font-size: 13px">pnpm add @xihan-ui/web-components @xihan-ui/styles</code>
<xh-clipboard
  value="pnpm add @xihan-ui/web-components @xihan-ui/styles"
  timeout="1500"
>
  <div data-xh-part="root">
    <button data-xh-part="copy-trigger">
      <span data-xh-part="indicator">复制安装命令</span>
      <span data-xh-part="indicator" copied>已复制</span>
    </button>
  </div>
</xh-clipboard>
```

### 状态与失败

写入是异步的也真的会失败：按下先进 copying，写成功才翻成 copied，失败一律退回 idle 并把原因报出来

```vue
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
  XhIcon,
} from "@xihan-ui/vue";
import { ref } from "vue";

const status = ref("idle");
const lastError = ref("");

function onStatusChange(details: { status: string }) {
  status.value = details.status;
}

function onCopyError(details: { error: unknown; value: string }) {
  lastError.value = String(details.error);
}
</script>

<template>
  <!-- timeout 决定“已复制”停留多久，到点自己回落 -->
  <XhClipboardRoot
    value="订单号 A2026-0809-117"
    :timeout="2000"
    @status-change="onStatusChange"
    @copy-error="onCopyError"
  >
    <XhClipboardControl>
      <XhClipboardInput />
      <XhClipboardCopyTrigger>
        <XhClipboardIndicator>复制</XhClipboardIndicator>
        <XhClipboardIndicator copied><XhIcon :icon="CheckIcon" /> 已复制</XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardControl>
  </XhClipboardRoot>

  <span style="font-size: 13px;">
    状态：{{ status }}
    <template v-if="lastError"> · 上次失败：{{ lastError }}</template>
  </span>
</template>
```

```html
<!-- timeout 决定“已复制”停留多久，到点自己回落 -->
<xh-clipboard id="clipboard-status" value="订单号 A2026-0809-117" timeout="2000">
  <div data-xh-part="root">
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="copy-trigger">
        <span data-xh-part="indicator">复制</span>
        <span data-xh-part="indicator" copied><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg> 已复制</span>
      </button>
    </div>
  </div>
</xh-clipboard>

<span style="font-size: 13px">
  状态：<span id="clipboard-status-text">idle</span
  ><span id="clipboard-status-error"></span>
</span>

<script type="module">
  // 状态与失败原因回显在下面那行文字里
  const clipboard = document.getElementById("clipboard-status");
  const status = document.getElementById("clipboard-status-text");
  const error = document.getElementById("clipboard-status-error");
  clipboard.addEventListener("status-change", (event) => {
    status.textContent = event.detail.status;
  });
  clipboard.addEventListener("copy-error", (event) => {
    error.textContent = ` · 上次失败：${String(event.detail.error)}`;
  });
</script>
```

### 形态、语气与尺寸

三轴都打在 root 上：变体换复制钮的用色方式，语气换色族，尺寸连输入框一起换档

```vue
<script setup lang="ts">
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from "@xihan-ui/vue";

const apiToken = "xh_live_9f2c7a41b6d84e05";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhClipboardRoot :value="apiToken" variant="outline">
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>描边</XhClipboardIndicator>
          <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardControl>
    </XhClipboardRoot>

    <XhClipboardRoot :value="apiToken" variant="ghost" tone="success">
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>幽灵 · 成功</XhClipboardIndicator>
          <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardControl>
    </XhClipboardRoot>

    <XhClipboardRoot :value="apiToken" size="sm">
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>小档</XhClipboardIndicator>
          <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardControl>
    </XhClipboardRoot>

    <XhClipboardRoot :value="apiToken" size="lg">
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>
          <XhClipboardIndicator>大档</XhClipboardIndicator>
          <XhClipboardIndicator copied>已复制</XhClipboardIndicator>
        </XhClipboardCopyTrigger>
      </XhClipboardControl>
    </XhClipboardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-clipboard value="xh_live_9f2c7a41b6d84e05" variant="outline">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="copy-trigger">
          <span data-xh-part="indicator">描边</span>
          <span data-xh-part="indicator" copied>已复制</span>
        </button>
      </div>
    </div>
  </xh-clipboard>

  <xh-clipboard value="xh_live_9f2c7a41b6d84e05" variant="ghost" tone="success">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="copy-trigger">
          <span data-xh-part="indicator">幽灵 · 成功</span>
          <span data-xh-part="indicator" copied>已复制</span>
        </button>
      </div>
    </div>
  </xh-clipboard>

  <xh-clipboard value="xh_live_9f2c7a41b6d84e05" size="sm">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="copy-trigger">
          <span data-xh-part="indicator">小档</span>
          <span data-xh-part="indicator" copied>已复制</span>
        </button>
      </div>
    </div>
  </xh-clipboard>

  <xh-clipboard value="xh_live_9f2c7a41b6d84e05" size="lg">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="copy-trigger">
          <span data-xh-part="indicator">大档</span>
          <span data-xh-part="indicator" copied>已复制</span>
        </button>
      </div>
    </div>
  </xh-clipboard>
</div>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-clipboard>` |
| Vue 组件 | `XhClipboardControl` `XhClipboardCopyTrigger` `XhClipboardIndicator` `XhClipboardInput` `XhClipboardLabel` `XhClipboardRoot` `XhClipboardStatus` |
| 组合式函数 | `useClipboard` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/clipboard.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="clipboard"`：**`root`** · `label` · `control` · `input` · **`copy-trigger`** · `indicator` · `status`

## Props

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

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ClipboardStatusChangeDetails` | 状态变化；detail 为 `{ status: 'copying' \| 'copied' \| 'idle' }` |
| `copy-error` | `ClipboardCopyErrorDetails` | 写入失败；detail 为 `{ error, value }`，此刻状态已经回到 idle |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhClipboardRoot` | `default` | `ClipboardRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `label` | state.get() |
| `control` | state.get() |
| `input` | state.get() |
| `copy-trigger` | state.get() |
| `indicator` | state.get() |
| `status` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`COPY.TRIGGER` · `COPY.SUCCESS` · `COPY.ERROR` · `after.timeout`

**判据**：`isDisabled`

## connect API

`useClipboard` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `copy-trigger` | `aria-label` | translations?.copy |
| `status` | `aria-atomic` | 'true' |
| `status` | `aria-live` | 'polite' |
| `status` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/clipboard.css` 按部件选择：`[data-scope="clipboard"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-clipboard-control-gap` · `--xh-clipboard-copy-trigger-bg` · `--xh-clipboard-copy-trigger-bg-active` · `--xh-clipboard-copy-trigger-bg-disabled` · `--xh-clipboard-copy-trigger-bg-hover` · `--xh-clipboard-copy-trigger-border` · `--xh-clipboard-copy-trigger-border-copied` · `--xh-clipboard-copy-trigger-border-disabled` · `--xh-clipboard-copy-trigger-border-hover` · `--xh-clipboard-copy-trigger-fg` · `--xh-clipboard-copy-trigger-fg-copied` · `--xh-clipboard-copy-trigger-font-size` · `--xh-clipboard-copy-trigger-gap` · `--xh-clipboard-copy-trigger-h` · `--xh-clipboard-copy-trigger-px` · `--xh-clipboard-copy-trigger-radius` · `--xh-clipboard-copy-trigger-shadow-hover` · `--xh-clipboard-gap` · `--xh-clipboard-indicator-fg-copied` · `--xh-clipboard-input-autofill-bg` · `--xh-clipboard-input-autofill-fg` · `--xh-clipboard-input-bg` · `--xh-clipboard-input-border` · `--xh-clipboard-input-border-focus` · `--xh-clipboard-input-fg` · `--xh-clipboard-input-font-size` · `--xh-clipboard-input-h` · `--xh-clipboard-input-min-w` · `--xh-clipboard-input-px` · `--xh-clipboard-input-radius` · `--xh-clipboard-label-fg` · `--xh-clipboard-label-font-size` · `--xh-clipboard-label-font-weight` · `--xh-clipboard-loading-duration`

## 动效

关键帧 `xh-clipboard-rotate` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[代码视图](./code-view)搭配：代码视图负责显示，剪贴板负责带走。
- 成功提示也可以改用[轻提示](./toast)，此时把 `indicator` 省掉。

## 最佳实践

- 复制失败要留可见的兜底路径——展示框就是那条路径，别为了好看把它藏掉。
- 触发器上的文字随状态换（复制 / 已复制），别只换图标颜色。

## 反模式

- 假定复制一定成功：非安全上下文、权限被拒、浏览器策略都会让它失败。
- 用它复制用户看不见的内容：用户无法核对自己带走了什么。
