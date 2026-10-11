var e=`<!-- 媒体位与操作位 | 条目最完整的形态：媒体、标题、说明、操作四个位都放置 -->
<script setup lang="ts">
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhButton,
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
  <XhListRoot variant="outline" hoverable split style="max-inline-size: 420px">
    <XhListItem v-for="m in members" :key="m.name">
      <!-- 媒体位画什么由使用者决定，这里放一个首字头像 -->
      <XhListItemMedia>
        <XhAvatarRoot>
          <XhAvatarFallback>{{ m.initial }}</XhAvatarFallback>
        </XhAvatarRoot>
      </XhListItemMedia>
      <XhListItemContent>
        <XhListItemTitle>{{ m.name }}</XhListItemTitle>
        <XhListItemDescription>{{ m.desc }}</XhListItemDescription>
      </XhListItemContent>
      <XhListItemAction>
        <XhButton variant="outline" size="sm">移除</XhButton>
      </XhListItemAction>
    </XhListItem>
  </XhListRoot>
</template>
`;export{e as default};