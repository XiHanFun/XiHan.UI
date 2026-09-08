来源：https://ui.docs.xihanfun.com/components/side-nav

# 侧栏导航 `side-nav`

后台侧边那棵导航树：分支可展开，选中落在叶子上并一路点亮祖先枝。

## 何时使用

- 管理后台、控制台的主导航，层级两到三层。
- 侧栏需要折叠成图标栏，且折叠后仍要能进到子级。

## 何时不用

- 导航只有一层：用一列链接就够。
- 是内容树而不是导航树（文件、组织架构）：用[树](./tree)。
- 顶部横向导航：用[导航菜单](./navigation-menu)。

## 特性

- `collection` 是层级与文本的唯一事实源。
- `accordion` 让同层只开一枝；不开即可多开。
- 折叠成图标栏时内嵌展开整体收起、文字由皮肤藏掉；顶层分支换装浮层弹出，悬停 / 点按 / 右方向键在旁侧弹出子级面板，面板内选中即落值收起。
- 方向键上下走行、左右管层级。

## 示例

### 基础用法

管理后台侧栏：分支内嵌展开（可多开）、选中落在叶子上并一路点亮祖先枝，方向键上下走行、左右管层级

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#user-list" },
      { value: "user-role", label: "角色权限", href: "#user-role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#order-list" },
      { value: "order-refund", label: "退款处理", href: "#order-refund" },
    ],
  },
];

const value = ref<string | null>("user-list");
</script>

<template>
  <XhSideNavRoot
    v-model:value="value"
    :collection="collection"
    :default-expanded-value="['user']"
    style="border: 1px solid var(--xh-border-default); border-radius: 8px"
  >
    <XhSideNavList>
      <XhSideNavItem>
        <XhSideNavLink value="dashboard"><XhSideNavLinkText>工作台</XhSideNavLinkText></XhSideNavLink>
      </XhSideNavItem>
      <XhSideNavBranch v-for="branch in collection.filter((n) => n.children)" :key="branch.value" :value="branch.value">
        <XhSideNavBranchTrigger>
          <XhSideNavBranchText>{{ branch.label }}</XhSideNavBranchText>
          <XhSideNavBranchIndicator />
        </XhSideNavBranchTrigger>
        <XhSideNavBranchContent>
          <XhSideNavItem v-for="leaf in branch.children" :key="leaf.value">
            <XhSideNavLink :value="leaf.value">
              <XhSideNavLinkText>{{ leaf.label }}</XhSideNavLinkText>
            </XhSideNavLink>
          </XhSideNavItem>
        </XhSideNavBranchContent>
      </XhSideNavBranch>
    </XhSideNavList>
  </XhSideNavRoot>
  <p>选中：{{ value ?? "（无）" }}</p>
</template>
```

```html
<xh-side-nav id="side-nav-basic" default-value="user-list">
  <nav
    data-xh-part="root"
    style="border: 1px solid var(--xh-border-default); border-radius: 8px"
  >
    <ul data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" value="dashboard">
          <span data-xh-part="link-text">工作台</span>
        </a>
      </li>
      <li data-xh-part="branch" value="user">
        <button data-xh-part="branch-trigger">
          <span data-xh-part="branch-text">用户管理</span>
          <span data-xh-part="branch-indicator"></span>
        </button>
        <ul data-xh-part="branch-content">
          <li data-xh-part="item">
            <a data-xh-part="link" value="user-list">
              <span data-xh-part="link-text">用户列表</span>
            </a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="user-role">
              <span data-xh-part="link-text">角色权限</span>
            </a>
          </li>
        </ul>
      </li>
      <li data-xh-part="branch" value="order">
        <button data-xh-part="branch-trigger">
          <span data-xh-part="branch-text">订单管理</span>
          <span data-xh-part="branch-indicator"></span>
        </button>
        <ul data-xh-part="branch-content">
          <li data-xh-part="item">
            <a data-xh-part="link" value="order-list">
              <span data-xh-part="link-text">订单列表</span>
            </a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="order-refund">
              <span data-xh-part="link-text">退款处理</span>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</xh-side-nav>
<p>选中：<span id="side-nav-basic-value">user-list</span></p>

<script type="module">
  const nav = document.getElementById("side-nav-basic");
  const readout = document.getElementById("side-nav-basic-value");

  // 入口树是 href 与层级的事实源，数组只能走 property
  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#user-list" },
        { value: "user-role", label: "角色权限", href: "#user-role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order-list", label: "订单列表", href: "#order-list" },
        { value: "order-refund", label: "退款处理", href: "#order-refund" },
      ],
    },
  ];

  // 展开集合同样只走 property，元素发来的意图原样写回
  nav.expandedValue = ["user"];
  nav.addEventListener("expanded-value-change", (event) => {
    nav.expandedValue = event.detail.value;
  });

  nav.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value ?? "（无）";
  });
</script>
```

### 手风琴与折叠

accordion 让同层只开一枝；collapsed 折叠成图标栏（内嵌展开整体收起，文字部件整个隐藏只剩图标），折叠态下悬停/点按/右方向键在旁侧弹出子级面板，面板内选中即落值收起；collapsedPopout 设为 false 可关掉弹出

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import {
  XhButton,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection: SideNavNode[] = [
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#user-list" },
      { value: "user-role", label: "角色权限", href: "#user-role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [{ value: "order-list", label: "订单列表", href: "#order-list" }],
  },
  {
    value: "system",
    label: "系统设置",
    children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
  },
];

const collapsed = ref(false);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <XhButton variant="outline" @click="collapsed = !collapsed">
      {{ collapsed ? "展开侧栏" : "折叠成图标栏" }}
    </XhButton>
    <XhSideNavRoot
      :collection="collection"
      :collapsed="collapsed"
      accordion
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <XhSideNavList>
        <XhSideNavBranch v-for="branch in collection" :key="branch.value" :value="branch.value">
          <XhSideNavBranchTrigger>
            <span aria-hidden="true">▦</span>
            <XhSideNavBranchText>{{ branch.label }}</XhSideNavBranchText>
            <XhSideNavBranchIndicator />
          </XhSideNavBranchTrigger>
          <XhSideNavBranchContent>
            <XhSideNavItem v-for="leaf in branch.children" :key="leaf.value">
              <XhSideNavLink :value="leaf.value">
                <XhSideNavLinkText>{{ leaf.label }}</XhSideNavLinkText>
              </XhSideNavLink>
            </XhSideNavItem>
          </XhSideNavBranchContent>
        </XhSideNavBranch>
      </XhSideNavList>
    </XhSideNavRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <xh-button variant="outline">
    <button data-xh-part="root" id="side-nav-collapse-toggle">折叠成图标栏</button>
  </xh-button>

  <xh-side-nav id="side-nav-accordion" accordion>
    <nav
      data-xh-part="root"
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <ul data-xh-part="list">
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span aria-hidden="true">▦</span>
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li data-xh-part="item">
                <a data-xh-part="link" value="user-list">
                  <span data-xh-part="link-text">用户列表</span>
                </a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="user-role">
                  <span data-xh-part="link-text">角色权限</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li data-xh-part="branch" value="order">
          <button data-xh-part="branch-trigger">
            <span aria-hidden="true">▦</span>
            <span data-xh-part="branch-text">订单管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li data-xh-part="item">
                <a data-xh-part="link" value="order-list">
                  <span data-xh-part="link-text">订单列表</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li data-xh-part="branch" value="system">
          <button data-xh-part="branch-trigger">
            <span aria-hidden="true">▦</span>
            <span data-xh-part="branch-text">系统设置</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li data-xh-part="item">
                <a data-xh-part="link" value="system-log">
                  <span data-xh-part="link-text">操作日志</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  </xh-side-nav>
</div>

<script type="module">
  const nav = document.getElementById("side-nav-accordion");
  const toggle = document.getElementById("side-nav-collapse-toggle");

  // 入口树是 href 与层级的事实源，数组只能走 property
  nav.collection = [
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#user-list" },
        { value: "user-role", label: "角色权限", href: "#user-role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [{ value: "order-list", label: "订单列表", href: "#order-list" }],
    },
    {
      value: "system",
      label: "系统设置",
      children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
    },
  ];

  toggle.addEventListener("click", () => {
    nav.collapsed = !nav.collapsed;
    toggle.textContent = nav.collapsed ? "展开侧栏" : "折叠成图标栏";
  });
</script>
```

### 语气与尺寸

tone 换选中行与展开枝用哪族颜色，size 换行高与缩进档；两轴都打在 root 上，逐层继承

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from "@xihan-ui/vue";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#user-list" },
      { value: "user-role", label: "角色权限", href: "#user-role" },
    ],
  },
];

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
    <XhSideNavRoot
      v-for="row in rows"
      :key="row.label"
      :collection="collection"
      :tone="row.tone"
      :size="row.size"
      default-value="user-list"
      :default-expanded-value="['user']"
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <XhSideNavList>
        <XhSideNavItem>
          <XhSideNavLink value="dashboard">
            <XhSideNavLinkText>工作台 · {{ row.label }}</XhSideNavLinkText>
          </XhSideNavLink>
        </XhSideNavItem>
        <XhSideNavBranch value="user">
          <XhSideNavBranchTrigger>
            <XhSideNavBranchText>用户管理</XhSideNavBranchText>
            <XhSideNavBranchIndicator />
          </XhSideNavBranchTrigger>
          <XhSideNavBranchContent>
            <XhSideNavItem>
              <XhSideNavLink value="user-list">
                <XhSideNavLinkText>用户列表</XhSideNavLinkText>
              </XhSideNavLink>
            </XhSideNavItem>
            <XhSideNavItem>
              <XhSideNavLink value="user-role">
                <XhSideNavLinkText>角色权限</XhSideNavLinkText>
              </XhSideNavLink>
            </XhSideNavItem>
          </XhSideNavBranchContent>
        </XhSideNavBranch>
      </XhSideNavList>
    </XhSideNavRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
  <xh-side-nav class="side-nav-axes" tone="success" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · success</span>
          </a>
        </li>
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-list">
                <span data-xh-part="link-text">用户列表</span>
              </a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-role">
                <span data-xh-part="link-text">角色权限</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </xh-side-nav>

  <xh-side-nav class="side-nav-axes" tone="danger" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · danger</span>
          </a>
        </li>
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-list">
                <span data-xh-part="link-text">用户列表</span>
              </a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-role">
                <span data-xh-part="link-text">角色权限</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </xh-side-nav>

  <xh-side-nav class="side-nav-axes" size="sm" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · sm</span>
          </a>
        </li>
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-list">
                <span data-xh-part="link-text">用户列表</span>
              </a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-role">
                <span data-xh-part="link-text">角色权限</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </xh-side-nav>

  <xh-side-nav class="side-nav-axes" size="lg" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · lg</span>
          </a>
        </li>
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-list">
                <span data-xh-part="link-text">用户列表</span>
              </a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-role">
                <span data-xh-part="link-text">角色权限</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </xh-side-nav>
</div>

<script type="module">
  // 入口树与展开集合都是数组，只走 property：四份共用同一棵树
  const collection = [
    { value: "dashboard", label: "工作台", href: "#dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#user-list" },
        { value: "user-role", label: "角色权限", href: "#user-role" },
      ],
    },
  ];
  for (const nav of document.querySelectorAll(".side-nav-axes")) {
    nav.collection = collection;
    nav.expandedValue = ["user"];
    nav.addEventListener("expanded-value-change", (event) => {
      nav.expandedValue = event.detail.value;
    });
  }
</script>
```

### 受控展开与禁用

展开集合交给宿主：一次全展开或全收起，也能按当前路由把该开的那一枝开上；collection 里标了 disabled 的入口方向键跳过，点它也不落值

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import {
  XhButton,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#user-list" },
      { value: "user-role", label: "角色权限", href: "#user-role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#order-list" },
      // 没开这项权限：方向键跳过它，点也不落值
      { value: "order-refund", label: "退款处理", disabled: true },
    ],
  },
  {
    value: "system",
    label: "系统设置",
    children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
  },
];

const branches = collection.filter(node => node.children);

const expanded = ref<string[]>(["user"]);
const value = ref<string | null>("user-list");

// 展开集合归宿主，组件只发意图：这两颗钮改的是同一份状态
function expandAll() {
  expanded.value = branches.map(branch => branch.value);
}

function collapseAll() {
  expanded.value = [];
}
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="expandAll">全部展开</XhButton>
      <XhButton size="sm" variant="outline" @click="collapseAll">全部收起</XhButton>
    </div>

    <XhSideNavRoot
      v-model:value="value"
      v-model:expanded-value="expanded"
      :collection="collection"
      loop
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <XhSideNavList>
        <XhSideNavItem>
          <XhSideNavLink value="dashboard">
            <XhSideNavLinkText>工作台</XhSideNavLinkText>
          </XhSideNavLink>
        </XhSideNavItem>
        <XhSideNavBranch v-for="branch in branches" :key="branch.value" :value="branch.value">
          <XhSideNavBranchTrigger>
            <XhSideNavBranchText>{{ branch.label }}</XhSideNavBranchText>
            <XhSideNavBranchIndicator />
          </XhSideNavBranchTrigger>
          <XhSideNavBranchContent>
            <XhSideNavItem v-for="leaf in branch.children" :key="leaf.value">
              <XhSideNavLink :value="leaf.value">
                <XhSideNavLinkText>{{ leaf.label }}</XhSideNavLinkText>
              </XhSideNavLink>
            </XhSideNavItem>
          </XhSideNavBranchContent>
        </XhSideNavBranch>
      </XhSideNavList>
    </XhSideNavRoot>

    <p style="font-size: 13px; opacity: 0.75">
      展开：{{ expanded.length ? expanded.join("、") : "（全收起）" }} · 选中：{{
        value ?? "（无）"
      }}
    </p>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; justify-items: start">
  <div style="display: flex; gap: 8px">
    <xh-button size="sm" variant="outline">
      <button data-xh-part="root" id="side-nav-expand-all">全部展开</button>
    </xh-button>
    <xh-button size="sm" variant="outline">
      <button data-xh-part="root" id="side-nav-collapse-all">全部收起</button>
    </xh-button>
  </div>

  <xh-side-nav id="side-nav-controlled" default-value="user-list" loop>
    <nav
      data-xh-part="root"
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台</span>
          </a>
        </li>
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-list">
                <span data-xh-part="link-text">用户列表</span>
              </a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="user-role">
                <span data-xh-part="link-text">角色权限</span>
              </a>
            </li>
          </ul>
        </li>
        <li data-xh-part="branch" value="order">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">订单管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="order-list">
                <span data-xh-part="link-text">订单列表</span>
              </a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="order-refund">
                <span data-xh-part="link-text">退款处理</span>
              </a>
            </li>
          </ul>
        </li>
        <li data-xh-part="branch" value="system">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">系统设置</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="system-log">
                <span data-xh-part="link-text">操作日志</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </xh-side-nav>

  <p id="side-nav-controlled-readout" style="font-size: 13px; opacity: 0.75">
    展开：user · 选中：user-list
  </p>
</div>

<script type="module">
  const nav = document.getElementById("side-nav-controlled");
  const readout = document.getElementById("side-nav-controlled-readout");

  // 入口树是 href、层级与禁用的事实源，数组只能走 property
  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#user-list" },
        { value: "user-role", label: "角色权限", href: "#user-role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order-list", label: "订单列表", href: "#order-list" },
        // 没开这项权限：方向键跳过它，点也不落值
        { value: "order-refund", label: "退款处理", disabled: true },
      ],
    },
    {
      value: "system",
      label: "系统设置",
      children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
    },
  ];

  const branches = nav.collection.filter((node) => node.children);

  nav.expandedValue = ["user"];
  // 选中仍走非受控（default-value），这里只留一份读数
  let selected = "user-list";

  function render() {
    const expanded = nav.expandedValue.length ? nav.expandedValue.join("、") : "（全收起）";
    readout.textContent = `展开：${expanded} · 选中：${selected ?? "（无）"}`;
  }

  // 展开集合归宿主，元素只发意图：这两颗钮改的是同一份状态
  document.getElementById("side-nav-expand-all").addEventListener("click", () => {
    nav.expandedValue = branches.map((branch) => branch.value);
    render();
  });
  document.getElementById("side-nav-collapse-all").addEventListener("click", () => {
    nav.expandedValue = [];
    render();
  });

  nav.addEventListener("expanded-value-change", (event) => {
    nav.expandedValue = event.detail.value;
    render();
  });
  nav.addEventListener("value-change", (event) => {
    selected = event.detail.value;
    render();
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-side-nav>` |
| Vue 组件 | `XhSideNavBranch` `XhSideNavBranchContent` `XhSideNavBranchIndicator` `XhSideNavBranchText` `XhSideNavBranchTrigger` `XhSideNavGroup` `XhSideNavGroupLabel` `XhSideNavItem` `XhSideNavLink` `XhSideNavLinkText` `XhSideNavList` `XhSideNavRoot` |
| 组合式函数 | `useSideNav` |
| 状态机 | `sideNavMachine` |
| 皮肤 | `@xihan-ui/styles/side-nav.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="side-nav"`：**`root`** · **`list`** · **`item`** · `group` · `group-label` · `branch` · `branch-trigger` · `branch-text` · `branch-indicator` · `positioner` · `branch-content` · **`link`** · `link-text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SideNavNode[]` |  | 入口树，层级与文本的唯一事实源。缺省为空。 |
| `value` | `string \| null` |  | 选中的叶子（单选）。给定即受控：cell 直读 prop，写只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `accordion` | `boolean` |  | 同层手风琴：展开一枝时收起同层其余分支，默认 false（可多开）。 |
| `collapsed` | `boolean` |  | 折叠成图标栏：内嵌展开整体收起、文字由皮肤藏掉，只剩图标一列。 顶层分支换装浮层弹出：悬停/点按/右方向键在旁侧弹出子级面板。 |
| `collapsedPopout` | `boolean` |  | 折叠态下顶层分支是否弹出子级面板，默认 true；关掉即回到纯图标栏。 |
| `disabled` | `boolean` |  | 整个侧栏禁用。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<SideNavTranslations>` |  |  |
| `onValueChange` | `(details: SideNavValueChangeDetails) => void` |  | 选中意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onExpandedValueChange` | `(details: SideNavExpandedValueChangeDetails) => void` |  | 展开集合变化意图回调；语义同上。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SideNavValueChangeDetails` | 选中变化；detail 为 `{ value: string \| null }` |
| `expanded-value-change` | `SideNavExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSideNavRoot` | `default` | `SideNavRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `popout-positioner` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `popout`

**事件**：`VALUE.SET` · `LINK.SELECT` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `FOCUS.CLEAR` · `POPOUT.OPEN` · `POPOUT.CLOSE`

**判据**：`canChange` · `canPopout`

## connect API

`useSideNav` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 选中的叶子；尚未选中为 null。 |
| `expandedValue` | `string[]` |  |
| `collapsed` | `boolean` | 折叠成图标栏；顶层分支改为浮层弹出子级面板。 |
| `popoutValue` | `string \| null` | 折叠态下正弹出子级面板的顶层分支；没弹出为 null。 |
| `openPopout` | `(value: string) => void` | 弹出某顶层分支的子级面板（仅折叠态有效）。 |
| `closePopout` | `() => void` |  |
| `focusedValue` | `string \| null` | roving tabindex 的锚点；无可见锚点为 null。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `isActiveBranch` | `(value: string) => boolean` | 选中项的祖先分支：展开高亮「当前所在的那一枝」。 |
| `select` | `(value: string) => void` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` | 叶子行的列表项容器：链接与分支一样是列表的一条，作者把 link 裹在它里面。 |
| `getGroupProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: SideNavNodeProps) => T['button']` |  |
| `getBranchTextProps` | `() => T['element']` | 行文字的载体：折叠成图标栏时由皮肤整个藏掉，不会裁出半个字。 |
| `getBranchIndicatorProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `isPopoutPanel` | `(value: string) => boolean` | 该分支在折叠态下是否以浮层面板出现；决定作者要不要渲染定位层。 |
| `getPopoutPositionerProps` | `(props: SideNavNodeProps) => T['element']` | 弹出面板的定位层。吃引擎坐标、承载层号，作者须把它搬到浮层落点， 免得祖先的层叠上下文把面板困住。非弹出分支不渲染这一层。 |
| `getBranchContentProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` | 链接文字的载体：折叠时由皮肤整个藏掉。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in branch-trigger | 展开/收起该枝（原生按钮激活） |
| `Enter` | focus in link | 激活链接（原生行为）并落选中 |
| `ArrowDown` | focus in 行 | 下一可见行（roving tabindex） |
| `ArrowUp` | focus in 行 | 上一可见行 |
| `ArrowRight` | focus in 收起的分支行 | 展开该枝；已展开时进第一个子行（RTL 与 ArrowLeft 对调） |
| `ArrowLeft` | focus in 展开的分支行 | 收起该枝；叶子或已收起时回父分支（RTL 与 ArrowRight 对调） |
| `Home` | focus in 行 | 第一可见行 |
| `End` | focus in 行 | 最后一可见行 |
| `ArrowRight` / `Enter` / `Space` | focus in 折叠态顶层分支行 | 弹出子级面板并落焦第一行（RTL 与 ArrowLeft 对调） |
| `ArrowLeft` / `Escape` | focus in 弹出面板 | 收回面板，焦点还给触发按钮（RTL 与 ArrowRight 对调；Escape 归消解层） |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations?.root |
| `root` | `role` | 'navigation' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `branch-trigger` | `aria-controls` | `content` 部件的 id |
| `branch-trigger` | `aria-expanded` | 'true' \| 'false' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| undefined |

- `list` 与 `branch-content` 是列表容器（`ul`），直接子节点只能是列表项：分支写 `branch`（`li`），叶子写 `item`（`li`）裹住 `link`（`a`）。链接直接挂在列表下会让列表语义作废。
- 行文字必须写进 `branch-text` / `link-text`。折叠成图标栏时这段文字被裁到看不见但仍参与播报，它就是按钮与链接在图标栏里唯一的可及名；行里只放图标不写文字，折叠后读屏报不出这一项是什么。
- 行里的图标是装饰，写 `aria-hidden="true"`，别让它挤进可及名。

## 样式

默认皮肤 `@xihan-ui/styles/side-nav.css` 按部件选择：`[data-scope="side-nav"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-collapsed` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-collapsed` | ''（条件成立时才出现） |
| `group-label` | `data-collapsed` | ''（条件成立时才出现） |
| `branch` | `data-disabled` | ''（条件成立时才出现） |
| `branch` | `data-in-path` | ''（条件成立时才出现） |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `branch-trigger` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-trigger` | `data-in-path` | ''（条件成立时才出现） |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-value` | itemValue(el) |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-content` | `data-popout` | '' |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-disabled` | ''（条件成立时才出现） |
| `link` | `data-highlighted` | ''（条件成立时才出现） |
| `link` | `data-value` | itemValue(el) |
| `popout-positioner` | `data-hidden` | ''（条件成立时才出现） |
| `popout-positioner` | `data-placement` | placed?.placement |
| `popout-positioner` | `data-positioned` | ''（条件成立时才出现） |
| `popout-positioner` | `data-size` | props.size |
| `popout-positioner` | `data-state` | 'open' \| 'closed' |
| `popout-positioner` | `data-tone` | props.tone |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-side-nav-collapsed-w` · `--xh-side-nav-fg` · `--xh-side-nav-gap` · `--xh-side-nav-group-label-px` · `--xh-side-nav-group-label-py` · `--xh-side-nav-icon-size` · `--xh-side-nav-indent` · `--xh-side-nav-link-gap` · `--xh-side-nav-link-h` · `--xh-side-nav-link-px` · `--xh-side-nav-link-radius` · `--xh-side-nav-p` · `--xh-side-nav-popout-bg` · `--xh-side-nav-popout-border` · `--xh-side-nav-popout-layer` · `--xh-side-nav-popout-max-h` · `--xh-side-nav-popout-max-w` · `--xh-side-nav-popout-min-w` · `--xh-side-nav-popout-p` · `--xh-side-nav-popout-radius` · `--xh-side-nav-popout-shadow` · `--xh-side-nav-row-bg-active` · `--xh-side-nav-row-bg-hover` · `--xh-side-nav-row-fg-active` · `--xh-side-nav-row-fg-in-path` · `--xh-side-nav-row-font-weight-active` · `--xh-side-nav-w`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[布局](./layout)的 `sider`，折叠开关接布局的折叠态。

## 最佳实践

- 层级压到两级，第三级开始用户就记不住路径了。
- 折叠态一定要留 `collapsedPopout`，否则图标栏进不去子级。

## 反模式

- 把每个叶子都做成分支（点开只有一项）。
- 折叠时把整棵树卸载：展开状态与滚动位置全丢。
