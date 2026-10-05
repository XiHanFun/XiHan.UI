来源：https://ui.docs.xihanfun.com/components/drawer

# Drawer 抽屉

从屏幕某一边滑出的面板。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/drawer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/drawer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/drawer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/drawer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/drawer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Escape 关闭、Tab 在面板内循环，展开期间页面不可滚动

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

## 组件结构

加粗的是必需部件。

`data-scope="drawer"`：**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `header` · `title` · `description` · `body` · `footer` · `close-trigger` · `resize-trigger`

## 示例

### 贴边方向

side 只写为 data-side，面板贴在哪条边由皮肤按该值决定；root 与 content 报告的是同一条边

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

传入 open 后由宿主决定；Escape、点击面板外、按关闭按钮都只回写 open，不自行修改状态

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

size 写为 content 的 data-size，只改变面板贴边方向上的厚度；三档各自一个抽屉，打开后才可见厚度差异

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

header / body / footer 把面板切为三段：头与尾固定在原处，只有正文一段滚动

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

受控时组件不自行修改状态：Escape、点击面板外、按关闭按钮都只发一次收起意图，是否写回由宿主决定

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

### 调整厚度

resizable 在朝向页面的那条边上放一根把手：拖动或用方向键推，厚度夹在 minPanelSize 与 maxPanelSize 之间；受控的 panelSize 读写当前厚度

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerResizeTrigger,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const panelSize = ref<number>();
</script>

<template>
  <XhDrawerRoot
    v-slot="{ setOpen }"
    v-model:panel-size="panelSize"
    resizable
    :min-panel-size="260"
    :max-panel-size="560"
    :translations="{ close: '关闭', resizeTrigger: '调整抽屉宽度' }"
  >
    <XhDrawerTrigger>打开可调宽的抽屉</XhDrawerTrigger>
    <XhDrawerContent>
      <XhDrawerTitle>字段设置</XhDrawerTitle>
      <XhDrawerDescription>拖面板左边缘，或聚焦把手后按方向键；Home / End 推到最窄与最宽。</XhDrawerDescription>
      <p style="margin: 0; color: var(--xh-fg-muted)">当前厚度：{{ panelSize ? `${panelSize} px` : "默认" }}</p>
      <XhButton variant="solid" @click="setOpen(false)">关闭</XhButton>
      <XhDrawerCloseTrigger />
      <XhDrawerResizeTrigger />
    </XhDrawerContent>
  </XhDrawerRoot>
</template>
```

```html
<xh-drawer id="drawer-resize" resizable min-panel-size="260" max-panel-size="560">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开可调宽的抽屉</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">字段设置</h2>
        <p data-xh-part="description">拖面板左边缘，或聚焦把手后按方向键；Home / End 推到最窄与最宽。</p>
        <p id="drawer-resize-readout" style="margin: 0; color: var(--xh-fg-muted)">当前厚度：默认</p>
        <xh-button variant="solid">
          <button data-xh-part="root" data-dismiss>关闭</button>
        </xh-button>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="resize-trigger"></div>
      </div>
    </div>
  </div>
</xh-drawer>

<script type="module">
  // 文案是对象，只能走 property；厚度意图写回 panel-size，回显同步刷新
  const drawer = document.getElementById("drawer-resize");
  drawer.translations = { close: "关闭", resizeTrigger: "调整抽屉宽度" };
  const readout = document.getElementById("drawer-resize-readout");
  const close = drawer.querySelector('[data-xh-part="close-trigger"]');
  drawer.addEventListener("panel-size-change", (event) => {
    drawer.panelSize = event.detail.panelSize;
    readout.textContent = `当前厚度：${event.detail.panelSize} px`;
  });
  for (const button of drawer.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }
</script>
```

### 局部抽屉

把抽屉收进某块区域：遮罩与定位层从 fixed 换为 absolute，只覆盖该区域而不是整屏

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

- 内容比对话框长（完整表单、详情），但仍属于当前上下文。
- 窄屏上的导航或筛选面板。

### 何时不用

- 只确认一件事时，使用[对话框](./dialog)或[弹出确认](./popconfirm)。
- 内容需要与页面主体对照查看时，并排展开，不遮挡。

### 特性

- `side` 决定滑出方向；`contained` 让它只占据某个容器而不是整个视口。
- 焦点进入时落在 `initialFocus`；没给时落在内容里第一个可聚焦的控件上，越过关闭钮与改尺把手（除它们之外没有可聚焦的才落在关闭钮上）。关闭后归还触发器。
- `modal=false` 时不渲染遮罩，定位层也不截获页面指针；页面可以与抽屉并行交互。展开期间切换 `modal`，滚动锁、背景失活与焦点陷阱会同步切换。
- `resizable` 在朝向页面的那条边上放一根改尺把手（`resize-trigger`，role=separator）：拖动它面板沿贴边方向变宽（左右放置）或变高（上下放置），聚焦后方向键推一步（8px）、Shift 大步（40px）、Home / End 推到下限与上限。推向页面那一侧变厚：从右往左排版时 `right` 贴在屏幕左边，把手与推的方向一起翻过来。厚度夹在 `minPanelSize`（缺省 160）与 `maxPanelSize` 之间，且不超出视口（`contained` 时是所在容器）。`panelSize` / `defaultPanelSize` / `onPanelSizeChange` 走受控与非受控；没调过时面板按 `size` 档绘制。拖动走 `@xihan-ui/pointer` 的指针会话，步长与 Resizable 同一档。把手是 content 里的绝对定位节点，content 自己滚动（不用 body 段）时它会随内容滚走，长内容请放进 body。
- 关闭时内容立即失活并退出可访问树；面板与遮罩全部完成退场后释放模态资源并发出 `onExitComplete` / `exit-complete`。退场中重开不会被旧完成关闭，卸载立即清理。
- 内容第一次打开才挂载，缺省在退场动画播完后卸载、下次打开重新挂载。反复开合而内容又重时（设置面板、长表单）把 `unmountOnExit` 设为 false：打开过之后收起只隐藏——定位层以内联 `display: none` 收起、遮罩不留、Portal 视觉桥断开——面板里的组件状态、输入与滚动位置都留着，再打开不必重挂。Web Components 的作者节点一向常驻；写进 content 里一个 `<template>` 的内容按同一规则挂卸：第一次打开克隆，缺省退场播完撤走，`unmount-on-exit="false"` 时克隆一次之后常驻。
- 关闭前可以拦截，例如有未保存改动时先确认。
- 面板走 M4 sheet 三件套（1px 描边、不透明底、投影），边界由描边承担，不只靠影分层；入场是整面板从画外推入的大尺度位移，走 slide 时长与曲线，退场仍走 exit 档。
- 触发器与关闭按钮走 Action Control 家族配方：触发器为 text 档中性描边，展开期间压住为悬停同档的中性面；关闭按钮为 icon 档 ghost 面，悬停与按下沿画布承载阶梯换底；Space / Enter 与触屏按住期间投影 `data-pressed`。标题为 heading-3，说明文字为 13px 说明档。
- Body 是模态滚动面：滚到头不带动页面，内容高度变化时保留稳定的滚动条空道；不用三段结构时 content 自身是唯一滚动层。

### 组合

- 内部放[表单](./form)、[侧栏导航](./side-nav)；内容区使用[滚动区域](./scroll-area)。

### 最佳实践

- 提交与取消固定在底部，用户不需要滚动到底部查找。
- 有未保存改动时拦截关闭。

### 反模式

- 在抽屉内再打开抽屉。
- 在宽屏上用抽屉承载可以直接展开的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-drawer>` |
| Vue 组件 | `XhDrawerBody` `XhDrawerCloseTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerFooter` `XhDrawerHeader` `XhDrawerResizeTrigger` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| 组合式函数 | `useDrawer` |
| 状态机 | `drawerMachine` |
| 皮肤 | `@xihan-ui/styles/drawer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  | 是否启用模态约束，默认 true。false 时不提供遮罩，页面其余部分保持可交互； 展开期间可以切换，滚动锁、背景失活与焦点陷阱会同步更新。 |
| `contained` | `boolean` |  | 浮层挂在局部容器中而不是视口：遮罩与定位层从 fixed 改为 absolute， 因此只覆盖该容器、不再覆盖整屏。 挂到哪个容器由适配器决定（Vue 由 root 的 container 决定，WC 本身是 Light DOM、 作者写在何处即在何处），这里只表达按局部容器绘制这一点。 |
| `side` | `DrawerSide` |  | 滑出的边，默认 'right'。只影响输出的 data-side，不参与状态转移。 |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。横向放置时影响面板宽度、纵向放置时影响面板高度，随 side 而定。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 |
| `unmountOnExit` | `boolean` |  | 收起动画播完后卸载内容，默认 true。内容总是第一次打开才挂载；设为 false 时此后收起只隐藏、不卸载， 再打开不重挂：内容里的组件状态、输入与滚动位置都留着，重开也不再付一遍挂载开销。 适合反复开合、内容又重（设置面板、长表单）的抽屉。 |
| `translations` | `Partial<DrawerTranslations>` |  |  |
| `onOpenChange` | `(details: DrawerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onExitComplete` | `() => void` |  | 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 |
| `resizable` | `boolean` |  | 可调厚度：朝向页面的那条边上的 resize-trigger 拖动或用方向键推，面板沿贴边方向变宽（左右放置）或变高（上下放置）。 默认 false。厚度夹在 minPanelSize 与 maxPanelSize 之间，且不超出视口（contained 时是所在容器）。 |
| `panelSize` | `number` |  | 受控厚度（像素）；未提供即非受控。没有值时面板按 size 档的厚度绘制。 |
| `defaultPanelSize` | `number` |  | 非受控的初始厚度（像素）；不给即按 size 档。 |
| `minPanelSize` | `number` |  | 厚度下限（像素），默认 160。 |
| `maxPanelSize` | `number` |  | 厚度上限（像素）；不给时只受视口（或所在容器）限制。 |
| `onPanelSizeChange` | `(details: DrawerPanelSizeChangeDetails) => void` |  | 厚度变化意图：拖动途中连续发出，键盘每推一步发一次。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `exit-complete` | `CustomEvent` | 退出完成且本层资源已释放 |
| `panel-size-change` | `CustomEvent` | 厚度变化意图；detail 为 `{ panelSize: number }` |
| `open-change` | `DrawerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDrawerRoot` | `default` | `DrawerRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhDrawerRoot` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 提供后即为局部抽屉：遮罩与定位层从 fixed 换为 absolute，只覆盖该容器而不是整屏。 该容器要自带 position（relative 等），否则 absolute 会向上找到其他定位祖先。 |
| `XhDrawerRoot` | `children` | `SlotChildren<DrawerRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`RESIZE.START` · `RESIZE.NUDGE` · `RESIZE.TO_BOUND` · `RESIZE.MEASURE`

**判据**：`canResize`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `panelSize` | `number \| null` | 当前厚度；没被调过、也没给初值时为 null。 |
| `resizing` | `boolean` | 正在被指针调厚度。 |
| `side` | `DrawerSide` | 已解析的滑出边（prop 未提供时是默认值），作者据此配置动画。 |
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
| `getResizeTriggerProps` | `() => T['element']` | 改尺把手：role=separator，落在朝向页面的那条边上；没开 resizable 时带 hidden。 |
| `isContentMounted` | `(present: boolean) => boolean` | 浮层此刻该不该挂载。`present` 是适配器的退场闸门：打开中或收起动画还没播完为真。 没打开过恒为假；unmountOnExit 为 false 时打开过之后恒为真，闸门落下的那段由适配器隐藏而不卸载。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开抽屉并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |
| `Enter` / `Space` | held in trigger / close-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或抽屉收起撤下 |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | focus in resize-trigger, resizable | 按屏幕方向推把手一步（8px）：推向页面那一侧变厚、推向贴边那一侧变薄；左右放置只认左右键、上下放置只认上下键；夹在上下限之间 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in resize-trigger, resizable | 按大步长推（40px） |
| `Home` / `End` | focus in resize-trigger, resizable | Home 推到厚度下限，End 推到上限（没给上限时推到视口或所在容器能放下的最大厚度） |

### ARIA

以下属性由 `connect` 生成。

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
| `close-trigger` | `aria-label` | translations.close |
| `resize-trigger` | `aria-controls` | `content` 部件的 id |
| `resize-trigger` | `aria-label` | translations.resizeTrigger |
| `resize-trigger` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `resize-trigger` | `aria-valuemax` | String(max) \| undefined |
| `resize-trigger` | `aria-valuemin` | String(min) |
| `resize-trigger` | `aria-valuenow` | String(now) \| undefined |
| `resize-trigger` | `role` | 'separator' |

## 样式参考

### 皮肤

`@xihan-ui/styles/drawer.css` 按 `[data-scope="drawer"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-drawer` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-contained` | ''（条件成立时才出现） |
| `root` | `data-side` | props.side |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `backdrop` | `data-contained` | ''（条件成立时才出现） |
| `backdrop` | `data-instant` | ''（条件成立时才出现） |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-contained` | ''（条件成立时才出现） |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-contained` | ''（条件成立时才出现） |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-resizing` | ''（条件成立时才出现） |
| `content` | `data-side` | props.side |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `resize-trigger` | `data-side` | props.side |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-drawer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | drawer 的 backdrop 部件 background 覆盖槽。 |
| `--xh-drawer-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | drawer 的 backdrop 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-drawer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | drawer 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-drawer-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` | drawer 的 content 部件 background 覆盖槽。 |
| `--xh-drawer-border` | `content` | `border` | `default` | `--xh-material-elevated-border` | drawer 的 content 部件 border 覆盖槽。 |
| `--xh-drawer-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-bg-focus` | `close-trigger` | `background-color` | `focus-visible` | `--xh-_action-variant-bg-focus-visible` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-drawer-close-fg-hover` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-drawer-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='drawer'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | drawer 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-drawer-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | drawer 的 description 部件 color 覆盖槽。 |
| `--xh-drawer-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | drawer 的 description 部件 font-size 覆盖槽。 |
| `--xh-drawer-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` | drawer 的 content 部件 color 覆盖槽。 |
| `--xh-drawer-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | drawer 的 footer 部件 gap 覆盖槽。 |
| `--xh-drawer-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | drawer 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-drawer-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | drawer 的 content 部件 gap 覆盖槽。 |
| `--xh-drawer-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | drawer 的 header 部件 gap 覆盖槽。 |
| `--xh-drawer-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | drawer 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-drawer-icon-size` | `close-trigger`<br>`content`<br>`root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | drawer 的 close-trigger、content、root、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-drawer-layer` | `content`<br>`positioner` | `z-index` | `default` | `--xh-_layer` | drawer 的 content、positioner 部件 z-index 覆盖槽。 |
| `--xh-drawer-px` | `content` | `padding-inline` | `contained`<br>`default` | `--xh-surface-px-md` | drawer 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-py` | `content` | `padding-block-end`<br>`padding-block-start` | `contained`<br>`default` | `--xh-surface-py-md` | drawer 的 content 部件 padding-block-end、padding-block-start 覆盖槽。 |
| `--xh-drawer-radius` | `content` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-shape-overlay` | drawer 的 content 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-drawer-resize-indicator-length` | `resize-trigger` | `block-size`<br>`inline-size` | `is([data-side='left'], [data-side='right'])`<br>`is([data-side='top'], [data-side='bottom'])`<br>`side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-space-8` | drawer 的 resize-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-resize-indicator-thickness` | `resize-trigger` | `block-size`<br>`inline-size` | `is([data-side='left'], [data-side='right'])`<br>`is([data-side='top'], [data-side='bottom'])`<br>`side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-stroke-strong` | drawer 的 resize-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-resize-trigger-bg` | `resize-trigger` | `background` | `default` | `--xh-border-control` | drawer 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-resize-trigger-bg-active` | `resize-trigger` | `background` | `resizing` | `--xh-bg-brand` | drawer 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-resize-trigger-bg-hover` | `resize-trigger` | `background` | `hover` | `--xh-border-control-hover` | drawer 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-resize-trigger-radius` | `resize-trigger` | `border-radius` | `default` | `--xh-shape-pill` | drawer 的 resize-trigger 部件 border-radius 覆盖槽。 |
| `--xh-drawer-resize-trigger-size` | `resize-trigger` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-space-2` | drawer 的 resize-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | drawer 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-drawer-size` | `content` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-_drawer-size` | drawer 的 content 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | drawer 的 title 部件 color 覆盖槽。 |
| `--xh-drawer-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | drawer 的 title 部件 font-size 覆盖槽。 |
| `--xh-drawer-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | drawer 的 title 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` | drawer 的 trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-active` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-open` | `trigger` | `--xh-ink-surface`<br>`background-color` | `focus-visible`<br>`state=open`<br>`xh-ink-surface` | `--xh-bg-subtle` | drawer 的 trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-drawer-trigger-border` | `trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` | drawer 的 trigger 部件 border、border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-hover` | `trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | drawer 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-open` | `trigger` | `border`<br>`border-color` | `focus-visible`<br>`state=open` | `--xh-border-control-hover` | drawer 的 trigger 部件 border、border-color 覆盖槽。 |
| `--xh-drawer-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | drawer 的 trigger 部件 color 覆盖槽。 |
| `--xh-drawer-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` | drawer 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-drawer-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | drawer 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` | drawer 的 trigger 部件 gap 覆盖槽。 |
| `--xh-drawer-trigger-h` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | drawer 的 trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | drawer 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现 · 导航（整幅滑入）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` · `xh-fade-out` · `xh-slide-fade-in` · `xh-slide-fade-out` · `xh-slide-in` · `xh-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走；另有按 `dir` 分支的规则。
