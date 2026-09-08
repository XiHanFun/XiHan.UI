来源：https://ui.docs.xihanfun.com/components/navigation-menu

# 导航菜单 `navigation-menu`

站点的主导航：一排入口，展开后是一整块去处面板，面板里是链接不是命令。

## 何时使用

- 门户、营销站、文档站的顶部导航，每个板块下还有若干去处。

## 何时不用

- 条目是命令（执行一次动作）：用[菜单](./menu)。
- 后台的层级导航：用[侧栏导航](./side-nav)。

## 特性

- 面板落在同一个 `li` 里、紧跟入口之后，展开时按 Tab 就走得进去。
- `delayDuration` 防的是指针横穿导航时一路闪出面板；`skipDelayDuration` 是收起后的静默窗口，窗口内再碰任意入口直接展开。
- 没有下级的去处不必套面板：那一项直接铺成一条 `link`，它不进方向键那一组，按 Tab 一样到得了。
- 面板整批塞进 `viewport` 后落位归外壳管：几个入口的面板落在同一处，宽窄不同也不再各贴各的入口。

## 示例

### 基础用法

面板落在同一个 li 里、紧跟 trigger 之后，展开时按 Tab 就走得进去，里面的条目是链接不是命令，点了就跳走

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "about", label: "关于" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
    { href: "#/products/wc", label: "Web Components 适配器" },
  ],
  docs: [
    { href: "#/docs/guide", label: "上手指南" },
    { href: "#/docs/anatomy", label: "部件解剖" },
  ],
  about: [{ href: "#/about/team", label: "团队" }],
};

// 指向当前页面的那一条：拿它比对即可
const currentHref = "#/docs/guide";
</script>

<template>
  <!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
  <div style="inline-size: 100%; padding-block-end: 180px">
    <XhNavigationMenuRoot :collection="entries">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
          :current="l.href === currentHref"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
<div style="inline-size: 100%; padding-block-end: 180px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
          <div data-xh-part="content" value="products">
            <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
            <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            <a data-xh-part="link" href="#/products/wc">Web Components 适配器</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="docs">文档</button>
          <div data-xh-part="content" value="docs">
            <!-- 指向当前页面的那一条写 current -->
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="about">关于</button>
          <div data-xh-part="content" value="about">
            <a data-xh-part="link" href="#/about/team">团队</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 受控

传了 value 就由宿主说了算，null 表示都收起

```vue
<script setup lang="ts">
import {
  XhButton,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const groups = [
  {
    value: "solution",
    label: "解决方案",
    links: [
      { href: "#/solution/saas", label: "多租户 SaaS" },
      { href: "#/solution/portal", label: "门户站点" },
    ],
  },
  {
    value: "support",
    label: "支持",
    links: [
      { href: "#/support/faq", label: "常见问题" },
      { href: "#/support/contact", label: "联系我们" },
    ],
  },
];

const open = ref<string | null>(null);
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 150px">
    <XhNavigationMenuRoot v-model:value="open">
      <XhNavigationMenuList>
        <XhNavigationMenuItem v-for="g in groups" :key="g.value">
          <XhNavigationMenuTrigger :value="g.value">
            {{ g.label }}
          </XhNavigationMenuTrigger>
          <XhNavigationMenuContent :value="g.value">
            <XhNavigationMenuLink
              v-for="l in g.links"
              :key="l.href"
              :href="l.href"
            >
              {{ l.label }}
            </XhNavigationMenuLink>
          </XhNavigationMenuContent>
        </XhNavigationMenuItem>
      </XhNavigationMenuList>
    </XhNavigationMenuRoot>

    <div style="display: flex; align-items: center; gap: 8px; margin-block-start: 12px">
      <XhButton variant="outline" @click="open = 'support'">展开「支持」</XhButton>
      <XhButton variant="outline" @click="open = null">全部收起</XhButton>
      <span>展开的面板：{{ open ?? "（都收着）" }}</span>
    </div>
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 150px">
  <xh-navigation-menu id="navigation-menu-controlled" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="solution">解决方案</button>
          <div data-xh-part="content" value="solution">
            <a data-xh-part="link" href="#/solution/saas">多租户 SaaS</a>
            <a data-xh-part="link" href="#/solution/portal">门户站点</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="support">支持</button>
          <div data-xh-part="content" value="support">
            <a data-xh-part="link" href="#/support/faq">常见问题</a>
            <a data-xh-part="link" href="#/support/contact">联系我们</a>
          </div>
        </li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <div style="display: flex; align-items: center; gap: 8px; margin-block-start: 12px">
    <xh-button variant="outline">
      <button data-xh-part="root" id="navigation-menu-controlled-open">展开「支持」</button>
    </xh-button>
    <xh-button variant="outline">
      <button data-xh-part="root" id="navigation-menu-controlled-close">全部收起</button>
    </xh-button>
    <span>展开的面板：<span id="navigation-menu-controlled-value">（都收着）</span></span>
  </div>
</div>

<script type="module">
  // 展开项由宿主持有：组件只发 value-change，写回元素它才变
  const menu = document.getElementById("navigation-menu-controlled");
  const readout = document.getElementById("navigation-menu-controlled-value");

  function apply(next) {
    menu.value = next;
    readout.textContent = next ?? "（都收着）";
  }

  apply(null);
  menu.addEventListener("value-change", (event) => apply(event.detail.value));
  document
    .getElementById("navigation-menu-controlled-open")
    .addEventListener("click", () => apply("support"));
  document
    .getElementById("navigation-menu-controlled-close")
    .addEventListener("click", () => apply(null));
</script>
```

### 展开延时

delay-duration 是悬停多久才展开，防的是指针横穿导航时一路闪出面板；skip-delay-duration 是收起后的静默窗口，窗口内再碰任意入口直接展开

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "cloud", label: "云服务" },
  { value: "data", label: "数据" },
  { value: "ai", label: "智能" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  cloud: [
    { href: "#/cloud/host", label: "云主机" },
    { href: "#/cloud/storage", label: "对象存储" },
  ],
  data: [
    { href: "#/data/warehouse", label: "数据仓库" },
    { href: "#/data/pipeline", label: "数据管道" },
  ],
  ai: [{ href: "#/ai/agent", label: "智能体" }],
};
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 150px">
    <XhNavigationMenuRoot
      :collection="entries"
      :delay-duration="600"
      :skip-delay-duration="800"
    >
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 150px">
  <xh-navigation-menu delay-duration="600" skip-delay-duration="800" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="cloud">云服务</button>
          <div data-xh-part="content" value="cloud">
            <a data-xh-part="link" href="#/cloud/host">云主机</a>
            <a data-xh-part="link" href="#/cloud/storage">对象存储</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="data">数据</button>
          <div data-xh-part="content" value="data">
            <a data-xh-part="link" href="#/data/warehouse">数据仓库</a>
            <a data-xh-part="link" href="#/data/pipeline">数据管道</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="ai">智能</button>
          <div data-xh-part="content" value="ai">
            <a data-xh-part="link" href="#/ai/agent">智能体</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 竖排

orientation="vertical" 把入口排成一列、面板改从侧边长出来，方向键随之改收上下键

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "system", label: "系统管理" },
  { value: "monitor", label: "运行监控" },
  { value: "tool", label: "系统工具" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  system: [
    { href: "#/system/user", label: "用户" },
    { href: "#/system/role", label: "角色" },
  ],
  monitor: [
    { href: "#/monitor/online", label: "在线用户" },
    { href: "#/monitor/job", label: "定时任务" },
  ],
  tool: [{ href: "#/tool/codegen", label: "代码生成" }],
};
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 40px">
    <XhNavigationMenuRoot
      :collection="entries"
      orientation="vertical"
      style="inline-size: 180px"
    >
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 40px">
  <xh-navigation-menu orientation="vertical" style="display: contents">
    <nav data-xh-part="root" style="inline-size: 180px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="system">系统管理</button>
          <div data-xh-part="content" value="system">
            <a data-xh-part="link" href="#/system/user">用户</a>
            <a data-xh-part="link" href="#/system/role">角色</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="monitor">运行监控</button>
          <div data-xh-part="content" value="monitor">
            <a data-xh-part="link" href="#/monitor/online">在线用户</a>
            <a data-xh-part="link" href="#/monitor/job">定时任务</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="tool">系统工具</button>
          <div data-xh-part="content" value="tool">
            <a data-xh-part="link" href="#/tool/codegen">代码生成</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 语气

tone 换的是入口的高亮底与指示条、当前链接的文字色，静止态一样：悬停到入口上、或用方向键把焦点移过去才显现

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

// 每档语气一个 root，root 里就一个入口，入口名即语气名
const tones = ["brand", "neutral", "success", "warning", "danger", "info"].map(
  tone => ({ tone, entries: [{ value: tone, label: tone }] }),
);
</script>

<template>
  <!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
  <div
    style="inline-size: 100%; display: flex; flex-wrap: wrap; gap: 8px; padding-block-end: 180px"
  >
    <XhNavigationMenuRoot
      v-for="t in tones"
      :key="t.tone"
      :collection="t.entries"
      :tone="t.tone"
    >
      <template #panel>
        <!-- 当前链接的文字色也吃这一档语气 -->
        <XhNavigationMenuLink href="#/docs/guide" current>
          上手指南
        </XhNavigationMenuLink>
        <XhNavigationMenuLink href="#/docs/anatomy">
          部件解剖
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
<div style="inline-size: 100%; display: flex; flex-wrap: wrap; gap: 8px; padding-block-end: 180px">
  <xh-navigation-menu tone="brand" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="brand">brand</button>
          <div data-xh-part="content" value="brand">
            <!-- 当前链接的文字色也吃这一档语气 -->
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <xh-navigation-menu tone="neutral" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="neutral">neutral</button>
          <div data-xh-part="content" value="neutral">
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <xh-navigation-menu tone="success" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="success">success</button>
          <div data-xh-part="content" value="success">
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <xh-navigation-menu tone="warning" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="warning">warning</button>
          <div data-xh-part="content" value="warning">
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <xh-navigation-menu tone="danger" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="danger">danger</button>
          <div data-xh-part="content" value="danger">
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <xh-navigation-menu tone="info" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="info">info</button>
          <div data-xh-part="content" value="info">
            <a data-xh-part="link" href="#/docs/guide" current>上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 尺寸

size 一档换掉入口的高度、内边距与字号，写在 root 上、面板里的链接一并跟着变

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
  ],
  docs: [{ href: "#/docs/guide", label: "上手指南" }],
};
</script>

<template>
  <!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
  <div
    style="
      inline-size: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 24px;
      padding-block-end: 180px;
    "
  >
    <div v-for="s in sizes" :key="s.label" style="display: grid; gap: 6px">
      <span>{{ s.label }}</span>
      <XhNavigationMenuRoot :collection="entries" :size="s.value">
        <template #panel="node">
          <XhNavigationMenuLink
            v-for="l in panels[node.value]"
            :key="l.href"
            :href="l.href"
          >
            {{ l.label }}
          </XhNavigationMenuLink>
        </template>
      </XhNavigationMenuRoot>
    </div>
  </div>
</template>
```

```html
<!-- 面板是绝对定位的浮层，这里给下方留出它落位的空间 -->
<div
  style="
    inline-size: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 24px;
    padding-block-end: 180px;
  "
>
  <div style="display: grid; gap: 6px">
    <span>sm</span>
    <xh-navigation-menu size="sm" style="display: contents">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="products">产品</button>
            <div data-xh-part="content" value="products">
              <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
              <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="docs">文档</button>
            <div data-xh-part="content" value="docs">
              <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            </div>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-navigation-menu>
  </div>

  <div style="display: grid; gap: 6px">
    <span>缺省</span>
    <xh-navigation-menu style="display: contents">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="products">产品</button>
            <div data-xh-part="content" value="products">
              <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
              <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="docs">文档</button>
            <div data-xh-part="content" value="docs">
              <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            </div>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-navigation-menu>
  </div>

  <div style="display: grid; gap: 6px">
    <span>lg</span>
    <xh-navigation-menu size="lg" style="display: contents">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="products">产品</button>
            <div data-xh-part="content" value="products">
              <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
              <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
            </div>
          </li>
          <li data-xh-part="item">
            <button data-xh-part="trigger" value="docs">文档</button>
            <div data-xh-part="content" value="docs">
              <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            </div>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-navigation-menu>
  </div>
</div>
```

### 直达入口

没有下级的去处不必套面板：那一项直接铺成一条 link，它不进方向键那一组（那一组只认 trigger），按 Tab 一样到得了

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  // 直达入口：给了 href 就没有 trigger 也没有面板，点了就跳走
  { value: "changelog", label: "更新日志", href: "#/changelog" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  products: [
    { href: "#/products/runtime", label: "运行时内核" },
    { href: "#/products/vue", label: "Vue 适配器" },
  ],
  docs: [
    { href: "#/docs/guide", label: "上手指南" },
    { href: "#/docs/anatomy", label: "部件解剖" },
  ],
};
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 150px">
    <XhNavigationMenuRoot :collection="entries">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 150px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
          <div data-xh-part="content" value="products">
            <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
            <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="docs">文档</button>
          <div data-xh-part="content" value="docs">
            <a data-xh-part="link" href="#/docs/guide">上手指南</a>
            <a data-xh-part="link" href="#/docs/anatomy">部件解剖</a>
          </div>
        </li>
        <li data-xh-part="item">
          <!-- 直达入口：这一项没有 trigger 也没有面板，点了就跳走 -->
          <a data-xh-part="link" href="#/changelog">更新日志</a>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 共享面板外壳

面板整批塞进 viewport 后落位归外壳管：几个入口的面板落在同一处，宽窄不同也不再各贴各的入口

```vue
<script setup lang="ts">
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuViewport,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "products",
    label: "产品",
    links: [
      { href: "#/products/runtime", label: "运行时内核" },
      { href: "#/products/vue", label: "Vue 适配器" },
      { href: "#/products/wc", label: "Web Components 适配器" },
    ],
  },
  {
    value: "docs",
    label: "文档",
    links: [{ href: "#/docs/guide", label: "上手指南" }],
  },
  {
    value: "about",
    label: "关于",
    links: [
      { href: "#/about/team", label: "团队" },
      { href: "#/about/contact", label: "联系我们" },
    ],
  },
];
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 180px">
    <XhNavigationMenuRoot>
      <XhNavigationMenuList>
        <XhNavigationMenuItem v-for="g in groups" :key="g.value">
          <XhNavigationMenuTrigger :value="g.value">
            {{ g.label }}
          </XhNavigationMenuTrigger>
        </XhNavigationMenuItem>
      </XhNavigationMenuList>

      <!-- 外壳放在 root 内、list 之后；里面装哪一份面板由各自的 value 决定。
           面板不再住在各自那一项里，按 Tab 走进面板要先走完全部入口 -->
      <XhNavigationMenuViewport>
        <XhNavigationMenuContent
          v-for="g in groups"
          :key="g.value"
          :value="g.value"
        >
          <XhNavigationMenuLink
            v-for="l in g.links"
            :key="l.href"
            :href="l.href"
          >
            {{ l.label }}
          </XhNavigationMenuLink>
        </XhNavigationMenuContent>
      </XhNavigationMenuViewport>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 180px">
  <xh-navigation-menu style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="docs">文档</button>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="about">关于</button>
        </li>
      </ul>

      <!-- 外壳放在 root 内、list 之后；里面装哪一份面板由各自的 value 决定。
           面板不再住在各自那一项里，按 Tab 走进面板要先走完全部入口 -->
      <div data-xh-part="viewport">
        <div data-xh-part="content" value="products">
          <a data-xh-part="link" href="#/products/runtime">运行时内核</a>
          <a data-xh-part="link" href="#/products/vue">Vue 适配器</a>
          <a data-xh-part="link" href="#/products/wc">Web Components 适配器</a>
        </div>
        <div data-xh-part="content" value="docs">
          <a data-xh-part="link" href="#/docs/guide">上手指南</a>
        </div>
        <div data-xh-part="content" value="about">
          <a data-xh-part="link" href="#/about/team">团队</a>
          <a data-xh-part="link" href="#/about/contact">联系我们</a>
        </div>
      </div>
    </nav>
  </xh-navigation-menu>
</div>
```

### 默认展开项

defaultValue 只定首帧展开哪一项，之后照常由交互接管；指针移开、Escape 或点回入口都收得起来

```vue
<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "guide", label: "指南" },
  { value: "components", label: "组件" },
];

const panels: Record<string, Array<{ href: string; label: string }>> = {
  guide: [
    { href: "#/guide/install", label: "安装" },
    { href: "#/guide/quick-start", label: "快速开始" },
  ],
  components: [
    { href: "#/components/menu", label: "菜单" },
    { href: "#/components/toolbar", label: "工具栏" },
  ],
};
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 150px">
    <!-- 首帧就展开「指南」，指示条也一并落在它下面 -->
    <XhNavigationMenuRoot :collection="entries" default-value="guide">
      <template #panel="node">
        <XhNavigationMenuLink
          v-for="l in panels[node.value]"
          :key="l.href"
          :href="l.href"
        >
          {{ l.label }}
        </XhNavigationMenuLink>
      </template>
    </XhNavigationMenuRoot>
  </div>
</template>
```

```html
<div style="inline-size: 100%; padding-block-end: 150px">
  <!-- 首帧就展开「指南」，指示条也一并落在它下面 -->
  <xh-navigation-menu default-value="guide" style="display: contents">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="guide">指南</button>
          <div data-xh-part="content" value="guide">
            <a data-xh-part="link" href="#/guide/install">安装</a>
            <a data-xh-part="link" href="#/guide/quick-start">快速开始</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="components">组件</button>
          <div data-xh-part="content" value="components">
            <a data-xh-part="link" href="#/components/menu">菜单</a>
            <a data-xh-part="link" href="#/components/toolbar">工具栏</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
```

### 收窄成一列图标

竖排时面板本就从入口侧边长出来；收窄只是把文字从入口里撤掉、把它挪进面板，指针停上去才露出来

```vue
<script setup lang="ts">
import {
  XhButton,
  XhIcon,
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 三个图标共用一套描边呈现属性，stroke 取 currentColor
const strokeAttrs = {
  "fill": "none",
  "stroke": "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const UsersIcon = {
  name: "users",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "circle", attrs: { cx: "9", cy: "8", r: "3" } },
    { tag: "path", attrs: { d: "M3 20A6 6 0 0 1 15 20" } },
    { tag: "path", attrs: { d: "M17 11A3 3 0 0 0 17 5" } },
  ],
} as const;

const PulseIcon = {
  name: "pulse",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [{ tag: "path", attrs: { d: "M3 12H7L10 5L14 19L17 12H21" } }],
} as const;

const ToolIcon = {
  name: "tool",
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  nodes: [
    { tag: "path", attrs: { d: "M14 6A4 4 0 1 0 18 10L20 8V4H16L14 6Z" } },
    { tag: "path", attrs: { d: "M13 11L5 19L7 21L15 13" } },
  ],
} as const;

const groups = [
  {
    value: "system",
    label: "系统管理",
    icon: UsersIcon,
    links: [
      { href: "#/system/user", label: "用户" },
      { href: "#/system/role", label: "角色" },
    ],
  },
  {
    value: "monitor",
    label: "运行监控",
    icon: PulseIcon,
    links: [
      { href: "#/monitor/online", label: "在线用户" },
      { href: "#/monitor/job", label: "定时任务" },
    ],
  },
  {
    value: "tool",
    label: "系统工具",
    icon: ToolIcon,
    links: [{ href: "#/tool/codegen", label: "代码生成" }],
  },
];

const collapsed = ref(true);
</script>

<template>
  <div style="inline-size: 100%; display: flex; gap: 16px; padding-block-end: 40px">
    <XhNavigationMenuRoot
      orientation="vertical"
      :style="{ inlineSize: collapsed ? '56px' : '190px' }"
    >
      <XhNavigationMenuList>
        <XhNavigationMenuItem v-for="g in groups" :key="g.value">
          <XhNavigationMenuTrigger
            :value="g.value"
            :style="{ justifyContent: collapsed ? 'center' : 'flex-start' }"
          >
            <XhIcon :icon="g.icon" size="sm" :label="collapsed ? g.label : undefined" />
            <span v-if="!collapsed">{{ g.label }}</span>
          </XhNavigationMenuTrigger>
          <XhNavigationMenuContent :value="g.value">
            <span
              v-if="collapsed"
              style="padding: 2px 8px; color: var(--xh-fg-muted); font-size: 12px"
            >
              {{ g.label }}
            </span>
            <XhNavigationMenuLink v-for="l in g.links" :key="l.href" :href="l.href">
              {{ l.label }}
            </XhNavigationMenuLink>
          </XhNavigationMenuContent>
        </XhNavigationMenuItem>
        <XhNavigationMenuIndicator />
      </XhNavigationMenuList>
    </XhNavigationMenuRoot>

    <XhButton size="sm" variant="outline" @click="collapsed = !collapsed">
      {{ collapsed ? "展开侧栏" : "收窄侧栏" }}
    </XhButton>
  </div>
</template>
```

```html
<div
  id="navigation-menu-collapsed"
  style="inline-size: 100%; display: flex; gap: 16px; padding-block-end: 40px"
>
  <xh-navigation-menu orientation="vertical" style="display: contents">
    <nav data-xh-part="root" style="inline-size: 56px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="system" style="justify-content: center">
            <xh-icon size="sm" data-glyph="users" label="系统管理">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-text hidden>系统管理</span>
          </button>
          <div data-xh-part="content" value="system">
            <span data-caption style="padding: 2px 8px; color: var(--xh-fg-muted); font-size: 12px">
              系统管理
            </span>
            <a data-xh-part="link" href="#/system/user">用户</a>
            <a data-xh-part="link" href="#/system/role">角色</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="monitor" style="justify-content: center">
            <xh-icon size="sm" data-glyph="pulse" label="运行监控">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-text hidden>运行监控</span>
          </button>
          <div data-xh-part="content" value="monitor">
            <span data-caption style="padding: 2px 8px; color: var(--xh-fg-muted); font-size: 12px">
              运行监控
            </span>
            <a data-xh-part="link" href="#/monitor/online">在线用户</a>
            <a data-xh-part="link" href="#/monitor/job">定时任务</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="tool" style="justify-content: center">
            <xh-icon size="sm" data-glyph="tool" label="系统工具">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-text hidden>系统工具</span>
          </button>
          <div data-xh-part="content" value="tool">
            <span data-caption style="padding: 2px 8px; color: var(--xh-fg-muted); font-size: 12px">
              系统工具
            </span>
            <a data-xh-part="link" href="#/tool/codegen">代码生成</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>

  <xh-button size="sm" variant="outline">
    <button data-xh-part="root" id="navigation-menu-collapsed-toggle">展开侧栏</button>
  </xh-button>
</div>

<script type="module">
  // 三个图标共用一套描边呈现属性，stroke 取 currentColor
  const strokeAttrs = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const icons = {
    users: {
      name: "users",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "circle", attrs: { cx: "9", cy: "8", r: "3" } },
        { tag: "path", attrs: { d: "M3 20A6 6 0 0 1 15 20" } },
        { tag: "path", attrs: { d: "M17 11A3 3 0 0 0 17 5" } },
      ],
    },
    pulse: {
      name: "pulse",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [{ tag: "path", attrs: { d: "M3 12H7L10 5L14 19L17 12H21" } }],
    },
    tool: {
      name: "tool",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M14 6A4 4 0 1 0 18 10L20 8V4H16L14 6Z" } },
        { tag: "path", attrs: { d: "M13 11L5 19L7 21L15 13" } },
      ],
    },
  };

  const scope = document.getElementById("navigation-menu-collapsed");
  const nav = scope.querySelector('[data-xh-part="root"]');
  const toggle = document.getElementById("navigation-menu-collapsed-toggle");

  // 图标记录是对象，只走 property
  for (const el of scope.querySelectorAll("xh-icon")) el.icon = icons[el.dataset.glyph];

  let collapsed = true;

  // 收窄只挪动文字：入口里的撤掉、面板里的补上，图标同时接过可及名字
  function apply() {
    nav.style.inlineSize = collapsed ? "56px" : "190px";
    for (const el of scope.querySelectorAll('[data-xh-part="trigger"]'))
      el.style.justifyContent = collapsed ? "center" : "flex-start";
    for (const el of scope.querySelectorAll("[data-text]")) el.hidden = collapsed;
    for (const el of scope.querySelectorAll("[data-caption]")) el.hidden = !collapsed;
    for (const el of scope.querySelectorAll("xh-icon")) {
      const name = el.parentElement.querySelector("[data-text]").textContent.trim();
      if (collapsed) el.setAttribute("label", name);
      else el.removeAttribute("label");
    }
    toggle.textContent = collapsed ? "展开侧栏" : "收窄侧栏";
  }

  apply();
  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    apply();
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-navigation-menu>` |
| Vue 组件 | `XhNavigationMenuContent` `XhNavigationMenuIndicator` `XhNavigationMenuItem` `XhNavigationMenuLink` `XhNavigationMenuList` `XhNavigationMenuRoot` `XhNavigationMenuTrigger` `XhNavigationMenuTriggerIndicator` `XhNavigationMenuViewport` |
| 组合式函数 | `useNavigationMenu` |
| 状态机 | `navigationMenuMachine` |
| 皮肤 | `@xihan-ui/styles/navigation-menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="navigation-menu"`：**`root`** · **`list`** · **`item`** · `trigger` · `trigger-indicator` · `content` · **`link`** · `indicator` · `viewport`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `NavigationMenuNode[]` |  | 入口数据，入口文本与禁用的事实源。给了它，trigger 部件只需报 value。 缺省即回到「文本与禁用都写在部件上」的老路。 |
| `value` | `string \| null` |  | 当前展开项，给定即受控；null 表示都收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal。 |
| `delayDuration` | `number` |  | 悬停/聚焦到 trigger 后等多久才展开，默认 200ms。 |
| `skipDelayDuration` | `number` |  | 收起之后的静默窗口，默认 300ms；窗口内再碰任意 trigger 直接展开。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整套导航禁用：所有入口都转 aria-disabled，面板不再展开。 |
| `translations` | `Partial<NavigationMenuTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: NavigationMenuValueChangeDetails) => void` |  | value 变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NavigationMenuValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `trigger-indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `opening` · `skipping`

**事件**：`TRIGGER.POINTER` · `TRIGGER.FOCUS` · `TRIGGER.TOGGLE` · `DISMISS` · `VALUE.SET` · `after.delayDuration` · `after.skipDelayDuration`

**判据**：`hasValue` · `isCurrent` · `shouldKeepOpen`

## connect API

`useNavigationMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的那一项；都收起时为 null。 |
| `collection` | `readonly NavigationMenuNodeMeta[]` | collection 推出的入口元信息，按数据顺序排列；没给 collection 即空数组。 |
| `open` | `boolean` | 有没有面板展开着。 |
| `isOpen` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: NavigationMenuTriggerProps) => T['button']` |  |
| `getTriggerIndicatorProps` | `(props: NavigationMenuTriggerProps) => T['element']` |  |
| `getContentProps` | `(props: NavigationMenuContentProps) => T['element']` |  |
| `getLinkProps` | `(props: NavigationMenuLinkProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in trigger, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；随后的自动展开走 delayDuration |
| `ArrowLeft` / `ArrowUp` | focus in trigger, 按键与 orientation 同轴 | 焦点移到上一个 trigger |
| `Home` | focus in trigger | 焦点移到首个可停留 trigger |
| `End` | focus in trigger | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 立即展开对应面板（不走 delayDuration）；面板是自动弹出来的那一次不收起，再按一次才收起 |
| `Escape` | open | 收起面板并把焦点归还对应 trigger；静默窗口内这一次归还不会把面板重新弹出来 |
| `Tab` / `Shift+Tab` | open, focus in trigger | 走进展开的面板：面板就在 trigger 之后，收起的面板带 hidden 因而被整个跳过 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger-indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'group' |
| `link` | `aria-current` | 'page' \| undefined |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/navigation-menu.css` 按部件选择：`[data-scope="navigation-menu"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-orientation` | props.orientation |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `trigger-indicator` | `data-orientation` | props.orientation |
| `trigger-indicator` | `data-state` | 'open' \| 'closed' |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-value` | context.get('value') |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-navigation-menu-content-bg` · `--xh-navigation-menu-content-border` · `--xh-navigation-menu-content-gap` · `--xh-navigation-menu-content-min-w` · `--xh-navigation-menu-content-offset` · `--xh-navigation-menu-content-p` · `--xh-navigation-menu-content-radius` · `--xh-navigation-menu-content-shadow` · `--xh-navigation-menu-fg` · `--xh-navigation-menu-font-size` · `--xh-navigation-menu-gap` · `--xh-navigation-menu-icon-size` · `--xh-navigation-menu-indicator-color` · `--xh-navigation-menu-indicator-radius` · `--xh-navigation-menu-indicator-thickness` · `--xh-navigation-menu-layer` · `--xh-navigation-menu-link-bg-hover` · `--xh-navigation-menu-link-fg` · `--xh-navigation-menu-link-fg-current` · `--xh-navigation-menu-link-font-size` · `--xh-navigation-menu-link-font-weight-current` · `--xh-navigation-menu-link-px` · `--xh-navigation-menu-link-py` · `--xh-navigation-menu-link-radius` · `--xh-navigation-menu-trigger-bg-active` · `--xh-navigation-menu-trigger-bg-hover` · `--xh-navigation-menu-trigger-fg` · `--xh-navigation-menu-trigger-font-weight` · `--xh-navigation-menu-trigger-gap` · `--xh-navigation-menu-trigger-h` · `--xh-navigation-menu-trigger-px` · `--xh-navigation-menu-trigger-radius` · `--xh-navigation-menu-viewport-p`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `block-size` · `inline-size` · `inset-block-start` · `inset-inline-start` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[布局](./layout)的头部配合；窄屏时整体换成[抽屉](./drawer)里的[侧栏导航](./side-nav)。

## 最佳实践

- 面板里的链接分组并加组标题，一整块无结构的链接墙没人看得下去。
- 延时保留默认值：调到 0 会让导航在指针路过时不停闪。

## 反模式

- 面板里混进需要提交的表单或命令按钮。
- 悬停即刻展开且没有静默窗口：指针横穿时面板一路弹出。
