来源：https://ui.docs.xihanfun.com/components/loading-bar

# 加载条 `loading-bar`

页面顶部那条细进度线：表示"正在去往别处"或"正在取数据"。

## 何时使用

- 路由切换、整页数据刷新这类用户无需等待具体百分比的过程。

## 何时不用

- 进度是确定的且用户关心具体数值：用[进度条](./progress)。
- 局部区域在加载：用[骨架屏](./skeleton)或[加载指示器](./spinner)。

## 特性

- 不给确定进度时自动爬升（`trickle`）：先快后慢，永远不到 100%，收到完成信号才补满。
- `minimum` 是起跳位置，让用户立刻看到反应。
- 可以挂在局部容器上而不只是页面顶部。

## 示例

### 基础用法

条子贴在视口顶边（往页面最上方看）；不给 value 就是不确定进度，宽度自行往前爬，loading 翻 false 才冲到头并淡出

```vue
<script setup lang="ts">
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);
// 只读进度用 value-change 接；写进 value prop 会把它变成确定进度，爬升就停了
const value = ref(0);
</script>

<template>
  <XhLoadingBarRoot :loading="loading" @value-change="value = $event.value">
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="loading = true">开始加载</XhButton>
  <XhButton variant="outline" @click="loading = false">结束加载</XhButton>
  <span>假进度：{{ Math.round(value) }}%</span>
</template>
```

```html
<xh-loading-bar id="loading-bar-basic">
  <div data-xh-part="root">
    <div data-xh-part="track">
      <div data-xh-part="range"></div>
    </div>
  </div>
</xh-loading-bar>

<div
  id="loading-bar-basic-actions"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px"
>
  <xh-button variant="solid" data-loading="on">
    <button data-xh-part="root">开始加载</button>
  </xh-button>
  <xh-button variant="outline" data-loading="off">
    <button data-xh-part="root">结束加载</button>
  </xh-button>
  <span>假进度：<span id="loading-bar-basic-value">0</span>%</span>
</div>

<script type="module">
  const bar = document.getElementById("loading-bar-basic");
  const actions = document.getElementById("loading-bar-basic-actions");
  const readout = document.getElementById("loading-bar-basic-value");

  for (const button of actions.querySelectorAll("[data-loading]")) {
    button.addEventListener("click", () => {
      bar.loading = button.dataset.loading === "on";
    });
  }

  // 只读进度用 value-change 接；写进 value 会把它变成确定进度，爬升就停了
  bar.addEventListener("value-change", (event) => {
    readout.textContent = String(Math.round(event.detail.value));
  });
</script>
```

### 确定进度

传了 value 就由宿主说了算，宽度照它显示，内部爬升不再插手；loading 仍然负责露面与收起

```vue
<script setup lang="ts">
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);
const value = ref(0);

function start(): void {
  value.value = 0;
  loading.value = true;
}

function advance(): void {
  value.value = Math.min(100, value.value + 25);
}
</script>

<template>
  <XhLoadingBarRoot :loading="loading" :value="value">
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="start">开始</XhButton>
  <XhButton variant="outline" @click="advance">推进 25%</XhButton>
  <XhButton variant="ghost" @click="loading = false">结束</XhButton>
  <span>进度：{{ value }}%</span>
</template>
```

```html
<xh-loading-bar id="loading-bar-determinate" value="0">
  <div data-xh-part="root">
    <div data-xh-part="track">
      <div data-xh-part="range"></div>
    </div>
  </div>
</xh-loading-bar>

<div
  id="loading-bar-determinate-actions"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px"
>
  <xh-button variant="solid" data-act="start">
    <button data-xh-part="root">开始</button>
  </xh-button>
  <xh-button variant="outline" data-act="advance">
    <button data-xh-part="root">推进 25%</button>
  </xh-button>
  <xh-button variant="ghost" data-act="finish">
    <button data-xh-part="root">结束</button>
  </xh-button>
  <span>进度：<span id="loading-bar-determinate-value">0</span>%</span>
</div>

<script type="module">
  const bar = document.getElementById("loading-bar-determinate");
  const actions = document.getElementById("loading-bar-determinate-actions");
  const readout = document.getElementById("loading-bar-determinate-value");

  function set(value) {
    bar.value = value;
    readout.textContent = String(value);
  }

  const acts = {
    start: () => {
      set(0);
      bar.loading = true;
    },
    advance: () => set(Math.min(100, bar.value + 25)),
    finish: () => {
      bar.loading = false;
    },
  };

  for (const button of actions.querySelectorAll("[data-act]")) {
    button.addEventListener("click", () => acts[button.dataset.act]());
  }
</script>
```

### 厚度与颜色

height 数字按像素、字符串按任意 CSS 长度；color 只改进度段的底色

```vue
<script setup lang="ts">
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);
</script>

<template>
  <XhLoadingBarRoot :loading="loading" :height="6" color="#f97316">
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="loading = true">开始加载</XhButton>
  <XhButton variant="outline" @click="loading = false">结束加载</XhButton>
  <span>6px 厚的橙色条子，仍然贴在视口顶边</span>
</template>
```

```html
<xh-loading-bar id="loading-bar-appearance" height="6" color="#f97316">
  <div data-xh-part="root">
    <div data-xh-part="track">
      <div data-xh-part="range"></div>
    </div>
  </div>
</xh-loading-bar>

<div
  id="loading-bar-appearance-actions"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px"
>
  <xh-button variant="solid" data-loading="on">
    <button data-xh-part="root">开始加载</button>
  </xh-button>
  <xh-button variant="outline" data-loading="off">
    <button data-xh-part="root">结束加载</button>
  </xh-button>
  <span>6px 厚的橙色条子，仍然贴在视口顶边</span>
</div>

<script type="module">
  const bar = document.getElementById("loading-bar-appearance");
  const actions = document.getElementById("loading-bar-appearance-actions");
  for (const button of actions.querySelectorAll("[data-loading]")) {
    button.addEventListener("click", () => {
      bar.loading = button.dataset.loading === "on";
    });
  }
</script>
```

### 关掉爬升

trickle 为 false 时条子停在起步值 minimum 不动，往前走全靠宿主收尾

```vue
<script setup lang="ts">
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);
</script>

<template>
  <XhLoadingBarRoot
    :loading="loading"
    :trickle="false"
    :minimum="30"
    :height="6"
  >
    <XhLoadingBarTrack>
      <XhLoadingBarRange />
    </XhLoadingBarTrack>
  </XhLoadingBarRoot>

  <XhButton variant="solid" @click="loading = true">开始加载</XhButton>
  <XhButton variant="outline" @click="loading = false">结束加载</XhButton>
  <span>开始后停在 30%，按「结束加载」才冲到 100 并淡出</span>
</template>
```

```html
<xh-loading-bar id="loading-bar-trickle" trickle="false" minimum="30" height="6">
  <div data-xh-part="root">
    <div data-xh-part="track">
      <div data-xh-part="range"></div>
    </div>
  </div>
</xh-loading-bar>

<div
  id="loading-bar-trickle-actions"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px"
>
  <xh-button variant="solid" data-loading="on">
    <button data-xh-part="root">开始加载</button>
  </xh-button>
  <xh-button variant="outline" data-loading="off">
    <button data-xh-part="root">结束加载</button>
  </xh-button>
  <span>开始后停在 30%，按「结束加载」才冲到 100 并淡出</span>
</div>

<script type="module">
  const bar = document.getElementById("loading-bar-trickle");
  const actions = document.getElementById("loading-bar-trickle-actions");
  for (const button of actions.querySelectorAll("[data-loading]")) {
    button.addEventListener("click", () => {
      bar.loading = button.dataset.loading === "on";
    });
  }
</script>
```

### 语气

tone 只换进度段的底色（取柔和档）；条子本身是 fixed，这里给它写死 absolute 并配一个相对定位的框子，六条才留在示例里而不是叠到页面顶边

```vue
<script setup lang="ts">
import type { CSSProperties } from "vue";
import {
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "brand 品牌" },
  { value: "neutral", label: "neutral 中性" },
  { value: "success", label: "success 成功" },
  { value: "warning", label: "warning 警示" },
  { value: "danger", label: "danger 危险" },
  { value: "info", label: "info 提示" },
];

// 框住条子：条子改走 absolute，inset 就落在这个框上
const frameStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  inlineSize: "100%",
  blockSize: "6px",
  borderRadius: "999px",
  background: "var(--xh-bg-muted)",
};
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <div
      v-for="tone in tones"
      :key="tone.value"
      style="display: flex; flex-direction: column; gap: 6px"
    >
      <span>{{ tone.label }}</span>
      <div :style="frameStyle">
        <XhLoadingBarRoot
          :loading="true"
          :value="60"
          :height="6"
          :tone="tone.value"
          style="position: absolute"
        >
          <XhLoadingBarTrack>
            <XhLoadingBarRange />
          </XhLoadingBarTrack>
        </XhLoadingBarRoot>
      </div>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>brand 品牌</span>
    <!-- 框住条子：条子改走 absolute，inset 就落在这个框上 -->
    <div style="position: relative; overflow: hidden; inline-size: 100%; block-size: 6px; border-radius: 999px; background: var(--xh-bg-muted)">
      <xh-loading-bar loading value="60" height="6" tone="brand">
        <div data-xh-part="root" style="position: absolute">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
        </div>
      </xh-loading-bar>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>neutral 中性</span>
    <!-- 框住条子：条子改走 absolute，inset 就落在这个框上 -->
    <div style="position: relative; overflow: hidden; inline-size: 100%; block-size: 6px; border-radius: 999px; background: var(--xh-bg-muted)">
      <xh-loading-bar loading value="60" height="6" tone="neutral">
        <div data-xh-part="root" style="position: absolute">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
        </div>
      </xh-loading-bar>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>success 成功</span>
    <!-- 框住条子：条子改走 absolute，inset 就落在这个框上 -->
    <div style="position: relative; overflow: hidden; inline-size: 100%; block-size: 6px; border-radius: 999px; background: var(--xh-bg-muted)">
      <xh-loading-bar loading value="60" height="6" tone="success">
        <div data-xh-part="root" style="position: absolute">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
        </div>
      </xh-loading-bar>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>warning 警示</span>
    <!-- 框住条子：条子改走 absolute，inset 就落在这个框上 -->
    <div style="position: relative; overflow: hidden; inline-size: 100%; block-size: 6px; border-radius: 999px; background: var(--xh-bg-muted)">
      <xh-loading-bar loading value="60" height="6" tone="warning">
        <div data-xh-part="root" style="position: absolute">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
        </div>
      </xh-loading-bar>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>danger 危险</span>
    <!-- 框住条子：条子改走 absolute，inset 就落在这个框上 -->
    <div style="position: relative; overflow: hidden; inline-size: 100%; block-size: 6px; border-radius: 999px; background: var(--xh-bg-muted)">
      <xh-loading-bar loading value="60" height="6" tone="danger">
        <div data-xh-part="root" style="position: absolute">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
        </div>
      </xh-loading-bar>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>info 提示</span>
    <!-- 框住条子：条子改走 absolute，inset 就落在这个框上 -->
    <div style="position: relative; overflow: hidden; inline-size: 100%; block-size: 6px; border-radius: 999px; background: var(--xh-bg-muted)">
      <xh-loading-bar loading value="60" height="6" tone="info">
        <div data-xh-part="root" style="position: absolute">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
        </div>
      </xh-loading-bar>
    </div>
  </div>
</div>
```

### 挂在局部

条子默认贴视口顶边，改写成 absolute 再套一个相对定位的框子，它就只贴这块卡片的上沿

```vue
<script setup lang="ts">
import {
  XhButton,
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);

function reload(): void {
  loading.value = true;
  window.setTimeout(() => (loading.value = false), 1600);
}
</script>

<template>
  <div
    style="
      position: relative;
      overflow: hidden;
      inline-size: 100%;
      max-inline-size: 420px;
      border: 1px solid var(--xh-border-subtle);
      border-radius: 8px;
    "
  >
    <XhLoadingBarRoot
      :loading="loading"
      :height="3"
      style="position: absolute"
    >
      <XhLoadingBarTrack>
        <XhLoadingBarRange />
      </XhLoadingBarTrack>
    </XhLoadingBarRoot>

    <div style="display: grid; gap: 10px; padding: 16px">
      <span>这块卡片自己的加载条，不会跑到页面最上方</span>
      <XhButton size="sm" variant="outline" @click="reload">刷新本卡片</XhButton>
    </div>
  </div>
</template>
```

```html
<div
  style="
    position: relative;
    overflow: hidden;
    inline-size: 100%;
    max-inline-size: 420px;
    border: 1px solid var(--xh-border-subtle);
    border-radius: 8px;
  "
>
  <xh-loading-bar id="loading-bar-container" height="3">
    <div data-xh-part="root" style="position: absolute">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
    </div>
  </xh-loading-bar>

  <div style="display: grid; gap: 10px; padding: 16px">
    <span>这块卡片自己的加载条，不会跑到页面最上方</span>
    <xh-button id="loading-bar-container-reload" size="sm" variant="outline">
      <button data-xh-part="root">刷新本卡片</button>
    </xh-button>
  </div>
</div>

<script type="module">
  // 按一下加载 1.6 秒后自行收尾
  const bar = document.getElementById("loading-bar-container");
  document
    .getElementById("loading-bar-container-reload")
    .addEventListener("click", () => {
      bar.loading = true;
      window.setTimeout(() => {
        bar.loading = false;
      }, 1600);
    });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-loading-bar>` |
| Vue 组件 | `XhLoadingBarPeg` `XhLoadingBarRange` `XhLoadingBarRoot` `XhLoadingBarTrack` |
| 组合式函数 | `useLoadingBar` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/loading-bar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="loading-bar"`：**`root`** · `track` · **`range`** · `peg`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 受控进度值（0-100）。给了它就是确定进度：宽度照它显示，内部爬升停止。 |
| `defaultValue` | `number` |  | 非受控初值，缺省 0。 |
| `loading` | `boolean` |  | 加载开关：true 开始，false 结束（冲到 100 再淡出归零）。只由宿主写入，无配套回调。 |
| `height` | `string \| number` |  | 条子厚度：数字按像素，字符串按任意 CSS 长度。缺省 2px。 |
| `color` | `string` |  | 进度段颜色（任意 CSS 颜色）。不给就用皮肤的品牌色。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定进度段用哪族颜色。给了 color 就以 color 为准。 |
| `trickle` | `boolean` |  | 不确定进度时自行往前爬，默认开。关掉即停在起步值等宿主收尾。 |
| `trickleSpeed` | `number` |  | 爬升节拍毫秒，默认 200；&lt;=0 或非有限数等同于关掉爬升。 |
| `minimum` | `number` |  | 起步值，默认 8：开始加载时先跳到这里。 |
| `fadeDuration` | `number` |  | 冲到 100 之后留给淡出的窗口毫秒，默认 200。窗口走完才归零并收起。 |
| `translations` | `Partial<LoadingBarTranslations>` |  |  |
| `onValueChange` | `(details: LoadingBarValueChangeDetails) => void` |  | 进度值变化。不确定进度下每爬一步、冲到 100、归零各通知一次。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `LoadingBarValueChangeDetails` | 进度值变化；detail 为 `{ value: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLoadingBarRoot` | `default` | `LoadingBarRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `track` | state.get() |
| `range` | state.get() |
| `peg` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`LOADING.START` · `LOADING.END` · `TRICKLE.SYNC` · `after.trickleSpeed` · `after.fadeDuration`

## connect API

`useLoadingBar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `LoadingBarPhase` |  |
| `value` | `number` | 当前显示的进度值（0-100，已夹取），也是 range 的宽度百分比。 |
| `visible` | `boolean` | 条子是否露面：idle 之外都露面。 |
| `indeterminate` | `boolean` | 不确定进度：没给 value，宽度自行爬升，不输出 aria-valuenow。 |
| `getRootProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getPegProps` | `() => T['element']` | 进度段末端那道亮边。纯装饰，作者不渲染它时条子照旧成立。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#progressbar)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `root` | `aria-valuemax` | String(LOADING_BAR_MAX) |
| `root` | `aria-valuemin` | '0' |
| `root` | `aria-valuenow` | String(value) \| undefined |
| `root` | `role` | 'progressbar' |
| `peg` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/loading-bar.css` 按部件选择：`[data-scope="loading-bar"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-indeterminate` | ''（条件成立时才出现） |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `track` | `data-state` | state.get() |
| `range` | `data-state` | state.get() |
| `peg` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-loading-bar-fade` · `--xh-loading-bar-layer` · `--xh-loading-bar-peg-fg` · `--xh-loading-bar-peg-w` · `--xh-loading-bar-range` · `--xh-loading-bar-speed` · `--xh-loading-bar-track`

## 动效

`inline-size` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与路由守卫配合：进入时启动，完成或失败时收掉。

## 最佳实践

- 失败也要收掉：留在页面上的半截进度条比什么都没有更糟。
- 极快的请求可以延迟一点再显示，否则只会闪一下。

## 反模式

- 爬升到 100% 却还没加载完：用户以为卡死了。
- 同时挂好几条。
