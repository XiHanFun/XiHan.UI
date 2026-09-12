来源：https://ui.docs.xihanfun.com/examples/admin-shell

# 后台壳

一副控制台外壳：头、侧栏、正文、脚四段各就各位，导航、面包屑、页头、工具条、通知角标与账户菜单在同一屏里。

```vue
<script setup lang="ts">
import type { MenuNode, SideNavNode } from "@xihan-ui/headless";
import {
  XhAvatarFallback,
  XhAvatarImage,
  XhAvatarRoot,
  XhBadge,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhButton,
  XhCardBody,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
  XhLayoutContent,
  XhLayoutFooter,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
  XhMenuRoot,
  XhPageHeaderExtra,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
  XhSeparator,
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
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticValue,
  XhTagLabel,
  XhTagRoot,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const nav: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#dashboard" },
  {
    value: "order",
    label: "订单",
    children: [
      { value: "order-list", label: "订单列表", href: "#order-list" },
      { value: "order-refund", label: "退款处理", href: "#order-refund" },
    ],
  },
  {
    value: "user",
    label: "用户",
    children: [
      { value: "user-list", label: "用户列表", href: "#user-list" },
      { value: "user-role", label: "角色权限", href: "#user-role" },
    ],
  },
];

const account: MenuNode[] = [
  { value: "profile", label: "个人资料" },
  { value: "preference", label: "偏好设置" },
  { value: "signout", label: "退出登录", separatorBefore: true },
];

const branches = nav.filter(node => node.children);

const current = ref<string | null>("order-list");
const lastCommand = ref("（无）");
</script>

<template>
  <XhLayoutRoot bordered class="shell">
    <XhLayoutHeader class="shell__header">
      <XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger>
      <strong class="shell__brand">曦寒控制台</strong>

      <div class="shell__header-end">
        <XhTooltipRoot>
          <XhTooltipTrigger>帮助</XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>
              这一屏的每件东西都是库里的组件
              <XhTooltipArrow />
            </XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>

        <XhBadge :count="3" tone="danger" label="3 条未读通知">
          <XhButton variant="outline" size="sm">通知</XhButton>
        </XhBadge>

        <XhSeparator orientation="vertical" />

        <!-- 触发器是作者写的内容，菜单只接管展开与键盘 -->
        <XhMenuRoot :collection="account" @select="lastCommand = `账户 · ${$event.value}`">
          <template #trigger>
            <XhAvatarRoot src="/images/logo.png" alt="曦寒">
              <XhAvatarImage />
              <XhAvatarFallback>曦</XhAvatarFallback>
            </XhAvatarRoot>
          </template>
        </XhMenuRoot>
      </div>
    </XhLayoutHeader>

    <XhLayoutSider class="shell__sider">
      <XhSideNavRoot
        v-model:value="current"
        :collection="nav"
        :default-expanded-value="['order']"
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
    </XhLayoutSider>

    <XhLayoutContent class="shell__content">
      <XhBreadcrumbRoot>
        <XhBreadcrumbList>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#dashboard">工作台</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#order">订单</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#order-list" current>订单列表</XhBreadcrumbLink>
          </XhBreadcrumbItem>
        </XhBreadcrumbList>
      </XhBreadcrumbRoot>

      <XhPageHeaderRoot>
        <XhPageHeaderTitle>订单列表</XhPageHeaderTitle>
        <XhPageHeaderExtra>
          <XhButton variant="ghost" size="sm">导出</XhButton>
          <XhButton variant="solid" size="sm">新建订单</XhButton>
        </XhPageHeaderExtra>
      </XhPageHeaderRoot>

      <XhToolbarRoot>
        <XhToolbarItem value="today" class="shell__tool" @click="lastCommand = '今日'">
          今日
        </XhToolbarItem>
        <XhToolbarItem value="week" class="shell__tool" @click="lastCommand = '本周'">
          本周
        </XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="refresh" class="shell__tool" @click="lastCommand = '刷新'">
          刷新
        </XhToolbarItem>
      </XhToolbarRoot>

      <div class="shell__cards">
        <XhCardRoot variant="outline">
          <XhCardHeader>
            <XhCardTitle>待发货</XhCardTitle>
          </XhCardHeader>
          <XhCardBody>
            <XhStatisticRoot>
              <XhStatisticLabel>较昨日 +12</XhStatisticLabel>
              <XhStatisticValue>128</XhStatisticValue>
            </XhStatisticRoot>
          </XhCardBody>
        </XhCardRoot>

        <XhCardRoot variant="outline">
          <XhCardHeader>
            <XhCardTitle>待退款</XhCardTitle>
          </XhCardHeader>
          <XhCardBody>
            <XhStatisticRoot>
              <XhStatisticLabel>需人工复核</XhStatisticLabel>
              <XhStatisticValue>6</XhStatisticValue>
            </XhStatisticRoot>
          </XhCardBody>
        </XhCardRoot>
      </div>

      <p class="shell__note">当前导航：{{ current ?? "（无）" }} · 最近操作：{{ lastCommand }}</p>
    </XhLayoutContent>

    <XhLayoutFooter class="shell__footer">
      <span>曦寒视图组件</span>
      <XhTagRoot size="sm">
        <XhTagLabel>预览环境</XhTagLabel>
      </XhTagRoot>
    </XhLayoutFooter>
  </XhLayoutRoot>
</template>

<style scoped>
.shell {
  block-size: 460px;
  inline-size: 100%;
  border-radius: var(--xh-radius-lg);
  overflow: hidden;
}

.shell__header,
.shell__footer {
  display: flex;
  align-items: center;
  gap: var(--xh-space-3);
}

.shell__brand {
  font-size: var(--xh-font-size-lg);
  font-weight: var(--xh-font-weight-semibold);
}

/* 头部右半区推到行尾，中间那段留白由它撑开 */
.shell__header-end {
  display: flex;
  align-items: center;
  gap: var(--xh-space-3);
  margin-inline-start: auto;
  block-size: var(--xh-control-h-md);
}

.shell__sider {
  padding: var(--xh-space-2);
}

.shell__content {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-4);
  padding: var(--xh-space-5);
  overflow: auto;
}

.shell__tool {
  padding: var(--xh-space-1) var(--xh-space-2_5);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-radius-md);
  background: var(--xh-bg-surface);
  font-size: var(--xh-font-size-sm);
}

.shell__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--xh-space-4);
}

.shell__note {
  margin: 0;
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
}
</style>
```

```html
<style>
  #admin-shell [data-shell="root"] {
    block-size: 460px;
    inline-size: 100%;
    border-radius: var(--xh-radius-lg);
    overflow: hidden;
  }

  #admin-shell [data-shell="header"],
  #admin-shell [data-shell="footer"] {
    display: flex;
    align-items: center;
    gap: var(--xh-space-3);
  }

  #admin-shell [data-shell="brand"] {
    font-size: var(--xh-font-size-lg);
    font-weight: var(--xh-font-weight-semibold);
  }

  /* 头部右半区推到行尾，中间那段留白由它撑开 */
  #admin-shell [data-shell="header-end"] {
    display: flex;
    align-items: center;
    gap: var(--xh-space-3);
    margin-inline-start: auto;
    block-size: var(--xh-control-h-md);
  }

  /* 账户触发器只摆头像，按钮自己的边框与底色去掉 */
  #admin-shell [data-shell="account"] {
    display: flex;
    padding: 0;
    border: none;
    background: none;
  }

  #admin-shell [data-shell="sider"] {
    padding: var(--xh-space-2);
  }

  #admin-shell [data-shell="content"] {
    display: flex;
    flex-direction: column;
    gap: var(--xh-space-4);
    padding: var(--xh-space-5);
    overflow: auto;
  }

  #admin-shell [data-shell="tool"] {
    padding: var(--xh-space-1) var(--xh-space-2_5);
    border: var(--xh-stroke-thin) solid var(--xh-border-default);
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-surface);
    font-size: var(--xh-font-size-sm);
  }

  #admin-shell [data-shell="cards"] {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--xh-space-4);
  }

  #admin-shell [data-shell="note"] {
    margin: 0;
    color: var(--xh-fg-muted);
    font-size: var(--xh-font-size-sm);
  }
</style>

<xh-layout id="admin-shell" bordered>
  <div data-xh-part="root" data-shell="root">
    <div data-xh-part="header" data-shell="header">
      <button data-xh-part="sider-trigger">菜单</button>
      <strong data-shell="brand">曦寒控制台</strong>

      <div data-shell="header-end">
        <xh-tooltip>
          <button data-xh-part="trigger">帮助</button>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              这一屏的每件东西都是库里的组件
              <div data-xh-part="arrow"></div>
            </div>
          </div>
        </xh-tooltip>

        <xh-badge count="3" tone="danger" label="3 条未读通知">
          <span data-xh-part="root">
            <xh-button variant="outline" size="sm">
              <button data-xh-part="root">通知</button>
            </xh-button>
            <span data-xh-part="indicator"></span>
          </span>
        </xh-badge>

        <xh-separator orientation="vertical" style="display: contents">
          <div data-xh-part="root"></div>
        </xh-separator>

        <!-- 触发器是作者写的内容，菜单只接管展开与键盘 -->
        <xh-menu id="admin-shell-account">
          <button data-xh-part="trigger" data-shell="account">
            <xh-avatar src="/images/logo.png" alt="曦寒">
              <span data-xh-part="root">
                <img data-xh-part="image" />
                <span data-xh-part="fallback">曦</span>
              </span>
            </xh-avatar>
          </button>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="item" value="profile">个人资料</div>
              <div data-xh-part="item" value="preference">偏好设置</div>
              <div data-xh-part="separator"></div>
              <div data-xh-part="item" value="signout">退出登录</div>
            </div>
          </div>
        </xh-menu>
      </div>
    </div>

    <div data-xh-part="sider" data-shell="sider">
      <xh-side-nav id="admin-shell-nav" default-value="order-list">
        <nav data-xh-part="root">
          <ul data-xh-part="list">
            <li data-xh-part="item">
              <a data-xh-part="link" value="dashboard">
                <span data-xh-part="link-text">工作台</span>
              </a>
            </li>
            <li data-xh-part="branch" value="order">
              <button data-xh-part="branch-trigger">
                <span data-xh-part="branch-text">订单</span>
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
            <li data-xh-part="branch" value="user">
              <button data-xh-part="branch-trigger">
                <span data-xh-part="branch-text">用户</span>
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

    <div data-xh-part="content" data-shell="content">
      <xh-breadcrumb>
        <nav data-xh-part="root">
          <ol data-xh-part="list">
            <li data-xh-part="item">
              <a data-xh-part="link" href="#dashboard">工作台</a>
            </li>
            <li data-xh-part="separator">/</li>
            <li data-xh-part="item">
              <a data-xh-part="link" href="#order">订单</a>
            </li>
            <li data-xh-part="separator">/</li>
            <li data-xh-part="item">
              <a data-xh-part="link" href="#order-list" current>订单列表</a>
            </li>
          </ol>
        </nav>
      </xh-breadcrumb>

      <xh-page-header>
        <div data-xh-part="root">
          <div data-xh-part="title">订单列表</div>
          <div data-xh-part="extra">
            <xh-button variant="ghost" size="sm">
              <button data-xh-part="root">导出</button>
            </xh-button>
            <xh-button variant="solid" size="sm">
              <button data-xh-part="root">新建订单</button>
            </xh-button>
          </div>
        </div>
      </xh-page-header>

      <xh-toolbar id="admin-shell-toolbar">
        <div data-xh-part="root">
          <button type="button" data-xh-part="item" value="today" data-shell="tool">今日</button>
          <button type="button" data-xh-part="item" value="week" data-shell="tool">本周</button>
          <div data-xh-part="separator"></div>
          <button type="button" data-xh-part="item" value="refresh" data-shell="tool">刷新</button>
        </div>
      </xh-toolbar>

      <div data-shell="cards">
        <xh-card variant="outline">
          <div data-xh-part="root">
            <div data-xh-part="header">
              <div data-xh-part="title">待发货</div>
            </div>
            <div data-xh-part="body">
              <xh-statistic>
                <div data-xh-part="root">
                  <span data-xh-part="label">较昨日 +12</span>
                  <span data-xh-part="value">128</span>
                </div>
              </xh-statistic>
            </div>
          </div>
        </xh-card>

        <xh-card variant="outline">
          <div data-xh-part="root">
            <div data-xh-part="header">
              <div data-xh-part="title">待退款</div>
            </div>
            <div data-xh-part="body">
              <xh-statistic>
                <div data-xh-part="root">
                  <span data-xh-part="label">需人工复核</span>
                  <span data-xh-part="value">6</span>
                </div>
              </xh-statistic>
            </div>
          </div>
        </xh-card>
      </div>

      <p data-shell="note">
        当前导航：<span id="admin-shell-nav-value">order-list</span> · 最近操作：<span
          id="admin-shell-command"
        >（无）</span>
      </p>
    </div>

    <div data-xh-part="footer" data-shell="footer">
      <span>曦寒视图组件</span>
      <xh-tag size="sm">
        <span data-xh-part="root">
          <span data-xh-part="label">预览环境</span>
        </span>
      </xh-tag>
    </div>
  </div>
</xh-layout>

<script type="module">
  const nav = document.getElementById("admin-shell-nav");
  const navValue = document.getElementById("admin-shell-nav-value");
  const command = document.getElementById("admin-shell-command");

  // 入口树是 href 与层级的事实源，数组只能走 property
  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#dashboard" },
    {
      value: "order",
      label: "订单",
      children: [
        { value: "order-list", label: "订单列表", href: "#order-list" },
        { value: "order-refund", label: "退款处理", href: "#order-refund" },
      ],
    },
    {
      value: "user",
      label: "用户",
      children: [
        { value: "user-list", label: "用户列表", href: "#user-list" },
        { value: "user-role", label: "角色权限", href: "#user-role" },
      ],
    },
  ];

  // 展开集合归宿主，元素只发意图
  nav.expandedValue = ["order"];
  nav.addEventListener("expanded-value-change", (event) => {
    nav.expandedValue = event.detail.value;
  });
  nav.addEventListener("value-change", (event) => {
    navValue.textContent = event.detail.value ?? "（无）";
  });

  // 点击归条目自己，工具条只接管方向键与焦点
  const toolbar = document.getElementById("admin-shell-toolbar");
  for (const item of toolbar.querySelectorAll('[data-xh-part="item"]')) {
    item.addEventListener("click", () => {
      command.textContent = item.textContent.trim();
    });
  }

  const account = document.getElementById("admin-shell-account");
  account.addEventListener("select", (event) => {
    command.textContent = `账户 · ${event.detail.value}`;
  });
</script>
```

## 这一屏定了什么

- **骨架归[布局](../components/layout)，不归 CSS。** 四段哪一段缺席就少一行或少一列，侧栏折叠改的是宽度不是可见性，折起来时侧栏里的滚动位置与输入值都还在。
- **头部只有一条基线。** 右半区整体推到行尾，中间那段留白由 `margin-inline-start: auto` 撑开；分隔线是[分隔线](../components/separator)组件，不是一段 `border`。
- **导航状态落在叶子上。** [侧栏导航](../components/side-nav)选中的是叶子节点，祖先枝跟着点亮；展开集合与选中值是两份状态，折叠不会把选中丢掉。
- **一屏里只出现一种间距节奏。** 头部、正文、卡片之间的空隙全部取自同一组间距令牌（`--xh-space-*`），圆角与描边同理；写死的像素只剩这一屏自己的高度与卡片的换行下限。
- **颜色一处都不写死。** 卡片描边、脚注文字、工具条底色都走[设计令牌](../guide/theme)，切深色模式时整屏一起翻面。

## 换成你的项目

- 侧栏与面包屑各自持有自己的数据，路由由你接：`href` 是你写的，组件不接管跳转。
- 账户菜单的触发器是插槽内容，换成头像、名字加箭头，或者别的什么都行——[菜单](../components/menu)只接管展开与键盘。
- 正文区那两张[卡片](../components/card)是占位，换成[表格](../components/table)、图表或[空态](../components/empty-state)都不影响外壳。
