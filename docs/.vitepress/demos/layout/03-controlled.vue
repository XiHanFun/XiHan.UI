<!-- 受控 | 传了 sider-collapsed 就由宿主说了算，组件不再自改，只发 sider-collapsed-change -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
  XhLayoutSiderTrigger,
} from "@xihan-ui/vue";

const collapsed = ref(false);
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhButton size="sm" @click="collapsed = !collapsed">
      从外面{{ collapsed ? "展开" : "收起" }}
    </XhButton>

    <XhLayoutRoot
      v-model:sider-collapsed="collapsed"
      bordered
      style="block-size: 220px; border-radius: 8px; overflow: hidden"
    >
      <XhLayoutHeader>
        <XhLayoutSiderTrigger>切换</XhLayoutSiderTrigger>
        <span>当前：{{ collapsed ? "已折叠" : "已展开" }}</span>
      </XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent>
        把手与上面那个按钮改的是同一份状态。
      </XhLayoutContent>
    </XhLayoutRoot>
  </div>
</template>
