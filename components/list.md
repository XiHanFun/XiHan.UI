来源：https://ui.docs.xihanfun.com/components/list

# List 列表

一列同构的条目，每条可以有媒体位、标题、描述与操作位。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/list" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/list.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/list" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/list" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/list.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

根与条目的标签由使用者决定，这里写为 ul 与 li；条目中只写用得到的位

```vue
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

const people = [
  { name: "张三", desc: "技术部 · 前端" },
  { name: "李四", desc: "技术部 · 后端" },
  { name: "王五", desc: "设计部 · 交互" },
];
</script>

<template>
  <XhListRoot style="max-inline-size: 360px">
    <XhListItem v-for="p in people" :key="p.name">
      <XhListItemContent>
        <XhListItemTitle>{{ p.name }}</XhListItemTitle>
        <XhListItemDescription>{{ p.desc }}</XhListItemDescription>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">张三</div>
        <div data-xh-part="item-description">技术部 · 前端</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">李四</div>
        <div data-xh-part="item-description">技术部 · 后端</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">王五</div>
        <div data-xh-part="item-description">设计部 · 交互</div>
      </div>
    </li>
  </ul>
</xh-list>
```

## 组件结构

加粗的是必需部件。

`data-scope="list"`：**`root`** · `item` · `item-media` · `item-content` · `item-title` · `item-description` · `item-action`

## 示例

### 分隔线

split 在条目之间绘制一条线，第一条上方不绘制

```vue
<script setup lang="ts">
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/vue";

const logs = ["提交了一次构建", "合并了一个分支", "关闭了一个议题"];
</script>

<template>
  <XhListRoot split style="max-inline-size: 360px">
    <XhListItem v-for="log in logs" :key="log">
      <XhListItemContent>
        <XhListItemTitle>{{ log }}</XhListItemTitle>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">提交了一次构建</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">合并了一个分支</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">关闭了一个议题</div>
      </div>
    </li>
  </ul>
</xh-list>
```

### 外框与悬停

variant="outline" 为整份列表绘制一圈描边，hoverable 使条目在指针悬停时更换底色

```vue
<script setup lang="ts">
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/vue";

const files = ["设计稿.fig", "接口文档.md", "会议纪要.docx"];
</script>

<template>
  <XhListRoot variant="outline" hoverable split style="max-inline-size: 360px">
    <XhListItem v-for="file in files" :key="file">
      <XhListItemContent>
        <XhListItemTitle>{{ file }}</XhListItemTitle>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list variant="outline" hoverable split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">设计稿.fig</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">接口文档.md</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">会议纪要.docx</div>
      </div>
    </li>
  </ul>
</xh-list>
```

### 媒体位与操作位

条目最完整的形态：媒体、标题、说明、操作四个位都放置

```vue
<script setup lang="ts">
import {
  XhListItem,
  XhListItemAction,
  XhListItemContent,
  XhListItemDescription,
  XhListItemMedia,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

const members = [
  { initial: "张", name: "张三", desc: "zhangsan@example.com" },
  { initial: "李", name: "李四", desc: "lisi@example.com" },
];
</script>

<template>
  <XhListRoot variant="outline" hoverable split style="max-inline-size: 420px">
    <XhListItem v-for="m in members" :key="m.name">
      <!-- 媒体位画什么由使用者决定，这里放一个首字头像 -->
      <XhListItemMedia
        style="
          inline-size: 32px;
          block-size: 32px;
          border-radius: 999px;
          background: var(--xh-bg-subtle);
        "
      >
        {{ m.initial }}
      </XhListItemMedia>
      <XhListItemContent>
        <XhListItemTitle>{{ m.name }}</XhListItemTitle>
        <XhListItemDescription>{{ m.desc }}</XhListItemDescription>
      </XhListItemContent>
      <XhListItemAction>
        <button type="button">移除</button>
      </XhListItemAction>
    </XhListItem>
  </XhListRoot>
</template>
```

```html
<style>
  #list-media-action [data-xh-part="item-media"] {
    inline-size: 32px;
    block-size: 32px;
    border-radius: 999px;
    background: var(--xh-bg-subtle);
  }
</style>

<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list id="list-media-action" variant="outline" hoverable split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 420px">
    <li data-xh-part="item">
      <!-- 媒体位画什么由使用者决定，这里放一个首字头像 -->
      <div data-xh-part="item-media">张</div>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">张三</div>
        <div data-xh-part="item-description">zhangsan@example.com</div>
      </div>
      <div data-xh-part="item-action">
        <button type="button">移除</button>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-media">李</div>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">李四</div>
        <div data-xh-part="item-description">lisi@example.com</div>
      </div>
      <div data-xh-part="item-action">
        <button type="button">移除</button>
      </div>
    </li>
  </ul>
</xh-list>
```

### 尺寸

size 改变条目的内边距、图文间距与两行文字的字号，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <XhListRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      variant="outline"
      split
      style="inline-size: 200px"
    >
      <XhListItem>
        <XhListItemContent>
          <XhListItemTitle>{{ s.label }}</XhListItemTitle>
          <XhListItemDescription>说明文字</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
      <XhListItem>
        <XhListItemContent>
          <XhListItemTitle>第二条</XhListItemTitle>
          <XhListItemDescription>说明文字</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
    </XhListRoot>
  </div>
</template>
```

```html
<!-- 三份宿主都设 display: contents，三个 root 直接当排布容器的子项 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <xh-list size="sm" variant="outline" split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">小</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>

  <!-- 中间一档不写 size -->
  <xh-list variant="outline" split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">默认</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>

  <xh-list size="lg" variant="outline" split style="display: contents">
    <ul data-xh-part="root" style="inline-size: 200px">
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">大</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
      <li data-xh-part="item">
        <div data-xh-part="item-content">
          <div data-xh-part="item-title">第二条</div>
          <div data-xh-part="item-description">说明文字</div>
        </div>
      </li>
    </ul>
  </xh-list>
</div>
```

### 分页

列表只画当前页的条目，末尾接分页：换页时换一段数据，条目与页码各管各的

```vue
<script setup lang="ts">
import {
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

// 23 张工单，每页 5 张
const STATUS = ["待处理", "处理中", "已解决"];
const tickets = Array.from({ length: 23 }, (_, i) => ({
  id: 1001 + i,
  title: `工单 #${1001 + i}`,
  desc: `${STATUS[i % 3]} · 华东区`,
}));
const PAGE_SIZE = 5;

const page = ref(1);
const visible = computed(() => tickets.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); max-inline-size: 360px">
    <XhListRoot split>
      <XhListItem v-for="t in visible" :key="t.id">
        <XhListItemContent>
          <XhListItemTitle>{{ t.title }}</XhListItemTitle>
          <XhListItemDescription>{{ t.desc }}</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
    </XhListRoot>
    <XhPaginationRoot
      v-slot="{ pages }"
      v-model:page="page"
      :count="tickets.length"
      :page-size="PAGE_SIZE"
    >
      <XhPaginationPrevTrigger />
      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
        <XhPaginationItem v-else :value="p">{{ p }}</XhPaginationItem>
      </template>
      <XhPaginationNextTrigger />
    </XhPaginationRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: var(--xh-space-3); max-inline-size: 360px">
  <!-- 宿主设 display: contents，列表落在 root 上 -->
  <xh-list split style="display: contents">
    <ul id="list-pagination-root" data-xh-part="root"></ul>
  </xh-list>
  <!-- 23 条每页 5 条：5 页全部写出，不出省略号 -->
  <xh-pagination id="list-pagination-pages" count="23" page-size="5">
    <nav data-xh-part="root">
      <button data-xh-part="prev-trigger"></button>
      <button data-xh-part="item" value="1">1</button>
      <button data-xh-part="item" value="2">2</button>
      <button data-xh-part="item" value="3">3</button>
      <button data-xh-part="item" value="4">4</button>
      <button data-xh-part="item" value="5">5</button>
      <button data-xh-part="next-trigger"></button>
    </nav>
  </xh-pagination>
</div>

<script type="module">
  const list = document.getElementById("list-pagination-root");
  const pages = document.getElementById("list-pagination-pages");
  // 23 张工单，每页 5 张
  const STATUS = ["待处理", "处理中", "已解决"];
  const tickets = Array.from({ length: 23 }, (_, i) => ({
    id: 1001 + i,
    title: `工单 #${1001 + i}`,
    desc: `${STATUS[i % 3]} · 华东区`,
  }));
  const PAGE_SIZE = 5;

  // 条目的节点由作者建：写上 data-xh-part，元素看到新节点自动接上
  function render(page) {
    list.replaceChildren(...tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((t) => {
      const item = document.createElement("li");
      item.dataset.xhPart = "item";
      const content = document.createElement("div");
      content.dataset.xhPart = "item-content";
      const title = document.createElement("div");
      title.dataset.xhPart = "item-title";
      title.textContent = t.title;
      const desc = document.createElement("div");
      desc.dataset.xhPart = "item-description";
      desc.textContent = t.desc;
      content.append(title, desc);
      item.append(content);
      return item;
    }));
  }

  render(1);
  pages.addEventListener("page-change", event => render(event.detail.page));
</script>
```

### 加载更多

列表末尾放一个按钮追加下一批：取数时按钮转圈、不能重复点，取完了换成提示

```vue
<script setup lang="ts">
import { LoaderIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhIcon,
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

// 模拟分批取数：每次 4 条，共 11 条
const TOTAL = 11;
const BATCH = 4;
interface Row {
  id: number;
  name: string;
  desc: string;
}
function rowsFrom(from: number): Row[] {
  return Array.from({ length: Math.min(BATCH, TOTAL - from) }, (_, i) => ({
    id: from + i,
    name: `通知 ${from + i + 1}`,
    desc: `系统消息 · ${from + i + 1} 小时前`,
  }));
}
function fetchBatch(from: number): Promise<Row[]> {
  return new Promise(resolve => setTimeout(resolve, 800, rowsFrom(from)));
}

// 第一批随页面一起到
const rows = ref<Row[]>(rowsFrom(0));
const loading = ref(false);
const done = computed(() => rows.value.length >= TOTAL);

async function loadMore() {
  loading.value = true;
  rows.value = [...rows.value, ...await fetchBatch(rows.value.length)];
  loading.value = false;
}
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: center; max-inline-size: 360px">
    <XhListRoot split style="inline-size: 100%">
      <XhListItem v-for="row in rows" :key="row.id">
        <XhListItemContent>
          <XhListItemTitle>{{ row.name }}</XhListItemTitle>
          <XhListItemDescription>{{ row.desc }}</XhListItemDescription>
        </XhListItemContent>
      </XhListItem>
    </XhListRoot>
    <XhButton variant="subtle" :loading="loading" :disabled="done" @click="loadMore">
      <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
      <XhButtonLabel>{{ done ? "没有更多了" : "加载更多" }}</XhButtonLabel>
    </XhButton>
  </div>
</template>
```

```html
<div style="display: grid; gap: var(--xh-space-3); justify-items: center; max-inline-size: 360px">
  <!-- 宿主设 display: contents，列表落在 root 上 -->
  <xh-list split style="display: contents">
    <ul id="list-load-more-root" data-xh-part="root" style="inline-size: 100%"></ul>
  </xh-list>
  <xh-button id="list-load-more-button" variant="subtle">
    <button data-xh-part="root">
      <span data-xh-part="indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
      </span>
      <span data-xh-part="label">加载更多</span>
    </button>
  </xh-button>
</div>

<script type="module">
  const list = document.getElementById("list-load-more-root");
  const button = document.getElementById("list-load-more-button");
  const label = button.querySelector('[data-xh-part="label"]');
  // 模拟分批取数：每次 4 条，共 11 条
  const TOTAL = 11;
  const BATCH = 4;
  function rowsFrom(from) {
    return Array.from({ length: Math.min(BATCH, TOTAL - from) }, (_, i) => ({
      id: from + i,
      name: `通知 ${from + i + 1}`,
      desc: `系统消息 · ${from + i + 1} 小时前`,
    }));
  }
  function fetchBatch(from) {
    return new Promise(resolve => setTimeout(resolve, 800, rowsFrom(from)));
  }

  // 条目的节点由作者建：写上 data-xh-part，元素看到新节点自动接上
  function itemOf(row) {
    const item = document.createElement("li");
    item.dataset.xhPart = "item";
    const content = document.createElement("div");
    content.dataset.xhPart = "item-content";
    const title = document.createElement("div");
    title.dataset.xhPart = "item-title";
    title.textContent = row.name;
    const desc = document.createElement("div");
    desc.dataset.xhPart = "item-description";
    desc.textContent = row.desc;
    content.append(title, desc);
    item.append(content);
    return item;
  }

  async function loadMore() {
    button.loading = true;
    const rows = await fetchBatch(list.children.length);
    list.append(...rows.map(itemOf));
    button.loading = false;
    if (list.children.length >= TOTAL) {
      button.disabled = true;
      label.textContent = "没有更多了";
    }
  }

  // 第一批随页面一起到
  list.append(...rowsFrom(0).map(itemOf));
  button.addEventListener("click", loadMore);
</script>
```

## 设计指引

### 何时使用

- 同构记录的纵向排列：通知、文件、成员。
- 每条信息量适中，不需要多列对齐。

### 何时不用

- 每条有多个字段需要按列对照时，使用[表格](./table)。
- 条目可选时，使用[列表框](./listbox)。

### 特性

- 六个部件都可选。
- `split` 在条目之间绘制分隔线，`variant="outline"` 提供外框，`hoverable` 提供悬停反馈。

### 组合

- 媒体位放[头像](./avatar)或带底框的[图标](./icon)；操作位放[按钮](./button)或[菜单](./menu)；末尾接[分页](./pagination)或[无限滚动](./infinite-scroll)。

### 最佳实践

- 每条的高度保持一致，参差不齐的列表难以扫读。
- 整条可点时让整条进入 Tab 序列，不只让标题可点。

### 反模式

- 用列表排列有五六个字段的表格。
- 每条放置三四个操作按钮。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-list>` |
| Vue 组件 | `XhListItem` `XhListItemAction` `XhListItemContent` `XhListItemDescription` `XhListItemMedia` `XhListItemTitle` `XhListRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/list.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `hoverable` | `boolean` |  | 指针悬停时条目切换底色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `split` | `boolean` |  | 条目之间绘制分隔线。 |
| `variant` | `ControlVariant` |  | 形态：ghost 不画壳（默认），outline 为整份列表绘制描边与圆角，subtle 淡底。默认 ghost。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhListItem` | `as` | `ElementType` |  | 条目渲染为哪个标签，默认 li；根换为 div 时这里一并更换。 |
| `XhListRoot` | `as` | `ElementType` |  | 根渲染为哪个标签，默认 ul；换为 div 即不进入读屏的列表语义。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getItemMediaProps` | `() => T['element']` |  |
| `getItemContentProps` | `() => T['element']` |  |
| `getItemTitleProps` | `() => T['element']` |  |
| `getItemDescriptionProps` | `() => T['element']` |  |
| `getItemActionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/list.css` 按 `[data-scope="list"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-list` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-list-action-gap` | `item-action` | `gap` | `default` | `--xh-space-2` | list 的 item-action 部件 gap 覆盖槽。 |
| `--xh-list-bg` | `root` | `background` | `variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | list 的 root 部件 background 覆盖槽。 |
| `--xh-list-border` | `root` | `border` | `variant=outline` | `--xh-border-default` | list 的 root 部件 border 覆盖槽。 |
| `--xh-list-content-gap` | `item-content` | `gap` | `default` | `--xh-space-1` | list 的 item-content 部件 gap 覆盖槽。 |
| `--xh-list-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | list 的 item-description 部件 color 覆盖槽。 |
| `--xh-list-description-font-size` | `item-description` | `font-size` | `default` | `--xh-_list-description-size` | list 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-list-divider` | `item`<br>`root` | `border-block-start` | `split` | `--xh-border-subtle` | list 的 item、root 部件 border-block-start 覆盖槽。 |
| `--xh-list-fg` | `root` | `color` | `default` | `--xh-fg-default` | list 的 root 部件 color 覆盖槽。 |
| `--xh-list-item-bg-hover` | `item`<br>`root` | `background` | `@media (hover: hover)`<br>`hover`<br>`hoverable` | `--xh-_list-item-bg-hover` | list 的 item、root 部件 background 覆盖槽。 |
| `--xh-list-item-gap` | `item` | `gap` | `default` | `--xh-_list-item-gap` | list 的 item 部件 gap 覆盖槽。 |
| `--xh-list-item-px` | `item` | `padding-inline` | `default` | `--xh-_list-item-px` | list 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-list-item-py` | `item` | `padding-block` | `default` | `--xh-_list-item-py` | list 的 item 部件 padding-block 覆盖槽。 |
| `--xh-list-radius` | `root` | `border-radius` | `variant=outline`<br>`variant=subtle` | `--xh-shape-surface` | list 的 root 部件 border-radius 覆盖槽。 |
| `--xh-list-title-fg` | `item-title` | `color` | `default` | `--xh-fg-default` | list 的 item-title 部件 color 覆盖槽。 |
| `--xh-list-title-font-size` | `item-title` | `font-size` | `default` | `--xh-_list-title-size` | list 的 item-title 部件 font-size 覆盖槽。 |
| `--xh-list-title-font-weight` | `item-title` | `font-weight` | `default` | `--xh-font-weight-medium` | list 的 item-title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态（见[动效规范](../design/motion#角色)）。

`background-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
