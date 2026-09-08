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
