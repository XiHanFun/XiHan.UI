来源：https://ui.docs.xihanfun.com/components/popover

# Popover 气泡卡片

由点击触发、贴着触发器的一小块浮层，可以放任意内容与交互。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/popover" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/popover.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/popover" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/popover" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/popover.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点击展开，Escape 或点击外部关闭；positioner 负责定位，content 才是浮层本体

```vue
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPopoverRoot placement="bottom-start" :translations="{ close: '关闭' }">
    <XhPopoverTrigger>订阅设置</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhPopoverTitle>订阅设置</XhPopoverTitle>
        <XhPopoverDescription>
          role=dialog，触发器与内容四处 ARIA 互指；非模态，焦点不被陷住。
        </XhPopoverDescription>
        <XhPopoverCloseTrigger />
        <XhPopoverArrow />
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
</template>
```

```html
<xh-popover id="popover-basic" placement="bottom-start">
  <button data-xh-part="trigger">订阅设置</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h3 data-xh-part="title">订阅设置</h3>
      <p data-xh-part="description">
        role=dialog，触发器与内容四处 ARIA 互指；非模态，焦点不被陷住。
      </p>
      <button data-xh-part="close-trigger"></button>
      <div data-xh-part="arrow"></div>
    </div>
  </div>
</xh-popover>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("popover-basic").translations = { close: "关闭" };
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="popover"`：**`trigger`** · `positioner` · **`content`** · `title` · `description` · `close-trigger` · `arrow`

## 示例

### 朝向与间距

placement 是请求值，空间不足时定位引擎会自动翻面；offset 调整浮层与触发器的距离

```vue
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const cases = [
  { placement: "top", offset: 8, label: "上方" },
  { placement: "right", offset: 8, label: "右侧" },
  { placement: "bottom-end", offset: 16, label: "下方靠尾（间距 16）" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhPopoverRoot
      v-for="c in cases"
      :key="c.placement"
      :placement="c.placement"
      :offset="c.offset"
    >
      <XhPopoverTrigger>{{ c.label }}</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverDescription>
            请求的朝向是 {{ c.placement }}。
          </XhPopoverDescription>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-popover placement="top" offset="8">
    <button data-xh-part="trigger">上方</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">请求的朝向是 top。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-popover placement="right" offset="8">
    <button data-xh-part="trigger">右侧</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">请求的朝向是 right。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-popover placement="bottom-end" offset="16">
    <button data-xh-part="trigger">下方靠尾（间距 16）</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">请求的朝向是 bottom-end。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
</div>
```

### 受控

传入 open 后由宿主决定；这里额外关闭点击外部关闭，只有按钮与 Escape 能收起

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopoverRoot
      v-model:open="open"
      placement="bottom-start"
      :close-on-interact-outside="false"
    >
      <XhPopoverTrigger>浮层</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>受控浮层</XhPopoverTitle>
          <XhPopoverDescription>
            点页面别处不再关它，Escape 仍然有效。
          </XhPopoverDescription>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>

    <XhButton variant="outline" @click="open = !open">
      {{ open ? "收起" : "展开" }}
    </XhButton>
    <span>当前：{{ open ? "展开" : "收起" }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-popover
    id="popover-controlled"
    open="false"
    placement="bottom-start"
    close-on-interact-outside="false"
  >
    <button data-xh-part="trigger">浮层</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">受控浮层</h3>
        <p data-xh-part="description">点页面别处不再关它，Escape 仍然有效。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-button id="popover-controlled-toggle" variant="outline">
    <button data-xh-part="root">展开</button>
  </xh-button>
  <span>当前：<span id="popover-controlled-state">收起</span></span>
</div>

<script type="module">
  // 展开态由这段脚本持有：组件只发意图，写回 open 才真的展开
  const popover = document.getElementById("popover-controlled");
  const toggle = document.getElementById("popover-controlled-toggle");
  const label = toggle.querySelector('[data-xh-part="root"]');
  const readout = document.getElementById("popover-controlled-state");

  function apply(open) {
    popover.open = open;
    label.textContent = open ? "收起" : "展开";
    readout.textContent = open ? "展开" : "收起";
  }

  toggle.addEventListener("click", () => apply(!popover.open));
  popover.addEventListener("open-change", (event) => apply(event.detail.open));
</script>
```

### 尺寸

三档改变浮层的内边距与字号，不写 size 即默认档；逐个点开触发器查看差别

```vue
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhPopoverRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.value"
      placement="bottom-start"
    >
      <XhPopoverTrigger>{{ s.label }}</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>{{ s.label }}档</XhPopoverTitle>
          <XhPopoverDescription>
            size = {{ s.value ?? "未指定" }}。
          </XhPopoverDescription>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-popover size="sm" placement="bottom-start">
    <button data-xh-part="trigger">小</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">小档</h3>
        <p data-xh-part="description">size = sm。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <!-- 中间档不写 size，缺省即中档 -->
  <xh-popover placement="bottom-start">
    <button data-xh-part="trigger">缺省</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">缺省档</h3>
        <p data-xh-part="description">size = 未指定。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-popover size="lg" placement="bottom-start">
    <button data-xh-part="trigger">大</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">大档</h3>
        <p data-xh-part="description">size = lg。</p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
</div>
```

### 确认气泡

标题、说明与两个按钮组成一次就地确认；两个按钮按下后都只是收起浮层

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const removed = ref(false);

function confirm(setOpen: (next: boolean) => void) {
  removed.value = true;
  setOpen(false);
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopoverRoot v-slot="{ setOpen }" placement="top" size="sm">
      <XhPopoverTrigger>删除这条记录</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>删除后不可恢复</XhPopoverTitle>
          <XhPopoverDescription>这条记录连同它的附件一起清掉。</XhPopoverDescription>
          <div style="display: flex; justify-content: flex-end; gap: 8px">
            <XhButton size="sm" variant="ghost" @click="setOpen(false)">
              取消
            </XhButton>
            <XhButton size="sm" variant="solid" tone="danger" @click="confirm(setOpen)">
              删除
            </XhButton>
          </div>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
    <span>{{ removed ? "记录已删除" : "记录还在" }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-popover id="popover-confirm" placement="top" size="sm">
    <button data-xh-part="trigger">删除这条记录</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">删除后不可恢复</h3>
        <p data-xh-part="description">这条记录连同它的附件一起清掉。</p>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <xh-button size="sm" variant="ghost">
            <button data-xh-part="root" data-dismiss>取消</button>
          </xh-button>
          <xh-button size="sm" variant="solid" tone="danger">
            <button data-xh-part="root" data-dismiss data-confirm>删除</button>
          </xh-button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
  <span id="popover-confirm-state">记录还在</span>
</div>

<script type="module">
  const popover = document.getElementById("popover-confirm");
  // 文案是对象，只走 property
  popover.translations = { close: "关闭" };

  // 两颗按钮把收起转交给已接线的关闭部件
  const close = popover.querySelector('[data-xh-part="close-trigger"]');
  for (const button of popover.querySelectorAll("[data-dismiss]")) {
    button.addEventListener("click", () => close.click());
  }

  // 只有「删除」那颗改后面那行文字
  const state = document.getElementById("popover-confirm-state");
  popover.querySelector("[data-confirm]").addEventListener("click", () => {
    state.textContent = "记录已删除";
  });
</script>
```

### 长内容滚动

浮层自身不限高，为内部容器设置上限并开启滚动，标题与关闭按钮就不随内容滚动

```vue
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const versions = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  text: `v1.${18 - i} 更新了若干细节`,
}));
</script>

<template>
  <XhPopoverRoot placement="bottom-start" :translations="{ close: '关闭' }">
    <XhPopoverTrigger>历史版本</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhPopoverTitle>历史版本</XhPopoverTitle>
        <div data-xh-scroll style="max-block-size: 160px; overflow: auto">
          <p
            v-for="v in versions"
            :key="v.id"
            style="
              margin: 0;
              padding: 6px 0;
              border-block-end: 1px solid var(--xh-border-subtle);
            "
          >
            {{ v.text }}
          </p>
        </div>
        <XhPopoverCloseTrigger />
        <XhPopoverArrow />
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
</template>
```

```html
<xh-popover id="popover-scroll" placement="bottom-start">
  <button data-xh-part="trigger">历史版本</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h3 data-xh-part="title">历史版本</h3>
      <div data-xh-scroll style="max-block-size: 160px; overflow: auto">
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.18 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.17 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.16 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.15 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.14 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.13 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.12 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.11 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.10 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.9 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.8 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.7 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.6 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.5 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.4 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.3 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.2 更新了若干细节</p>
        <p style="margin: 0; padding: 6px 0; border-block-end: 1px solid var(--xh-border-subtle)">v1.1 更新了若干细节</p>
      </div>
      <button data-xh-part="close-trigger"></button>
      <div data-xh-part="arrow"></div>
    </div>
  </div>
</xh-popover>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("popover-scroll").translations = { close: "关闭" };
</script>
```

### 模态浮层

modal 使焦点限制在浮层内：Tab 到末尾回绕，旁边的按钮此时无法获得焦点

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const groups = ["收件箱", "待办", "归档"];
const picked = ref("收件箱");
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopoverRoot modal placement="bottom-start" :translations="{ close: '关闭' }">
      <XhPopoverTrigger>移动到分组</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>移动到分组</XhPopoverTitle>
          <XhPopoverDescription>按 Tab 试试，焦点只在浮层里打转。</XhPopoverDescription>
          <div style="display: flex; gap: 8px">
            <XhButton
              v-for="g in groups"
              :key="g"
              size="sm"
              variant="outline"
              @click="picked = g"
            >
              {{ g }}
            </XhButton>
          </div>
          <XhPopoverCloseTrigger />
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>

    <XhButton variant="ghost">页面上的另一颗按钮</XhButton>
    <span>当前分组：{{ picked }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-popover id="popover-modal" modal placement="bottom-start">
    <button data-xh-part="trigger">移动到分组</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">移动到分组</h3>
        <p data-xh-part="description">按 Tab 试试，焦点只在浮层里打转。</p>
        <div style="display: flex; gap: 8px">
          <xh-button size="sm" variant="outline">
            <button data-xh-part="root" data-group>收件箱</button>
          </xh-button>
          <xh-button size="sm" variant="outline">
            <button data-xh-part="root" data-group>待办</button>
          </xh-button>
          <xh-button size="sm" variant="outline">
            <button data-xh-part="root" data-group>归档</button>
          </xh-button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>

  <xh-button variant="ghost">
    <button data-xh-part="root">页面上的另一颗按钮</button>
  </xh-button>
  <span>当前分组：<span id="popover-modal-picked">收件箱</span></span>
</div>

<script type="module">
  const popover = document.getElementById("popover-modal");
  // 文案是对象，只走 property
  popover.translations = { close: "关闭" };

  // 三颗分组按钮把选中的名字写到后面那行文字上
  const picked = document.getElementById("popover-modal-picked");
  for (const button of popover.querySelectorAll("[data-group]")) {
    button.addEventListener("click", () => {
      picked.textContent = button.textContent;
    });
  }
</script>
```

### 事件

open-change 带一份 { open }，报告的是本次要进入的状态；非受控时内部开合也照常触发一次

```vue
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const log = ref<string[]>([]);

// 只留最近五条
function onOpenChange(details: { open: boolean }) {
  log.value = [details.open ? "展开" : "收起", ...log.value].slice(0, 5);
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopoverRoot placement="bottom-start" @open-change="onOpenChange">
      <XhPopoverTrigger>点开再关掉</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverDescription>
            按钮、Escape、点浮层外部，三条路都会发一次意图。
          </XhPopoverDescription>
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
    <span>最近：{{ log.join(" ← ") || "（还没动过）" }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-popover id="popover-event" placement="bottom-start">
    <button data-xh-part="trigger">点开再关掉</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <p data-xh-part="description">
          按钮、Escape、点浮层外部，三条路都会发一次意图。
        </p>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
  <span>最近：<span id="popover-event-log">（还没动过）</span></span>
</div>

<script type="module">
  // 只留最近五条
  const readout = document.getElementById("popover-event-log");
  const log = [];
  document
    .getElementById("popover-event")
    .addEventListener("open-change", (event) => {
      log.unshift(event.detail.open ? "展开" : "收起");
      log.length = Math.min(log.length, 5);
      readout.textContent = log.join(" ← ");
    });
</script>
```

### 浮层与触发器同宽

测量触发器的实际宽度写进 content 的行内样式，同时解除最大宽度上限；触发器更换文案后宽度随之变化

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const anchorEl = ref<HTMLElement | null>(null);
const triggerWidth = ref(0);
const long = ref(false);

// 行内样式压过皮肤里的 max-content；上限也得一并解掉，否则宽度被截在那一档
const panelStyle = computed(() => ({
  inlineSize: triggerWidth.value ? `${triggerWidth.value}px` : "max-content",
  maxInlineSize: "none",
}));

let observer: ResizeObserver | undefined;

onMounted(() => {
  const el = anchorEl.value;
  if (!el)
    return;
  observer = new ResizeObserver(() => {
    triggerWidth.value = el.offsetWidth;
  });
  observer.observe(el);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhPopoverRoot placement="bottom-start">
      <!-- 外面这层只用来量宽：inline-block 使它与按钮同宽 -->
      <span ref="anchorEl" style="display: inline-block">
        <XhPopoverTrigger>
          {{ long ? "生产环境 · 华东 1 区 · 主集群" : "生产环境" }}
        </XhPopoverTrigger>
      </span>
      <XhPopoverPositioner>
        <XhPopoverContent :style="panelStyle">
          <XhPopoverTitle>切换环境</XhPopoverTitle>
          <XhPopoverDescription>
            面板宽 {{ triggerWidth }} 像素，与触发器一致。
          </XhPopoverDescription>
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>

    <XhButton size="sm" variant="outline" @click="long = !long">
      {{ long ? "换回短文案" : "换成长文案" }}
    </XhButton>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-popover id="popover-trigger-width" placement="bottom-start">
    <button data-xh-part="trigger">生产环境</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">切换环境</h3>
        <p data-xh-part="description">
          面板宽 <span id="popover-trigger-width-readout">0</span> 像素，与触发器一致。
        </p>
      </div>
    </div>
  </xh-popover>

  <xh-button id="popover-trigger-width-toggle" size="sm" variant="outline">
    <button data-xh-part="root">换成长文案</button>
  </xh-button>
</div>

<script type="module">
  const popover = document.getElementById("popover-trigger-width");
  const trigger = popover.querySelector('[data-xh-part="trigger"]');
  const content = popover.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("popover-trigger-width-readout");

  // 行内样式压过皮肤里的 max-content；上限也得一并解掉，否则宽度被截在那一档
  new ResizeObserver(() => {
    const width = trigger.offsetWidth;
    content.style.inlineSize = width ? `${width}px` : "max-content";
    content.style.maxInlineSize = "none";
    readout.textContent = String(width);
  }).observe(trigger);

  // 换掉触发器的文案，宽度跟着重新量一次
  const toggle = document.getElementById("popover-trigger-width-toggle");
  const label = toggle.querySelector('[data-xh-part="root"]');
  let long = false;
  toggle.addEventListener("click", () => {
    long = !long;
    trigger.textContent = long ? "生产环境 · 华东 1 区 · 主集群" : "生产环境";
    label.textContent = long ? "换回短文案" : "换成长文案";
  });
</script>
```

### 书写方向

start / end 是逻辑对齐不是左右：RTL 下 bottom-start 贴的是锚点右缘，块轴上的对齐不受影响

```vue
<script setup lang="ts">
import {
  XhButton,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const dir = ref<"ltr" | "rtl">("rtl");
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhButton size="sm" variant="outline" @click="dir = dir === 'ltr' ? 'rtl' : 'ltr'">
      当前方向：{{ dir }}（点一下切换）
    </XhButton>

    <div :dir="dir" style="display: flex; gap: 24px">
      <XhPopoverRoot :dir="dir" placement="bottom-start">
        <XhPopoverTrigger>
          <XhButton size="sm">bottom-start</XhButton>
        </XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>start</XhPopoverTitle>
            <p style="margin: 0">LTR 贴左缘，RTL 贴右缘</p>
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>

      <XhPopoverRoot :dir="dir" placement="bottom-end">
        <XhPopoverTrigger>
          <XhButton size="sm">bottom-end</XhButton>
        </XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>end</XhPopoverTitle>
            <p style="margin: 0">与 start 恰好相反</p>
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <xh-button size="sm" variant="outline">
    <button data-xh-part="root" id="popover-rtl-toggle">
      当前方向：rtl（点一下切换）
    </button>
  </xh-button>

  <div id="popover-rtl-stage" dir="rtl" style="display: flex; gap: 24px">
    <xh-popover dir="rtl" placement="bottom-start">
      <button data-xh-part="trigger">bottom-start</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h3 data-xh-part="title">start</h3>
          <p data-xh-part="description" style="margin: 0">LTR 贴左缘，RTL 贴右缘</p>
        </div>
      </div>
    </xh-popover>

    <xh-popover dir="rtl" placement="bottom-end">
      <button data-xh-part="trigger">bottom-end</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h3 data-xh-part="title">end</h3>
          <p data-xh-part="description" style="margin: 0">与 start 恰好相反</p>
        </div>
      </div>
    </xh-popover>
  </div>
</div>

<script type="module">
  // 方向同时写给排版容器与两台浮层：前者管文字流向，后者管 start / end 落在哪一缘
  const stage = document.getElementById("popover-rtl-stage");
  const toggle = document.getElementById("popover-rtl-toggle");
  let dir = "rtl";

  function apply() {
    stage.setAttribute("dir", dir);
    for (const popover of stage.querySelectorAll("xh-popover")) {
      popover.setAttribute("dir", dir);
    }
    toggle.textContent = "当前方向：" + dir + "（点一下切换）";
  }

  toggle.addEventListener("click", () => {
    dir = dir === "ltr" ? "rtl" : "ltr";
    apply();
  });
</script>
```

### 落在指针位置

触发器缩为一个像素、按点击坐标固定放置，浮层就固定在刚点击的位置；再点一次更换落点

```vue
<script setup lang="ts">
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const open = ref(false);
const point = ref({ x: 0, y: 0 });

// 指针坐标是物理坐标，锚点用 left / top 摆位；一像素而非零像素，位移探测才武装得起来
const anchorStyle = computed(
  () =>
    `position: fixed; left: ${point.value.x}px; top: ${point.value.y}px;`
    + " inline-size: 1px; block-size: 1px; padding: 0; border: 0; opacity: 0; pointer-events: none",
);

function pin(event: MouseEvent): void {
  point.value = { x: event.clientX, y: event.clientY };
  open.value = true;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div
      style="
        display: grid;
        place-items: center;
        block-size: 200px;
        border: 1px dashed var(--xh-border-default);
        border-radius: 8px;
        color: var(--xh-fg-muted);
        cursor: crosshair;
      "
      @click="pin"
    >
      在这块区域里点一下
    </div>

    <XhPopoverRoot
      v-model:open="open"
      placement="bottom-start"
      :offset="8"
      :close-on-interact-outside="false"
      :translations="{ close: '关闭' }"
    >
      <XhPopoverTrigger tabindex="-1" :style="anchorStyle" />
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>这一点</XhPopoverTitle>
          <XhPopoverDescription>
            落点 {{ point.x }} / {{ point.y }}，按 Escape 收起。
          </XhPopoverDescription>
          <XhPopoverCloseTrigger />
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <div
    id="popover-point-area"
    style="
      display: grid;
      place-items: center;
      block-size: 200px;
      border: 1px dashed var(--xh-border-default);
      border-radius: 8px;
      color: var(--xh-fg-muted);
      cursor: crosshair;
    "
  >
    在这块区域里点一下
  </div>

  <xh-popover
    id="popover-point"
    open="false"
    placement="bottom-start"
    offset="8"
    close-on-interact-outside="false"
  >
    <!-- 一像素而非零像素，位移探测才武装得起来 -->
    <button
      data-xh-part="trigger"
      tabindex="-1"
      style="
        position: fixed;
        left: 0;
        top: 0;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        border: 0;
        opacity: 0;
        pointer-events: none;
      "
    ></button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title">这一点</h3>
        <p data-xh-part="description">
          落点 <span id="popover-point-readout">0 / 0</span>，按 Escape 收起。
        </p>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-popover>
</div>

<script type="module">
  const popover = document.getElementById("popover-point");
  // 文案是对象，只走 property
  popover.translations = { close: "关闭" };

  const trigger = popover.querySelector('[data-xh-part="trigger"]');
  const readout = document.getElementById("popover-point-readout");

  // 指针坐标是物理坐标，锚点用 left / top 摆位
  document
    .getElementById("popover-point-area")
    .addEventListener("click", (event) => {
      trigger.style.left = `${event.clientX}px`;
      trigger.style.top = `${event.clientY}px`;
      readout.textContent = `${event.clientX} / ${event.clientY}`;
      popover.open = true;
    });

  // 受控：Escape 与关闭按钮只发意图，写回 open 才真的收起
  popover.addEventListener("open-change", (event) => {
    popover.open = event.detail.open;
  });
</script>
```

## 设计指引

### 何时使用

- 补充信息或一小组操作，不需要为此打开对话框。
- 内容中有可聚焦元素（按钮、输入框），这是它与[文字提示](./tooltip)的分界。

### 何时不用

- 只有一句纯文字说明时，使用[文字提示](./tooltip)。
- 悬停即出、不需要点击时，使用[悬浮卡片](./hover-card)。
- 内容是一列命令时，使用[菜单](./menu)。

### 特性

- `placement` 只是首选位置，空间不足时定位引擎自动翻面。
- `modal` 可选：需要锁定下层时开启；展开期间可动态切换，模态档会锁定页面滚动并让背景失活。
- 可以与触发器同宽，也可以落在指针位置。
- `end` 等对齐是逻辑方向，跟随书写方向，不是物理左右。

默认内容面使用 M2 磨砂配方，背景模糊只发生在浮层本体，箭头复用底色和边界，不重复模糊。正文保持不透明。触发器与关闭按钮走 Action Control 家族配方：触发器为 text 档中性描边，关闭按钮为 icon 档 ghost 面，悬停与按下沿画布承载阶梯换底，Space / Enter 与触屏按住期间投影 `data-pressed`，与指针按下同一副按压面。说明文字为 13px 说明档。系统减少透明度、高对比与强制色时，原位切换为实体表面；打印时收起交互浮层。

### 组合

- 触发器使用[按钮](./button)；长内容使用[滚动区域](./scroll-area)。

### 最佳实践

- 打开后焦点进入浮层，Escape 关闭并归还焦点。
- 模态浮层关闭时，滚动锁与背景失活保留到真实退场动画结束；退场内容自身立即退出焦点与交互树。
- 内容控制在一屏内，需要滚动时应改用[抽屉](./drawer)。

### 反模式

- 悬停触发却内含按钮：指针移动过去的途中就会关闭。
- 气泡内再弹出气泡。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popover>` |
| Vue 组件 | `XhPopoverArrow` `XhPopoverCloseTrigger` `XhPopoverContent` `XhPopoverDescription` `XhPopoverPositioner` `XhPopoverRoot` `XhPopoverTitle` `XhPopoverTrigger` |
| 组合式函数 | `usePopover` |
| 状态机 | `popoverMachine` |
| 皮肤 | `@xihan-ui/styles/popover.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `modal` | `boolean` |  | 模态浮层陷入焦点；默认 false（非模态，Tab 可离开）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `translations` | `Partial<PopoverTranslations>` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `PopoverOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopoverRoot` | `default` | `PopoverRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhPopoverPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhPopoverRoot` | `children` | `SlotChildren<PopoverRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |
| `Enter` / `Space` | held in trigger / close-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或浮层收起撤下 |

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
| `content` | `role` | 'dialog' |
| `close-trigger` | `aria-label` | props.translations.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/popover.css` 使用 `[data-scope="popover"][data-part="trigger"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-popover-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | popover 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-popover-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | popover 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-popover-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | popover 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-popover-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | popover 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-popover-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | popover 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-popover-close-bg-focus` | `close-trigger` | `background-color` | `focus-visible` | `--xh-_action-variant-bg-focus-visible` | popover 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-popover-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | popover 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-popover-close-fg` | `close-trigger` | `color` | `default` | `--xh-material-frosted-fg-muted` | popover 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-popover-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-popover-close-fg-hover` | popover 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-popover-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` | popover 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-popover-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | popover 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-popover-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='popover'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | popover 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-popover-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | popover 的 description 部件 color 覆盖槽。 |
| `--xh-popover-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | popover 的 description 部件 font-size 覆盖槽。 |
| `--xh-popover-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | popover 的 content 部件 color 覆盖槽。 |
| `--xh-popover-gap` | `content` | `gap` | `default` | `--xh-space-2` | popover 的 content 部件 gap 覆盖槽。 |
| `--xh-popover-icon-size` | `close-trigger`<br>`content`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | popover 的 close-trigger、content、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-popover-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | popover 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-popover-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | popover 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-popover-max-w` | `content` | `max-inline-size` | `default` | `--xh-_popover-max-w` | popover 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-popover-px` | `content` | `padding-inline` | `default` | `--xh-_popover-pad` | popover 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-popover-py` | `content` | `padding-block` | `default` | `--xh-_popover-pad` | popover 的 content 部件 padding-block 覆盖槽。 |
| `--xh-popover-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | popover 的 content 部件 border-radius 覆盖槽。 |
| `--xh-popover-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | popover 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-popover-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` | popover 的 title 部件 color 覆盖槽。 |
| `--xh-popover-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | popover 的 title 部件 font-size 覆盖槽。 |
| `--xh-popover-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | popover 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-overlay-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
