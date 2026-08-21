const t=`<!-- 外框与悬停 | bordered 给整份列表画一圈描边，hoverable 让条目在指针悬停时换底色 -->
<script setup lang="ts">
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/vue";

const files = ["设计稿.fig", "接口文档.md", "会议纪要.docx"];
<\/script>

<template>
  <XhListRoot bordered hoverable split style="max-inline-size: 360px">
    <XhListItem v-for="file in files" :key="file">
      <XhListItemContent>
        <XhListItemTitle>{{ file }}</XhListItemTitle>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
`;export{t as default};
