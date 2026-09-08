来源：https://ui.docs.xihanfun.com/components/button

# 按钮 `button`

触发一次动作的最小控件：按下去就发生一件事。它不承载值，也不表达持续的开关态。

## 何时使用

- 提交表单、执行一次命令、打开浮层。
- 一屏里有多个动作、需要把主次排出来：形态（variant）与语气（tone）是两条正交的轴，四种形态 × 六种语气都成立。
- 只放一枚图元的紧凑动作，用 `iconOnly` 收成正方形。

## 何时不用

- 跳到另一个地址：那是链接。浏览器的中键新开、右键菜单与预读只对 `<a>` 生效，写成按钮加跳转全都拿不到。要的是链接外观加按钮质感时，把 `data-scope` / `data-part` 这组契约铺到 `<a>` 上，皮肤照样认。
- 开关一个持续状态：用[切换按钮](./toggle)，它有 `aria-pressed`。
- 在几个互斥项里选一个：用[切换按钮组](./toggle-group)或[单选组](./radio-group)。

## 特性

- 形态 · 语气 · 尺寸三轴正交，任意组合都成立。
- 载入态用 `aria-disabled` 加事件拦截表达，按钮仍能聚焦，读屏也仍念得到名字。
- `prefix` / `suffix` 两个图元部件自带 `aria-hidden`，读屏念到的只有 `label`。
- 皮肤认的是 `data-scope` 与 `data-part`，不是标签名。

## 示例

### 基础用法

按钮文字直接写在内容里

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton>按钮</XhButton>
</template>
```

```html
<xh-button>
  <button data-xh-part="root">按钮</button>
</xh-button>
```

### 变体

variant 只改皮肤的几个颜色槽位，行为完全一致

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton variant="solid">主要</XhButton>
  <XhButton variant="outline">描边</XhButton>
  <XhButton variant="ghost">幽灵</XhButton>
</template>
```

```html
<xh-button variant="solid">
  <button data-xh-part="root">主要</button>
</xh-button>
<xh-button variant="outline">
  <button data-xh-part="root">描边</button>
</xh-button>
<xh-button variant="ghost">
  <button data-xh-part="root">幽灵</button>
</xh-button>
```

### 尺寸

不传 size 即默认档

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton size="sm">小</XhButton>
  <XhButton>默认</XhButton>
  <XhButton size="lg">大</XhButton>
</template>
```

```html
<xh-button size="sm">
  <button data-xh-part="root">小</button>
</xh-button>
<xh-button>
  <button data-xh-part="root">默认</button>
</xh-button>
<xh-button size="lg">
  <button data-xh-part="root">大</button>
</xh-button>
```

### 禁用与载入

loading 会挡住点击，并给 indicator 部件挂上旋转动画

```vue
<script setup lang="ts">
import { XhButton, XhButtonIndicator, XhButtonLabel } from "@xihan-ui/vue";
</script>

<template>
  <XhButton disabled>禁用</XhButton>
  <XhButton loading>
    <XhButtonIndicator />
    <XhButtonLabel>提交中</XhButtonLabel>
  </XhButton>
</template>
```

```html
<xh-button disabled>
  <button data-xh-part="root">禁用</button>
</xh-button>
<xh-button loading>
  <button data-xh-part="root">
    <span data-xh-part="indicator"></span>
    <span data-xh-part="label">提交中</span>
  </button>
</xh-button>
```

### 语气

tone 决定用哪族颜色，与 variant 正交：四种形态 × 六种语气都成立

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div v-for="variant in ['solid', 'subtle', 'outline', 'ghost']" :key="variant" style="display: flex; gap: 8px; align-items: center">
      <span style="min-width: 56px; font-size: 13px; opacity: 0.7">{{ variant }}</span>
      <XhButton v-for="tone in tones" :key="tone" :variant="variant" :tone="tone" size="sm">
        {{ tone }}
      </XhButton>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 10px">
  <div style="display: flex; gap: 8px; align-items: center">
    <span style="min-width: 56px; font-size: 13px; opacity: 0.7">solid</span>
    <xh-button variant="solid" tone="brand" size="sm">
      <button data-xh-part="root">brand</button>
    </xh-button>
    <xh-button variant="solid" tone="neutral" size="sm">
      <button data-xh-part="root">neutral</button>
    </xh-button>
    <xh-button variant="solid" tone="success" size="sm">
      <button data-xh-part="root">success</button>
    </xh-button>
    <xh-button variant="solid" tone="warning" size="sm">
      <button data-xh-part="root">warning</button>
    </xh-button>
    <xh-button variant="solid" tone="danger" size="sm">
      <button data-xh-part="root">danger</button>
    </xh-button>
    <xh-button variant="solid" tone="info" size="sm">
      <button data-xh-part="root">info</button>
    </xh-button>
  </div>
  <div style="display: flex; gap: 8px; align-items: center">
    <span style="min-width: 56px; font-size: 13px; opacity: 0.7">subtle</span>
    <xh-button variant="subtle" tone="brand" size="sm">
      <button data-xh-part="root">brand</button>
    </xh-button>
    <xh-button variant="subtle" tone="neutral" size="sm">
      <button data-xh-part="root">neutral</button>
    </xh-button>
    <xh-button variant="subtle" tone="success" size="sm">
      <button data-xh-part="root">success</button>
    </xh-button>
    <xh-button variant="subtle" tone="warning" size="sm">
      <button data-xh-part="root">warning</button>
    </xh-button>
    <xh-button variant="subtle" tone="danger" size="sm">
      <button data-xh-part="root">danger</button>
    </xh-button>
    <xh-button variant="subtle" tone="info" size="sm">
      <button data-xh-part="root">info</button>
    </xh-button>
  </div>
  <div style="display: flex; gap: 8px; align-items: center">
    <span style="min-width: 56px; font-size: 13px; opacity: 0.7">outline</span>
    <xh-button variant="outline" tone="brand" size="sm">
      <button data-xh-part="root">brand</button>
    </xh-button>
    <xh-button variant="outline" tone="neutral" size="sm">
      <button data-xh-part="root">neutral</button>
    </xh-button>
    <xh-button variant="outline" tone="success" size="sm">
      <button data-xh-part="root">success</button>
    </xh-button>
    <xh-button variant="outline" tone="warning" size="sm">
      <button data-xh-part="root">warning</button>
    </xh-button>
    <xh-button variant="outline" tone="danger" size="sm">
      <button data-xh-part="root">danger</button>
    </xh-button>
    <xh-button variant="outline" tone="info" size="sm">
      <button data-xh-part="root">info</button>
    </xh-button>
  </div>
  <div style="display: flex; gap: 8px; align-items: center">
    <span style="min-width: 56px; font-size: 13px; opacity: 0.7">ghost</span>
    <xh-button variant="ghost" tone="brand" size="sm">
      <button data-xh-part="root">brand</button>
    </xh-button>
    <xh-button variant="ghost" tone="neutral" size="sm">
      <button data-xh-part="root">neutral</button>
    </xh-button>
    <xh-button variant="ghost" tone="success" size="sm">
      <button data-xh-part="root">success</button>
    </xh-button>
    <xh-button variant="ghost" tone="warning" size="sm">
      <button data-xh-part="root">warning</button>
    </xh-button>
    <xh-button variant="ghost" tone="danger" size="sm">
      <button data-xh-part="root">danger</button>
    </xh-button>
    <xh-button variant="ghost" tone="info" size="sm">
      <button data-xh-part="root">info</button>
    </xh-button>
  </div>
</div>
```

### 图标与文字

图元放进 prefix 或 suffix 部件，文字放进 label；两个图元部件自带 aria-hidden，读屏念到的只有 label

```vue
<script setup lang="ts">
import { XhButton, XhButtonLabel, XhButtonPrefix, XhButtonSuffix, XhIcon } from "@xihan-ui/vue";

const PlusIcon = {
  name: "plus",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 5V19" } },
    { tag: "path", attrs: { d: "M5 12H19" } },
  ],
} as const;

const ArrowRightIcon = {
  name: "arrow-right",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M4 12H20" } },
    { tag: "path", attrs: { d: "M13 5L20 12L13 19" } },
  ],
} as const;
</script>

<template>
  <!-- 图元在前 -->
  <XhButton variant="solid">
    <XhButtonPrefix>
      <XhIcon :icon="PlusIcon" size="sm" />
    </XhButtonPrefix>
    <XhButtonLabel>新建</XhButtonLabel>
  </XhButton>

  <!-- 图元在后：换个部件就行，root 的 gap 两边通用 -->
  <XhButton variant="outline">
    <XhButtonLabel>下一步</XhButtonLabel>
    <XhButtonSuffix>
      <XhIcon :icon="ArrowRightIcon" size="sm" />
    </XhButtonSuffix>
  </XhButton>

  <!-- 前后各一枚 -->
  <XhButton variant="subtle" tone="success">
    <XhButtonPrefix>
      <XhIcon :icon="PlusIcon" size="sm" />
    </XhButtonPrefix>
    <XhButtonLabel>再来一件</XhButtonLabel>
    <XhButtonSuffix>
      <XhIcon :icon="ArrowRightIcon" size="sm" />
    </XhButtonSuffix>
  </XhButton>
</template>
```

```html
<!-- 图元在前 -->
<xh-button variant="solid">
  <button data-xh-part="root">
    <span data-xh-part="prefix">
      <xh-icon id="button-icon-new" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <span data-xh-part="label">新建</span>
  </button>
</xh-button>

<!-- 图元在后：换个部件就行，root 的 gap 两边通用 -->
<xh-button variant="outline">
  <button data-xh-part="root">
    <span data-xh-part="label">下一步</span>
    <span data-xh-part="suffix">
      <xh-icon id="button-icon-next" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </button>
</xh-button>

<!-- 前后各一枚 -->
<xh-button variant="subtle" tone="success">
  <button data-xh-part="root">
    <span data-xh-part="prefix">
      <xh-icon id="button-icon-more-prefix" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <span data-xh-part="label">再来一件</span>
    <span data-xh-part="suffix">
      <xh-icon id="button-icon-more-suffix" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </button>
</xh-button>

<script type="module">
  // 图元记录是对象，只走 property 交给 <xh-icon>，图元铺进空的 glyph
  const stroke = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const plus = {
    name: "plus",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M12 5V19" } },
      { tag: "path", attrs: { d: "M5 12H19" } },
    ],
  };

  const arrowRight = {
    name: "arrow-right",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M4 12H20" } },
      { tag: "path", attrs: { d: "M13 5L20 12L13 19" } },
    ],
  };

  document.getElementById("button-icon-new").icon = plus;
  document.getElementById("button-icon-next").icon = arrowRight;
  document.getElementById("button-icon-more-prefix").icon = plus;
  document.getElementById("button-icon-more-suffix").icon = arrowRight;
</script>
```

### 点击事件

处理器照常挂在组件上；载入态与禁用态的点击在根上就被拦下，作者挂的处理器也收不到

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <XhButton variant="solid" @click="count++">点一下</XhButton>
  <XhButton loading @click="count++">载入中</XhButton>
  <XhButton disabled @click="count++">禁用</XhButton>
  <span style="font-size: 13px">已计数 {{ count }} 次</span>
</template>
```

```html
<div
  id="button-click"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px"
>
  <xh-button variant="solid">
    <button data-xh-part="root">点一下</button>
  </xh-button>
  <xh-button loading>
    <button data-xh-part="root">载入中</button>
  </xh-button>
  <xh-button disabled>
    <button data-xh-part="root">禁用</button>
  </xh-button>
  <span style="font-size: 13px">已计数 <span id="button-click-count">0</span> 次</span>
</div>

<script type="module">
  // 三颗按钮各挂一个处理器，计数落在后面那行文字上
  const host = document.getElementById("button-click");
  const readout = document.getElementById("button-click-count");
  let count = 0;
  for (const button of host.querySelectorAll("xh-button")) {
    button.addEventListener("click", () => {
      count += 1;
      readout.textContent = String(count);
    });
  }
</script>
```

### 形状与图标按钮

圆角是一个组件令牌；只放一枚图元时把左右内边距收成 0、宽度取控件档位，名字这时只能由 aria-label 给

```vue
<script setup lang="ts">
import { XhButton, XhIcon } from "@xihan-ui/vue";

const SearchIcon = {
  name: "search",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "10.5", cy: "10.5", r: "6.5" } },
    { tag: "path", attrs: { d: "M15.5 15.5L20.5 20.5" } },
  ],
} as const;
</script>

<template>
  <XhButton variant="solid">直角</XhButton>

  <!-- 胶囊：只改圆角这一个槽位 -->
  <XhButton variant="solid" style="--xh-button-radius: var(--xh-shape-pill)">胶囊</XhButton>

  <!-- 方形图标按钮：icon-only 自己把内距清零、宽度跟住当前尺寸档 -->
  <XhButton variant="outline" icon-only aria-label="搜索">
    <XhIcon :icon="SearchIcon" size="sm" />
  </XhButton>

  <!-- 圆形图标按钮：方形再叠上胶囊圆角 -->
  <XhButton
    variant="solid"
    icon-only
    aria-label="搜索"
    style="--xh-button-radius: var(--xh-shape-pill)"
  >
    <XhIcon :icon="SearchIcon" size="sm" />
  </XhButton>
</template>
```

```html
<xh-button variant="solid">
  <button data-xh-part="root">直角</button>
</xh-button>

<!-- 胶囊：只改圆角这一个槽位 -->
<xh-button variant="solid">
  <button data-xh-part="root" style="--xh-button-radius: var(--xh-shape-pill)">
    胶囊
  </button>
</xh-button>

<!-- 方形图标按钮 -->
<xh-button variant="outline" icon-only>
  <button data-xh-part="root" aria-label="搜索">
    <xh-icon id="button-shape-square" size="sm">
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
  </button>
</xh-button>

<!-- 圆形图标按钮：方形再叠上胶囊圆角 -->
<xh-button variant="solid" icon-only>
  <button
    data-xh-part="root"
    aria-label="搜索"
    style="--xh-button-radius: var(--xh-shape-pill)"
  >
    <xh-icon id="button-shape-round" size="sm">
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
  </button>
</xh-button>

<script type="module">
  // 图元记录是对象，只走 property 交给 <xh-icon>
  const search = {
    name: "search",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "circle", attrs: { cx: "10.5", cy: "10.5", r: "6.5" } },
      { tag: "path", attrs: { d: "M15.5 15.5L20.5 20.5" } },
    ],
  };

  document.getElementById("button-shape-square").icon = search;
  document.getElementById("button-shape-round").icon = search;
</script>
```

### 自定义配色

不写 variant 时底色与文字色取自组件令牌，逐个实例覆盖就能用上语气表以外的颜色

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";

// 静止、悬停、按下三个底色各是一个槽位，缺哪个就落回缺省值
const grape = {
  "--xh-button-bg": "#8a2be2",
  "--xh-button-bg-hover": "#7a24ca",
  "--xh-button-bg-active": "#691fac",
  "--xh-button-fg": "#ffffff",
};

const flamingo = {
  "--xh-button-bg": "#ff69b4",
  "--xh-button-bg-hover": "#f2559f",
  "--xh-button-bg-active": "#d94489",
  "--xh-button-fg": "#ffffff",
};
</script>

<template>
  <XhButton :style="grape">葡萄</XhButton>
  <XhButton :style="flamingo">火烈鸟</XhButton>
  <!-- 颜色以外的槽位可以一起换，这里再换掉圆角 -->
  <XhButton :style="{ ...grape, '--xh-button-radius': 'var(--xh-shape-pill)' }">胶囊葡萄</XhButton>
</template>
```

```html
<!-- 静止、悬停、按下三个底色各是一个槽位，缺哪个就落回缺省值 -->
<xh-button>
  <button
    data-xh-part="root"
    style="
      --xh-button-bg: #8a2be2;
      --xh-button-bg-hover: #7a24ca;
      --xh-button-bg-active: #691fac;
      --xh-button-fg: #ffffff;
    "
  >
    葡萄
  </button>
</xh-button>

<xh-button>
  <button
    data-xh-part="root"
    style="
      --xh-button-bg: #ff69b4;
      --xh-button-bg-hover: #f2559f;
      --xh-button-bg-active: #d94489;
      --xh-button-fg: #ffffff;
    "
  >
    火烈鸟
  </button>
</xh-button>

<!-- 颜色以外的槽位可以一起换，这里再换掉圆角 -->
<xh-button>
  <button
    data-xh-part="root"
    style="
      --xh-button-bg: #8a2be2;
      --xh-button-bg-hover: #7a24ca;
      --xh-button-bg-active: #691fac;
      --xh-button-fg: #ffffff;
      --xh-button-radius: var(--xh-shape-pill);
    "
  >
    胶囊葡萄
  </button>
</xh-button>
```

### 按钮组

相邻两段共用一条边，圆角只留在两端；档位与形状写在容器上，靠自定义属性流给组内每一段

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";

const views = ["日", "周", "月"];

// 首段留起始两角、末段留结尾两角，中间保持直角；
// 后一段往回挪一个描边宽度，相邻的两条边重合成一条
function segment(index: number, total: number, radius = "var(--xh-shape-control)") {
  return {
    marginInlineStart: index ? "calc(-1 * var(--xh-stroke-thin))" : undefined,
    borderStartStartRadius: index === 0 ? radius : undefined,
    borderEndStartRadius: index === 0 ? radius : undefined,
    borderStartEndRadius: index === total - 1 ? radius : undefined,
    borderEndEndRadius: index === total - 1 ? radius : undefined,
  };
}
</script>

<template>
  <!-- 圆角槽位在容器上收成 0，组内每段都取得到，两端的圆角再逐段补回来 -->
  <div style="display: inline-flex; --xh-button-radius: 0">
    <XhButton
      v-for="(v, i) in views"
      :key="v"
      variant="outline"
      :style="segment(i, views.length)"
    >
      {{ v }}
    </XhButton>
  </div>

  <!-- 同一份配方换一档：高度、内边距、字号在容器上写一次，两端收成胶囊 -->
  <div
    style="
      display: inline-flex;
      --xh-button-radius: 0;
      --xh-button-h: var(--xh-control-h-sm);
      --xh-button-px: var(--xh-control-px-sm);
      --xh-button-font-size: var(--xh-font-size-sm);
    "
  >
    <XhButton
      v-for="(v, i) in views"
      :key="v"
      variant="outline"
      :style="segment(i, views.length, 'var(--xh-shape-pill)')"
    >
      {{ v }}
    </XhButton>
  </div>
</template>
```

```html
<!-- 圆角槽位在容器上收成 0，组内每段都取得到，两端的圆角再逐段补回来 -->
<div style="display: inline-flex; --xh-button-radius: 0">
  <!-- 外壳不参与排版，分段样式落在按钮本身 -->
  <xh-button variant="outline" style="display: contents">
    <button
      data-xh-part="root"
      style="
        border-start-start-radius: var(--xh-shape-control);
        border-end-start-radius: var(--xh-shape-control);
      "
    >
      日
    </button>
  </xh-button>
  <!-- 后一段往回挪一个描边宽度，相邻的两条边重合成一条 -->
  <xh-button variant="outline" style="display: contents">
    <button
      data-xh-part="root"
      style="margin-inline-start: calc(-1 * var(--xh-stroke-thin))"
    >
      周
    </button>
  </xh-button>
  <xh-button variant="outline" style="display: contents">
    <button
      data-xh-part="root"
      style="
        margin-inline-start: calc(-1 * var(--xh-stroke-thin));
        border-start-end-radius: var(--xh-shape-control);
        border-end-end-radius: var(--xh-shape-control);
      "
    >
      月
    </button>
  </xh-button>
</div>

<!-- 同一份配方换一档：高度、内边距、字号在容器上写一次，两端收成胶囊 -->
<div
  style="
    display: inline-flex;
    --xh-button-radius: 0;
    --xh-button-h: var(--xh-control-h-sm);
    --xh-button-px: var(--xh-control-px-sm);
    --xh-button-font-size: var(--xh-font-size-sm);
  "
>
  <xh-button variant="outline" style="display: contents">
    <button
      data-xh-part="root"
      style="
        border-start-start-radius: var(--xh-shape-pill);
        border-end-start-radius: var(--xh-shape-pill);
      "
    >
      日
    </button>
  </xh-button>
  <xh-button variant="outline" style="display: contents">
    <button
      data-xh-part="root"
      style="margin-inline-start: calc(-1 * var(--xh-stroke-thin))"
    >
      周
    </button>
  </xh-button>
  <xh-button variant="outline" style="display: contents">
    <button
      data-xh-part="root"
      style="
        margin-inline-start: calc(-1 * var(--xh-stroke-thin));
        border-start-end-radius: var(--xh-shape-pill);
        border-end-end-radius: var(--xh-shape-pill);
      "
    >
      月
    </button>
  </xh-button>
</div>
```

### 渲染成链接

皮肤认的是 data-scope 与 data-part 这组契约，不是标签名：把契约铺到链接元素上就得到导航型按钮，跳转仍由浏览器原生完成

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton variant="solid">留在本页</XhButton>

  <!-- 根部件的两个契约属性铺上去就够；形态与档位照常由 data-variant、data-size 给 -->
  <a
    href="/introduction"
    data-scope="button"
    data-part="root"
    data-variant="solid"
    style="text-decoration: none"
  >
    去简介
  </a>

  <a
    href="/guide/anatomy"
    data-scope="button"
    data-part="root"
    data-variant="outline"
    data-size="sm"
    style="text-decoration: none"
  >
    看解剖
  </a>
</template>
```

```html
<xh-button variant="solid">
  <button data-xh-part="root">留在本页</button>
</xh-button>

<!-- 根部件的两个契约属性铺上去就够；形态与档位照常由 data-variant、data-size 给 -->
<a
  href="/introduction"
  data-scope="button"
  data-part="root"
  data-variant="solid"
  style="text-decoration: none"
>
  去简介
</a>

<a
  href="/guide/anatomy"
  data-scope="button"
  data-part="root"
  data-variant="outline"
  data-size="sm"
  style="text-decoration: none"
>
  看解剖
</a>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button>` |
| Vue 组件 | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/button.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="button"`：**`root`** · `label` · `indicator` · `prefix` · `suffix`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ariaLabel` | `string` |  | 作者写在根节点上的可及名（aria-label / aria-labelledby）。 宿主只把它们转告连接层，用来判断图标按钮有没有名字；属性本身仍由宿主写进根节点。 |
| `ariaLabelledby` | `string` |  |  |
| `as` | `ButtonElement` |  | 渲染成哪个标签，默认 button。 写成 a 时不再产出 type 与原生 disabled（两者在链接上无效），禁用改由 aria-disabled 表达， 点击仍被拦下。作者自行给 href。 |
| `disabled` | `boolean` |  |  |
| `fullWidth` | `boolean` |  | 撑满行宽：表单末尾的提交按钮与移动端常用。 |
| `iconOnly` | `boolean` |  | 只有图标：左右内距清零、宽高相等。宽度跟着当前尺寸档的高度走， 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行给可及名。 |
| `loading` | `boolean` |  | 加载态：用 aria-disabled + 拦截事件表达，保留焦点。 |
| `shape` | `ButtonShape` |  | 圆角档：rounded 是常规控件圆角，pill 是胶囊，square 是直角。 缺省即跟着 --xh-shape-control 走，与不写这一项时逐值相同。 |
| `size` | `Size` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `type` | `'button' \| 'submit' \| 'reset'` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定颜色怎么用 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `getRootProps` | `() => T['button']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, interactive | 激活按钮（原生行为） |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `prefix` | `aria-hidden` | 'true' |
| `suffix` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/button.css` 按部件选择：`[data-scope="button"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-icon-only` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-shape` | props.shape |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-button-bg` · `--xh-button-bg-active` · `--xh-button-bg-hover` · `--xh-button-fg` · `--xh-button-font-size` · `--xh-button-font-weight` · `--xh-button-gap` · `--xh-button-h` · `--xh-button-icon-size` · `--xh-button-px` · `--xh-button-radius` · `--xh-button-shadow` · `--xh-button-shadow-hover` · `--xh-button-spin-duration`

## 动效

关键帧 `xh-spin` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 连排成一条：外面套[按钮组](./button-group)，档位与形态写在容器上，组内每一段自己不重复标注。
- 图元用 [图标](./icon)，放进 `prefix` 或 `suffix`。
- 需要二次确认的危险动作：外面套[弹出确认](./popconfirm)。

## 最佳实践

- 只放图标时必须给 `aria-label`——按钮此时没有任何可见文字，名字只能由它来给。
- 一个视图里 `solid` + `brand` 只留一个，主动作唯一才排得出主次。
- 载入期间保留原有宽度，别让指示器把按钮撑窄或撑宽，指针会跟着跑掉。

## 反模式

- 用 `disabled` 表达"正在提交"：原生禁用会丢掉焦点、读屏也不再播报，用户不知道发生了什么。用 `loading`。
- 把导航写成按钮加 `onClick` 跳转，见上。
- 在按钮里再放一个可聚焦元素：一次点击落在哪个目标上不可预期。
