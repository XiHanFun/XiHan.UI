来源：https://ui.docs.xihanfun.com/components/toggle

# 切换按钮 `toggle`

一颗有记忆的按钮：按下去留在按下态，再按一下弹回来。状态由 `aria-pressed` 表达。

## 何时使用

- 开关一项立即生效的格式或视图（加粗、显示网格、静音）。
- 状态属于工具而不属于表单：它不参与表单提交。

## 何时不用

- 表示一项设置的开与关、且要随表单提交：用[开关](./switch)或[复选框](./checkbox)。
- 几个选项互斥：用[切换按钮组](./toggle-group)——多个独立的切换按钮各管各的按下态，凑不出互斥。
- 按下去只发生一次动作、不留状态：那是[按钮](./button)。

## 特性

- 形态 · 语气 · 尺寸三轴与按钮同源。
- 受控时宿主不写回 `pressed` 值就不动，在途期间来的意图直接丢掉。
- `disabled` 同时挡住指针与键盘，按下态保持原样。

## 示例

### 基础用法

按下态由 pressed 表达，非受控时组件自己维护

```vue
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
import { ref } from "vue";

const bold = ref(false);
</script>

<template>
  <XhToggle>加粗</XhToggle>
  <XhToggle v-model:pressed="bold">受控：{{ bold ? "已按下" : "未按下" }}</XhToggle>
</template>
```

```html
<xh-toggle>
  <button data-xh-part="root">加粗</button>
</xh-toggle>

<xh-toggle id="toggle-basic-controlled" pressed="false">
  <button data-xh-part="root">受控：未按下</button>
</xh-toggle>

<script type="module">
  // 受控那颗由宿主写回按下态，按钮文字跟着换
  const toggle = document.getElementById("toggle-basic-controlled");
  const root = toggle.querySelector('[data-xh-part="root"]');
  toggle.addEventListener("pressed-change", (event) => {
    toggle.pressed = event.detail.pressed;
    root.textContent = `受控：${event.detail.pressed ? "已按下" : "未按下"}`;
  });
</script>
```

### 禁用

disabled 同时挡住指针与键盘，按下态保持原样

```vue
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <XhToggle disabled>未按下</XhToggle>
  <XhToggle disabled default-pressed>已按下</XhToggle>
</template>
```

```html
<xh-toggle disabled>
  <button data-xh-part="root">未按下</button>
</xh-toggle>

<xh-toggle disabled default-pressed>
  <button data-xh-part="root">已按下</button>
</xh-toggle>
```

### 排成一组

多个独立的 toggle 各管各的按下态；要互斥或单一 Tab 位请改用切换按钮组

```vue
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
import { ref } from "vue";

const marks = ref({ bold: false, italic: false, underline: true });
</script>

<template>
  <XhToggle v-model:pressed="marks.bold">B</XhToggle>
  <XhToggle v-model:pressed="marks.italic">I</XhToggle>
  <XhToggle v-model:pressed="marks.underline">U</XhToggle>
  <span>{{ Object.entries(marks).filter(([, on]) => on).map(([k]) => k).join(" ") || "无" }}</span>
</template>
```

```html
<xh-toggle id="toggle-group-bold">
  <button data-xh-part="root">B</button>
</xh-toggle>

<xh-toggle id="toggle-group-italic">
  <button data-xh-part="root">I</button>
</xh-toggle>

<xh-toggle id="toggle-group-underline" default-pressed>
  <button data-xh-part="root">U</button>
</xh-toggle>

<span id="toggle-group-readout">underline</span>

<script type="module">
  // 三颗各自的按下态汇总成一行文字
  const marks = { bold: false, italic: false, underline: true };
  const readout = document.getElementById("toggle-group-readout");
  for (const key of Object.keys(marks)) {
    const toggle = document.getElementById(`toggle-group-${key}`);
    toggle.addEventListener("pressed-change", (event) => {
      marks[key] = event.detail.pressed;
      const on = Object.keys(marks).filter((name) => marks[name]);
      readout.textContent = on.join(" ") || "无";
    });
  }
</script>
```

### 形态

variant 决定颜色怎么用，未按下与已按下两档一起看才完整

```vue
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 8px">
    <div style="display: flex; align-items: center; gap: 8px">
      <span style="min-width: 64px">未按下</span>
      <XhToggle v-for="v in variants" :key="v" :variant="v">{{ v }}</XhToggle>
    </div>
    <div style="display: flex; align-items: center; gap: 8px">
      <span style="min-width: 64px">已按下</span>
      <XhToggle v-for="v in variants" :key="v" :variant="v" default-pressed>{{ v }}</XhToggle>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 8px">
  <div style="display: flex; align-items: center; gap: 8px">
    <span style="min-width: 64px">未按下</span>
    <xh-toggle variant="solid">
      <button data-xh-part="root">solid</button>
    </xh-toggle>
    <xh-toggle variant="subtle">
      <button data-xh-part="root">subtle</button>
    </xh-toggle>
    <xh-toggle variant="outline">
      <button data-xh-part="root">outline</button>
    </xh-toggle>
    <xh-toggle variant="ghost">
      <button data-xh-part="root">ghost</button>
    </xh-toggle>
  </div>
  <div style="display: flex; align-items: center; gap: 8px">
    <span style="min-width: 64px">已按下</span>
    <xh-toggle variant="solid" default-pressed>
      <button data-xh-part="root">solid</button>
    </xh-toggle>
    <xh-toggle variant="subtle" default-pressed>
      <button data-xh-part="root">subtle</button>
    </xh-toggle>
    <xh-toggle variant="outline" default-pressed>
      <button data-xh-part="root">outline</button>
    </xh-toggle>
    <xh-toggle variant="ghost" default-pressed>
      <button data-xh-part="root">ghost</button>
    </xh-toggle>
  </div>
</div>
```

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 solid 形态并置于按下态，语气差别最明显

```vue
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <XhToggle v-for="t in tones" :key="t" variant="solid" :tone="t" default-pressed>{{ t }}</XhToggle>
</template>
```

```html
<xh-toggle variant="solid" tone="brand" default-pressed>
  <button data-xh-part="root">brand</button>
</xh-toggle>

<xh-toggle variant="solid" tone="neutral" default-pressed>
  <button data-xh-part="root">neutral</button>
</xh-toggle>

<xh-toggle variant="solid" tone="success" default-pressed>
  <button data-xh-part="root">success</button>
</xh-toggle>

<xh-toggle variant="solid" tone="warning" default-pressed>
  <button data-xh-part="root">warning</button>
</xh-toggle>

<xh-toggle variant="solid" tone="danger" default-pressed>
  <button data-xh-part="root">danger</button>
</xh-toggle>

<xh-toggle variant="solid" tone="info" default-pressed>
  <button data-xh-part="root">info</button>
</xh-toggle>
```

### 尺寸

size 只改高度、内边距与字号，不写就是缺省档

```vue
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <XhToggle variant="outline" size="sm">小</XhToggle>
    <XhToggle variant="outline">缺省</XhToggle>
    <XhToggle variant="outline" size="lg">大</XhToggle>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 8px">
  <xh-toggle variant="outline" size="sm">
    <button data-xh-part="root">小</button>
  </xh-toggle>
  <xh-toggle variant="outline">
    <button data-xh-part="root">缺省</button>
  </xh-toggle>
  <xh-toggle variant="outline" size="lg">
    <button data-xh-part="root">大</button>
  </xh-toggle>
</div>
```

### 图标

按钮内容随便写，图标与文字之间的空隙由 --xh-toggle-gap 给；只放图标时按钮没有可见文字，名字得由 aria-label 补上

```vue
<script setup lang="ts">
import { XhIcon, XhToggle } from "@xihan-ui/vue";
import { ref } from "vue";

const StarIcon = {
  name: "star",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 4L14.4 8.9L19.8 9.7L15.9 13.5L16.8 18.9L12 16.4L7.2 18.9L8.1 13.5L4.2 9.7L9.6 8.9Z" } },
  ],
} as const;

const EyeIcon = {
  name: "eye",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M2 12C4.7 7.7 8 5.5 12 5.5C16 5.5 19.3 7.7 22 12C19.3 16.3 16 18.5 12 18.5C8 18.5 4.7 16.3 2 12Z" } },
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } },
  ],
} as const;

const starred = ref(false);
</script>

<template>
  <!-- 图标配文字：文字自己说清楚这颗按钮是干什么的，图标不必再给名字 -->
  <XhToggle v-model:pressed="starred" variant="outline">
    <XhIcon :icon="StarIcon" />{{ starred ? "已收藏" : "收藏" }}
  </XhToggle>

  <!-- 只放图标：内边距收窄成方形，名字由 aria-label 给 -->
  <XhToggle
    variant="outline"
    aria-label="显示预览"
    style="--xh-toggle-px: var(--xh-space-2);"
  >
    <XhIcon :icon="EyeIcon" />
  </XhToggle>
</template>
```

```html
<xh-toggle id="toggle-icon-star" variant="outline">
  <button data-xh-part="root">
    <xh-icon id="toggle-icon-star-glyph">
      <svg data-xh-part="root">
        <g data-xh-part="glyph"></g>
      </svg>
    </xh-icon>
    <span id="toggle-icon-star-text">收藏</span>
  </button>
</xh-toggle>

<xh-toggle variant="outline">
  <button
    data-xh-part="root"
    aria-label="显示预览"
    style="--xh-toggle-px: var(--xh-space-2)"
  >
    <xh-icon id="toggle-icon-eye">
      <svg data-xh-part="root">
        <g data-xh-part="glyph"></g>
      </svg>
    </xh-icon>
  </button>
</xh-toggle>

<script type="module">
  // 图标记录是对象，只能走 property 交给元素
  const star = {
    name: "star",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      {
        tag: "path",
        attrs: {
          d: "M12 4L14.4 8.9L19.8 9.7L15.9 13.5L16.8 18.9L12 16.4L7.2 18.9L8.1 13.5L4.2 9.7L9.6 8.9Z",
        },
      },
    ],
  };

  const eye = {
    name: "eye",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      {
        tag: "path",
        attrs: {
          d: "M2 12C4.7 7.7 8 5.5 12 5.5C16 5.5 19.3 7.7 22 12C19.3 16.3 16 18.5 12 18.5C8 18.5 4.7 16.3 2 12Z",
        },
      },
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } },
    ],
  };

  document.getElementById("toggle-icon-star-glyph").icon = star;
  document.getElementById("toggle-icon-eye").icon = eye;

  // 图标配文字：文字自己说清楚这颗按钮是干什么的
  const toggle = document.getElementById("toggle-icon-star");
  const text = document.getElementById("toggle-icon-star-text");
  toggle.addEventListener("pressed-change", (event) => {
    text.textContent = event.detail.pressed ? "已收藏" : "收藏";
  });
</script>
```

### 变化回调

pressed-change 每次带着 details 报一次按下意图；不做受控绑定时它就是拿到新值的唯一出口

```vue
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";
import { ref } from "vue";

const trail = ref<string[]>([]);

function onPressedChange(details: { pressed: boolean }) {
  // 只留最近三次
  trail.value = [details.pressed ? "开" : "关", ...trail.value].slice(0, 3);
}
</script>

<template>
  <XhToggle variant="outline" @pressed-change="onPressedChange">静音</XhToggle>
  <span style="font-size: 13px;">
    最近三次：{{ trail.join(" · ") || "（还没动过）" }}
  </span>
</template>
```

```html
<xh-toggle id="toggle-events" variant="outline">
  <button data-xh-part="root">静音</button>
</xh-toggle>

<span id="toggle-events-trail" style="font-size: 13px">
  最近三次：（还没动过）
</span>

<script type="module">
  // 只留最近三次
  const toggle = document.getElementById("toggle-events");
  const readout = document.getElementById("toggle-events-trail");
  let trail = [];
  toggle.addEventListener("pressed-change", (event) => {
    trail = [event.detail.pressed ? "开" : "关", ...trail].slice(0, 3);
    readout.textContent = `最近三次：${trail.join(" · ")}`;
  });
</script>
```

### 请求在途

受控的 pressed 不写回就不会动，在途期间来的意图直接丢掉；忙碌反馈由 aria-busy 与一枚转圈补在按钮上

```vue
<script setup lang="ts">
import { XhSpinner, XhToggle } from "@xihan-ui/vue";
import { ref } from "vue";

const subscribed = ref(false);
const pending = ref(false);

function onPressedChange(details: { pressed: boolean }): void {
  // 在途期间不写回 pressed，按钮就停在原来的按下态上
  if (pending.value)
    return;
  pending.value = true;
  setTimeout(() => {
    subscribed.value = details.pressed;
    pending.value = false;
  }, 1200);
}
</script>

<template>
  <!-- aria-disabled 而非 disabled：焦点留得住，读屏也报得出「这颗按不动」 -->
  <XhToggle
    :pressed="subscribed"
    variant="outline"
    :aria-busy="pending"
    :aria-disabled="pending"
    style="min-inline-size: 108px"
    @pressed-change="onPressedChange"
  >
    <!-- 转圈自带活区与名字，「在等什么」由它的 label 念出来 -->
    <XhSpinner v-if="pending" size="sm" label="正在提交" />
    {{ subscribed ? "已订阅" : "订阅" }}
  </XhToggle>

  <span style="font-size: 13px">
    {{ pending ? "请求在飞，这时候再点没有反应" : "点一下，落定要等 1.2 秒" }}
  </span>
</template>
```

```html
<xh-toggle id="toggle-pending" pressed="false" variant="outline">
  <!-- aria-disabled 而非 disabled：焦点留得住，读屏也报得出「这颗按不动」 -->
  <button
    data-xh-part="root"
    aria-busy="false"
    aria-disabled="false"
    style="min-inline-size: 108px"
  >
    <!-- 转圈自带活区与名字，「在等什么」由它的 label 念出来 -->
    <xh-spinner id="toggle-pending-spinner" size="sm" label="正在提交" style="display: none">
      <span data-xh-part="root"></span>
    </xh-spinner>
    <span id="toggle-pending-text">订阅</span>
  </button>
</xh-toggle>

<span id="toggle-pending-hint" style="font-size: 13px">
  点一下，落定要等 1.2 秒
</span>

<script type="module">
  const toggle = document.getElementById("toggle-pending");
  const root = toggle.querySelector('[data-xh-part="root"]');
  const spinner = document.getElementById("toggle-pending-spinner");
  const text = document.getElementById("toggle-pending-text");
  const hint = document.getElementById("toggle-pending-hint");
  let pending = false;

  // 在途标记落成 aria-busy 与 aria-disabled，转圈跟着显隐
  function setPending(next) {
    pending = next;
    root.setAttribute("aria-busy", String(next));
    root.setAttribute("aria-disabled", String(next));
    spinner.style.display = next ? "" : "none";
    hint.textContent = next
      ? "请求在飞，这时候再点没有反应"
      : "点一下，落定要等 1.2 秒";
  }

  // 在途期间不写回 pressed，按钮就停在原来的按下态上
  toggle.addEventListener("pressed-change", (event) => {
    if (pending) {
      return;
    }
    setPending(true);
    setTimeout(() => {
      toggle.pressed = event.detail.pressed;
      text.textContent = event.detail.pressed ? "已订阅" : "订阅";
      setPending(false);
    }, 1200);
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle>` |
| Vue 组件 | `XhToggle` |
| 组合式函数 | `useToggle` |
| 状态机 | `toggleMachine` |
| 皮肤 | `@xihan-ui/styles/toggle.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toggle"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pressed` | `boolean` |  |  |
| `defaultPressed` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定颜色怎么用 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `size` | `Size` |  | 尺寸：sm / md / lg |
| `iconOnly` | `boolean` |  | 只有图标：左右内距清零、宽高相等。宽度跟着当前尺寸档的高度走， 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行给可及名。 |
| `fullWidth` | `boolean` |  | 撑满行宽：工具条里一列开关常用。 |
| `onPressedChange` | `(details: TogglePressedChangeDetails) => void` |  | pressed 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `pressed-change` | `TogglePressedChangeDetails` | pressed 状态变化；detail 为 `{ pressed: boolean }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'on' \| 'off' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`off` · `on`

**事件**：`TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF`

**判据**：`isPressedControlled`

## connect API

`useToggle` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `pressed` | `boolean` |  |
| `setPressed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 pressed 状态 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-pressed` | 'true' \| 'false' |

## 样式

默认皮肤 `@xihan-ui/styles/toggle.css` 按部件选择：`[data-scope="toggle"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-icon-only` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'on' \| 'off' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toggle-bg` · `--xh-toggle-bg-hover` · `--xh-toggle-bg-on` · `--xh-toggle-fg` · `--xh-toggle-fg-on` · `--xh-toggle-font-size` · `--xh-toggle-font-weight` · `--xh-toggle-gap` · `--xh-toggle-h` · `--xh-toggle-icon-size` · `--xh-toggle-px` · `--xh-toggle-radius` · `--xh-toggle-shadow`

## 动效

`background` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 排成一条工具条：外面套[工具栏](./toolbar)拿到方向键导航。
- 只放图标时配[文字提示](./tooltip)。

## 最佳实践

- 只放图标时给 `aria-label`，名字不能靠图形猜。
- 按下与未按下的差别要能在灰度下看出来，别只靠颜色。

## 反模式

- 用它表达"当前在哪个标签页"：那是[标签页](./tabs)的事。
- 请求在途时让按钮先翻状态再回滚：受控绑定不写回，用户看到的就是稳定的。
