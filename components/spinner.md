来源：https://ui.docs.xihanfun.com/components/spinner

# Spinner 加载指示器

一个不确定时长的等待标记。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/spinner" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/spinner.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/spinner" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/spinner" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/spinner.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root 是 role=status 的活区，旋转图形由皮肤绘制在伪元素上；label 给出该处在等待什么

```vue
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";
</script>

<template>
  <XhSpinner label="加载中" />
</template>
```

```html
<xh-spinner label="加载中">
  <span data-xh-part="root"></span>
</xh-spinner>
```

## 组件结构

加粗的是必需部件。

`data-scope="spinner"`：**`root`** · `label`

## 示例

### 尺寸

size 只改变直径，默认档 md 不输出 data-size

```vue
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";
</script>

<template>
  <XhSpinner size="sm" label="加载中" />
  <XhSpinner label="加载中" />
  <XhSpinner size="lg" label="加载中" />
</template>
```

```html
<xh-spinner size="sm" label="加载中">
  <span data-xh-part="root"></span>
</xh-spinner>
<xh-spinner label="加载中">
  <span data-xh-part="root"></span>
</xh-spinner>
<xh-spinner size="lg" label="加载中">
  <span data-xh-part="root"></span>
</xh-spinner>
```

### 可见文案

label 部件未写内容时显示解析后的 label，屏幕上看到的与读屏朗读的因此是同一段文字

```vue
<script setup lang="ts">
import { XhSpinner, XhSpinnerLabel } from "@xihan-ui/vue";
</script>

<template>
  <!-- 文案只写在 label prop 上，部件自己把它显示出来 -->
  <XhSpinner label="正在加载数据">
    <XhSpinnerLabel />
  </XhSpinner>

  <!-- 换语言包同理：label → translations.label → 内置默认值，取第一段有字的 -->
  <XhSpinner :translations="{ label: '正在提交表单' }">
    <XhSpinnerLabel />
  </XhSpinner>
</template>
```

```html
<div id="spinner-label" style="display: flex; align-items: center; gap: 24px">
  <!-- 文案只写在 label 特性上，可见文字从活区的名字取回来 -->
  <xh-spinner label="正在加载数据">
    <span data-xh-part="root">
      <span data-xh-part="label"></span>
    </span>
  </xh-spinner>

  <!-- 换语言包同理：label → translations.label → 内置默认值，取第一段有字的 -->
  <xh-spinner id="spinner-label-i18n">
    <span data-xh-part="root">
      <span data-xh-part="label"></span>
    </span>
  </xh-spinner>
</div>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("spinner-label-i18n").translations = {
    label: "正在提交表单",
  };

  // 可见文字取元素解析后写在活区上的那个名字，两处于是恒等
  for (const host of document.querySelectorAll("#spinner-label xh-spinner")) {
    await host.updateComplete;
    const root = host.querySelector('[data-xh-part="root"]');
    host.querySelector('[data-xh-part="label"]').textContent =
      root.getAttribute("aria-label");
  }
</script>
```

### 颜色

tone 只更换圆环起始边一段的颜色，轨道保持中性描边，旋转时才能看出差别

```vue
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 语气名写在旁边的普通文字上，转圈自身的可及名字仍是"加载中" -->
  <span
    v-for="t in tones"
    :key="t"
    style="display: inline-flex; align-items: center; gap: 6px"
  >
    <XhSpinner :tone="t" label="加载中" />
    <span style="font-size: 13px">{{ t }}</span>
  </span>
</template>
```

```html
<!-- 语气名写在旁边的普通文字上，转圈自身的可及名字仍是"加载中" -->
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-spinner tone="brand" label="加载中">
    <span data-xh-part="root"></span>
  </xh-spinner>
  <span style="font-size: 13px">brand</span>
</span>
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-spinner tone="neutral" label="加载中">
    <span data-xh-part="root"></span>
  </xh-spinner>
  <span style="font-size: 13px">neutral</span>
</span>
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-spinner tone="success" label="加载中">
    <span data-xh-part="root"></span>
  </xh-spinner>
  <span style="font-size: 13px">success</span>
</span>
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-spinner tone="warning" label="加载中">
    <span data-xh-part="root"></span>
  </xh-spinner>
  <span style="font-size: 13px">warning</span>
</span>
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-spinner tone="danger" label="加载中">
    <span data-xh-part="root"></span>
  </xh-spinner>
  <span style="font-size: 13px">danger</span>
</span>
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-spinner tone="info" label="加载中">
    <span data-xh-part="root"></span>
  </xh-spinner>
  <span style="font-size: 13px">info</span>
</span>
```

### 覆盖等待中的内容

旋转指示浮在内容上方，容器同时报告 aria-busy，可见的与可朗读的是同一件事

```vue
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";
import { ref } from "vue";

const busy = ref(true);

// 遮罩铺满被等待的那块内容，底色兑透明，下面的内容还看得见轮廓
const overlayStyle = [
  "position: absolute",
  "inset: 0",
  "display: grid",
  "place-items: center",
  "border-radius: 8px",
  "background: color-mix(in oklab, var(--xh-bg-surface) 72%, transparent)",
].join("; ");
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <button type="button" @click="busy = !busy">
      {{ busy ? "数据回来了" : "重新加载" }}
    </button>

    <!-- 内容留在原位，转圈叠在上面，加载前后布局不跳 -->
    <div
      :aria-busy="busy"
      style="
        position: relative;
        inline-size: 260px;
        padding: 16px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <p style="margin: 0">本季新增客户 128 家，环比增长 12%。</p>
      <div v-if="busy" :style="overlayStyle">
        <XhSpinner label="正在刷新报表" />
      </div>
    </div>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <button id="spinner-overlay-toggle" type="button">数据回来了</button>

  <!-- 内容留在原位，转圈叠在上面，加载前后布局不跳 -->
  <div
    id="spinner-overlay-panel"
    aria-busy="true"
    style="
      position: relative;
      inline-size: 260px;
      padding: 16px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <p style="margin: 0">本季新增客户 128 家，环比增长 12%。</p>
    <!-- 遮罩铺满被等待的那块内容，底色兑透明，下面的内容还看得见轮廓 -->
    <div
      id="spinner-overlay-mask"
      style="
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: color-mix(in oklab, var(--xh-bg-surface) 72%, transparent);
      "
    >
      <xh-spinner label="正在刷新报表">
        <span data-xh-part="root"></span>
      </xh-spinner>
    </div>
  </div>
</div>

<script type="module">
  // 遮罩的显隐与容器的 aria-busy 由同一个开关驱动
  const toggle = document.getElementById("spinner-overlay-toggle");
  const panel = document.getElementById("spinner-overlay-panel");
  const mask = document.getElementById("spinner-overlay-mask");

  let busy = true;

  toggle.addEventListener("click", () => {
    busy = !busy;
    panel.setAttribute("aria-busy", String(busy));
    mask.style.display = busy ? "grid" : "none";
    toggle.textContent = busy ? "数据回来了" : "重新加载";
  });
</script>
```

### 变体

默认渐隐弧，另有 ring 整圈与 dots 三点

```vue
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";
</script>

<template>
  <XhSpinner label="加载中" />
  <XhSpinner variant="ring" label="加载中" />
  <XhSpinner variant="dots" label="加载中" />
</template>
```

```html
<xh-spinner label="加载中">
  <span data-xh-part="root"></span>
</xh-spinner>
<xh-spinner variant="ring" label="加载中">
  <span data-xh-part="root"></span>
</xh-spinner>
<xh-spinner variant="dots" label="加载中">
  <span data-xh-part="root"></span>
</xh-spinner>
```

## 设计指引

### 何时使用

- 时长未知且没有版面可占位。
- 局部区域正在获取数据，或按钮上的在途标记。

### 何时不用

- 版面可预测时，使用[骨架屏](./skeleton)，它让用户提前看到结构。
- 进度确定时，使用[进度条](./progress)。
- 整页导航时，使用[加载条](./loading-bar)。

### 特性

- 可以配可见文案，也可以只通过 `translations` 提供给读屏。
- 可以与宿主遮罩组合，盖住等待中的内容。
- 默认使用渐隐弧；也可显式选择整圈轨道或三点。

### 组合

- 放入[按钮](./button)的 `indicator` 部件；覆盖[卡片](./card)或[表格](./table)。

### 最佳实践

- 等待超过几秒时配上文字说明正在做什么。
- 遮罩形态下阻止交互，否则用户会重复点击。

### 反模式

- 一个页面内同时显示多个加载指示器。
- 用它代替可预测版面的骨架屏。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-spinner>` |
| Vue 组件 | `XhSpinner` `XhSpinnerLabel` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/spinner.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` |  | 该处的可及名，写在 root 上。 label 部件显示的应当是同一段文案：aria-label 会覆盖节点中的文字，两者不一致时 读屏朗读的与屏幕上看到的不匹配。 |
| `size` | `Size` |  | 直径档位，默认 md；默认档不输出 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色 |
| `translations` | `Partial<SpinnerTranslations>` |  |  |
| `variant` | `SpinnerVariant` |  | 形态，默认 arc。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 解析后的文案：label → translations.label → 内置默认值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | resolveLabel(props) |
| `root` | `aria-live` | 'polite' |
| `root` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/spinner.css` 使用 `[data-scope="spinner"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-spinner-duration` | `root` | `animation` | `default`<br>`variant=dots` | `--xh-motion-loop-spin` | spinner 的 root 部件 animation 覆盖槽。 |
| `--xh-spinner-fg` | `root` | `background`<br>`border-block-start-color`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`motion=reduce`<br>`tone`<br>`variant=arc`<br>`variant=dots`<br>`where([data-motion='reduce'])` | `--xh-_tone`<br>`currentColor` | spinner 的 root 部件 background、border-block-start-color、border-color 覆盖槽。 |
| `--xh-spinner-gap` | `root` | `gap` | `default` | `--xh-control-gap-md` | spinner 的 root 部件 gap 覆盖槽。 |
| `--xh-spinner-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | spinner 的 label 部件 color 覆盖槽。 |
| `--xh-spinner-label-size` | `label` | `font-size` | `default` | `--xh-text-secondary-size` | spinner 的 label 部件 font-size 覆盖槽。 |
| `--xh-spinner-radius` | `root` | `border-radius` | `@media (forced-colors: active)`<br>`default`<br>`variant=arc`<br>`variant=dots` | `--xh-shape-circle` | spinner 的 root 部件 border-radius 覆盖槽。 |
| `--xh-spinner-size` | `root` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-lg` | spinner 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-spinner-thickness` | `root` | `-webkit-mask`<br>`border`<br>`mask` | `@media (forced-colors: active)`<br>`default`<br>`variant=arc`<br>`variant=dots` | `--xh-stroke-thick` | spinner 的 root 部件 -webkit-mask、border、mask 覆盖槽。 |
| `--xh-spinner-track` | `root` | `border` | `default` | `--xh-border-default` | spinner 的 root 部件 border 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：循环（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-spinner-duration`。

关键帧 `xh-spinner-dots` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-spin` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。
