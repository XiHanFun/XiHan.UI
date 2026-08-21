const t=`<!-- 媒体位与操作位 | 一条条目最全的形态：媒体、标题、说明、操作四个位都摆上 -->
<script setup lang="ts">
import {
  XhListItem,
  XhListItemAction,
  XhListItemContent,
  XhListItemDescription,
  XhListItemMedia,
  XhListItemTitle,
  XhListRoot,
} from "@xihan-ui/vue";

const members = [
  { initial: "张", name: "张三", desc: "zhangsan@example.com" },
  { initial: "李", name: "李四", desc: "lisi@example.com" },
];
<\/script>

<template>
  <XhListRoot bordered hoverable split style="max-inline-size: 420px">
    <XhListItem v-for="m in members" :key="m.name">
      <!-- 媒体位画什么由使用者决定，这里放一个首字头像 -->
      <XhListItemMedia
        style="
          inline-size: 32px;
          block-size: 32px;
          border-radius: 999px;
          background: var(--xh-bg-subtle);
        "
      >
        {{ m.initial }}
      </XhListItemMedia>
      <XhListItemContent>
        <XhListItemTitle>{{ m.name }}</XhListItemTitle>
        <XhListItemDescription>{{ m.desc }}</XhListItemDescription>
      </XhListItemContent>
      <XhListItemAction>
        <button type="button">移除</button>
      </XhListItemAction>
    </XhListItem>
  </XhListRoot>
</template>
`;export{t as default};
