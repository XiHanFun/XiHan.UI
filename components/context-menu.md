来源：https://ui.docs.xihanfun.com/components/context-menu

# 右键菜单 `context-menu`

在触发区上右键（触摸端长按）弹出的命令菜单，钉在按下去的那一点上。

## 何时使用

- 一个对象上有多个针对它的命令，且界面上没有位置全部摆出来（表格行、画布节点、文件项）。

## 何时不用

- 命令是主要路径：右键是隐藏入口，新用户找不到。主要动作要有可见的按钮。
- 触摸端是主要场景：长按有学习成本，且与系统手势冲突。
- 要选一个值而不是执行命令：用[选择器](./select)，或把[列表框](./listbox)装进[浮层](./popover)。

## 特性

- `offset` 默认 0——右键菜单要贴着光标。
- 支持分组、标记位、分隔线与二级子菜单；任意层级选中都发根的 `select` 并整链关闭。
- `typeahead` 决定展开后的可打印字符是拿去检索还是放行给页面。
- `longPressDelay` 是触摸端按住多久算触发。
- `root` 的插槽给出锚点坐标与 `openAt`，可以从任意位置弹出。

## 示例

### 基础用法

在触发区上右键（触摸端长按），菜单钉在按下去的那一点上

```vue
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const commands = [
  { value: "copy", label: "复制" },
  { value: "paste", label: "粘贴", disabled: true },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

const picked = ref("");

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot :collection="commands" @select="onSelect">
      <!-- 触发区的尺寸与排布归作者，皮肤只管它的交互观感 -->
      <template #trigger>
        <span style="display: grid; place-items: center; min-block-size: 120px">
          在这块区域上右键
        </span>
      </template>
    </XhContextMenuRoot>

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <xh-context-menu id="context-menu-basic">
    <div data-xh-part="root">
      <!-- 触发区的尺寸与排布归作者，皮肤只管它的交互观感 -->
      <div data-xh-part="trigger">
        <span style="display: grid; place-items: center; min-block-size: 120px">
          在这块区域上右键
        </span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">
            <span data-xh-part="item-text">复制</span>
          </div>
          <div data-xh-part="item" value="paste" aria-disabled="true">
            <span data-xh-part="item-text">粘贴</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>

  <span>最近选中：<span id="context-menu-basic-readout">（无）</span></span>
</div>

<script type="module">
  // 选中的条目值回显在下面那行文字里
  const menu = document.getElementById("context-menu-basic");
  const readout = document.getElementById("context-menu-basic-readout");
  menu.addEventListener("select", (event) => {
    readout.textContent = event.detail.value;
  });
</script>
```

### 分组与标记位

group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位

```vue
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuGroup,
  XhContextMenuGroupLabel,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sortBy = ref("name");

function onSelect(details: { value: string }): void {
  if (details.value === "name" || details.value === "time")
    sortBy.value = details.value;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot @select="onSelect">
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>右键看看排序与视图两组</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuGroup value="sort">
            <XhContextMenuGroupLabel>排序方式</XhContextMenuGroupLabel>
            <XhContextMenuItem value="name">
              <XhContextMenuItemIndicator
                :style="{ visibility: sortBy === 'name' ? 'visible' : 'hidden' }"
              />
              <XhContextMenuItemText>按名称</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuItem value="time">
              <XhContextMenuItemIndicator
                :style="{ visibility: sortBy === 'time' ? 'visible' : 'hidden' }"
              />
              <XhContextMenuItemText>按时间</XhContextMenuItemText>
            </XhContextMenuItem>
          </XhContextMenuGroup>

          <XhContextMenuSeparator />

          <XhContextMenuGroup value="view">
            <XhContextMenuGroupLabel>视图</XhContextMenuGroupLabel>
            <XhContextMenuItem value="list">
              <XhContextMenuItemText>列表</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuItem value="grid">
              <XhContextMenuItemText>网格</XhContextMenuItemText>
            </XhContextMenuItem>
          </XhContextMenuGroup>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>

    <span>当前排序：{{ sortBy === "name" ? "按名称" : "按时间" }}</span>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <xh-context-menu id="context-menu-group">
    <div data-xh-part="root">
      <div data-xh-part="trigger" style="display: grid; place-items: center; min-block-size: 120px">
        <span>右键看看排序与视图两组</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="group" value="sort">
            <span data-xh-part="group-label">排序方式</span>
            <div data-xh-part="item" value="name">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">按名称</span>
            </div>
            <div data-xh-part="item" value="time">
              <span data-xh-part="item-indicator" style="visibility: hidden"></span>
              <span data-xh-part="item-text">按时间</span>
            </div>
          </div>

          <div data-xh-part="separator"></div>

          <div data-xh-part="group" value="view">
            <span data-xh-part="group-label">视图</span>
            <div data-xh-part="item" value="list">
              <span data-xh-part="item-text">列表</span>
            </div>
            <div data-xh-part="item" value="grid">
              <span data-xh-part="item-text">网格</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>

  <span>当前排序：<span id="context-menu-group-readout">按名称</span></span>
</div>

<script type="module">
  // 选中排序项后勾移到那一条上
  const menu = document.getElementById("context-menu-group");
  const readout = document.getElementById("context-menu-group-readout");
  const labels = { name: "按名称", time: "按时间" };

  menu.addEventListener("select", (event) => {
    const picked = event.detail.value;
    if (!(picked in labels)) return;
    for (const value of Object.keys(labels)) {
      const item = menu.querySelector(`[data-xh-part="item"][value="${value}"]`);
      item.querySelector('[data-xh-part="item-indicator"]').style.visibility =
        value === picked ? "" : "hidden";
    }
    readout.textContent = labels[picked];
  });
</script>
```

### 受控与锚点

传了 open 就由宿主说了算；root 的插槽给出锚点坐标与 openAt，可以从任意位置弹出

```vue
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot v-slot="{ point, openAt }" v-model:open="open">
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>右键这里，或者用下面的按钮从固定坐标弹出</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="open">
            <XhContextMenuItemText>打开</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuItem value="share">
            <XhContextMenuItemText>分享</XhContextMenuItemText>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <button type="button" @click="openAt(120, 200)">在 (120, 200) 弹出</button>
        <button type="button" @click="open = false">收起</button>
        <span>
          {{ open ? `展开中 · 锚点 (${point?.x}, ${point?.y})` : "已收起" }}
        </span>
      </div>
    </XhContextMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <xh-context-menu id="context-menu-controlled" open="false">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>右键这里，或者用下面的按钮从固定坐标弹出</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-text">打开</span>
          </div>
          <div data-xh-part="item" value="share">
            <span data-xh-part="item-text">分享</span>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <button type="button" id="context-menu-controlled-at">
          在 (120, 200) 弹出
        </button>
        <button type="button" id="context-menu-controlled-close">收起</button>
        <span id="context-menu-controlled-state">已收起</span>
      </div>
    </div>
  </xh-context-menu>
</div>

<script type="module">
  const menu = document.getElementById("context-menu-controlled");
  const trigger = menu.querySelector('[data-xh-part="trigger"]');
  const state = document.getElementById("context-menu-controlled-state");

  let open = false;
  let point = null;

  function apply() {
    menu.open = open;
    if (!open) {
      state.textContent = "已收起";
      return;
    }
    // 键盘与长按那两条入口不经 contextmenu，锚点归机器自己挑
    state.textContent = point
      ? "展开中 · 锚点 (" + point.x + ", " + point.y + ")"
      : "展开中";
  }

  // 锚点坐标就是这一下右键的位置：捕获阶段先记下来，再轮到触发区把菜单打开。
  // 展开着再右键只挪坐标、不发开合，所以这里也刷一次回显
  menu.addEventListener(
    "contextmenu",
    (event) => {
      point = { x: event.clientX, y: event.clientY };
      apply();
    },
    true,
  );

  menu.addEventListener("open-change", (event) => {
    open = event.detail.open;
    if (!open) point = null;
    apply();
  });

  // 从固定坐标弹出：给触发区补一记带坐标的右键，与用户亲手点的那一下同一条路
  document
    .getElementById("context-menu-controlled-at")
    .addEventListener("click", () => {
      trigger.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: 120,
          clientY: 200,
        }),
      );
    });

  document
    .getElementById("context-menu-controlled-close")
    .addEventListener("click", () => {
      open = false;
      apply();
    });
</script>
```

### 语气

tone 决定条目高亮与标记位用哪族颜色；高亮静止态看不出来，右键弹出后悬停条目、或用方向键把焦点移上去才显现

```vue
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 标记位的强调色也随语气走，这一处不必悬停就能看出来；indicator 留空串即由皮肤画勾
const commands = [
  { value: "star", label: "标记", indicator: "" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

const triggerStyle = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "76px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
};
</script>

<template>
  <!-- 六块各自独立的触发区，逐块右键对比条目高亮底色 -->
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <XhContextMenuRoot
      v-for="tone in tones"
      :key="tone"
      :tone="tone"
      :collection="commands"
    >
      <template #trigger>
        <span :style="triggerStyle">{{ tone }}</span>
      </template>
    </XhContextMenuRoot>
  </div>
</template>
```

```html
<!-- 六块各自独立的触发区，逐块右键对比条目高亮底色 -->
<div
  style="
    inline-size: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  "
>
  <xh-context-menu tone="brand">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 76px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>brand</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="star">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">标记</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu tone="neutral">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 76px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>neutral</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="star">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">标记</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu tone="success">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 76px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>success</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="star">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">标记</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu tone="warning">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 76px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>warning</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="star">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">标记</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu tone="danger">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 76px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>danger</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="star">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">标记</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu tone="info">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 76px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>info</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="star">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">标记</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
</div>
```

### 尺寸

size 换的是条目的内边距、间距与字号；三档各挂一块触发区，逐块右键对比

```vue
<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "lg" },
] as const;

const commands = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];

// 三块触发区共用一份外观，尺寸差别只由 size 造成
const triggerStyle = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "96px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
};
</script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <XhContextMenuRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      :collection="commands"
    >
      <template #trigger>
        <span :style="triggerStyle">{{ s.label }}</span>
      </template>
    </XhContextMenuRoot>
  </div>
</template>
```

```html
<!-- 三块触发区共用一份外观，尺寸差别只由 size 造成 -->
<div
  style="
    inline-size: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  "
>
  <xh-context-menu size="sm">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 96px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>sm</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">
            <span data-xh-part="item-text">复制</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu>
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 96px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>缺省</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">
            <span data-xh-part="item-text">复制</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
  <xh-context-menu size="lg">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 96px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <span>lg</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">
            <span data-xh-part="item-text">复制</span>
          </div>
          <div data-xh-part="item" value="rename">
            <span data-xh-part="item-text">重命名</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
</div>
```

### 放置位与箭头

placement 是相对光标那一点的首选位，offset 把浮层从光标推开；arrow 指回那一点

```vue
<script setup lang="ts">
import {
  XhContextMenuArrow,
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <!-- 缺省是贴着光标的 bottom-start，这里改成落在光标右侧并推开 12px -->
    <XhContextMenuRoot placement="right-start" :offset="12">
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>在这块区域上右键：菜单落在光标右侧，箭头指回光标</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="open">
            <XhContextMenuItemText>打开</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuItem value="share">
            <XhContextMenuItemText>分享</XhContextMenuItemText>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhContextMenuItemText>删除</XhContextMenuItemText>
          </XhContextMenuItem>
        </XhContextMenuContent>
        <!-- 箭头挂在 positioner 上，位置由定位引擎回填 -->
        <XhContextMenuArrow />
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <!-- 缺省是贴着光标的 bottom-start，这里改成落在光标右侧并推开 12px -->
  <xh-context-menu placement="right-start" offset="12">
    <div data-xh-part="root">
      <div data-xh-part="trigger" style="display: grid; place-items: center; min-block-size: 120px">
        <span>在这块区域上右键：菜单落在光标右侧，箭头指回光标</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-text">打开</span>
          </div>
          <div data-xh-part="item" value="share">
            <span data-xh-part="item-text">分享</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
        <!-- 箭头挂在 positioner 上，位置由定位引擎回填 -->
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </xh-context-menu>
</div>
```

### 条目里的图标与快捷键

item-text 只是文字那一段，图标与快捷键提示作为兄弟节点排在它两侧

```vue
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
  XhIcon,
} from "@xihan-ui/vue";

// 描边取 currentColor，图标颜色随条目文字色走，禁用态也一并跟着变淡
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const CutIcon = {
  name: "cut",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "circle", attrs: { cx: "6", cy: "18", r: "3" } },
    { tag: "circle", attrs: { cx: "18", cy: "18", r: "3" } },
    { tag: "path", attrs: { d: "M8 16L18 4M16 16L6 4" } },
  ],
} as const;

const PasteIcon = {
  name: "paste",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "rect", attrs: { x: "5", y: "4", width: "14", height: "17", rx: "2" } },
    { tag: "path", attrs: { d: "M9 4V3H15V4" } },
  ],
} as const;

const TrashIcon = {
  name: "trash",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M4 7H20" } },
    { tag: "path", attrs: { d: "M10 11V17M14 11V17" } },
    { tag: "path", attrs: { d: "M6 7L7 20H17L18 7" } },
  ],
} as const;

// item-text 会撑满剩余宽度，快捷键提示自然被顶到条目末端
const hintStyle = {
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhContextMenuRoot>
      <XhContextMenuTrigger
        style="display: grid; place-items: center; min-block-size: 120px"
      >
        <span>右键看带图标与快捷键的条目</span>
      </XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          <XhContextMenuItem value="cut">
            <XhIcon :icon="CutIcon" size="sm" />
            <XhContextMenuItemText>剪切</XhContextMenuItemText>
            <span :style="hintStyle">Ctrl+X</span>
          </XhContextMenuItem>
          <XhContextMenuItem value="paste" disabled>
            <XhIcon :icon="PasteIcon" size="sm" />
            <XhContextMenuItemText>粘贴</XhContextMenuItemText>
            <span :style="hintStyle">Ctrl+V</span>
          </XhContextMenuItem>
          <XhContextMenuSeparator />
          <XhContextMenuItem value="delete">
            <XhIcon :icon="TrashIcon" size="sm" />
            <XhContextMenuItemText>删除</XhContextMenuItemText>
            <span :style="hintStyle">Del</span>
          </XhContextMenuItem>
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <xh-context-menu id="context-menu-icon">
    <div data-xh-part="root">
      <div data-xh-part="trigger" style="display: grid; place-items: center; min-block-size: 120px">
        <span>右键看带图标与快捷键的条目</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="cut">
            <xh-icon size="sm" data-glyph="cut">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">剪切</span>
            <!-- item-text 会撑满剩余宽度，快捷键提示自然被顶到条目末端 -->
            <span style="color: var(--xh-fg-muted)">Ctrl+X</span>
          </div>
          <div data-xh-part="item" value="paste" aria-disabled="true">
            <xh-icon size="sm" data-glyph="paste">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">粘贴</span>
            <span style="color: var(--xh-fg-muted)">Ctrl+V</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <xh-icon size="sm" data-glyph="trash">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">删除</span>
            <span style="color: var(--xh-fg-muted)">Del</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
</div>

<script type="module">
  // 描边取 currentColor，图标颜色随条目文字色走，禁用态也一并跟着变淡
  const strokeAttrs = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const icons = {
    cut: {
      name: "cut",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "circle", attrs: { cx: "6", cy: "18", r: "3" } },
        { tag: "circle", attrs: { cx: "18", cy: "18", r: "3" } },
        { tag: "path", attrs: { d: "M8 16L18 4M16 16L6 4" } },
      ],
    },
    paste: {
      name: "paste",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "rect", attrs: { x: "5", y: "4", width: "14", height: "17", rx: "2" } },
        { tag: "path", attrs: { d: "M9 4V3H15V4" } },
      ],
    },
    trash: {
      name: "trash",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M4 7H20" } },
        { tag: "path", attrs: { d: "M10 11V17M14 11V17" } },
        { tag: "path", attrs: { d: "M6 7L7 20H17L18 7" } },
      ],
    },
  };

  // 图标记录是对象，只能作为 property 交给每个 xh-icon
  for (const el of document.getElementById("context-menu-icon").querySelectorAll("xh-icon")) {
    el.icon = icons[el.dataset.glyph];
  }
</script>
```

### 触发与连打

longPressDelay 是触摸端按住多久算触发；typeahead 决定展开后的可打印字符是拿去检索还是放行给页面

```vue
<script setup lang="ts">
import type { CSSProperties } from "vue";
import { XhContextMenuRoot } from "@xihan-ui/vue";

const formats = [
  { value: "pdf", label: "PDF 预览" },
  { value: "excel", label: "Excel 导出" },
  { value: "markdown", label: "Markdown 源码" },
];

// 两块触发区共用一份外观，差别只由 root 上那一个属性造成
const triggerStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "108px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
  padding: "8px",
  textAlign: "center",
};
</script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <!-- 长按 300ms 就触发，比缺省的 700ms 灵敏；按住期间指针挪动超过容差算取消 -->
    <XhContextMenuRoot :long-press-delay="300" :collection="formats">
      <template #trigger>
        <span :style="triggerStyle">
          触摸端按住 300ms 即弹出；展开后敲 E 跳到 Excel 那一条
        </span>
      </template>
    </XhContextMenuRoot>

    <!-- 关掉连打检索：同样敲 E，焦点不再移动，字符原样放行给页面 -->
    <XhContextMenuRoot :typeahead="false" :collection="formats">
      <template #trigger>
        <span :style="triggerStyle">连打检索关掉：展开后敲 E 焦点不动</span>
      </template>
    </XhContextMenuRoot>
  </div>
</template>
```

```html
<!-- 两块触发区共用一份外观，差别只由元素上那一个属性造成 -->
<div
  style="
    inline-size: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  "
>
  <!-- 长按 300ms 就触发，比缺省的 700ms 灵敏；按住期间指针挪动超过容差算取消 -->
  <xh-context-menu long-press-delay="300">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 108px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
          padding: 8px;
          text-align: center;
        "
      >
        <span>触摸端按住 300ms 即弹出；展开后敲 E 跳到 Excel 那一条</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="pdf">
            <span data-xh-part="item-text">PDF 预览</span>
          </div>
          <div data-xh-part="item" value="excel">
            <span data-xh-part="item-text">Excel 导出</span>
          </div>
          <div data-xh-part="item" value="markdown">
            <span data-xh-part="item-text">Markdown 源码</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>

  <!-- 关掉连打检索：同样敲 E，焦点不再移动，字符原样放行给页面 -->
  <xh-context-menu typeahead="false">
    <div data-xh-part="root">
      <div
        data-xh-part="trigger"
        style="
          display: grid;
          place-items: center;
          min-block-size: 108px;
          border: 1px dashed var(--xh-border-default);
          border-radius: 8px;
          padding: 8px;
          text-align: center;
        "
      >
        <span>连打检索关掉：展开后敲 E 焦点不动</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="pdf">
            <span data-xh-part="item-text">PDF 预览</span>
          </div>
          <div data-xh-part="item" value="excel">
            <span data-xh-part="item-text">Excel 导出</span>
          </div>
          <div data-xh-part="item" value="markdown">
            <span data-xh-part="item-text">Markdown 源码</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
</div>
```

### 二级子菜单

XhContextMenuSub 在右键菜单里嵌一台子菜单：触发条目双重身份（父层方向键照常走、右方向键进子层），子层内用 XhMenu 系部件，任意层级选中都发根的 select 并整链关闭

```vue
<script setup lang="ts">
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref("（还没选）");
</script>

<template>
  <XhContextMenuRoot @select="({ value }) => (picked = value)">
    <XhContextMenuTrigger>
      <div
        style="display: grid; place-items: center; block-size: 120px; border: 1px dashed var(--xh-border-strong); border-radius: 8px"
      >
        在这里点右键
      </div>
    </XhContextMenuTrigger>
    <XhContextMenuPositioner>
      <XhContextMenuContent>
        <XhContextMenuItem value="copy">复制</XhContextMenuItem>
        <XhContextMenuItem value="rename">重命名</XhContextMenuItem>
        <XhContextMenuSeparator />
        <XhContextMenuSub value="share">
          <XhContextMenuSubTrigger>发送到…</XhContextMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="share-email">邮件</XhMenuItem>
              <XhMenuItem value="share-sms">短信</XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhContextMenuSub>
        <XhContextMenuSeparator />
        <XhContextMenuItem value="delete">删除</XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
  <p>选中：{{ picked }}</p>
</template>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-context-menu>` |
| Vue 组件 | `XhContextMenuArrow` `XhContextMenuContent` `XhContextMenuGroup` `XhContextMenuGroupLabel` `XhContextMenuItem` `XhContextMenuItemDescription` `XhContextMenuItemIndicator` `XhContextMenuItemText` `XhContextMenuPositioner` `XhContextMenuRoot` `XhContextMenuSeparator` `XhContextMenuSub` `XhContextMenuSubTrigger` `XhContextMenuTrigger` |
| 组合式函数 | `useContextMenu` |
| 状态机 | `contextMenuMachine` |
| 皮肤 | `@xihan-ui/styles/context-menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="context-menu"`：`root` · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ContextMenuNode[]` |  | 条目数据，显示文本、禁用、标记位与分组的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用全写在条目部件上」的老路。 |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 相对光标那一点的首选放置位，默认 bottom-start。 |
| `offset` | `number` |  | 浮层与光标的间距（px），默认 0——右键菜单要贴着光标。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。关掉后可打印字符一律放行给页面。 |
| `translations` | `Partial<ContextMenuTranslations>` |  | 读屏用的文案，默认英文。 |
| `longPressDelay` | `number` |  | 触摸端长按多久算触发（ms），默认 700。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定条目高亮与标记位用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 |
| `onOpenChange` | `(details: ContextMenuOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onSelect` | `(details: ContextMenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ContextMenuOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `select` | `ContextMenuSelectDetails` | 条目被选中（菜单随之关闭）；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhContextMenuRoot` | `default` | `ContextMenuRootSlotProps` |  |
| `XhContextMenuRoot` | `trigger` | — |  |
| `XhContextMenuRoot` | `item` | `ContextMenuNodeMeta` |  |
| `XhContextMenuSub` | `default` | `ContextMenuSubSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `pressing` · `open`

**事件**：`CONTEXT.MENU` · `OPEN` · `CLOSE` · `PRESS.START` · `PRESS.MOVE` · `PRESS.END` · `after.longPressDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled` · `movedBeyondTolerance`

## connect API

`useContextMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ContextMenuNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `pressing` | `boolean` | 长按计时进行中；触发区据此给按压反馈。 |
| `point` | `ContextMenuPoint \| null` | 当前锚点坐标；一次都没打开过时为 null。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` | 收起走 CLOSE；展开沿用最近一次锚点坐标，从未有过坐标时锚在触发区的起始角上。 |
| `openAt` | `(x: number, y: number) => void` | 命令式展开到指定视口坐标。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ContextMenu` / `Shift+F10` | focus in trigger | 在触发区起始角展开菜单并把焦点落到首个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `单个可打印字符` | open, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不选中它 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还触发区 |
| `Escape` | open | 关闭菜单并把焦点归还触发区 |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还触发区，按 Tab 序列自然离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `aria-keyshortcuts` | 'Shift+F10' |
| `content` | `aria-label` | props.translations.content |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/context-menu.css` 按部件选择：`[data-scope="context-menu"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-pressing` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-context-menu-arrow-size` · `--xh-context-menu-border` · `--xh-context-menu-content-bg` · `--xh-context-menu-content-fg` · `--xh-context-menu-content-gap` · `--xh-context-menu-content-px` · `--xh-context-menu-content-py` · `--xh-context-menu-content-radius` · `--xh-context-menu-content-shadow` · `--xh-context-menu-group-gap` · `--xh-context-menu-group-label-fg` · `--xh-context-menu-group-label-font-size` · `--xh-context-menu-group-label-font-weight` · `--xh-context-menu-group-label-px` · `--xh-context-menu-group-label-py` · `--xh-context-menu-icon-size` · `--xh-context-menu-item-active-font-weight` · `--xh-context-menu-item-bg-active` · `--xh-context-menu-item-bg-hover` · `--xh-context-menu-item-description-fg` · `--xh-context-menu-item-description-font-size` · `--xh-context-menu-item-fg` · `--xh-context-menu-item-font-size` · `--xh-context-menu-item-gap` · `--xh-context-menu-item-indicator-fg` · `--xh-context-menu-item-indicator-size` · `--xh-context-menu-item-leading` · `--xh-context-menu-item-px` · `--xh-context-menu-item-py` · `--xh-context-menu-item-radius` · `--xh-context-menu-layer` · `--xh-context-menu-max-h` · `--xh-context-menu-max-w` · `--xh-context-menu-min-w` · `--xh-context-menu-separator-color` · `--xh-context-menu-separator-my` · `--xh-context-menu-separator-thickness` · `--xh-context-menu-trigger-bg-pressing`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 与[菜单](./menu)共用条目部件；子菜单用 `XhContextMenuSub`。

## 最佳实践

- 菜单里的每条命令都要在别处有可见入口，右键只是快捷方式。
- 条目控制在十条以内，超过就分组。

## 反模式

- 屏蔽浏览器原生右键却不给出等价能力（复制、检查、在新标签打开）。
- 把整页都做成右键触发区，用户再也用不了浏览器菜单。
