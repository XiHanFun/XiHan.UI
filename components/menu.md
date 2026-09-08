来源：https://ui.docs.xihanfun.com/components/menu

# 菜单 `menu`

由一个触发器弹出的一列命令。选中一条即执行并收起。

## 何时使用

- 一组动作放不下、或不值得全部摆在界面上（更多操作、账户菜单）。
- 需要二级子菜单的命令树。

## 何时不用

- 要选一个值并保留选中态：那是[选择器](./select)——菜单的条目是命令，选完就关，不留选中。
- 只有一两个动作：直接摆[按钮](./button)。
- 是站点的主导航：用[导航菜单](./navigation-menu)，它的条目是链接。

## 特性

- 悬停触发有安全三角：指针斜穿赶往浮层不会误收，走岔或停滞才收起；延时可调。
- 条目以 `value` 标识身份，禁用项方向键跳过也选不中。
- `content` 里可以直接放任意节点；不是 `item` 就不进方向键行程，也选不中。
- 子菜单触发条目双重身份：父层方向键照常走、右方向键进子层、子层左方向键退回。
- 条目可按 `group` 分组，组标题写在 `group-label` 上，两者以 `aria-labelledby` 相认；分组不改变方向键行程。

## 示例

### 基础用法

条目以 value 标识身份，禁用项方向键跳过也选不中；删除前面隔着一道分隔线

```vue
<script setup lang="ts">
import { XhMenuRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const actions = [
  { value: "copy", label: "复制" },
  { value: "paste", label: "粘贴" },
  // 禁用项会被方向键跳过，也选不中；separatorBefore 在它前面隔一道
  { value: "delete", label: "删除", disabled: true, separatorBefore: true },
];

const picked = ref("");

function onSelect(details: { value: string }): void {
  picked.value = details.value;
}
</script>

<template>
  <!-- 触发器的内容归作者，走 trigger 插槽 -->
  <XhMenuRoot :collection="actions" @select="onSelect">
    <template #trigger>操作</template>
  </XhMenuRoot>
  <span>最近选中：{{ picked || "（无）" }}</span>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menu id="menu-basic">
    <!-- 触发器的内容归作者 -->
    <button data-xh-part="trigger">操作</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="paste">粘贴</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete" aria-disabled="true">删除</div>
      </div>
    </div>
  </xh-menu>

  <span>最近选中：<span id="menu-basic-readout">（无）</span></span>
</div>

<script type="module">
  // 选中的条目值回显在下面那行文字里
  const menu = document.getElementById("menu-basic");
  const readout = document.getElementById("menu-basic-readout");
  menu.addEventListener("select", (event) => {
    readout.textContent = event.detail.value;
  });
</script>
```

### 受控

传了 open 就由宿主说了算，组件只发 open-change 不自己改展开态

```vue
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <!-- 外部按钮直接改 open，菜单照样展开 -->
  <button type="button" @click="open = !open">
    {{ open ? "从外面收起" : "从外面展开" }}
  </button>

  <XhMenuRoot v-model:open="open">
    <XhMenuTrigger>操作</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="rename">重命名</XhMenuItem>
        <XhMenuItem value="duplicate">创建副本</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>

  <span>当前：{{ open ? "展开" : "收起" }}</span>
</template>
```

```html
<div style="inline-size: 100%; display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
  <!-- 外部按钮直接改 open，菜单照样展开 -->
  <button type="button" id="menu-controlled-toggle">从外面展开</button>

  <xh-menu id="menu-controlled" open="false">
    <button data-xh-part="trigger">操作</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="item" value="duplicate">创建副本</div>
      </div>
    </div>
  </xh-menu>

  <span>当前：<span id="menu-controlled-state">收起</span></span>
</div>

<script type="module">
  // 展开态由这段脚本持有：组件只发意图，写回 open 才真的展开
  const menu = document.getElementById("menu-controlled");
  const toggle = document.getElementById("menu-controlled-toggle");
  const readout = document.getElementById("menu-controlled-state");

  function apply(open) {
    menu.open = open;
    toggle.textContent = open ? "从外面收起" : "从外面展开";
    readout.textContent = open ? "展开" : "收起";
  }

  toggle.addEventListener("click", () => apply(!menu.open));
  menu.addEventListener("open-change", (event) => apply(event.detail.open));
</script>
```

### 放置位与箭头

placement 只是首选位，空间不够时定位引擎会自动翻面；arrow 指回触发器

```vue
<script setup lang="ts">
import {
  XhMenuArrow,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenuRoot placement="right-start" :offset="12">
    <XhMenuTrigger>贴右侧展开</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="profile">个人资料</XhMenuItem>
        <XhMenuItem value="settings">偏好设置</XhMenuItem>
        <XhMenuItem value="logout">退出登录</XhMenuItem>
      </XhMenuContent>
      <!-- 箭头挂在 positioner 上，位置由引擎回填 -->
      <XhMenuArrow />
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
```

```html
<xh-menu placement="right-start" offset="12">
  <button data-xh-part="trigger">贴右侧展开</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="profile">个人资料</div>
      <div data-xh-part="item" value="settings">偏好设置</div>
      <div data-xh-part="item" value="logout">退出登录</div>
    </div>
    <!-- 箭头挂在 positioner 上，位置由引擎回填 -->
    <div data-xh-part="arrow"></div>
  </div>
</xh-menu>
```

### 语气

tone 决定条目高亮用哪族颜色；静止态看不出来，展开后悬停条目、或用方向键把焦点移上去才显现

```vue
<script setup lang="ts">
import { XhMenuRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const actions = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "删除", separatorBefore: true },
];
</script>

<template>
  <!-- 六个各自独立的菜单，逐个展开对比条目高亮底色 -->
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhMenuRoot v-for="tone in tones" :key="tone" :collection="actions" :tone="tone">
      <template #trigger>{{ tone }}</template>
    </XhMenuRoot>
  </div>
</template>
```

```html
<!-- 六个各自独立的菜单，逐个展开对比条目高亮底色 -->
<div style="display: flex; flex-wrap: wrap; gap: 8px">
  <xh-menu tone="brand">
    <button data-xh-part="trigger">brand</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="neutral">
    <button data-xh-part="trigger">neutral</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="success">
    <button data-xh-part="trigger">success</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="warning">
    <button data-xh-part="trigger">warning</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="danger">
    <button data-xh-part="trigger">danger</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
  <xh-menu tone="info">
    <button data-xh-part="trigger">info</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="copy">复制</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
</div>
```

### 尺寸

size 换的是条目的内边距、间距与字号；三档各挂一个菜单，逐个展开对比

```vue
<script setup lang="ts">
import { XhMenuRoot } from "@xihan-ui/vue";

const account = [
  { value: "profile", label: "个人资料" },
  { value: "settings", label: "偏好设置" },
  { value: "logout", label: "退出登录" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhMenuRoot :collection="account" size="sm">
      <template #trigger>sm</template>
    </XhMenuRoot>

    <!-- 不写 size 就是缺省档 -->
    <XhMenuRoot :collection="account">
      <template #trigger>缺省</template>
    </XhMenuRoot>

    <XhMenuRoot :collection="account" size="lg">
      <template #trigger>lg</template>
    </XhMenuRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 8px">
  <xh-menu size="sm">
    <button data-xh-part="trigger">sm</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="profile">个人资料</div>
        <div data-xh-part="item" value="settings">偏好设置</div>
        <div data-xh-part="item" value="logout">退出登录</div>
      </div>
    </div>
  </xh-menu>

  <!-- 不写 size 就是缺省档 -->
  <xh-menu>
    <button data-xh-part="trigger">缺省</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="profile">个人资料</div>
        <div data-xh-part="item" value="settings">偏好设置</div>
        <div data-xh-part="item" value="logout">退出登录</div>
      </div>
    </div>
  </xh-menu>

  <xh-menu size="lg">
    <button data-xh-part="trigger">lg</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="profile">个人资料</div>
        <div data-xh-part="item" value="settings">偏好设置</div>
        <div data-xh-part="item" value="logout">退出登录</div>
      </div>
    </div>
  </xh-menu>
</div>
```

### 条目里的图标与快捷键

条目内容归作者：前面挂图标、后面挂快捷键，皮肤把它们按 flex 排开

```vue
<script setup lang="ts">
import {
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";

// 三个图标共用一套描边呈现属性，stroke 取 currentColor，颜色随条目的文字色走
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const CopyIcon = {
  name: "copy",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "rect", attrs: { x: "9", y: "9", width: "11", height: "11", rx: "2" } },
    { tag: "path", attrs: { d: "M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5" } },
  ],
} as const;

const EditIcon = {
  name: "edit",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M4 20H8L19 9A2.8 2.8 0 0 0 15 5L4 16Z" } }],
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

// 快捷键提示推到条目末端，颜色压暗一档
const hintStyle = {
  marginInlineStart: "auto",
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger>编辑</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="copy">
          <XhIcon :icon="CopyIcon" size="sm" />
          <span>复制</span>
          <span :style="hintStyle">Ctrl+C</span>
        </XhMenuItem>
        <XhMenuItem value="rename">
          <XhIcon :icon="EditIcon" size="sm" />
          <span>重命名</span>
          <span :style="hintStyle">F2</span>
        </XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="delete">
          <XhIcon :icon="TrashIcon" size="sm" />
          <span>删除</span>
          <span :style="hintStyle">Del</span>
        </XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
```

```html
<xh-menu id="menu-icon">
  <button data-xh-part="trigger">编辑</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="copy">
        <xh-icon size="sm" data-glyph="copy">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
        <span>复制</span>
        <!-- 快捷键提示推到条目末端，颜色压暗一档 -->
        <span style="margin-inline-start: auto; color: var(--xh-fg-muted)">Ctrl+C</span>
      </div>
      <div data-xh-part="item" value="rename">
        <xh-icon size="sm" data-glyph="edit">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
        <span>重命名</span>
        <span style="margin-inline-start: auto; color: var(--xh-fg-muted)">F2</span>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete">
        <xh-icon size="sm" data-glyph="trash">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
        <span>删除</span>
        <span style="margin-inline-start: auto; color: var(--xh-fg-muted)">Del</span>
      </div>
    </div>
  </div>
</xh-menu>

<script type="module">
  // 三个图标共用一套描边呈现属性，stroke 取 currentColor，颜色随条目的文字色走
  const strokeAttrs = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const icons = {
    copy: {
      name: "copy",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "rect", attrs: { x: "9", y: "9", width: "11", height: "11", rx: "2" } },
        { tag: "path", attrs: { d: "M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5" } },
      ],
    },
    edit: {
      name: "edit",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M4 20H8L19 9A2.8 2.8 0 0 0 15 5L4 16Z" } }],
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
  for (const el of document.getElementById("menu-icon").querySelectorAll("xh-icon")) {
    el.icon = icons[el.dataset.glyph];
  }
</script>
```

### 菜单里的非条目内容

content 里可以直接放任意节点；不是 item 就不进方向键行程，也选不中

```vue
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger>账号</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <!-- 这一块是普通节点：方向键从首个条目起步，不会停在它上面 -->
        <div style="display: grid; gap: 4px; padding: 8px 8px 6px">
          <span style="font-weight: 600">曦寒</span>
          <span style="font-size: 12px; color: var(--xh-fg-muted)">
            已用 6.2 GB / 20 GB
          </span>
        </div>

        <XhMenuSeparator />

        <XhMenuItem value="profile">个人资料</XhMenuItem>
        <XhMenuItem value="billing">账单与用量</XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="logout">退出登录</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
```

```html
<xh-menu>
  <button data-xh-part="trigger">账号</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <!-- 这一块是普通节点：方向键从首个条目起步，不会停在它上面 -->
      <div style="display: grid; gap: 4px; padding: 8px 8px 6px">
        <span style="font-weight: 600">曦寒</span>
        <span style="font-size: 12px; color: var(--xh-fg-muted)">已用 6.2 GB / 20 GB</span>
      </div>

      <div data-xh-part="separator"></div>

      <div data-xh-part="item" value="profile">个人资料</div>
      <div data-xh-part="item" value="billing">账单与用量</div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="logout">退出登录</div>
    </div>
  </div>
</xh-menu>
```

### 条目自带的属性与事件

条目上的原生属性照常生效，自己挂的 click 与内部的选中处理并存

```vue
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const trace = ref<string[]>([]);

function push(text: string): void {
  trace.value = [text, ...trace.value].slice(0, 4);
}

function onSelect(details: { value: string }): void {
  push(`菜单的 select：${details.value}`);
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenuRoot @select="onSelect">
      <XhMenuTrigger>导出</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <!-- title 是原生属性，悬停就出提示；@click 与内部的选中处理两边都会跑 -->
          <XhMenuItem
            value="csv"
            title="逗号分隔，表格软件直接打得开"
            @click="push('条目自己的 click：csv')"
          >
            导出 CSV
          </XhMenuItem>
          <XhMenuItem value="json" title="结构化数据，留给程序读">
            导出 JSON
          </XhMenuItem>
          <XhMenuItem value="pdf" disabled title="当前视图不支持">
            导出 PDF
          </XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>

    <ol style="display: grid; gap: 4px; margin: 0; padding-inline-start: 20px">
      <li v-for="(line, index) in trace" :key="index">{{ line }}</li>
      <li v-if="trace.length === 0">（还没动过）</li>
    </ol>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menu id="menu-item-attrs">
    <button data-xh-part="trigger">导出</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <!-- title 是原生属性，悬停就出提示 -->
        <div data-xh-part="item" value="csv" title="逗号分隔，表格软件直接打得开">导出 CSV</div>
        <div data-xh-part="item" value="json" title="结构化数据，留给程序读">导出 JSON</div>
        <div data-xh-part="item" value="pdf" aria-disabled="true" title="当前视图不支持">
          导出 PDF
        </div>
      </div>
    </div>
  </xh-menu>

  <ol id="menu-item-attrs-trace" style="display: grid; gap: 4px; margin: 0; padding-inline-start: 20px">
    <li>（还没动过）</li>
  </ol>
</div>

<script type="module">
  // 最近四条动静倒序列在下面
  const menu = document.getElementById("menu-item-attrs");
  const list = document.getElementById("menu-item-attrs-trace");
  const trace = [];

  function push(text) {
    trace.unshift(text);
    trace.length = Math.min(trace.length, 4);
    list.replaceChildren(
      ...trace.map((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        return li;
      }),
    );
  }

  // 条目自己的 click 与菜单内部的选中处理两边都会跑
  const csv = menu.querySelector('[data-xh-part="item"][value="csv"]');
  csv.addEventListener("click", () => push("条目自己的 click：csv"));
  menu.addEventListener("select", (event) => push(`菜单的 select：${event.detail.value}`));
</script>
```

### 悬停触发

open-on-hover 一个 prop：进触发器延时展开，离开后指针经安全三角赶往浮层不误收，走岔或停滞才收起；延时可调

```vue
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenuRoot open-on-hover :hover-open-delay="80" @select="() => {}">
    <XhMenuTrigger>悬停打开</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="profile">个人资料</XhMenuItem>
        <XhMenuItem value="settings">偏好设置</XhMenuItem>
        <XhMenuItem value="logout">退出登录</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
```

```html
<xh-menu open-on-hover hover-open-delay="80">
  <button data-xh-part="trigger">悬停打开</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="profile">个人资料</div>
      <div data-xh-part="item" value="settings">偏好设置</div>
      <div data-xh-part="item" value="logout">退出登录</div>
    </div>
  </div>
</xh-menu>
```

### 分组与标记位

组标题与组内条目用 role="group" 加 aria-labelledby 对上；中间包一层不影响方向键行程，条目里标记位与文字各占一段

```vue
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhMenuContent,
  XhMenuGroup,
  XhMenuGroupLabel,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const groups = [
  {
    value: "density",
    label: "行高",
    items: [
      { value: "compact", label: "紧凑" },
      { value: "comfortable", label: "宽松" },
    ],
  },
  {
    value: "panel",
    label: "面板",
    items: [
      { value: "sidebar", label: "侧栏" },
      { value: "inspector", label: "属性面板" },
    ],
  },
];

const density = ref("comfortable");
const panels = ref<string[]>(["sidebar"]);

function checked(group: string, value: string): boolean {
  return group === "density" ? density.value === value : panels.value.includes(value);
}

function onSelect(details: { value: string }): void {
  if (details.value === "compact" || details.value === "comfortable") {
    density.value = details.value;
    return;
  }
  panels.value = panels.value.includes(details.value)
    ? panels.value.filter(v => v !== details.value)
    : [...panels.value, details.value];
}

// 标记位恒占一格，勾不勾都不推动后面的文字
const markStyle = {
  flex: "none",
  inlineSize: "14px",
};
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenuRoot @select="onSelect">
      <XhMenuTrigger>视图</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <template v-for="(g, index) in groups" :key="g.value">
            <XhMenuSeparator v-if="index > 0" />
            <XhMenuGroup :value="g.value">
              <XhMenuGroupLabel>{{ g.label }}</XhMenuGroupLabel>
              <XhMenuItem v-for="item in g.items" :key="item.value" :value="item.value">
                <span :style="markStyle"><XhIcon v-if="checked(g.value, item.value)" :icon="CheckIcon" /></span>
                <span>{{ item.label }}</span>
              </XhMenuItem>
            </XhMenuGroup>
          </template>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>

    <span>
      行高：{{ density === "compact" ? "紧凑" : "宽松" }}；面板：{{
        panels.length ? `${panels.length} 个` : "都收起了"
      }}
    </span>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <xh-menu id="menu-group">
    <button data-xh-part="trigger">视图</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="group" value="density">
          <span data-xh-part="group-label">行高</span>
          <div data-xh-part="item" value="compact">
            <!-- 标记位恒占一格，勾不勾都不推动后面的文字 -->
            <span style="flex: none; inline-size: 14px"></span>
            <span>紧凑</span>
          </div>
          <div data-xh-part="item" value="comfortable">
            <span style="flex: none; inline-size: 14px"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
            <span>宽松</span>
          </div>
        </div>

        <div data-xh-part="separator"></div>

        <div data-xh-part="group" value="panel">
          <span data-xh-part="group-label">面板</span>
          <div data-xh-part="item" value="sidebar">
            <span style="flex: none; inline-size: 14px"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
            <span>侧栏</span>
          </div>
          <div data-xh-part="item" value="inspector">
            <span style="flex: none; inline-size: 14px"></span>
            <span>属性面板</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menu>

  <span>行高：<span id="menu-group-density-readout">宽松</span>；面板：<span id="menu-group-panel-readout">1 个</span></span>
</div>

<script type="module">
  // 行高是单选、面板是多选，选中后标记位与下面那行文字一起更新
  const menu = document.getElementById("menu-group");
  const densityReadout = document.getElementById("menu-group-density-readout");
  const panelReadout = document.getElementById("menu-group-panel-readout");
  const densityLabels = { compact: "紧凑", comfortable: "宽松" };
  const panelValues = ["sidebar", "inspector"];

  const checkSvg =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg>';

  function mark(value, on) {
    const item = menu.querySelector(`[data-xh-part="item"][value="${value}"]`);
    item.firstElementChild.innerHTML = on ? checkSvg : "";
  }

  let density = "comfortable";
  let panels = ["sidebar"];

  menu.addEventListener("select", (event) => {
    const picked = event.detail.value;
    if (picked in densityLabels) {
      density = picked;
      for (const value of Object.keys(densityLabels)) mark(value, value === density);
      densityReadout.textContent = densityLabels[density];
      return;
    }
    panels = panels.includes(picked) ? panels.filter((v) => v !== picked) : [...panels, picked];
    for (const value of panelValues) mark(value, panels.includes(value));
    panelReadout.textContent = panels.length ? `${panels.length} 个` : "都收起了";
  });
</script>
```

### 二级子菜单

XhMenuSub 内嵌一台子菜单：触发条目双重身份（父层方向键照常走、右方向键进子层、子层左方向键退回），悬停经安全三角斜穿不误收，任意层级选中都发根的 select 并整链关闭

```vue
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref("（还没选）");
</script>

<template>
  <XhMenuRoot @select="({ value }) => (picked = value)">
    <XhMenuTrigger>文件操作</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="open">打开</XhMenuItem>
        <XhMenuItem value="rename">重命名</XhMenuItem>
        <XhMenuSeparator />
        <XhMenuSub value="share">
          <XhMenuSubTrigger>发送到…</XhMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="share-email">邮件</XhMenuItem>
              <XhMenuItem value="share-sms">短信</XhMenuItem>
              <XhMenuSub value="share-im">
                <XhMenuSubTrigger>即时通讯…</XhMenuSubTrigger>
                <XhMenuPositioner>
                  <XhMenuContent>
                    <XhMenuItem value="share-wecom">企业微信</XhMenuItem>
                    <XhMenuItem value="share-dingtalk">钉钉</XhMenuItem>
                  </XhMenuContent>
                </XhMenuPositioner>
              </XhMenuSub>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhMenuSub>
        <XhMenuSeparator />
        <XhMenuItem value="delete">删除</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
  <p>选中：{{ picked }}</p>
</template>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menu>` |
| Vue 组件 | `XhMenuArrow` `XhMenuContent` `XhMenuGroup` `XhMenuGroupLabel` `XhMenuItem` `XhMenuItemDescription` `XhMenuItemIndicator` `XhMenuItemText` `XhMenuPositioner` `XhMenuRoot` `XhMenuSeparator` `XhMenuSub` `XhMenuSubTrigger` `XhMenuTrigger` |
| 组合式函数 | `useMenu` |
| 状态机 | `menuMachine` |
| 皮肤 | `@xihan-ui/styles/menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="menu"`：**`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `MenuNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `open` | `boolean` |  | 展开态，给定即受控；受控下内部不自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定条目高亮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 |
| `typeahead` | `boolean` |  | 首字符连打检索，默认开。 |
| `disabled` | `boolean` |  | 整张菜单禁用：触发器不再展开，条目全转 aria-disabled。 |
| `translations` | `Partial<MenuTranslations>` |  |  |
| `submenu` | `boolean` |  | 本菜单是另一张菜单的子菜单：触发器渲染成父菜单的条目形态 （经 getSubmenuTriggerProps），缺省落位换到侧向，悬停触发缺省打开。 |
| `openOnHover` | `boolean` |  | 悬停触发：进触发器延时展开、经安全三角离开才收。子菜单缺省开，普通菜单缺省关。 |
| `hoverOpenDelay` | `number` |  | 悬停到展开的延时（ms），默认 100。 |
| `hoverCloseDelay` | `number` |  | 离开到收起的延时（ms），也是安全三角里的停滞上限，默认 300。 |
| `onOpenChange` | `(details: MenuOpenChangeDetails) => void` |  | open 变化回调。 |
| `onSelect` | `(details: MenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `MenuOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `select` | `MenuSelectDetails` | 条目被选中（菜单随之关闭）；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenuRoot` | `default` | `MenuRootSlotProps` |  |
| `XhMenuRoot` | `trigger` | — |  |
| `XhMenuRoot` | `item` | `MenuNodeMeta` |  |
| `XhMenuSub` | `default` | `MenuSubSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `submenu-trigger` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled`

## connect API

`useMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `disabled` | `boolean` | 整张菜单是否禁用。 |
| `collection` | `readonly MenuNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: MenuItemProps) => T['element']` |  |
| `getSubmenuTriggerProps` | `(props: MenuItemProps) => T['element']` | 子菜单触发条目（submenu 模式）：既是父菜单里的一条 item（value 是它在父菜单 里的身份，父层的方向键与高亮照常认它），又是本子菜单的触发器（aria-haspopup、 悬停/点按/右方向键展开）。父层的选中会跳过带 aria-haspopup 的条目。 |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: MenuGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: MenuGroupProps) => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` / `ArrowDown` | focus in trigger | 展开菜单并把焦点落到首个可用条目 |
| `ArrowUp` | focus in trigger | 展开菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还 trigger |
| `Escape` | open | 关闭菜单并把焦点归还 trigger |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还 trigger，按 Tab 序列自然离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `content` | `aria-label` | props.translations.content |
| `content` | `aria-labelledby` | `trigger` 部件的 id \| undefined |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |
| `submenu-trigger` | `aria-controls` | `content` 部件的 id |
| `submenu-trigger` | `aria-disabled` | 'true' \| 'false' |
| `submenu-trigger` | `aria-expanded` | 'true' \| 'false' |
| `submenu-trigger` | `aria-haspopup` | 'menu' |
| `submenu-trigger` | `role` | 'menuitem' |

## 样式

默认皮肤 `@xihan-ui/styles/menu.css` 按部件选择：`[data-scope="menu"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-tone` | props.tone |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |
| `submenu-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submenu-trigger` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-menu-arrow-size` · `--xh-menu-border` · `--xh-menu-content-bg` · `--xh-menu-content-fg` · `--xh-menu-content-gap` · `--xh-menu-content-px` · `--xh-menu-content-py` · `--xh-menu-content-radius` · `--xh-menu-content-shadow` · `--xh-menu-group-gap` · `--xh-menu-group-label-fg` · `--xh-menu-group-label-font-size` · `--xh-menu-group-label-font-weight` · `--xh-menu-group-label-px` · `--xh-menu-group-label-py` · `--xh-menu-icon-size` · `--xh-menu-item-active-font-weight` · `--xh-menu-item-bg-active` · `--xh-menu-item-bg-hover` · `--xh-menu-item-description-fg` · `--xh-menu-item-description-font-size` · `--xh-menu-item-fg` · `--xh-menu-item-font-size` · `--xh-menu-item-gap` · `--xh-menu-item-indicator-fg` · `--xh-menu-item-indicator-size` · `--xh-menu-item-leading` · `--xh-menu-item-px` · `--xh-menu-item-py` · `--xh-menu-item-radius` · `--xh-menu-layer` · `--xh-menu-max-h` · `--xh-menu-max-w` · `--xh-menu-min-w` · `--xh-menu-separator-color` · `--xh-menu-separator-my` · `--xh-menu-separator-thickness` · `--xh-menu-trigger-bg-active`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 触发器用[按钮](./button)；与[按钮组](./button-group)组合成分裂按钮；与[面包屑](./breadcrumb)组合做层级切换。

## 最佳实践

- 破坏性命令与其余条目之间隔一道[分隔线](./separator)，并放在最后。
- 悬停触发只在指针环境有意义，触摸与键盘恒靠点击那条路径。

## 反模式

- 用菜单做单选：读屏用户听到的是"菜单项"，不是"选项"，选完也不知道当前值是什么。
- 条目文字写成一句话：菜单项应是动宾短语。
