来源：https://ui.docs.xihanfun.com/components/avatar

# Avatar 头像

表示一个人或一个组织的圆形标识：优先显示图片，无法加载时回退到文字或图标。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/avatar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/avatar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/avatar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/avatar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/avatar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

图片加载失败或未提供时落到 fallback

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhAvatarRoot src="/images/demo-avatar.svg" alt="曦寒">
    <XhAvatarImage />
    <XhAvatarFallback>曦</XhAvatarFallback>
  </XhAvatarRoot>

  <XhAvatarRoot>
    <XhAvatarImage />
    <XhAvatarFallback>XH</XhAvatarFallback>
  </XhAvatarRoot>
</template>
```

```html
<xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
  <span data-xh-part="root">
    <img data-xh-part="image" />
    <span data-xh-part="fallback">曦</span>
  </span>
</xh-avatar>

<xh-avatar>
  <span data-xh-part="root">
    <img data-xh-part="image" />
    <span data-xh-part="fallback">XH</span>
  </span>
</xh-avatar>
```

## 组件结构

加粗的是必需部件。

`data-scope="avatar"`：`root` · `image` · **`fallback`**

## 示例

### 加载失败回退

图片地址取不到时切到 fallback，切换由状态机决定而不是 CSS

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhAvatarRoot src="/images/does-not-exist.svg" alt="取不到的图">
    <XhAvatarImage />
    <XhAvatarFallback>回退</XhAvatarFallback>
  </XhAvatarRoot>

  <XhAvatarRoot>
    <XhAvatarImage />
    <XhAvatarFallback>无图</XhAvatarFallback>
  </XhAvatarRoot>
</template>
```

```html
<xh-avatar src="/images/does-not-exist.svg" alt="取不到的图">
  <span data-xh-part="root">
    <img data-xh-part="image" />
    <span data-xh-part="fallback">回退</span>
  </span>
</xh-avatar>

<xh-avatar>
  <span data-xh-part="root">
    <img data-xh-part="image" />
    <span data-xh-part="fallback">无图</span>
  </span>
</xh-avatar>
```

### 尺寸

size 三档只改变直径，回退文字的字号随之缩放；默认档不输出 data-size

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 有图的一行：图片铺满 root，跟着三档一起缩放 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot size="sm" src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot size="lg" src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <span style="font-size: 13px">sm / 缺省 / lg</span>
  </div>

  <!-- 落回退态的一行：小头像里的字不撑出去，大头像里的字也不显小 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot size="sm">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot>
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot size="lg">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
    <span style="font-size: 13px">回退字随档位缩放</span>
  </div>
</template>
```

```html
<!-- 有图的一行：图片铺满 root，跟着三档一起缩放 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar size="sm" src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <xh-avatar size="lg" src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <span style="font-size: 13px">sm / 缺省 / lg</span>
</div>

<!-- 落回退态的一行：小头像里的字不撑出去，大头像里的字也不显小 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar size="sm">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
  <xh-avatar>
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
  <xh-avatar size="lg">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
  <span style="font-size: 13px">回退字随档位缩放</span>
</div>
```

### 形状

圆角是一个组件令牌，整圆、圆角方、直角都是同一个槽位换值；图片的圆角从根继承，不必另设

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot src="/images/demo-avatar.svg" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot
      src="/images/demo-avatar.svg"
      alt="曦寒"
      style="--xh-avatar-radius: var(--xh-radius-md)"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot
      src="/images/demo-avatar.svg"
      alt="曦寒"
      style="--xh-avatar-radius: var(--xh-radius-none)"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <span style="font-size: 13px">整圆（缺省）/ 圆角方 / 直角</span>
  </div>

  <!-- 落回退态时形状一样成立 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot>
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot style="--xh-avatar-radius: var(--xh-radius-md)">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot style="--xh-avatar-radius: var(--xh-radius-none)">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root" style="--xh-avatar-radius: var(--xh-radius-md)">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
    <span data-xh-part="root" style="--xh-avatar-radius: var(--xh-radius-none)">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <span style="font-size: 13px">整圆（缺省）/ 圆角方 / 直角</span>
</div>

<!-- 落回退态时形状一样成立 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar>
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-radius: var(--xh-radius-md)">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-radius: var(--xh-radius-none)">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
</div>
```

### 图标作为回退

fallback 是普通插槽，放图标与放缩写文字一样；没有名字可写时用图标表示某位用户

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhIcon } from "@xihan-ui/vue";

const UserIcon = {
  name: "user",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "8", r: "3.5" } },
    { tag: "path", attrs: { d: "M5 20C5 16.5 8.1 14.5 12 14.5C15.9 14.5 19 16.5 19 20" } },
  ],
} as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot size="sm">
      <XhAvatarImage />
      <XhAvatarFallback>
        <XhIcon :icon="UserIcon" size="sm" />
      </XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot>
      <XhAvatarImage />
      <XhAvatarFallback>
        <XhIcon :icon="UserIcon" />
      </XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot size="lg">
      <XhAvatarImage />
      <XhAvatarFallback>
        <XhIcon :icon="UserIcon" size="lg" />
      </XhAvatarFallback>
    </XhAvatarRoot>

    <span style="font-size: 13px">图元跟着档位一起换，取的是根流下来的前景色</span>
  </div>
</template>
```

```html
<div id="avatar-icon" style="display: flex; align-items: center; gap: 12px">
  <xh-avatar size="sm">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">
        <xh-icon size="sm">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </span>
  </xh-avatar>

  <xh-avatar size="lg">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">
        <xh-icon size="lg">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </span>
  </xh-avatar>

  <span style="font-size: 13px">图元跟着档位一起换，取的是根流下来的前景色</span>
</div>

<script type="module">
  // 图标记录是对象，只能作为 property 交给三个 xh-icon
  const userIcon = {
    name: "user",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "8", r: "3.5" } },
      { tag: "path", attrs: { d: "M5 20C5 16.5 8.1 14.5 12 14.5C15.9 14.5 19 16.5 19 20" } },
    ],
  };
  for (const icon of document.getElementById("avatar-icon").querySelectorAll("xh-icon")) {
    icon.icon = userIcon;
  }
</script>
```

### 自定义直径与配色

三档之外的直径、底色、字色各是一个组件令牌；按人名分配颜色即逐个实例覆盖

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const people = [
  { text: "曦", bg: "#fee2e2", fg: "#b91c1c" },
  { text: "寒", bg: "#dcfce7", fg: "#15803d" },
  { text: "懿", bg: "#e0e7ff", fg: "#4338ca" },
  { text: "XH", bg: "#fef3c7", fg: "#b45309" },
];
</script>

<template>
  <!-- 直径与字号一起给，回退字才不会在大头像里显小 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot
      src="/images/demo-avatar.svg"
      alt="曦寒"
      style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px">
      <XhAvatarImage />
      <XhAvatarFallback>曦寒</XhAvatarFallback>
    </XhAvatarRoot>

    <span style="font-size: 13px">直径 56px</span>
  </div>

  <div style="display: flex; align-items: center; gap: 8px">
    <XhAvatarRoot
      v-for="p in people"
      :key="p.text"
      :style="{ '--xh-avatar-bg': p.bg, '--xh-avatar-fg': p.fg }"
    >
      <XhAvatarImage />
      <XhAvatarFallback>{{ p.text }}</XhAvatarFallback>
    </XhAvatarRoot>

    <span style="font-size: 13px">底色与字色逐个给</span>
  </div>
</template>
```

```html
<!-- 直径与字号一起给，回退字才不会在大头像里显小 -->
<div style="display: flex; align-items: center; gap: 12px">
  <xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
    <span
      data-xh-part="root"
      style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px"
    >
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span
      data-xh-part="root"
      style="--xh-avatar-size: 56px; --xh-avatar-font-size: 20px"
    >
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦寒</span>
    </span>
  </xh-avatar>

  <span style="font-size: 13px">直径 56px</span>
</div>

<div style="display: flex; align-items: center; gap: 8px">
  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #fee2e2; --xh-avatar-fg: #b91c1c">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #dcfce7; --xh-avatar-fg: #15803d">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">寒</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #e0e7ff; --xh-avatar-fg: #4338ca">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">懿</span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root" style="--xh-avatar-bg: #fef3c7; --xh-avatar-fg: #b45309">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>

  <span style="font-size: 13px">底色与字色逐个给</span>
</div>
```

### 加载状态

status-change 在状态落位时通知，过渡态 idle 不通知；未提供地址等同于无法获取，直接落为 error 由回退接管

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const cases = [
  { key: "ok", src: "/images/demo-avatar.svg", alt: "曦寒", text: "曦", note: "地址有效" },
  { key: "bad", src: "/images/does-not-exist.svg", alt: "取不到的图", text: "回退", note: "地址取不到" },
  { key: "none", src: undefined, alt: undefined, text: "无图", note: "没给地址" },
];

const status = ref<Record<string, string>>({});

function record(key: string, details: { status: string }) {
  status.value[key] = details.status;
}
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div
      v-for="c in cases"
      :key="c.key"
      style="display: flex; align-items: center; gap: 10px"
    >
      <XhAvatarRoot :src="c.src" :alt="c.alt" @status-change="record(c.key, $event)">
        <XhAvatarImage />
        <XhAvatarFallback>{{ c.text }}</XhAvatarFallback>
      </XhAvatarRoot>
      <span style="font-size: 13px">{{ c.note }} → {{ status[c.key] ?? "等待中" }}</span>
    </div>
  </div>
</template>
```

```html
<div id="avatar-status" style="display: grid; gap: 10px">
  <div style="display: flex; align-items: center; gap: 10px">
    <xh-avatar src="/images/demo-avatar.svg" alt="曦寒">
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <span style="font-size: 13px">地址有效 → <span data-readout>等待中</span></span>
  </div>

  <div style="display: flex; align-items: center; gap: 10px">
    <xh-avatar src="/images/does-not-exist.svg" alt="取不到的图">
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">回退</span>
      </span>
    </xh-avatar>
    <span style="font-size: 13px">地址取不到 → <span data-readout>等待中</span></span>
  </div>

  <div style="display: flex; align-items: center; gap: 10px">
    <xh-avatar>
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">无图</span>
      </span>
    </xh-avatar>
    <span style="font-size: 13px">没给地址 → <span data-readout>等待中</span></span>
  </div>
</div>

<script type="module">
  // 每行的状态字跟着本行头像的 status-change 走
  for (const row of document.getElementById("avatar-status").children) {
    const readout = row.querySelector("[data-readout]");
    row.querySelector("xh-avatar").addEventListener("status-change", (event) => {
      readout.textContent = event.detail.status;
    });
  }
</script>
```

### 颜色

tone 改变淡底与回退文字的配色组；不写 tone 即中性默认，直径与字号都不受影响

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "曦" },
  { value: "neutral", label: "中" },
  { value: "success", label: "成" },
  { value: "warning", label: "警" },
  { value: "danger", label: "危" },
  { value: "info", label: "信" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
    <!-- 不写 tone 的那一枚：中性缺省 -->
    <XhAvatarRoot>
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot v-for="tone in tones" :key="tone.value" :tone="tone.value">
      <XhAvatarImage />
      <XhAvatarFallback>{{ tone.label }}</XhAvatarFallback>
    </XhAvatarRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
  <!-- 不写 tone 的那一枚：中性缺省 -->
  <xh-avatar>
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>

  <xh-avatar tone="brand">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar tone="neutral">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">中</span>
    </span>
  </xh-avatar>

  <xh-avatar tone="success">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">成</span>
    </span>
  </xh-avatar>

  <xh-avatar tone="warning">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">警</span>
    </span>
  </xh-avatar>

  <xh-avatar tone="danger">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">危</span>
    </span>
  </xh-avatar>

  <xh-avatar tone="info">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">信</span>
    </span>
  </xh-avatar>
</div>
```

## 设计指引

### 何时使用

- 在列表、评论、成员选择中标识身份。

### 何时不用

- 标识功能或分类时，使用[图标块](./icon-wrapper)。
- 只是展示一张图片时，使用[图片](./image)。

### 特性

- 加载状态通过回调通知；失败时自动显示 `fallback`。
- 直径与配色都是组件令牌，可逐实例覆盖。
- `tone` 切换淡底与回退文字的配色族；未设置时使用中性默认值。
- 状态点与角标由作者挂在外部，组件不预设。

### 组合

- 成组展示时使用[头像组](./avatar-group)；角标使用[徽标](./badge)。

### 最佳实践

- 回退内容应有意义：姓名缩写比通用人形图标携带更多信息。
- `alt` 写人名，不写“头像”。

### 反模式

- 只提供图片、不提供回退：图片失效后会留下空洞。
- 只用头像颜色编码身份而不提供文字。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar>` |
| Vue 组件 | `XhAvatarFallback` `XhAvatarImage` `XhAvatarRoot` |
| 组合式函数 | `useAvatar` |
| 状态机 | `avatarMachine` |
| 皮肤 | `@xihan-ui/styles/avatar.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  |  |
| `alt` | `string` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，默认 md；默认档不输出 data-size |
| `tone` | `Tone` |  | 颜色：决定底色与回退字使用哪组状态色；未提供时不输出 data-tone，使用皮肤的中性默认 |
| `onStatusChange` | `(details: AvatarStatusChangeDetails) => void` |  | 状态落定时通知，过渡态 idle 不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `AvatarStatusChangeDetails` | 加载状态变化；detail 为 `{ status: 'loading' \| 'loaded' \| 'error' }` |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `image` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `fallback` | 'idle' \| 'loading' \| 'loaded' \| 'error' |

以下名称仅用于内部状态机。

**状态**：`idle` · `loading` · `loaded` · `error`

**事件**：`SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR`

**判据**：`hasSrc`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `AvatarStatus` |  |
| `loaded` | `boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getFallbackProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/avatar.css` 使用 `[data-scope="avatar"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `root` | `data-tone` | props.tone |
| `image` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `fallback` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-avatar-bg` | `root` | `background` | `default`<br>`tone` | `--xh-_tone-subtle`<br>`--xh-bg-subtle-opaque` | avatar 的 root 部件 background 覆盖槽。 |
| `--xh-avatar-fg` | `root` | `color` | `default`<br>`tone` | `--xh-_tone-fg`<br>`--xh-fg-muted` | avatar 的 root 部件 color 覆盖槽。 |
| `--xh-avatar-font-size` | `root` | `font-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-caption-lg`<br>`--xh-control-caption-sm`<br>`--xh-text-secondary-size` | avatar 的 root 部件 font-size 覆盖槽。 |
| `--xh-avatar-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | avatar 的 root 部件 font-weight 覆盖槽。 |
| `--xh-avatar-radius` | `root` | `border-radius` | `default` | `--xh-shape-circle` | avatar 的 root 部件 border-radius 覆盖槽。 |
| `--xh-avatar-size` | `root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` | avatar 的 root 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
