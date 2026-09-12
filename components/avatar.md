来源：https://ui.docs.xihanfun.com/components/avatar

# Avatar `头像`

一个人或一个组织的圆形标识：优先显示图片，取不到就回退到文字或图标。

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
  <XhAvatarRoot src="/images/logo.png" alt="曦寒">
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
<xh-avatar src="/images/logo.png" alt="曦寒">
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

## 示例

### 加载失败回退

图片地址取不到时切到 fallback，切换由状态机决定而不是 CSS

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhAvatarRoot src="/images/does-not-exist.png" alt="取不到的图">
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
<xh-avatar src="/images/does-not-exist.png" alt="取不到的图">
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

### 排成一列

头像本身不管布局，叠放与间距由外层容器决定

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "XH"];
</script>

<template>
  <div style="display: flex">
    <XhAvatarRoot
      v-for="(m, i) in members"
      :key="m"
      :style="{ marginLeft: i ? '-8px' : '0', outline: '2px solid var(--vp-c-bg)', borderRadius: '999px' }"
    >
      <XhAvatarImage />
      <XhAvatarFallback>{{ m }}</XhAvatarFallback>
    </XhAvatarRoot>
  </div>
</template>
```

```html
<div style="display: flex">
  <xh-avatar>
    <span data-xh-part="root" style="outline: 2px solid var(--vp-c-bg); border-radius: 999px">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <xh-avatar>
    <span
      data-xh-part="root"
      style="margin-left: -8px; outline: 2px solid var(--vp-c-bg); border-radius: 999px"
    >
      <img data-xh-part="image" />
      <span data-xh-part="fallback">寒</span>
    </span>
  </xh-avatar>
  <xh-avatar>
    <span
      data-xh-part="root"
      style="margin-left: -8px; outline: 2px solid var(--vp-c-bg); border-radius: 999px"
    >
      <img data-xh-part="image" />
      <span data-xh-part="fallback">懿</span>
    </span>
  </xh-avatar>
  <xh-avatar>
    <span
      data-xh-part="root"
      style="margin-left: -8px; outline: 2px solid var(--vp-c-bg); border-radius: 999px"
    >
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
    </span>
  </xh-avatar>
</div>
```

### 尺寸

size 三档只换直径，回退字的字号跟着一起缩放；缺省档不输出 data-size

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 有图的一行：图片铺满 root，跟着三档一起缩放 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot size="sm" src="/images/logo.png" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot src="/images/logo.png" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarRoot size="lg" src="/images/logo.png" alt="曦寒">
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
  <xh-avatar size="sm" src="/images/logo.png" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <xh-avatar src="/images/logo.png" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>
  <xh-avatar size="lg" src="/images/logo.png" alt="曦寒">
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

圆角是一个组件令牌，整圆、圆角方、直角都是同一个槽位换值；图片的圆角从根继承，不用另设

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhAvatarRoot src="/images/logo.png" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot
      src="/images/logo.png"
      alt="曦寒"
      style="--xh-avatar-radius: var(--xh-radius-md)"
    >
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot
      src="/images/logo.png"
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
  <xh-avatar src="/images/logo.png" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar src="/images/logo.png" alt="曦寒">
    <span data-xh-part="root" style="--xh-avatar-radius: var(--xh-radius-md)">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
    </span>
  </xh-avatar>

  <xh-avatar src="/images/logo.png" alt="曦寒">
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

### 图标当回退

fallback 是普通插槽，放图标和放缩写字一样；没有名字可写时用图标表示「某位用户」

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

三档之外的直径、底色、字色各是一个组件令牌；按人名分配颜色就是逐个实例覆盖

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
      src="/images/logo.png"
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
  <xh-avatar src="/images/logo.png" alt="曦寒">
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

status-change 在状态落位时通知，过渡态 idle 不通知；没给地址等同于取不到，直接落 error 让回退接管

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const cases = [
  { key: "ok", src: "/images/logo.png", alt: "曦寒", text: "曦", note: "地址有效" },
  { key: "bad", src: "/images/does-not-exist.png", alt: "取不到的图", text: "回退", note: "地址取不到" },
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
    <xh-avatar src="/images/logo.png" alt="曦寒">
      <span data-xh-part="root">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <span style="font-size: 13px">地址有效 → <span data-readout>等待中</span></span>
  </div>

  <div style="display: flex; align-items: center; gap: 10px">
    <xh-avatar src="/images/does-not-exist.png" alt="取不到的图">
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

### 成组与溢出计数

组内共用的直径、字号、形状在容器上写一次，自定义属性沿继承流给每一枚；超出上限的收成一枚「+N」，它只是又一枚落回退态的头像

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "承", "临", "旭"];
const max = 4;

const shown = members.slice(0, max);
const rest = members.length - shown.length;

// 两组只差容器上的这几个槽位，组内的写法完全一样
const groups: { key: string; tokens: Record<string, string> }[] = [
  {
    key: "圆",
    tokens: { "--xh-avatar-size": "36px", "--xh-avatar-font-size": "14px" },
  },
  {
    key: "方",
    tokens: {
      "--xh-avatar-size": "26px",
      "--xh-avatar-font-size": "11px",
      "--xh-avatar-radius": "var(--xh-radius-md)",
    },
  },
];
</script>

<template>
  <div style="display: grid; gap: 16px">
    <div
      v-for="g in groups"
      :key="g.key"
      :style="{ display: 'flex', alignItems: 'center', ...g.tokens }"
    >
      <!-- 叠放是外层的事：后一枚往回挪一段，再描一圈底色把压住的边分开 -->
      <XhAvatarRoot
        v-for="(m, i) in shown"
        :key="m"
        :style="{ marginInlineStart: i ? '-10px' : '0', outline: '2px solid var(--vp-c-bg)' }"
      >
        <XhAvatarImage />
        <XhAvatarFallback>{{ m }}</XhAvatarFallback>
      </XhAvatarRoot>

      <!-- 计数格没有图，只写回退内容 -->
      <XhAvatarRoot
        v-if="rest > 0"
        style="
          margin-inline-start: -10px;
          outline: 2px solid var(--vp-c-bg);
          --xh-avatar-bg: var(--xh-bg-muted);
          --xh-avatar-fg: var(--xh-fg-muted);
        "
      >
        <XhAvatarFallback>+{{ rest }}</XhAvatarFallback>
      </XhAvatarRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <!-- 叠放是外层的事：后一枚往回挪一段，再描一圈底色把压住的边分开 -->
  <div
    style="
      display: flex;
      align-items: center;
      --xh-avatar-size: 36px;
      --xh-avatar-font-size: 14px;
    "
  >
    <xh-avatar>
      <span data-xh-part="root" style="outline: 2px solid var(--vp-c-bg)">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span
        data-xh-part="root"
        style="margin-inline-start: -10px; outline: 2px solid var(--vp-c-bg)"
      >
        <img data-xh-part="image" />
        <span data-xh-part="fallback">寒</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span
        data-xh-part="root"
        style="margin-inline-start: -10px; outline: 2px solid var(--vp-c-bg)"
      >
        <img data-xh-part="image" />
        <span data-xh-part="fallback">懿</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span
        data-xh-part="root"
        style="margin-inline-start: -10px; outline: 2px solid var(--vp-c-bg)"
      >
        <img data-xh-part="image" />
        <span data-xh-part="fallback">承</span>
      </span>
    </xh-avatar>
    <!-- 计数格没有图，只写回退内容 -->
    <xh-avatar>
      <span
        data-xh-part="root"
        style="
          margin-inline-start: -10px;
          outline: 2px solid var(--vp-c-bg);
          --xh-avatar-bg: var(--xh-bg-muted);
          --xh-avatar-fg: var(--xh-fg-muted);
        "
      >
        <span data-xh-part="fallback">+2</span>
      </span>
    </xh-avatar>
  </div>

  <div
    style="
      display: flex;
      align-items: center;
      --xh-avatar-size: 26px;
      --xh-avatar-font-size: 11px;
      --xh-avatar-radius: var(--xh-radius-md);
    "
  >
    <xh-avatar>
      <span data-xh-part="root" style="outline: 2px solid var(--vp-c-bg)">
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span
        data-xh-part="root"
        style="margin-inline-start: -10px; outline: 2px solid var(--vp-c-bg)"
      >
        <img data-xh-part="image" />
        <span data-xh-part="fallback">寒</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span
        data-xh-part="root"
        style="margin-inline-start: -10px; outline: 2px solid var(--vp-c-bg)"
      >
        <img data-xh-part="image" />
        <span data-xh-part="fallback">懿</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span
        data-xh-part="root"
        style="margin-inline-start: -10px; outline: 2px solid var(--vp-c-bg)"
      >
        <img data-xh-part="image" />
        <span data-xh-part="fallback">承</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span
        data-xh-part="root"
        style="
          margin-inline-start: -10px;
          outline: 2px solid var(--vp-c-bg);
          --xh-avatar-bg: var(--xh-bg-muted);
          --xh-avatar-fg: var(--xh-fg-muted);
        "
      >
        <span data-xh-part="fallback">+2</span>
      </span>
    </xh-avatar>
  </div>
</div>
```

### 挂状态点与角标

状态点自己绝对定位在根里；计数角标反过来——把头像写进角标的默认插槽，贴角与偏移都归角标算

```vue
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhBadge } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <!-- 状态点落在圆内，裁剪不用动 -->
    <XhAvatarRoot size="lg" src="/images/logo.png" alt="曦寒">
      <XhAvatarImage />
      <XhAvatarFallback>曦</XhAvatarFallback>
      <span
        role="img"
        aria-label="在线"
        style="
          position: absolute;
          inset-block-end: 2px;
          inset-inline-end: 2px;
          inline-size: 10px;
          block-size: 10px;
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-success);
        "
      />
    </XhAvatarRoot>

    <!-- 计数角标：被标记的头像写进默认插槽，贴哪个角、偏多少都归角标 -->
    <XhBadge :count="12" tone="danger" size="sm" label="12 条未读">
      <XhAvatarRoot size="lg" src="/images/logo.png" alt="曦寒">
        <XhAvatarImage />
        <XhAvatarFallback>曦</XhAvatarFallback>
      </XhAvatarRoot>
    </XhBadge>

    <!-- 落回退态时一样成立；点描一圈底色，压在头像边上也分得开 -->
    <XhAvatarRoot size="lg" style="overflow: visible">
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
      <span
        role="img"
        aria-label="离线"
        style="
          position: absolute;
          inset-block-end: 0;
          inset-inline-end: 0;
          inline-size: 12px;
          block-size: 12px;
          border: 2px solid var(--vp-c-bg);
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-disabled);
        "
      />
    </XhAvatarRoot>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 24px">
  <!-- 状态点落在圆内，裁剪不用动 -->
  <xh-avatar size="lg" src="/images/logo.png" alt="曦寒">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">曦</span>
      <span
        role="img"
        aria-label="在线"
        style="
          position: absolute;
          inset-block-end: 2px;
          inset-inline-end: 2px;
          inline-size: 10px;
          block-size: 10px;
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-success);
        "
      ></span>
    </span>
  </xh-avatar>

  <!-- 计数角标：被标记的头像写进默认插槽，贴哪个角、偏多少都归角标 -->
  <xh-badge count="12" tone="danger" size="sm" label="12 条未读">
    <span data-xh-part="root">
      <xh-avatar size="lg" src="/images/logo.png" alt="曦寒">
        <span data-xh-part="root">
          <img data-xh-part="image" />
          <span data-xh-part="fallback">曦</span>
        </span>
      </xh-avatar>
      <span data-xh-part="indicator"></span>
    </span>
  </xh-badge>

  <!-- 落回退态时一样成立；点描一圈底色，压在头像边上也分得开 -->
  <xh-avatar size="lg">
    <span data-xh-part="root" style="overflow: visible">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">XH</span>
      <span
        role="img"
        aria-label="离线"
        style="
          position: absolute;
          inset-block-end: 0;
          inset-inline-end: 0;
          inline-size: 12px;
          block-size: 12px;
          border: 2px solid var(--vp-c-bg);
          border-radius: var(--xh-shape-pill);
          background: var(--xh-fg-disabled);
        "
      ></span>
    </span>
  </xh-avatar>
</div>
```

### 语气

tone 换淡底与回退字的配色族；不写 tone 就是中性缺省，直径与字号都不受影响

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

- 列表、评论、成员选择里标识身份。

### 何时不用

- 标识的是一个功能或分类：用[图标块](./icon-wrapper)。
- 就是一张图：用[图片](./image)。

### 特性

- 加载状态会回调；失败时自动落到 `fallback`。
- 直径与配色都是组件令牌，可以逐实例覆盖。
- `tone` 换淡底与回退字的配色族；没写它时用中性缺省。
- 状态点与角标由作者挂在外面，组件不预设。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar>` |
| Vue 组件 | `XhAvatarFallback` `XhAvatarImage` `XhAvatarRoot` |
| 组合式函数 | `useAvatar` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/avatar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="avatar"`：`root` · `image` · **`fallback`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  |  |
| `alt` | `string` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，缺省 md；缺省档不输出 data-size |
| `tone` | `Tone` |  | 语气：决定底色与回退字用哪一族颜色；缺席即不输出 data-tone，走皮肤的中性缺省 |
| `onStatusChange` | `(details: AvatarStatusChangeDetails) => void` |  | 状态落位时通知，过渡态 idle 不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `AvatarStatusChangeDetails` | 加载状态变化；detail 为 `{ status: 'loading' \| 'loaded' \| 'error' }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `image` | state.get() |
| `fallback` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR`

**判据**：`hasSrc`

## connect API

`useAvatar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `AvatarStatus` |  |
| `loaded` | `boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getFallbackProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/avatar.css` 按部件选择：`[data-scope="avatar"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `image` | `data-state` | state.get() |
| `fallback` | `data-state` | state.get() |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-avatar-bg` | `root` | `background` | `default`<br>`tone` | `--xh-_tone-subtle`<br>`--xh-bg-subtle` | avatar 的 root 部件 background 覆盖槽。 |
| `--xh-avatar-fg` | `root` | `color` | `default`<br>`tone` | `--xh-_tone-fg`<br>`--xh-fg-muted` | avatar 的 root 部件 color 覆盖槽。 |
| `--xh-avatar-font-size` | `root` | `font-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-caption-lg`<br>`--xh-control-caption-sm`<br>`--xh-text-secondary-size` | avatar 的 root 部件 font-size 覆盖槽。 |
| `--xh-avatar-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | avatar 的 root 部件 font-weight 覆盖槽。 |
| `--xh-avatar-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` | avatar 的 root 部件 border-radius 覆盖槽。 |
| `--xh-avatar-size` | `root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` | avatar 的 root 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-fade-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 成组时套[头像组](./avatar-group)；角标用[徽标](./badge)。

## 最佳实践

- 回退内容要有意义：姓名缩写比一个通用小人图标信息量大得多。
- `alt` 写人名，别写"头像"。

## 反模式

- 只靠图片、不给回退：图挂了就是一个空洞。
- 用头像颜色编码身份而不给文字。
