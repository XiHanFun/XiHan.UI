const n=`<!-- 受控 | 传了 open 就由宿主说了算，组件自己不再改状态，只发 open-change 报告意图 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
<\/script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhButton size="sm" @click="open = !open">
      从外面{{ open ? "收起" : "展开" }}
    </XhButton>

    <XhCollapsibleRoot v-model:open="open">
      <XhCollapsibleTrigger>面板标题</XhCollapsibleTrigger>
      <XhCollapsibleContent>
        当前状态：{{ open ? "展开" : "收起" }}。触发器与上面的按钮改的是同一份状态。
      </XhCollapsibleContent>
    </XhCollapsibleRoot>
  </div>
</template>
`;export{n as default};
