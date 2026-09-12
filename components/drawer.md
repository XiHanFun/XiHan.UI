来源：https://ui.docs.xihanfun.com/components/drawer

# Drawer `抽屉`

从屏幕某一边滑出的面板。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/drawer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/drawer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/drawer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/drawer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/drawer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Escape 关闭、Tab 在面板里循环，展开期间页面滚不动

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDrawerRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDrawerTrigger>打开抽屉</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerTitle>筛选条件</XhDrawerTitle>
      <XhDrawerDescription>
        面板贴住右边，这是 side 的默认值。
      </XhDrawerDescription>
      <XhButton variant="solid" @click="setOpen(false)">应用并关闭</XhButton>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
```

```html
<xh-drawer id="drawer-basic">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开抽屉</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">筛选条件</h2>
        <p data-xh-part="description">面板贴住右边，这是 side 的默认值。</p>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>应用并关闭</button>
        </xh-button>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const drawer = document.getElementById("drawer-basic");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  // 面板里那颗按钮把关闭转交给已接线的关闭部件
  const close = drawer.querySelector('[data-xh-part="close-trigger"]');
  for (const button of drawer.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

## 示例

### 贴边方向

side 只落成 data-side，面板压在哪条边由皮肤按这个值决定；root 与 content 报的是同一条边

```vue
<script setup lang="ts">
import {
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

const sides = [
  { value: "left", label: "左侧" },
  { value: "right", label: "右侧" },
  { value: "top", label: "顶部" },
  { value: "bottom", label: "底部" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhDrawerRoot
      v-for="s in sides"
      :key="s.value"
      v-slot="{ side }"
      :side="s.value"
      :translations="{ close: '关闭' }"
    >
      <XhDrawerTrigger>{{ s.label }}</XhDrawerTrigger>
      <XhDrawerContent>
        <XhDrawerTitle>{{ s.label }}抽屉</XhDrawerTitle>
        <XhDrawerDescription>
          当前 data-side 是 {{ side }}。
        </XhDrawerDescription>
        <XhDrawerCloseTrigger />
      </XhDrawerContent>
    </XhDrawerRoot>
  </div>
</template>
```

```html
<div id="drawer-sides" style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-drawer side="left">
    <div data-xh-part="root">
      <button data-xh-part="trigger">左侧</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">左侧抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 left。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer side="right">
    <div data-xh-part="root">
      <button data-xh-part="trigger">右侧</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">右侧抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 right。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer side="top">
    <div data-xh-part="root">
      <button data-xh-part="trigger">顶部</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">顶部抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 top。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer side="bottom">
    <div data-xh-part="root">
      <button data-xh-part="trigger">底部</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">底部抽屉</h2>
          <p data-xh-part="description">当前 data-side 是 bottom。</p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>
</div>

<script type="module">
  // 文案是对象，只走 property
  for (const drawer of document.getElementById("drawer-sides").children) {
    drawer.translations = { close: "关闭" };
  }
</script>
```

### 受控

传了 open 就由宿主说了算；Escape、点面板外、按叉都只回写 open，不自己改状态

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <XhDrawerRoot v-model:open="open" side="left" :translations="{ close: '关闭' }">
    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton variant="solid" @click="open = true">打开左侧抽屉</XhButton>
      <span>当前：{{ open ? "展开" : "收起" }}</span>
    </div>
    <XhDrawerContent>
      <XhDrawerTitle>受控抽屉</XhDrawerTitle>
      <XhDrawerDescription>
        这里没有 trigger，开合完全跟着外面那颗按钮与 open 走。
      </XhDrawerDescription>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
```

```html
<xh-drawer id="drawer-controlled" open="false" side="left">
  <div data-xh-part="root">
    <div style="display: flex; align-items: center; gap: 12px">
      <xh-button id="drawer-controlled-open" variant="solid">
        <button data-xh-part="root">打开左侧抽屉</button>
      </xh-button>
      <span id="drawer-controlled-state">当前：收起</span>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">受控抽屉</h2>
        <p data-xh-part="description">
          这里没有 trigger，开合完全跟着外面那颗按钮与 open 走。
        </p>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const drawer = document.getElementById("drawer-controlled");
  const button = document.getElementById("drawer-controlled-open");
  const state = document.getElementById("drawer-controlled-state");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  function setOpen(next) {
    drawer.open = next;
    state.textContent = `当前：${next ? "展开" : "收起"}`;
  }

  button.addEventListener("click", () => setOpen(true));
  drawer.addEventListener("open-change", (event) => setOpen(event.detail.open));
</script>
```

### 尺寸

size 落成 content 的 data-size，只改面板贴边方向上的厚度；三档各自一个抽屉，点开才看得出厚薄

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

// 中间档不传 size，缺省即中档
const sizes = [
  { key: "sm", size: "sm", label: "sm 薄" },
  { key: "md", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg 厚" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhDrawerRoot
      v-for="s in sizes"
      :key="s.key"
      v-slot="{ setOpen }"
      :size="s.size"
      :translations="{ close: '关闭' }"
    >
      <XhDrawerTrigger>{{ s.label }}</XhDrawerTrigger>
      <XhDrawerContent>
        <XhDrawerTitle>{{ s.label }}抽屉</XhDrawerTitle>
        <XhDrawerDescription>
          面板贴住右边，三档只有厚度不同。
        </XhDrawerDescription>
        <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
        <XhDrawerCloseTrigger />
      </XhDrawerContent>
    </XhDrawerRoot>
  </div>
</template>
```

```html
<div id="drawer-sizes" style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-drawer size="sm">
    <div data-xh-part="root">
      <button data-xh-part="trigger">sm 薄</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">sm 薄抽屉</h2>
          <p data-xh-part="description">面板贴住右边，三档只有厚度不同。</p>
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>关闭</button>
          </xh-button>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <!-- 这一档不写 size，落在中档 -->
  <xh-drawer>
    <div data-xh-part="root">
      <button data-xh-part="trigger">缺省</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">缺省抽屉</h2>
          <p data-xh-part="description">面板贴住右边，三档只有厚度不同。</p>
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>关闭</button>
          </xh-button>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>

  <xh-drawer size="lg">
    <div data-xh-part="root">
      <button data-xh-part="trigger">lg 厚</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">lg 厚抽屉</h2>
          <p data-xh-part="description">面板贴住右边，三档只有厚度不同。</p>
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>关闭</button>
          </xh-button>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>
</div>

<script type="module">
  for (const drawer of document.getElementById("drawer-sizes").children) {
    // 文案是对象，只走 property
    drawer.translations = { close: "关闭" };
    // 面板里那颗按钮把关闭转交给已接线的关闭部件
    const close = drawer.querySelector('[data-xh-part="close-trigger"]');
    for (const button of drawer.querySelectorAll("[data-dismiss]")) {
      button.addEventListener("click", () => close.click());
    }
  }
</script>
```

### 头尾固定、正文滚动

header / body / footer 把面板切成三段：头与尾定在原处，只有正文那一段在滚

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDrawerBody,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerFooter,
  XhDrawerHeader,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";

const records = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  text: `第 ${i + 1} 条操作记录`,
}));
</script>

<template>
  <XhDrawerRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDrawerTrigger>查看操作记录</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerHeader>
        <XhDrawerTitle>操作记录</XhDrawerTitle>
        <XhDrawerDescription>共 {{ records.length }} 条，往下翻。</XhDrawerDescription>
      </XhDrawerHeader>
      <XhDrawerBody>
        <p
          v-for="r in records"
          :key="r.id"
          style="
            margin: 0;
            padding: 8px 0;
            border-block-end: 1px solid var(--xh-border-subtle);
          "
        >
          {{ r.text }}
        </p>
      </XhDrawerBody>
      <XhDrawerFooter>
        <XhButton variant="solid" @click="setOpen(false)">看完了</XhButton>
      </XhDrawerFooter>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
```

```html
<xh-drawer id="drawer-scroll">
  <div data-xh-part="root">
    <button data-xh-part="trigger">查看操作记录</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <header data-xh-part="header">
          <h2 data-xh-part="title">操作记录</h2>
          <p data-xh-part="description">共 24 条，往下翻。</p>
        </header>
        <div data-xh-part="body" id="drawer-scroll-records"></div>
        <footer data-xh-part="footer">
          <xh-button variant="solid">
            <button data-xh-part="root" data-dismiss>看完了</button>
          </xh-button>
        </footer>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const drawer = document.getElementById("drawer-scroll");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  // 24 条记录填进正文那一段
  const records = document.getElementById("drawer-scroll-records");
  for (let i = 1; i <= 24; i++) {
    const line = document.createElement("p");
    line.style.margin = "0";
    line.style.padding = "8px 0";
    line.style.borderBlockEnd = "1px solid var(--xh-border-subtle)";
    line.textContent = `第 ${i} 条操作记录`;
    records.append(line);
  }

  // 面板里那颗按钮把关闭转交给已接线的关闭部件
  const close = drawer.querySelector('[data-xh-part="close-trigger"]');
  for (const button of drawer.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

### 关闭前拦截

受控时组件不自改状态：Escape、点面板外、按叉都只发一次收起意图，写不写由宿主定

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
const asking = ref(false);

// 展开意图照单全收，收起意图先扣下来，等下面那两颗按钮表态
function onOpenChange(details: { open: boolean }) {
  asking.value = !details.open;
  if (details.open)
    open.value = true;
}

function discard() {
  asking.value = false;
  open.value = false;
}
</script>

<template>
  <XhDrawerRoot :open="open" :translations="{ close: '关闭' }" @open-change="onOpenChange">
    <XhDrawerTrigger>编辑草稿</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerTitle>编辑草稿</XhDrawerTitle>
      <XhDrawerDescription>
        这里假定草稿一直有未保存的改动，任何一次收起意图都要先问一句。
      </XhDrawerDescription>
      <p style="margin: 0">
        {{ asking ? "改动还没保存，确定丢掉吗？" : "试试按 Escape、点面板外，或者按右上角的叉。" }}
      </p>
      <div v-if="asking" style="display: flex; gap: 8px">
        <XhButton variant="outline" @click="asking = false">继续编辑</XhButton>
        <XhButton variant="solid" @click="discard">丢弃并关闭</XhButton>
      </div>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
```

```html
<xh-drawer id="drawer-guard" open="false">
  <div data-xh-part="root">
    <button data-xh-part="trigger">编辑草稿</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">编辑草稿</h2>
        <p data-xh-part="description">
          这里假定草稿一直有未保存的改动，任何一次收起意图都要先问一句。
        </p>
        <p id="drawer-guard-notice" style="margin: 0">
          试试按 Escape、点面板外，或者按右上角的叉。
        </p>
        <div id="drawer-guard-actions" style="display: none; gap: 8px">
          <xh-button id="drawer-guard-keep" variant="outline">
            <button data-xh-part="root">继续编辑</button>
          </xh-button>
          <xh-button id="drawer-guard-discard" variant="solid">
            <button data-xh-part="root">丢弃并关闭</button>
          </xh-button>
        </div>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const drawer = document.getElementById("drawer-guard");
  const notice = document.getElementById("drawer-guard-notice");
  const actions = document.getElementById("drawer-guard-actions");
  const keep = document.getElementById("drawer-guard-keep");
  const discard = document.getElementById("drawer-guard-discard");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  function ask(on) {
    actions.style.display = on ? "flex" : "none";
    notice.textContent = on
      ? "改动还没保存，确定丢掉吗？"
      : "试试按 Escape、点面板外，或者按右上角的叉。";
  }

  // 展开意图照单全收，收起意图先扣下来，等下面那两颗按钮表态
  drawer.addEventListener("open-change", (event) => {
    ask(!event.detail.open);
    if (event.detail.open) {
      drawer.open = true;
    }
  });

  keep.addEventListener("click", () => ask(false));
  discard.addEventListener("click", () => {
    ask(false);
    drawer.open = false;
  });
</script>
```

### 拖边缘改厚度

面板里放一根把手，拖动时把新厚度写进 content 的 --xh-drawer-size；这个槽压过 size 三档，滑入滑出仍按面板自身宽度算

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const MIN = 260;
const MAX = 560;

const width = ref(0);
const dragging = ref(false);
let panel: HTMLElement | null = null;

function begin(event: PointerEvent): void {
  const handle = event.currentTarget as HTMLElement;
  panel = handle.closest<HTMLElement>("[data-scope=\"drawer\"][data-part=\"content\"]");
  if (!panel)
    return;
  dragging.value = true;
  // 起点取面板当前的实际厚度
  width.value = Math.round(panel.getBoundingClientRect().width);
  handle.setPointerCapture(event.pointerId);
}

function move(event: PointerEvent): void {
  if (!dragging.value || !panel)
    return;
  // 面板贴右边，厚度就是视口右缘到指针的距离
  width.value = Math.round(Math.min(MAX, Math.max(MIN, window.innerWidth - event.clientX)));
  panel.style.setProperty("--xh-drawer-size", `${width.value}px`);
}

function end(event: PointerEvent): void {
  if (!dragging.value)
    return;
  dragging.value = false;
  panel = null;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
}
</script>

<template>
  <XhDrawerRoot v-slot="{ setOpen }" :translations="{ close: '关闭' }">
    <XhDrawerTrigger>打开可调宽的抽屉</XhDrawerTrigger>
    <XhDrawerContent>
      <div
        style="
          position: absolute;
          inset-block: 0;
          inset-inline-start: 0;
          inline-size: 8px;
          cursor: ew-resize;
          touch-action: none;
        "
        @pointerdown="begin"
        @pointermove="move"
        @pointerup="end"
        @pointercancel="end"
      />
      <XhDrawerTitle>字段设置</XhDrawerTitle>
      <XhDrawerDescription>
        拖面板左边缘，厚度在 {{ MIN }} 到 {{ MAX }} 像素之间取值。
      </XhDrawerDescription>
      <p style="margin: 0; color: var(--xh-fg-muted)">
        当前厚度：{{ width ? `${width} px` : "默认" }}
      </p>
      <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
      <XhDrawerCloseTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
```

```html
<xh-drawer id="drawer-resize">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开可调宽的抽屉</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div
          id="drawer-resize-handle"
          style="
            position: absolute;
            inset-block: 0;
            inset-inline-start: 0;
            inline-size: 8px;
            cursor: ew-resize;
            touch-action: none;
          "
        ></div>
        <h2 data-xh-part="title">字段设置</h2>
        <p data-xh-part="description">
          拖面板左边缘，厚度在 260 到 560 像素之间取值。
        </p>
        <p id="drawer-resize-readout" style="margin: 0; color: var(--xh-fg-muted)">
          当前厚度：默认
        </p>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>关闭</button>
        </xh-button>
        <button data-xh-part="close-trigger"></button>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  const MIN = 260;
  const MAX = 560;

  const drawer = document.getElementById("drawer-resize");
  const handle = document.getElementById("drawer-resize-handle");
  const readout = document.getElementById("drawer-resize-readout");
  // 文案是对象，只走 property
  drawer.translations = { close: "关闭" };

  let panel = null;

  handle.addEventListener("pointerdown", (event) => {
    panel = handle.closest('[data-scope="drawer"][data-part="content"]');
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!panel) {
      return;
    }
    // 面板贴右边，厚度就是视口右缘到指针的距离
    const width = Math.round(
      Math.min(MAX, Math.max(MIN, window.innerWidth - event.clientX)),
    );
    panel.style.setProperty("--xh-drawer-size", `${width}px`);
    readout.textContent = `当前厚度：${width} px`;
  });

  function end(event) {
    if (!panel) {
      return;
    }
    panel = null;
    handle.releasePointerCapture(event.pointerId);
  }

  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);

  // 面板里那颗按钮把关闭转交给已接线的关闭部件
  const close = drawer.querySelector('[data-xh-part="close-trigger"]');
  for (const button of drawer.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

### 局部抽屉

把抽屉收进某块区域：遮罩与定位层从 fixed 换成 absolute，只罩住那块区域而不是盖满整屏

```vue
<script setup lang="ts">
import {
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 容器要自己带 position，否则 absolute 会往上找到别的定位祖先
const panel = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="panel"
    style="
      position: relative;
      overflow: hidden;
      block-size: 200px;
      padding: 16px;
      border: 1px solid var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
    "
  >
    <p style="margin: 0 0 12px">
      这块区域就是抽屉的容器：展开时遮罩只盖住它，页面其余部分照常可点。
    </p>

    <XhDrawerRoot :container="panel ?? undefined" side="right" size="sm">
      <XhDrawerTrigger>在这块区域里展开</XhDrawerTrigger>
      <XhDrawerContent>
        <XhDrawerTitle>局部抽屉</XhDrawerTitle>
        <XhDrawerDescription>
          它贴的是这个容器的右沿，不是视口的右沿。
        </XhDrawerDescription>
        <XhDrawerCloseTrigger />
      </XhDrawerContent>
    </XhDrawerRoot>
  </div>

  <p style="font-size: 13px">
    不给 container 时问全局配置的 portalContainer，再没有才落 body——整屏抽屉与从前一模一样。
  </p>
</template>
```

```html
<!-- 容器要自己带 position，否则 absolute 会往上找到别的定位祖先 -->
<div
  style="
    position: relative;
    overflow: hidden;
    block-size: 200px;
    padding: 16px;
    border: 1px solid var(--xh-border-default);
    border-radius: var(--xh-shape-surface);
  "
>
  <p style="margin: 0 0 12px">
    这块区域就是抽屉的容器：展开时遮罩只盖住它，页面其余部分照常可点。
  </p>

  <xh-drawer id="drawer-contained" contained side="right" size="sm">
    <div data-xh-part="root">
      <button data-xh-part="trigger">在这块区域里展开</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">局部抽屉</h2>
          <p data-xh-part="description">
            它贴的是这个容器的右沿，不是视口的右沿。
          </p>
          <button data-xh-part="close-trigger"></button>
        </div>
      </div>
    </div>
  </xh-drawer>
</div>

<p style="font-size: 13px">
  不写 contained 时遮罩与定位层还是 fixed，抽屉照旧铺满整屏——浮层写在哪里就在哪里，
  自定义元素这一侧没有搬运这一步。
</p>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("drawer-contained").translations = { close: "关闭" };
</script>
```

## 设计指引

### 何时使用

- 内容比对话框长（一整张表单、一份详情），但仍属于当前上下文。
- 窄屏上的导航或筛选面板。

### 何时不用

- 只是确认一件事：用[对话框](./dialog)或[弹出确认](./popconfirm)。
- 内容需要与页面主体对照着看：并排展开，别遮住。

### 特性

- `side` 决定从哪一边出来；`contained` 让它只占据某个容器而不是整个视口。
- `modal=false` 时不渲染遮罩，定位层也不截获页面指针；页面可以与抽屉并行交互。展开期间切换 `modal`，滚动锁、背景失活与焦点陷阱会同步切换。
- 可以拖边缘改厚度。
- 关闭时内容立即失活并退出可访问树；面板与遮罩全部完成退场后释放模态资源并发出 `onExitComplete` / `exit-complete`。退场中重开不会被旧完成关闭，卸载立即清理。
- 关闭前可以拦截（有未保存改动时先问一句）。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-drawer>` |
| Vue 组件 | `XhDrawerBody` `XhDrawerCloseTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerFooter` `XhDrawerHeader` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| 组合式函数 | `useDrawer` |
| 状态机 | `drawerMachine` |
| 皮肤 | `@xihan-ui/styles/drawer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="drawer"`：**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `header` · `title` · `description` · `body` · `footer` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  | 是否启用模态约束，默认 true。false 时不提供遮罩，页面其余部分保持可交互； 展开期间可以切换，滚动锁、背景失活与焦点陷阱会同步更新。 |
| `contained` | `boolean` |  | 浮层挂在某个局部容器里而不是视口：遮罩与定位层从 fixed 换成 absolute， 于是只罩住那个容器、不再盖满整屏。 挂到哪个容器是适配器的事（Vue 由 root 的 container 决定，WC 本就是 Light DOM、 作者写在哪就在哪），这里只表达「按局部容器画」这一件事。 |
| `side` | `DrawerSide` |  | 从哪条边滑出，默认 'right'。只影响输出的 data-side，不参与状态转移。 |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。横放时换面板宽度、竖放时换面板高度，随 side 而定。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 |
| `translations` | `Partial<DrawerTranslations>` |  |  |
| `onOpenChange` | `(details: DrawerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onExitComplete` | `() => void` |  | 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `exit-complete` | `CustomEvent` | 退出完成且本层资源已释放 |
| `open-change` | `DrawerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDrawerRoot` | `default` | `DrawerRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useDrawer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `side` | `DrawerSide` | 已解析的滑出边（prop 缺省时是默认值），作者据此配动画。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开抽屉并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | props.role |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/drawer.css` 按部件选择：`[data-scope="drawer"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-contained` | ''（条件成立时才出现） |
| `root` | `data-side` | props.side |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-contained` | ''（条件成立时才出现） |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-contained` | ''（条件成立时才出现） |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-contained` | ''（条件成立时才出现） |
| `content` | `data-side` | props.side |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-drawer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | drawer 的 backdrop 部件 background 覆盖槽。 |
| `--xh-drawer-backdrop-blur` | `backdrop` | `backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | drawer 的 backdrop 部件 backdrop-filter 覆盖槽。 |
| `--xh-drawer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | drawer 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-drawer-bg` | `content` | `background` | `default` | `--xh-bg-surface` | drawer 的 content 部件 background 覆盖槽。 |
| `--xh-drawer-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | drawer 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-close-bg-hover` | `close-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | drawer 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-fg-hover` | `close-trigger` | `color` | `hover` | `--xh-fg-default` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-drawer-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='drawer'][data-part='close-trigger'])` | `--xh-control-h-sm` | drawer 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-drawer-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | drawer 的 description 部件 color 覆盖槽。 |
| `--xh-drawer-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` | drawer 的 description 部件 font-size 覆盖槽。 |
| `--xh-drawer-fg` | `content` | `color` | `default` | `--xh-fg-default` | drawer 的 content 部件 color 覆盖槽。 |
| `--xh-drawer-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | drawer 的 footer 部件 gap 覆盖槽。 |
| `--xh-drawer-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | drawer 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-drawer-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | drawer 的 content 部件 gap 覆盖槽。 |
| `--xh-drawer-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | drawer 的 header 部件 gap 覆盖槽。 |
| `--xh-drawer-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | drawer 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-drawer-icon-size` | `content`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | drawer 的 content、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-drawer-layer` | `content`<br>`positioner` | `z-index` | `default` | `--xh-_layer` | drawer 的 content、positioner 部件 z-index 覆盖槽。 |
| `--xh-drawer-px` | `content` | `padding-inline` | `contained`<br>`default` | `--xh-surface-px-md` | drawer 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-py` | `content` | `padding-block-end`<br>`padding-block-start` | `contained`<br>`default` | `--xh-surface-py-md` | drawer 的 content 部件 padding-block-end、padding-block-start 覆盖槽。 |
| `--xh-drawer-radius` | `content` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-shape-surface` | drawer 的 content 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-drawer-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-sheet` | drawer 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-drawer-size` | `content` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-_drawer-size` | drawer 的 content 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | drawer 的 title 部件 color 覆盖槽。 |
| `--xh-drawer-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | drawer 的 title 部件 font-size 覆盖槽。 |
| `--xh-drawer-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | drawer 的 title 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-bg` | `trigger` | `background` | `default` | `--xh-bg-canvas` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-bg-active` | `trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-bg-hover` | `trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-bg-open` | `trigger` | `background` | `state=open` | `--xh-bg-subtle-active` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-border` | `trigger` | `border` | `default` | `--xh-border-control` | drawer 的 trigger 部件 border 覆盖槽。 |
| `--xh-drawer-trigger-border-hover` | `trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-border-control-hover` | drawer 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-open` | `trigger` | `border-color` | `state=open` | `--xh-border-control-hover` | drawer 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-drawer-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | drawer 的 trigger 部件 color 覆盖槽。 |
| `--xh-drawer-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-label-size` | drawer 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-drawer-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | drawer 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | drawer 的 trigger 部件 gap 覆盖槽。 |
| `--xh-drawer-trigger-h` | `trigger` | `block-size` | `default` | `--xh-control-h-md` | drawer 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-drawer-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-control-px-md` | drawer 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-drawer-in-bottom` · `xh-drawer-in-left` · `xh-drawer-in-right` · `xh-drawer-in-top` · `xh-drawer-out-bottom` · `xh-drawer-out-left` · `xh-drawer-out-right` · `xh-drawer-out-top` · `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 里面放[表单](./form)、[侧栏导航](./side-nav)；内容区套[滚动区域](./scroll-area)。

## 最佳实践

- 提交与取消固定在底部，别让用户滚到最下面才找得到。
- 有未保存改动时拦下关闭。

## 反模式

- 抽屉里再开抽屉。
- 在宽屏上用抽屉装本可以直接展开的内容。
