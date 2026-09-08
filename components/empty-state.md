来源：https://ui.docs.xihanfun.com/components/empty-state

# 空状态 `empty-state`

没有数据时那一块：说清楚为什么空，以及可以做什么。

空态与结果页共用一副骨架：图标、标题、说明、操作四段与整页结果完全一致，所以 404、403、500
这类结果页也用本组件铺。`status` 只落成 root 的 `data-status`，皮肤据它给图标区上语气色，
不改任何语义、不带插画资产。

## 何时使用

- 列表、表格、搜索结果为空。
- 首次使用、还没有任何数据。

## 何时不用

- 数据在加载中：用[骨架屏](./skeleton)或[加载指示器](./spinner)。
- 只是一次轻量操作的反馈：用[轻提示](./toast)。

## 特性

- 图标、标题、描述、操作四段都可选。
- `live` 决定这块内容出现时读屏怎么播报——搜索结果变空时这一条很重要。
- `status` 决定图标区并进哪一族语气色：三个状态码各并进最接近的一族，另有成功、警示、出错、提示四档。

## 示例

### 基础用法

图标、标题、说明、操作四个槽都可选，只有 root 是必须的

```vue
<script setup lang="ts">
import {
  XhButton,
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEmptyStateRoot style="inline-size: 100%">
    <!-- 图标是装饰性的，内容由作者塞：字形、内联 svg 都行 -->
    <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
    <XhEmptyStateTitle>还没有任何工单</XhEmptyStateTitle>
    <XhEmptyStateDescription>
      新建一条工单，或者换个筛选条件再看看。
    </XhEmptyStateDescription>
    <XhEmptyStateAction>
      <XhButton variant="solid">新建工单</XhButton>
      <XhButton variant="ghost">清空筛选</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
```

```html
<xh-empty-state>
  <div data-xh-part="root" style="inline-size: 100%">
    <!-- 图标是装饰性的，内容由作者塞：字形、内联 svg 都行 -->
    <span data-xh-part="indicator">∅</span>
    <p data-xh-part="title">还没有任何工单</p>
    <p data-xh-part="description">新建一条工单，或者换个筛选条件再看看。</p>
    <div data-xh-part="action">
      <xh-button variant="solid">
        <button data-xh-part="root">新建工单</button>
      </xh-button>
      <xh-button variant="ghost">
        <button data-xh-part="root">清空筛选</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>
```

### 尺寸

size 只换留白与字号，语义一点不动；不传即 md

```vue
<script setup lang="ts">
import {
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEmptyStateRoot size="sm" style="inline-size: 220px">
    <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
    <XhEmptyStateTitle>sm</XhEmptyStateTitle>
    <XhEmptyStateDescription>塞进侧栏或卡片里的那一档。</XhEmptyStateDescription>
  </XhEmptyStateRoot>

  <XhEmptyStateRoot style="inline-size: 220px">
    <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
    <XhEmptyStateTitle>md</XhEmptyStateTitle>
    <XhEmptyStateDescription>缺省档，列表与表格用它。</XhEmptyStateDescription>
  </XhEmptyStateRoot>

  <XhEmptyStateRoot size="lg" style="inline-size: 220px">
    <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
    <XhEmptyStateTitle>lg</XhEmptyStateTitle>
    <XhEmptyStateDescription>整页只有这一块时用它。</XhEmptyStateDescription>
  </XhEmptyStateRoot>
</template>
```

```html
<xh-empty-state size="sm">
  <div data-xh-part="root" style="inline-size: 220px">
    <span data-xh-part="indicator">∅</span>
    <p data-xh-part="title">sm</p>
    <p data-xh-part="description">塞进侧栏或卡片里的那一档。</p>
  </div>
</xh-empty-state>

<xh-empty-state>
  <div data-xh-part="root" style="inline-size: 220px">
    <span data-xh-part="indicator">∅</span>
    <p data-xh-part="title">md</p>
    <p data-xh-part="description">缺省档，列表与表格用它。</p>
  </div>
</xh-empty-state>

<xh-empty-state size="lg">
  <div data-xh-part="root" style="inline-size: 220px">
    <span data-xh-part="indicator">∅</span>
    <p data-xh-part="title">lg</p>
    <p data-xh-part="description">整页只有这一块时用它。</p>
  </div>
</xh-empty-state>
```

### 播报方式

缺省 polite 让 root 成为活区，筛完就地播报；off 让它只是个普通容器

```vue
<script setup lang="ts">
import {
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";
import { ref } from "vue";

const keyword = ref("曦寒");
const hits = ref<string[]>([]);

function search(): void {
  // 演示用：偶数长度的关键词当作有结果
  hits.value = keyword.value.length % 2 === 0 ? ["一条命中的记录"] : [];
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <input v-model="keyword" type="search" aria-label="关键词">
      <button type="button" @click="search">搜索</button>
    </div>

    <!-- 结果换成空的那一刻，读屏会在不打断当前朗读的前提下把标题念出来 -->
    <XhEmptyStateRoot v-if="!hits.length" live="polite">
      <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
      <XhEmptyStateTitle>没有匹配「{{ keyword }}」的结果</XhEmptyStateTitle>
      <XhEmptyStateDescription>换个词，或者去掉几个筛选条件。</XhEmptyStateDescription>
    </XhEmptyStateRoot>
    <p v-else style="margin: 0">{{ hits[0] }}</p>
  </div>
</template>
```

```html
<div id="empty-state-live" style="inline-size: 100%; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <input id="empty-state-live-keyword" type="search" aria-label="关键词" value="曦寒" />
    <button id="empty-state-live-search" type="button">搜索</button>
  </div>

  <!-- 结果换成空的那一刻，读屏会在不打断当前朗读的前提下把标题念出来 -->
  <xh-empty-state live="polite">
    <div data-xh-part="root" id="empty-state-live-root">
      <span data-xh-part="indicator">∅</span>
      <p data-xh-part="title" id="empty-state-live-title">没有匹配「曦寒」的结果</p>
      <p data-xh-part="description">换个词，或者去掉几个筛选条件。</p>
    </div>
  </xh-empty-state>
  <p id="empty-state-live-hit" hidden style="margin: 0">一条命中的记录</p>
</div>

<script type="module">
  // 演示用：偶数长度的关键词当作有结果
  const keyword = document.getElementById("empty-state-live-keyword");
  const title = document.getElementById("empty-state-live-title");
  const root = document.getElementById("empty-state-live-root");
  const hit = document.getElementById("empty-state-live-hit");
  document.getElementById("empty-state-live-search").addEventListener("click", () => {
    const found = keyword.value.length % 2 === 0;
    title.textContent = `没有匹配「${keyword.value}」的结果`;
    // 活区节点常挂着，两块用 hidden 互相收起
    root.hidden = found;
    hit.hidden = !found;
  });
</script>
```

### 用作结果页

同一套部件也承载 404、403 这类结果：status 给图标区上语气色，操作槽里放回退出口

```vue
<script setup lang="ts">
import {
  XhButton,
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from "@xihan-ui/vue";

const results = [
  {
    status: "404" as const,
    glyph: "?",
    title: "404 页面不存在",
    description: "地址可能敲错了，或者这条记录已经被删掉。",
    action: "回到首页",
  },
  {
    status: "403" as const,
    glyph: "⊘",
    title: "403 没有权限",
    description: "这块内容需要更高的角色，找管理员要一下。",
    action: "申请权限",
  },
  {
    status: "500" as const,
    glyph: "!",
    title: "500 服务出错",
    description: "请求没能处理完，稍后再试一次。",
    action: "重试",
  },
];
</script>

<template>
  <!-- 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 -->
  <XhEmptyStateRoot
    v-for="r in results"
    :key="r.title"
    :status="r.status"
    live="off"
    size="sm"
    style="inline-size: 240px"
  >
    <XhEmptyStateIndicator>{{ r.glyph }}</XhEmptyStateIndicator>
    <XhEmptyStateTitle>{{ r.title }}</XhEmptyStateTitle>
    <XhEmptyStateDescription>{{ r.description }}</XhEmptyStateDescription>
    <XhEmptyStateAction>
      <XhButton size="sm" variant="outline">{{ r.action }}</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
```

```html
<!-- 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 -->
<xh-empty-state status="404" live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="indicator">?</span>
    <p data-xh-part="title">404 页面不存在</p>
    <p data-xh-part="description">地址可能敲错了，或者这条记录已经被删掉。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">回到首页</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state status="403" live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="indicator">⊘</span>
    <p data-xh-part="title">403 没有权限</p>
    <p data-xh-part="description">这块内容需要更高的角色，找管理员要一下。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">申请权限</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state status="500" live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="indicator">!</span>
    <p data-xh-part="title">500 服务出错</p>
    <p data-xh-part="description">请求没能处理完，稍后再试一次。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">重试</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>
```

### 图标自带语气

图标槽里放一枚带 tone 的图标，着色落在图标自己身上，不经过 status

```vue
<script setup lang="ts">
import {
  XhButton,
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhIcon,
} from "@xihan-ui/vue";

const CheckCircleIcon = {
  name: "check-circle",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
    { tag: "path", attrs: { d: "M8 12.5L11 15.5L16 9" } },
  ],
} as const;

const AlertIcon = {
  name: "alert",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 4L21 19H3Z" } },
    { tag: "path", attrs: { d: "M12 10V14" } },
    { tag: "path", attrs: { d: "M12 16.5V17" } },
  ],
} as const;

const CrossCircleIcon = {
  name: "cross-circle",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
    { tag: "path", attrs: { d: "M9 9L15 15" } },
    { tag: "path", attrs: { d: "M15 9L9 15" } },
  ],
} as const;

const results = [
  {
    icon: CheckCircleIcon,
    tone: "success",
    title: "全部导入成功",
    description: "128 条记录已入库，没有需要人工处理的行。",
    action: "查看结果",
  },
  {
    icon: AlertIcon,
    tone: "warning",
    title: "部分行被跳过",
    description: "有 6 行缺少必填字段，这次没有导入它们。",
    action: "下载跳过清单",
  },
  {
    icon: CrossCircleIcon,
    tone: "danger",
    title: "导入没有完成",
    description: "文件读到一半中断，这次改动已经整体回滚。",
    action: "重新上传",
  },
];
</script>

<template>
  <!-- 图标槽收任意内容，放一枚带语气的图标，着色就落在这一处，标题与说明不动 -->
  <XhEmptyStateRoot
    v-for="r in results"
    :key="r.title"
    live="off"
    size="sm"
    style="inline-size: 240px"
  >
    <XhEmptyStateIndicator>
      <XhIcon :icon="r.icon" :tone="r.tone" size="lg" />
    </XhEmptyStateIndicator>
    <XhEmptyStateTitle>{{ r.title }}</XhEmptyStateTitle>
    <XhEmptyStateDescription>{{ r.description }}</XhEmptyStateDescription>
    <XhEmptyStateAction>
      <XhButton size="sm" variant="outline">{{ r.action }}</XhButton>
    </XhEmptyStateAction>
  </XhEmptyStateRoot>
</template>
```

```html
<!-- 图标槽收任意内容，放一枚带语气的图标，着色就落在这一处，标题与说明不动 -->
<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="indicator">
      <xh-icon id="empty-state-tone-success" tone="success" size="lg">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <p data-xh-part="title">全部导入成功</p>
    <p data-xh-part="description">128 条记录已入库，没有需要人工处理的行。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">查看结果</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="indicator">
      <xh-icon id="empty-state-tone-warning" tone="warning" size="lg">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <p data-xh-part="title">部分行被跳过</p>
    <p data-xh-part="description">有 6 行缺少必填字段，这次没有导入它们。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">下载跳过清单</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<xh-empty-state live="off" size="sm">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="indicator">
      <xh-icon id="empty-state-tone-danger" tone="danger" size="lg">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <p data-xh-part="title">导入没有完成</p>
    <p data-xh-part="description">文件读到一半中断，这次改动已经整体回滚。</p>
    <div data-xh-part="action">
      <xh-button size="sm" variant="outline">
        <button data-xh-part="root">重新上传</button>
      </xh-button>
    </div>
  </div>
</xh-empty-state>

<script type="module">
  // 图标记录是对象，只走 property
  const stroke = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };
  document.getElementById("empty-state-tone-success").icon = {
    name: "check-circle",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M8 12.5L11 15.5L16 9" } },
    ],
  };
  document.getElementById("empty-state-tone-warning").icon = {
    name: "alert",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M12 4L21 19H3Z" } },
      { tag: "path", attrs: { d: "M12 10V14" } },
      { tag: "path", attrs: { d: "M12 16.5V17" } },
    ],
  };
  document.getElementById("empty-state-tone-danger").icon = {
    name: "cross-circle",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M9 9L15 15" } },
      { tag: "path", attrs: { d: "M15 9L9 15" } },
    ],
  };
</script>
```

### 结果类型

status 只落成 data-status，皮肤据它给图标区上语气色；画什么图标仍由作者塞

```vue
<script setup lang="ts">
import { CheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "@xihan-ui/icons";
import {
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhIcon,
} from "@xihan-ui/vue";

const results = [
  { status: "success", glyph: CheckIcon, title: "全部导入成功", description: "128 条记录已入库。" },
  { status: "warning", glyph: TriangleAlertIcon, title: "部分行被跳过", description: "有 6 行缺少必填字段。" },
  { status: "error", glyph: XIcon, title: "导入没有完成", description: "这次改动已经整体回滚。" },
  { status: "info", glyph: InfoIcon, title: "任务已排队", description: "前面还有 3 个任务在跑。" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <!-- 随页面一起出现的静态结果，不是就地更新的活区，所以关掉播报 -->
    <XhEmptyStateRoot
      v-for="r in results"
      :key="r.status"
      :status="r.status"
      live="off"
      size="sm"
      style="inline-size: 200px"
    >
      <XhEmptyStateIndicator><XhIcon :icon="r.glyph" /></XhEmptyStateIndicator>
      <XhEmptyStateTitle>{{ r.title }}</XhEmptyStateTitle>
      <XhEmptyStateDescription>{{ r.description }}</XhEmptyStateDescription>
    </XhEmptyStateRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <xh-empty-state status="success" live="off" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
      <p data-xh-part="title">全部导入成功</p>
      <p data-xh-part="description">128 条记录已入库。</p>
    </div>
  </xh-empty-state>

  <xh-empty-state status="warning" live="off" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4L21 20H3Z"/><path d="M12 10V14"/><path d="M12 17.5h.01"/></svg></span>
      <p data-xh-part="title">部分行被跳过</p>
      <p data-xh-part="description">有 6 行缺少必填字段。</p>
    </div>
  </xh-empty-state>

  <xh-empty-state status="error" live="off" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg></span>
      <p data-xh-part="title">导入没有完成</p>
      <p data-xh-part="description">这次改动已经整体回滚。</p>
    </div>
  </xh-empty-state>

  <xh-empty-state status="info" live="off" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11V16.5"/><path d="M12 7.5h.01"/></svg></span>
      <p data-xh-part="title">任务已排队</p>
      <p data-xh-part="description">前面还有 3 个任务在跑。</p>
    </div>
  </xh-empty-state>
</div>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-empty-state>` |
| Vue 组件 | `XhEmptyStateAction` `XhEmptyStateDescription` `XhEmptyStateIndicator` `XhEmptyStateMedia` `XhEmptyStateRoot` `XhEmptyStateTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/empty-state.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="empty-state"`：**`root`** · `media` · `indicator` · `title` · `description` · `action`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `live` | `EmptyStateLive` |  | 缺省 polite。 |
| `size` | `Size` |  | 尺寸档位，只改留白与字号，不改语义。 |
| `status` | `EmptyStateStatus` |  | 结果类型，只落成 root 的 data-status；图标画什么由作者塞进图标槽。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。不给即维持中性。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `live` | `EmptyStateLive` | 生效的播报方式，缺省补齐后的值。 |
| `getRootProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` | 插画槽：按自己的尺寸档量，与字形槽二选一。 |
| `getIndicatorProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | undefined \| 'status' |
| `media` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/empty-state.css` 按部件选择：`[data-scope="empty-state"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-status` | props.status |
| `root` | `data-tone` | props.tone |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-empty-state-action-gap` · `--xh-empty-state-description-fg` · `--xh-empty-state-description-font-size` · `--xh-empty-state-description-leading` · `--xh-empty-state-description-max-w` · `--xh-empty-state-fg` · `--xh-empty-state-gap` · `--xh-empty-state-icon-size` · `--xh-empty-state-indicator-fg` · `--xh-empty-state-indicator-font-size` · `--xh-empty-state-media-fg` · `--xh-empty-state-media-size` · `--xh-empty-state-px` · `--xh-empty-state-py` · `--xh-empty-state-title-fg` · `--xh-empty-state-title-font-size` · `--xh-empty-state-title-font-weight` · `--xh-empty-state-title-leading`

## 动效

关键帧 `xh-rise-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 图标用[图标块](./icon-wrapper)；操作用[按钮](./button)。

## 最佳实践

- 区分三种空：从来没有、筛选之后没有、搜索没结果。三者该说的话完全不同。
- 给一条出路：新建、清除筛选、换个关键词。
- 用作结果页时每一页都给回退出口：回首页、重试、联系支持。403 与 500 尤其需要。
- 失败页给可追溯的标识（请求号、时间），用户报障时用得上。

## 反模式

- 只画一个空盒子加"暂无数据"：用户不知道下一步做什么。
- 首次使用时的空状态跟筛选无结果长得一样。
- 只写"出错了"却不说是什么错，也不给下一步。
