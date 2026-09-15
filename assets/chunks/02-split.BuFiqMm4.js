const t=`<!-- 分隔线 | split 在条目之间画一条线，第一条上面不画 -->
<script setup lang="ts">
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/vue";

const logs = ["提交了一次构建", "合并了一个分支", "关闭了一个议题"];
<\/script>

<template>
  <XhListRoot split style="max-inline-size: 360px">
    <XhListItem v-for="log in logs" :key="log">
      <XhListItemContent>
        <XhListItemTitle>{{ log }}</XhListItemTitle>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
`;export{t as default};
