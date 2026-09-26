来源：https://ui.docs.xihanfun.com/components/switch

# Switch 开关

一项设置的开与关，切换后立即生效。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/switch" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/switch.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/switch" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/switch" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/switch.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 checked 即为非受控，开关自行维护状态

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

## 组件结构

加粗的是必需部件。

`data-scope="switch"`：**`root`** · `thumb` · `hidden-input` · `label` · `text`

## 示例

### 受控

传入 checked 后由宿主决定，组件自身不再修改状态；变化意图经 checked-change 发出，写回后才落位

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

disabled 同时阻止指针与键盘，状态机收不到 TOGGLE

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

### 颜色

tone 决定选中态轨道使用哪族颜色，因此这里都设为开

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

size 同时缩放轨道与滑块，不写即默认档

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

checked-change 带一份 { checked }，非受控时内部转移也照常触发一次

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

轨道的子节点全部由作者决定，data-state 同时写在轨道与滑块上

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

受控开关在回执到达前不落位；loading 使提交期呈现为处理中而非禁用：交互挂起、滑块显示加载、仍可聚焦

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

提供 name 后才生成表单影子：开启时才提交，值默认为 on，与原生复选框一致

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

## 设计指引

### 何时使用

- 设置页内立即生效的开关（通知、深色模式、自动保存）。

### 何时不用

- 值需要随表单一起提交时，使用[复选框](./checkbox)，它是表单控件的原生语义。
- 工具栏上的格式按钮使用[切换按钮](./toggle)。

### 特性

- `loading` 表达在途并锁住再次切换：按钮保持可聚焦，以 `aria-busy` 和滑块内指示器报告状态；受控宿主仍可写回 `checked` 完成事务，失败时保持原值。loading 不伪装为 disabled。
- `readOnly` 与 `disabled` 分开：只读仍可聚焦。
- 轨道保持实体表单控件：未选中使用中性底和明确内边界，选中使用实心语气色，只读选中回到中性底；不使用 backdrop 或透明材质。
- 滑块是 raised 抬起面：surface-raised 底 + border-default 描边 + raised 影，无顶光；静息即抬起，悬停不再升档，按住时沿行进方向拉长并在释放时回圆。loading、只读与禁用不产生按压反馈。
- 滑块可以拖：横向拖过中点松手即切换，拖出两端越拉越沉，松手后滑块带着松手速度落到那一端；纵向划动留给页面滚动，不拖的点按照常切换。
- 键盘聚焦环在明暗主题和开关两态都与轨道达到 3:1；RTL 会反转滑块行程与拖动方向，三尺寸与密度轴保持同一比例。
- 减弱动效会取消按压拉伸并让 loading 圆环停转，以静止点线继续表达在途。

### 组合

- 与[表单字段](./field)配合；成排时放入[列表](./list)。

### 最佳实践

- 标签写设置本身（“邮件通知”），不写动作（“开启邮件通知”），开关的状态已经说明开或关。
- 异步提交时使用 `loading` 并保持受控，不先切换再回滚。
- 自定义轨道与滑块颜色时同时验证未选中边界、选中底和聚焦环；只换一支底色可能让暗色主题失去边界。

### 当前边界

- `label` 目前只直接获得 disabled 状态，loading / readonly 光标需由皮肤读取内部 root；后续应由连接层把两轴同步到 label，移除关系选择器并让所有基线浏览器得到同一反馈。
- React / Vue 的紧凑 `XhSwitch` 把默认插槽固定为轨道外标签，没有暴露轨道内容或 thumb 插槽；只有 Web Components 的 Light DOM 能为 thumb 写作者内容。三端支持开关内文案或自定义标记应以独立部件 API 一起补齐。

### 反模式

- 开关切换后还需要点击“保存”，说明它应该是复选框。
- 用开关表达两个并列选项（列表 / 网格）。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-switch>` |
| Vue 组件 | `XhSwitch` |
| 组合式函数 | `useSwitch` |
| 状态机 | `switchMachine` |
| 皮肤 | `@xihan-ui/styles/switch.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` |  |  |
| `defaultChecked` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：不可切换，但仍可聚焦、仍参与提交，对比度不降低。 |
| `invalid` | `boolean` |  | 校验失败：只改变呈现，不阻止交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 |
| `loading` | `boolean` |  | 提交中：交互挂起、滑块转圈，但不呈现为禁用（仍可聚焦、对比度不降）。 |
| `name` | `string` |  | 表单字段名；提供后 hidden-input 才带 name 并参与提交。 |
| `value` | `string` |  | 提交的值，默认 'on'，与原生复选框一致。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态轨道使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定轨道与滑块的几何档位。 |
| `onCheckedChange` | `(details: SwitchCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `checked-change` | `SwitchCheckedChangeDetails` | checked 状态变化；detail 为 `{ checked: boolean }` |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSwitch` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'checked' \| 'unchecked' |
| `thumb` | 'checked' \| 'unchecked' |
| `label` | 'checked' \| 'unchecked' |
| `text` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`off` · `on`

**事件**：`TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `FORM.RESET` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `CLICK.SWALLOW` · `PRESS.START` · `PRESS.END`

**判据**：`isCheckedControlled` · `defaultsToChecked` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `checked` | `boolean` |  |
| `loading` | `boolean` | 提交中。 |
| `setChecked` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['button']` |  |
| `getThumbProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：开启后才提交。提供 name 后才带 name，未提供时不参与提交。 |
| `getLabelProps` | `() => T['label']` | 包裹轨道与文字的 &lt;label&gt;：点击文字即切换，轨道的可及名来自文字。只在带文字时渲染。 |
| `getTextProps` | `() => T['element']` | 轨道旁的文字。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/switch/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |
| `Space` / `Enter` | held in root, not disabled, not loading, not readOnly | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中转入禁用、提交中或只读也撤下。与开关态互相独立 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-checked` | 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'switch' |

## 样式参考

### 皮肤

`@xihan-ui/styles/switch.css` 使用 `[data-scope="switch"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'checked' \| 'unchecked' |
| `root` | `data-tone` | props.tone |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'text' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | 'outline' |
| `thumb` | `data-animating` | ''（条件成立时才出现） |
| `thumb` | `data-disabled` | ''（条件成立时才出现） |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-loading` | ''（条件成立时才出现） |
| `thumb` | `data-state` | 'checked' \| 'unchecked' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-size` | props.size |
| `label` | `data-state` | 'checked' \| 'unchecked' |
| `text` | `data-disabled` | ''（条件成立时才出现） |
| `text` | `data-state` | 'checked' \| 'unchecked' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-switch-bg` | `root` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`xh-ink-surface` | `--xh-bg-subtle-active` | switch 的 root 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-switch-bg-checked` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`xh-ink-surface` | `--xh-_switch-accent` | switch 的 root 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-switch-bg-checked-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked` | `--xh-_tone-active` | switch 的 root 部件 background-color 覆盖槽。 |
| `--xh-switch-bg-checked-readonly` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`xh-ink-surface` | `--xh-bg-subtle-active` | switch 的 root 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-switch-bg-disabled` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`xh-ink-surface` | `--xh-bg-subtle` | switch 的 root 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-switch-bg-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_switch-track-bg` | switch 的 root 部件 background-color 覆盖槽。 |
| `--xh-switch-border` | `root` | `box-shadow` | `contrast=more`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=unchecked`<br>`where([data-contrast='more'])` | `--xh-border-control`<br>`--xh-border-strong` | switch 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-switch-border-checked` | `root` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked` | `--xh-_switch-accent` | switch 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-switch-border-checked-readonly` | `root` | `box-shadow` | `contrast=more`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`where([data-contrast='more'])` | `--xh-border-control`<br>`--xh-border-strong` | switch 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-switch-border-disabled` | `root` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-default` | switch 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-switch-border-invalid` | `root` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`invalid`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-invalid` | switch 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-switch-fg` | `root` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | switch 的 root 部件 color 覆盖槽。 |
| `--xh-switch-fg-checked` | `root` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked` | `--xh-_tone-on` | switch 的 root 部件 color 覆盖槽。 |
| `--xh-switch-fg-checked-readonly` | `root` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-fg-default` | switch 的 root 部件 color 覆盖槽。 |
| `--xh-switch-fg-disabled` | `root` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-disabled` | switch 的 root 部件 color 覆盖槽。 |
| `--xh-switch-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | switch 的 label 部件 color 覆盖槽。 |
| `--xh-switch-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | switch 的 label 部件 color 覆盖槽。 |
| `--xh-switch-label-font-size` | `label` | `font-size` | `default` | `--xh-_switch-label-font-size` | switch 的 label 部件 font-size 覆盖槽。 |
| `--xh-switch-label-gap` | `label` | `gap` | `default` | `--xh-control-gap-md` | switch 的 label 部件 gap 覆盖槽。 |
| `--xh-switch-label-leading` | `label` | `line-height` | `default` | `--xh-leading-normal` | switch 的 label 部件 line-height 覆盖槽。 |
| `--xh-switch-loading-duration` | `thumb` | `animation` | `loading` | `--xh-motion-loop-spin` | switch 的 thumb 部件 animation 覆盖槽。 |
| `--xh-switch-loading-fg` | `thumb` | `border-block-start-color`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`loading`<br>`motion=reduce`<br>`where([data-motion='reduce'])` | `--xh-_switch-accent` | switch 的 thumb 部件 border-block-start-color、border-color 覆盖槽。 |
| `--xh-switch-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` | switch 的 root 部件 border-radius 覆盖槽。 |
| `--xh-switch-thumb` | `thumb` | `background` | `default` | `--xh-bg-surface-raised` | switch 的 thumb 部件 background 覆盖槽。 |
| `--xh-switch-thumb-border` | `thumb` | `border` | `default` | `--xh-border-default` | switch 的 thumb 部件 border 覆盖槽。 |
| `--xh-switch-thumb-fg` | `thumb` | `color` | `default` | `--xh-fg-default` | switch 的 thumb 部件 color 覆盖槽。 |
| `--xh-switch-thumb-fg-disabled` | `root`<br>`thumb` | `color` | `disabled` | `--xh-fg-disabled` | switch 的 root、thumb 部件 color 覆盖槽。 |
| `--xh-switch-thumb-press-stretch` | `root`<br>`thumb` | `inline-size`<br>`translate` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-motion-distance-sm` | switch 的 root、thumb 部件 inline-size、translate 覆盖槽。 |
| `--xh-switch-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-circle` | switch 的 thumb 部件 border-radius 覆盖槽。 |
| `--xh-switch-thumb-shadow` | `thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | switch 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-switch-thumb-shadow-disabled` | `root`<br>`thumb` | `box-shadow` | `disabled` | `none` | switch 的 root、thumb 部件 box-shadow 覆盖槽。 |
| `--xh-switch-thumb-shadow-pressed` | `root`<br>`thumb` | `box-shadow` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `none` | switch 的 root、thumb 部件 box-shadow 覆盖槽。 |
| `--xh-switch-thumb-shadow-readonly` | `root`<br>`thumb` | `box-shadow` | `readonly` | `none` | switch 的 root、thumb 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换 · 循环（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-switch-loading-duration` · `--xh-switch-thumb-press-stretch`。

共享关键帧 `xh-spin` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`box-shadow` · `inline-size` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
