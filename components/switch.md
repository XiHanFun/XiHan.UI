来源：https://ui.docs.xihanfun.com/components/switch

# 开关 `switch`

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

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <XhSwitch />
  <XhSwitch default-checked />
</template>
```

```html
<xh-switch>
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>

<xh-switch default-checked>
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>
```

### 受控

传了 checked 就由宿主说了算，组件自己不再改状态；变化意图从 checked-change 出来，写回才落位

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const checked = ref(true);
</script>

<template>
  <XhSwitch v-model:checked="checked" />
  <span>当前：{{ checked ? "开" : "关" }}</span>
</template>
```

```html
<xh-switch id="switch-controlled" checked>
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>
<span id="switch-controlled-text">当前：开</span>

<script type="module">
  // 意图写回 checked，开关才动
  const host = document.getElementById("switch-controlled");
  const text = document.getElementById("switch-controlled-text");
  host.addEventListener("checked-change", (event) => {
    host.checked = event.detail.checked;
    text.textContent = `当前：${event.detail.checked ? "开" : "关"}`;
  });
</script>
```

### 禁用

disabled 同时挡住指针与键盘，状态机收不到 TOGGLE

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <XhSwitch disabled />
  <XhSwitch disabled default-checked />
</template>
```

```html
<xh-switch disabled>
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>

<xh-switch disabled default-checked>
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>
```

### 语气

tone 决定选中态轨道用哪族颜色，所以这里都置为开

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
    <span v-for="t in tones" :key="t" style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch :tone="t" default-checked />
      <span>{{ t }}</span>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="brand" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>brand</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="neutral" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>neutral</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="success" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>success</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="warning" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>warning</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="danger" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>danger</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch tone="info" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>info</span>
  </span>
</div>
```

### 尺寸

size 同时缩放轨道与滑块，不写就是缺省档

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch size="sm" default-checked />
      <span>小</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked />
      <span>缺省</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch size="lg" default-checked />
      <span>大</span>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch size="sm" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>小</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>缺省</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch size="lg" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>大</span>
  </span>
</div>
```

### 事件

checked-change 带一份 { checked }，非受控时内部转移也照发一次

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const times = ref(0);
const last = ref("（还没动过）");

function onCheckedChange(details: { checked: boolean }) {
  times.value += 1;
  last.value = details.checked ? "开" : "关";
}
</script>

<template>
  <XhSwitch @checked-change="onCheckedChange" />
  <span>翻转 {{ times }} 次 · 最近落到 {{ last }}</span>
</template>
```

```html
<xh-switch id="switch-event">
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>
<span id="switch-event-text">翻转 0 次 · 最近落到 （还没动过）</span>

<script type="module">
  // 每次翻转累计一次并记下落点
  const host = document.getElementById("switch-event");
  const text = document.getElementById("switch-event-text");
  let times = 0;
  host.addEventListener("checked-change", (event) => {
    times += 1;
    text.textContent = `翻转 ${times} 次 · 最近落到 ${event.detail.checked ? "开" : "关"}`;
  });
</script>
```

### 自定义颜色

开态轨道、关态轨道与滑块各是一个组件令牌，语气档之外的配色写在行内

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
    <!-- 只换开态轨道色 -->
    <XhSwitch default-checked style="--xh-switch-bg-checked: #16a34a" />

    <!-- 开关两态各给一色 -->
    <XhSwitch style="--xh-switch-bg: #2080f0; --xh-switch-bg-checked: #d03050" />

    <!-- 滑块也是一个令牌，可以和轨道拉开对比 -->
    <XhSwitch
      default-checked
      style="--xh-switch-bg-checked: #1f2937; --xh-switch-thumb: #facc15"
    />
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
  <!-- 只换开态轨道色 -->
  <xh-switch default-checked style="--xh-switch-bg-checked: #16a34a">
    <button data-xh-part="root">
      <span data-xh-part="thumb"></span>
    </button>
  </xh-switch>

  <!-- 开关两态各给一色 -->
  <xh-switch style="--xh-switch-bg: #2080f0; --xh-switch-bg-checked: #d03050">
    <button data-xh-part="root">
      <span data-xh-part="thumb"></span>
    </button>
  </xh-switch>

  <!-- 滑块也是一个令牌，可以和轨道拉开对比 -->
  <xh-switch
    default-checked
    style="--xh-switch-bg-checked: #1f2937; --xh-switch-thumb: #facc15"
  >
    <button data-xh-part="root">
      <span data-xh-part="thumb"></span>
    </button>
  </xh-switch>
</div>
```

### 轨道内文案与滑块标记

轨道的子节点全由作者决定，data-state 同时打在轨道与滑块上

```vue
<script setup lang="ts">
import { CheckIcon, XIcon } from "@xihan-ui/icons";
import { useSwitch, XhIcon } from "@xihan-ui/vue";

const { api: trackApi } = useSwitch({ defaultChecked: true });
const { api: markApi } = useSwitch({});
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
    <!-- 文案与滑块同为轨道的直接子节点：开态文案在左、滑块在右，关态反过来 -->
    <button
      v-bind="trackApi.getRootProps()"
      style="
        inline-size: auto;
        min-inline-size: 64px;
        justify-content: space-between;
        gap: 6px;
        padding-inline: 8px;
      "
    >
      <span v-if="trackApi.checked" style="font-size: 12px; color: var(--xh-fg-on-brand)">
        开
      </span>
      <span v-bind="trackApi.getThumbProps()" style="translate: none" />
      <span v-if="!trackApi.checked" style="font-size: 12px">关</span>
    </button>

    <!-- 滑块里也能放东西：属性来自 getThumbProps，内容照写不误 -->
    <button v-bind="markApi.getRootProps()">
      <span
        v-bind="markApi.getThumbProps()"
        style="display: inline-flex; align-items: center; justify-content: center; font-size: 11px"
      >
        <XhIcon :icon="markApi.checked ? CheckIcon : XIcon" />
      </span>
    </button>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
  <!-- 文案与滑块同为轨道的直接子节点：开态文案在左、滑块在右，关态反过来 -->
  <xh-switch id="switch-track" default-checked>
    <button
      data-xh-part="root"
      style="
        inline-size: auto;
        min-inline-size: 64px;
        justify-content: space-between;
        gap: 6px;
        padding-inline: 8px;
      "
    >
      <span id="switch-track-on" style="font-size: 12px; color: var(--xh-fg-on-brand)">
        开
      </span>
      <span data-xh-part="thumb" style="translate: none"></span>
      <span id="switch-track-off" style="display: none; font-size: 12px">关</span>
    </button>
  </xh-switch>

  <!-- 滑块里也能放东西：属性由宿主打上，内容照写不误 -->
  <xh-switch id="switch-mark">
    <button data-xh-part="root">
      <span
        data-xh-part="thumb"
        style="display: inline-flex; align-items: center; justify-content: center; font-size: 11px"
      >
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg>
      </span>
    </button>
  </xh-switch>
</div>

<script type="module">
  // 轨道里的两段文案按开合互斥显示
  const track = document.getElementById("switch-track");
  const on = document.getElementById("switch-track-on");
  const off = document.getElementById("switch-track-off");
  track.addEventListener("checked-change", (event) => {
    on.style.display = event.detail.checked ? "" : "none";
    off.style.display = event.detail.checked ? "none" : "";
  });

  // 滑块里的标记跟着开合换字
  const mark = document.getElementById("switch-mark");
  const thumb = mark.querySelector('[data-xh-part="thumb"]');
  mark.addEventListener("checked-change", (event) => {
    thumb.innerHTML = event.detail.checked
      ? '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg>'
      : '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg>';
  });
</script>
```

### 异步提交

受控开关在回执到达前不落位；loading 让提交期呈现为「处理中」而非禁用——交互挂起、滑块转圈、仍可聚焦

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const enabled = ref(false);
const pending = ref(false);

// 回执到达才写回 checked，中途开关停在旧值上
function onCheckedChange(details: { checked: boolean }) {
  pending.value = true;
  setTimeout(() => {
    enabled.value = details.checked;
    pending.value = false;
  }, 900);
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 10px">
    <XhSwitch :checked="enabled" :loading="pending" @checked-change="onCheckedChange" />
    <span>{{ pending ? "提交中…" : enabled ? "已开启" : "已关闭" }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 10px">
  <xh-switch id="switch-async" checked="false">
    <button data-xh-part="root">
      <span data-xh-part="thumb"></span>
    </button>
  </xh-switch>
  <span id="switch-async-text">已关闭</span>
</div>

<script type="module">
  // 回执到达才写回 checked，中途开关停在旧值上
  const host = document.getElementById("switch-async");
  const text = document.getElementById("switch-async-text");
  host.addEventListener("checked-change", (event) => {
    host.loading = true;
    text.textContent = "提交中…";
    setTimeout(() => {
      host.checked = event.detail.checked;
      host.loading = false;
      text.textContent = event.detail.checked ? "已开启" : "已关闭";
    }, 900);
  });
</script>
```

### 形状

轨道与滑块共用同一个形状令牌，在实例上覆盖一次两者一起变方

```vue
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked style="--xh-shape-pill: 0" />
      <span>直角</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked style="--xh-shape-pill: 5px" />
      <span>圆角</span>
    </span>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <XhSwitch default-checked />
      <span>缺省</span>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch default-checked style="--xh-shape-pill: 0">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>直角</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch default-checked style="--xh-shape-pill: 5px">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>圆角</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-switch default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>缺省</span>
  </span>
</div>
```

### 随表单提交

给了 name 才生出表单影子：开着才提交，值缺省是 on，与原生复选框一致

```vue
<script setup lang="ts">
import { XhButton, XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  const keys = [...data.entries()].map(([k, v]) => `${k}=${v}`);
  submitted.value = keys.length ? keys.join("  ") : "（一个字段都没提交）";
}
</script>

<template>
  <form style="display: grid; gap: 12px" @submit.prevent="onSubmit">
    <label><XhSwitch name="notify" default-checked /> 接收通知（开着，提交 notify=on）</label>
    <label><XhSwitch name="beta" /> 加入内测（没开就整条不进 FormData）</label>
    <!-- value 换掉默认的 on -->
    <label><XhSwitch name="theme" value="dark" default-checked /> 深色主题（提交 theme=dark）</label>

    <div>
      <XhButton type="submit" size="sm">提交</XhButton>
    </div>

    <span v-if="submitted">表单收到：{{ submitted }}</span>
  </form>
</template>
```

```html
<form id="switch-form" style="display: grid; gap: 12px">
  <label>
    <xh-switch name="notify" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
        <input data-xh-part="hidden-input" />
      </button>
    </xh-switch>
    接收通知（开着，提交 notify=on）
  </label>
  <label>
    <xh-switch name="beta">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
        <input data-xh-part="hidden-input" />
      </button>
    </xh-switch>
    加入内测（没开就整条不进 FormData）
  </label>
  <!-- value 换掉默认的 on -->
  <label>
    <xh-switch name="theme" value="dark" default-checked>
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
        <input data-xh-part="hidden-input" />
      </button>
    </xh-switch>
    深色主题（提交 theme=dark）
  </label>

  <div>
    <xh-button type="submit" size="sm">
      <button data-xh-part="root">提交</button>
    </xh-button>
  </div>

  <span id="switch-form-result"></span>
</form>

<script type="module">
  // 提交时把 FormData 里收到的字段列出来
  const form = document.getElementById("switch-form");
  const result = document.getElementById("switch-form-result");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...new FormData(form).entries()].map(([k, v]) => `${k}=${v}`);
    result.textContent = `表单收到：${fields.length ? fields.join("  ") : "（一个字段都没提交）"}`;
  });
</script>
```

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

`--xh-switch-bg` · `--xh-switch-bg-checked` · `--xh-switch-bg-checked-readonly` · `--xh-switch-border-invalid` · `--xh-switch-label-fg` · `--xh-switch-label-fg-disabled` · `--xh-switch-label-font-size` · `--xh-switch-label-gap` · `--xh-switch-loading-duration` · `--xh-switch-loading-fg` · `--xh-switch-radius` · `--xh-switch-thumb` · `--xh-switch-thumb-radius` · `--xh-switch-thumb-shadow` · `--xh-switch-thumb-shadow-readonly` · `--xh-switch-track-h-lg` · `--xh-switch-track-h-md` · `--xh-switch-track-h-sm`

## 动效

关键帧 `xh-switch-rotate` 随皮肤自带，不引用别处文件里的名字；`background` · `box-shadow` · `scale` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## 组合

- 与[表单字段](./field)配合；成排时放进[列表](./list)。

## 最佳实践

- 标签写这项设置本身（"邮件通知"），不写动作（"开启邮件通知"）——开关的状态已经说明了开还是关。
- 异步提交时用 `loading` 并保持受控，别先翻再回滚。

## 反模式

- 开关翻过去还要按"保存"：那说明它应该是复选框。
- 用开关表达两个并列选项（列表 / 网格）。
