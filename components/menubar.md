来源：https://ui.docs.xihanfun.com/components/menubar

# 菜单栏 `menubar`

一排入口各带一张菜单，同时只展开一张——桌面应用顶部那条。

## 何时使用

- 功能密集的编辑器类界面，命令多到需要按"文件 / 编辑 / 视图"分门别类。

## 何时不用

- 站点导航：那是[导航菜单](./navigation-menu)或[侧栏导航](./side-nav)。
- 只有一个入口：直接用[菜单](./menu)。
- 移动端：这排入口在窄屏上放不下，且悬停切换无从谈起。

## 特性

- `value` 是当前展开的那一项，`null` 表示都收起。
- 一张菜单展开后，指针移到相邻入口即直接换张展开，不必先关再开。
- 禁用走 `aria-disabled` 而非原生 `disabled`：禁用的入口仍聚焦得上、仍是方向键的起点。
- `orientation` 竖排时上下键在入口之间走，左右键改为展开本项的菜单。

## 示例

### 基础用法

一排入口各带一张菜单，同时只展开一张；条目以 value 标识身份，禁用项方向键跳过也选不中

```vue
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "close", label: "关闭", disabled: true },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
];

const picked = ref("");

function onSelect(details: { menu: string; value: string }): void {
  picked.value = `${details.menu} / ${details.value}`;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot :collection="menus" @select="onSelect" />

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menubar id="menubar-basic">
    <div data-xh-part="root">
      <button data-xh-part="trigger" value="file">文件</button>
      <button data-xh-part="trigger" value="edit">编辑</button>
      <button data-xh-part="trigger" value="view">视图</button>

      <div data-xh-part="positioner" value="file">
        <div data-xh-part="content" value="file">
          <div data-xh-part="item" value="new">
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-text">打开</span>
          </div>
          <div data-xh-part="item" value="close" aria-disabled="true">
            <span data-xh-part="item-text">关闭</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="edit">
        <div data-xh-part="content" value="edit">
          <div data-xh-part="item" value="undo">
            <span data-xh-part="item-text">撤销</span>
          </div>
          <div data-xh-part="item" value="redo">
            <span data-xh-part="item-text">重做</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="view">
        <div data-xh-part="content" value="view">
          <div data-xh-part="item" value="zoom-in">
            <span data-xh-part="item-text">放大</span>
          </div>
          <div data-xh-part="item" value="zoom-out">
            <span data-xh-part="item-text">缩小</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>

  <span>最近选中：<span id="menubar-basic-readout">（无）</span></span>
</div>

<script type="module">
  // select 带上条目所属的那张菜单，两段一起回显
  const readout = document.getElementById("menubar-basic-readout");
  document
    .getElementById("menubar-basic")
    .addEventListener("select", (event) => {
      readout.textContent = `${event.detail.menu} / ${event.detail.value}`;
    });
</script>
```

### 受控

value 是当前展开的那一项，null 表示都收起；给了它就由宿主说了算

```vue
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>(null);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot v-model:value="value">
      <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
      <XhMenubarTrigger value="help">帮助</XhMenubarTrigger>

      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="save">
            <XhMenubarItemText>保存</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>

      <XhMenubarPositioner value="help">
        <XhMenubarContent>
          <XhMenubarItem value="about">
            <XhMenubarItemText>关于</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>

    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
      <button type="button" @click="value = 'file'">展开「文件」</button>
      <button type="button" @click="value = 'help'">展开「帮助」</button>
      <button type="button" @click="value = null">全部收起</button>
      <span>当前：{{ value ?? "（都收起）" }}</span>
    </div>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menubar id="menubar-controlled">
    <div data-xh-part="root">
      <button data-xh-part="trigger" value="file">文件</button>
      <button data-xh-part="trigger" value="help">帮助</button>

      <div data-xh-part="positioner" value="file">
        <div data-xh-part="content" value="file">
          <div data-xh-part="item" value="save">
            <span data-xh-part="item-text">保存</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="help">
        <div data-xh-part="content" value="help">
          <div data-xh-part="item" value="about">
            <span data-xh-part="item-text">关于</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>

  <div
    id="menubar-controlled-actions"
    style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap"
  >
    <button type="button" data-open="file">展开「文件」</button>
    <button type="button" data-open="help">展开「帮助」</button>
    <button type="button" data-open="">全部收起</button>
    <span>当前：<span id="menubar-controlled-state">（都收起）</span></span>
  </div>
</div>

<script type="module">
  // 展开项由这段脚本持有：组件只发意图，写回 value 才真的展开
  const menubar = document.getElementById("menubar-controlled");
  const readout = document.getElementById("menubar-controlled-state");

  function apply(value) {
    menubar.value = value;
    readout.textContent = value ?? "（都收起）";
  }

  apply(null);

  const actions = document.getElementById("menubar-controlled-actions");
  for (const button of actions.querySelectorAll("[data-open]")) {
    button.addEventListener("click", () => apply(button.dataset.open || null));
  }
  menubar.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

### 分组与标记位

group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位

```vue
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemIndicator,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const theme = ref("light");

function onSelect(details: { menu: string; value: string }): void {
  if (details.menu === "view")
    theme.value = details.value;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot @select="onSelect">
      <XhMenubarTrigger value="view">视图</XhMenubarTrigger>

      <XhMenubarPositioner value="view">
        <XhMenubarContent>
          <XhMenubarGroup value="theme">
            <XhMenubarGroupLabel>主题</XhMenubarGroupLabel>
            <XhMenubarItem value="light">
              <XhMenubarItemIndicator
                :style="{ visibility: theme === 'light' ? 'visible' : 'hidden' }"
              />
              <XhMenubarItemText>浅色</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="dark">
              <XhMenubarItemIndicator
                :style="{ visibility: theme === 'dark' ? 'visible' : 'hidden' }"
              />
              <XhMenubarItemText>深色</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarGroup>

          <XhMenubarSeparator />

          <XhMenubarGroup value="panel">
            <XhMenubarGroupLabel>面板</XhMenubarGroupLabel>
            <XhMenubarItem value="sidebar">
              <XhMenubarItemText>侧栏</XhMenubarItemText>
            </XhMenubarItem>
            <XhMenubarItem value="terminal">
              <XhMenubarItemText>终端</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarGroup>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>

    <span>当前主题：{{ theme === "light" ? "浅色" : "深色" }}</span>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menubar id="menubar-group">
    <div data-xh-part="root">
      <button data-xh-part="trigger" value="view">视图</button>

      <div data-xh-part="positioner" value="view">
        <div data-xh-part="content" value="view">
          <div data-xh-part="group" value="theme">
            <span data-xh-part="group-label">主题</span>
            <div data-xh-part="item" value="light">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">浅色</span>
            </div>
            <div data-xh-part="item" value="dark">
              <span data-xh-part="item-indicator" style="visibility: hidden"></span>
              <span data-xh-part="item-text">深色</span>
            </div>
          </div>

          <div data-xh-part="separator"></div>

          <div data-xh-part="group" value="panel">
            <span data-xh-part="group-label">面板</span>
            <div data-xh-part="item" value="sidebar">
              <span data-xh-part="item-text">侧栏</span>
            </div>
            <div data-xh-part="item" value="terminal">
              <span data-xh-part="item-text">终端</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>

  <span>当前主题：<span id="menubar-group-readout">浅色</span></span>
</div>

<script type="module">
  // 选中主题项后勾移到那一条上
  const menubar = document.getElementById("menubar-group");
  const readout = document.getElementById("menubar-group-readout");
  const labels = { light: "浅色", dark: "深色" };

  menubar.addEventListener("select", (event) => {
    const picked = event.detail.value;
    if (!(picked in labels)) return;
    for (const value of Object.keys(labels)) {
      const item = menubar.querySelector(`[data-xh-part="item"][value="${value}"]`);
      item.querySelector('[data-xh-part="item-indicator"]').style.visibility =
        value === picked ? "" : "hidden";
    }
    readout.textContent = labels[picked];
  });
</script>
```

### 语气

tone 换的是高亮底色，静止态一样：悬停到 trigger 上、或展开菜单后把焦点移到条目上才显现

```vue
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "brand（缺省）" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
];

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "save", label: "保存" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
];
</script>

<template>
  <!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
  <div style="inline-size: 100%; display: grid; gap: 8px; padding-block-end: 160px">
    <div
      v-for="t in tones"
      :key="t.value"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 120px; flex: none">{{ t.label }}</span>
      <XhMenubarRoot :tone="t.value" :collection="menus" />
    </div>
  </div>
</template>
```

```html
<!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
<div style="inline-size: 100%; display: grid; gap: 8px; padding-block-end: 160px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">brand（缺省）</span>
    <xh-menubar tone="brand">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">neutral</span>
    <xh-menubar tone="neutral">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">success</span>
    <xh-menubar tone="success">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">warning</span>
    <xh-menubar tone="warning">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">danger</span>
    <xh-menubar tone="danger">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">info</span>
    <xh-menubar tone="info">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
</div>
```

### 尺寸

size 一档换掉 trigger 与菜单条目的字号与内边距，写在 root 上、浮层里的条目一并跟着变

```vue
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
];
</script>

<template>
  <!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
  <div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 180px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 60px; flex: none">{{ s.label }}</span>
      <XhMenubarRoot :size="s.value" :collection="menus" />
    </div>
  </div>
</template>
```

```html
<!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
<div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 180px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 60px; flex: none">sm</span>
    <xh-menubar size="sm">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="view">视图</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="view">
          <div data-xh-part="content" value="view">
            <div data-xh-part="item" value="zoom-in">
              <span data-xh-part="item-text">放大</span>
            </div>
            <div data-xh-part="item" value="zoom-out">
              <span data-xh-part="item-text">缩小</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 60px; flex: none">缺省</span>
    <xh-menubar>
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="view">视图</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="view">
          <div data-xh-part="content" value="view">
            <div data-xh-part="item" value="zoom-in">
              <span data-xh-part="item-text">放大</span>
            </div>
            <div data-xh-part="item" value="zoom-out">
              <span data-xh-part="item-text">缩小</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 60px; flex: none">lg</span>
    <xh-menubar size="lg">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="view">视图</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="view">
          <div data-xh-part="content" value="view">
            <div data-xh-part="item" value="zoom-in">
              <span data-xh-part="item-text">放大</span>
            </div>
            <div data-xh-part="item" value="zoom-out">
              <span data-xh-part="item-text">缩小</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
</div>
```

### 竖排菜单栏

orientation 决定主轴：竖排时上下键在入口之间走，左右键改为展开本项的菜单

```vue
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "save", label: "保存" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 60px">
    <!-- 竖排时菜单该从入口侧边长出来，placement 一并改掉 -->
    <XhMenubarRoot
      orientation="vertical"
      placement="right-start"
      :offset="6"
      :collection="menus"
      style="inline-size: 160px"
    />
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 60px">
  <!-- 竖排时菜单该从入口侧边长出来，placement 一并改掉 -->
  <xh-menubar orientation="vertical" placement="right-start" offset="6">
    <div data-xh-part="root" style="inline-size: 160px">
      <button data-xh-part="trigger" value="file">文件</button>
      <button data-xh-part="trigger" value="edit">编辑</button>
      <button data-xh-part="trigger" value="help">帮助</button>

      <div data-xh-part="positioner" value="file">
        <div data-xh-part="content" value="file">
          <div data-xh-part="item" value="new">
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-text">打开</span>
          </div>
          <div data-xh-part="item" value="save">
            <span data-xh-part="item-text">保存</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="edit">
        <div data-xh-part="content" value="edit">
          <div data-xh-part="item" value="undo">
            <span data-xh-part="item-text">撤销</span>
          </div>
          <div data-xh-part="item" value="redo">
            <span data-xh-part="item-text">重做</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="help">
        <div data-xh-part="content" value="help">
          <div data-xh-part="item" value="about">
            <span data-xh-part="item-text">关于</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>
</div>
```

### 入口与条目的图标

图标是插槽里的普通节点：入口里排在文字前，条目里排在 item-text 前，逐项自己写

```vue
<script setup lang="ts">
import {
  XhIcon,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";

// 描边取 currentColor，图标颜色随入口与条目当下的文字色走
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const FileIcon = {
  name: "file",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M13 3H7A2 2 0 0 0 5 5V19A2 2 0 0 0 7 21H17A2 2 0 0 0 19 19V9Z" } },
    { tag: "path", attrs: { d: "M13 3V9H19" } },
  ],
} as const;

const EditIcon = {
  name: "edit",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 20H8L19 9A2.8 2.8 0 0 0 15 5L4 16Z" } }],
} as const;

const PlusIcon = {
  name: "plus",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M12 5V19M5 12H19" } }],
} as const;

const FolderIcon = {
  name: "folder",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M3 7A2 2 0 0 1 5 5H9L11 8H19A2 2 0 0 1 21 10V17A2 2 0 0 1 19 19H5A2 2 0 0 1 3 17Z" } },
  ],
} as const;

const SaveIcon = {
  name: "save",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M5 4H16L20 8V19A1 1 0 0 1 19 20H5A1 1 0 0 1 4 19V5A1 1 0 0 1 5 4Z" } },
    { tag: "path", attrs: { d: "M8 4V9H15" } },
  ],
} as const;
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 160px">
    <XhMenubarRoot>
      <XhMenubarTrigger value="file">
        <XhIcon :icon="FileIcon" size="sm" />
        文件
      </XhMenubarTrigger>
      <XhMenubarTrigger value="edit">
        <XhIcon :icon="EditIcon" size="sm" />
        编辑
      </XhMenubarTrigger>

      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="new">
            <XhIcon :icon="PlusIcon" size="sm" />
            <XhMenubarItemText>新建</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarItem value="open">
            <XhIcon :icon="FolderIcon" size="sm" />
            <XhMenubarItemText>打开</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarSeparator />
          <XhMenubarItem value="save">
            <XhIcon :icon="SaveIcon" size="sm" />
            <XhMenubarItemText>保存</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>

      <XhMenubarPositioner value="edit">
        <XhMenubarContent>
          <XhMenubarItem value="undo">
            <XhMenubarItemText>撤销</XhMenubarItemText>
          </XhMenubarItem>
          <XhMenubarItem value="redo">
            <XhMenubarItemText>重做</XhMenubarItemText>
          </XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 160px">
  <xh-menubar id="menubar-icon">
    <div data-xh-part="root">
      <button data-xh-part="trigger" value="file">
        <xh-icon size="sm" data-glyph="file">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
        文件
      </button>
      <button data-xh-part="trigger" value="edit">
        <xh-icon size="sm" data-glyph="edit">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
        编辑
      </button>

      <div data-xh-part="positioner" value="file">
        <div data-xh-part="content" value="file">
          <div data-xh-part="item" value="new">
            <xh-icon size="sm" data-glyph="plus">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="open">
            <xh-icon size="sm" data-glyph="folder">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">打开</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="save">
            <xh-icon size="sm" data-glyph="save">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">保存</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="edit">
        <div data-xh-part="content" value="edit">
          <div data-xh-part="item" value="undo">
            <span data-xh-part="item-text">撤销</span>
          </div>
          <div data-xh-part="item" value="redo">
            <span data-xh-part="item-text">重做</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>
</div>

<script type="module">
  // 描边取 currentColor，图标颜色随入口与条目当下的文字色走
  const strokeAttrs = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const icons = {
    file: {
      name: "file",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M13 3H7A2 2 0 0 0 5 5V19A2 2 0 0 0 7 21H17A2 2 0 0 0 19 19V9Z" } },
        { tag: "path", attrs: { d: "M13 3V9H19" } },
      ],
    },
    edit: {
      name: "edit",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 20H8L19 9A2.8 2.8 0 0 0 15 5L4 16Z" } }],
    },
    plus: {
      name: "plus",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M12 5V19M5 12H19" } }],
    },
    folder: {
      name: "folder",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M3 7A2 2 0 0 1 5 5H9L11 8H19A2 2 0 0 1 21 10V17A2 2 0 0 1 19 19H5A2 2 0 0 1 3 17Z" } },
      ],
    },
    save: {
      name: "save",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M5 4H16L20 8V19A1 1 0 0 1 19 20H5A1 1 0 0 1 4 19V5A1 1 0 0 1 5 4Z" } },
        { tag: "path", attrs: { d: "M8 4V9H15" } },
      ],
    },
  };

  // 图标记录是对象，只能作为 property 交给每个 xh-icon
  for (const el of document
    .getElementById("menubar-icon")
    .querySelectorAll("xh-icon")) {
    el.icon = icons[el.dataset.glyph];
  }
</script>
```

### 禁用

禁用走 aria-disabled 而非原生 disabled：禁用的入口仍聚焦得上、仍是方向键的起点，只是展不开菜单

```vue
<script setup lang="ts">
import { XhMenubarRoot, XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  // 单项禁用：整条没锁时，也只有这一项展不开
  {
    value: "edit",
    label: "编辑",
    disabled: true,
    items: [{ value: "undo", label: "撤销" }],
  },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];

const locked = ref(false);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 140px">
    <XhMenubarRoot :disabled="locked" :collection="menus" />

    <label style="display: flex; align-items: center; gap: 8px">
      <XhSwitch v-model:checked="locked" />
      整条禁用（展开与选中都不再发生）
    </label>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 140px">
  <xh-menubar id="menubar-disabled">
    <div data-xh-part="root">
      <button data-xh-part="trigger" value="file">文件</button>
      <!-- 单项禁用：整条没锁时，也只有这一项展不开 -->
      <button data-xh-part="trigger" value="edit" aria-disabled="true">编辑</button>
      <button data-xh-part="trigger" value="help">帮助</button>

      <div data-xh-part="positioner" value="file">
        <div data-xh-part="content" value="file">
          <div data-xh-part="item" value="new">
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-text">打开</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="edit">
        <div data-xh-part="content" value="edit">
          <div data-xh-part="item" value="undo">
            <span data-xh-part="item-text">撤销</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="help">
        <div data-xh-part="content" value="help">
          <div data-xh-part="item" value="about">
            <span data-xh-part="item-text">关于</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-switch id="menubar-disabled-switch">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>整条禁用（展开与选中都不再发生）</span>
  </div>
</div>

<script type="module">
  // 开关翻到开就锁住整条菜单栏
  const menubar = document.getElementById("menubar-disabled");
  document
    .getElementById("menubar-disabled-switch")
    .addEventListener("checked-change", (event) => {
      menubar.disabled = event.detail.checked;
    });
</script>
```

### 装不下就收进「更多」

宿主自己观测容器宽度，一次收起一个入口直到这排不再溢出；收起来的那几张菜单在「更多」里各占一组

```vue
<script setup lang="ts">
import {
  XhButton,
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from "@xihan-ui/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
  {
    value: "insert",
    label: "插入",
    items: [
      { value: "image", label: "图片" },
      { value: "table", label: "表格" },
    ],
  },
  {
    value: "format",
    label: "格式",
    items: [
      { value: "bold", label: "加粗" },
      { value: "italic", label: "倾斜" },
    ],
  },
  { value: "tools", label: "工具", items: [{ value: "spell", label: "拼写检查" }] },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];

const widths = [560, 380, 240];

const boxRef = ref<HTMLElement | null>(null);
const boxWidth = ref(560);
const visible = ref(menus.length);
const shown = computed(() => menus.slice(0, visible.value));
const folded = computed(() => menus.slice(visible.value));
const picked = ref("");

let observer: ResizeObserver | undefined;
let reflowing = false;

// 先全铺开，再一次收一个，直到这排不再溢出
async function reflow(): Promise<void> {
  const box = boxRef.value;
  if (!box || reflowing)
    return;
  reflowing = true;
  visible.value = menus.length;
  await nextTick();
  while (visible.value > 1 && box.scrollWidth > box.clientWidth + 1) {
    visible.value -= 1;
    await nextTick();
  }
  reflowing = false;
}

function onSelect(details: { menu: string; value: string }): void {
  picked.value = `${details.menu} / ${details.value}`;
}

onMounted(() => {
  const box = boxRef.value;
  if (!box)
    return;
  observer = new ResizeObserver(() => void reflow());
  observer.observe(box);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton
        v-for="w in widths"
        :key="w"
        size="sm"
        :variant="boxWidth === w ? 'solid' : 'outline'"
        @click="boxWidth = w"
      >
        {{ w }} 像素
      </XhButton>
    </div>

    <!-- 溢出裁在这一层，量的也是这一层 -->
    <div
      ref="boxRef"
      :style="{ inlineSize: `${boxWidth}px`, maxInlineSize: '100%', overflow: 'hidden' }"
    >
      <XhMenubarRoot @select="onSelect">
        <XhMenubarTrigger v-for="m in shown" :key="m.value" :value="m.value">
          {{ m.label }}
        </XhMenubarTrigger>
        <XhMenubarTrigger v-if="folded.length" value="more">更多</XhMenubarTrigger>

        <XhMenubarPositioner v-for="m in shown" :key="m.value" :value="m.value">
          <XhMenubarContent>
            <XhMenubarItem v-for="item in m.items" :key="item.value" :value="item.value">
              <XhMenubarItemText>{{ item.label }}</XhMenubarItemText>
            </XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>

        <XhMenubarPositioner v-if="folded.length" value="more">
          <XhMenubarContent>
            <XhMenubarGroup v-for="m in folded" :key="m.value" :value="m.value">
              <XhMenubarGroupLabel>{{ m.label }}</XhMenubarGroupLabel>
              <XhMenubarItem
                v-for="item in m.items"
                :key="item.value"
                :value="`${m.value}:${item.value}`"
              >
                <XhMenubarItemText>{{ item.label }}</XhMenubarItemText>
              </XhMenubarItem>
            </XhMenubarGroup>
          </XhMenubarContent>
        </XhMenubarPositioner>
      </XhMenubarRoot>
    </div>

    <span>
      在场入口 {{ shown.length }} / {{ menus.length }}；最近选中：{{ picked || "（无）" }}
    </span>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <div id="menubar-overflow-widths" style="display: flex; flex-wrap: wrap; gap: 8px">
    <xh-button size="sm" variant="solid" data-width="560">
      <button data-xh-part="root">560 像素</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-width="380">
      <button data-xh-part="root">380 像素</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-width="240">
      <button data-xh-part="root">240 像素</button>
    </xh-button>
  </div>

  <!-- 溢出裁在这一层，量的也是这一层 -->
  <div id="menubar-overflow-box" style="inline-size: 560px; max-inline-size: 100%; overflow: hidden">
    <xh-menubar id="menubar-overflow">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>
        <button data-xh-part="trigger" value="view">视图</button>
        <button data-xh-part="trigger" value="insert">插入</button>
        <button data-xh-part="trigger" value="format">格式</button>
        <button data-xh-part="trigger" value="tools">工具</button>
        <button data-xh-part="trigger" value="help">帮助</button>
        <button data-xh-part="trigger" value="more">更多</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="view">
          <div data-xh-part="content" value="view">
            <div data-xh-part="item" value="zoom-in">
              <span data-xh-part="item-text">放大</span>
            </div>
            <div data-xh-part="item" value="zoom-out">
              <span data-xh-part="item-text">缩小</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="insert">
          <div data-xh-part="content" value="insert">
            <div data-xh-part="item" value="image">
              <span data-xh-part="item-text">图片</span>
            </div>
            <div data-xh-part="item" value="table">
              <span data-xh-part="item-text">表格</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="format">
          <div data-xh-part="content" value="format">
            <div data-xh-part="item" value="bold">
              <span data-xh-part="item-text">加粗</span>
            </div>
            <div data-xh-part="item" value="italic">
              <span data-xh-part="item-text">倾斜</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="tools">
          <div data-xh-part="content" value="tools">
            <div data-xh-part="item" value="spell">
              <span data-xh-part="item-text">拼写检查</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="help">
          <div data-xh-part="content" value="help">
            <div data-xh-part="item" value="about">
              <span data-xh-part="item-text">关于</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="more">
          <div data-xh-part="content" value="more">
            <div data-xh-part="group" value="file">
              <span data-xh-part="group-label">文件</span>
              <div data-xh-part="item" value="file:new">
                <span data-xh-part="item-text">新建</span>
              </div>
              <div data-xh-part="item" value="file:open">
                <span data-xh-part="item-text">打开</span>
              </div>
            </div>
            <div data-xh-part="group" value="edit">
              <span data-xh-part="group-label">编辑</span>
              <div data-xh-part="item" value="edit:undo">
                <span data-xh-part="item-text">撤销</span>
              </div>
              <div data-xh-part="item" value="edit:redo">
                <span data-xh-part="item-text">重做</span>
              </div>
            </div>
            <div data-xh-part="group" value="view">
              <span data-xh-part="group-label">视图</span>
              <div data-xh-part="item" value="view:zoom-in">
                <span data-xh-part="item-text">放大</span>
              </div>
              <div data-xh-part="item" value="view:zoom-out">
                <span data-xh-part="item-text">缩小</span>
              </div>
            </div>
            <div data-xh-part="group" value="insert">
              <span data-xh-part="group-label">插入</span>
              <div data-xh-part="item" value="insert:image">
                <span data-xh-part="item-text">图片</span>
              </div>
              <div data-xh-part="item" value="insert:table">
                <span data-xh-part="item-text">表格</span>
              </div>
            </div>
            <div data-xh-part="group" value="format">
              <span data-xh-part="group-label">格式</span>
              <div data-xh-part="item" value="format:bold">
                <span data-xh-part="item-text">加粗</span>
              </div>
              <div data-xh-part="item" value="format:italic">
                <span data-xh-part="item-text">倾斜</span>
              </div>
            </div>
            <div data-xh-part="group" value="tools">
              <span data-xh-part="group-label">工具</span>
              <div data-xh-part="item" value="tools:spell">
                <span data-xh-part="item-text">拼写检查</span>
              </div>
            </div>
            <div data-xh-part="group" value="help">
              <span data-xh-part="group-label">帮助</span>
              <div data-xh-part="item" value="help:about">
                <span data-xh-part="item-text">关于</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>

  <span>
    在场入口 <span id="menubar-overflow-shown">7</span> / 7；最近选中：<span id="menubar-overflow-picked">（无）</span>
  </span>
</div>

<script type="module">
  const menubar = document.getElementById("menubar-overflow");
  const box = document.getElementById("menubar-overflow-box");
  const root = menubar.querySelector('[data-xh-part="root"]');
  const moreContent = menubar.querySelector('[data-xh-part="content"][value="more"]');
  const moreTrigger = root.querySelector('[data-xh-part="trigger"][value="more"]');
  // 入口一律插在首个浮层之前，方向键的行程才与视觉顺序一致
  const anchor = root.querySelector('[data-xh-part="positioner"]');
  const order = ["file", "edit", "view", "insert", "format", "tools", "help"];

  const pick = (selector) => menubar.querySelector(selector);
  const triggers = order.map((v) => pick(`[data-xh-part="trigger"][value="${v}"]`));
  const groups = order.map((v) => pick(`[data-xh-part="group"][value="${v}"]`));
  const shownReadout = document.getElementById("menubar-overflow-shown");

  // 前 count 个入口留在这一排，其余各自的那一组进「更多」
  function show(count) {
    for (const node of [...triggers, moreTrigger, ...groups]) node.remove();
    for (let i = 0; i < count; i++) root.insertBefore(triggers[i], anchor);
    for (let i = count; i < order.length; i++) moreContent.append(groups[i]);
    if (count < order.length) root.insertBefore(moreTrigger, anchor);
    shownReadout.textContent = String(count);
  }

  // 先全铺开，再一次收一个，直到这排不再溢出
  function reflow() {
    show(order.length);
    let count = order.length;
    while (count > 1 && box.scrollWidth > box.clientWidth + 1) {
      count -= 1;
      show(count);
    }
  }

  new ResizeObserver(reflow).observe(box);

  const widths = document.getElementById("menubar-overflow-widths");
  for (const button of widths.querySelectorAll("[data-width]")) {
    button.addEventListener("click", () => {
      box.style.inlineSize = `${button.dataset.width}px`;
      for (const other of widths.querySelectorAll("[data-width]")) {
        other.variant = other === button ? "solid" : "outline";
      }
    });
  }

  const picked = document.getElementById("menubar-overflow-picked");
  menubar.addEventListener("select", (event) => {
    picked.textContent = `${event.detail.menu} / ${event.detail.value}`;
  });
</script>
```

### 二级子菜单

XhMenubarSub 在菜单栏的一张菜单里再嵌一层：触发条目双重身份（菜单栏的方向键照常走、右方向键进子层），子层内用 XhMenu 系部件，选中带上所属菜单的身份汇到根并关掉整条菜单栏

```vue
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref("（还没选）");

function onSelect(details: { menu: string; value: string }): void {
  picked.value = `${details.menu} / ${details.value}`;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot @select="onSelect">
      <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="open">打开</XhMenubarItem>
          <XhMenubarItem value="save">保存</XhMenubarItem>
          <XhMenubarSeparator />

          <XhMenubarSub value="share">
            <XhMenubarSubTrigger>发送到…</XhMenubarSubTrigger>
            <XhMenuPositioner>
              <XhMenuContent>
                <XhMenuItem value="email">邮件</XhMenuItem>
                <XhMenuItem value="sms">短信</XhMenuItem>
              </XhMenuContent>
            </XhMenuPositioner>
          </XhMenubarSub>

          <XhMenubarSeparator />
          <XhMenubarItem value="close">关闭</XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>

      <XhMenubarTrigger value="edit">编辑</XhMenubarTrigger>
      <XhMenubarPositioner value="edit">
        <XhMenubarContent>
          <XhMenubarItem value="undo">撤销</XhMenubarItem>
          <XhMenubarItem value="redo">重做</XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>

    <p>选中：{{ picked }}</p>
  </div>
</template>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menubar>` |
| Vue 组件 | `XhMenubarArrow` `XhMenubarContent` `XhMenubarGroup` `XhMenubarGroupLabel` `XhMenubarItem` `XhMenubarItemDescription` `XhMenubarItemIndicator` `XhMenubarItemText` `XhMenubarPositioner` `XhMenubarRoot` `XhMenubarSeparator` `XhMenubarSub` `XhMenubarSubTrigger` `XhMenubarTrigger` |
| 组合式函数 | `useMenubar` |
| 状态机 | `menubarMachine` |
| 皮肤 | `@xihan-ui/styles/menubar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="menubar"`：**`root`** · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `MenubarNode[]` |  | 菜单栏数据，显示文本与禁用的事实源。给了它，入口与条目部件只需报 value。 缺省即回到「文本与禁用逐个写在部件上」的老路。 |
| `value` | `string \| null` |  | 当前展开项，给定即受控；null 表示都收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 菜单栏排布轴，默认 horizontal。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `disabled` | `boolean` |  | 整条菜单栏禁用，展开与选中都不发生。 |
| `typeahead` | `boolean` |  | 菜单内的连打检索，默认开。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<MenubarTranslations>` |  |  |
| `onValueChange` | `(details: MenubarValueChangeDetails) => void` |  | value 变化回调。 |
| `onSelect` | `(details: MenubarSelectDetails) => void` |  | 条目被选中；菜单随之收起。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `MenubarValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |
| `select` | `MenubarSelectDetails` | 条目被选中（菜单随之收起）；detail 为 `{ menu: string, value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenubarRoot` | `default` | `MenubarRootSlotProps` |  |
| `XhMenubarRoot` | `item` | `MenubarNodeMeta` |  |
| `XhMenubarSub` | `default` | `MenubarSubSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `open`

**事件**：`TRIGGER.TOGGLE` · `TRIGGER.OPEN` · `TRIGGER.POINTER` · `TRIGGER.FOCUS` · `CLOSE` · `MENUBAR.BLUR` · `VALUE.SET` · `ITEM.FOCUS` · `ITEM.LOST` · `ITEM.SELECT` · `SYNC.OPEN` · `SYNC.CLOSE`

**判据**：`hasValue` · `isCurrent` · `shouldAbsorbToggle` · `shouldSwitch`

## connect API

`useMenubar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的那一项；都收起时为 null。 |
| `collection` | `readonly MenubarNodeMeta[]` | collection 推出的入口元信息（各自带着它那张菜单的条目），按数据顺序排列；没给 collection 即空数组。 |
| `open` | `boolean` | 有没有菜单展开着。 |
| `focusedValue` | `string \| null` | trigger 的 roving 锚点；焦点不在菜单栏内时为 null。 |
| `focusedItem` | `string \| null` | 展开菜单内持有焦点的条目；无锚点时为 null。 |
| `orientation` | `Orientation` |  |
| `disabled` | `boolean` |  |
| `isOpen` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: MenubarTriggerProps) => T['button']` |  |
| `getPositionerProps` | `(props: MenubarContentProps) => T['element']` |  |
| `getContentProps` | `(props: MenubarContentProps) => T['element']` |  |
| `getItemProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: MenubarGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: MenubarGroupProps) => T['element']` |  |
| `getArrowProps` | `(props: MenubarContentProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in trigger, horizontal | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `ArrowLeft` | focus in trigger, horizontal | 焦点移到上一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `Home` | focus in trigger | 焦点移到首个可用 trigger |
| `End` | focus in trigger | 焦点移到末个可用 trigger |
| `ArrowDown` / `Enter` / `Space` | focus in trigger, horizontal | 展开本项的菜单；方向键入口把焦点落到首个可用条目，Enter/Space 让焦点留在 trigger 上 |
| `ArrowUp` | focus in trigger, horizontal | 展开本项的菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到本张菜单的首个可用条目 |
| `End` | open, focus in content | 焦点移到本张菜单的末个可用条目 |
| `ArrowRight` / `ArrowLeft` | open, focus in content | 切到相邻菜单并保持展开，焦点落到那一项的 trigger 上 |
| `a-z` / `0-9` | open, focus in content | 连打检索：焦点跳到首字母匹配的条目（同字符连打则在候选间轮换） |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并收起菜单，焦点归还 trigger |
| `Escape` | open | 收起菜单并把焦点留在 trigger 上 |
| `Tab` / `Shift+Tab` | open | 收起菜单，焦点不被抢回 trigger，按 Tab 序列自然离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-label` | props.translations.root |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'menubar' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `role` | 'menuitem' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
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

默认皮肤 `@xihan-ui/styles/menubar.css` 按部件选择：`[data-scope="menubar"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-menubar-arrow-size` · `--xh-menubar-bg` · `--xh-menubar-border` · `--xh-menubar-content-bg` · `--xh-menubar-content-fg` · `--xh-menubar-content-gap` · `--xh-menubar-content-px` · `--xh-menubar-content-py` · `--xh-menubar-content-radius` · `--xh-menubar-content-shadow` · `--xh-menubar-fg` · `--xh-menubar-gap` · `--xh-menubar-group-gap` · `--xh-menubar-group-label-fg` · `--xh-menubar-group-label-font-size` · `--xh-menubar-group-label-font-weight` · `--xh-menubar-group-label-px` · `--xh-menubar-group-label-py` · `--xh-menubar-icon-size` · `--xh-menubar-item-active-font-weight` · `--xh-menubar-item-bg-active` · `--xh-menubar-item-bg-hover` · `--xh-menubar-item-description-fg` · `--xh-menubar-item-description-font-size` · `--xh-menubar-item-fg` · `--xh-menubar-item-font-size` · `--xh-menubar-item-gap` · `--xh-menubar-item-indicator-fg` · `--xh-menubar-item-indicator-size` · `--xh-menubar-item-leading` · `--xh-menubar-item-px` · `--xh-menubar-item-py` · `--xh-menubar-item-radius` · `--xh-menubar-layer` · `--xh-menubar-max-h` · `--xh-menubar-max-w` · `--xh-menubar-min-w` · `--xh-menubar-px` · `--xh-menubar-py` · `--xh-menubar-radius` · `--xh-menubar-separator-color` · `--xh-menubar-separator-my` · `--xh-menubar-separator-thickness` · `--xh-menubar-trigger-bg-active` · `--xh-menubar-trigger-bg-hover` · `--xh-menubar-trigger-font-size` · `--xh-menubar-trigger-gap` · `--xh-menubar-trigger-px` · `--xh-menubar-trigger-py` · `--xh-menubar-trigger-radius`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 装不下时由宿主观测容器宽度，一次收起一个入口到"更多"里，收起的菜单在"更多"中各占一组。

## 最佳实践

- 入口名用单个名词，宽度尽量接近，避免展开时整排跳动。
- 常用命令在菜单里也标出快捷键，否则用户学不会绕开菜单栏。

## 反模式

- 入口超过七八个：找一条命令比翻文档还慢。
- 在菜单栏里放选项而不是命令。
