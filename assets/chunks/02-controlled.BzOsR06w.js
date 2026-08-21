const n=`<!-- 受控 | 传了 value 就由宿主说了算，null 表示都收起 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/vue";

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
<\/script>

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
`;export{n as default};
