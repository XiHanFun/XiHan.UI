const n=`<!-- 收窄成一列图标 | 竖排时面板本就从入口侧边长出来；收窄只是把文字从入口里撤掉、把它挪进面板，指针停上去才露出来 -->
<script setup lang="ts">
import { ref } from "vue";
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
<\/script>

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
`;export{n as default};
