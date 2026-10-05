来源：https://ui.docs.xihanfun.com/components/side-nav

# SideNav 侧栏导航

用于组织应用的主要导航入口。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/side-nav" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/side-nav.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/side-nav" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/side-nav" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/side-nav.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

组织应用的主要导航入口

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import { HomeIcon, ShoppingCartIcon, UsersIcon } from "@xihan-ui/icons";
import {
  XhIcon,
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
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#/order/list" },
      { value: "order-refund", label: "退款处理", href: "#/order/refund" },
    ],
  },
];
</script>

<template>
  <XhSideNavRoot
    :collection="collection"
    default-value="user-list"
    :default-expanded-value="['user']"
  >
    <XhSideNavList>
      <XhSideNavItem>
        <XhSideNavLink value="dashboard">
          <XhIcon :icon="HomeIcon" aria-hidden="true" />
          <XhSideNavLinkText>工作台</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
      <XhSideNavBranch v-for="branch in collection.filter((n) => n.children)" :key="branch.value" :value="branch.value">
        <XhSideNavBranchTrigger>
          <XhIcon :icon="branch.value === 'user' ? UsersIcon : ShoppingCartIcon" aria-hidden="true" />
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
</template>
```

```html
<xh-side-nav id="side-nav-basic" default-value="user-list">
  <nav data-xh-part="root">
    <ul data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" value="dashboard">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5L12 3.5L20.5 10.5V20.5H3.5Z"/><path d="M9.5 20.5V14h5v6.5"/></svg>
          <span data-xh-part="link-text">工作台</span>
        </a>
      </li>
      <li data-xh-part="branch" value="user">
        <button data-xh-part="branch-trigger">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 3 18.5V20"/><path d="M16 4.62a3.5 3.5 0 0 1 0 6.76"/><path d="M21 20v-1.5a3.5 3.5 0 0 0-2.63-3.39"/></svg>
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
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2L8 14h10.5"/><path d="M6.18 7.5H21L18.5 14"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>
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

<script type="module">
  const nav = document.getElementById("side-nav-basic");

  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#/dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#/user/list" },
        { value: "user-role", label: "角色权限", href: "#/user/role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order-list", label: "订单列表", href: "#/order/list" },
        { value: "order-refund", label: "退款处理", href: "#/order/refund" },
      ],
    },
  ];

  nav.expandedValue = ["user"];
  nav.addEventListener("expanded-value-change", (event) => {
    nav.expandedValue = event.detail.value;
  });

</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="side-nav"`：**`root`** · `input` · **`list`** · **`item`** · `group` · `group-label` · `group-list` · `branch` · `branch-trigger` · `branch-text` · `branch-indicator` · `positioner` · `branch-content` · **`link`** · `link-text` · `empty`

## 示例

### 折叠模式

以图标保留入口，子级在浮层中展开

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import { SettingsIcon, ShoppingCartIcon, UsersIcon } from "@xihan-ui/icons";
import {
  XhIcon,
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
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [{ value: "order-list", label: "订单列表", href: "#/order/list" }],
  },
  {
    value: "system",
    label: "系统设置",
    children: [{ value: "system-log", label: "操作日志", href: "#/system/log" }],
  },
];

const icons = {
  user: UsersIcon,
  order: ShoppingCartIcon,
  system: SettingsIcon,
};
</script>

<template>
  <XhSideNavRoot :collection="collection" collapsed accordion>
    <XhSideNavList>
      <XhSideNavBranch v-for="branch in collection" :key="branch.value" :value="branch.value">
        <XhSideNavBranchTrigger>
          <XhIcon :icon="icons[branch.value]" aria-hidden="true" />
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
</template>
```

```html
<xh-side-nav id="side-nav-accordion" collapsed accordion>
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 3 18.5V20"/><path d="M16 4.62a3.5 3.5 0 0 1 0 6.76"/><path d="M21 20v-1.5a3.5 3.5 0 0 0-2.63-3.39"/></svg>
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
            <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2L8 14h10.5"/><path d="M6.18 7.5H21L18.5 14"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>
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
            <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.57 13.76L21.66 14.59L19.07 19.07L16.81 16.81L13.76 18.57L14.59 21.66L9.41 21.66L10.24 18.57L7.19 16.81L4.93 19.07L2.34 14.59L5.43 13.76L5.43 10.24L2.34 9.41L4.93 4.93L7.19 7.19L10.24 5.43L9.41 2.34L14.59 2.34L13.76 5.43L16.81 7.19L19.07 4.93L21.66 9.41L18.57 10.24Z"/><circle cx="12" cy="12" r="3"/></svg>
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

<script type="module">
  const nav = document.getElementById("side-nav-accordion");

  nav.collection = [
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#/user/list" },
        { value: "user-role", label: "角色权限", href: "#/user/role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [{ value: "order-list", label: "订单列表", href: "#/order/list" }],
    },
    {
      value: "system",
      label: "系统设置",
      children: [{ value: "system-log", label: "操作日志", href: "#/system/log" }],
    },
  ];

</script>
```

### 尺寸

适配不同密度的应用侧栏

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
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
];

const rows = [
  { size: "sm", label: "小" },
  { size: undefined, label: "中" },
  { size: "lg", label: "大" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
    <div v-for="row in rows" :key="row.label" style="display: grid; gap: 6px">
      <span style="color: var(--xh-fg-muted)">{{ row.label }}</span>
      <XhSideNavRoot
        :collection="collection"
        :size="row.size"
        default-value="user-list"
        :default-expanded-value="['user']"
      >
        <XhSideNavList>
          <XhSideNavItem>
            <XhSideNavLink value="dashboard">
              <XhSideNavLinkText>工作台</XhSideNavLinkText>
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
  </div>
</template>
```

```html
<div id="side-nav-sizes" style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
  <div style="display: grid; gap: 6px">
    <span style="color: var(--xh-fg-muted)">小</span>
    <xh-side-nav class="side-nav-size" size="sm" default-value="user-list">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" value="dashboard"><span data-xh-part="link-text">工作台</span></a></li>
          <li data-xh-part="branch" value="user">
            <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">用户管理</span><span data-xh-part="branch-indicator"></span></button>
            <ul data-xh-part="branch-content">
              <li data-xh-part="item"><a data-xh-part="link" value="user-list"><span data-xh-part="link-text">用户列表</span></a></li>
              <li data-xh-part="item"><a data-xh-part="link" value="user-role"><span data-xh-part="link-text">角色权限</span></a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </xh-side-nav>
  </div>

  <div style="display: grid; gap: 6px">
    <span style="color: var(--xh-fg-muted)">中</span>
    <xh-side-nav class="side-nav-size" default-value="user-list">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" value="dashboard"><span data-xh-part="link-text">工作台</span></a></li>
          <li data-xh-part="branch" value="user">
            <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">用户管理</span><span data-xh-part="branch-indicator"></span></button>
            <ul data-xh-part="branch-content">
              <li data-xh-part="item"><a data-xh-part="link" value="user-list"><span data-xh-part="link-text">用户列表</span></a></li>
              <li data-xh-part="item"><a data-xh-part="link" value="user-role"><span data-xh-part="link-text">角色权限</span></a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </xh-side-nav>
  </div>

  <div style="display: grid; gap: 6px">
    <span style="color: var(--xh-fg-muted)">大</span>
    <xh-side-nav class="side-nav-size" size="lg" default-value="user-list">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" value="dashboard"><span data-xh-part="link-text">工作台</span></a></li>
          <li data-xh-part="branch" value="user">
            <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">用户管理</span><span data-xh-part="branch-indicator"></span></button>
            <ul data-xh-part="branch-content">
              <li data-xh-part="item"><a data-xh-part="link" value="user-list"><span data-xh-part="link-text">用户列表</span></a></li>
              <li data-xh-part="item"><a data-xh-part="link" value="user-role"><span data-xh-part="link-text">角色权限</span></a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </xh-side-nav>
  </div>
</div>

<script type="module">
  const collection = [
    { value: "dashboard", label: "工作台", href: "#/dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#/user/list" },
        { value: "user-role", label: "角色权限", href: "#/user/role" },
      ],
    },
  ];

  for (const nav of document.querySelectorAll(".side-nav-size")) {
    nav.collection = collection;
    nav.expandedValue = ["user"];
    nav.addEventListener("expanded-value-change", (event) => {
      nav.expandedValue = event.detail.value;
    });
  }
</script>
```

### 禁用项

保留不可用入口的位置与说明

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
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#/order/list" },
      // 没开这项权限：方向键跳过它，点也不落值
      { value: "order-refund", label: "退款处理", disabled: true },
    ],
  },
  {
    value: "system",
    label: "系统设置",
    children: [{ value: "system-log", label: "操作日志", href: "#/system/log" }],
  },
];

const branches = collection.filter(node => node.children);
</script>

<template>
  <XhSideNavRoot
    :collection="collection"
    default-value="user-list"
    :default-expanded-value="['user', 'order']"
    loop
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
</template>
```

```html
<xh-side-nav id="side-nav-controlled" default-value="user-list" loop>
    <nav data-xh-part="root">
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

<script type="module">
  const nav = document.getElementById("side-nav-controlled");

  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#/dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#/user/list" },
        { value: "user-role", label: "角色权限", href: "#/user/role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order-list", label: "订单列表", href: "#/order/list" },
        { value: "order-refund", label: "退款处理", disabled: true },
      ],
    },
    {
      value: "system",
      label: "系统设置",
      children: [{ value: "system-log", label: "操作日志", href: "#/system/log" }],
    },
  ];

  nav.expandedValue = ["user", "order"];
  nav.addEventListener("expanded-value-change", (event) => {
    nav.expandedValue = event.detail.value;
  });
</script>
```

### 搜索过滤

输入即按标签过滤导航树，命中入口的祖先自动展开，其余收起；Escape 清空检索词

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavEmpty,
  XhSideNavInput,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from "@xihan-ui/vue";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order-list", label: "订单列表", href: "#/order/list" },
      { value: "order-refund", label: "退款处理", href: "#/order/refund" },
    ],
  },
];
</script>

<template>
  <XhSideNavRoot
    :collection="collection"
    :translations="{ input: '搜索导航', noMatch: '没有匹配的入口' }"
  >
    <XhSideNavInput placeholder="搜索导航" />
    <XhSideNavList>
      <XhSideNavItem>
        <XhSideNavLink value="dashboard">
          <XhSideNavLinkText>工作台</XhSideNavLinkText>
        </XhSideNavLink>
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
    <XhSideNavEmpty />
  </XhSideNavRoot>
</template>
```

```html
<xh-side-nav id="side-nav-search">
  <nav data-xh-part="root">
    <input data-xh-part="input" placeholder="搜索导航" />
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
    <div data-xh-part="empty"></div>
  </nav>
</xh-side-nav>

<script type="module">
  const nav = document.getElementById("side-nav-search");

  nav.translations = { input: "搜索导航", noMatch: "没有匹配的入口" };
  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#/dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#/user/list" },
        { value: "user-role", label: "角色权限", href: "#/user/role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order-list", label: "订单列表", href: "#/order/list" },
        { value: "order-refund", label: "退款处理", href: "#/order/refund" },
      ],
    },
  ];
</script>
```

### 图标栏名称提示

折叠成图标栏后，悬停或聚焦只剩图标的入口时在旁侧显示它的名称

```vue
<script setup lang="ts">
import type { SideNavNode } from "@xihan-ui/headless";
import { HomeIcon, SettingsIcon, ShoppingCartIcon, UsersIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhSideNavTooltip,
} from "@xihan-ui/vue";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#/dashboard" },
  { value: "user", label: "用户管理", href: "#/user" },
  { value: "order", label: "订单管理", href: "#/order" },
  { value: "system", label: "系统设置", href: "#/system" },
];

const icons = {
  dashboard: HomeIcon,
  user: UsersIcon,
  order: ShoppingCartIcon,
  system: SettingsIcon,
};
</script>

<template>
  <XhSideNavRoot :collection="collection" collapsed default-value="dashboard">
    <XhSideNavList>
      <XhSideNavItem v-for="node in collection" :key="node.value">
        <XhSideNavLink :value="node.value">
          <XhIcon :icon="icons[node.value]" aria-hidden="true" />
          <XhSideNavLinkText>{{ node.label }}</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
    </XhSideNavList>
    <XhSideNavTooltip />
  </XhSideNavRoot>
</template>
```

```html
<xh-side-nav id="side-nav-collapsed-tooltip" collapsed default-value="dashboard">
  <nav data-xh-part="root">
    <ul data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" value="dashboard">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5L12 3.5L20.5 10.5V20.5H3.5Z"/><path d="M9.5 20.5V14h5v6.5"/></svg>
          <span data-xh-part="link-text">工作台</span>
        </a>
      </li>
      <li data-xh-part="item">
        <a data-xh-part="link" value="user">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 3 18.5V20"/><path d="M16 4.62a3.5 3.5 0 0 1 0 6.76"/><path d="M21 20v-1.5a3.5 3.5 0 0 0-2.63-3.39"/></svg>
          <span data-xh-part="link-text">用户管理</span>
        </a>
      </li>
      <li data-xh-part="item">
        <a data-xh-part="link" value="order">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2L8 14h10.5"/><path d="M6.18 7.5H21L18.5 14"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>
          <span data-xh-part="link-text">订单管理</span>
        </a>
      </li>
      <li data-xh-part="item">
        <a data-xh-part="link" value="system">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.57 13.76L21.66 14.59L19.07 19.07L16.81 16.81L13.76 18.57L14.59 21.66L9.41 21.66L10.24 18.57L7.19 16.81L4.93 19.07L2.34 14.59L5.43 13.76L5.43 10.24L2.34 9.41L4.93 4.93L7.19 7.19L10.24 5.43L9.41 2.34L14.59 2.34L13.76 5.43L16.81 7.19L19.07 4.93L21.66 9.41L18.57 10.24Z"/><circle cx="12" cy="12" r="3"/></svg>
          <span data-xh-part="link-text">系统设置</span>
        </a>
      </li>
    </ul>
    <div data-xh-part="tooltip-positioner">
      <div data-xh-part="tooltip"></div>
    </div>
  </nav>
</xh-side-nav>

<script type="module">
  const nav = document.getElementById("side-nav-collapsed-tooltip");

  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#/dashboard" },
    { value: "user", label: "用户管理", href: "#/user" },
    { value: "order", label: "订单管理", href: "#/order" },
    { value: "system", label: "系统设置", href: "#/system" },
  ];
</script>
```

## 设计指引

### 何时使用

- 管理后台或控制台的主导航。
- 导航包含分组或可展开的子级。

### 何时不用

- 顶部横向导航，使用[导航菜单](./navigation-menu)。
- 文件或组织结构，使用[树](./tree)。

### 特性

- 支持分组、嵌套分支与当前项高亮：当前项铺品牌淡底行面、字取淡底前景，不另画指示条；通往当前项的展开分支只落与悬停同档的中性面。
- `accordion` 限制同一层级只展开一个分支。
- 入口可逐条声明语气，不向下传导；当前项的品牌淡底压过它。
- 折叠后保留图标入口，子级在浮层中展示。
- 放一个 `tooltip` 部件，折叠成图标栏后只剩图标的入口（顶层叶子；`collapsedPopout` 关掉时也含顶层分支）悬停或聚焦时在行尾一侧显示名称。它就是库内的 [文字提示](./tooltip)：悬停延时、接替窗口、提示组与反白外观都与 Tooltip 一致，放在 `XhTooltipProvider` 里同样归那一组；弹出分支的面板自己就是去处，不再叠一层提示。
- 方向键上下移动，左右键展开或收起分支。
- 放一个 `input` 即可按标签过滤导航树：命中入口的祖先保留并展开，没命中的整行、整枝收起，分组的成员一个都没命中就整组收起；`filter` 可换成自定义匹配。
- 命中的入口整枝留下：分支本身命中时，它的子项照常在里面，不因命中而自动展开。
- 搜索里的展开收起只记在搜索视图里，不改写 `expandedValue`、也不发 `expanded-value-change`；清空检索词即回到整棵树与原来的展开态。
- 一条都没命中时 `empty` 露面；没写内容时显示 `translations.noMatch`。
- 折叠成图标栏时过滤暂停，搜索框留着高度但不可见、不可聚焦，展开回来接着按原词过滤。

### 组合

- 放入[布局](./layout)的侧栏区域。
- 分组：`group` 放在 `list` 里当一条，里面先放 `group-label`，再放 `group-list`，组内的 `item` 与 `branch` 挂在 `group-list` 里。
- Vue / React 的 `XhSideNavGroupList` 从所在的 `XhSideNavGroup` 取分组身份，不用再写 `value`；Web Components 的 `group-label` 与 `group-list` 都认所在的 `group`。

```vue
<XhSideNavList>
  <XhSideNavGroup value="main">
    <XhSideNavGroupLabel value="main">常用</XhSideNavGroupLabel>
    <XhSideNavGroupList>
      <XhSideNavItem>
        <XhSideNavLink value="home">
          <XhSideNavLinkText>工作台</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
    </XhSideNavGroupList>
  </XhSideNavGroup>
</XhSideNavList>
```

```tsx
<XhSideNavList>
  <XhSideNavGroup value="main">
    <XhSideNavGroupLabel value="main">常用</XhSideNavGroupLabel>
    <XhSideNavGroupList>
      <XhSideNavItem>
        <XhSideNavLink value="home">
          <XhSideNavLinkText>工作台</XhSideNavLinkText>
        </XhSideNavLink>
      </XhSideNavItem>
    </XhSideNavGroupList>
  </XhSideNavGroup>
</XhSideNavList>;
```

```html
<ul data-xh-part="list">
  <li data-xh-part="group" value="main">
    <div data-xh-part="group-label">常用</div>
    <ul data-xh-part="group-list">
      <li data-xh-part="item">
        <a data-xh-part="link" value="home"><span data-xh-part="link-text">工作台</span></a>
      </li>
    </ul>
  </li>
</ul>
```

### 接路由

- Vue / React 的 `link` 缺省渲染 `<a>`，`href` 由作者写或取自 `collection`。接客户端路由时给 `XhSideNavLink` 加 `asChild`，把路由链接放进去当唯一的子节点：部件属性、按压与聚焦接线合到它渲出的元素上，跳转交给路由；子节点不是恰好一个元素时直接报错。
- 当前项跟着路由走：把当前路径换算成 `value` 受控传入。点选只发 `value-change`，真正的当前项仍以路由为准。
- Web Components 不需要 asChild：`link` 本来就是作者写的节点，元素只往它身上写属性与监听、不替换它。路由库自己的链接元素，或自行拦截点击的 `<a>`，直接标 `data-xh-part="link"` 即可。

```vue
<XhSideNavLink value="orders" as-child>
  <RouterLink to="/orders">
    <XhSideNavLinkText>订单</XhSideNavLinkText>
  </RouterLink>
</XhSideNavLink>
```

```tsx
<XhSideNavLink value="orders" asChild>
  <Link to="/orders">
    <XhSideNavLinkText>订单</XhSideNavLinkText>
  </Link>
</XhSideNavLink>;
```

### 最佳实践

- 导航层级保持在两到三级。
- 折叠模式下为每个入口保留清晰图标。

### 反模式

- 不要为单个入口创建分支。
- 不要在折叠时卸载导航树。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-side-nav>` |
| Vue 组件 | `XhSideNavBranch` `XhSideNavBranchContent` `XhSideNavBranchIndicator` `XhSideNavBranchText` `XhSideNavBranchTrigger` `XhSideNavEmpty` `XhSideNavGroup` `XhSideNavGroupLabel` `XhSideNavGroupList` `XhSideNavInput` `XhSideNavItem` `XhSideNavLink` `XhSideNavLinkText` `XhSideNavList` `XhSideNavRoot` `XhSideNavTooltip` |
| 组合式函数 | `useSideNav` |
| 状态机 | `sideNavMachine` |
| 皮肤 | `@xihan-ui/styles/side-nav.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SideNavNode[]` |  | 入口树，层级与文本的唯一事实源。默认为空。 |
| `value` | `string \| null` |  | 选中的叶子（单选）。提供即受控：cell 直读 prop，写入只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。提供即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `accordion` | `boolean` |  | 同层手风琴：展开一枝时收起同层其余分支，默认 false（可多开）。 |
| `collapsed` | `boolean` |  | 折叠为图标栏：内嵌展开整体收起、文字由皮肤隐藏，只剩图标一列。 顶层分支改为浮层弹出：悬停 / 点击 / 右方向键在旁侧弹出子级面板。 |
| `collapsedPopout` | `boolean` |  | 折叠态下顶层分支是否弹出子级面板，默认 true；关闭即回到纯图标栏。 |
| `disabled` | `boolean` |  | 整个侧栏禁用。 |
| `loop` | `boolean` |  | 上下键到达首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的展开 / 收起语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `filter` | `SideNavFilter` |  | 搜索框的匹配规则：检索词按它判定一条入口是否命中；缺省为标签（缺省退回 value）大小写不敏感包含。 命中的入口整枝留下，没命中但有子孙命中的分支只留命中的那几枝并展开，其余收起。 |
| `translations` | `Partial<SideNavTranslations>` |  |  |
| `onValueChange` | `(details: SideNavValueChangeDetails) => void` |  | 选中意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onExpandedValueChange` | `(details: SideNavExpandedValueChangeDetails) => void` |  | 展开集合变化意图回调；语义同上。 |

### SideNavNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 入口文本；默认回退为 value，也是连打检索的取字来源。 |
| `disabled` | `boolean` |  | 入口禁用：方向键跳过它，但它仍可聚焦。不向下传导给子级。 |
| `tone` | `Tone` |  | 该入口自身的性质：危险区域写 danger、需要留意的写 warning。不写即与其余入口同档， 也不向下传导给子级——每一层各自声明。只换字色与悬停 / 按下的面，不表达当前页； 当前项的品牌淡底与禁用都压过它。彩字不是唯一通道，要紧的差别仍要配图标。 |
| `href` | `string` |  | 直达目标；只对叶子有意义。 |
| `children` | `SideNavNode[]` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SideNavValueChangeDetails` | 选中变化；detail 为 `{ value: string \| null }` |
| `expanded-value-change` | `SideNavExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSideNavRoot` | `default` | `SideNavRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSideNavBranch` | `value` | `string` | 是 |  |
| `XhSideNavBranchContent` | `container` | `() => Element \| null` |  | 本分支弹层的 Portal 容器；优先于应用级配置。 |
| `XhSideNavGroup` | `value` | `string` | 是 | 分组身份，group-label 与 group-list 依靠它配对。 |
| `XhSideNavGroupLabel` | `value` | `string` | 是 |  |
| `XhSideNavLink` | `value` | `string` | 是 |  |
| `XhSideNavRoot` | `children` | `SlotChildren<SideNavRootSlotProps>` |  |  |
| `XhSideNavTooltip` | `container` | `() => Element \| null` |  | 名称提示的 Portal 容器；优先于应用级配置。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `popout-positioner` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `popout`

**事件**：`VALUE.SET` · `LINK.SELECT` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `FOCUS.CLEAR` · `POPOUT.OPEN` · `POPOUT.CLOSE` · `POPOUT.HOVER` · `POPOUT.HOVER_END` · `PRESENCE.SET` · `PRESS.START` · `PRESS.END` · `COLLAPSE.SETTLED` · `INPUT.CHANGE` · `TOOLTIP.TARGET` · `TOOLTIP.OPEN_CHANGE`

**判据**：`canChange` · `canPopout` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 选中的叶子；尚未选中时为 null。 |
| `expandedValue` | `string[]` |  |
| `collapsed` | `boolean` | 折叠为图标栏；顶层分支改为浮层弹出子级面板。 |
| `popoutValue` | `string \| null` | 折叠态下正在弹出子级面板的顶层分支；未弹出时为 null。 |
| `openPopout` | `(value: string) => void` | 弹出某顶层分支的子级面板（仅折叠态有效）。 |
| `closePopout` | `() => void` |  |
| `focusedValue` | `string \| null` | roving tabindex 的锚点；无可见锚点时为 null。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `isActiveBranch` | `(value: string) => boolean` | 选中项的祖先分支：展开高亮当前所在的分支。 |
| `select` | `(value: string) => void` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `inputValue` | `string` | 搜索框里的检索词。 |
| `setInputValue` | `(next: string) => void` | 改写检索词，与在搜索框里输入同一语义；传空串即回到整棵树与原来的展开态。 |
| `searching` | `boolean` | 正处于搜索视图：检索词非空且排布没有落成图标栏，可见行只剩命中的那几枝。 |
| `empty` | `boolean` | 搜索视图里一条都没命中。 |
| `translations` | `SideNavTranslations` | 合并缺省值之后的读屏文案。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` | 搜索框：放在 root 里、list 之前。输入即按 filter 过滤导航树；下方向键或 Enter 把焦点交给导航行， Escape 先清空检索词。落成图标栏时过滤暂停（皮肤让框留着高度、不可见也不可聚焦），展开回来接着按原来的检索词过滤。 |
| `getEmptyProps` | `() => T['element']` | 搜索一条都没命中时露面的占位，放在 list 之后；其余时候带 hidden。 |
| `getItemProps` | `(props?: SideNavItemProps) => T['element']` | 叶子行的列表项容器：链接与分支一样是列表的一条，作者把 link 包在其中。 |
| `getGroupProps` | `(props: SideNavGroupProps) => T['element']` | 分组：上一层列表里的一条（li），装着 group-label 与 group-list；搜索时一个成员都没命中就整组收起。 |
| `getGroupLabelProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getGroupListProps` | `(props: SideNavNodeProps) => T['element']` | 分组里的列表（ul）：组内的 item 与 branch 挂在这里，以 group-label 命名。 |
| `getBranchProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: SideNavNodeProps) => T['button']` |  |
| `getBranchTextProps` | `() => T['element']` | 行文字的载体：折叠为图标栏时由皮肤整体隐藏，不会裁出半个字。 |
| `getBranchIndicatorProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `isPopoutPanel` | `(value: string) => boolean` | 该分支在折叠态下是否以浮层面板出现；决定作者是否需要渲染定位层。 |
| `getPopoutPositionerProps` | `(props: SideNavNodeProps) => T['element']` | 弹出面板的定位层。使用引擎坐标、承载层号，作者须把它移到浮层落点， 避免祖先的层叠上下文困住面板。非弹出分支不渲染这一层。 |
| `getBranchContentProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkProps` | `(props: SideNavNodeProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` | 链接文字的载体：折叠时由皮肤整体隐藏。 |
| `tooltipText` | `string` | 名称提示的文字：对着的那一行在 collection 里的标签（缺省退回 value）；还没对着任何一行时为空串。 |
| `getTooltipPositionerProps` | `() => T['element']` | 名称提示的定位层：即库内 tooltip 的 positioner（data-scope="tooltip"），坐标、落点与层号由内嵌的提示机给， 作者把它搬到浮层落点。只在 connect 拿到内嵌提示机时可用，否则直接报错。 |
| `getTooltipContentProps` | `() => T['element']` | 名称提示本体：即库内 tooltip 的 content，反白面、进退场与接替窗口都随 Tooltip； 对读屏隐藏（行文字已是可及名，不再念第二遍）。只在 connect 拿到内嵌提示机时可用，否则直接报错。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held on link / branch-trigger, 侧栏未禁用且入口未禁用 | 按住期间链接行或分支行投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，弹出面板随选中收起时一并撤下。导航当前（aria-current）与按压互相独立，激活与展开语义照旧由这一次按键承担 |
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
| `可打印字符` | focus in input | 改写检索词：导航树裁到只剩命中的那几枝，命中入口的祖先自动展开、其余收起；搜索里的展开收起只记在搜索视图里，不改写 expandedValue |
| `ArrowDown` / `Enter` | focus in input | 焦点交给导航行：搜索中落在剩下的第一行，不在搜索中落在 Tab 锚点 |
| `Tab` / `ArrowDown` / `ArrowUp` / `Home` / `End` | collapsed 落成图标栏、放了 tooltip 部件，焦点落到只剩图标的行（顶层叶子；collapsedPopout 关掉时也含顶层分支） | 立即显示该行的名称提示，不走悬停延时；焦点离开即收。提示对读屏隐藏，可及名仍由行文字承担 |
| `Escape` | 名称提示显示中 | 收起名称提示，焦点留在行上（Escape 归消解层按层栈仲裁） |
| `Escape` | focus in input, 检索词非空 | 清空检索词，回到整棵树与原来的展开态，焦点留在搜索框；检索词已空时不拦截这一下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations.root |
| `root` | `role` | 'navigation' |
| `input` | `aria-controls` | scope.partId('side-nav', 'list') |
| `input` | `aria-label` | translations.input |
| `group-list` | `aria-labelledby` | `group-label` 部件的 id |
| `branch-trigger` | `aria-controls` | `content` 部件的 id |
| `branch-trigger` | `aria-disabled` | 'true' \| 'false' |
| `branch-trigger` | `aria-expanded` | 'true' \| 'false' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `aria-hidden` | !open \|\| undefined |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| undefined |
| `empty` | `role` | 'status' |
| `popout-positioner` | `aria-hidden` | !open \|\| undefined |
| `tooltip-content` | `aria-hidden` | 'true' |
| `tooltip-content` | `role` | undefined |

- `list`、`group-list` 与 `branch-content` 都是列表（`ul`），直接子节点只放列表项：`item` 与 `branch`，`list` 里还可以放 `group`。
- 分组 `group` 是上一层列表里的一条，本身不带角色；组内的行挂在 `group-list` 里，`group-list` 以 `aria-labelledby` 指向 `group-label`，读屏念作「标题 + 列表」。不写 `role="group"`：列表项的父节点必须是列表。
- 将文字放入 `branch-text` 或 `link-text`，确保折叠后仍有可访问名称。
- 装饰图标使用 `aria-hidden="true"`。
- 搜索框没有可见标签，可及名取 `translations.input`；聚焦不画环，插入符就是焦点指示，与级联选择、命令面板的搜索框同一种写法；空态以 `role="status"` 露面即播报。
- 图标栏的名称提示对读屏隐藏，行上也不挂 `aria-describedby`：行文字已是可及名，提示只给看得见的人补上被裁掉的那段字。Escape 收起提示，焦点留在行上。

## 样式参考

### 皮肤

`@xihan-ui/styles/side-nav.css` 按 `[data-scope="side-nav"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-side-nav` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-animating` | ''（条件成立时才出现） |
| `root` | `data-collapsed` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `input` | `data-collapsed` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-xh-field-input` | '' |
| `list` | `data-collapsed` | ''（条件成立时才出现） |
| `group-label` | `data-collapsed` | ''（条件成立时才出现） |
| `branch` | `data-disabled` | ''（条件成立时才出现） |
| `branch` | `data-in-path` | ''（条件成立时才出现） |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `branch-trigger` | `data-highlighted` | ''（条件成立时才出现） |
| `branch-trigger` | `data-in-path` | ''（条件成立时才出现） |
| `branch-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-tone` | metaOf(v)?.tone |
| `branch-trigger` | `data-value` | itemValue(el) |
| `branch-trigger` | `data-xh-collection-context` | 'page' |
| `branch-trigger` | `data-xh-collection-item` | '' |
| `branch-trigger` | `data-xh-collection-size` | props.size |
| `branch-text` | `data-xh-collection-slot` | 'text' |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-indicator` | `data-xh-collection-slot` | 'suffix' |
| `branch-content` | `data-popout` | '' |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-disabled` | ''（条件成立时才出现） |
| `link` | `data-highlighted` | ''（条件成立时才出现） |
| `link` | `data-pressed` | ''（条件成立时才出现） |
| `link` | `data-tone` | metaOf(v)?.tone |
| `link` | `data-value` | itemValue(el) |
| `link` | `data-xh-collection-context` | 'page' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link-text` | `data-xh-collection-slot` | 'text' |
| `popout-positioner` | `data-hidden` | ''（条件成立时才出现） |
| `popout-positioner` | `data-placement` | placed?.placement |
| `popout-positioner` | `data-positioned` | ''（条件成立时才出现） |
| `popout-positioner` | `data-size` | props.size |
| `popout-positioner` | `data-state` | 'open' \| 'closed' |
| `popout-positioner` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-side-nav-branch-indicator-size` | `branch-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | side-nav 的 branch-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-side-nav-collapsed-w` | `root` | `inline-size` | `collapsed` | `--xh-sider-collapsed-w` | side-nav 的 root 部件 inline-size 覆盖槽。 |
| `--xh-side-nav-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` | side-nav 的 empty 部件 color 覆盖槽。 |
| `--xh-side-nav-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_side-nav-row-font-size` | side-nav 的 empty 部件 font-size 覆盖槽。 |
| `--xh-side-nav-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_side-nav-row-px` | side-nav 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-side-nav-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | side-nav 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-side-nav-fg` | `root` | `color` | `default` | `--xh-fg-default` | side-nav 的 root 部件 color 覆盖槽。 |
| `--xh-side-nav-gap` | `branch`<br>`branch-content`<br>`group`<br>`group-list`<br>`list`<br>`root` | `gap` | `default` | `--xh-space-1` | side-nav 的 branch、branch-content、group、group-list、list、root 部件 gap 覆盖槽。 |
| `--xh-side-nav-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_side-nav-row-px` | side-nav 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-side-nav-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | side-nav 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-side-nav-icon-size` | `branch-trigger`<br>`link`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | side-nav 的 branch-trigger、link、positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-side-nav-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` | side-nav 的 branch-content 部件 padding-inline-start 覆盖槽。 |
| `--xh-side-nav-indicator-color` | `branch-trigger`<br>`link` | `color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-fg-brand` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` | side-nav 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-side-nav-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | side-nav 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-side-nav-input-font-size` | `input` | `font-size` | `default` | `--xh-_side-nav-row-font-size` | side-nav 的 input 部件 font-size 覆盖槽。 |
| `--xh-side-nav-input-h` | `input` | `block-size` | `default` | `--xh-_side-nav-row-h` | side-nav 的 input 部件 block-size 覆盖槽。 |
| `--xh-side-nav-input-px` | `input` | `padding-inline` | `default` | `--xh-_side-nav-row-px` | side-nav 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-side-nav-link-font-size` | `branch-trigger`<br>`link` | `font-size` | `default` | `--xh-_side-nav-row-font-size` | side-nav 的 branch-trigger、link 部件 font-size 覆盖槽。 |
| `--xh-side-nav-link-gap` | `branch-trigger`<br>`link` | `gap` | `default` | `--xh-_side-nav-row-gap` | side-nav 的 branch-trigger、link 部件 gap 覆盖槽。 |
| `--xh-side-nav-link-h` | `branch-trigger`<br>`link` | `min-block-size` | `default` | `--xh-_side-nav-row-h` | side-nav 的 branch-trigger、link 部件 min-block-size 覆盖槽。 |
| `--xh-side-nav-link-px` | `branch-trigger`<br>`link` | `padding-inline` | `default` | `--xh-_side-nav-row-px` | side-nav 的 branch-trigger、link 部件 padding-inline 覆盖槽。 |
| `--xh-side-nav-link-radius` | `branch-trigger`<br>`link` | `border-radius` | `default` | `--xh-shape-control` | side-nav 的 branch-trigger、link 部件 border-radius 覆盖槽。 |
| `--xh-side-nav-p` | `root` | `padding` | `default` | `--xh-space-2` | side-nav 的 root 部件 padding 覆盖槽。 |
| `--xh-side-nav-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | side-nav 的 input 部件 color 覆盖槽。 |
| `--xh-side-nav-popout-bg` | `branch-content` | `background` | `popout` | `--xh-bg-surface` | side-nav 的 branch-content 部件 background 覆盖槽。 |
| `--xh-side-nav-popout-border` | `branch-content` | `border` | `popout` | `--xh-border-default` | side-nav 的 branch-content 部件 border 覆盖槽。 |
| `--xh-side-nav-popout-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | side-nav 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-side-nav-popout-max-h` | `branch-content` | `max-block-size` | `popout` | `--xh-overlay-menu-max-h` | side-nav 的 branch-content 部件 max-block-size 覆盖槽。 |
| `--xh-side-nav-popout-max-w` | `branch-content` | `max-inline-size` | `popout` | `--xh-overlay-max-w` | side-nav 的 branch-content 部件 max-inline-size 覆盖槽。 |
| `--xh-side-nav-popout-min-w` | `branch-content` | `min-inline-size` | `popout` | `--xh-overlay-menu-min-w` | side-nav 的 branch-content 部件 min-inline-size 覆盖槽。 |
| `--xh-side-nav-popout-p` | `branch-content` | `padding` | `popout` | `--xh-space-1` | side-nav 的 branch-content 部件 padding 覆盖槽。 |
| `--xh-side-nav-popout-radius` | `branch-content` | `border-radius` | `popout` | `--xh-shape-overlay` | side-nav 的 branch-content 部件 border-radius 覆盖槽。 |
| `--xh-side-nav-popout-shadow` | `branch-content` | `box-shadow` | `popout` | `--xh-elevation-floating` | side-nav 的 branch-content 部件 box-shadow 覆盖槽。 |
| `--xh-side-nav-row-bg-active` | `branch-trigger`<br>`link` | `background-color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-bg-hover` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-bg-in-path` | `branch-trigger`<br>`link` | `background-color` | `in-path` | `--xh-bg-subtle` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-bg-pressed` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | side-nav 的 branch-trigger、link 部件 background-color 覆盖槽。 |
| `--xh-side-nav-row-fg` | `branch-trigger`<br>`link` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `currentColor` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-row-fg-active` | `branch-trigger`<br>`link` | `color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-row-fg-in-path` | `branch-trigger`<br>`link` | `color` | `in-path` | `--xh-side-nav-row-fg` | side-nav 的 branch-trigger、link 部件 color 覆盖槽。 |
| `--xh-side-nav-row-font-weight-active` | `branch-trigger`<br>`link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page` | `--xh-font-weight-regular` | side-nav 的 branch-trigger、link 部件 font-weight 覆盖槽。 |
| `--xh-side-nav-search-divider` | `input` | `border-block-end` | `default` | `--xh-material-solid-separator` | side-nav 的 input 部件 border-block-end 覆盖槽。 |
| `--xh-side-nav-w` | `root` | `inline-size` | `default` | `--xh-sider-w` | side-nav 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换 · 指示与换位 · 出现（锚定列表）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`color` · `inline-size` · `opacity` · `rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。
