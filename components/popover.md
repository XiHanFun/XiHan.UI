来源：https://ui.docs.xihanfun.com/components/popover

# 气泡卡片 `popover`

由点击触发、贴着触发器的一小块浮层，里面可以放任意内容与交互。

## 何时使用

- 补充信息或一小组操作，不值得为它开对话框。
- 内容里有可聚焦元素（按钮、输入框）——这是它与[文字提示](./tooltip)的分界线。

## 何时不用

- 只是一句纯文字说明：用[文字提示](./tooltip)。
- 悬停即出、不需要点击：用[悬浮卡片](./hover-card)。
- 内容是一列命令：用[菜单](./menu)。

## 特性

- `placement` 只是首选位，空间不够时定位引擎自动翻面。
- `modal` 可选：需要锁住下层时打开。
- 可以与触发器同宽，也可以落在指针位置。
- `end` 这类对齐是逻辑方向，跟着书写方向走，不是左右。

## 示例

### 基础用法

点击展开，Escape 或点外部关闭；positioner 负责摆位，content 才是浮层本体

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

### 朝向与间距

placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是浮层与触发器的距离

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

传了 open 就由宿主说了算；这里额外关掉点外部关闭，只有按钮与 Escape 能收起

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

三档换的是浮层的内边距与字号，不写 size 即缺省档；逐个点开触发器看差别

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

标题、说明与两颗按钮拼成一次就地确认；两颗按钮按下后都只是把浮层收起

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

浮层自己不限高，给里面的容器设上限并开滚动，标题与关闭按钮就不跟着滚

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
        <div style="max-block-size: 160px; overflow: auto">
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
      <div style="max-block-size: 160px; overflow: auto">
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

modal 让焦点陷在浮层里：Tab 到末尾回绕，旁边那颗按钮这时接不到焦点

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

open-change 带一份 { open }，报的是这次要落到的状态；非受控时内部开合也照发一次

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

### 浮层与触发器同宽

量出触发器的实际宽度写进 content 的行内样式，同时解掉最大宽度上限；触发器换了文案宽度也跟着走

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

### 落在指针位置

触发器缩成一个像素、按点击坐标固定摆放，浮层就钉在刚点到的那一点上；再点一下换个落点

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popover>` |
| Vue 组件 | `XhPopoverArrow` `XhPopoverCloseTrigger` `XhPopoverContent` `XhPopoverDescription` `XhPopoverPositioner` `XhPopoverRoot` `XhPopoverTitle` `XhPopoverTrigger` |
| 组合式函数 | `usePopover` |
| 状态机 | `popoverMachine` |
| 皮肤 | `@xihan-ui/styles/popover.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="popover"`：**`trigger`** · `positioner` · **`content`** · `title` · `description` · `close-trigger` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `modal` | `boolean` |  | 模态浮层陷住焦点；默认 false（非模态，Tab 可离开）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `translations` | `Partial<PopoverTranslations>` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `PopoverOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopoverRoot` | `default` | `PopoverRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`usePopover` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
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
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | 'dialog' |
| `close-trigger` | `aria-label` | props.translations.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/popover.css` 按部件选择：`[data-scope="popover"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-popover-arrow-size` · `--xh-popover-bg` · `--xh-popover-border` · `--xh-popover-close-bg-active` · `--xh-popover-close-bg-hover` · `--xh-popover-close-fg` · `--xh-popover-close-fg-hover` · `--xh-popover-close-radius` · `--xh-popover-close-size` · `--xh-popover-description-fg` · `--xh-popover-fg` · `--xh-popover-gap` · `--xh-popover-icon-size` · `--xh-popover-layer` · `--xh-popover-max-h` · `--xh-popover-max-w` · `--xh-popover-px` · `--xh-popover-py` · `--xh-popover-radius` · `--xh-popover-shadow` · `--xh-popover-title-fg` · `--xh-popover-title-font-size` · `--xh-popover-title-font-weight`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 触发器用[按钮](./button)；长内容套[滚动区域](./scroll-area)。

## 最佳实践

- 打开后焦点进浮层，Escape 关闭并归还焦点。
- 内容控制在一屏内，需要滚动就说明该换[抽屉](./drawer)了。

## 反模式

- 悬停触发却里面有按钮：指针移过去的路上就关了。
- 气泡里再弹气泡。
