来源：https://ui.docs.xihanfun.com/components/toolbar

# 工具栏 `toolbar`

把一排控件收成一组：整条在 Tab 序列里只占一个位子，条内改用方向键走。

## 何时使用

- 编辑器的格式条、表格的操作条、图表的视图控制条。
- 控件多到逐个 Tab 走过去太慢。

## 何时不用

- 只有两三个按钮：直接摆，别为此接管键盘。
- 各控件之间是并列动作而非工具：用[按钮组](./button-group)。

## 特性

- 条目是作者自己的按钮，工具栏不接管它的点击。
- 分组只是把一伙控件在视觉上收紧，不是导航里多出来的一层：方向键照样一路走过去。
- 禁用走 `aria-disabled`：禁用项仍聚焦得上、仍能当方向键的起点，只是方向键路过时跳过它。
- 工具栏只定主轴与条目间距，怎么分布交给 CSS。

## 示例

### 基础用法

整条在 Tab 序列里只占一个位子，条内改用方向键走；条目是作者自己的按钮，工具条不接管它的点击

```vue
<script setup lang="ts">
import {
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 条目的观感归条目自己，工具条只补焦点环与禁用光标
const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};

const command = ref("（无）");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhToolbarRoot>
      <XhToolbarItem value="bold" :style="itemStyle" @click="command = '粗体'">
        粗体
      </XhToolbarItem>
      <XhToolbarItem value="italic" :style="itemStyle" @click="command = '斜体'">
        斜体
      </XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="link" :style="itemStyle" @click="command = '插入链接'">
        插入链接
      </XhToolbarItem>
    </XhToolbarRoot>

    <span>最近点击：{{ command }}</span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-toolbar id="toolbar-basic">
    <div data-xh-part="root">
      <!-- 条目的观感归条目自己，工具条只补焦点环与禁用光标 -->
      <button
        type="button"
        data-xh-part="item"
        value="bold"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        粗体
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="italic"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        斜体
      </button>
      <div data-xh-part="separator"></div>
      <button
        type="button"
        data-xh-part="item"
        value="link"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        插入链接
      </button>
    </div>
  </xh-toolbar>

  <span id="toolbar-basic-log">最近点击：（无）</span>
</div>

<script type="module">
  // 点击归条目自己，工具条不接管
  const toolbar = document.getElementById("toolbar-basic");
  const log = document.getElementById("toolbar-basic-log");
  for (const item of toolbar.querySelectorAll('[data-xh-part="item"]')) {
    item.addEventListener("click", () => {
      log.textContent = `最近点击：${item.textContent.trim()}`;
    });
  }
</script>
```

### 分组

分组只是把一伙控件在视觉上收紧，不是导航里多出来的一层：方向键照样一路走过去

```vue
<script setup lang="ts">
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
</script>

<template>
  <XhToolbarRoot style="inline-size: 100%">
    <XhToolbarItem value="undo" :style="itemStyle">撤销</XhToolbarItem>
    <XhToolbarItem value="redo" :style="itemStyle">重做</XhToolbarItem>
    <XhToolbarSeparator />
    <XhToolbarGroup>
      <XhToolbarItem value="align-left" :style="itemStyle">左对齐</XhToolbarItem>
      <XhToolbarItem value="align-center" :style="itemStyle">居中</XhToolbarItem>
      <XhToolbarItem value="align-right" :style="itemStyle">右对齐</XhToolbarItem>
    </XhToolbarGroup>
  </XhToolbarRoot>
</template>
```

```html
<xh-toolbar style="inline-size: 100%">
  <div data-xh-part="root">
    <button
      type="button"
      data-xh-part="item"
      value="undo"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      撤销
    </button>
    <button
      type="button"
      data-xh-part="item"
      value="redo"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      重做
    </button>
    <div data-xh-part="separator"></div>
    <div data-xh-part="group">
      <button
        type="button"
        data-xh-part="item"
        value="align-left"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        左对齐
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="align-center"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        居中
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="align-right"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        右对齐
      </button>
    </div>
  </div>
</xh-toolbar>
```

### 竖排

orientation 决定方向键收哪一对键（另一轴原样放行给页面），分隔线的朝向恒与主轴垂直

```vue
<script setup lang="ts">
import {
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
</script>

<template>
  <XhToolbarRoot orientation="vertical" style="inline-size: 140px">
    <XhToolbarItem value="zoom-in" :style="itemStyle">放大</XhToolbarItem>
    <XhToolbarItem value="zoom-out" :style="itemStyle">缩小</XhToolbarItem>
    <XhToolbarSeparator />
    <XhToolbarItem value="fit" :style="itemStyle">适应画布</XhToolbarItem>
  </XhToolbarRoot>
</template>
```

```html
<xh-toolbar orientation="vertical" style="inline-size: 140px">
  <div data-xh-part="root">
    <button
      type="button"
      data-xh-part="item"
      value="zoom-in"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      放大
    </button>
    <button
      type="button"
      data-xh-part="item"
      value="zoom-out"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      缩小
    </button>
    <div data-xh-part="separator"></div>
    <button
      type="button"
      data-xh-part="item"
      value="fit"
      style="
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--xh-border-default);
        background: var(--xh-bg-surface);
      "
    >
      适应画布
    </button>
  </div>
</xh-toolbar>
```

### 禁用

禁用走 aria-disabled 而非原生 disabled：禁用项仍聚焦得上、仍能当方向键的起点，只是方向键路过时跳过它

```vue
<script setup lang="ts">
import {
  XhSwitch,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};

const locked = ref(false);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhToolbarRoot :disabled="locked">
      <XhToolbarItem value="cut" :style="itemStyle">剪切</XhToolbarItem>
      <!-- 单项禁用：整条没锁时，方向键也只跳过这一项 -->
      <XhToolbarItem value="paste" :style="itemStyle" disabled>
        粘贴（禁用）
      </XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="delete" :style="itemStyle">删除</XhToolbarItem>
    </XhToolbarRoot>

    <label style="display: flex; align-items: center; gap: 8px">
      <XhSwitch v-model:checked="locked" />
      整条禁用（方向键当场不再接管，焦点进来就停在容器上）
    </label>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-toolbar id="toolbar-disabled">
    <div data-xh-part="root">
      <button
        type="button"
        data-xh-part="item"
        value="cut"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        剪切
      </button>
      <!-- 单项禁用：整条没锁时，方向键也只跳过这一项 -->
      <button
        type="button"
        data-xh-part="item"
        value="paste"
        aria-disabled="true"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        粘贴（禁用）
      </button>
      <div data-xh-part="separator"></div>
      <button
        type="button"
        data-xh-part="item"
        value="delete"
        style="
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
        "
      >
        删除
      </button>
    </div>
  </xh-toolbar>

  <label style="display: flex; align-items: center; gap: 8px">
    <xh-switch id="toolbar-disabled-lock">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    整条禁用（方向键当场不再接管，焦点进来就停在容器上）
  </label>
</div>

<script type="module">
  // 整条禁用由宿主说了算
  const toolbar = document.getElementById("toolbar-disabled");
  const lock = document.getElementById("toolbar-disabled-lock");
  lock.addEventListener("checked-change", (event) => {
    toolbar.toggleAttribute("disabled", event.detail.checked);
  });
</script>
```

### 尺寸

size 只换整条的内边距与条目间的间距，条目自身的高度与字号归条目的皮肤管

```vue
<script setup lang="ts">
import {
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>sm</span>
      <XhToolbarRoot size="sm">
        <XhToolbarItem value="sm-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="sm-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="sm-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>缺省</span>
      <XhToolbarRoot>
        <XhToolbarItem value="md-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="md-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="md-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>lg</span>
      <XhToolbarRoot size="lg">
        <XhToolbarItem value="lg-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="lg-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="lg-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>sm</span>
    <xh-toolbar size="sm">
      <div data-xh-part="root">
        <button
          type="button"
          data-xh-part="item"
          value="sm-bold"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          粗体
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="sm-italic"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          斜体
        </button>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="sm-link"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          链接
        </button>
      </div>
    </xh-toolbar>
  </div>

  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>缺省</span>
    <xh-toolbar>
      <div data-xh-part="root">
        <button
          type="button"
          data-xh-part="item"
          value="md-bold"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          粗体
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="md-italic"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          斜体
        </button>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="md-link"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          链接
        </button>
      </div>
    </xh-toolbar>
  </div>

  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>lg</span>
    <xh-toolbar size="lg">
      <div data-xh-part="root">
        <button
          type="button"
          data-xh-part="item"
          value="lg-bold"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          粗体
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="lg-italic"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          斜体
        </button>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="lg-link"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          链接
        </button>
      </div>
    </xh-toolbar>
  </div>
</div>
```

### 图标条目

只画图标的条目必须自带无障碍名：aria-label 直接写在条目上，透传到那一层 DOM

```vue
<script setup lang="ts">
import {
  XhIcon,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 描边取 currentColor，图标颜色随条目文字色走
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const UndoIcon = {
  name: "undo",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M4 10H15A5 5 0 0 1 15 20H10" } },
    { tag: "path", attrs: { d: "M8 6L4 10L8 14" } },
  ],
} as const;

const RedoIcon = {
  name: "redo",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M20 10H9A5 5 0 0 0 9 20H14" } },
    { tag: "path", attrs: { d: "M16 6L20 10L16 14" } },
  ],
} as const;

const AlignLeftIcon = {
  name: "align-left",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 6H20M4 12H14M4 18H18" } }],
} as const;

const AlignCenterIcon = {
  name: "align-center",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 6H20M7 12H17M5 18H19" } }],
} as const;

const AlignRightIcon = {
  name: "align-right",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 6H20M10 12H20M6 18H20" } }],
} as const;

// 条目的观感归条目自己，工具条只补焦点环与禁用光标
const itemStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
  color: "inherit",
};

const command = ref("（无）");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhToolbarRoot>
      <XhToolbarItem
        value="undo"
        :style="itemStyle"
        aria-label="撤销"
        @click="command = '撤销'"
      >
        <XhIcon :icon="UndoIcon" size="sm" />
      </XhToolbarItem>
      <XhToolbarItem
        value="redo"
        :style="itemStyle"
        aria-label="重做"
        @click="command = '重做'"
      >
        <XhIcon :icon="RedoIcon" size="sm" />
      </XhToolbarItem>

      <XhToolbarSeparator />

      <XhToolbarGroup>
        <XhToolbarItem
          value="align-left"
          :style="itemStyle"
          aria-label="左对齐"
          @click="command = '左对齐'"
        >
          <XhIcon :icon="AlignLeftIcon" size="sm" />
        </XhToolbarItem>
        <XhToolbarItem
          value="align-center"
          :style="itemStyle"
          aria-label="居中"
          @click="command = '居中'"
        >
          <XhIcon :icon="AlignCenterIcon" size="sm" />
        </XhToolbarItem>
        <XhToolbarItem
          value="align-right"
          :style="itemStyle"
          aria-label="右对齐"
          @click="command = '右对齐'"
        >
          <XhIcon :icon="AlignRightIcon" size="sm" />
        </XhToolbarItem>
      </XhToolbarGroup>
    </XhToolbarRoot>

    <span>最近点击：{{ command }}</span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-toolbar id="toolbar-icon">
    <div data-xh-part="root">
      <!-- 条目的观感归条目自己，工具条只补焦点环与禁用光标 -->
      <button
        type="button"
        data-xh-part="item"
        value="undo"
        aria-label="撤销"
        style="
          display: inline-flex;
          align-items: center;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
          color: inherit;
        "
      >
        <xh-icon size="sm">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </button>
      <button
        type="button"
        data-xh-part="item"
        value="redo"
        aria-label="重做"
        style="
          display: inline-flex;
          align-items: center;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid var(--xh-border-default);
          background: var(--xh-bg-surface);
          color: inherit;
        "
      >
        <xh-icon size="sm">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </button>

      <div data-xh-part="separator"></div>

      <div data-xh-part="group">
        <button
          type="button"
          data-xh-part="item"
          value="align-left"
          aria-label="左对齐"
          style="
            display: inline-flex;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
            color: inherit;
          "
        >
          <xh-icon size="sm">
            <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
          </xh-icon>
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="align-center"
          aria-label="居中"
          style="
            display: inline-flex;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
            color: inherit;
          "
        >
          <xh-icon size="sm">
            <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
          </xh-icon>
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="align-right"
          aria-label="右对齐"
          style="
            display: inline-flex;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
            color: inherit;
          "
        >
          <xh-icon size="sm">
            <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
          </xh-icon>
        </button>
      </div>
    </div>
  </xh-toolbar>

  <span id="toolbar-icon-log">最近点击：（无）</span>
</div>

<script type="module">
  // 描边取 currentColor，图标颜色随条目文字色走
  const strokeAttrs = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  // 图标记录是对象，只走 property；键与条目的 value 一一对应
  const icons = {
    "undo": {
      name: "undo",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M4 10H15A5 5 0 0 1 15 20H10" } },
        { tag: "path", attrs: { d: "M8 6L4 10L8 14" } },
      ],
    },
    "redo": {
      name: "redo",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M20 10H9A5 5 0 0 0 9 20H14" } },
        { tag: "path", attrs: { d: "M16 6L20 10L16 14" } },
      ],
    },
    "align-left": {
      name: "align-left",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 6H20M4 12H14M4 18H18" } }],
    },
    "align-center": {
      name: "align-center",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 6H20M7 12H17M5 18H19" } }],
    },
    "align-right": {
      name: "align-right",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 6H20M10 12H20M6 18H20" } }],
    },
  };

  const toolbar = document.getElementById("toolbar-icon");
  const log = document.getElementById("toolbar-icon-log");
  for (const item of toolbar.querySelectorAll('[data-xh-part="item"]')) {
    const name = item.getAttribute("value");
    item.querySelector("xh-icon").icon = icons[name];
    item.addEventListener("click", () => {
      log.textContent = `最近点击：${item.getAttribute("aria-label")}`;
    });
  }
</script>
```

### 对齐与分布

工具条只定主轴与条目间距，怎么分布交给 CSS：justify-content 一改，同一条就贴尾、居中或两端摊开

```vue
<script setup lang="ts">
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};

// 分布方式写在 root 的内联样式上，条目的 DOM 顺序不动，方向键行程也就不受影响
const layouts = [
  { value: "flex-end", label: "贴尾" },
  { value: "center", label: "居中" },
  { value: "space-between", label: "两端摊开" },
];
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div v-for="l in layouts" :key="l.value" style="display: grid; gap: 6px">
      <span>{{ l.label }}</span>
      <XhToolbarRoot :style="{ justifyContent: l.value }">
        <XhToolbarGroup>
          <XhToolbarItem :value="`${l.value}-undo`" :style="itemStyle">
            撤销
          </XhToolbarItem>
          <XhToolbarItem :value="`${l.value}-redo`" :style="itemStyle">
            重做
          </XhToolbarItem>
        </XhToolbarGroup>
        <XhToolbarSeparator />
        <XhToolbarItem :value="`${l.value}-publish`" :style="itemStyle">
          发布
        </XhToolbarItem>
      </XhToolbarRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%">
  <div style="display: grid; gap: 6px">
    <span>贴尾</span>
    <xh-toolbar>
      <!-- 分布方式写在 root 上，条目的 DOM 顺序不动，方向键行程也就不受影响 -->
      <div data-xh-part="root" style="justify-content: flex-end">
        <div data-xh-part="group">
          <button
            type="button"
            data-xh-part="item"
            value="flex-end-undo"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            撤销
          </button>
          <button
            type="button"
            data-xh-part="item"
            value="flex-end-redo"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            重做
          </button>
        </div>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="flex-end-publish"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          发布
        </button>
      </div>
    </xh-toolbar>
  </div>

  <div style="display: grid; gap: 6px">
    <span>居中</span>
    <xh-toolbar>
      <div data-xh-part="root" style="justify-content: center">
        <div data-xh-part="group">
          <button
            type="button"
            data-xh-part="item"
            value="center-undo"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            撤销
          </button>
          <button
            type="button"
            data-xh-part="item"
            value="center-redo"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            重做
          </button>
        </div>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="center-publish"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          发布
        </button>
      </div>
    </xh-toolbar>
  </div>

  <div style="display: grid; gap: 6px">
    <span>两端摊开</span>
    <xh-toolbar>
      <div data-xh-part="root" style="justify-content: space-between">
        <div data-xh-part="group">
          <button
            type="button"
            data-xh-part="item"
            value="space-between-undo"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            撤销
          </button>
          <button
            type="button"
            data-xh-part="item"
            value="space-between-redo"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            重做
          </button>
        </div>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="space-between-publish"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          发布
        </button>
      </div>
    </xh-toolbar>
  </div>
</div>
```

### 形态

surface 让工具条自己画一块面，plain 不画：贴在编辑区顶上时用 plain，浮在内容之上时用 surface

```vue
<script setup lang="ts">
import { XhToolbarItem, XhToolbarRoot, XhToolbarSeparator } from "@xihan-ui/vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>surface（缺省）</span>
      <XhToolbarRoot variant="surface">
        <XhToolbarItem value="surface-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="surface-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="surface-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>plain</span>
      <XhToolbarRoot variant="plain">
        <XhToolbarItem value="plain-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="plain-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="plain-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>surface（缺省）</span>
    <xh-toolbar variant="surface">
      <div data-xh-part="root">
        <button
          type="button"
          data-xh-part="item"
          value="surface-bold"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          粗体
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="surface-italic"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          斜体
        </button>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="surface-link"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          链接
        </button>
      </div>
    </xh-toolbar>
  </div>

  <div style="display: flex; flex-direction: column; gap: 6px">
    <span>plain</span>
    <xh-toolbar variant="plain">
      <div data-xh-part="root">
        <button
          type="button"
          data-xh-part="item"
          value="plain-bold"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          粗体
        </button>
        <button
          type="button"
          data-xh-part="item"
          value="plain-italic"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          斜体
        </button>
        <div data-xh-part="separator"></div>
        <button
          type="button"
          data-xh-part="item"
          value="plain-link"
          style="
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--xh-border-default);
            background: var(--xh-bg-surface);
          "
        >
          链接
        </button>
      </div>
    </xh-toolbar>
  </div>
</div>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toolbar>` |
| Vue 组件 | `XhToolbarGroup` `XhToolbarItem` `XhToolbarRoot` `XhToolbarSeparator` |
| 组合式函数 | `useToolbar` |
| 状态机 | `toolbarMachine` |
| 皮肤 | `@xihan-ui/styles/toolbar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toolbar"`：**`root`** · `group` · **`item`** · `separator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `Orientation` |  | 主轴，默认 horizontal。它决定 root 的 aria-orientation、方向键收哪一对键 （另一轴原样放行给页面），以及分隔线的朝向（恒与主轴垂直）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整条禁用：条目全部转 aria-disabled，方向键不再接管。 |
| `variant` | `ToolbarVariant` |  | 形态：plain / surface，决定工具条自己画不画一块面。缺省 surface。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。工具条是布局容器，只换排布尺寸，不带语气。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolbarRoot` | `default` | `ToolbarRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`ITEM.FOCUS` · `TOOLBAR.BLUR`

## connect API

`useToolbar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在工具条内时为 null。 |
| `orientation` | `Orientation` | 生效的主轴。 |
| `separatorOrientation` | `Orientation` | 分隔线的朝向：恒与主轴垂直（横排工具条里的分隔线是竖线）。 |
| `disabled` | `boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ToolbarItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | roving tabindex（恒开） | 整条只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投给第一个可停留条目 |
| `ArrowRight` / `ArrowDown` | 焦点在条内且未整条禁用；横排收 ArrowRight、竖排收 ArrowDown | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | 焦点在条内且未整条禁用；横排收 ArrowLeft、竖排收 ArrowUp | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowRight 承担 |
| `Home` | 焦点在条内且未整条禁用 | 焦点移到首个可停留条目 |
| `End` | 焦点在条内且未整条禁用 | 焦点移到末个可停留条目 |
| `交叉轴的两个方向键` | 焦点在条内（横排按上下、竖排按左右） | 不归工具条管：原样放行给页面滚动与读屏，绝不 preventDefault |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'toolbar' |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `separator` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `separator` | `role` | 'separator' |

## 样式

默认皮肤 `@xihan-ui/styles/toolbar.css` 按部件选择：`[data-scope="toolbar"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toolbar-bg` · `--xh-toolbar-bg-disabled` · `--xh-toolbar-border` · `--xh-toolbar-fg` · `--xh-toolbar-gap` · `--xh-toolbar-group-gap` · `--xh-toolbar-px` · `--xh-toolbar-py` · `--xh-toolbar-radius` · `--xh-toolbar-separator-color` · `--xh-toolbar-separator-gap` · `--xh-toolbar-separator-inset` · `--xh-toolbar-separator-radius` · `--xh-toolbar-separator-thickness`

## 动效

`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 条目用[切换按钮](./toggle)、[切换按钮组](./toggle-group)、[菜单](./menu)的触发器；分组之间放[分隔线](./separator)。

## 最佳实践

- 只画图标的条目必须自带 `aria-label`。
- 尺寸只写在条上，条目自身的高度与字号归条目的皮肤管。

## 反模式

- 在工具栏里放文本输入：方向键会被输入框吃掉，条内导航当场失效。
- 把整页的所有动作都塞进一条工具栏。
