来源：https://ui.docs.xihanfun.com/components/icon

# 图标 `icon`

画一枚矢量图元，并把"它是装饰还是信息"这件事说清楚。

## 何时使用

- 给动作、状态或条目配一枚图形标记。
- 图形本身就是唯一的信息载体（比如只有图标的按钮里那枚图元）——这时给 `label`。

## 何时不用

- 需要一个带底色的圆形底座：用[图标块](./icon-wrapper)。
- 图形是照片或插画：用[图片](./image)。

## 特性

- 传的是图标记录本身而不是名字：按名字查表就得把整张表静态引进来，摇树全废。
- 命名只有两态：给了非空白 `label` 就是 `role="img"` 加 `aria-label`；没给就是 `aria-hidden="true"` 的装饰件。没有第三种。
- `size` 八档改直径（`text` 跟着相邻文字的字号走，其余七档是固定直径）、`weight` 三档改描边粗细；缺省档 `md` 不落 `data-*`，皮肤的基础规则就是缺省档。
- `rotate` 只收 90 / 180 / 270 三档，`flip` 沿横轴或纵轴取反；两者同写时叠加，都是静态几何，不带过渡。
- 图标没有底色，语气只落在前景上。

## 示例

### 基础用法

传的是图标记录本身而不是名字：名字要运行期查表，查表就得把整张表静态引进来，摇树全废

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

// 图标记录是纯数据：坐标系、打在根 svg 上的呈现属性、图元树
const CheckIcon = {
  name: "check",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6" } }],
} as const;

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
    {
      tag: "path",
      attrs: {
        d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
      },
    },
  ],
} as const;
</script>

<template>
  <XhIcon :icon="CheckIcon" />
  <XhIcon :icon="SearchIcon" />
  <XhIcon :icon="StarIcon" />
  <!-- 记录里的 stroke 取 currentColor，配色随上下文的文字色流下来 -->
  <span style="display: inline-flex; align-items: center; gap: 6px; color: #16a34a;">
    <XhIcon :icon="CheckIcon" />已完成
  </span>
</template>
```

```html
<xh-icon id="icon-basic-check">
  <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
</xh-icon>

<xh-icon id="icon-basic-search">
  <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
</xh-icon>

<xh-icon id="icon-basic-star">
  <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
</xh-icon>

<!-- 记录里的 stroke 取 currentColor，配色随上下文的文字色流下来 -->
<span style="display: inline-flex; align-items: center; gap: 6px; color: #16a34a">
  <xh-icon id="icon-basic-check-inline">
    <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
  </xh-icon>
  已完成
</span>

<script type="module">
  // 图标记录是纯数据：坐标系、打在根 svg 上的呈现属性、图元树；是对象，只走 property
  const stroke = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const checkIcon = {
    name: "check",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6" } }],
  };

  const searchIcon = {
    name: "search",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "circle", attrs: { cx: "10.5", cy: "10.5", r: "6.5" } },
      { tag: "path", attrs: { d: "M15.5 15.5L20.5 20.5" } },
    ],
  };

  const starIcon = {
    name: "star",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      {
        tag: "path",
        attrs: {
          d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
        },
      },
    ],
  };

  document.getElementById("icon-basic-check").icon = checkIcon;
  document.getElementById("icon-basic-search").icon = searchIcon;
  document.getElementById("icon-basic-star").icon = starIcon;
  document.getElementById("icon-basic-check-inline").icon = checkIcon;
</script>
```

### 尺寸与描边

size 八档改直径（text 跟着相邻文字的字号走）、weight 三档改 stroke-width；缺省档 md 不落 data-* 属性，皮肤的基础规则就是缺省档

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

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
    {
      tag: "path",
      attrs: {
        d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
      },
    },
  ],
} as const;
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="StarIcon" size="text" />
    <XhIcon :icon="StarIcon" size="sm" />
    <XhIcon :icon="StarIcon" />
    <XhIcon :icon="StarIcon" size="lg" />
    <XhIcon :icon="StarIcon" size="xl" />
    <span style="font-size: 13px;">text / sm / md（缺省）/ lg / xl，另有 2xl / 3xl / 4xl</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="StarIcon" size="lg" weight="light" />
    <XhIcon :icon="StarIcon" size="lg" />
    <XhIcon :icon="StarIcon" size="lg" weight="bold" />
    <span style="font-size: 13px;">light / regular（缺省）/ bold</span>
  </span>
</template>
```

```html
<span id="icon-size" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="text"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="sm"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="xl"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">text / sm / md（缺省）/ lg / xl，另有 2xl / 3xl / 4xl</span>
</span>

<span id="icon-weight" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="lg" weight="light"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" weight="bold"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">light / regular（缺省）/ bold</span>
</span>

<script type="module">
  // 图标记录是对象，只走 property
  const starIcon = {
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
          d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
        },
      },
    ],
  };

  for (const id of ["icon-size", "icon-weight"]) {
    for (const icon of document.getElementById(id).querySelectorAll("xh-icon")) {
      icon.icon = starIcon;
    }
  }
</script>
```

### 可及名字

命名只有两态：给了非空白 label 就是 role="img" + aria-label，没给就是 aria-hidden="true" 的装饰件

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

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

const XIcon = {
  name: "x",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M6 6L18 18" } },
    { tag: "path", attrs: { d: "M18 6L6 18" } },
  ],
} as const;
</script>

<template>
  <!-- 旁边已经有文字说这件事，图标不给 label，读屏不会把「加号 新建」念两遍 -->
  <span style="display: inline-flex; align-items: center; gap: 6px;">
    <XhIcon :icon="PlusIcon" />新建
  </span>

  <!-- 图标是这里唯一说出「关闭」的东西，必须给 label -->
  <span style="display: inline-flex; align-items: center; gap: 6px;">
    <XhIcon :icon="XIcon" label="关闭" />
    <span style="font-size: 13px;">这枚没有可见文字，名字只能由 label 给</span>
  </span>
</template>
```

```html
<!-- 旁边已经有文字说这件事，图标不给 label，读屏不会把「加号 新建」念两遍 -->
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-icon id="icon-label-plus"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  新建
</span>

<!-- 图标是这里唯一说出「关闭」的东西，必须给 label -->
<span style="display: inline-flex; align-items: center; gap: 6px">
  <xh-icon id="icon-label-x" label="关闭"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">这枚没有可见文字，名字只能由 label 给</span>
</span>

<script type="module">
  // 图标记录是对象，只走 property
  const stroke = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  document.getElementById("icon-label-plus").icon = {
    name: "plus",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M12 5V19" } },
      { tag: "path", attrs: { d: "M5 12H19" } },
    ],
  };

  document.getElementById("icon-label-x").icon = {
    name: "x",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M6 6L18 18" } },
      { tag: "path", attrs: { d: "M18 6L6 18" } },
    ],
  };
</script>
```

### 自定义图元

默认插槽给出内容时改由插槽填充根 svg，元素不再生成 glyph 空壳；坐标系此时由自己写的 viewBox 定

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <!-- 不传 icon，几何自己写：适合一次性的品牌标记、渐变填充这类不进图标集的图形 -->
  <XhIcon viewBox="0 0 24 24" size="lg" label="曦寒标记">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
    <path
      d="M8 8L16 16M16 8L8 16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </XhIcon>

  <XhIcon viewBox="0 0 24 24" size="lg" label="半满进度">
    <rect x="3" y="9" width="18" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
    <rect x="5" y="11" width="7" height="2" rx="1" fill="currentColor" />
  </XhIcon>
</template>
```

```html
<!-- 不传 icon、也不留 glyph 空壳，几何自己写：适合一次性的品牌标记、渐变填充这类不进图标集的图形 -->
<xh-icon size="lg" label="曦寒标记">
  <svg data-xh-part="root" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
    <path
      d="M8 8L16 16M16 8L8 16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</xh-icon>

<xh-icon size="lg" label="半满进度">
  <svg data-xh-part="root" viewBox="0 0 24 24">
    <rect x="3" y="9" width="18" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
    <rect x="5" y="11" width="7" height="2" rx="1" fill="currentColor" />
  </svg>
</xh-icon>
```

### 语气

图标没有底色，语气只落在前景上，取普通背景上表达该语气的那档文字色

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

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
    {
      tag: "path",
      attrs: {
        d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
      },
    },
  ],
} as const;

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 同一枚图标只换语气：旁边的文字不带语气，对照得出改的只是图标前景 -->
  <span
    v-for="t in tones"
    :key="t"
    style="display: inline-flex; align-items: center; gap: 6px"
  >
    <XhIcon :icon="StarIcon" :tone="t" size="lg" />
    <span style="font-size: 13px">{{ t }}</span>
  </span>
</template>
```

```html
<!-- 同一枚图标只换语气：旁边的文字不带语气，对照得出改的只是图标前景 -->
<span id="icon-tone" style="display: contents">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-icon tone="brand" size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
    <span style="font-size: 13px">brand</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-icon tone="neutral" size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
    <span style="font-size: 13px">neutral</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-icon tone="success" size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
    <span style="font-size: 13px">success</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-icon tone="warning" size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
    <span style="font-size: 13px">warning</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-icon tone="danger" size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
    <span style="font-size: 13px">danger</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-icon tone="info" size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
    <span style="font-size: 13px">info</span>
  </span>
</span>

<script type="module">
  // 图标记录是对象，只走 property
  const starIcon = {
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
          d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
        },
      },
    ],
  };

  for (const icon of document.getElementById("icon-tone").querySelectorAll("xh-icon")) {
    icon.icon = starIcon;
  }
</script>
```

### 前景分级

图标没有底色，前景是一个组件令牌；跟正文取同一族文字色，图标就跟着排出主次

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

const InfoIcon = {
  name: "info",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
    { tag: "path", attrs: { d: "M12 11V16.5" } },
    { tag: "path", attrs: { d: "M12 7.5V8" } },
  ],
} as const;

// 前景取普通背景上的四档文字色，从正文一路淡到不可用
const depths = [
  { fg: "var(--xh-fg-default)", label: "正文" },
  { fg: "var(--xh-fg-muted)", label: "次要" },
  { fg: "var(--xh-fg-subtle)", label: "更次要" },
  { fg: "var(--xh-fg-disabled)", label: "不可用" },
];
</script>

<template>
  <span
    v-for="d in depths"
    :key="d.label"
    :style="{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: d.fg }"
  >
    <XhIcon :icon="InfoIcon" size="lg" :style="{ '--xh-icon-fg': d.fg }" />
    <span style="font-size: 13px">{{ d.label }}</span>
  </span>
</template>
```

```html
<!-- 前景取普通背景上的四档文字色，从正文一路淡到不可用 -->
<span id="icon-depth" style="display: contents">
  <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--xh-fg-default)">
    <xh-icon size="lg">
      <svg data-xh-part="root" style="--xh-icon-fg: var(--xh-fg-default)"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
    <span style="font-size: 13px">正文</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--xh-fg-muted)">
    <xh-icon size="lg">
      <svg data-xh-part="root" style="--xh-icon-fg: var(--xh-fg-muted)"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
    <span style="font-size: 13px">次要</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--xh-fg-subtle)">
    <xh-icon size="lg">
      <svg data-xh-part="root" style="--xh-icon-fg: var(--xh-fg-subtle)"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
    <span style="font-size: 13px">更次要</span>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--xh-fg-disabled)">
    <xh-icon size="lg">
      <svg data-xh-part="root" style="--xh-icon-fg: var(--xh-fg-disabled)"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
    <span style="font-size: 13px">不可用</span>
  </span>
</span>

<script type="module">
  // 图标记录是对象，只走 property
  const infoIcon = {
    name: "info",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M12 11V16.5" } },
      { tag: "path", attrs: { d: "M12 7.5V8" } },
    ],
  };

  for (const icon of document.getElementById("icon-depth").querySelectorAll("xh-icon")) {
    icon.icon = infoIcon;
  }
</script>
```

### 旋转与翻转

rotate 只收 90 / 180 / 270 三档，flip 沿横轴或纵轴取反；两者是独立属性，同写即叠加

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";

const ArrowIcon = {
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
    { tag: "path", attrs: { d: "M4 12h15" } },
    { tag: "path", attrs: { d: "M13 6l6 6-6 6" } },
  ],
} as const;
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="ArrowIcon" size="lg" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="90" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="180" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="270" />
    <span style="font-size: 13px;">不转 / 90 / 180 / 270</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhIcon :icon="ArrowIcon" size="lg" flip="horizontal" />
    <XhIcon :icon="ArrowIcon" size="lg" flip="vertical" />
    <XhIcon :icon="ArrowIcon" size="lg" flip="both" />
    <XhIcon :icon="ArrowIcon" size="lg" :rotate="90" flip="horizontal" />
    <span style="font-size: 13px;">横轴 / 纵轴 / 两轴 / 转 90 再翻横轴</span>
  </span>
</template>
```

```html
<span id="icon-rotate" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="90"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="180"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="270"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">不转 / 90 / 180 / 270</span>
</span>

<span id="icon-flip" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="lg" flip="horizontal"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" flip="vertical"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" flip="both"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="90" flip="horizontal"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">横轴 / 纵轴 / 两轴 / 转 90 再翻横轴</span>
</span>

<script type="module">
  // 图标记录是对象，只走 property
  const arrowIcon = {
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
      { tag: "path", attrs: { d: "M4 12h15" } },
      { tag: "path", attrs: { d: "M13 6l6 6-6 6" } },
    ],
  };

  for (const id of ["icon-rotate", "icon-flip"]) {
    for (const icon of document.getElementById(id).querySelectorAll("xh-icon")) {
      icon.icon = arrowIcon;
    }
  }
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon>` |
| Vue 组件 | `XhIcon` |
| 组合式函数 | `useIcon` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="icon"`：**`root`** · `glyph`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `flip` | `IconFlip` |  | 翻转轴：horizontal / vertical / both，不翻就不写。旋转与翻转同写时两者叠加。 |
| `icon` | `IconRecord` |  | 要画的图标。传的是记录本身而不是名字： 名字要走运行期查表，查表就必须把全表静态引进来，摇树全废。 |
| `label` | `string` |  | 可及名字。 给了非空白文本 = 这个图标是页面上唯一说出这件事的东西，输出 role="img" + aria-label； 缺席或全空白 = 装饰，输出 aria-hidden="true"。没有第三种形态。 |
| `rotate` | `IconRotate \| string` |  | 旋转档位：90 / 180 / 270，不转就不写。 收字符串是因为 WC 那侧的档位来自 DOM 属性；不是这三档的值一律不写出。 |
| `size` | `IconSize` |  | 直径档位，缺省 md；缺省档不输出 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `weight` | `IconWeight` |  | 描边粗细档位，缺省 regular；缺省档不输出 data-weight。 |

## connect API

`useIcon` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string \| undefined` | 解析后的可及名字；装饰态为 undefined。 |
| `decorative` | `boolean` | 是否装饰态（label 没给或全空白）。 |
| `nodes` | `readonly IconNode[]` | 要铺进 glyph 的图元树；没传 icon 时是空数组。 |
| `content` | `IconRecord \| undefined` | 当前铺设内容的身份。就是 icon 本身：记录是模块级常量，引用相等即内容相等。 不用字符串签名——签名要遍历整棵树再拼串，每次 wire 都付一遍。 |
| `getRootProps` | `() => T['element']` |  |
| `getGlyphProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | props.label \| undefined |
| `root` | `role` | undefined \| 'img' |

## 样式

默认皮肤 `@xihan-ui/styles/icon.css` 按部件选择：`[data-scope="icon"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-flip` | props.flip |
| `root` | `data-icon` | icon?.name |
| `root` | `data-rotate` | rotateAttr(props.rotate) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-weight` | props.weight |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-icon-fg` · `--xh-icon-shift` · `--xh-icon-size` · `--xh-icon-stroke`

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 组合

- 放进[按钮](./button)的 `prefix` / `suffix`，或[图标块](./icon-wrapper)的底座里。

## 最佳实践

- 旁边已经有文字说明同一件事时，别给 `label`——重复的名字会被读屏念两遍。
- 同一屏里的图标保持同一档 `weight`，粗细混用比尺寸混用更显乱。

## 反模式

- 给装饰性图标写 `label`，或给唯一承载语义的图标漏写 `label`：两者都会让读屏用户听到错的东西。
- 用图标单独表达状态而不配文字或提示：图形的含义没有共识。
