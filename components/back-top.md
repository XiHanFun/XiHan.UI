来源：https://ui.docs.xihanfun.com/components/back-top

# BackTop `回到顶部`

滚过一段距离后露面的按钮，点它滚回顶部。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/back-top" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/back-top.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/back-top" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/back-top" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/back-top.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

滚过 200px 按钮才露面，点它滚回顶部

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <!-- 定位壳缺省钉在视口一角；这里把它改成钉在面板内，示例才不必占用整页 -->
  <div style="position: relative; inline-size: 100%">
    <div
      ref="scrollEl"
      style="
        block-size: 240px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <p v-for="i in 20" :key="i" style="margin: 0 0 12px">第 {{ i }} 段内容，往下滚。</p>
    </div>

    <XhBackTopRoot
      :target="scrollEl"
      style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
    >
      <XhBackTopTrigger />
    </XhBackTopRoot>
  </div>
</template>
```

```html
<!-- 定位壳缺省钉在视口一角；这里把它改成钉在面板内，示例才不必占用整页 -->
<div style="position: relative; inline-size: 100%">
  <div
    id="back-top-basic-scroll"
    style="
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  ></div>

  <template id="back-top-basic-tpl">
    <xh-back-top>
      <div
        data-xh-part="root"
        style="
          position: absolute;
          --xh-back-top-inset-block: 12px;
          --xh-back-top-inset-inline: 12px;
        "
      >
        <!-- 按钮不写内容，皮肤画兜底的箭头字形 -->
        <button data-xh-part="trigger"></button>
      </div>
    </xh-back-top>
  </template>
</div>

<script type="module">
  const box = document.getElementById("back-top-basic-scroll");
  // 撑出可滚动的高度
  for (let i = 1; i <= 20; i++) {
    const line = document.createElement("p");
    line.style.margin = "0 0 12px";
    line.textContent = `第 ${i} 段内容，往下滚。`;
    box.append(line);
  }

  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("back-top-basic-tpl");
  const backTop = template.content.firstElementChild;
  backTop.target = box;
  template.replaceWith(backTop);
</script>
```

## 示例

### 露面阈值

visibility-height 决定滚过多少像素按钮才出现

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const threshold = ref(80);
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      滚过
      <input v-model.number="threshold" type="range" min="0" max="600" step="20">
      {{ threshold }}px 才露面
    </label>

    <div style="position: relative">
      <div
        ref="scrollEl"
        style="
          block-size: 240px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <p v-for="i in 20" :key="i" style="margin: 0 0 12px">第 {{ i }} 段内容。</p>
      </div>

      <XhBackTopRoot
        :target="scrollEl"
        :visibility-height="threshold"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%">
  <label style="display: flex; align-items: center; gap: 8px">
    滚过
    <input
      id="back-top-vh-range"
      type="range"
      min="0"
      max="600"
      step="20"
      value="80"
    />
    <span id="back-top-vh-readout">80</span>px 才露面
  </label>

  <div style="position: relative">
    <div
      id="back-top-vh-scroll"
      style="
        block-size: 240px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    ></div>

    <template id="back-top-vh-tpl">
      <xh-back-top visibility-height="80">
        <div
          data-xh-part="root"
          style="
            position: absolute;
            --xh-back-top-inset-block: 12px;
            --xh-back-top-inset-inline: 12px;
          "
        >
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
    </template>
  </div>
</div>

<script type="module">
  const box = document.getElementById("back-top-vh-scroll");
  // 撑出可滚动的高度
  for (let i = 1; i <= 20; i++) {
    const line = document.createElement("p");
    line.style.margin = "0 0 12px";
    line.textContent = `第 ${i} 段内容。`;
    box.append(line);
  }

  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("back-top-vh-tpl");
  const backTop = template.content.firstElementChild;
  backTop.target = box;
  template.replaceWith(backTop);

  // 阈值改完当场生效，不必重挂元素
  const range = document.getElementById("back-top-vh-range");
  const readout = document.getElementById("back-top-vh-readout");
  range.addEventListener("input", () => {
    backTop.setAttribute("visibility-height", range.value);
    readout.textContent = range.value;
  });
</script>
```

### 滚动方式

behavior=auto 一步跳回顶部，smooth 平滑滚过去

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const smoothEl = ref<HTMLElement | null>(null);
const autoEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; inline-size: 100%">
    <div style="position: relative">
      <div
        ref="smoothEl"
        style="
          block-size: 200px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <p v-for="i in 16" :key="i" style="margin: 0 0 12px">smooth · 第 {{ i }} 段</p>
      </div>
      <XhBackTopRoot
        :target="smoothEl"
        behavior="smooth"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>

    <div style="position: relative">
      <div
        ref="autoEl"
        style="
          block-size: 200px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <p v-for="i in 16" :key="i" style="margin: 0 0 12px">auto · 第 {{ i }} 段</p>
      </div>
      <XhBackTopRoot
        :target="autoEl"
        behavior="auto"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
```

```html
<div
  style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; inline-size: 100%"
>
  <div style="position: relative">
    <div
      id="back-top-behavior-smooth-scroll"
      style="
        block-size: 200px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    ></div>
    <template id="back-top-behavior-smooth-tpl">
      <xh-back-top behavior="smooth" size="sm">
        <div
          data-xh-part="root"
          style="
            position: absolute;
            --xh-back-top-inset-block: 12px;
            --xh-back-top-inset-inline: 12px;
          "
        >
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
    </template>
  </div>

  <div style="position: relative">
    <div
      id="back-top-behavior-auto-scroll"
      style="
        block-size: 200px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    ></div>
    <template id="back-top-behavior-auto-tpl">
      <xh-back-top behavior="auto" size="sm">
        <div
          data-xh-part="root"
          style="
            position: absolute;
            --xh-back-top-inset-block: 12px;
            --xh-back-top-inset-inline: 12px;
          "
        >
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
    </template>
  </div>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  function setUp(label) {
    const box = document.getElementById(`back-top-behavior-${label}-scroll`);
    // 撑出可滚动的高度
    for (let i = 1; i <= 16; i++) {
      const line = document.createElement("p");
      line.style.margin = "0 0 12px";
      line.textContent = `${label} · 第 ${i} 段`;
      box.append(line);
    }

    const template = document.getElementById(`back-top-behavior-${label}-tpl`);
    const backTop = template.content.firstElementChild;
    backTop.target = box;
    template.replaceWith(backTop);
  }

  setUp("smooth");
  setUp("auto");
</script>
```

### 语气与尺寸

tone 决定按钮用哪族颜色，size 换一档尺寸；translations 换掉读屏念出的名字

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
const tone = ref("brand");
const size = ref("md");
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div style="display: flex; gap: 16px">
      <label style="display: flex; align-items: center; gap: 6px">
        语气
        <select v-model="tone">
          <option
            v-for="t in ['brand', 'neutral', 'success', 'warning', 'danger', 'info']"
            :key="t"
            :value="t"
          >
            {{ t }}
          </option>
        </select>
      </label>
      <label style="display: flex; align-items: center; gap: 6px">
        尺寸
        <select v-model="size">
          <option v-for="s in ['sm', 'md', 'lg']" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
    </div>

    <div style="position: relative">
      <div
        ref="scrollEl"
        style="
          block-size: 220px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <p v-for="i in 20" :key="i" style="margin: 0 0 12px">第 {{ i }} 段内容。</p>
      </div>

      <XhBackTopRoot
        :target="scrollEl"
        :tone="tone"
        :size="size"
        :visibility-height="40"
        :translations="{ trigger: '回到顶部' }"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%">
  <div style="display: flex; gap: 16px">
    <label style="display: flex; align-items: center; gap: 6px">
      语气
      <select id="back-top-tone-select">
        <option value="brand">brand</option>
        <option value="neutral">neutral</option>
        <option value="success">success</option>
        <option value="warning">warning</option>
        <option value="danger">danger</option>
        <option value="info">info</option>
      </select>
    </label>
    <label style="display: flex; align-items: center; gap: 6px">
      尺寸
      <select id="back-top-size-select">
        <option value="sm">sm</option>
        <option value="md" selected>md</option>
        <option value="lg">lg</option>
      </select>
    </label>
  </div>

  <div style="position: relative">
    <div
      id="back-top-tone-scroll"
      style="
        block-size: 220px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    ></div>

    <template id="back-top-tone-tpl">
      <xh-back-top tone="brand" size="md" visibility-height="40">
        <div
          data-xh-part="root"
          style="
            position: absolute;
            --xh-back-top-inset-block: 12px;
            --xh-back-top-inset-inline: 12px;
          "
        >
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
    </template>
  </div>
</div>

<script type="module">
  const box = document.getElementById("back-top-tone-scroll");
  // 撑出可滚动的高度
  for (let i = 1; i <= 20; i++) {
    const line = document.createElement("p");
    line.style.margin = "0 0 12px";
    line.textContent = `第 ${i} 段内容。`;
    box.append(line);
  }

  const template = document.getElementById("back-top-tone-tpl");
  const backTop = template.content.firstElementChild;
  // 文案是对象，只走属性；滚动容器同理，两样都在进 DOM 之前交好
  backTop.translations = { trigger: "回到顶部" };
  backTop.target = box;
  template.replaceWith(backTop);

  const tone = document.getElementById("back-top-tone-select");
  const size = document.getElementById("back-top-size-select");
  tone.addEventListener("change", () => backTop.setAttribute("tone", tone.value));
  size.addEventListener("change", () => backTop.setAttribute("size", size.value));
</script>
```

### 形态

variant 换按钮的底色、描边与前景怎么用；这里把露面门槛设成 0，不滚也看得见

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const solidEl = ref<HTMLElement | null>(null);
const outlineEl = ref<HTMLElement | null>(null);
const ghostEl = ref<HTMLElement | null>(null);

const boxStyle = {
  blockSize: "160px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};
const rootStyle
  = "position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div style="position: relative; inline-size: 200px">
      <div ref="solidEl" :style="boxStyle">
        <p v-for="i in 12" :key="i" style="margin: 0 0 12px">实心 {{ i }}</p>
      </div>
      <XhBackTopRoot :target="solidEl" variant="solid" :visibility-height="0" :style="rootStyle">
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>

    <div style="position: relative; inline-size: 200px">
      <div ref="outlineEl" :style="boxStyle">
        <p v-for="i in 12" :key="i" style="margin: 0 0 12px">描边 {{ i }}</p>
      </div>
      <XhBackTopRoot :target="outlineEl" variant="outline" :visibility-height="0" :style="rootStyle">
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>

    <div style="position: relative; inline-size: 200px">
      <div ref="ghostEl" :style="boxStyle">
        <p v-for="i in 12" :key="i" style="margin: 0 0 12px">幽灵 {{ i }}</p>
      </div>
      <XhBackTopRoot :target="ghostEl" variant="ghost" :visibility-height="0" :style="rootStyle">
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <div style="position: relative; inline-size: 200px">
    <div
      id="back-top-variant-solid"
      style="
        block-size: 160px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    ></div>
    <template id="back-top-variant-solid-tpl">
      <xh-back-top variant="solid" visibility-height="0">
        <div
          data-xh-part="root"
          style="
            position: absolute;
            --xh-back-top-inset-block: 12px;
            --xh-back-top-inset-inline: 12px;
          "
        >
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
    </template>
  </div>

  <div style="position: relative; inline-size: 200px">
    <div
      id="back-top-variant-outline"
      style="
        block-size: 160px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    ></div>
    <template id="back-top-variant-outline-tpl">
      <xh-back-top variant="outline" visibility-height="0">
        <div
          data-xh-part="root"
          style="
            position: absolute;
            --xh-back-top-inset-block: 12px;
            --xh-back-top-inset-inline: 12px;
          "
        >
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
    </template>
  </div>

  <div style="position: relative; inline-size: 200px">
    <div
      id="back-top-variant-ghost"
      style="
        block-size: 160px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    ></div>
    <template id="back-top-variant-ghost-tpl">
      <xh-back-top variant="ghost" visibility-height="0">
        <div
          data-xh-part="root"
          style="
            position: absolute;
            --xh-back-top-inset-block: 12px;
            --xh-back-top-inset-inline: 12px;
          "
        >
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
    </template>
  </div>
</div>

<script type="module">
  // 三档形态各配一个滚动容器：句柄只走属性，先交句柄再进 DOM，观察器才挂得到这一层
  for (const name of ["solid", "outline", "ghost"]) {
    const box = document.getElementById(`back-top-variant-${name}`);
    for (let i = 1; i <= 12; i++) {
      const line = document.createElement("p");
      line.style.margin = "0 0 12px";
      line.textContent = `${name} ${i}`;
      box.append(line);
    }
    const template = document.getElementById(`back-top-variant-${name}-tpl`);
    const backTop = template.content.firstElementChild;
    backTop.target = box;
    template.replaceWith(backTop);
  }
</script>
```

## 设计指引

### 何时使用

- 页面很长且没有别的快速返回方式。

### 何时不用

- 页面本来就不长：滚过 200px 就出现的按钮只会挡内容。
- 需要的是一组动作而不只是回顶：用[浮动按钮](./float-button)。

### 特性

- `visibilityHeight` 决定滚过多少像素才露面。
- `behavior` 决定一步跳回还是平滑滚过去。
- `translations` 换掉读屏念出的名字。
- 缺省触发器与浮动按钮同属 M3 通透玻璃：背景、边缘、高光、柔影和磨砂来自 `material.glass`；显式 `variant` 仍按各自语义表面绘制。
- 键盘聚焦时触发器改用配方的实体 focus surface，让公共焦点环不依赖背后页面颜色；高对比、减少透明和强制色沿同一令牌通道降级。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-back-top>` |
| Vue 组件 | `XhBackTopRoot` `XhBackTopTrigger` |
| 组合式函数 | `useBackTop` |
| 状态机 | `backTopMachine` |
| 皮肤 | `@xihan-ui/styles/back-top.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="back-top"`：**`root`** · **`trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `visibilityHeight` | `number` |  | 滚过这么多像素按钮才露面，默认 200。 |
| `behavior` | `BackTopBehavior` |  | 滚回顶部的方式，默认 smooth。 |
| `translations` | `Partial<BackTopTranslations>` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定按钮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onVisibilityChange` | `(details: BackTopVisibilityChangeDetails) => void` |  | 露面与否变化时回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `visibility-change` | `BackTopVisibilityChangeDetails` | 露面与否变化；detail 为 `{ visible: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBackTopRoot` | `default` | `BackTopRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `trigger` | 'visible' \| 'hidden' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`hidden` · `visible`

**事件**：`SCROLL.RESOLVE` · `TRIGGER.CLICK`

**判据**：`shouldShow` · `shouldHide`

## connect API

`useBackTop` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 按钮此刻露不露面。 |
| `scrollToTop` | `() => void` | 程序化滚回顶部，与点按钮走同一条路。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 滚回顶部；按 behavior 决定是一步到位还是平滑滚过去 |
| `Tab` / `Shift+Tab` | trigger 露面时 | 走到按钮上；收起时整个 root 带 hidden，按钮不在 Tab 序列里 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-label` | props.translations.trigger |

## 样式

默认皮肤 `@xihan-ui/styles/back-top.css` 按部件选择：`[data-scope="back-top"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-state` | 'visible' \| 'hidden' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-back-top-bg` | `trigger` | `background-color` | `default` | `--xh-_back-top-bg` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-bg-active` | `trigger` | `background-color` | `active` | `--xh-_back-top-bg-active` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-bg-hover` | `trigger` | `background-color` | `@media (hover: hover)`<br>`hover` | `--xh-_back-top-bg-hover` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-border` | `trigger` | `border` | `default` | `--xh-_back-top-border` | back-top 的 trigger 部件 border 覆盖槽。 |
| `--xh-back-top-border-hover` | `trigger` | `border-color` | `@media (hover: hover)`<br>`hover` | `--xh-_back-top-border-hover` | back-top 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-back-top-fg` | `trigger` | `color` | `default` | `--xh-_back-top-fg` | back-top 的 trigger 部件 color 覆盖槽。 |
| `--xh-back-top-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | back-top 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-back-top-inset-block` | `root` | `inset-block-end` | `default` | `--xh-space-8` | back-top 的 root 部件 inset-block-end 覆盖槽。 |
| `--xh-back-top-inset-inline` | `root` | `inset-inline-end` | `default` | `--xh-space-8` | back-top 的 root 部件 inset-inline-end 覆盖槽。 |
| `--xh-back-top-layer` | `root` | `z-index` | `default` | `--xh-layer-sticky` | back-top 的 root 部件 z-index 覆盖槽。 |
| `--xh-back-top-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-pill` | back-top 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-back-top-shadow` | `trigger` | `box-shadow` | `default` | `--xh-_back-top-shadow` | back-top 的 trigger 部件 box-shadow 覆盖槽。 |
| `--xh-back-top-size` | `trigger` | `block-size`<br>`inline-size` | `default` | `--xh-_back-top-size` | back-top 的 trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[滚动区域](./scroll-area)配合时把滚动容器指给它，别让它盯着窗口。

## 最佳实践

- 位置要躲开固定工具条与移动端手势区。
- 平滑滚动对晕动敏感的用户不友好，系统开了减弱动效时应退回一步跳回。

## 反模式

- 恒显：没滚动时它没有意义，只是一块遮挡。
- 在短页面上加它。
