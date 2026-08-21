const n=`<!-- 受控 | 传了 open 就由宿主说了算，组件只发 open-change 不自己改展开态 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
<\/script>

<template>
  <!-- 外部按钮直接改 open，菜单照样展开 -->
  <button type="button" @click="open = !open">
    {{ open ? "从外面收起" : "从外面展开" }}
  </button>

  <XhMenuRoot v-model:open="open">
    <XhMenuTrigger>操作</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="rename">重命名</XhMenuItem>
        <XhMenuItem value="duplicate">创建副本</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>

  <span>当前：{{ open ? "展开" : "收起" }}</span>
</template>
`;export{n as default};
