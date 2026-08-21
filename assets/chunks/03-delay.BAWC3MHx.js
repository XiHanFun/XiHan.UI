const n=`<!-- 展开延时 | delay-duration 是悬停多久才展开，防的是指针横穿导航时一路闪出面板；skip-delay-duration 是收起后的静默窗口，窗口内再碰任意入口直接展开 -->
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
<\/script>

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
`;export{n as default};
