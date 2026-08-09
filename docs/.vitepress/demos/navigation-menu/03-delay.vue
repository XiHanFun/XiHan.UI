<!-- 展开延时 | delay-duration 是悬停多久才展开，防的是指针横穿导航时一路闪出面板；skip-delay-duration 是收起后的静默窗口，窗口内再碰任意入口直接展开 -->
<script setup lang="ts">
import {
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "cloud",
    label: "云服务",
    links: [
      { href: "#/cloud/host", label: "云主机" },
      { href: "#/cloud/storage", label: "对象存储" },
    ],
  },
  {
    value: "data",
    label: "数据",
    links: [
      { href: "#/data/warehouse", label: "数据仓库" },
      { href: "#/data/pipeline", label: "数据管道" },
    ],
  },
  {
    value: "ai",
    label: "智能",
    links: [{ href: "#/ai/agent", label: "智能体" }],
  },
];
</script>

<template>
  <div style="inline-size: 100%; padding-block-end: 150px">
    <XhNavigationMenuRoot :delay-duration="600" :skip-delay-duration="800">
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
  </div>
</template>
